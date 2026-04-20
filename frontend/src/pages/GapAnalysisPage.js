import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { getGapAnalysis, getCareers } from "../api";

const PRIORITY_COLOR = {
  High: "badge-red",
  Medium: "badge-amber",
  Low: "badge-blue",
};

export default function GapAnalysisPage({ session }) {
  const location = useLocation();
  const defaultCareer = location.state?.career || "";
  const [careers, setCareers] = useState([]);
  const [selected, setSelected] = useState(defaultCareer);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getCareers().then(({ data }) => setCareers(data.careers));
  }, []);

  useEffect(() => {
    if (defaultCareer) runAnalysis(defaultCareer);
  }, []); // eslint-disable-line

  const runAnalysis = async (career = selected) => {
    if (!career) return;
    setLoading(true);
    setError("");
    try {
      const { data } = await getGapAnalysis(session.resumeId, career);
      setResult(data);
    } catch (e) {
      setError(e.response?.data?.detail || "Analysis failed.");
    } finally {
      setLoading(false);
    }
  };

  const coverage = result?.coverage_percent ?? 0;

  return (
    <div className="fade-up">
      <h1 style={s.title}>📊 Skill Gap Analysis</h1>
      <p style={s.sub}>See exactly what skills you have and what you're missing for your target role.</p>

      {/* Career Picker */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={s.pickerRow}>
          <select
            style={s.select}
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
          >
            <option value="">— Select a target career —</option>
            {careers.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <button
            className="btn btn-primary"
            onClick={() => runAnalysis()}
            disabled={!selected || loading}
          >
            {loading ? "Analyzing…" : "Run Analysis"}
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {result && (
        <div style={s.resultsGrid}>
          {/* Coverage Overview */}
          <div className="card" style={s.overviewCard}>
            <div className="section-title">{result.target_career}</div>
            <div className="section-sub">{result.readiness_level}</div>

            {/* Big coverage circle */}
            <div style={s.circleWrap}>
              <svg width="160" height="160" viewBox="0 0 160 160">
                <circle cx="80" cy="80" r="68" fill="none" stroke="var(--bg-3)" strokeWidth="12" />
                <circle
                  cx="80" cy="80" r="68"
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 68}`}
                  strokeDashoffset={`${2 * Math.PI * 68 * (1 - coverage / 100)}`}
                  transform="rotate(-90 80 80)"
                  style={{ transition: "stroke-dashoffset 1s ease" }}
                />
              </svg>
              <div style={s.circleLabel}>
                <div style={s.circleNum}>{coverage}%</div>
                <div style={s.circleText}>Coverage</div>
              </div>
            </div>

            <div style={s.statsRow}>
              <Stat label="Required" value={result.total_required} color="var(--text-primary)" />
              <Stat label="You Have" value={result.matched_skills.length} color="var(--accent)" />
              <Stat label="Missing" value={result.missing_skills.length} color="var(--accent-danger)" />
            </div>
          </div>

          {/* Skills columns */}
          <div style={s.skillsCol}>
            {/* Matched */}
            <div className="card">
              <div className="section-title" style={{ color: "var(--accent)" }}>
                ✅ Skills You Have ({result.matched_skills.length})
              </div>
              <div style={s.pillsWrap}>
                {result.matched_skills.length > 0
                  ? result.matched_skills.map((sk) => (
                      <span key={sk} className="skill-pill matched">{sk}</span>
                    ))
                  : <span style={{ color: "var(--text-muted)", fontSize: 13 }}>None detected yet</span>
                }
              </div>
            </div>

            {/* Missing */}
            <div className="card" style={{ marginTop: 16 }}>
              <div className="section-title" style={{ color: "var(--accent-danger)" }}>
                ❌ Missing Skills ({result.missing_skills.length})
              </div>
              <div style={s.priorityList}>
                {result.priority_missing.map(({ skill, priority }) => (
                  <div key={skill} style={s.priorityRow}>
                    <span className="skill-pill missing">{skill}</span>
                    <span className={`badge ${PRIORITY_COLOR[priority]}`}>{priority}</span>
                  </div>
                ))}
                {result.missing_skills.length === 0 && (
                  <div className="alert alert-success">
                    🎉 You have all required skills for this role!
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {!result && !loading && (
        <div style={s.empty}>
          <div style={s.emptyIcon}>📊</div>
          <div style={s.emptyText}>Select a career above to run your gap analysis</div>
        </div>
      )}

      {loading && (
        <div style={s.loadingWrap}>
          <div className="spinner" />
          <span style={{ color: "var(--text-secondary)", fontSize: 14 }}>
            Analyzing skill match…
          </span>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, color }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 28, fontWeight: 800, color, fontFamily: "var(--font-display)" }}>
        {value}
      </div>
      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{label}</div>
    </div>
  );
}

const s = {
  title: { fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 800, marginBottom: 6 },
  sub: { color: "var(--text-secondary)", marginBottom: 28 },
  pickerRow: { display: "flex", gap: 12, alignItems: "center" },
  select: {
    flex: 1,
    background: "var(--bg-3)",
    border: "1px solid var(--border-hover)",
    borderRadius: "var(--radius-sm)",
    color: "var(--text-primary)",
    padding: "10px 14px",
    fontSize: 14,
    cursor: "pointer",
    outline: "none",
  },
  resultsGrid: { display: "grid", gridTemplateColumns: "280px 1fr", gap: 24 },
  overviewCard: { display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" },
  circleWrap: { position: "relative", margin: "20px 0" },
  circleLabel: {
    position: "absolute", top: "50%", left: "50%",
    transform: "translate(-50%, -50%)", textAlign: "center",
  },
  circleNum: { fontSize: 32, fontWeight: 800, fontFamily: "var(--font-display)", color: "var(--accent)" },
  circleText: { fontSize: 12, color: "var(--text-muted)" },
  statsRow: { display: "flex", gap: 24, marginTop: 8 },
  skillsCol: { display: "flex", flexDirection: "column" },
  pillsWrap: { display: "flex", flexWrap: "wrap", gap: 8 },
  priorityList: { display: "flex", flexDirection: "column", gap: 10 },
  priorityRow: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  empty: {
    display: "flex", flexDirection: "column", alignItems: "center",
    justifyContent: "center", gap: 16, minHeight: 300,
    color: "var(--text-muted)", textAlign: "center",
  },
  emptyIcon: { fontSize: 52 },
  emptyText: { fontSize: 15 },
  loadingWrap: {
    display: "flex", flexDirection: "column", alignItems: "center",
    gap: 16, padding: 60, color: "var(--text-secondary)",
  },
};
