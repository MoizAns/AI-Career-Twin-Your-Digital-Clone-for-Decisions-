"""
simulation.py
Simulates future career outcomes: job probability, salary range,
time-to-hire, and a 5-year growth projection.
"""
from typing import List, Dict
import math

# ─────────────────────────────────────────
# Career market data (realistic estimates)
# ─────────────────────────────────────────
CAREER_MARKET_DATA = {
    "Full Stack Developer": {
        "base_salary": 95000, "max_salary": 160000,
        "market_demand": 0.85, "avg_months_to_hire": 2.5,
        "growth_rate": 0.12,  # annual salary growth
    },
    "Data Scientist": {
        "base_salary": 105000, "max_salary": 175000,
        "market_demand": 0.80, "avg_months_to_hire": 3.0,
        "growth_rate": 0.13,
    },
    "Machine Learning Engineer": {
        "base_salary": 120000, "max_salary": 200000,
        "market_demand": 0.88, "avg_months_to_hire": 2.8,
        "growth_rate": 0.15,
    },
    "DevOps Engineer": {
        "base_salary": 100000, "max_salary": 165000,
        "market_demand": 0.82, "avg_months_to_hire": 2.2,
        "growth_rate": 0.11,
    },
    "Backend Developer": {
        "base_salary": 90000, "max_salary": 155000,
        "market_demand": 0.83, "avg_months_to_hire": 2.4,
        "growth_rate": 0.11,
    },
    "Frontend Developer": {
        "base_salary": 85000, "max_salary": 145000,
        "market_demand": 0.78, "avg_months_to_hire": 2.6,
        "growth_rate": 0.10,
    },
    "Data Engineer": {
        "base_salary": 110000, "max_salary": 170000,
        "market_demand": 0.84, "avg_months_to_hire": 2.7,
        "growth_rate": 0.13,
    },
    "Cloud Architect": {
        "base_salary": 130000, "max_salary": 210000,
        "market_demand": 0.86, "avg_months_to_hire": 3.2,
        "growth_rate": 0.14,
    },
    "Cybersecurity Analyst": {
        "base_salary": 95000, "max_salary": 160000,
        "market_demand": 0.87, "avg_months_to_hire": 2.9,
        "growth_rate": 0.13,
    },
    "Mobile Developer": {
        "base_salary": 90000, "max_salary": 155000,
        "market_demand": 0.75, "avg_months_to_hire": 2.8,
        "growth_rate": 0.10,
    },
    "NLP / AI Engineer": {
        "base_salary": 130000, "max_salary": 220000,
        "market_demand": 0.92, "avg_months_to_hire": 2.5,
        "growth_rate": 0.18,
    },
    "Product Manager": {
        "base_salary": 110000, "max_salary": 180000,
        "market_demand": 0.76, "avg_months_to_hire": 3.5,
        "growth_rate": 0.12,
    },
}

DEFAULT_MARKET = {
    "base_salary": 80000, "max_salary": 130000,
    "market_demand": 0.70, "avg_months_to_hire": 3.0,
    "growth_rate": 0.09,
}


def simulate_outcome(
    user_skills: List[str],
    target_career: str,
    match_score: float  # 0–100
) -> Dict:
    """
    Run the full simulation for a target career.
    Returns job probability, salary estimate, timeline, and 5-year projection.
    """
    market = CAREER_MARKET_DATA.get(target_career, DEFAULT_MARKET)

    # ── Job Probability ──────────────────────────────────────
    # Weighted formula: 60% skill match + 40% market demand
    skill_factor = match_score / 100
    demand_factor = market["market_demand"]
    raw_probability = (skill_factor * 0.60) + (demand_factor * 0.40)

    # Apply sigmoid-like smoothing so extremes are less harsh
    probability = _smooth(raw_probability) * 100

    # ── Salary Estimate ──────────────────────────────────────
    base = market["base_salary"]
    max_sal = market["max_salary"]
    salary_range_low = round(base + (max_sal - base) * skill_factor * 0.5, -3)
    salary_range_high = round(base + (max_sal - base) * skill_factor, -3)
    salary_estimate = round((salary_range_low + salary_range_high) / 2, -3)

    # ── Time to Hire ──────────────────────────────────────────
    base_months = market["avg_months_to_hire"]
    # Higher skill match → faster hiring
    months_to_hire = round(base_months * (1 + (1 - skill_factor) * 0.5), 1)

    # ── 5-Year Growth Projection ─────────────────────────────
    growth = market["growth_rate"]
    five_year = []
    current_salary = salary_estimate
    for year in range(1, 6):
        current_salary = round(current_salary * (1 + growth), -3)
        five_year.append({"year": year, "salary": int(current_salary)})

    # ── Skill Recommendations ────────────────────────────────
    upskill_tips = _generate_tips(target_career, match_score)

    return {
        "target_career": target_career,
        "match_score": round(match_score, 1),
        "job_probability": round(probability, 1),
        "salary_estimate": int(salary_estimate),
        "salary_range": {
            "low": int(salary_range_low),
            "high": int(salary_range_high),
        },
        "months_to_hire": months_to_hire,
        "five_year_projection": five_year,
        "market_demand_score": round(demand_factor * 100, 1),
        "upskill_tips": upskill_tips,
    }


def _smooth(x: float) -> float:
    """Sigmoid-like smoothing for probabilities."""
    return 1 / (1 + math.exp(-10 * (x - 0.5)))


def _generate_tips(career: str, match_score: float) -> List[str]:
    """Context-aware upskilling tips based on match score."""
    if match_score >= 80:
        return [
            "Polish your portfolio with 2-3 strong projects",
            "Contribute to open-source to boost visibility",
            "Prepare for system design interviews",
        ]
    elif match_score >= 50:
        return [
            "Focus on the 'High Priority' missing skills first",
            "Build a capstone project showcasing your top skills",
            "Take a targeted online course (Coursera / Udemy)",
        ]
    else:
        return [
            "Start with foundational skills for this career path",
            "Join a structured bootcamp or certification program",
            "Find a mentor in this field via LinkedIn",
        ]
