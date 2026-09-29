import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

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
      <Route path="/" element={<Navigate to="/setup" replace />} />

      <Route path="/setup" element={<Setup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/exams" element={<ExamList />} />

      <Route path="/mode/:examId" element={<ModeSelect />} />
      <Route path="/prepare/:examId" element={<Prepare />} />
      <Route path="/exam/:examId" element={<Exam />} />

      <Route path="/result" element={<Result />} />
      <Route path="/progress" element={<Progress />} />
      <Route path="/report" element={<Report />} />
      <Route path="/voice-check" element={<VoiceCheck />} />
    </Routes>
  );
}

export default App;