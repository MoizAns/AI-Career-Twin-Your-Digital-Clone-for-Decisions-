from sqlalchemy import create_engine, Column, Integer, String, Text, Float, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE_URL = f"sqlite:///{os.path.join(BASE_DIR, 'career_twin.db')}"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class ResumeRecord(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255))
    raw_text = Column(Text)
    extracted_skills = Column(Text)  # JSON string
    career_title = Column(String(255), nullable=True)
    uploaded_at = Column(DateTime, default=datetime.utcnow)


class CareerSimulation(Base):
    __tablename__ = "simulations"

    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(Integer)
    target_role = Column(String(255))
    match_score = Column(Float)
    salary_estimate = Column(Float)
    probability = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)


def init_db():
    Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
