import { useState } from 'react';
import { ArrowRight, Check, Copy, KeyRound, LogIn, MessageCircle, Send, UserPlus, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import { api, setAuthToken } from './lib/api';

const grades = ['پایه هفتم', 'پایه هشتم', 'پایه نهم', 'پایه دهم', 'پایه یازدهم', 'پایه دوازدهم', 'فارغ‌التحصیل'];

export default function AuthPage() {
  const nav = useNavigate();
  const loc = useLocation();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({ username: '', password: '', email: '', firstName: '', lastName: '', grade: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [copiedTelegram, setCopiedTelegram] = useState(false);
  const next = new URLSearchParams(loc.search).get('next') || '/profile';

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const r = mode === 'login' ? await api.login(form.username, form.password) : await api.register(form);
      if (!r?.token) {
        throw new Error('توکن احراز هویت دریافت نشد.');
      }
      setAuthToken(r.token);
      nav(next);
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
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-xl mx-auto px-4 py-12">
        <form onSubmit={submit} className="glass-card rounded-3xl p-7 sm:p-9 relative">
          <button type="button" onClick={() => nav('/')} className="back-link mb-7">
            <ArrowRight size={15} /> بازگشت
          </button>
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-5">
            <KeyRound className="text-blue-300" />
          </div>
          <h1 className="text-3xl font-black text-white">
            {mode === 'login' ? 'ورود به CupHead' : 'ساخت حساب کاربری'}
          </h1>
          <p className="text-slate-500 mt-2 mb-7">
            {mode === 'login' ? 'با نام کاربری یا ایمیل وارد حساب کاربری خود شوید.' : 'تمامی فیلدها برای ساخت حساب کاربری الزامی هستند.'}
          </p>

          {mode === 'register' && (
            <>
              <div className="grid sm:grid-cols-2 gap-3">
                <label className="field-label">
                  نام <span className="text-cyan-300 font-bold">*</span>
                  <input required className="input-ui mt-2 mb-4" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} />
                </label>
                <label className="field-label">
                  نام خانوادگی <span className="text-cyan-300 font-bold">*</span>
                  <input required className="input-ui mt-2 mb-4" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} />
                </label>
              </div>
              <label className="field-label block">
                ایمیل <span className="text-cyan-300 font-bold">*</span>
                <input required type="email" className="input-ui mt-2 mb-4" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </label>
              <label className="field-label block">
                پایه تحصیلی <span className="text-cyan-300 font-bold">*</span>
                <select required className="input-ui mt-2 mb-4" value={form.grade} onChange={e => setForm({ ...form, grade: e.target.value })}>
                  <option value="">انتخاب کنید</option>
                  {grades.map(g => <option key={g}>{g}</option>)}
                </select>
              </label>
            </>
          )}

          <label className="field-label block">
            {mode === 'register' ? (
              <>
                نام کاربری <span className="text-cyan-300 font-bold">*</span>
              </>
            ) : (
              'نام کاربری یا ایمیل'
            )}
            <input
              className="input-ui mt-2 mb-4"
              required
              autoComplete="username"
              placeholder={mode === 'register' ? 'یک نام کاربری انتخاب کنید' : 'نام کاربری یا ایمیل خود را وارد کنید'}
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
            />
          </label>

          <label className="field-label block">
            <div className="flex items-center justify-between">
              <span>
                رمز عبور {mode === 'register' && <span className="text-cyan-300 font-bold">*</span>}
              </span>
              {mode === 'login' && (
                <button
                  type="button"
                  onClick={() => setShowForgot(true)}
                  className="text-xs text-cyan-400 hover:text-cyan-300 transition hover:underline"
                >
                  فراموشی رمز عبور؟
                </button>
              )}
            </div>
            <input
              className="input-ui mt-2"
              required
              type="password"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
            />
          </label>

          {error && <div className="error-note mt-4">{error}</div>}

          <button disabled={busy} className="btn-primary w-full mt-6">
            <LogIn size={17} />
            {busy ? 'در حال پردازش...' : mode === 'login' ? 'ورود' : 'ثبت‌نام'}
          </button>

          <button
            type="button"
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
            className="w-full mt-5 text-sm text-slate-500 hover:text-cyan-300 transition flex justify-center items-center gap-2"
          >
            {mode === 'login' ? (
              <><UserPlus size={15} />حساب ندارم، ثبت‌نام می‌کنم</>
            ) : (
              <>حساب دارم، وارد می‌شوم</>
            )}
          </button>
        </form>

        {/* Forgot Password Section / Modal */}
        {showForgot && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
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
                جهت بازیابی یا بازنشانی رمز عبور حساب خود در CupHead، لطفاً در تلگرام به آیدی زیر پیام دهید:
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
                  بازگشت به صفحه ورود
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
