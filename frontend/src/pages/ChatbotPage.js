import React, { useState, useRef, useEffect } from "react";
import { sendChat } from "../api";

const WELCOME = {
  role: "bot",
  text: "👋 Hey! I'm your AI Career Advisor.\n\nI can help you with career paths, skill gaps, interview prep, salary negotiation, and more.\n\nWhat's on your mind today?",
  suggestions: [
    "How do I improve my resume?",
    "What salary can I expect?",
    "How do I prepare for interviews?",
    "How do I switch careers?",
  ],
};

export default function ChatbotPage({ session }) {
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (text = input) => {
    if (!text.trim() || loading) return;
    const userMsg = { role: "user", text: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const { data } = await sendChat(
        text,
        session?.resumeId || null,
        session?.recommendations?.[0]?.title || null
      );
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: data.reply, suggestions: data.suggestions || [] },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "Sorry, I couldn't reach the server. Please try again.", suggestions: [] },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div style={s.avatarWrap}>
          <div style={s.avatar}>🤖</div>
          <div style={s.onlineDot} />
        </div>
        <div>
          <h1 style={s.title}>AI Career Advisor</h1>
          <p style={s.sub}>
            {session ? `Personalized for ${session.name}` : "Upload your resume for personalized advice"}
          </p>
        </div>
        <button
          className="btn btn-secondary"
          style={{ marginLeft: "auto" }}
          onClick={() => setMessages([WELCOME])}
        >
          🔄 New Chat
        </button>
      </div>

      {/* Messages */}
      <div style={s.chatWindow}>
        {messages.map((msg, i) => (
          <div key={i} style={{ ...s.msgRow, ...(msg.role === "user" ? s.msgRowUser : {}) }}>
            {msg.role === "bot" && <div style={s.botAvatar}>🤖</div>}
            <div style={{ maxWidth: "70%" }}>
              <div
                style={{
                  ...s.bubble,
                  ...(msg.role === "user" ? s.bubbleUser : s.bubbleBot),
                }}
              >
                {msg.text.split("\n").map((line, j) => (
                  <React.Fragment key={j}>
                    {line}
                    {j < msg.text.split("\n").length - 1 && <br />}
                  </React.Fragment>
                ))}
              </div>

              {/* Suggestion chips */}
              {msg.suggestions?.length > 0 && (
                <div style={s.suggestions}>
                  {msg.suggestions.map((sug) => (
                    <button
                      key={sug}
                      style={s.sugChip}
                      onClick={() => send(sug)}
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div style={s.msgRow}>
            <div style={s.botAvatar}>🤖</div>
            <div style={{ ...s.bubble, ...s.bubbleBot, ...s.typingBubble }}>
              <div style={s.typingDots}>
                <span /><span /><span />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={s.inputBar}>
        <textarea
          style={s.textarea}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Ask about career paths, skills, salaries, interviews…"
          rows={1}
        />
        <button
          className="btn btn-primary"
          style={s.sendBtn}
          onClick={() => send()}
          disabled={!input.trim() || loading}
        >
          ➤
        </button>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
        .typing-dots span {
          display: inline-block;
          width: 7px; height: 7px;
          background: var(--text-muted);
          border-radius: 50%;
          margin: 0 2px;
          animation: bounce 1.4s infinite ease-in-out;
        }
        .typing-dots span:nth-child(2) { animation-delay: 0.16s; }
        .typing-dots span:nth-child(3) { animation-delay: 0.32s; }
      `}</style>
    </div>
  );
}

const s = {
  page: {
    display: "flex", flexDirection: "column",
    height: "calc(100vh - 80px)",
    maxWidth: 760, margin: "0 auto",
  },
  header: {
    display: "flex", alignItems: "center", gap: 14,
    paddingBottom: 20, borderBottom: "1px solid var(--border)",
    marginBottom: 0,
  },
  avatarWrap: { position: "relative" },
  avatar: {
    width: 44, height: 44, borderRadius: "50%",
    background: "var(--bg-3)", border: "1px solid var(--border)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 22,
  },
  onlineDot: {
    position: "absolute", bottom: 2, right: 2,
    width: 10, height: 10, borderRadius: "50%",
    background: "var(--accent)",
    border: "2px solid var(--bg-2)",
  },
  title: { fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700 },
  sub: { fontSize: 12, color: "var(--text-secondary)", marginTop: 2 },
  chatWindow: {
    flex: 1, overflowY: "auto",
    padding: "24px 0", display: "flex",
    flexDirection: "column", gap: 20,
  },
  msgRow: { display: "flex", alignItems: "flex-start", gap: 12 },
  msgRowUser: { flexDirection: "row-reverse" },
  botAvatar: {
    width: 32, height: 32, borderRadius: "50%",
    background: "var(--bg-3)", border: "1px solid var(--border)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 16, flexShrink: 0,
  },
  bubble: {
    padding: "12px 16px",
    borderRadius: 14,
    fontSize: 14,
    lineHeight: 1.65,
    whiteSpace: "pre-wrap",
  },
  bubbleBot: {
    background: "var(--bg-2)",
    border: "1px solid var(--border)",
    color: "var(--text-primary)",
    borderTopLeftRadius: 4,
  },
  bubbleUser: {
    background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%)",
    color: "#0a0b0f",
    fontWeight: 500,
    borderTopRightRadius: 4,
  },
  typingBubble: { padding: "14px 18px" },
  typingDots: { display: "flex", alignItems: "center" },
  suggestions: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 },
  sugChip: {
    background: "var(--bg-3)",
    border: "1px solid var(--border-hover)",
    borderRadius: 50,
    color: "var(--accent)",
    fontSize: 12,
    padding: "5px 14px",
    cursor: "pointer",
    transition: "all 0.15s",
    fontFamily: "var(--font-body)",
  },
  inputBar: {
    display: "flex", gap: 12, alignItems: "flex-end",
    padding: "16px 0", borderTop: "1px solid var(--border)",
  },
  textarea: {
    flex: 1, background: "var(--bg-2)",
    border: "1px solid var(--border-hover)",
    borderRadius: "var(--radius)",
    color: "var(--text-primary)",
    padding: "12px 16px", fontSize: 14,
    fontFamily: "var(--font-body)",
    resize: "none", outline: "none", lineHeight: 1.5,
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: "50%",
    padding: 0, justifyContent: "center", fontSize: 18,
  },
};
