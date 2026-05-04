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
def get_channels(db: Session = Depends(database.get_db)):
    return db.query(orm_models.Channel).all()

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

    new_msg = orm_models.Message(
        id=str(uuid.uuid4()),
        channel_id=id,
        sender_id=current_user.id,
        content=content
    )
    db.add(new_msg)
    db.commit()
    db.refresh(new_msg)
    return new_msg


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
    db.commit()
    db.refresh(new_msg)
    return new_msg

@router.get("/community/members", response_model=List[models.UserResponse])
def get_community_members(db: Session = Depends(database.get_db)):
    return db.query(orm_models.User).filter(orm_models.User.is_active == True).all()


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
