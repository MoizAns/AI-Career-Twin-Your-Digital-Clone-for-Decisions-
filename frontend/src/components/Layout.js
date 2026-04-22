import React, { useState, useEffect, useRef } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";

const NAV = [
  { to: "/",            label: "Upload",      icon: "⬆️", exact: true },
  { to: "/dashboard",  label: "Skills & Recs",icon: "🎯" },
  { to: "/gap-analysis",label: "Gap Analysis", icon: "📊" },
  { to: "/simulation", label: "Simulation",   icon: "🚀" },
  { to: "/chatbot",    label: "AI Advisor",   icon: "🤖" },
];

/* ─── breakpoint hook ─────────────────────────────────────────────── */
function useIsMobile(bp = 768) {
  const [mobile, setMobile] = useState(() => window.innerWidth < bp);
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth < bp);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, [bp]);
  return mobile;
}

/* ─── Main Layout ─────────────────────────────────────────────────── */
export default function Layout({ session }) {
  const loc      = useLocation();
  const isMobile = useIsMobile();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerRef = useRef(null);

  /* Close drawer on route change */
  useEffect(() => { setDrawerOpen(false); }, [loc.pathname]);

  /* Lock body scroll while drawer is open */
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  /* Close drawer on outside click (focus trap safety net) */
  useEffect(() => {
    if (!drawerOpen) return;
    const handler = (e) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target)) {
        setDrawerOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [drawerOpen]);

  return (
    <>
      {/* ── inject global responsive CSS ─────────────────────── */}
      <style>{GLOBAL_CSS}</style>

      <div className={`layout-shell ${isMobile ? "layout-mobile" : "layout-desktop"}`}>

        {/* ══════════════════════════════════════════════════════
            DESKTOP — persistent left sidebar
        ══════════════════════════════════════════════════════ */}
        {!isMobile && (
          <aside className="sidebar-desktop">
            <SidebarInner session={session} />
          </aside>
        )}

        {/* ══════════════════════════════════════════════════════
            MOBILE — sticky top bar
        ══════════════════════════════════════════════════════ */}
        {isMobile && (
          <header className="mobile-topbar">
            <div className="topbar-left">
              <span className="topbar-icon">⚡</span>
              <div>
                <div className="topbar-name">Career Twin</div>
                <div className="topbar-sub">AI-POWERED</div>
              </div>
            </div>

            <button
              className="hamburger-btn"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open navigation"
              aria-expanded={drawerOpen}
            >
              <span className="ham-line" />
              <span className="ham-line" />
              <span className="ham-line" />
            </button>
          </header>
        )}

        {/* ══════════════════════════════════════════════════════
            MOBILE — drawer + backdrop
        ══════════════════════════════════════════════════════ */}
        {isMobile && (
          <>
            {/* Backdrop — clicking it closes the drawer */}
            <div
              className={`drawer-backdrop ${drawerOpen ? "backdrop-visible" : ""}`}
              onClick={() => setDrawerOpen(false)}
              aria-hidden="true"
            />

            {/* Drawer */}
            <aside
              ref={drawerRef}
              className={`sidebar-drawer ${drawerOpen ? "drawer-open" : "drawer-closed"}`}
              aria-label="Navigation drawer"
            >
              {/* Drawer top: logo + close button */}
              <div className="drawer-toprow">
                <div className="drawer-logo">
                  <span style={{ fontSize: 24 }}>⚡</span>
                  <div>
                    <div className="topbar-name">Career Twin</div>
                    <div className="topbar-sub">AI-POWERED</div>
                  </div>
                </div>
                <button
                  className="close-btn"
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Close navigation"
                >
                  ✕
                </button>
              </div>

              <SidebarInner session={session} onNavClick={() => setDrawerOpen(false)} />
            </aside>
          </>
        )}

        {/* ══════════════════════════════════════════════════════
            MAIN CONTENT
        ══════════════════════════════════════════════════════ */}
        <main className={`main-content ${isMobile ? "main-mobile" : "main-desktop"}`}>
          <Outlet />
        </main>

        {/* ══════════════════════════════════════════════════════
            MOBILE — fixed bottom tab bar
        ══════════════════════════════════════════════════════ */}
        {isMobile && (
          <nav className="bottom-tabbar" aria-label="Main navigation">
            {NAV.map(({ to, label, icon, exact }) => {
              const active = exact
                ? loc.pathname === to
                : loc.pathname.startsWith(to);
              const locked = to !== "/" && to !== "/chatbot" && !session;

              return (
                <NavLink
                  key={to}
                  to={locked ? "/" : to}
                  onClick={(e) => locked && e.preventDefault()}
                  className={`tab-item ${active ? "tab-active" : ""} ${locked ? "tab-locked" : ""}`}
                  aria-label={label}
                >
                  <span className="tab-icon">{icon}</span>
                  <span className="tab-label">{label}</span>
                  {locked && <span className="tab-lock-dot" aria-hidden="true" />}
                </NavLink>
              );
            })}
          </nav>
        )}
      </div>
    </>
  );
}

