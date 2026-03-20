import uuid
from datetime import datetime
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

@router.get("/community/members", response_model=List[models.UserResponse])
def get_community_members(db: Session = Depends(database.get_db)):
    return db.query(orm_models.User).all()
