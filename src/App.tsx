import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
const HomePage = lazy(() => import("./HomePage"));
const PublicLearnPage = lazy(() => import("./PublicLearnPage"));
const LessonPage = lazy(() => import("./LessonPage"));
const ProblemsetPage = lazy(() => import("./ProblemsetPage"));
const ProblemPage = lazy(() => import("./ProblemPage"));
const AuthPage = lazy(() => import("./AuthPage"));
const ProfilePage = lazy(() => import("./ProfilePage"));
const AdminApp = lazy(() => import("./admin/AdminApp"));
const ScoreboardPage = lazy(() => import("./ScoreboardPage"));
const SubmitProblemPage = lazy(() => import("./SubmitProblemPage"));
const ContactPage = lazy(() => import("./ContactPage"));
const CollectionsPage = lazy(() => import("./CollectionsPage"));
const CollectionPage = lazy(() => import("./CollectionPage"));

export default function App() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen grid place-items-center text-slate-400">
          در حال بارگذاری…
        </div>
      }
    >
      <Routes>
        <Route path="/" element={<HomePage />} />
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
    </Suspense>
  );
}
