import { useEffect, useMemo, useState } from "react";
import { Check, ChevronLeft, Filter, HeartHandshake, Search, Send, SlidersHorizontal, Tag, Users } from "lucide-react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Loading from "./components/Loading";
import { api } from "./lib/api";
import type { Problem, ProblemSource, PublicBootstrap } from "./types";

export const codeforcesTags = ["2-sat", "binary search", "bitmasks", "brute force", "chinese remainder theorem", "combinatorics", "constructive algorithms", "data structures", "dfs and similar", "divide and conquer", "dp", "dsu", "expression parsing", "fft", "flows", "games", "geometry", "graph matchings", "graphs", "greedy", "hashing", "implementation", "interactive", "math", "matrices", "meet-in-the-middle", "number theory", "probabilities", "schedules", "shortest paths", "sortings", "string suffix structures", "strings", "ternary search", "trees", "two pointers"];

function secondaryValues(problems: Problem[], source: ProblemSource | null) {
  if (!source) return [];
  const own = problems.filter(problem => problem.source.id === source.id);
  if (source.slug === "codeforces") return [...new Set(own.map(problem => problem.rating).filter((value): value is number => value !== null))].sort((a, b) => a - b).map(String);
  if (source.slug === "usaco") return [...new Set(own.map(problem => problem.sourceMeta?.usacoLevel).filter(Boolean))] as string[];
  if (source.slug === "coci") return [...new Set(own.map(problem => problem.sourceMeta?.contestYear).filter(Boolean))].sort().reverse().map(String);
  if (source.slug === "cses") return [...new Set(own.map(problem => problem.sourceMeta?.csesTopic).filter(Boolean))] as string[];
  return [];
}
function secondaryLabel(slug?: string) { return slug === "codeforces" ? "ریت Codeforces" : slug === "usaco" ? "مدال USACO" : slug === "coci" ? "سال مسابقه COCI" : slug === "cses" ? "موضوع CSES" : ""; }
function sourceInfo(problem: Problem) { return problem.source.slug === "codeforces" && problem.rating !== null ? String(problem.rating) : problem.source.slug === "usaco" ? problem.sourceMeta?.usacoLevel : problem.source.slug === "coci" ? problem.sourceMeta?.contestYear : problem.source.slug === "cses" ? problem.sourceMeta?.csesTopic : ""; }

