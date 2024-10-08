import datetime as dt
from sqlalchemy.orm import relationship
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from .database import Base

######################################################


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True, index=True)
    first_name = Column(String)
    last_name = Column(String)
    hashed_password = Column(String)

    # Relationship to FileModel (one-to-many)
    chat_rooms = relationship("ChatRoom", back_populates="users")

class ChatRoom(Base):
    __tablename__ = "chat_rooms"

    id = Column(Integer, primary_key=True)
    file_name = Column(String)
    file_path = Column(String, unique=True, index=True)
    file_size = Column(Integer)
    file_text = Column(Text)
    conversation = Column(Text)
    creation_date = Column(DateTime, default=dt.datetime.now())
    
    # Foreign key to UserModel
    user_id = Column(Integer, ForeignKey('users.id'))

    # Relationship back to UserModel
    users = relationship("User", back_populates="chat_rooms")
