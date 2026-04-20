import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import UploadPage from "./pages/UploadPage";
import DashboardPage from "./pages/DashboardPage";
import GapAnalysisPage from "./pages/GapAnalysisPage";
import SimulationPage from "./pages/SimulationPage";
import ChatbotPage from "./pages/ChatbotPage";
import "./styles/global.css";

export default function App() {
  const [session, setSession] = useState(null);
  // session: { resumeId, skills, name, email, recommendations }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout session={session} />}>
          <Route index element={<UploadPage setSession={setSession} />} />
          <Route
            path="dashboard"
            element={
              session ? (
                <DashboardPage session={session} />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="gap-analysis"
            element={
              session ? (
                <GapAnalysisPage session={session} />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="simulation"
            element={
              session ? (
                <SimulationPage session={session} />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="chatbot"
            element={<ChatbotPage session={session} />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