/* ─── Sidebar inner content (shared by desktop sidebar + mobile drawer) */
function SidebarInner({ session, onNavClick }) {
  const loc = useLocation();

  return (
    <div className="sidebar-inner">
      {/* Desktop-only logo (drawer has its own logo row) */}
      <div className="sidebar-logo desktop-only-logo">
        <span style={{ fontSize: 26 }}>⚡</span>
        <div>
          <div className="sidebar-logo-text">Career Twin</div>
          <div className="sidebar-logo-sub">AI-POWERED</div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="sidebar-nav" aria-label="Sidebar navigation">
        {NAV.map(({ to, label, icon, exact }) => {
          const active = exact
            ? loc.pathname === to
            : loc.pathname.startsWith(to);
          const locked = to !== "/" && to !== "/chatbot" && !session;

          return (
            <NavLink
              key={to}
              to={locked ? "/" : to}
              className={`sidebar-link ${active ? "sidebar-link-active" : ""}`}
              onClick={(e) => {
                if (locked) e.preventDefault();
                onNavClick?.();
              }}
            >
              <span className="sidebar-icon">{icon}</span>
              <span className="sidebar-label">{label}</span>
              {locked && <span className="sidebar-lock" aria-label="Locked">🔒</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Session card */}
      {session && (
        <div className="session-card">
          <div className="session-dot" aria-hidden="true" />
          <div className="session-text">
            <div className="session-name">{session.name}</div>
            <div className="session-skills">{session.skills?.length} skills found</div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── All styles as a CSS string so media queries work properly ────── */
const GLOBAL_CSS = `

/* ── Reset & tokens ──────────────────────────────────────────────── */
*, *::before, *::after {
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}
html, body {
  overflow-x: hidden;
  max-width: 100vw;
}

/* ── Shell ───────────────────────────────────────────────────────── */
.layout-shell {
  background: var(--bg);
  min-height: 100vh;
}

/* Desktop: sidebar + main side by side */
.layout-desktop {
  display: flex;
  flex-direction: row;
}

/* Mobile: column (topbar / main / bottombar stacked) */
.layout-mobile {
  display: flex;
  flex-direction: column;
}

/* ── Desktop sidebar ─────────────────────────────────────────────── */
.sidebar-desktop {
  width: 240px;
  flex-shrink: 0;
  background: var(--bg-2);
  border-right: 1px solid var(--border);
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
}

/* ── Shared sidebar inner ────────────────────────────────────────── */
.sidebar-inner {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 22px 16px;
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-bottom: 28px;
}

.sidebar-logo-text {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 17px;
  color: var(--text-primary);
  line-height: 1.1;
}

.sidebar-logo-sub {
  font-size: 9px;
  color: var(--accent);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-top: 2px;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 3px;
  flex: 1;
}

.sidebar-link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  text-decoration: none;
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
  transition: background 0.15s, color 0.15s;
  border-left: 2px solid transparent;
}

.sidebar-link:hover {
  background: rgba(255,255,255,0.04);
  color: var(--text-primary);
}

.sidebar-link-active {
  background: rgba(110,231,183,0.08) !important;
  color: var(--accent) !important;
  border-left-color: var(--accent) !important;
}

.sidebar-icon {
  font-size: 16px;
  width: 22px;
  text-align: center;
  flex-shrink: 0;
}

.sidebar-label { flex: 1; }

.sidebar-lock {
  font-size: 11px;
  opacity: 0.45;
}

/* ── Session card ────────────────────────────────────────────────── */
.session-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: var(--bg-3);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  margin-top: 16px;
  min-width: 0;
}

.session-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent);
  flex-shrink: 0;
}

.session-text { min-width: 0; }

.session-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.session-skills {
  font-size: 11px;
  color: var(--text-secondary);
}

/* ── Main content ────────────────────────────────────────────────── */
.main-desktop {
  flex: 1;
  min-width: 0;
  padding: 40px 48px;
  overflow-y: auto;
}

.main-mobile {
  flex: 1;
  width: 100%;
  min-width: 0;
  padding: 18px 16px;
  padding-bottom: 86px; /* space above bottom tab bar */
  margin-top: 56px;     /* space below sticky top bar */
  overflow-y: auto;
}

/* ── Mobile top bar ──────────────────────────────────────────────── */
.mobile-topbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 56px;
  background: var(--bg-2);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  z-index: 500;
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.topbar-icon { font-size: 22px; }

.topbar-name {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 15px;
  color: var(--text-primary);
  line-height: 1.1;
}

.topbar-sub {
  font-size: 8px;
  color: var(--accent);
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

/* ── Hamburger button ────────────────────────────────────────────── */
.hamburger-btn {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  padding: 8px 10px;
  background: none;
  border: 1px solid var(--border);
  border-radius: 8px;
  cursor: pointer;
}

.ham-line {
  display: block;
  width: 20px;
  height: 2px;
  background: var(--text-primary);
  border-radius: 2px;
}

/* ── Drawer backdrop ─────────────────────────────────────────────── */
.drawer-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0);
  z-index: 600;
  pointer-events: none;
  transition: background 0.25s ease;
}

.backdrop-visible {
  background: rgba(0, 0, 0, 0.6);
  pointer-events: auto;
  backdrop-filter: blur(3px);
}

/* ── Drawer panel ────────────────────────────────────────────────── */
.sidebar-drawer {
  position: fixed;
  top: 0;
  left: 0;
  width: 78vw;
  max-width: 300px;
  height: 100dvh;
  background: var(--bg-2);
  border-right: 1px solid var(--border);
  z-index: 700;
  overflow-y: auto;
  transform: translateX(-100%);      /* HIDDEN by default */
  transition: transform 0.25s ease;
  will-change: transform;
}

.drawer-open {
  transform: translateX(0);          /* VISIBLE when open */
}

.drawer-closed {
  transform: translateX(-100%);      /* HIDDEN when closed */
}

.drawer-toprow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 16px 12px;
  border-bottom: 1px solid var(--border);
  margin-bottom: 8px;
}

.drawer-logo {
  display: flex;
  align-items: center;
  gap: 8px;
}

.close-btn {
  width: 36px;
  height: 36px;
  background: var(--bg-3);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text-secondary);
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.15s;
}

.close-btn:hover {
  background: var(--border);
  color: var(--text-primary);
}

/* Hide desktop logo inside drawer (drawer has its own logo row) */
.sidebar-drawer .desktop-only-logo {
  display: none !important;
}

/* ── Bottom tab bar ──────────────────────────────────────────────── */
.bottom-tabbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  background: var(--bg-2);
  border-top: 1px solid var(--border);
  z-index: 500;
  /* iPhone home indicator safe area */
  padding-bottom: env(safe-area-inset-bottom, 0px);
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  padding: 7px 2px;
  min-height: 54px;
  text-decoration: none;
  color: var(--text-muted);
  font-size: 9px;
  font-weight: 500;
  transition: color 0.15s;
  position: relative;
}

.tab-active {
  color: var(--accent);
}

/* Green indicator line at top of active tab */
.tab-active::before {
  content: "";
  position: absolute;
  top: 0;
  left: 20%;
  right: 20%;
  height: 2px;
  background: var(--accent);
  border-radius: 0 0 3px 3px;
}

.tab-locked {
  opacity: 0.5;
}

.tab-icon  { font-size: 19px; line-height: 1; }
.tab-label { font-size: 9px; letter-spacing: 0.02em; }

/* Small red dot on locked tabs */
.tab-lock-dot {
  position: absolute;
  top: 7px;
  right: calc(50% - 14px);
  width: 6px;
  height: 6px;
  background: var(--accent-danger, #f87171);
  border-radius: 50%;
}

/* ── Responsive content inside pages ────────────────────────────── */

/* Cards shrink padding on mobile */
@media (max-width: 767px) {
  .card { padding: 16px !important; }
  .section-title { font-size: 17px !important; }
  .section-sub   { font-size: 12px !important; margin-bottom: 14px !important; }
  .btn { font-size: 13px; padding: 9px 16px; }
  .badge { font-size: 11px; padding: 3px 10px; }
  .skill-pill { font-size: 11px; padding: 3px 10px; }
}

/* Prevent overflow on narrow screens */
@media (max-width: 480px) {
  .main-mobile {
    padding-left: 12px;
    padding-right: 12px;
  }
}

/* Drawer slide-in keyframe (used by .drawer-open) */
@keyframes slideInLeft {
  from { transform: translateX(-100%); }
  to   { transform: translateX(0); }
}

/* Safe area support (iPhone notch / Dynamic Island) */
@supports (height: 100dvh) {
  .sidebar-drawer { height: 100dvh; }
}
`;