from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import database, orm_models, models
from ..utils import auth
import uuid

router = APIRouter()


def serialize_datetime(value):
    return value.isoformat() if value else None


def serialize_message_overview(message: orm_models.Message) -> dict:
    sender = message.sender
    receiver = message.receiver
    return {
        "id": message.id,
        "content": message.content,
        "is_voice_record": message.is_voice_record,
        "channel_id": message.channel_id,
        "receiver_id": message.receiver_id,
        "sender_id": message.sender_id,
        "created_at": serialize_datetime(message.created_at),
        "sender": {
            "id": sender.id,
            "username": sender.username,
            "full_name": sender.full_name,
            "role": sender.role,
            "department_team": sender.department_team,
        } if sender else None,
        "receiver": {
            "id": receiver.id,
            "username": receiver.username,
            "full_name": receiver.full_name,
        } if receiver else None,
    }


@router.get("/chat/channels", response_model=List[models.ChannelResponse])
def get_channels(current_user: orm_models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    # 1. Admin/Official channels (always visible)
    # Identify by is_broadcast=True AND opportunity_id=None (Global Broadcasts)
    global_broadcasts = db.query(orm_models.Channel).filter(
        orm_models.Channel.opportunity_id == None,
        orm_models.Channel.is_broadcast == True
    ).all()
    
    if current_user.role == "admin":
        return db.query(orm_models.Channel).all()
        
    # 2. Check for interactions
    has_posted = db.query(orm_models.Opportunity).filter(orm_models.Opportunity.author_id == current_user.id).first() is not None
    user_opps = db.query(orm_models.UserOpportunity).filter(orm_models.UserOpportunity.user_id == current_user.id).all()
    has_interactions = len(user_opps) > 0
    
    if not has_posted and not has_interactions:
        # ONLY show global broadcasts (Official Announcements)
        return global_broadcasts
    
    # 3. If they have interactions, show:
    # - Global Broadcasts
    # - Channels they authored
    # - Channels they are interested in / applied for
    authored = db.query(orm_models.Channel).filter(orm_models.Channel.author_id == current_user.id).all()
    
    opp_ids = [uo.opportunity_id for uo in user_opps if uo.opportunity_id]
    opp_channels = db.query(orm_models.Channel).filter(orm_models.Channel.opportunity_id.in_(opp_ids)).all() if opp_ids else []
    
    # We NO LONGER add public_non_opp (General Chat, etc.) 
    # to strictly follow the "Only Admin channel is visible" rule.
    
    channel_map = {c.id: c for c in (global_broadcasts + authored + opp_channels)}
    return list(channel_map.values())

@router.get("/chat/channels/{id}/messages", response_model=List[models.MessageResponse])
def get_channel_messages(id: str, db: Session = Depends(database.get_db)):
    return (
        db.query(orm_models.Message)
        .filter(orm_models.Message.channel_id == id)
        .order_by(orm_models.Message.created_at.asc())
        .all()
    )


@router.get("/chat/channels/{id}/messages/overview")
def get_channel_messages_overview(id: str, db: Session = Depends(database.get_db)):
    channel = db.query(orm_models.Channel).filter(orm_models.Channel.id == id).first()
    if not channel:
        raise HTTPException(status_code=404, detail="Channel not found")

    messages = (
        db.query(orm_models.Message)
        .filter(orm_models.Message.channel_id == id)
        .order_by(orm_models.Message.created_at.asc())
        .all()
    )
    return [serialize_message_overview(message) for message in messages]

@router.post("/chat/channels/{id}/messages", response_model=models.MessageResponse)
def post_message(id: str, content: str, current_user: orm_models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    channel = db.query(orm_models.Channel).filter(orm_models.Channel.id == id).first()
    if not channel:
        raise HTTPException(status_code=404, detail="Channel not found")

    # Enforce broadcast rules: only author (or admin) can post in broadcast channels
    if channel.is_broadcast:
        if channel.author_id != current_user.id and current_user.role != "admin":
            raise HTTPException(
                status_code=403, 
                detail="This is a broadcast channel. Only the author can send messages."
            )
    
    # Restriction for Opportunity Channels: 'interested' users cannot talk
    if channel.opportunity_id:
        user_opp = db.query(orm_models.UserOpportunity).filter(
            orm_models.UserOpportunity.user_id == current_user.id,
            orm_models.UserOpportunity.opportunity_id == channel.opportunity_id
        ).first()
        
        if user_opp and user_opp.status == "interested" and current_user.role != "admin":
            raise HTTPException(
                status_code=403,
                detail="You must apply to this opportunity before you can participate in the discussion."
            )

    new_msg = orm_models.Message(
        id=str(uuid.uuid4()),
        channel_id=id,
        sender_id=current_user.id,
        content=content
    )
    db.add(new_msg)
    
    # Reward 1 point for active community participation
    current_user.total_points += 1
    
    db.commit()
    db.refresh(new_msg)
    return new_msg


@router.patch("/chat/channels/{channel_id}/broadcast")
def toggle_channel_broadcast(channel_id: str, is_broadcast: bool, current_user: orm_models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    channel = db.query(orm_models.Channel).filter(orm_models.Channel.id == channel_id).first()
    if not channel:
        raise HTTPException(status_code=404, detail="Channel not found")
    
    if channel.author_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    channel.is_broadcast = is_broadcast
    db.commit()
    return {"is_broadcast": channel.is_broadcast}


@router.delete("/chat/channels/{channel_id}")
def delete_channel(channel_id: str, current_user: orm_models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    channel = db.query(orm_models.Channel).filter(orm_models.Channel.id == channel_id).first()
    if not channel:
        raise HTTPException(status_code=404, detail="Channel not found")
    
    # Official Announcements (null opportunity_id) can only be deleted by admin
    if channel.opportunity_id == None and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can delete global channels")
        
    if channel.author_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    db.delete(channel)
    db.commit()
    return {"status": "ok"}


@router.get("/chat/direct-messages/{user_id}", response_model=List[models.MessageResponse])
def get_direct_messages(user_id: str, current_user: orm_models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    return db.query(orm_models.Message).filter(
        (
            (orm_models.Message.sender_id == current_user.id) &
            (orm_models.Message.receiver_id == user_id)
        ) |
        (
            (orm_models.Message.sender_id == user_id) &
            (orm_models.Message.receiver_id == current_user.id)
        )
    ).order_by(orm_models.Message.created_at.asc()).all()


@router.get("/chat/direct-messages/{user_id}/overview")
def get_direct_messages_overview(user_id: str, current_user: orm_models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    other_user = db.query(orm_models.User).filter(orm_models.User.id == user_id).first()
    if not other_user:
        raise HTTPException(status_code=404, detail="User not found")

    messages = db.query(orm_models.Message).filter(
        (
            (orm_models.Message.sender_id == current_user.id) &
            (orm_models.Message.receiver_id == user_id)
        ) |
        (
            (orm_models.Message.sender_id == user_id) &
            (orm_models.Message.receiver_id == current_user.id)
        )
    ).order_by(orm_models.Message.created_at.asc()).all()
    return [serialize_message_overview(message) for message in messages]


@router.post("/chat/direct-messages", response_model=models.MessageResponse)
def send_direct_message(
    message: models.MessageCreate,
    current_user: orm_models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db),
):
    if not message.receiver_id:
        raise HTTPException(status_code=400, detail="receiver_id is required")

    receiver = db.query(orm_models.User).filter(orm_models.User.id == message.receiver_id).first()
    if not receiver:
        raise HTTPException(status_code=404, detail="Receiver not found")

    new_msg = orm_models.Message(
        id=str(uuid.uuid4()),
        sender_id=current_user.id,
        receiver_id=message.receiver_id,
        content=message.content,
        is_voice_record=message.is_voice_record,
    )
    db.add(new_msg)
    
    # Reward 1 point for active community participation
    current_user.total_points += 1
    
    db.commit()
    db.refresh(new_msg)
    return new_msg

@router.get("/community/members", response_model=List[models.UserResponse])
def get_community_members(db: Session = Depends(database.get_db)):
    return db.query(orm_models.User).filter(orm_models.User.is_active == True).all()


@router.get("/chat/dm-sidebar")
def get_dm_sidebar(current_user: orm_models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    # 1. Get all users
    users = db.query(orm_models.User).filter(orm_models.User.id != current_user.id, orm_models.User.is_active == True).all()
    
    result = []
    for user in users:
        # 2. Get unread count for this user
        unread_count = db.query(orm_models.Message).filter(
            orm_models.Message.sender_id == user.id,
            orm_models.Message.receiver_id == current_user.id,
            orm_models.Message.is_read == False
        ).count()
        
        # 3. Get latest message time
        latest_msg = db.query(orm_models.Message).filter(
            ((orm_models.Message.sender_id == current_user.id) & (orm_models.Message.receiver_id == user.id)) |
            ((orm_models.Message.sender_id == user.id) & (orm_models.Message.receiver_id == current_user.id))
        ).order_by(orm_models.Message.created_at.desc()).first()
        
        latest_time = latest_msg.created_at.isoformat() if latest_msg else "1970-01-01T00:00:00"
        
        result.append({
            "id": user.id,
            "username": user.username,
            "full_name": user.full_name,
            "profile_photo_url": user.profile_photo_url,
            "unread_count": unread_count,
            "latest_message_time": latest_time
        })
        
    # ONLY return users with actual message history (latest_time > 1970)
    result = [r for r in result if r["latest_message_time"] != "1970-01-01T00:00:00"]
        
    # Sort by latest_message_time descending
    result.sort(key=lambda x: x["latest_message_time"], reverse=True)
    return result


@router.post("/chat/direct-messages/{user_id}/read")
def mark_dm_as_read(user_id: str, current_user: orm_models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    db.query(orm_models.Message).filter(
        orm_models.Message.sender_id == user_id,
        orm_models.Message.receiver_id == current_user.id,
        orm_models.Message.is_read == False
    ).update({"is_read": True})
    db.commit()
    return {"status": "ok"}


@router.get("/users/search", response_model=List[models.UserResponse])
def search_users(q: str = "", db: Session = Depends(database.get_db)):
    query = db.query(orm_models.User)
    if q.strip():
        wildcard = f"%{q.strip()}%"
        query = query.filter(
            orm_models.User.full_name.ilike(wildcard) |
            orm_models.User.username.ilike(wildcard) |
            orm_models.User.organisation.ilike(wildcard) |
            orm_models.User.department_team.ilike(wildcard)
        )
    return query.all()
