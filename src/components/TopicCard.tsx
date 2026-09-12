import { useEffect, useState, type MouseEvent } from "react";
import { Check, ChevronLeft } from "lucide-react";
import type { Lesson, Rank } from "../types";

export default function TopicCard({ lesson, rank, onOpen }: { lesson: Lesson; rank: Rank; onOpen: () => void }) {
  const key = `cuphead_progress_${lesson.id}`;
  const [done, setDone] = useState(false);
  useEffect(() => setDone(localStorage.getItem(key) === "true"), [key]);
  function toggle(event: MouseEvent) { event.stopPropagation(); const next = !done; setDone(next); localStorage.setItem(key, String(next)); }
  const glow = `piece-hover-${rank}`;

  return <article className={`glass-card group relative flex items-start gap-4 overflow-hidden rounded-2xl p-5 transition-all duration-200 ${glow}`}>
    <button onClick={onOpen} className="absolute inset-0 z-0 rounded-2xl" aria-label={`باز کردن درس ${lesson.title}`} />
    <button onClick={toggle} className={`relative z-10 mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition ${done ? "border-cyan-300/60 bg-cyan-400 text-slate-950 shadow-[0_0_16px_rgba(103,232,249,.28)]" : "border-slate-600/70 bg-slate-950/30 text-transparent hover:border-cyan-300/70"}`} aria-label={done ? "حذف نشان تکمیل درس" : "نشانه‌گذاری درس به عنوان تکمیل‌شده"} aria-pressed={done}><Check size={15} strokeWidth={3} /></button>
    <div className="relative z-10 min-w-0 flex-1 pointer-events-none"><div className="flex flex-wrap items-center gap-2"><h3 className="font-bold text-slate-100">{lesson.title}</h3>{lesson.status === "review" && <span className="meta-chip !border-amber-400/30 !text-amber-200">نیازمند بررسی</span>}</div><p dir="rtl" className="mt-2 text-sm leading-6 text-slate-400 [unicode-bidi:plaintext]">{lesson.summary}</p></div>
    <ChevronLeft className="relative z-10 mt-1 text-slate-600 transition group-hover:text-cyan-200" size={19} aria-hidden="true" />
  </article>;
}
