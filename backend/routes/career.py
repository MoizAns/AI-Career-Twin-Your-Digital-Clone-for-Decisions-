"""
routes/career.py
Career recommendations, skill gap analysis, and outcome simulation.
"""
import json
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy.orm import Session
from database.db import get_db, ResumeRecord, CareerSimulation
from ml.recommendation import recommend_careers
from ml.skill_gap import analyze_skill_gap
from ml.simulation import simulate_outcome

router = APIRouter()


# ── Request / Response Schemas ──────────────────────────────────────────────

class RecommendRequest(BaseModel):
    resume_id: int

class GapAnalysisRequest(BaseModel):
    resume_id: int
    target_career: str

class SimulateRequest(BaseModel):
    resume_id: int
    target_career: str


# ── Helper ──────────────────────────────────────────────────────────────────

def _get_skills(resume_id: int, db: Session) -> List[str]:
    record = db.query(ResumeRecord).filter(ResumeRecord.id == resume_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Resume not found.")
    return json.loads(record.extracted_skills)


# ── Routes ───────────────────────────────────────────────────────────────────

@router.post("/recommend")
def get_recommendations(req: RecommendRequest, db: Session = Depends(get_db)):
    """Return top 5 career recommendations based on resume skills."""
    skills = _get_skills(req.resume_id, db)
    if not skills:
        raise HTTPException(status_code=422, detail="No skills found in resume.")
    recommendations = recommend_careers(skills)
    return {
        "resume_id": req.resume_id,
        "skill_count": len(skills),
        "recommendations": recommendations,
    }


@router.post("/gap-analysis")
def get_gap_analysis(req: GapAnalysisRequest, db: Session = Depends(get_db)):
    """Analyze skill gap between user and a target career."""
    skills = _get_skills(req.resume_id, db)
    result = analyze_skill_gap(skills, req.target_career)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result


@router.post("/simulate")
def simulate(req: SimulateRequest, db: Session = Depends(get_db)):
    """
    Simulate future outcomes for a given career.
    Stores the simulation result in DB.
    """
    skills = _get_skills(req.resume_id, db)
    recommendations = recommend_careers(skills)

    # Find match score for requested career
    match_score = 0.0
    for rec in recommendations:
        if rec["title"].lower() == req.target_career.lower():
            match_score = rec["match_score"]
            break

    # If not in top recommendations, do a direct calculation
    if match_score == 0:
        from ml.recommendation import CAREER_PROFILES
        if req.target_career not in CAREER_PROFILES:
            raise HTTPException(status_code=404, detail=f"Career '{req.target_career}' not found.")
        # Fallback: lower score
        match_score = 20.0

    result = simulate_outcome(skills, req.target_career, match_score)

    # Persist to DB
    sim = CareerSimulation(
        resume_id=req.resume_id,
        target_role=req.target_career,
        match_score=match_score,
        salary_estimate=result["salary_estimate"],
        probability=result["job_probability"],
    )
    db.add(sim)
    db.commit()

    return result


@router.get("/careers")
def list_careers():
    """Return all available career titles in the knowledge base."""
    from ml.recommendation import CAREER_PROFILES
    return {"careers": list(CAREER_PROFILES.keys())}
