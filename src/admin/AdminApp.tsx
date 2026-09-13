import { useEffect, useState } from 'react';
import { ArrowRight, BookOpen, Check, ClipboardCheck, Copy, Database, Files, Library, LayoutDashboard, LogOut, Map, MessageCircle, MessageSquare, ScrollText, Send, ShieldCheck, Ticket, UserCog, Users, Workflow, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api, setAuthToken } from '../lib/api';
import type { SessionUser } from '../types';
import AdminDashboard from './AdminDashboard';
import LessonManager from './LessonManager';
import RoadmapEditor from './RoadmapEditor';
import FileManager from './FileManager';
import OfficialLibrary from './OfficialLibrary';
import ModerationQueue from './ModerationQueue';
import ProblemSubmissionQueue from './ProblemSubmissionQueue';
import AccountManager from './AccountManager';
import ProblemComposer from './ProblemComposer';
import LogPanel from './LogPanel';
import ProblemCollectionManager from './ProblemCollectionManager';
import ReviewerTicketPanel from './ReviewerTicketPanel';
import DatabaseManager from './DatabaseManager';
import { confirmUnsavedChanges } from '../hooks/useUnsavedChanges';

type Tab = 'dashboard' | 'library' | 'lessons' | 'roadmap' | 'review' | 'problemReviews' | 'collections' | 'reviewerTickets' | 'requests' | 'files' | 'users' | 'database' | 'logs';

export default function AdminApp() {
  const location = useLocation(); const nav = useNavigate();
  const [user, setUser] = useState<SessionUser | null>(null); const [checking, setChecking] = useState(true); const [tab, setTab] = useState<Tab>('dashboard');
  useEffect(() => { api.me().then(r => setUser(r.user)).catch(() => setUser(null)).finally(() => setChecking(false)); }, []);
  if (checking) return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-2 border-blue-500/20 border-t-blue-400 rounded-full animate-spin" /></div>;
  if (!user) return <Login onLogin={setUser} onBack={() => nav('/')} />;
  if (location.pathname === '/admin/problem/new') return <ProblemComposer user={user} onDone={() => nav('/admin')} />;
  const editMatch = location.pathname.match(/^\/admin\/problem\/([^/]+)\/edit$/);
  if (editMatch) return <ProblemComposer user={user} problemId={editMatch[1]} onDone={() => nav('/admin')} />;
  if (user.role === 'user' || user.role === 'reviewer') return <div className="min-h-screen"><div className="max-w-md mx-auto p-10 text-center"><ShieldCheck className="mx-auto text-amber-300" size={40} /><h1 className="text-2xl font-bold text-white mt-4">این بخش مخصوص تیم مدیریت CupHead است</h1><button onClick={() => nav('/profile')} className="btn-primary mt-6">رفتن به پروفایل</button></div></div>;

  const tabAbilities: Record<string, string> = { library: 'manage_library', lessons: 'manage_lessons', roadmap: 'manage_roadmap', review: 'review_contributions', problemReviews: 'review_problems', collections: 'manage_library', reviewerTickets: 'review_contributions', files: 'manage_files' };
  const items: [Tab, string, any][] = ([
    ['dashboard', 'داشبورد', LayoutDashboard], ['library', 'کتابخانه رسمی', Workflow], ['lessons', 'درس‌ها', BookOpen], ['roadmap', 'نقشه راه', Map],
    ['review', 'مشارکت‌ها', MessageSquare], ['problemReviews', 'مسئله‌های پیشنهادی', ClipboardCheck], ['collections', 'کتابخانه مجموعه‌ها', Library], ['reviewerTickets', 'تیکت‌های Reviewer', Ticket],
    ...(user.role === 'owner' ? [['requests', 'درخواست همکاری', Users] as [Tab, string, any], ['users', 'حساب‌ها', UserCog] as [Tab, string, any], ['database', 'پایگاه‌داده و پشتیبان', Database] as [Tab, string, any], ['logs', 'گزارش تغییرات', ScrollText] as [Tab, string, any]] : []), ['files', 'فایل‌ها', Files]
  ] as [Tab, string, any][]).filter(([id]) => user.role === 'owner' || !tabAbilities[id] || Boolean(user.abilities?.[tabAbilities[id]]));
  async function logout() { try { await api.logout(); } catch { /* already expired */ } setAuthToken(null); setUser(null); }

  return <div className="min-h-screen bg-[#07111f] text-slate-200 flex flex-col lg:flex-row" dir="rtl">
    <aside className="lg:w-72 border-b lg:border-b-0 lg:border-s border-slate-400/10 bg-[#081321]/90 backdrop-blur-2xl lg:min-h-screen lg:sticky lg:top-0 z-30">
      <div className="p-5 border-b border-slate-400/10 flex items-center justify-between lg:block"><div><img src="/logotype.png" alt="CupHead" className="h-12 w-44 object-contain object-right" /><div className="mt-2 flex items-center gap-2 text-xs text-slate-500"><span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(103,232,249,.85)]"/><span>{user.role === 'owner' ? 'Headmaster workspace' : 'Admin workspace'}</span></div></div><button onClick={() => nav('/')} className="lg:hidden icon-btn" aria-label="بازگشت به سایت"><ArrowRight size={17} /></button></div>
      <nav className="p-3 flex lg:block gap-2 overflow-x-auto">{items.map(([id, label, Icon]) => <button key={id} onClick={() => confirmUnsavedChanges() && setTab(id)} className={`shrink-0 lg:w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition mb-1 ${tab === id ? 'bg-cyan-400/[.09] border border-cyan-300/20 text-cyan-100 shadow-[0_10px_24px_rgba(7,60,92,.2)]' : 'border border-transparent text-slate-400 hover:text-white hover:bg-white/[.045]'}`}><Icon size={18} strokeWidth={1.8}/><span>{label}</span></button>)}</nav>
      <div className="hidden lg:block p-4 mt-auto"><div className="glass-card rounded-2xl p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-cyan-400/[.08] border border-cyan-300/20 flex items-center justify-center"><ShieldCheck size={18} className="text-cyan-200" /></div><div className="min-w-0"><div className="text-sm font-bold truncate">{user.displayName}</div><div className="text-xs text-slate-500 mt-1">{user.role === 'owner' ? 'Headmaster' : 'Admin'}</div></div></div><div className="grid grid-cols-2 gap-2 mt-4"><button onClick={() => nav('/')} className="btn-muted !px-2 !py-2 text-xs">سایت</button><button onClick={logout} className="btn-muted !px-2 !py-2 text-xs"><LogOut size={14} /> خروج</button></div></div></div>
    </aside>
    <main className="relative flex-1 min-w-0"><div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_at_top,rgba(22,101,168,.12),transparent_68%)]"/><div className="relative max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">{tab === 'dashboard' && <AdminDashboard user={user} />} {tab === 'library' && <OfficialLibrary user={user} />} {tab === 'lessons' && <LessonManager user={user} />} {tab === 'roadmap' && <RoadmapEditor user={user} />} {tab === 'review' && <ModerationQueue user={user} />} {tab === 'problemReviews' && <ProblemSubmissionQueue />} {tab === 'collections' && <ProblemCollectionManager user={user} />} {tab === 'reviewerTickets' && <ReviewerTicketPanel />} {tab === 'requests' && user.role === 'owner' && <RequestsPanel />} {tab === 'users' && user.role === 'owner' && <AccountManager user={user} />} {tab === 'database' && user.role === 'owner' && <DatabaseManager user={user} />} {tab === 'logs' && user.role === 'owner' && <LogPanel />} {tab === 'files' && <FileManager user={user} />}</div></main>
  </div>;
}

