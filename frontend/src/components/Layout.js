import React from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";

const NAV = [
  { to: "/", label: "Upload", icon: "⬆️", exact: true },
  { to: "/dashboard", label: "Skills & Recs", icon: "🎯" },
  { to: "/gap-analysis", label: "Gap Analysis", icon: "📊" },
  { to: "/simulation", label: "Simulation", icon: "🚀" },
  { to: "/chatbot", label: "AI Advisor", icon: "🤖" },
];

export default function Layout({ session }) {
  const loc = useLocation();
  return (
    <div style={s.shell}>
      {/* Sidebar */}
      <aside style={s.sidebar}>
        <div style={s.logo}>
          <span style={s.logoIcon}>⚡</span>
          <div>
            <div style={s.logoText}>Career Twin</div>
            <div style={s.logoSub}>AI-Powered</div>
          </div>
        </div>

        <nav style={s.nav}>
          {NAV.map(({ to, label, icon, exact }) => {
            const active = exact ? loc.pathname === to : loc.pathname.startsWith(to);
            const locked = to !== "/" && to !== "/chatbot" && !session;
            return (
              <NavLink
                key={to}
                to={locked ? "/" : to}
                style={active ? { ...s.navItem, ...s.navActive } : s.navItem}
                onClick={e => locked && e.preventDefault()}
              >
                <span style={s.navIcon}>{icon}</span>
                <span style={s.navLabel}>{label}</span>
                {locked && <span style={s.lock}>🔒</span>}
              </NavLink>
            );
          })}
        </nav>

        {session && (
          <div style={s.sessionCard}>
            <div style={s.sessionDot} />
            <div>
              <div style={s.sessionName}>{session.name}</div>
              <div style={s.sessionSkills}>{session.skills?.length} skills found</div>
            </div>
          </div>
        )}
      </aside>

      {/* Main */}
      <main style={s.main}>
        <Outlet />
      </main>
    </div>
  );
}

const s = {
  shell: { display: "flex", minHeight: "100vh", background: "var(--bg)" },
  sidebar: {
    width: 240,
    minHeight: "100vh",
    background: "var(--bg-2)",
    borderRight: "1px solid var(--border)",
    display: "flex",
    flexDirection: "column",
    padding: "24px 16px",
    position: "sticky",
    top: 0,
    height: "100vh",
  },
  logo: { display: "flex", alignItems: "center", gap: 12, padding: "0 8px 32px" },
  logoIcon: { fontSize: 28 },
  logoText: { fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, color: "var(--text-primary)" },
  logoSub: { fontSize: 11, color: "var(--accent)", letterSpacing: "0.1em", textTransform: "uppercase" },
  nav: { display: "flex", flexDirection: "column", gap: 4, flex: 1 },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 12px",
    borderRadius: "var(--radius-sm)",
    textDecoration: "none",
    color: "var(--text-secondary)",
    fontSize: 14,
    fontWeight: 500,
    transition: "all 0.15s",
  },
  navActive: {
    background: "rgba(110,231,183,0.08)",
    color: "var(--accent)",
    borderLeft: "2px solid var(--accent)",
  },
  navIcon: { fontSize: 16, width: 20, textAlign: "center" },
  navLabel: { flex: 1 },
  lock: { fontSize: 11, opacity: 0.5 },
  sessionCard: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "14px 12px",
    background: "var(--bg-3)",
    borderRadius: "var(--radius-sm)",
    border: "1px solid var(--border)",
    marginTop: 16,
  },
  sessionDot: { width: 8, height: 8, borderRadius: "50%", background: "var(--accent)", flexShrink: 0 },
  sessionName: { fontSize: 13, fontWeight: 600, color: "var(--text-primary)" },
  sessionSkills: { fontSize: 11, color: "var(--text-secondary)" },
  main: { flex: 1, padding: "40px 48px", overflowY: "auto" },
};
