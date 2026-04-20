"""
routes/chatbot.py
AI Career Advisor chatbot.
Rule-based engine with structured responses.
Easily swappable with OpenAI/Claude API for LLM power.
"""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
import re

router = APIRouter()


class ChatMessage(BaseModel):
    message: str
    resume_id: Optional[int] = None
    context: Optional[str] = None  # e.g. current career focus


class ChatResponse(BaseModel):
    reply: str
    suggestions: List[str] = []


# ── Knowledge Base for Rule-Based Responses ──────────────────────────────────

CAREER_TIPS = {
    "data scientist": [
        "Focus on Python, SQL, and statistics as your foundation.",
        "Build a Kaggle portfolio — it's the data science resume booster.",
        "Learn storytelling with data using Tableau or Power BI.",
    ],
    "machine learning engineer": [
        "PyTorch and TensorFlow are both great — pick one and go deep.",
        "Understand MLOps: Docker, Kubernetes, and model deployment.",
        "Contribute to open-source ML projects on GitHub.",
    ],
    "full stack developer": [
        "React + FastAPI or Node.js is a powerful modern stack.",
        "Deploy personal projects to Vercel/Render to show real-world skills.",
        "Learn system design fundamentals for senior roles.",
    ],
    "devops engineer": [
        "Master Docker and Kubernetes — they're non-negotiable.",
        "Get an AWS or Azure certification.",
        "Practice infrastructure-as-code with Terraform.",
    ],
    "frontend developer": [
        "React is the most in-demand — master it with hooks and context.",
        "TypeScript is becoming required at most companies.",
        "Build beautiful portfolio projects with Tailwind CSS.",
    ],
    "default": [
        "Start by identifying the skills most valued in your target role.",
        "Build 2-3 strong projects that showcase your abilities.",
        "Network actively on LinkedIn — 70% of jobs come from networking.",
    ],
}

FAQ_RESPONSES = {
    r"(salary|how much|earn|pay)": (
        "Salaries vary widely by role and location. For tech roles:\n"
        "• Junior: $60k–$85k\n• Mid-level: $85k–$130k\n• Senior: $130k–$200k+\n"
        "Run a Simulation from the dashboard to get a personalized estimate!"
    ),
    r"(resume|cv|improve|better)": (
        "Great resume tips:\n"
        "1. Use the STAR format for achievements\n"
        "2. Quantify results (e.g., 'reduced load time by 40%')\n"
        "3. Keep it to 1 page for < 5 years experience\n"
        "4. Tailor it to each job description\n"
        "5. ATS-friendly: avoid tables, use standard headers"
    ),
    r"(interview|prepare|study)": (
        "Interview prep strategy:\n"
        "• Technical: LeetCode (Easy/Medium), system design for seniors\n"
        "• Behavioral: STAR method for 5-7 key stories\n"
        "• Research the company deeply\n"
        "• Practice mock interviews on Pramp or Interviewing.io"
    ),
    r"(linkedin|network|connect)": (
        "LinkedIn tips:\n"
        "• Optimize your headline with keywords\n"
        "• Post 2-3x/week about your learning journey\n"
        "• Comment thoughtfully on industry leaders' posts\n"
        "• Reach out to 5 people/week with personalized messages"
    ),
    r"(learn|course|certif|study|resource)": (
        "Top learning resources:\n"
        "• Coursera / edX for structured courses\n"
        "• Fast.ai for practical ML\n"
        "• Roadmap.sh for career roadmaps\n"
        "• GitHub for real-world code\n"
        "• YouTube: Fireship, Traversy Media, 3Blue1Brown"
    ),
    r"(skill gap|missing|need|require)": (
        "To close skill gaps effectively:\n"
        "1. Identify the top 3 missing skills from the Gap Analysis tab\n"
        "2. Spend focused 90-minute sessions daily on one skill\n"
        "3. Build a mini-project after each new skill\n"
        "4. Document progress publicly on GitHub"
    ),
    r"(freelance|remote|contract)": (
        "For freelancing success:\n"
        "• Start on Upwork or Toptal to build reputation\n"
        "• Specialize in a niche (e.g., ML for healthcare)\n"
        "• Build a personal website showcasing your work\n"
        "• Cold email 10 potential clients/week"
    ),
    r"(switch|change|career|transition)": (
        "Career switching tips:\n"
        "1. Identify transferable skills (they're more than you think!)\n"
        "2. Upskill via a targeted 3-6 month plan\n"
        "3. Build portfolio projects in the new field\n"
        "4. Start networking in the new domain NOW\n"
        "5. Consider part-time contract work to gain experience"
    ),
}


def get_bot_response(message: str, context: Optional[str] = None) -> ChatResponse:
    """
    Process user message and return a relevant career advice response.
    """
    msg_lower = message.lower().strip()

    # Greetings
    if re.search(r'\b(hi|hello|hey|start|help)\b', msg_lower):
        return ChatResponse(
            reply=(
                "👋 Hey there! I'm your AI Career Advisor.\n\n"
                "I can help you with:\n"
                "• Career path advice\n"
                "• Skill gap strategies\n"
                "• Interview preparation\n"
                "• Salary insights\n"
                "• Learning resources\n\n"
                "What's on your mind?"
            ),
            suggestions=[
                "How do I improve my resume?",
                "What salary can I expect?",
                "How do I prepare for interviews?",
                "How do I switch careers?",
            ]
        )

    # Career-specific advice
    if context:
        career_lower = context.lower()
        for career, tips in CAREER_TIPS.items():
            if career in career_lower:
                tip = tips[hash(message) % len(tips)]
                return ChatResponse(
                    reply=f"💡 For {context}:\n\n{tip}",
                    suggestions=["Tell me more", "What else should I learn?", "How long will it take?"]
                )

    # FAQ matching
    for pattern, response in FAQ_RESPONSES.items():
        if re.search(pattern, msg_lower):
            return ChatResponse(
                reply=response,
                suggestions=generate_follow_up(pattern)
            )

    # Career-specific keywords without context
    for career, tips in CAREER_TIPS.items():
        if career in msg_lower:
            return ChatResponse(
                reply=f"💡 Tips for {career.title()}:\n\n" + "\n".join(f"• {t}" for t in tips),
                suggestions=["What skills do I need?", "What's the salary?", "How to get started?"]
            )

    # Default fallback
    return ChatResponse(
        reply=(
            "Great question! Here are some universal career strategies:\n\n"
            + "\n".join(f"• {t}" for t in CAREER_TIPS["default"]) +
            "\n\nFor personalized advice, try uploading your resume and running a Simulation!"
        ),
        suggestions=[
            "How do I improve my skills?",
            "What's the best career for me?",
            "How do I prepare for interviews?",
        ]
    )


def generate_follow_up(pattern: str) -> List[str]:
    follow_ups = {
        r"salary": ["What affects my salary?", "How do I negotiate salary?"],
        r"resume": ["Should I use a template?", "What keywords matter?"],
        r"interview": ["What are common questions?", "How do I handle nervousness?"],
        r"linkedin": ["How do I get recruiter attention?", "Should I post on LinkedIn?"],
    }
    for key in follow_ups:
        if key in pattern:
            return follow_ups[key]
    return ["Tell me more", "What else should I know?"]


@router.post("/chat", response_model=ChatResponse)
def chat(msg: ChatMessage):
    """Main chatbot endpoint."""
    return get_bot_response(msg.message, msg.context)
