import jwt, os, shutil, fitz, json, google.generativeai as genai
from datetime import datetime, timedelta, timezone
from slugify import slugify
from dotenv import load_dotenv
from jwt.exceptions import InvalidTokenError
from sqlalchemy.orm import Session
from typing import Annotated
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File
from . import crud, models, schemas
from .database import get_db
from .utils.security import authenticate_user

######################################################


## Load environment variables
load_dotenv()

## Create the app
app = FastAPI()

## Get/set variables
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = 30
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
UPLOAD_DIRECTORY = './uploads/'

## Token bearer
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

## Set cors middleware settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("BACKEND_DOMAIN"), os.getenv("FRONTEND_DOMAIN")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



## Some usefull functions
def extract_text_from_pdf(pdf_path):
    # Open the PDF file
    pdf_document = fitz.open(pdf_path)
    text = ""
    
    # Loop through each page
    for page_num in range(pdf_document.page_count):
        page = pdf_document.load_page(page_num)
        text += page.get_text()

    return text

def get_unique_file_path(db: Session, file_name: str):
    counter=1
    slugified_file_name = slugify(file_name.replace('.pdf', ''))
    unique_file_name = slugified_file_name+'.pdf'
    while db.query(models.ChatRoom).filter(models.ChatRoom.file_path == UPLOAD_DIRECTORY+unique_file_name).count() > 0:
        unique_file_name = f"{slugified_file_name}-{str(counter)}.pdf"
        counter += 1
    return unique_file_name

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(token: Annotated[str, Depends(oauth2_scheme)], db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = schemas.TokenData(email=email)
    except InvalidTokenError:
        raise credentials_exception
    user = crud.get_user_by_email(db, email=token_data.email)
    if user is None:
        raise credentials_exception
    return user



## Endpoints

# Static files
app.mount("/uploads", StaticFiles(directory="uploads"), name="static")


# User
@app.post("/token/")
async def login_for_access_token(form_data: Annotated[OAuth2PasswordRequestForm, Depends()], db: Session = Depends(get_db)) -> schemas.Token:
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return schemas.Token(access_token=access_token, token_type="bearer")

@app.get("/users/me", response_model=schemas.User)
def get_user_me(current_user: Annotated[schemas.User, Depends(get_current_user)]):
    return current_user

@app.post("/register/")
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered.")
    crud.create_user(db=db, user=user)
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return schemas.Token(access_token=access_token, token_type="bearer")


# Chat room
@app.post("/add-room/")
def add_room(token: str = Depends(oauth2_scheme), file: UploadFile = File(...), db: Session = Depends(get_db)):
    current_user = get_current_user(token, db)
    file_name = file.filename
    slugified_file_name = get_unique_file_path(db, file_name=file_name)
    file_path = os.path.join(UPLOAD_DIRECTORY, slugified_file_name)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    file_text = extract_text_from_pdf(file_path)
    room = crud.create_chat_room(db=db, current_user_id=current_user.id, file_name=file_name, file_path=file_path, file_text=file_text)
    return room

@app.delete("/delete-room/{room_id}")
def delete_room(room_id: int, db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    current_user = get_current_user(token, db)
    
    # Find the file in the database
    chat_room = db.query(models.ChatRoom).filter(models.ChatRoom.id == room_id, models.ChatRoom.user_id == current_user.id).first()
    
    if not chat_room:
        raise HTTPException(status_code=404, detail="File not found or you do not have permission to delete this file.")
    
    # Optionally, delete the physical file from the filesystem
    os.remove(chat_room.file_path)

    # Delete the file record from the database
    db.delete(chat_room)
    db.commit()
    
    return {"detail": "File deleted successfully."}

@app.get("/get-chat-rooms/")
def get_chat_rooms(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    current_user = get_current_user(token, db)
    return crud.get_chat_rooms(db, current_user_id=current_user.id)


# Conversation
@app.get("/get-conversation/{room_id}")
def get_conversation(room_id: int, db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    current_user = get_current_user(token, db)
    chat_room = crud.get_chat_room(db, id=room_id, user_id=current_user.id)
    if chat_room.conversation is None:
        raise HTTPException(status_code=400, detail="There is no conversation yet.")
    return {'conversations': json.loads(chat_room.conversation), 'file_path': chat_room.file_path}

@app.post('/make-conversation/')
def make_conversation(sc_chat_room: schemas.ChatRoomMakeConversation, db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    current_user = get_current_user(token, db)
    chat_room = crud.get_chat_room(db, id=sc_chat_room.id, user_id=current_user.id)

    if chat_room is None:
        raise HTTPException(status_code=400, detail="There is no chat room with the given information.")

    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel("gemini-1.5-flash")
    
    if chat_room.conversation:
        convo_list = json.loads(chat_room.conversation)

        convo_list.append({
            'by': 'User', 'content': sc_chat_room.question,
            'creation_date': datetime.now().strftime("%H:%M:%S %d.%m.%Y")
        })

        total_convo = "\n".join([f"{item['by']}: {item['content']}" for item in convo_list])

        response = model.generate_content(total_convo)
        
        convo_list.append({
            'by': 'Gemini', 'content': response.text,
            'creation_date': datetime.now().strftime("%H:%M:%S %d.%m.%Y")
        })

        crud.update_chat_room_conversation(db, id=chat_room.id, conversation=json.dumps(convo_list))
    else:
        convo_list = [{
            'by': 'User', 'content': sc_chat_room.question,
            'creation_date': datetime.now().strftime("%H:%M:%S %d.%m.%Y")
        }]

        response = model.generate_content("Can you give me a summary of this pdf file? \n"+chat_room.file_text)
        
        convo_list.append({
            'by': 'Gemini', 'content': response.text,
            'creation_date': datetime.now().strftime("%H:%M:%S %d.%m.%Y")
        })

        crud.update_chat_room_conversation(db, id=chat_room.id, conversation=json.dumps(convo_list))
    
    return {'message': 'Conversion is successful.'}
