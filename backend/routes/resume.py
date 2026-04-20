"""
routes/resume.py
Handles resume upload, parsing, and storage.
"""
import os
import json
import shutil
import tempfile
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session
from database.db import get_db, ResumeRecord
from ml.resume_parser import parse_resume

router = APIRouter()

ALLOWED_TYPES = {"application/pdf", "application/octet-stream"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB


@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Upload a PDF resume.
    Returns: extracted skills, name, email, and a resume_id for further use.
    """
    # Validate file type
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")

    # Read file bytes
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large. Max 5 MB.")

    # Save to temp file for pdfplumber
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        tmp.write(content)
        tmp_path = tmp.name

    try:
        # Parse resume
        parsed = parse_resume(tmp_path)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    finally:
        os.unlink(tmp_path)

    # Store in DB
    record = ResumeRecord(
        filename=file.filename,
        raw_text=parsed["raw_text"][:5000],  # store first 5000 chars
        extracted_skills=json.dumps(parsed["skills"]),
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    return {
        "resume_id": record.id,
        "filename": file.filename,
        "name": parsed["name"],
        "email": parsed["email"],
        "skills": parsed["skills"],
        "skill_count": parsed["skill_count"],
    }


@router.get("/{resume_id}")
def get_resume(resume_id: int, db: Session = Depends(get_db)):
    """Fetch a previously uploaded resume by ID."""
    record = db.query(ResumeRecord).filter(ResumeRecord.id == resume_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Resume not found.")
    return {
        "resume_id": record.id,
        "filename": record.filename,
        "skills": json.loads(record.extracted_skills),
        "uploaded_at": record.uploaded_at,
    }
