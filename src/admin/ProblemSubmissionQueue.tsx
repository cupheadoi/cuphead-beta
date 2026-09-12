import { useEffect, useState } from "react";
import { Check, Eye, X } from "lucide-react";
import { api } from "../lib/api";
import { useNavigate } from "react-router-dom";
import type { Education, ProblemDetail, ProblemSubmission } from "../types";
import { confirmUnsavedChanges, useUnsavedChanges } from "../hooks/useUnsavedChanges";
export default function ProblemSubmissionQueue() {
  const nav = useNavigate();
  const [items, setItems] = useState<ProblemSubmission[]>([]),
    [hide, setHide] = useState(true),
    [selected, setSelected] = useState<ProblemSubmission | null>(null),
    [detail, setDetail] = useState<ProblemDetail | null>(null),
    [urlKey, setUrlKey] = useState(""),
    [publish, setPublish] = useState<any>({
      statementFa: true,
      statementEn: false,
      hints: [],
      solution: true,
      takeaway: true,
      examples: true,
    }),
    [note, setNote] = useState(""),
    [message, setMessage] = useState(""),
    [dirty, setDirty] = useState(false);
  useUnsavedChanges(dirty);
  async function load() {
    try {
      setItems(await api.problemSubmissions());
    } catch (e: any) {
      setMessage(e.message);
    }
  }
  useEffect(() => {
    load();
  }, []);
  const visible = items.filter((x) => !hide || x.status === "pending");
  async function inspect(item: ProblemSubmission) {
    if (!confirmUnsavedChanges()) return;
    setSelected(item);
    setUrlKey(item.urlKey || "");
    setNote("");
    setDirty(false);
    const d = await api.adminProblem(item.problemId);
    setDetail(d);
    setPublish({
      statementFa: d.statements.some((x) => x.language === "fa"),
      statementEn: d.statements.some((x) => x.language === "en"),
      hints: d.education.filter((x) => x.kind === "hint").map((x) => x.id),
      solution: d.education.some((x) => x.kind === "solution"),
      takeaway: d.education.some((x) => x.kind === "takeaway"),
      examples: true,
    });
  }
  function toggleHint(id: string) {
    setDirty(true);
    setPublish((p: any) => ({
      ...p,
      hints: p.hints.includes(id)
        ? p.hints.filter((x: string) => x !== id)
        : [...p.hints, id],
    }));
  }
  async function review(status: "accepted" | "rejected") {
    if (!selected) return;
    try {
      await api.reviewProblemSubmission(
        selected.id,
        status === "accepted"
          ? { status, urlKey, publish, reviewNote: note }
          : { status, reviewNote: note },
      );
      setMessage(
        status === "accepted"
          ? "مسئله با بخش‌های انتخاب‌شده منتشر شد."
          : "پیشنهاد مسئله رد شد.",
      );
      setSelected(null);
      setDetail(null);
      setDirty(false);
      await load();
    } catch (e: any) {
      setMessage(e.message);
    }
  }
  return (
    <div>
      <div className="mb-7">
        <div className="eyebrow">Moderation</div>
        <h1 className="text-3xl font-black text-white mt-2">
          مسئله‌های پیشنهادی
        </h1>
        <p className="text-slate-500 mt-2">
          قبل از انتشار می‌توانید هر بخش نامناسب را حذف کنید؛ XP بر اساس نسخه‌ی
          نهایی محاسبه می‌شود.
        </p>
      </div>
      <label className="flex items-center gap-2 text-sm text-slate-300 mb-4">
        <input
          type="checkbox"
          checked={hide}
          onChange={(e) => setHide(e.target.checked)}
        />{" "}
        Hide Processed ones · فقط موارد در انتظار
      </label>
      {message && <div className="text-sm text-cyan-200 mb-4">{message}</div>}
      <div className="space-y-3">
        {visible.map((x) => (
          <article
            key={x.id}
            className={`glass-card rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border ${x.status === 'accepted' ? 'border-emerald-500/40 bg-emerald-500/[.05]' : x.status === 'rejected' ? 'border-red-500/40 bg-red-500/[.05]' : 'border-amber-500/40 bg-amber-500/[.05]'}`}
          >
            <div>
              <div className="text-xs text-slate-500">
                {x.sourceName} · {x.externalId || "بدون شناسه"} · @
                {x.submitterUsername}
              </div>
              <h2 className="font-bold text-white mt-2">{x.problemName}</h2>
              <div className="text-xs text-slate-500 mt-2">
                نوع مشارکت: مسئله جدید · وضعیت: {x.status}
              </div>
            </div>
            <div className="flex gap-2">
              {x.status === "pending" && <button onClick={() => inspect(x)} className="btn-muted">
                <Eye size={15} /> بررسی
              </button>}
              {x.status === "pending" && <button onClick={() => nav(`/admin/problem/${x.problemId}/edit?review=1`)} className="btn-muted">ویرایش نهایی</button>}
            </div>
          </article>
        ))}
        {!visible.length && (
          <div className="glass-card rounded-2xl p-12 text-center text-slate-500">
            موردی برای نمایش وجود ندارد.
          </div>
        )}
      </div>
      {selected && detail && (
        <div className="modal-backdrop">
          <div className="glass-card rounded-3xl p-6 w-full max-w-3xl max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-xs text-slate-500">
                  بررسی توسط {selected.submitterName}
                </div>
                <h2 className="text-2xl font-black text-white mt-1">
                  {selected.problemName}
                </h2>
              </div>
              <button onClick={() => { if (confirmUnsavedChanges()) { setSelected(null); setDirty(false); } }} className="icon-btn">
                <X size={17} />
              </button>
            </div>
            <label className="field-label block mt-6">
              شناسه URL نهایی
              <input
                dir="ltr"
                className="input-ui mt-2"
                value={urlKey}
                onChange={(e) => { setDirty(true); setUrlKey(e.target.value); }}
                placeholder="23E یا mad-cows"
              />
            </label>
            <div className="grid md:grid-cols-2 gap-3 mt-5">
              <CheckBox
                label="صورت مسئله فارسی"
                checked={publish.statementFa}
                  onChange={() => {
                    setDirty(true);
                    setPublish((p: any) => ({
                      ...p,
                      statementFa: !p.statementFa,
                    }));
                  }}
              />
              <CheckBox
                label="صورت مسئله انگلیسی"
                checked={publish.statementEn}
                  onChange={() => {
                    setDirty(true);
                    setPublish((p: any) => ({
                      ...p,
                      statementEn: !p.statementEn,
                    }));
                  }}
              />
            </div>
            <section className="mt-5">
              <h3 className="font-bold text-white">محتوای آموزشی</h3>
              <div className="space-y-2 mt-3">
                {detail.education.map((x: Education) => (
                  <CheckBox
                    key={x.id}
                    label={`${x.kind === "hint" ? `راهنمایی ${x.layer}` : x.kind === "solution" ? "راه‌حل" : "نکته‌ی اصلی"} — ${x.title || ""}`}
                    checked={
                      x.kind === "hint"
                        ? publish.hints.includes(x.id)
                        : x.kind === "solution"
                          ? publish.solution
                          : publish.takeaway
                    }
                    onChange={() => {
                      if (x.kind === "hint") toggleHint(x.id);
                      else { setDirty(true); setPublish((p: any) => ({ ...p, [x.kind]: !p[x.kind] })); }
                    }}
                  />
                ))}
              </div>
            </section>
            <CheckBox
              label="نمونه تست‌ها"
              checked={publish.examples}
              onChange={() => { setDirty(true); setPublish((p: any) => ({ ...p, examples: !p.examples })); }}
            />
            <label className="field-label block mt-5">
              یادداشت برای پیشنهاددهنده (اختیاری)
              <textarea
                className="input-ui mt-2 min-h-24"
                value={note}
                onChange={(e) => { setDirty(true); setNote(e.target.value); }}
                placeholder="اگر بخشی حذف شد، دلیل یا توضیحی برای کاربر بنویسید."
              />
            </label>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => review("rejected")}
                className="btn-muted !text-red-300"
              >
                <X size={15} /> رد پیشنهاد
              </button>
              <button
                onClick={() => review("accepted")}
                className="btn-primary"
              >
                <Check size={15} /> انتشار نسخه انتخاب‌شده
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
function CheckBox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex items-center gap-3 rounded-xl border border-dark-border bg-white/[.02] px-4 py-3 text-sm text-slate-300">
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span>{label}</span>
    </label>
  );
}
