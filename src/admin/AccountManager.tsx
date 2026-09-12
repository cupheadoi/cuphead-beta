import { useEffect, useState } from 'react';
import { Shield, Trash2, UserCog, X } from 'lucide-react';
import { api } from '../lib/api';
import type { AdminUser, Role, SessionUser } from '../types';
import { confirmUnsavedChanges, useUnsavedChanges } from '../hooks/useUnsavedChanges';

const labels: Record<Role, string> = { owner: 'Headmaster', admin: 'Admin', reviewer: 'Reviewer', user: 'Normal' };
const abilityLabels: Record<string, string> = { manage_library: 'کتابخانه رسمی', manage_lessons: 'درس‌ها', manage_roadmap: 'نقشه راه', review_contributions: 'مشارکت‌ها', review_problems: 'مسئله‌های پیشنهادی', manage_files: 'فایل‌ها' };
const creatableRoles: Role[] = ['admin', 'reviewer', 'user'];

export default function AccountManager({ user }: { user: SessionUser }) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [adminsOnly, setAdminsOnly] = useState(true);
  const [message, setMessage] = useState('');
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [abilities, setAbilities] = useState<Record<string, boolean>>({});
  const [dirty, setDirty] = useState(false);
  const [form, setForm] = useState({ username: '', email: '', firstName: '', lastName: '', password: '', role: 'admin' as Role });
  useUnsavedChanges(dirty);

  async function load() { setUsers(await api.users()); }
  useEffect(() => { load(); }, []);
  function updateForm(key: keyof typeof form, value: string) { setDirty(true); setForm(current => ({ ...current, [key]: value })); }
  async function add() { try { await api.createUser(form); setMessage('حساب ساخته شد.'); setForm({ username: '', email: '', firstName: '', lastName: '', password: '', role: 'admin' }); setDirty(false); load(); } catch (e: any) { setMessage(e.message); } }
  async function change(id: string, role: string) { try { await api.updateRole(id, role); load(); } catch (e: any) { setMessage(e.message); } }
  function openAbilities(account: AdminUser) { if (!confirmUnsavedChanges()) return; setEditing(account); setAbilities({ ...account.abilities }); setDirty(false); }
  async function saveAbilities() { if (!editing) return; try { await api.updateAdminAbilities(editing.id, abilities); setMessage('دسترسی‌های ادمین ذخیره شد.'); setEditing(null); setDirty(false); load(); } catch (e: any) { setMessage(e.message); } }
  const shown = users.filter(account => !adminsOnly || account.role !== 'user');
  return <div>
    <div className="mb-7"><div className="eyebrow"><UserCog size={14} /> Headmaster Console</div><h1 className="text-3xl font-black text-white mt-2">مدیریت حساب‌ها و سطح دسترسی</h1><p className="text-slate-500 mt-2">نقش و پنل‌های قابل مشاهده‌ی هر Admin را کنترل کنید.</p></div>
    <div className="glass-card rounded-2xl p-5 mb-5"><h2 className="font-bold text-white mb-4">ساخت حساب جدید</h2><div className="grid md:grid-cols-2 xl:grid-cols-6 gap-3"><input className="input-ui" placeholder="نام کاربری" value={form.username} onChange={e => updateForm('username', e.target.value)} /><input className="input-ui" type="email" placeholder="ایمیل" value={form.email} onChange={e => updateForm('email', e.target.value)} /><input className="input-ui" placeholder="نام" value={form.firstName} onChange={e => updateForm('firstName', e.target.value)} /><input className="input-ui" placeholder="نام خانوادگی" value={form.lastName} onChange={e => updateForm('lastName', e.target.value)} /><input className="input-ui" type="password" placeholder="رمز عبور" value={form.password} onChange={e => updateForm('password', e.target.value)} /><select className="input-ui" value={form.role} onChange={e => updateForm('role', e.target.value)}>{creatableRoles.map(role => <option key={role} value={role}>{labels[role]}</option>)}</select></div><button onClick={add} className="btn-primary mt-4">ساخت حساب</button>{message && <span className="text-sm text-cyan-200 ms-3">{message}</span>}</div>
    <label className="flex items-center gap-2 text-sm text-slate-300 mb-4"><input type="checkbox" checked={adminsOnly} onChange={e => setAdminsOnly(e.target.checked)} /> فقط ادمین‌ها (پنهان کردن کاربران عادی)</label>
    <div className="glass-card rounded-2xl divide-y divide-dark-border">{shown.map(account => <div key={account.id} className="p-4 flex flex-wrap items-center gap-3"><div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center"><Shield size={17} className="text-blue-300" /></div><div className="flex-1 min-w-40"><div className="font-bold text-slate-200">{account.displayName}</div><div className="text-xs text-slate-500">@{account.username}</div></div>{user.id === account.id ? <span className="meta-chip text-cyan-200">حساب شما · Headmaster</span> : <><select className="input-ui !w-auto" value={account.reviewer ? 'reviewer' : account.role} onChange={e => change(account.id, e.target.value)}>{creatableRoles.map(role => <option key={role} value={role}>{labels[role]}</option>)}</select>{account.role === 'admin' && !account.reviewer && <button onClick={() => openAbilities(account)} className="btn-muted !py-2 !px-3 text-xs"><UserCog size={14} /> مدیریت Admin</button>}<button onClick={async () => { if (confirm('این حساب حذف شود؟')) { await api.deleteUser(account.id); load(); } }} className="btn-muted !p-2 !text-red-300"><Trash2 size={15} /></button></>}</div>)}{!shown.length && <div className="p-10 text-center text-slate-500">حسابی برای نمایش نیست.</div>}</div>
    {editing && <div className="modal-backdrop"><div className="glass-card rounded-3xl p-6 w-full max-w-lg"><div className="flex justify-between items-center"><div><div className="eyebrow">Admin permissions</div><h2 className="text-2xl font-black text-white mt-2">مدیریت دسترسی @{editing.username}</h2></div><button onClick={() => { if (confirmUnsavedChanges()) setEditing(null); }} className="icon-btn"><X size={17} /></button></div><div className="space-y-3 mt-6">{Object.entries(abilityLabels).map(([key, label]) => <label key={key} className="flex items-center gap-3 rounded-xl border border-dark-border px-4 py-3 text-sm text-slate-300"><input type="checkbox" checked={Boolean(abilities[key])} onChange={e => { setDirty(true); setAbilities(current => ({ ...current, [key]: e.target.checked })); }} />{label}</label>)}</div><button onClick={saveAbilities} className="btn-primary w-full mt-6">ذخیره دسترسی‌ها</button></div></div>}
  </div>;
}
