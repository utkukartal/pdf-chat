from pydantic import BaseModel

######################################################


class UserBase(BaseModel):
    email: str
    first_name: str
    last_name: str

class UserCreate(UserBase):
    password: str
    re_password: str

class User(UserBase):
    id: int
    is_active: bool


class ChatRoomMakeConversation(BaseModel):
    id: str
    question: str


class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: str | None = None