function RequestsPanel() {
  const [items, setItems] = useState<any[]>([]); const [message, setMessage] = useState('');
  async function load() { try { setItems(await api.requests()); } catch (e: any) { setMessage(e.message); } }
  useEffect(() => { load(); }, []);
  async function review(id: string, status: 'approved' | 'rejected') { try { await api.reviewRequest(id, status); setMessage(status === 'approved' ? 'درخواست همکاری تأیید شد.' : 'درخواست رد شد.'); load(); } catch (e: any) { setMessage(e.message); } }
  return <div><div className="mb-7"><div className="eyebrow"><Users size={14} /> Headmaster Approval</div><h1 className="text-3xl font-black text-white mt-2">درخواست‌های همکاری</h1><p className="text-slate-500 mt-2">بررسی درخواست کاربران برای پیوستن به جریان محتوای CupHead.</p></div>{message && <div className="text-sm text-cyan-200 mb-4">{message}</div>}<div className="space-y-4">{items.map(x => <article key={x.id} className="glass-card rounded-2xl p-5 flex flex-col md:flex-row gap-4 justify-between"><div><div className="text-xs text-slate-500">{x.userName} · @{x.username}</div><div className="text-sm text-cyan-200 mt-2">Telegram: {x.telegramId || 'ثبت نشده'}</div><p className="text-slate-200 mt-3 leading-7">{x.motivation}</p><p className="text-sm text-slate-500 mt-2">{x.experience}</p></div><div className="flex gap-2 items-start"><span className="meta-chip">{x.status}</span>{x.status === 'pending' && <><button onClick={() => review(x.id, 'approved')} className="btn-muted !text-emerald-300">تأیید</button><button onClick={() => review(x.id, 'rejected')} className="btn-muted !text-red-300">رد</button></>}</div></article>)}{!items.length && <div className="glass-card rounded-2xl p-12 text-center text-slate-500">درخواستی وجود ندارد.</div>}</div></div>;
}

