import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Check,
  ExternalLink,
  Lightbulb,
  LockKeyhole,
  MessageSquarePlus,
  Send,
  Sparkles,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "./components/Navbar";
import Loading from "./components/Loading";
import MarkdownView from "./components/MarkdownView";
import ReactionBar from "./components/ReactionBar";
import { api, authToken } from "./lib/api";
import type { ContributionKind, ProblemDetail } from "./types";

export default function ProblemPage() {
  const { source, identifier, slug } = useParams();
  const nav = useNavigate();
  const [problem, setProblem] = useState<ProblemDetail | null>(null);
  const [error, setError] = useState("");
  const [lang, setLang] = useState<"fa" | "en">("fa");
  const [tab, setTab] = useState<"statement" | "education">("statement");
  const [edu, setEdu] = useState<"hint" | "solution" | "takeaway">("hint");
  const [solved, setSolved] = useState(false);
  const [message, setMessage] = useState("");
  const [contribute, setContribute] = useState(false);
  useEffect(() => {
    setProblem(null);
    setError("");
    const load =
      source && identifier
        ? api.problem(source, identifier)
        : slug
          ? api.problemBySlug(slug)
          : null;
    load
      ?.then((p) => {
        setProblem(p);
        setSolved(
          authToken()
            ? p.solved
            : localStorage.getItem(`cuphead_problem_${p.id}`) === "true",
        );
        const fa = p.statements.find((x) => x.language === "fa");
        const en = p.statements.find((x) => x.language === "en");
        setLang(fa ? "fa" : en ? "en" : "fa");
      })
      .catch((e) => setError(e.message || "مسئله پیدا نشد."));
  }, [source, identifier, slug]);
  const statement = problem?.statements.find((x) => x.language === lang);
  const education = useMemo(
    () =>
      problem?.education.filter((x) => x.kind === edu && x.language === "fa") ||
      [],
    [problem, edu],
  );
  async function toggle() {
    if (!problem) return;
    const next = !solved;
    setSolved(next);
    if (authToken()) {
      try {
        await api.saveProgress(problem.id, next);
      } catch {
        setSolved(!next);
      }
    } else localStorage.setItem(`cuphead_problem_${problem.id}`, String(next));
  }
  if (!problem)
    return (
      <>
        <Navbar />
        <main className="max-w-3xl mx-auto px-4 py-12">
          {error ? (
            <div className="glass-card rounded-2xl p-8 text-center">
              <p className="text-red-300">{error}</p>
              <button
                onClick={() => nav("/problems")}
                className="btn-muted mt-5"
              >
                بازگشت به مسئله‌نامه
              </button>
            </div>
          ) : (
            <Loading />
          )}
        </main>
      </>
    );
  const problemPath = `/problem/${encodeURIComponent(problem.source.slug)}/${encodeURIComponent(problem.urlKey || problem.slug)}`;
  return (
    <div className="min-h-screen">
      <div className="ambient-glow" />
      <Navbar />
      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <button onClick={() => nav("/problems")} className="back-link">
          <ArrowRight size={17} /> بازگشت به مسئله‌نامه
        </button>
        <header className="problem-hero glass-card rounded-3xl p-6 sm:p-9 mt-5">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-sm text-slate-400">
                <span
                  className="source-badge"
                  style={{
                    borderColor: problem.source.color,
                    color: problem.source.color,
                  }}
                >
                  {problem.source.name}
                </span>
                <span>شناسه: {problem.externalId || "—"}</span>
                <span className="text-slate-600">
                  / {problem.urlKey || problem.slug}
                </span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-white mt-4">
                {problem.name}
              </h1>
              <div className="flex flex-wrap gap-2 mt-5">
                {problem.tags?.map((tag) => (
                  <span className="meta-chip" key={tag}>
                    {tag}
                  </span>
                ))}
                {problem.source.slug === "codeforces" &&
                  problem.rating !== null && (
                    <span className="meta-chip">
                      ریت Codeforces: {problem.rating}
                    </span>
                  )}
                {problem.source.slug === "usaco" &&
                  problem.sourceMeta?.usacoLevel && (
                    <span className="meta-chip">
                      مدال USACO: {problem.sourceMeta.usacoLevel}
                    </span>
                  )}
                {problem.source.slug === "coci" &&
                  problem.sourceMeta?.contestYear && (
                    <span className="meta-chip">
                      سال مسابقه COCI: {problem.sourceMeta.contestYear}
                    </span>
                  )}
                {problem.source.slug === "cses" &&
                  problem.sourceMeta?.csesTopic && (
                    <span className="meta-chip">
                      موضوع CSES: {problem.sourceMeta.csesTopic}
                    </span>
                  )}
                <span className="content-author">
                  ایجادکننده: {problem.authorLabel || "CupHead"}
                </span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3">
              <a
                href={problem.link}
                target="_blank"
                rel="noreferrer"
                className="btn-primary"
              >
                <ExternalLink size={16} /> لینک مسئله
              </a>
              <button
                onClick={toggle}
                className={`btn-muted ${solved ? "!border-emerald-400/40 !text-emerald-300 !bg-emerald-500/10" : ""}`}
              >
                <Check size={17} />
                {solved ? "حل‌شده" : "علامت به‌عنوان حل‌شده"}
              </button>
            </div>
          </div>
        </header>
        <div className="problem-layout mt-6">
          <section>
            <div className="tab-bar">
              <button
                className={tab === "statement" ? "active" : ""}
                onClick={() => setTab("statement")}
              >
                صورت مسئله
              </button>
              <button
                className={tab === "education" ? "active" : ""}
                onClick={() => setTab("education")}
              >
                <Sparkles size={15} /> آموزش مسئله
              </button>
            </div>
            {tab === "statement" ? (
              <>
                <article
                  className={`glass-card rounded-2xl p-5 sm:p-8 ${lang === "en" ? "text-left" : ""}`}
                  dir={lang === "en" ? "ltr" : "rtl"}
                >
                  <div className="flex justify-between items-center border-b border-dark-border pb-4 mb-5">
                    <div>
                      <h2 className="font-bold text-white">
                        {lang === "fa" ? "صورت مسئله" : "Statement"}
                      </h2>
                      {statement?.authorLabel && (
                        <div className="content-author mt-1">
                          نویسنده: {statement.authorLabel}
                        </div>
                      )}
                    </div>
                    <div className="language-toggle">
                      <button
                        className={lang === "fa" ? "active" : ""}
                        onClick={() => setLang("fa")}
                        disabled={
                          !problem.statements.some((x) => x.language === "fa")
                        }
                      >
                        فارسی
                      </button>
                      <button
                        className={lang === "en" ? "active" : ""}
                        onClick={() => setLang("en")}
                        disabled={
                          !problem.statements.some((x) => x.language === "en")
                        }
                      >
                        English
                      </button>
                    </div>
                  </div>
                  {statement ? (
                    <>
                      <MarkdownView markdown={statement.contentMarkdown} />
                      {statement.inputMarkdown && (
                        <StatementPart
                          title={lang === "fa" ? "ورودی" : "Input"}
                          markdown={statement.inputMarkdown}
                        />
                      )}{" "}
                      {statement.outputMarkdown && (
                        <StatementPart
                          title={lang === "fa" ? "خروجی" : "Output"}
                          markdown={statement.outputMarkdown}
                        />
                      )}
                    </>
                  ) : (
                    <div className="text-slate-500">
                      صورت مسئله‌ی این زبان هنوز منتشر نشده است.
                    </div>
                  )}
                </article>
                <ReactionBar
                  contentType="statement"
                  contentId={statement?.id || problem.id}
                />
                <Examples examples={problem.examples} />
              </>
            ) : (
              <EducationPanel edu={edu} setEdu={setEdu} education={education} />
            )}
          </section>
          <aside className="space-y-4">
            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center gap-2 text-cyan-200 font-bold">
                <Lightbulb size={18} /> نقشه‌ی یادگیری
              </div>
              <div className="space-y-3 mt-5 text-sm text-slate-400">
                <p>۱. قبل از دیدن راهنما، حداقل ۱۵ دقیقه تلاش کن.</p>
                <p>۲. هر راهنمایی را فقط وقتی باز کن که به آن نیاز داری.</p>
                <p>۳. نکته‌ی اصلی را بعد از حل مسئله مرور کن.</p>
              </div>
            </div>
            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center gap-2 text-slate-200 font-bold">
                <MessageSquarePlus size={18} /> مشارکت در CupHead
              </div>
              <p className="text-sm text-slate-500 leading-6 mt-3">
                ترجمه، راهنمایی یا راه‌حل خودت را بفرست. برای پیشنهاد محتوا باید
                وارد حساب شوی.
              </p>
              <button
                onClick={() => {
                  if (!authToken()) {
                    nav("/auth?next=" + encodeURIComponent(problemPath));
                    return;
                  }
                  setContribute(true);
                }}
                className="btn-primary w-full mt-4"
              >
                <Send size={15} /> پیشنهاد محتوا
              </button>
            </div>
          </aside>
        </div>
        {contribute && (
          <ContributionModal
            problem={problem}
            onClose={() => setContribute(false)}
            onDone={(m) => {
              setMessage(m);
              setContribute(false);
            }}
          />
        )}
        {message && <div className="toast-note">{message}</div>}
      </main>
    </div>
  );
}
function StatementPart({
  title,
  markdown,
}: {
  title: string;
  markdown: string;
}) {
  return (
    <section className="statement-part">
      <h3>{title}</h3>
      <MarkdownView markdown={markdown} />
    </section>
  );
}
function EducationPanel({
  edu,
  setEdu,
  education,
}: {
  edu: "hint" | "solution" | "takeaway";
  setEdu: (x: "hint" | "solution" | "takeaway") => void;
  education: any[];
}) {
  const tabs: [typeof edu, string, any][] = [
    ["hint", "راهنمایی‌ها", Lightbulb],
    ["solution", "راه‌حل‌ها", Sparkles],
    ["takeaway", "نکته‌ی اصلی", Check],
  ];
  return (
    <article className="glass-card rounded-2xl p-5 sm:p-8">
      <div className="flex flex-wrap gap-2 border-b border-dark-border pb-4 mb-6">
        {tabs.map(([id, label, Icon]) => (
          <button
            key={id}
            onClick={() => setEdu(id)}
            className={`education-tab ${edu === id ? "active" : ""}`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>
      {education.length ? (
        <div className="space-y-3">
          {edu === "hint" ? (
            education.map((x: any) => (
              <details key={x.id} className="hint-disclosure">
                <summary>
                  <span>راهنمایی {x.layer}</span>
                  <span className="text-xs text-slate-500">
                    برای نمایش باز کن
                  </span>
                </summary>
                <div className="education-card mt-2">
                  <div className="content-author mb-3">
                    نویسنده: {x.authorLabel || "CupHead"}
                  </div>
                  <MarkdownView markdown={x.contentMarkdown} />
                  <ReactionBar contentType="hint" contentId={x.id} />
                </div>
              </details>
            ))
          ) : (
            <div className="space-y-4">
              {education.map((x: any) => (
                <div key={x.id} className="education-card">
                  <div className="flex items-center gap-2 text-xs text-cyan-300 mb-3">
                    {x.kind !== "solution" && x.title}
                    <span className="content-author">
                      نویسنده: {x.authorLabel || "CupHead"}
                    </span>
                  </div>
                  <MarkdownView markdown={x.contentMarkdown} />
                  <ReactionBar contentType={x.kind} contentId={x.id} />
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="text-slate-500 flex items-center gap-2">
          <LockKeyhole size={16} /> محتوای آموزشی این بخش هنوز منتشر نشده است.
        </div>
      )}
    </article>
  );
}
function Examples({ examples }: { examples: ProblemDetail["examples"] }) {
  return (
    <section className="glass-card rounded-2xl p-5 sm:p-7 mt-4">
      <h2 className="text-lg font-bold text-white">نمونه تست‌ها</h2>
      <p className="text-sm text-slate-500 mt-2 mb-5">
        چند ورودی و خروجی نمونه برای درک بهتر صورت مسئله.
      </p>
      {examples?.length ? (
        <div className="space-y-4">
          {examples.map((example, i) => (
            <div key={i} className="grid md:grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-slate-500 mb-2">ورودی {i + 1}</div>
                <pre className="example-code" dir="ltr">
                  {example.input}
                </pre>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-2">خروجی</div>
                <pre className="example-code" dir="ltr">
                  {example.output}
                </pre>
              </div>
              {example.explanation && (
                <p className="md:col-span-2 text-xs text-slate-500">
                  {example.explanation}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-sm text-slate-500">
          برای این مسئله هنوز نمونه تست ثبت نشده است.
        </div>
      )}
    </section>
  );
}
function ContributionModal({
  problem,
  onClose,
  onDone,
}: {
  problem: ProblemDetail;
  onClose: () => void;
  onDone: (m: string) => void;
}) {
  const [kind, setKind] = useState<ContributionKind>("translation");
  const [language, setLanguage] = useState<"fa" | "en">("fa");
  const [layer, setLayer] = useState(1);
  const [title, setTitle] = useState("");
  const [contentMarkdown, setContentMarkdown] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit() {
    setBusy(true);
    try {
      await api.submitContribution(problem.id, {
        kind,
        language: kind === "translation" ? language : "fa",
        layer,
        title,
        contentMarkdown,
      });
      onDone("پیشنهادت ثبت شد و برای بررسی ادمین رفت.");
    } catch (e: any) {
      onDone(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="modal-backdrop">
      <div className="glass-card rounded-3xl p-6 w-full max-w-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            پیشنهاد برای {problem.name}
          </h2>
          <button onClick={onClose} className="icon-btn">
            ×
          </button>
        </div>
        <div className="grid sm:grid-cols-2 gap-3 mt-6">
          <label className="field-label">
            نوع
            <select
              className="input-ui mt-2"
              value={kind}
              onChange={(e) => setKind(e.target.value as ContributionKind)}
            >
              <option value="translation">ترجمه فارسی</option>
              <option value="hint">راهنمایی</option>
              <option value="solution">راه‌حل</option>
              <option value="takeaway">نکته‌ی اصلی</option>
            </select>
          </label>
          {kind === "translation" && (
            <label className="field-label">
              زبان ترجمه
              <select
                className="input-ui mt-2"
                value={language}
                onChange={(e) => setLanguage(e.target.value as "fa" | "en")}
              >
                <option value="fa">فارسی</option>
                <option value="en">English</option>
              </select>
            </label>
          )}
        </div>
        {kind === "hint" && (
          <label className="field-label block mt-4">
            شماره‌ی راهنمایی
            <select
              className="input-ui mt-2"
              value={layer}
              onChange={(e) => setLayer(Number(e.target.value))}
            >
              {[1, 2, 3, 4, 5].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
        )}
        {(kind === "hint" || kind === "takeaway") && (
          <label className="field-label block mt-4">
            عنوان
            <input
              className="input-ui mt-2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثلاً ایده‌ی اصلی"
            />
          </label>
        )}
        <label className="field-label block mt-4">
          محتوا
          <textarea
            className="input-ui mt-2 min-h-40"
            value={contentMarkdown}
            onChange={(e) => setContentMarkdown(e.target.value)}
            placeholder="Markdown و فرمول LaTeX بنویسید..."
          />
        </label>
        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onClose} className="btn-muted">
            لغو
          </button>
          <button
            disabled={busy || !contentMarkdown.trim()}
            onClick={submit}
            className="btn-primary"
          >
            <Send size={15} />
            {busy ? "در حال ثبت..." : "ارسال برای بررسی"}
          </button>
        </div>
      </div>
    </div>
  );
}
