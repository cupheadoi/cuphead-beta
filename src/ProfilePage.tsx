import { useEffect, useState } from "react";
import {
  Award,
  BookOpen,
  LogOut,
  MessageSquarePlus,
  Send,
  Upload,
  User,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import { api, assetUrl, authToken, setAuthToken } from "./lib/api";

const avatars = [
  "/icon.png",
  "pawn",
  "knight",
  "bishop",
  "rook",
  "queen",
  "king",
];
const pieces: Record<string, string> = {
  pawn: "♟",
  knight: "♞",
  bishop: "♝",
  rook: "♜",
  queen: "♛",
  king: "♚",
};
export default function ProfilePage() {
  const nav = useNavigate();
  const [data, setData] = useState<any>(null);
  const [motivation, setMotivation] = useState("");
  const [experience, setExperience] = useState("");
  const [telegramId, setTelegramId] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketBody, setTicketBody] = useState("");
  useEffect(() => {
    if (!authToken()) {
      nav("/auth");
      return;
    }
    api
      .profile()
      .then(setData)
      .catch(() => nav("/auth"));
  }, [nav]);
  if (!data)
    return (
      <>
        <Navbar />
        <div className="p-10 text-slate-500">در حال بارگذاری...</div>
      </>
    );
  const u = data.user;
  const hasContributorStatus = data.requests.some(
    (x: any) => x.status === "approved" || x.status === "pending",
  );
  const canApply = u.role === "user" && !hasContributorStatus;
  async function request() {
    try {
      await api.requestContributor({ motivation, experience, telegramId });
      setMessage(
        "درخواست همکاری ثبت شد. ادمین‌ها در صورت نیاز از طریق تلگرام با شما تماس می‌گیرند.",
      );
      setMotivation("");
      setExperience("");
      setTelegramId("");
      setData(await api.profile());
    } catch (e: any) {
      setMessage(e.message);
    }
  }
  async function chooseAvatar(value: string) {
    setSaving(true);
    try {
      const r = await api.chooseAvatar(value);
      setData({ ...data, user: r.user });
    } catch (e: any) {
      setMessage(e.message);
    } finally {
      setSaving(false);
    }
  }
  async function uploadAvatar(file?: File) {
    if (!file) return;
    setUploading(true);
    try {
      const r = await api.uploadAvatar(file);
      setData({ ...data, user: r.user });
      setMessage("تصویر پروفایل ذخیره شد.");
    } catch (e: any) {
      setMessage(e.message);
    } finally {
      setUploading(false);
    }
  }
  const fullName =
    `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.username;
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Avatar value={u.profileImage} name={fullName} />
            <div>
              <div className="eyebrow">
                <User size={14} /> حساب شخصی
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-white mt-2">
                سلام، {fullName}
              </h1>
              <p className="text-slate-500 mt-2">
                @{u.username} · {u.grade || "پایه ثبت نشده"} · نقش:{" "}
                {u.role === "user"
                  ? "کاربر عادی"
                  : u.role === "owner"
                    ? "Headmaster"
                    : u.role === "reviewer"
                      ? "Reviewer"
                      : "Admin"}
              </p>
            </div>
          </div>
          <button
            onClick={async () => {
              try {
                await api.logout();
              } catch {}
              setAuthToken(null);
              nav("/");
            }}
            className="btn-muted"
          >
            <LogOut size={16} /> خروج
          </button>
        </div>
        <section className="glass-card rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-white">تصویر پروفایل</h2>
              <p className="text-sm text-slate-500 mt-1">
                یک تصویر واقعی آپلود کن یا از آواتارهای CupHead استفاده کن.
              </p>
            </div>
            {(saving || uploading) && (
              <span className="text-xs text-cyan-200">در حال ذخیره...</span>
            )}
          </div>
          <label className="upload-avatar-button mt-5">
            <Upload size={16} /> {uploading ? "در حال آپلود..." : "آپلود تصویر"}
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => uploadAvatar(e.target.files?.[0])}
            />
          </label>
          <div className="flex flex-wrap gap-3 mt-5">
            {avatars.map((value) => (
              <button
                key={value}
                aria-label={`انتخاب آواتار ${value}`}
                onClick={() => chooseAvatar(value)}
                className={`avatar-option ${u.profileImage === value ? "active" : ""}`}
              >
                {value === "/icon.png" ? (
                  <img src={value} alt="CupHead" />
                ) : (
                  <span>{pieces[value]}</span>
                )}
              </button>
            ))}
          </div>
        </section>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <ProfileStat
            icon={BookOpen}
            value={data.solved.length}
            label="مسئله‌ی حل‌شده"
          />
          <ProfileStat
            icon={MessageSquarePlus}
            value={data.contributions.length}
            label="مشارکت‌ها"
          />
          <ProfileStat
            icon={Award}
            value={
              data.contributions.filter((x: any) => x.status === "accepted")
                .length
            }
            label="مشارکت پذیرفته‌شده"
          />
          <ProfileStat
            icon={Send}
            value={data.problemSubmissions?.length || 0}
            label="مسئله های اضافه شده"
          />
        </div>
        {data.problemSubmissions?.length > 0 && (
          <section className="glass-card rounded-2xl p-6 mb-6">
            <h2 className="text-xl font-bold text-white">پیشنهادهای مسئله</h2>
            <div className="space-y-3 mt-4">
              {data.problemSubmissions.map((x: any) => (
                <div key={x.id} className="activity-row">
                  <span>
                    {x.problemName}
                    {x.reviewNote && (
                      <small className="block text-slate-500 mt-1">
                        {x.reviewNote}
                      </small>
                    )}
                  </span>
                  <b
                    className={
                      x.status === "accepted"
                        ? "text-emerald-300"
                        : x.status === "rejected"
                          ? "text-red-300"
                          : "text-amber-300"
                    }
                  >
                    {x.status}
                    {x.xpAwarded ? ` · ${x.xpAwarded} XP` : ""}
                  </b>
                </div>
              ))}
            </div>
          </section>
        )}
        {u.role === "reviewer" && (
          <section className="glass-card rounded-2xl p-6 mb-6">
            <h2 className="text-xl font-bold text-white">
              تیکت بررسی برای ادمین
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              اگر در درس‌های Review mode به راهنمایی نیاز دارید، برای ادمین تیکت
              بفرستید.
            </p>
            <div className="grid md:grid-cols-2 gap-3 mt-4">
              <input
                className="input-ui"
                placeholder="موضوع تیکت"
                value={ticketSubject}
                onChange={(e) => setTicketSubject(e.target.value)}
              />
              <textarea
                className="input-ui min-h-20"
                placeholder="توضیح"
                value={ticketBody}
                onChange={(e) => setTicketBody(e.target.value)}
              />
            </div>
            <button
              disabled={!ticketSubject.trim() || !ticketBody.trim()}
              onClick={async () => {
                try {
                  await api.createReviewerTicket({
                    subject: ticketSubject,
                    body: ticketBody,
                  });
                  setTicketSubject("");
                  setTicketBody("");
                  setData(await api.profile());
                  setMessage("تیکت برای ادمین ارسال شد.");
                } catch (e: any) {
                  setMessage(e.message);
                }
              }}
              className="btn-primary mt-3"
            >
              <Send size={15} /> ارسال تیکت
            </button>
            {data.tickets?.length > 0 && (
              <div className="space-y-2 mt-5">
                {data.tickets.map((x: any) => (
                  <div key={x.id} className="activity-row">
                    <span>{x.subject}</span>
                    <b className="text-amber-300">{x.status}</b>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
        <div className="grid lg:grid-cols-[1.1fr_.9fr] gap-5">
          {canApply && (
            <section className="glass-card rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white">
                درخواست همکاری با CupHead
              </h2>
              <p className="text-sm text-slate-500 mt-2 leading-6">
                برای درخواست همکاری، Telegram ID الزامی است؛ ادمین‌ها در صورت
                نیاز از طریق تلگرام با شما پیام می‌دهند.
              </p>
              <label className="field-label block mt-5">
                Telegram ID
                <input
                  required
                  className="input-ui mt-2"
                  value={telegramId}
                  onChange={(e) => setTelegramId(e.target.value)}
                  placeholder="مثل @username"
                />
              </label>
              <label className="field-label block mt-3">
                در چه زمینه‌ای می‌خواهی با کاپ‌هد همکاری کنی؟
                <textarea
                  required
                  className="input-ui mt-2 min-h-28"
                  value={motivation}
                  onChange={(e) => setMotivation(e.target.value)}
                  placeholder="ترجمه، نوشتن راهنمایی، حل مسئله، طراحی و..."
                />
              </label>
              <textarea
                className="input-ui mt-3 min-h-24"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                placeholder="سابقه یا توضیح تکمیلی (اختیاری)"
              />
              <button
                onClick={request}
                disabled={!motivation.trim() || !telegramId.trim()}
                className="btn-primary mt-4"
              >
                <Send size={15} /> ارسال درخواست
              </button>
              {message && (
                <div className="text-sm text-cyan-200 mt-4">{message}</div>
              )}
            </section>
          )}
          {!canApply && (
            <div className="glass-card rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white">وضعیت همکاری</h2>
              <p className="text-sm text-slate-400 mt-3 leading-7">
                {u.role !== "user"
                  ? "این حساب به پنل رسمی CupHead دسترسی دارد."
                  : "درخواست همکاری شما در حال بررسی یا تأیید شده است."}
              </p>
            </div>
          )}
          <section
            className={`glass-card rounded-2xl p-6 ${canApply ? "" : "lg:col-span-2"}`}
          >
            <h2 className="text-xl font-bold text-white">فعالیت‌های اخیر</h2>
            <div className="space-y-3 mt-5">
              {data.contributions.length ? (
                data.contributions.map((x: any) => (
                  <div key={x.id} className="activity-row">
                    <span>
                      {x.kind === "hint"
                        ? "راهنمایی"
                        : x.kind === "solution"
                          ? "راه‌حل"
                          : x.kind === "translation"
                            ? "ترجمه"
                            : "نکته‌ی اصلی"}
                    </span>
                    <b
                      className={
                        x.status === "accepted"
                          ? "text-emerald-300"
                          : x.status === "rejected"
                            ? "text-red-300"
                            : "text-amber-300"
                      }
                    >
                      {x.status}
                    </b>
                  </div>
                ))
              ) : (
                <p className="text-slate-500 text-sm">
                  هنوز مشارکتی ثبت نکرده‌ای.
                </p>
              )}
              {data.requests.map((x: any) => (
                <div key={x.id} className="activity-row">
                  <span>درخواست همکاری</span>
                  <b className="text-slate-400">{x.status}</b>
                </div>
              ))}
            </div>
            <button
              onClick={() => nav("/problems")}
              className="btn-muted w-full mt-6"
            >
              رفتن به مسئله‌نامه
            </button>
          </section>
        </div>
      </main>
    </div>
  );
}
function Avatar({ value, name }: { value?: string; name: string }) {
  return value?.startsWith("/uploads/") || value === "/icon.png" ? (
    <div className="profile-avatar">
      <img src={assetUrl(value || "/icon.png")} alt={name} />
    </div>
  ) : (
    <div className="profile-avatar piece-avatar">
      {pieces[value || "pawn"] || name.slice(0, 1)}
    </div>
  );
}
function ProfileStat({
  icon: Icon,
  value,
  label,
}: {
  icon: any;
  value: number;
  label: string;
}) {
  return (
    <div className="glass-card rounded-2xl p-5">
      <Icon className="text-cyan-300" size={19} />
      <div className="text-3xl font-black text-white mt-3">{value}</div>
      <div className="text-sm text-slate-500 mt-1">{label}</div>
    </div>
  );
}
