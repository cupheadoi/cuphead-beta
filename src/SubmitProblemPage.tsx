import { useEffect, useState } from "react";
import { ArrowRight, Plus, Send, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import { api, authToken } from "./lib/api";
import type { ProblemSource } from "./types";
import { codeforcesTags } from "./ProblemsetPage";
import { useUnsavedChanges } from "./hooks/useUnsavedChanges";

type Example = { input: string; output: string; explanation: string };
type Form = {
  name: string;
  sourceId: string;
  externalId: string;
  link: string;
  tags: string[];
  rating: string;
  usacoLevel: string;
  contestYear: string;
  csesTopic: string;
  statementFa: string;
  statementEn: string;
  inputFa: string;
  outputFa: string;
  inputEn: string;
  outputEn: string;
  examples: Example[];
};
const initial: Form = {
  name: "",
  sourceId: "",
  externalId: "",
  link: "",
  tags: [],
  rating: "",
  usacoLevel: "",
  contestYear: "",
  csesTopic: "",
  statementFa: "",
  statementEn: "",
  inputFa: "",
  outputFa: "",
  inputEn: "",
  outputEn: "",
  examples: [{ input: "", output: "", explanation: "" }],
};

export default function SubmitProblemPage() {
  const nav = useNavigate();
  const [sources, setSources] = useState<ProblemSource[]>([]);
  const [form, setForm] = useState<Form>(initial);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [checking, setChecking] = useState(true);
  const [dirty, setDirty] = useState(false);
  const canLeave = useUnsavedChanges(dirty);
  useEffect(() => {
    if (!authToken()) {
      nav("/auth?next=/submit-problem", { replace: true });
      return;
    }
    setChecking(false);
    api
      .publicBootstrap()
      .then((x) => {
        setSources(x.sources);
        if (x.sources[0]) setForm((f) => ({ ...f, sourceId: x.sources[0].id }));
      })
      .catch((e) => setMessage(e.message));
  }, [nav]);
  if (checking)
    return (
      <>
        <Navbar />
        <main className="max-w-3xl mx-auto p-8 text-center text-slate-400">
          برای پیشنهاد مسئله ابتدا وارد حساب شوید.
        </main>
      </>
    );
  const source = sources.find((x) => x.id === form.sourceId);
  const set = (key: keyof Form, value: any) => {
    setDirty(true);
    setForm((f) => ({ ...f, [key]: value }));
  };
  const toggleTag = (tag: string) =>
    set(
      "tags",
      form.tags.includes(tag)
        ? form.tags.filter((x) => x !== tag)
        : form.tags.length < 8
          ? [...form.tags, tag]
          : form.tags,
    );
  async function submit() {
    const missing = !form.name.trim() ? "نام مسئله" : !form.sourceId ? "منبع" : !form.link.trim() ? "لینک مسئله" : !form.statementFa.trim() ? "صورت مسئله فارسی" : form.sourceId && !form.externalId.trim() ? "" : "";
    if (missing) { setMessage(`لطفاً ${missing} را کامل کنید.`); return; }
    setBusy(true);
    setMessage("");
    try {
      await api.submitProblem({
        slug: `submission-${Date.now()}`,
        ...form,
        examples: form.examples.filter((x) => x.input || x.output),
        hints: [],
        solution: "",
        takeaway: "",
      });
      setDirty(false);
      setMessage("مسئله برای بررسی ادمین ارسال شد.");
      setTimeout(() => nav("/problems"), 1000);
    } catch (e: any) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <button onClick={() => canLeave() && nav("/problems")} className="back-link">
          <ArrowRight size={16} /> بازگشت
        </button>
        <div className="mb-8 mt-5">
          <div className="eyebrow">Community submission</div>
          <h1 className="text-3xl sm:text-5xl font-black text-white mt-2">
            پیشنهاد مسئله‌ی جدید
          </h1>
          <ul className="submission-notices mt-4"><li>مسئله پس از بررسی ادمین در مسئله‌نامه منتشر می‌شود. ترجمه، راهنمایی و راه‌حل اختیاری هستند.</li><li>برای فهمیدن بهتر موارد پیشنهاد می کنیم یکی از سوالاتی که مسئله نامه موجود است را بررسی کنید.</li><li>نام شما هنگام انتشار به صورت مسئله پیوست خواهد شد؛ پس تمام تلاشتان را بکنید.</li></ul>
        </div>
        <div className="space-y-5">
          <section className="glass-card rounded-3xl p-6 space-y-5">
            <h2 className="section-heading">اطلاعات اصلی</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="نام مسئله *">
                <input
                  className="input-ui"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                />
              </Field>
              <Field label="منبع *">
                <select
                  className="input-ui"
                  value={form.sourceId}
                  onChange={(e) => set("sourceId", e.target.value)}
                >
                  {sources.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="شناسه">
                <input
                  className="input-ui"
                  dir="ltr"
                  value={form.externalId}
                  onChange={(e) => set("externalId", e.target.value)}
                />
                <small className="helper-text">
                  شناسه یعنی کد مسئله در سایت منبع؛ مثلاً 23E در Codeforces.
                </small>
                <small className="helper-text">اگر وجود ندارد خالی بگذارید.</small>
              </Field>
              <Field label="لینک مسئله *">
                <input
                  className="input-ui"
                  dir="ltr"
                  value={form.link}
                  onChange={(e) => set("link", e.target.value)}
                />
              </Field>
              {source?.slug === "codeforces" && (
                <Field label="ریت Codeforces">
                  <input
                    type="number"
                    step="100"
                    min="0"
                    className="input-ui"
                    value={form.rating}
                    onChange={(e) => set("rating", e.target.value)}
                  />
                  <small className="helper-text">
                    اگر وارد شود باید مضربی از ۱۰۰ باشد.
                  </small>
                </Field>
              )}
              {source?.slug === "usaco" && <Field label="مدال USACO"><select className="input-ui" value={form.usacoLevel} onChange={(e) => set("usacoLevel", e.target.value)}><option value="">انتخاب کنید</option><option>Bronze</option><option>Silver</option><option>Gold</option></select></Field>}
              {source?.slug === "coci" && <Field label="سال مسابقه COCI"><input type="number" className="input-ui" value={form.contestYear} onChange={(e) => set("contestYear", e.target.value)} /></Field>}
              {source?.slug === "cses" && <Field label="موضوع CSES"><input className="input-ui" value={form.csesTopic} onChange={(e) => set("csesTopic", e.target.value)} placeholder="مثلاً Sorting and Searching" /></Field>}
            </div>
            <Field label="تگ های رسمی سایت درصورت موجود (حداکثر ۸ مورد)">
              <div className="flex flex-wrap gap-2 mt-2">
                {codeforcesTags.map((tag) => (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`filter-chip ${form.tags.includes(tag) ? "active" : ""}`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </Field>
          </section>
          <StatementEditor form={form} set={set} />
          <ExamplesEditor
            examples={form.examples}
            set={(value) => set("examples", value)}
          />
          <div className="flex items-center gap-3">
            <button
              disabled={busy}
              onClick={submit}
              className="btn-primary"
            >
              <Send size={16} />
              {busy ? "در حال ارسال..." : "ارسال برای بررسی"}
            </button>
            {message && (
              <span className="text-sm text-cyan-200">{message}</span>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function StatementEditor({
  form,
  set,
}: {
  form: Form;
  set: (key: keyof Form, value: any) => void;
}) {
  return (
    <section className="glass-card rounded-3xl p-6 space-y-5">
      <div>
        <h2 className="section-heading">صورت مسئله</h2>
        <p className="text-sm text-slate-500 mt-2">
          صورت مسئله، Input و Output با هم یک بسته هستند. فرمول‌های LaTeX را با
          Markdown بنویسید؛ مثل <code>\(a^2+b^2\)</code>.
        </p>
      </div>
      <div className="grid lg:grid-cols-2 gap-5">
        <LanguageCard
          title="صورت مسئله فارسی"
          direction="rtl"
          statement={form.statementFa}
          input={form.inputFa}
          output={form.outputFa}
          onStatement={(v: string) => set("statementFa", v)}
          onInput={(v: string) => set("inputFa", v)}
          onOutput={(v: string) => set("outputFa", v)}
        />
        <LanguageCard
          title="English statement (اختیاری)"
          direction="ltr"
          statement={form.statementEn}
          input={form.inputEn}
          output={form.outputEn}
          onStatement={(v: string) => set("statementEn", v)}
          onInput={(v: string) => set("inputEn", v)}
          onOutput={(v: string) => set("outputEn", v)}
        />
      </div>
    </section>
  );
}
function LanguageCard({
  title,
  direction,
  statement,
  input,
  output,
  onStatement,
  onInput,
  onOutput,
}: any) {
  return (
    <div className="rounded-2xl border border-dark-border bg-black/10 p-4 space-y-4">
      <h3 className="font-bold text-white">{title}</h3>
      <Field label="متن صورت مسئله">
        <textarea
          dir={direction}
          className="input-ui min-h-44"
          value={statement}
          onChange={(e) => onStatement(e.target.value)}
        />
      </Field>
      <Field label={direction === "rtl" ? "ورودی" : "Input"}>
        <textarea
          dir={direction}
          className="input-ui min-h-24"
          value={input}
          onChange={(e) => onInput(e.target.value)}
        />
      </Field>
      <Field label={direction === "rtl" ? "خروجی" : "Output"}>
        <textarea
          dir={direction}
          className="input-ui min-h-24"
          value={output}
          onChange={(e) => onOutput(e.target.value)}
        />
      </Field>
    </div>
  );
}
function ExamplesEditor({
  examples,
  set,
}: {
  examples: Example[];
  set: (v: Example[]) => void;
}) {
  return (
    <section className="glass-card rounded-3xl p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="section-heading">نمونه تست‌ها (اختیاری)</h2>
          <p className="text-sm text-slate-500 mt-2">
            برای چند خط از textarea استفاده کنید؛ شکست خط در صفحه حفظ می‌شود.
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            set([...examples, { input: "", output: "", explanation: "" }])
          }
          className="btn-muted !py-2"
        >
          <Plus size={15} /> تست جدید
        </button>
      </div>
      <div className="space-y-4 mt-5">
        {examples.map((x, i) => (
          <div key={i} className="grid md:grid-cols-2 gap-3 relative">
            <textarea
              dir="ltr"
              className="input-ui min-h-24"
              placeholder={`ورودی ${i + 1}`}
              value={x.input}
              onChange={(e) => {
                const n = [...examples];
                n[i] = { ...x, input: e.target.value };
                set(n);
              }}
            />
            <textarea
              dir="ltr"
              className="input-ui min-h-24"
              placeholder="خروجی"
              value={x.output}
              onChange={(e) => {
                const n = [...examples];
                n[i] = { ...x, output: e.target.value };
                set(n);
              }}
            />
            <textarea
              className="input-ui md:col-span-2 min-h-16"
              placeholder="توضیح اختیاری"
              value={x.explanation}
              onChange={(e) => {
                const n = [...examples];
                n[i] = { ...x, explanation: e.target.value };
                set(n);
              }}
            />
            {examples.length > 1 && (
              <button
                type="button"
                onClick={() => set(examples.filter((_, j) => i !== j))}
                className="btn-muted !p-2 !text-red-300 absolute top-2 end-2"
              >
                <Trash2 size={15} />
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="field-label block mb-2">{label}</span>
      {children}
    </label>
  );
}
