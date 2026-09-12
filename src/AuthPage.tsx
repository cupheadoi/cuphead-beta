import { useState } from 'react';
import { ArrowRight,KeyRound,LogIn,UserPlus } from 'lucide-react';
import { useLocation,useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import { api,setAuthToken } from './lib/api';
const grades=['پایه هفتم','پایه هشتم','پایه نهم','پایه دهم','پایه یازدهم','پایه دوازدهم','فارغ‌التحصیل'];
export default function AuthPage(){const nav=useNavigate();const loc=useLocation();const [mode,setMode]=useState<'login'|'register'>('login');const [form,setForm]=useState({username:'',password:'',email:'',firstName:'',lastName:'',grade:''});const [error,setError]=useState('');const [busy,setBusy]=useState(false);const next=new URLSearchParams(loc.search).get('next')||'/profile';  async function submit(e: React.FormEvent) {
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
  }return <div className="min-h-screen"><Navbar/><main className="max-w-xl mx-auto px-4 py-12"><form onSubmit={submit} className="glass-card rounded-3xl p-7 sm:p-9"><button type="button" onClick={()=>nav('/')} className="back-link mb-7"><ArrowRight size={15}/> بازگشت</button><div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-5"><KeyRound className="text-blue-300"/></div><h1 className="text-3xl font-black text-white">{mode==='login'?'ورود به CupHead':'ساخت حساب کاربری'}</h1><p className="text-slate-500 mt-2 mb-7">ایمیل، نام و نام خانوادگی برای ساخت حساب الزامی است.</p>{mode==='register'&&<><div className="grid sm:grid-cols-2 gap-3"><label className="field-label">نام <span className="text-cyan-300">*</span><input required className="input-ui mt-2 mb-4" value={form.firstName} onChange={e=>setForm({...form,firstName:e.target.value})}/></label><label className="field-label">نام خانوادگی <span className="text-cyan-300">*</span><input required className="input-ui mt-2 mb-4" value={form.lastName} onChange={e=>setForm({...form,lastName:e.target.value})}/></label></div><label className="field-label block">ایمیل <span className="text-cyan-300">(الزامی)</span><input required type="email" className="input-ui mt-2 mb-4" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></label><label className="field-label block">پایه تحصیلی<select required className="input-ui mt-2 mb-4" value={form.grade} onChange={e=>setForm({...form,grade:e.target.value})}><option value="">انتخاب کنید</option>{grades.map(g=><option key={g}>{g}</option>)}</select></label></>}<label className="field-label block">نام کاربری<input className="input-ui mt-2 mb-4" required autoComplete="username" value={form.username} onChange={e=>setForm({...form,username:e.target.value})}/></label><label className="field-label block">رمز عبور<input className="input-ui mt-2" required type="password" autoComplete={mode==='login'?'current-password':'new-password'} value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/></label>{error&&<div className="error-note mt-4">{error}</div>}<button disabled={busy} className="btn-primary w-full mt-6"><LogIn size={17}/>{busy?'در حال پردازش...':mode==='login'?'ورود':'ثبت‌نام'}</button><button type="button" onClick={()=>{setMode(mode==='login'?'register':'login');setError('')}} className="w-full mt-5 text-sm text-slate-500 hover:text-cyan-300 transition flex justify-center items-center gap-2">{mode==='login'?<><UserPlus size={15}/>حساب ندارم، ثبت‌نام می‌کنم</>:<>حساب دارم، وارد می‌شوم</>}</button></form></main></div>}
