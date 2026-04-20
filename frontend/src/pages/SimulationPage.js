import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar, Cell,
} from "recharts";
import { simulate, getCareers } from "../api";

export default function SimulationPage({ session }) {
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
    if (defaultCareer) runSim(defaultCareer);
  }, []); // eslint-disable-line

  const runSim = async (career = selected) => {
    if (!career) return;
    setLoading(true);
    setError("");
    try {
      const { data } = await simulate(session.resumeId, career);
      setResult(data);
    } catch (e) {
      setError(e.response?.data?.detail || "Simulation failed.");
    } finally {
      setLoading(false);
    }
  };

  const formatSalary = (n) =>
    n >= 1000 ? `$${(n / 1000).toFixed(0)}k` : `$${n}`;

  return (
    <div className="fade-up">
      <h1 style={s.title}>🚀 Career Outcome Simulator</h1>
      <p style={s.sub}>
        Predict your job probability, salary, and 5-year earnings trajectory for any career path.
      </p>

      {/* Career Picker */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={s.pickerRow}>
          <select
            style={s.select}
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
          >
            <option value="">— Choose a career to simulate —</option>
            {careers.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <button
            className="btn btn-primary"
            onClick={() => runSim()}
            disabled={!selected || loading}
          >
            {loading ? "Simulating…" : "⚡ Run Simulation"}
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading && (
        <div style={s.loadingWrap}>
          <div className="spinner" />
          <span style={{ color: "var(--text-secondary)", fontSize: 14 }}>
            Running simulation engine…
          </span>
        </div>
      )}

      {result && !loading && (
        <>
          {/* KPI Cards */}
          <div style={s.kpiGrid}>
            <KpiCard
              icon="🎯"
              label="Job Probability"
              value={`${result.job_probability}%`}
              sub="of getting hired"
              color={
                result.job_probability >= 70 ? "var(--accent)"
                  : result.job_probability >= 45 ? "var(--accent-warn)"
                  : "var(--accent-danger)"
              }
            />
            <KpiCard
              icon="💰"
              label="Salary Estimate"
              value={`$${result.salary_estimate.toLocaleString()}`}
              sub={`Range: ${formatSalary(result.salary_range.low)} – ${formatSalary(result.salary_range.high)}`}
              color="var(--accent-2)"
            />
            <KpiCard
              icon="⏱️"
              label="Time to Hire"
              value={`${result.months_to_hire} mo`}
              sub="average job search"
              color="var(--accent-3)"
            />
            <KpiCard
              icon="📈"
              label="Market Demand"
              value={`${result.market_demand_score}%`}
              sub="industry demand score"
              color="var(--accent-warn)"
            />
          </div>

          {/* Charts Grid */}
          <div style={s.chartsGrid}>
            {/* 5-Year Salary Projection */}
            <div className="card">
              <div className="section-title">📈 5-Year Salary Projection</div>
              <div className="section-sub">Estimated annual salary growth</div>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={result.five_year_projection}>
                  <defs>
                    <linearGradient id="salGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis
                    dataKey="year"
                    tickFormatter={(y) => `Yr ${y}`}
                    tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                  />
                  <YAxis
                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                    tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                    width={50}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--bg-2)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      color: "var(--text-primary)",
                    }}
                    formatter={(v) => [`$${v.toLocaleString()}`, "Salary"]}
                    labelFormatter={(l) => `Year ${l}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="salary"
                    stroke="var(--accent)"
                    strokeWidth={2}
                    fill="url(#salGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Match Score Gauge */}
            <div className="card" style={s.gaugeCard}>
              <div className="section-title">🎯 Match Score</div>
              <div className="section-sub">Your skill alignment</div>
              <div style={s.gaugeWrap}>
                <svg width="200" height="120" viewBox="0 0 200 120">
                  {/* Background arc */}
                  <path
                    d="M 20 110 A 80 80 0 0 1 180 110"
                    fill="none" stroke="var(--bg-3)" strokeWidth="16" strokeLinecap="round"
                  />
                  {/* Score arc */}
                  <path
                    d="M 20 110 A 80 80 0 0 1 180 110"
                    fill="none"
                    stroke="var(--accent)"
                    strokeWidth="16"
                    strokeLinecap="round"
                    strokeDasharray={`${Math.PI * 80}`}
                    strokeDashoffset={`${Math.PI * 80 * (1 - result.match_score / 100)}`}
                    style={{ transition: "stroke-dashoffset 1.2s ease" }}
                  />
                  <text x="100" y="96" textAnchor="middle" fill="var(--accent)"
                    style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 28 }}>
                    {result.match_score}%
                  </text>
                  <text x="100" y="114" textAnchor="middle" fill="var(--text-muted)"
                    style={{ fontSize: 11 }}>
                    skill match
                  </text>
                </svg>
              </div>

              {/* Tips */}
              <div style={s.tipsSection}>
                <div style={s.tipsLabel}>💡 Upskilling Tips</div>
                {result.upskill_tips.map((tip, i) => (
                  <div key={i} style={s.tip}>
                    <span style={s.tipDot}>{i + 1}</span>
                    <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Salary Range Bar */}
          <div className="card" style={{ marginTop: 24 }}>
            <div className="section-title">💵 Salary Range Breakdown</div>
            <div className="section-sub">Entry to senior level estimates</div>
            <ResponsiveContainer width="100%" height={100}>
              <BarChart
                data={[
                  { label: "Your Estimate", value: result.salary_estimate },
                  { label: "Low Range", value: result.salary_range.low },
                  { label: "High Range", value: result.salary_range.high },
                ]}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis
                  type="number"
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                  tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                />
                <YAxis type="category" dataKey="label" tick={{ fill: "var(--text-secondary)", fontSize: 11 }} width={100} />
                <Tooltip
                  contentStyle={{ background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: 8 }}
                  formatter={(v) => [`$${v.toLocaleString()}`, "Salary"]}
                />
                <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                  {["var(--accent)", "var(--accent-3)", "var(--accent-2)"].map((color, i) => (
                    <Cell key={i} fill={color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {!result && !loading && (
        <div style={s.empty}>
          <div style={{ fontSize: 52 }}>🚀</div>
          <div style={{ fontSize: 15 }}>Select a career and run the simulation to see your future</div>
        </div>
      )}
    </div>
  );
}

function KpiCard({ icon, label, value, sub, color }) {
  return (
    <div className="card" style={s.kpi}>
      <div style={s.kpiIcon}>{icon}</div>
      <div style={{ ...s.kpiValue, color }}>{value}</div>
      <div style={s.kpiLabel}>{label}</div>
      <div style={s.kpiSub}>{sub}</div>
    </div>
  );
}

const s = {
  title: { fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 800, marginBottom: 6 },
  sub: { color: "var(--text-secondary)", marginBottom: 28 },
  pickerRow: { display: "flex", gap: 12, alignItems: "center" },
  select: {
    flex: 1, background: "var(--bg-3)", border: "1px solid var(--border-hover)",
    borderRadius: "var(--radius-sm)", color: "var(--text-primary)",
    padding: "10px 14px", fontSize: 14, cursor: "pointer", outline: "none",
  },
  kpiGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 },
  kpi: { display: "flex", flexDirection: "column", gap: 4 },
  kpiIcon: { fontSize: 22, marginBottom: 4 },
  kpiValue: { fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 800 },
  kpiLabel: { fontSize: 13, fontWeight: 600, color: "var(--text-primary)" },
  kpiSub: { fontSize: 12, color: "var(--text-muted)" },
  chartsGrid: { display: "grid", gridTemplateColumns: "1fr 340px", gap: 24 },
  gaugeCard: { display: "flex", flexDirection: "column" },
  gaugeWrap: { display: "flex", justifyContent: "center", margin: "16px 0" },
  tipsSection: { borderTop: "1px solid var(--border)", paddingTop: 16 },
  tipsLabel: { fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 12 },
  tip: { display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 },
  tipDot: {
    background: "var(--bg-3)", border: "1px solid var(--border)",
    borderRadius: "50%", width: 22, height: 22,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 11, fontWeight: 700, color: "var(--accent)", flexShrink: 0,
  },
  empty: {
    display: "flex", flexDirection: "column", alignItems: "center",
    justifyContent: "center", gap: 16, minHeight: 300,
    color: "var(--text-muted)", textAlign: "center",
  },
  loadingWrap: {
    display: "flex", flexDirection: "column", alignItems: "center",
    gap: 16, padding: 60,
  },
};
