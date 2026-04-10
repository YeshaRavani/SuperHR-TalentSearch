from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import database, orm_models, models
from ..utils import auth
import uuid

router = APIRouter()

@router.get("/chat/channels", response_model=List[models.ChannelResponse])
def get_channels(db: Session = Depends(database.get_db)):
    return db.query(orm_models.Channel).all()

@router.get("/chat/channels/{id}/messages", response_model=List[models.MessageResponse])
def get_channel_messages(id: str, db: Session = Depends(database.get_db)):
    return db.query(orm_models.Message).filter(orm_models.Message.channel_id == id).all()

@router.post("/chat/channels/{id}/messages", response_model=models.MessageResponse)
def post_message(id: str, content: str, current_user: orm_models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
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
    ).all()


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
    return db.query(orm_models.User).all()


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
