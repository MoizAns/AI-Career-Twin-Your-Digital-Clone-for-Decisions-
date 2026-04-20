"""
resume_parser.py
Extracts text and skills from uploaded PDF resumes using pdfplumber + spaCy.
"""
import pdfplumber
import spacy
import re
from typing import List, Tuple

# Load spaCy English model (run: python -m spacy download en_core_web_sm)
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    import subprocess
    subprocess.run(["python", "-m", "spacy", "download", "en_core_web_sm"])
    nlp = spacy.load("en_core_web_sm")

# ─────────────────────────────────────────
# Large keyword dictionary for skill detection
# ─────────────────────────────────────────
SKILL_KEYWORDS = {
    # Programming Languages
    "python", "java", "javascript", "typescript", "c++", "c#", "go", "rust",
    "kotlin", "swift", "scala", "r", "matlab", "perl", "php", "ruby", "dart",

    # Web / Frontend
    "react", "angular", "vue", "next.js", "nuxt", "html", "css", "sass",
    "tailwind", "bootstrap", "webpack", "vite", "redux", "graphql",

    # Backend
    "fastapi", "django", "flask", "express", "spring", "node.js", "nestjs",
    "rest api", "grpc", "soap", "microservices",

    # Databases
    "sql", "mysql", "postgresql", "mongodb", "redis", "sqlite", "cassandra",
    "dynamodb", "firebase", "elasticsearch", "neo4j",

    # Cloud & DevOps
    "aws", "azure", "gcp", "docker", "kubernetes", "terraform", "ansible",
    "jenkins", "github actions", "ci/cd", "linux", "nginx", "apache",

    # Data / ML / AI
    "machine learning", "deep learning", "nlp", "computer vision", "pytorch",
    "tensorflow", "keras", "scikit-learn", "pandas", "numpy", "matplotlib",
    "seaborn", "hugging face", "langchain", "openai", "llm", "rag",
    "data analysis", "data science", "statistics", "tableau", "power bi",

    # Soft Skills / Methodologies
    "agile", "scrum", "kanban", "jira", "git", "github", "gitlab",
    "communication", "leadership", "problem solving", "teamwork",
    "project management", "time management",

    # Security
    "cybersecurity", "penetration testing", "owasp", "ssl", "oauth", "jwt",

    # Mobile
    "android", "ios", "react native", "flutter", "xamarin",
}


def extract_text_from_pdf(pdf_path: str) -> str:
    """Extract raw text from a PDF file using pdfplumber."""
    text = ""
    try:
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
    except Exception as e:
        raise ValueError(f"Failed to read PDF: {str(e)}")
    return text.strip()


def extract_skills(text: str) -> List[str]:
    """
    Extract skills from resume text using keyword matching + spaCy NER.
    Returns a deduplicated, sorted list of found skills.
    """
    text_lower = text.lower()
    found_skills = set()

    # 1. Keyword matching
    for skill in SKILL_KEYWORDS:
        # Use word-boundary-aware matching
        pattern = r'\b' + re.escape(skill) + r'\b'
        if re.search(pattern, text_lower):
            found_skills.add(skill.title() if len(skill) > 3 else skill.upper())

    # 2. spaCy NER for organizations and products (catches some tech names)
    doc = nlp(text[:10000])  # limit to first 10k chars for speed
    for ent in doc.ents:
        if ent.label_ in ("ORG", "PRODUCT") and len(ent.text) > 2:
            clean = ent.text.strip()
            if clean.lower() in SKILL_KEYWORDS:
                found_skills.add(clean)

    return sorted(list(found_skills))


def extract_name(text: str) -> str:
    """Try to extract candidate name from first few lines."""
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    if lines:
        doc = nlp(lines[0])
        for ent in doc.ents:
            if ent.label_ == "PERSON":
                return ent.text
    return "Candidate"


def extract_email(text: str) -> str:
    """Extract email address from resume text."""
    match = re.search(r'[\w.+-]+@[\w-]+\.[a-zA-Z]{2,}', text)
    return match.group(0) if match else ""


def parse_resume(pdf_path: str) -> dict:
    """
    Full resume parse pipeline.
    Returns: { raw_text, skills, name, email }
    """
    raw_text = extract_text_from_pdf(pdf_path)
    skills = extract_skills(raw_text)
    name = extract_name(raw_text)
    email = extract_email(raw_text)

    return {
        "raw_text": raw_text,
        "skills": skills,
        "name": name,
        "email": email,
        "skill_count": len(skills),
    }
