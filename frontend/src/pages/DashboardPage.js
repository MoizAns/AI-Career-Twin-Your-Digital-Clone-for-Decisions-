import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from "recharts";

export default function DashboardPage({ session }) {
  const navigate = useNavigate();
  const { name, email, skills = [], recommendations = [] } = session;
  const [selectedCareer, setSelectedCareer] = useState(null);

  // Build radar chart data from top 6 recommendations
  const radarData = recommendations.slice(0, 6).map((r) => ({
    career: r.title.split(" ").slice(-1)[0], // short name
    score: r.match_score,
    fullTitle: r.title,
  }));

  return (
    <div style={s.page} className="fade-up">
      {/* Header */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>
            Welcome back, <span style={s.accent}>{name}</span> 👋
          </h1>
          <p style={s.sub}>
            {email && <>{email} · </>}
            <strong style={{ color: "var(--accent)" }}>{skills.length}</strong> skills extracted from your resume
          </p>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate("/")}>
          ⬆️ Re-upload
        </button>
      </div>

      <div style={s.grid}>
        {/* Skills Cloud */}
        <div className="card" style={s.skillsCard}>
          <div className="section-title">🧠 Extracted Skills</div>
          <div className="section-sub">
            NLP-detected from your resume · {skills.length} total
          </div>
          <div style={s.skillsCloud}>
            {skills.map((skill) => (
              <span key={skill} className="skill-pill">{skill}</span>
            ))}
          </div>
        </div>

        {/* Radar Chart */}
        <div className="card" style={s.radarCard}>
          <div className="section-title">📡 Career Match Radar</div>
          <div className="section-sub">Top 6 matches visualized</div>
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.08)" />
              <PolarAngleAxis
                dataKey="career"
                tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
              />
              <Radar
                dataKey="score"
                stroke="var(--accent)"
                fill="var(--accent)"
                fillOpacity={0.15}
                strokeWidth={2}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--bg-2)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  color: "var(--text-primary)",
                  fontSize: 13,
                }}
                formatter={(val, _, props) => [
                  `${val}%`,
                  props.payload?.fullTitle || "Match",
                ]}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recommendations */}
      <div className="card" style={{ marginTop: 24 }}>
        <div className="section-title">🎯 Career Recommendations</div>
        <div className="section-sub">
          Ranked by skill match · Click a card to explore further
        </div>
        <div style={s.recGrid}>
          {recommendations.map((rec, i) => (
            <div
              key={rec.title}
              style={{
                ...s.recCard,
                ...(selectedCareer === rec.title ? s.recCardActive : {}),
              }}
              onClick={() => setSelectedCareer(
                selectedCareer === rec.title ? null : rec.title
              )}
            >
              <div style={s.recRank}>#{i + 1}</div>
              <div style={s.recTitle}>{rec.title}</div>
              <div style={s.recScore}>
                <span style={s.recScoreNum}>{rec.match_score}%</span>
                <span style={s.recScoreLabel}>match</span>
              </div>
              <div className="progress-track" style={{ marginTop: 12 }}>
                <div
                  className="progress-fill"
                  style={{ width: `${rec.match_score}%` }}
                />
              </div>

              {selectedCareer === rec.title && (
                <div style={s.recExpanded}>
                  <div style={s.recSkillsLabel}>Required skills:</div>
                  <div style={s.recSkillsRow}>
                    {rec.required_skills.slice(0, 8).map((sk) => (
                      <span
                        key={sk}
                        className={`skill-pill ${
                          skills.map(s => s.toLowerCase()).includes(sk.toLowerCase())
                            ? "matched"
                            : "missing"
                        }`}
                        style={{ fontSize: 11 }}
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                  <div style={s.recActions}>
                    <button
                      className="btn btn-primary"
                      style={{ fontSize: 12, padding: "7px 16px" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate("/gap-analysis", { state: { career: rec.title } });
                      }}
                    >
                      Gap Analysis →
                    </button>
                    <button
                      className="btn btn-secondary"
                      style={{ fontSize: 12, padding: "7px 16px" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate("/simulation", { state: { career: rec.title } });
                      }}
                    >
                      Simulate →
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div style={s.actions}>
        <button className="btn btn-primary" onClick={() => navigate("/gap-analysis")}>
          📊 Analyze Skill Gap
        </button>
        <button className="btn btn-secondary" onClick={() => navigate("/simulation")}>
          🚀 Run Simulation
        </button>
        <button className="btn btn-secondary" onClick={() => navigate("/chatbot")}>
          🤖 Chat with AI Advisor
        </button>
      </div>
    </div>
  );
}

const s = {
  page: { display: "flex", flexDirection: "column", gap: 0 },
  header: {
    display: "flex", justifyContent: "space-between", alignItems: "flex-start",
    marginBottom: 32,
  },
  title: { fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 800 },
  accent: { color: "var(--accent)" },
  sub: { color: "var(--text-secondary)", marginTop: 6 },
  grid: { display: "grid", gridTemplateColumns: "1fr 340px", gap: 24 },
  skillsCard: { display: "flex", flexDirection: "column" },
  skillsCloud: { display: "flex", flexWrap: "wrap", gap: 8 },
  radarCard: { display: "flex", flexDirection: "column" },
  recGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: 16,
  },
  recCard: {
    background: "var(--bg-3)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-sm)",
    padding: "18px",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  recCardActive: {
    borderColor: "var(--accent)",
    background: "rgba(110,231,183,0.04)",
  },
  recRank: { fontSize: 11, color: "var(--text-muted)", fontWeight: 700, marginBottom: 6 },
  recTitle: { fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 },
  recScore: { display: "flex", alignItems: "baseline", gap: 4 },
  recScoreNum: { fontSize: 28, fontWeight: 800, color: "var(--accent)", fontFamily: "var(--font-display)" },
  recScoreLabel: { fontSize: 12, color: "var(--text-muted)" },
  recExpanded: { marginTop: 16, borderTop: "1px solid var(--border)", paddingTop: 14 },
  recSkillsLabel: { fontSize: 11, color: "var(--text-muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" },
  recSkillsRow: { display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 },
  recActions: { display: "flex", gap: 8, flexWrap: "wrap" },
  actions: { display: "flex", gap: 12, marginTop: 28, flexWrap: "wrap" },
};
