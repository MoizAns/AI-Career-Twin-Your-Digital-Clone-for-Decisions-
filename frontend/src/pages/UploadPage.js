import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import { uploadResume, getRecommendations } from "../api";

export default function UploadPage({ setSession }) {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback((accepted) => {
    setError("");
    if (accepted[0]) setFile(accepted[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
  });

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    setProgress(20);

    try {
      const { data: resumeData } = await uploadResume(file);
      setProgress(60);

      const { data: recData } = await getRecommendations(
        resumeData.resume_id
      );
      setProgress(100);

      setSession({
        resumeId: resumeData.resume_id,
        name: resumeData.name || "Candidate",
        email: resumeData.email || "",
        skills: resumeData.skills,
        recommendations: recData.recommendations,
      });

      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Upload failed. Please check that your file is a valid PDF."
      );
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  return (
    <div style={s.page} className="fade-up">
      {/* Hero */}
      <div style={s.hero}>
        <div style={s.tag} className="badge badge-green">
          Beta · Free
        </div>

        <h1 style={s.title}>
          Your AI <br />
          <span style={s.titleAccent}>Career Twin</span>
        </h1>

        <p style={s.subtitle}>
          Upload your resume and unlock AI-powered career insights —
          skill gaps, job probabilities, salary projections, and more.
        </p>

        <div style={s.features}>
          {[
            ["🧠", "NLP Skill Extraction"],
            ["🎯", "Career Matching"],
            ["📊", "Gap Analysis"],
            ["🚀", "Outcome Simulation"],
            ["🤖", "AI Advisor"],
          ].map(([icon, label]) => (
            <div key={label} style={s.feature}>
              <span>{icon}</span> {label}
            </div>
          ))}
        </div>
      </div>

      {/* Upload Card */}
      <div className="card" style={s.uploadCard}>
        <div style={s.cardTitle}>Upload Your Resume</div>
        <div style={s.cardSub}>PDF format · Max 5 MB</div>

        {/* Dropzone */}
        <div
          {...getRootProps()}
          style={{
            ...s.dropzone,
            ...(isDragActive ? s.dropzoneActive : {}),
            ...(file ? s.dropzoneFilled : {}),
          }}
        >
          <input {...getInputProps()} />

          {file ? (
            <div style={s.filePreview}>
              <div style={s.fileIcon}>📄</div>
              <div>
                <div style={s.fileName}>{file.name}</div>
                <div style={s.fileSize}>
                  {(file.size / 1024).toFixed(1)} KB · Ready to analyze
                </div>
              </div>

              <button
                style={s.removeBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                }}
              >
                ✕
              </button>
            </div>
          ) : (
            <div style={s.dropPlaceholder}>
              <div style={s.dropIcon}>⬆️</div>
              <div style={s.dropText}>
                {isDragActive
                  ? "Drop it here!"
                  : "Drag & drop your PDF here"}
              </div>
              <div style={s.dropOr}>or</div>
              <div style={s.dropBrowse}>Browse files</div>
            </div>
          )}
        </div>

        {/* Progress */}
        {loading && (
          <div style={{ marginBottom: 16 }}>
            <div style={s.progressLabel}>
              {progress < 60
                ? "📖 Parsing resume…"
                : "🎯 Generating recommendations…"}
            </div>

            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {error && <div className="alert alert-error">{error}</div>}

        <button
          className="btn btn-primary"
          style={s.button}
          onClick={handleUpload}
          disabled={!file || loading}
        >
          {loading ? (
            <>
              <span
                className="spinner"
                style={{ width: 18, height: 18, borderWidth: 2 }}
              />
              Analyzing…
            </>
          ) : (
            <>Analyze My Resume →</>
          )}
        </button>

        <p style={s.disclaimer}>
          Your resume is processed locally and never stored beyond this
          session.
        </p>
      </div>
    </div>
  );
}

const s = {
  page: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 32,
    alignItems: "center",
    minHeight: "80vh",
    padding: "20px",
  },

  hero: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },

  tag: { alignSelf: "flex-start" },

  title: {
    fontFamily: "var(--font-display)",
    fontSize: "clamp(32px, 6vw, 58px)",
    fontWeight: 800,
    lineHeight: 1.1,
    color: "var(--text-primary)",
  },

  titleAccent: {
    background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    
  },

  subtitle: {
    fontSize: "clamp(14px, 2.5vw, 16px)",
    color: "var(--text-secondary)",
    lineHeight: 1.6,
    maxWidth: 500,
  },

  features: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
  },

  feature: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 12px",
    background: "var(--bg-2)",
    border: "1px solid var(--border)",
    borderRadius: 50,
    fontSize: 12,
  },

  uploadCard: {
    display: "flex",
    flexDirection: "column",
    gap: 18,
  },

  cardTitle: {
    fontFamily: "var(--font-display)",
    fontSize: 18,
    fontWeight: 700,
  },

  cardSub: {
    fontSize: 12,
    color: "var(--text-muted)",
    marginTop: -10,
  },

  dropzone: {
    border: "2px dashed var(--border-hover)",
    borderRadius: "var(--radius)",
    padding: "24px 16px",
    cursor: "pointer",
    textAlign: "center",
  },

  dropzoneActive: {
    borderColor: "var(--accent)",
  },

  dropzoneFilled: {
    borderColor: "rgba(110,231,183,0.4)",
    borderStyle: "solid",
  },

  dropPlaceholder: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
  },

  dropIcon: { fontSize: 28 },

  dropText: {
    fontSize: 14,
    color: "var(--text-secondary)",
  },

  dropOr: {
    fontSize: 12,
    color: "var(--text-muted)",
  },

  dropBrowse: {
    fontSize: 12,
    fontWeight: 600,
    color: "var(--accent)",
  },

  filePreview: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    textAlign: "left",
  },

  fileIcon: { fontSize: 28 },

  fileName: {
    fontSize: 13,
    fontWeight: 600,
  },

  fileSize: {
    fontSize: 11,
    color: "var(--accent)",
  },

  removeBtn: {
    marginLeft: "auto",
    background: "none",
    border: "none",
    cursor: "pointer",
  },

  progressLabel: {
    fontSize: 12,
    marginBottom: 6,
  },

  button: {
    width: "100%",
    justifyContent: "center",
    fontSize: 14,
    padding: "12px",
  },

  disclaimer: {
    fontSize: 11,
    textAlign: "center",
    color: "var(--text-muted)",
  },
};

/* MEDIA QUERY (Desktop Layout) */
if (typeof window !== "undefined") {
  const style = document.createElement("style");
  style.innerHTML = `
    @media (min-width: 900px) {
      .fade-up {
        display: grid;
        grid-template-columns: 1fr 420px !important;
        gap: 48px !important;
      }
    }
  `;
  document.head.appendChild(style);
}