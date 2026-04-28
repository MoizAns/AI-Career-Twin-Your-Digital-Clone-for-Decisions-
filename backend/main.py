import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routes import resume, career, chatbot
from database.db import init_db

app = FastAPI(title="AI Career Twin API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    init_db()

# Register routes
app.include_router(resume.router, prefix="/api/resume", tags=["Resume"])
app.include_router(career.router, prefix="/api/career", tags=["Career"])
app.include_router(chatbot.router, prefix="/api/chatbot", tags=["Chatbot"])

@app.get("/")
async def root():
    return {"message": "AI Career Twin API is running!"}

@app.get("/health")
async def health():
    return {"status": "healthy"}