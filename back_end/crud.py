import os, datetime as dt
from sqlalchemy.orm import Session
from sqlalchemy import desc
from . import models, schemas
from .utils import security

######################################################


def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate):
    db_user = models.User(email=user.email, first_name=user.first_name, last_name=user.last_name, hashed_password=security.get_password_hash(user.password))
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def create_chat_room(db: Session, current_user_id: int,file_name: str = None, file_path: str = None, file_text: str = None):
    db_chat_room = models.ChatRoom(user_id=current_user_id, file_name=file_name, file_path=file_path, file_text=file_text, file_size=os.path.getsize(file_path), creation_date=dt.datetime.now())
    db.add(db_chat_room)
    db.commit()
    db.refresh(db_chat_room)
    return db_chat_room

def update_chat_room_conversation(db: Session, id: int = None, conversation: str = None):
    db_chat_room = db.query(models.ChatRoom).filter(models.ChatRoom.id == id).first()
    db_chat_room.conversation = conversation
    db.commit()
    db.refresh(db_chat_room)
    return db_chat_room

def get_chat_room(db: Session, id: int = None, user_id: int = None):
    return db.query(models.ChatRoom).filter(models.ChatRoom.id == id, models.ChatRoom.user_id == user_id).first()

def get_chat_rooms(db: Session, current_user_id: int = None):
    return db.query(models.ChatRoom).filter(models.ChatRoom.user_id == current_user_id).order_by(desc('id')).all()
