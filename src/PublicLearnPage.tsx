import { useEffect, useMemo, useState } from "react";
import { BookOpen, Layers3, Sparkles } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "./components/Navbar";
import RankSelector from "./components/RankSelector";
import Roadmap from "./components/Roadmap";
import Loading from "./components/Loading";
import { api } from "./lib/api";
import type { PublicBootstrap, Rank, RoadmapModule, Section } from "./types";

const pieces: Record<Rank, string> = { pawn: "♟", knight: "♞", bishop: "♝", rook: "♜", queen: "♛", king: "♚" };
const rankLabels: Record<Rank, string> = { pawn: "پیاده", knight: "اسب", bishop: "فیل", rook: "رخ", queen: "وزیر", king: "شاه" };
const sectionLabels: Record<Section, string> = { programming: "برنامه‌نویسی", algorithm: "الگوریتم", theory: "نظری" };

export default function PublicLearnPage() {
  const params = useParams();
  const nav = useNavigate();
  const section = (["programming", "algorithm", "theory"].includes(params.section || "") ? params.section : "programming") as Section;
  const rank = (["pawn", "knight", "bishop", "rook", "queen", "king"].includes(params.rank || "") ? params.rank : "pawn") as Rank;
  const [data, setData] = useState<PublicBootstrap | null>(null);
  const [error, setError] = useState("");
  useEffect(() => { api.publicBootstrap().then(setData).catch(error => setError(error.message)); }, []);
  const modules = data?.roadmap[section][rank] || [];
  const assignedLessonIds = useMemo(() => new Set(modules.flatMap(m => m.lessonIds)), [modules]);
  const unassignedLessons = useMemo(() => {
    return (data?.lessons || []).filter(l => l.section === section && l.rank === rank && !assignedLessonIds.has(l.id));
  }, [data?.lessons, section, rank, assignedLessonIds]);

  const effectiveModules = useMemo(() => {
    if (!unassignedLessons.length) return modules;
    const reviewOnly = unassignedLessons.every(l => l.status === "review");
    const extraModule: RoadmapModule = {
      id: `review-${section}-${rank}`,
      title: reviewOnly ? "درس‌های نیازمند بررسی" : "درس‌های تکمیلی این مرحله",
      description: reviewOnly ? "این درس‌ها در وضعیت بررسی هستند و برای مدیران و داوران نمایش داده می‌شوند." : "درس‌های این مرحله",
      lessonIds: unassignedLessons.map(l => l.id),
    };
    return [...modules, extraModule];
  }, [modules, unassignedLessons, section, rank]);

  const lessonMap = useMemo(() => new Map((data?.lessons || []).map(l => [l.id, l])), [data?.lessons]);
  const lessonCount = useMemo(() => effectiveModules.reduce((count, module) => count + module.lessonIds.filter((id: string) => lessonMap.has(id)).length, 0), [effectiveModules, lessonMap]);

  if (!data) return <><Navbar section={section} rank={rank} />{error ? <main className="content-frame py-12"><div className="error-note mx-auto max-w-2xl">{error}</div></main> : <Loading />}</>;

  return <div className="min-h-screen overflow-x-hidden"><div className="ambient-glow" /><Navbar section={section} rank={rank} />
    <main className="content-frame py-8 sm:py-12">
      <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .35 }} className="glass-card relative overflow-hidden rounded-[1.75rem] p-6 sm:p-9">
        <div className="absolute -left-12 -top-16 h-56 w-56 rounded-full bg-cyan-400/[.07] blur-3xl" />
        <div className="relative grid gap-7 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <div className="eyebrow"><Sparkles size={14} /> مسیر رسمی CupHead</div>
            <div className="mt-4 flex flex-wrap items-center gap-4"><span className={`chess-piece piece-${rank}`} aria-hidden="true">{pieces[rank]}</span><div><p className="text-sm font-semibold text-slate-400">مسیر {sectionLabels[section]}</p><h1 className="roadmap-title text-4xl text-white sm:text-6xl">{rankLabels[rank]}</h1></div></div>
            <p className="mt-5 max-w-2xl text-[.975rem] leading-8 text-slate-300">یک گام روشن از مسیر آمادگی المپیاد: درس‌ها را به ترتیب بخوان، تمرین کن و پیشرفت خودت را ثبت کن.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:min-w-[16rem]">
            <div className="rounded-2xl border border-slate-400/15 bg-slate-950/25 p-4"><Layers3 className="text-cyan-200" size={19} /><div className="mt-5 text-2xl font-black text-white">{effectiveModules.length}</div><div className="mt-1 text-xs text-slate-500">ماژول آموزشی</div></div>
            <div className="rounded-2xl border border-slate-400/15 bg-slate-950/25 p-4"><BookOpen className="text-cyan-200" size={19} /><div className="mt-5 text-2xl font-black text-white">{lessonCount}</div><div className="mt-1 text-xs text-slate-500">درس در این مرحله</div></div>
          </div>
        </div>
      </motion.section>
      <section className="mt-7"><div className="section-switcher">{(["programming", "algorithm", "theory"] as Section[]).map(id => <button key={id} onClick={() => nav(`/learn/${id}/${rank}`)} className={section === id ? "active" : ""}>{sectionLabels[id]}</button>)}</div><RankSelector rank={rank} onChange={next => nav(`/learn/${section}/${next}`)} /></section>
      {effectiveModules.length ? <Roadmap modules={effectiveModules} lessons={data.lessons} rank={rank} onOpen={lesson => nav(`/lesson/${lesson.slug}`)} /> : <div className="glass-card mx-auto max-w-3xl rounded-3xl p-10 text-center sm:p-16"><div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border text-3xl piece-border-${rank}`}>{pieces[rank]}</div><h2 className="mt-5 text-2xl font-black text-white">این مرحله در حال آماده‌سازی است</h2><p className="mx-auto mt-3 max-w-xl leading-7 text-slate-400">ساختار مسیر آماده است؛ محتوای {sectionLabels[section]} برای مرحله‌ی {rankLabels[rank]} به‌زودی اضافه می‌شود.</p></div>}
      <div className="submission-notices mx-auto mt-10 max-w-3xl"><li>اگر در آموزش‌ها مشکلی پیدا کردید، برای برطرف‌کردن آن به ادمین @WhoMan_H در تلگرام پیام دهید.</li></div>
    </main>
  </div>;
}