export default function ProblemsetPage() {
  const nav = useNavigate();
  const [data, setData] = useState<PublicBootstrap | null>(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [source, setSource] = useState("all");
  const [tag, setTag] = useState("all");
  const [secondary, setSecondary] = useState("all");
  const [status, setStatus] = useState<"all" | "solved">("all");
  useEffect(() => { api.publicBootstrap().then(setData).catch(error => setError(error.message)); }, []);
  const problems = data?.problems || [];
  const sourceObject = data?.sources.find(item => item.id === source) || null;
  const values = secondaryValues(problems, sourceObject);
  useEffect(() => setSecondary("all"), [source]);
  const filtered = useMemo(() => problems.filter(problem => {
    const searched = !query || `${problem.name} ${problem.tags?.join(" ")} ${problem.externalId}`.toLowerCase().includes(query.toLowerCase());
    const sourceMatch = source === "all" || problem.source.id === source;
    const tagMatch = tag === "all" || problem.tags?.includes(tag);
    const secondaryMatch = secondary === "all" || (problem.source.slug === "codeforces" ? String(problem.rating) === secondary : problem.source.slug === "usaco" ? problem.sourceMeta?.usacoLevel === secondary : problem.source.slug === "coci" ? String(problem.sourceMeta?.contestYear) === secondary : problem.source.slug === "cses" ? problem.sourceMeta?.csesTopic === secondary : false);
    const statusMatch = status === "all" || problem.solved;
    return searched && sourceMatch && tagMatch && secondaryMatch && statusMatch;
  }), [problems, query, source, tag, secondary, status]);

  if (!data) return <><Navbar /><main className="content-frame py-12">{error ? <div className="error-note mx-auto max-w-2xl">{error}</div> : <Loading />}</main></>;
  return <div className="min-h-screen"><div className="ambient-glow" /><Navbar />
    <main className="content-frame py-8 sm:py-12">
      <header className="page-intro"><div><div className="eyebrow"><SlidersHorizontal size={14} /> مسئله‌نامه‌ی CupHead</div><h1>مسئله‌نامه</h1><p>مسئله‌ها را با منبع، تگ و مشخصات اختصاصی همان منبع پیدا کن؛ فیلترها به داده‌ی واقعی هر منبع وابسته‌اند.</p></div><div className="flex items-center gap-3"><button onClick={() => nav("/submit-problem")} className="btn-primary"><Send size={16} /> پیشنهاد مسئله</button><div className="stat-orb"><span>{filtered.length}</span><small>نتیجه</small></div></div></header>

      {/* Community Contribution Note */}
      <div className="glass-card mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-cyan-500/20 bg-gradient-to-r from-cyan-950/40 via-slate-900/60 to-slate-900/40 p-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
            <HeartHandshake size={18} />
          </div>
          <div>
            <div className="font-bold text-slate-200">این کتابخانه با همراهی و مشارکت شما ساخته می‌شود</div>
            <div className="text-slate-400 mt-0.5">
              بخش قابل‌توجهی از مسائل، ترجمه‌ها و راهنمایی‌های چندلایه (Hints) با کمک کاربران المپیادی گردآوری شده است. می‌توانید با ارسال مسئله یا ثبت هینت جدید به تکمیل آن کمک کنید.
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link to="/submit-problem" className="rounded-xl bg-cyan-500/15 border border-cyan-500/30 px-3 py-1.5 font-bold text-cyan-200 hover:bg-cyan-500/25 transition">
            پیشنهاد مسئله
          </Link>
          <Link to="/contact" className="rounded-xl bg-slate-800/80 border border-slate-700 px-3 py-1.5 font-semibold text-slate-300 hover:bg-slate-800 transition">
            همکاری در هینت و ترجمه
          </Link>
        </div>
      </div>
      <section className="glass-card rounded-3xl p-4 sm:p-5" aria-label="فیلتر مسئله‌ها"><div className="flex items-center gap-2 text-sm font-bold text-slate-200"><Filter size={16} className="text-cyan-200" /> فیلتر و جست‌وجو</div><div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_11rem_13rem_12rem]"><label className="relative"><Search className="absolute start-3 top-3.5 text-slate-500" size={18} /><input className="input-ui !ps-10" value={query} onChange={event => setQuery(event.target.value)} placeholder="نام، تگ یا شناسه‌ی مسئله..." /></label><select className="input-ui" value={source} onChange={event => setSource(event.target.value)}><option value="all">همه‌ی منابع</option>{data.sources.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select><select className="input-ui" value={tag} onChange={event => setTag(event.target.value)}><option value="all">همه‌ی تگ‌های Codeforces</option>{codeforcesTags.map(item => <option key={item}>{item}</option>)}</select>{sourceObject && values.length > 0 ? <select className="input-ui" value={secondary} onChange={event => setSecondary(event.target.value)}><option value="all">همه‌ی {secondaryLabel(sourceObject.slug)}</option>{values.map(value => <option key={value}>{value}</option>)}</select> : <div className="hidden lg:block" />}</div><div className="mt-4 flex flex-wrap gap-2 border-t border-slate-400/10 pt-4"><button onClick={() => setStatus(current => current === "all" ? "solved" : "all")} className={`filter-chip ${status === "solved" ? "active" : ""}`}>{status === "solved" ? <><Check size={14} /> فقط حل‌شده‌ها</> : "همه‌ی وضعیت‌ها"}</button>{source !== "all" && <button onClick={() => { setSource("all"); setTag("all"); }} className="filter-chip">پاک‌کردن فیلتر منبع</button>}</div></section>
      <section className="problemset-shell mt-6"><div className="problemset-header"><span>مسئله</span><span>تگ‌ها</span><span>مشخصات</span><span>وضعیت</span><span /></div><div className="problemset-list">{filtered.map((problem, index) => <ProblemRow key={problem.id} problem={problem} delay={index} onOpen={() => nav(`/problem/${encodeURIComponent(problem.source.slug)}/${encodeURIComponent(problem.urlKey || problem.slug)}`)} />)}</div></section>
      {!filtered.length && <div className="glass-card mt-6 rounded-3xl p-12 text-center text-slate-400">مسئله‌ای با این فیلترها پیدا نشد.</div>}
    </main>
  </div>;
}

function ProblemRow({ problem, onOpen, delay }: { problem: Problem; onOpen: () => void; delay: number }) {
  const info = sourceInfo(problem);
  return <motion.button type="button" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(delay * .022, .18) }} onClick={onOpen} className="problem-row group"><div className="problem-main"><div className="min-w-0"><div className="flex items-center gap-2 text-xs text-slate-500"><span dir="ltr">{problem.externalId || "—"}</span><span className="source-dot" style={{ background: problem.source.color, color: problem.source.color }} /><span>{problem.source.name}</span></div><h2 className="mt-1 truncate text-[.975rem] font-bold text-slate-100 transition group-hover:text-cyan-100">{problem.name}</h2></div></div><div className="problem-tags">{(problem.tags || []).filter(tag => codeforcesTags.includes(tag)).slice(0, 3).map(tag => <span className="meta-chip" key={tag}><Tag size={11} />{tag}</span>)}</div><div className="problem-source"><span>{info || "—"}</span></div><div className="problem-status">{problem.solved ? <span className="solved-mark"><Check size={15} /> حل‌شده</span> : <ChevronLeft size={18} className="text-slate-600 transition group-hover:text-cyan-200" />}</div><div /></motion.button>;
}
