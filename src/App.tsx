import { Navigate, Route, Routes } from "react-router-dom";
import PublicLearnPage from "./PublicLearnPage";
import LessonPage from "./LessonPage";
import ProblemsetPage from "./ProblemsetPage";
import ProblemPage from "./ProblemPage";
import AuthPage from "./AuthPage";
import ProfilePage from "./ProfilePage";
import AdminApp from "./admin/AdminApp";
import ScoreboardPage from "./ScoreboardPage";
import SubmitProblemPage from "./SubmitProblemPage";
import ContactPage from "./ContactPage";
import CollectionsPage from "./CollectionsPage";
import CollectionPage from "./CollectionPage";
export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to="/learn/programming/pawn" replace />}
      />
      <Route path="/learn/:section/:rank" element={<PublicLearnPage />} />
      <Route path="/lesson/:slug" element={<LessonPage />} />
      <Route path="/problems" element={<ProblemsetPage />} />
      <Route path="/problem/:source/:identifier" element={<ProblemPage />} />
      <Route path="/problem/:slug" element={<ProblemPage />} />
      <Route path="/scoreboard" element={<ScoreboardPage />} />
      <Route path="/submit-problem" element={<SubmitProblemPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/collections" element={<CollectionsPage />} />
      <Route path="/collections/:slug" element={<CollectionPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/admin/*" element={<AdminApp />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
