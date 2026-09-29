import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Layout from "./components/Layout";

import Setup from "./pages/Setup";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ExamList from "./pages/ExamList";
import ModeSelect from "./pages/ModeSelect";
import Prepare from "./pages/Prepare";
import Exam from "./pages/Exam";
import Result from "./pages/Result";
import Progress from "./pages/Progress";
import Report from "./pages/Report";
import VoiceCheck from "./pages/VoiceCheck";

function App() {
  return (
    <Routes>
      {/* Start Udaan with accessibility setup */}
      <Route
        path="/"
        element={<Navigate to="/setup" replace />}
      />

      {/*
        Setup and Login intentionally stay outside the main
        student Layout.

        In particular, Login should never use voice input
        for entering passwords.
      */}
      <Route path="/setup" element={<Setup />} />

      <Route path="/login" element={<Login />} />

      {/*
        All logged-in student pages share Layout.

        Layout provides:
        - Skip to main content
        - Voice status
        - Help dialog
        - Accessible focus after navigation
      */}
      <Route element={<Layout />}>
        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/exams"
          element={<ExamList />}
        />

        <Route
          path="/mode/:examId"
          element={<ModeSelect />}
        />

        <Route
          path="/prepare/:examId"
          element={<Prepare />}
        />

        <Route
          path="/exam/:examId"
          element={<Exam />}
        />

        <Route
          path="/result"
          element={<Result />}
        />

        <Route
          path="/progress"
          element={<Progress />}
        />

        <Route
          path="/report"
          element={<Report />}
        />

        <Route
          path="/voice-check"
          element={<VoiceCheck />}
        />
      </Route>
    </Routes>
  );
}

export default App;