function Login({ onLogin, onBack }: { onLogin: (u: SessionUser) => void; onBack: () => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [copiedTelegram, setCopiedTelegram] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const r = await api.login(username, password);
      if (!r?.token) {
        throw new Error('توکن احراز هویت دریافت نشد.');
      }
      setAuthToken(r.token);
      onLogin(r.user);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  function copyTelegramHandle() {
    navigator.clipboard?.writeText('@WhoMan_H');
    setCopiedTelegram(true);
    setTimeout(() => setCopiedTelegram(false), 2000);
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(37,99,235,.22),transparent_32rem)]" />
      <form onSubmit={submit} className="relative z-10 glass-card rounded-3xl p-7 sm:p-9 w-full max-w-md">
        <button type="button" onClick={onBack} className="back-link mb-7">
          <ArrowRight size={15} /> بازگشت به سایت
        </button>
        <img src="/icon.png" alt="CupHead" className="w-14 h-14 rounded-2xl mb-5" />
        <h1 className="text-3xl font-black text-white">ورود به مدیریت</h1>
        <p className="text-slate-500 text-sm mt-2 mb-7">برای Headmaster و Admin.</p>
        <label className="field-label block">
          نام کاربری یا ایمیل
          <input className="input-ui mt-2 mb-4" placeholder="نام کاربری یا ایمیل" autoComplete="username" value={username} onChange={e => setUsername(e.target.value)} />
        </label>
        <label className="field-label block">
          <div className="flex items-center justify-between">
            <span>رمز عبور</span>
            <button
              type="button"
              onClick={() => setShowForgot(true)}
              className="text-xs text-cyan-400 hover:text-cyan-300 transition hover:underline"
            >
              فراموشی رمز عبور؟
            </button>
          </div>
          <input className="input-ui mt-2" type="password" placeholder="رمز عبور" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} />
        </label>
        {error && <div className="error-note mt-4">{error}</div>}
        <button disabled={busy} className="btn-primary w-full mt-6">
          {busy ? 'در حال ورود...' : 'ورود'}
        </button>
      </form>

      {showForgot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="glass-card rounded-3xl p-6 sm:p-8 max-w-md w-full border border-cyan-400/30 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative">
            <button
              type="button"
              onClick={() => setShowForgot(false)}
              className="absolute top-5 left-5 text-slate-400 hover:text-white p-2 rounded-xl bg-white/5 hover:bg-white/10 transition"
            >
              <X size={18} />
            </button>
            <div className="w-12 h-12 rounded-2xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center mb-4">
              <MessageCircle size={24} className="text-cyan-400" />
            </div>
            <h2 className="text-2xl font-black text-white">فراموشی رمز عبور</h2>
            <p className="text-slate-300 text-sm mt-3 leading-relaxed">
              جهت بازیابی یا بازنشانی رمز عبور، لطفاً در تلگرام به آیدی زیر پیام دهید:
            </p>
            <div className="mt-5 p-4 rounded-2xl bg-slate-900/90 border border-slate-700/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400">
                  <Send size={17} />
                </div>
                <div>
                  <div className="text-xs text-slate-400">آیدی تلگرام مدیریت:</div>
                  <div className="text-base font-bold text-cyan-300 font-mono" dir="ltr">@WhoMan_H</div>
                </div>
              </div>
              <button
                type="button"
                onClick={copyTelegramHandle}
                className="btn-muted !py-1.5 !px-3 text-xs flex items-center gap-1.5"
                title="کپی آیدی"
              >
                {copiedTelegram ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                <span>{copiedTelegram ? 'کپی شد' : 'کپی'}</span>
              </button>
            </div>
            <div className="mt-5 flex flex-col gap-2.5">
              <a
                href="https://t.me/WhoMan_H"
                target="_blank"
                rel="noreferrer"
                className="btn-primary w-full flex items-center justify-center gap-2 text-center"
              >
                <Send size={16} />
                ارسال پیام به @WhoMan_H در تلگرام
              </a>
              <button
                type="button"
                onClick={() => setShowForgot(false)}
                className="btn-muted w-full py-2.5 text-sm"
              >
                بازگشت به ورود
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
