import axios from "axios";

const BASE = process.env.REACT_APP_API_URL || "http://localhost:8000";
const api = axios.create({ baseURL: BASE });

// ── Resume ────────────────────────────────────────────────────────────────
export const uploadResume = (file) => {
  const form = new FormData();
  form.append("file", file);
  return api.post("/api/resume/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// ── Career ────────────────────────────────────────────────────────────────
export const getRecommendations = (resumeId) =>
  api.post("/api/career/recommend", { resume_id: resumeId });

export const getGapAnalysis = (resumeId, targetCareer) =>
  api.post("/api/career/gap-analysis", { resume_id: resumeId, target_career: targetCareer });

export const simulate = (resumeId, targetCareer) =>
  api.post("/api/career/simulate", { resume_id: resumeId, target_career: targetCareer });

export const getCareers = () => api.get("/api/career/careers");

// ── Chatbot ───────────────────────────────────────────────────────────────
export const sendChat = (message, resumeId = null, context = null) =>
  api.post("/api/chatbot/chat", { message, resume_id: resumeId, context });
