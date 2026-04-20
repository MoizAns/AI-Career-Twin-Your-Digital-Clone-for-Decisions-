"""
skill_gap.py
Computes the gap between user's current skills and target career skills.
"""
from typing import List, Dict
from ml.recommendation import get_career_skills


def analyze_skill_gap(user_skills: List[str], target_career: str) -> Dict:
    """
    Compare user skills vs required skills for a career.
    Returns: matched skills, missing skills, extra skills, coverage %.
    """
    required = get_career_skills(target_career)
    if not required:
        return {"error": f"Career '{target_career}' not found in knowledge base."}

    # Normalize to lowercase for comparison
    user_set = {s.lower() for s in user_skills}
    required_set = {s.lower() for s in required}

    matched = [s for s in required if s.lower() in user_set]
    missing = [s for s in required if s.lower() not in user_set]
    extra = [s for s in user_skills if s.lower() not in required_set]

    coverage = round(len(matched) / len(required) * 100, 1) if required else 0.0

    # Priority tiers for missing skills
    priority_missing = _prioritize_missing(missing, target_career)

    return {
        "target_career": target_career,
        "total_required": len(required),
        "matched_skills": matched,
        "missing_skills": missing,
        "extra_skills": extra,
        "coverage_percent": coverage,
        "priority_missing": priority_missing,
        "readiness_level": _readiness_label(coverage),
    }


def _readiness_label(coverage: float) -> str:
    """Human-readable readiness label based on coverage %."""
    if coverage >= 80:
        return "Job-Ready 🟢"
    elif coverage >= 60:
        return "Almost There 🟡"
    elif coverage >= 40:
        return "Developing 🟠"
    else:
        return "Beginner 🔴"


def _prioritize_missing(missing: List[str], career: str) -> List[Dict]:
    """
    Assign priority (High/Medium/Low) to missing skills based on
    how commonly they appear across top career profiles.
    """
    # High-value universal skills
    high_priority = {
        "python", "sql", "git", "docker", "aws", "machine learning",
        "react", "javascript", "kubernetes", "rest api"
    }
    medium_priority = {
        "typescript", "postgresql", "redis", "ci/cd", "linux",
        "pandas", "numpy", "tensorflow", "pytorch"
    }

    result = []
    for skill in missing:
        if skill.lower() in high_priority:
            priority = "High"
        elif skill.lower() in medium_priority:
            priority = "Medium"
        else:
            priority = "Low"

        result.append({"skill": skill, "priority": priority})

    # Sort: High → Medium → Low
    order = {"High": 0, "Medium": 1, "Low": 2}
    result.sort(key=lambda x: order[x["priority"]])
    return result
