# PDF Chat App

A simple PDF Chat App developed with FastAPI and React while integrating Gemini AI as its LLM. The app has a simple user system, a user can upload a pdf file to create a 'Chat Room' where they can communicate with the file. This way the user can experience the information in a more fluent and efficient manner.


## Features
- Register and login as a user. View the Chat Rooms you previously created.
- Upload PDF documents and create Chat Rooms using the scanned text of the said files.
- Converse with the PDF document via Gemini AI, conversations will be recorded so they can be continued in a later time.
- Delete the Chat Room
- View the uploaded PDF documents


## Prerequisites
- Python 3.10
- Node.js  v18.20
- `pip` and `npm` for package management


## Installation
1. Clone the repo.
   ```
   git clone https://github.com/utkukartal/pdf-chat.git
   cd pdf-chat/
   ```
2. Create a virtual environment, activate it and install requirements.
   ```
   python3 -m venv env
   source env/bin/activate
   cd back_end/
   pip install -r requirements.txt
   ```
3. Create a .env file for environmental variables used at back_end and populate it according to .env.example
   ```
   ...
   GEMINI_API_KEY=your_api_key
   BACKEND_DOMAIN=backend_domain
   ...
   ```
4. Start the FastAPI server.
   ```
   fastapi dev main.py
   ```
5. In a new terminal, relocate to the front_end directory and install the packages.
   ```
   cd front_end
   npm install
   ```
7. Update the BACKEND_DOMAIN variable depending on the FastAPI port and start the React.
   ```
   npm run dev
   ```


## Some Visuals
Below we can see the list of a users Chat Rooms. Its possible to view the PDF files, enter the Rooms or delete them.
![chat_rooms](https://github.com/user-attachments/assets/fd087f45-1495-4570-9a0f-3e8d11c6a5ba)
In another example we can see the conversation about Dinosaur centered PDF file.
![room](https://github.com/user-attachments/assets/3036030f-45b9-449a-aab8-32c2ffbc5b5c)


## Technologies Used
- **Backend**: FastAPI, Pydantic, Uvicorn
- **Frontend**: React, Axios
- **LLM**: Gemini AI
- **Database**: PostgreSQL
- **Other**: SQLAlchemy, Alembic

