"""
recommendation.py
Suggests career paths based on detected skills using cosine similarity
against a predefined career-skills knowledge base.
"""
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from typing import List, Dict
import numpy as np

# ─────────────────────────────────────────
# Career Knowledge Base
# Maps career titles → required skill sets
# ─────────────────────────────────────────
CAREER_PROFILES = {
    "Full Stack Developer": [
        "React", "Node.js", "JavaScript", "TypeScript", "SQL", "REST API",
        "HTML", "CSS", "Git", "Docker", "MongoDB", "PostgreSQL"
    ],
    "Data Scientist": [
        "Python", "Machine Learning", "Pandas", "NumPy", "Scikit-Learn",
        "Statistics", "Data Analysis", "Matplotlib", "SQL", "Tableau",
        "TensorFlow", "Deep Learning"
    ],
    "Machine Learning Engineer": [
        "Python", "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch",
        "Scikit-Learn", "Docker", "Kubernetes", "AWS", "MLOps", "NLP"
    ],
    "DevOps Engineer": [
        "Docker", "Kubernetes", "AWS", "Linux", "CI/CD", "Terraform",
        "Jenkins", "GitHub Actions", "Ansible", "Nginx", "Python", "Git"
    ],
    "Backend Developer": [
        "Python", "Java", "FastAPI", "Django", "Flask", "SQL", "REST API",
        "PostgreSQL", "Redis", "Docker", "Microservices", "Git"
    ],
    "Frontend Developer": [
        "React", "JavaScript", "TypeScript", "HTML", "CSS", "Tailwind",
        "Vue", "Angular", "Redux", "Git", "Webpack", "GraphQL"
    ],
    "Data Engineer": [
        "Python", "SQL", "Spark", "Hadoop", "AWS", "Azure", "Kafka",
        "Airflow", "PostgreSQL", "MongoDB", "ETL", "Pandas"
    ],
    "Cloud Architect": [
        "AWS", "Azure", "GCP", "Docker", "Kubernetes", "Terraform",
        "Microservices", "Linux", "CI/CD", "Networking", "Security"
    ],
    "Cybersecurity Analyst": [
        "Cybersecurity", "Penetration Testing", "Linux", "Python",
        "OWASP", "SSL", "Networking", "SIEM", "Firewalls", "Ethical Hacking"
    ],
    "Mobile Developer": [
        "Flutter", "React Native", "Dart", "Swift", "Kotlin", "Android",
        "iOS", "Firebase", "REST API", "Git", "UX"
    ],
    "NLP / AI Engineer": [
        "Python", "NLP", "Hugging Face", "LLM", "RAG", "Transformers",
        "PyTorch", "TensorFlow", "LangChain", "Machine Learning", "Deep Learning"
    ],
    "Product Manager": [
        "Agile", "Scrum", "Jira", "Leadership", "Communication",
        "Project Management", "Roadmapping", "Stakeholder Management",
        "Data Analysis", "Figma"
    ],
}


def _build_corpus(user_skills: List[str]) -> tuple:
    """Create TF-IDF corpus from user skills + career profiles."""
    user_doc = " ".join(user_skills).lower()
    career_docs = [" ".join(skills).lower() for skills in CAREER_PROFILES.values()]
    career_names = list(CAREER_PROFILES.keys())
    return user_doc, career_docs, career_names


def recommend_careers(user_skills: List[str], top_n: int = 5) -> List[Dict]:
    """
    Returns top N career recommendations with match scores.
    """
    if not user_skills:
        return []

    user_doc, career_docs, career_names = _build_corpus(user_skills)
    all_docs = [user_doc] + career_docs

    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform(all_docs)

    # Cosine similarity: user vs each career
    user_vec = tfidf_matrix[0]
    career_vecs = tfidf_matrix[1:]
    similarities = cosine_similarity(user_vec, career_vecs)[0]

    # Build result
    results = []
    for i, score in enumerate(similarities):
        results.append({
            "title": career_names[i],
            "match_score": round(float(score) * 100, 1),
            "required_skills": CAREER_PROFILES[career_names[i]],
        })

    results.sort(key=lambda x: x["match_score"], reverse=True)
    return results[:top_n]


def get_career_skills(career_title: str) -> List[str]:
    """Return required skills for a specific career."""
    return CAREER_PROFILES.get(career_title, [])
