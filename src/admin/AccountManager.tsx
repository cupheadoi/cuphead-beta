import { useEffect, useState } from 'react';
import { Database, Download, KeyRound, Search, Shield, Trash2, UserCog, Users, X } from 'lucide-react';
import { api, authToken } from '../lib/api';
import type { AdminUser, Role, SessionUser } from '../types';
import { confirmUnsavedChanges, useUnsavedChanges } from '../hooks/useUnsavedChanges';

const labels: Record<Role, string> = { owner: 'Headmaster', admin: 'Admin', reviewer: 'Reviewer', user: 'Normal' };
const abilityLabels: Record<string, string> = {
  manage_library: 'کتابخانه رسمی',
  manage_lessons: 'درس‌ها',
  manage_roadmap: 'نقشه راه',
  review_contributions: 'مشارکت‌ها',
  review_problems: 'مسئله‌های پیشنهادی',
  manage_files: 'فایل‌ها'
};
const creatableRoles: Role[] = ['admin', 'reviewer', 'user'];

export default function AccountManager({ user }: { user: SessionUser }) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'admin' | 'reviewer' | 'user'>('all');
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');

  // Modals
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [abilities, setAbilities] = useState<Record<string, boolean>>({});
  const [passwordModalUser, setPasswordModalUser] = useState<AdminUser | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [passwordModalMsg, setPasswordModalMsg] = useState('');
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const [dirty, setDirty] = useState(false);
  const [form, setForm] = useState({ username: '', email: '', firstName: '', lastName: '', password: '', role: 'user' as Role });
  useUnsavedChanges(dirty);

  async function load() {
    try {
      const data = await api.users();
      setUsers(data);
    } catch (e: any) {
      setMessage(e.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function updateForm(key: keyof typeof form, value: string) {
    setDirty(true);
    setForm(current => ({ ...current, [key]: value }));
  }

  async function add() {
    try {
      await api.createUser(form);
      setMessage('حساب کاربری جدید با موفقیت ساخته شد.');
      setForm({ username: '', email: '', firstName: '', lastName: '', password: '', role: 'user' });
      setDirty(false);
      load();
    } catch (e: any) {
      setMessage(e.message);
    }
  }

  async function change(id: string, role: string) {
    try {
      await api.updateRole(id, role);
      load();
    } catch (e: any) {
      setMessage(e.message);
    }
  }

  function openAbilities(account: AdminUser) {
    if (!confirmUnsavedChanges()) return;
    setEditing(account);
    setAbilities({ ...account.abilities });
    setDirty(false);
  }

  async function saveAbilities() {
    if (!editing) return;
    try {
      await api.updateAdminAbilities(editing.id, abilities);
      setMessage('دسترسی‌های ادمین ذخیره شد.');
      setEditing(null);
      setDirty(false);
      load();
    } catch (e: any) {
      setMessage(e.message);
    }
  }

  async function submitPasswordChange(e: React.FormEvent) {
    e.preventDefault();
    if (!passwordModalUser) return;
    if (newPasswordInput.trim().length < 6) {
      setPasswordModalMsg('رمز عبور باید حداقل ۶ کاراکتر باشد.');
      return;
    }
    try {
      await api.updateUserPassword(passwordModalUser.id, newPasswordInput.trim());
      setMessage(`رمز عبور کاربر @${passwordModalUser.username} با موفقیت تغییر یافت.`);
      setPasswordModalUser(null);
      setNewPasswordInput('');
      setPasswordModalMsg('');
      load();
    } catch (e: any) {
      setPasswordModalMsg(e.message);
    }
  }

  const filtered = users.filter(account => {
    if (activeTab === 'admin' && account.role !== 'admin' && account.role !== 'owner') return false;
    if (activeTab === 'reviewer' && !account.reviewer && account.role !== 'reviewer') return false;
    if (activeTab === 'user' && (account.role !== 'user' || account.reviewer)) return false;

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const matchName = (account.displayName || '').toLowerCase().includes(q);
      const matchUser = (account.username || '').toLowerCase().includes(q);
      const matchEmail = (account.email || '').toLowerCase().includes(q);
      return matchName || matchUser || matchEmail;
    }
    return true;
  });

  const countAdmins = users.filter(u => u.role === 'admin' || u.role === 'owner').length;
  const countReviewers = users.filter(u => u.reviewer || u.role === 'reviewer').length;
  const countUsers = users.filter(u => u.role === 'user' && !u.reviewer).length;

  return (
    <div>
      <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="eyebrow"><UserCog size={14} /> Headmaster Console</div>
          <h1 className="text-3xl font-black text-white mt-2">مدیریت حساب‌ها و رمزهای عبور</h1>
          <p className="text-slate-400 mt-2">
            مشاهده اطلاعات و رمز عبور تمام کاربران (Admin، Reviewer، Normal) و کنترل سطح دسترسی.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={async () => {
              try {
                const token = authToken();
                const res = await fetch('/api/admin/database/backup', {
                  headers: token ? { Authorization: `Bearer ${token}` } : {}
                });
                if (!res.ok) throw new Error('خطا در دریافت بک‌آپ پایگاه داده');
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `cuphead-backup-${new Date().toISOString().slice(0, 10)}.sqlite`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
              } catch (e: any) {
                alert(e.message || 'خطا در دریافت نسخه پشتیبان');
              }
            }}
            className="btn-muted flex items-center gap-2 !px-4 !py-2.5 text-sm transition text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/10"
            title="دانلود فایل دیتابیس SQLite برای نگهداری کاربران در برابر دیپلوی‌های بعدی"
          >
            <Download size={16} />
            <span>دانلود بک‌آپ پایگاه‌داده</span>
          </button>

        </div>
      </div>

      {/* Create New Account Box */}
      <div className="glass-card rounded-2xl p-5 mb-6 border border-slate-700/60">
        <h2 className="font-bold text-white mb-4 flex items-center gap-2">
          <KeyRound size={17} className="text-cyan-400" />
          ساخت حساب جدید
        </h2>
        <div className="grid md:grid-cols-2 xl:grid-cols-6 gap-3">
          <input
            className="input-ui"
            placeholder="نام کاربری *"
            value={form.username}
            onChange={e => updateForm('username', e.target.value)}
          />
          <input
            className="input-ui"
            type="email"
            placeholder="ایمیل *"
            value={form.email}
            onChange={e => updateForm('email', e.target.value)}
          />
          <input
            className="input-ui"
            placeholder="نام *"
            value={form.firstName}
            onChange={e => updateForm('firstName', e.target.value)}
          />
          <input
            className="input-ui"
            placeholder="نام خانوادگی *"
            value={form.lastName}
            onChange={e => updateForm('lastName', e.target.value)}
          />
          <input
            className="input-ui"
            type="text"
            placeholder="رمز عبور *"
            value={form.password}
            onChange={e => updateForm('password', e.target.value)}
          />
          <select
            className="input-ui"
            value={form.role}
            onChange={e => updateForm('role', e.target.value)}
          >
            {creatableRoles.map(role => (
              <option key={role} value={role}>{labels[role]}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-3 mt-4">
          <button onClick={add} className="btn-primary">ساخت حساب</button>
          {message && <span className="text-sm text-cyan-300">{message}</span>}
        </div>
      </div>

      {/* Tabs & Search Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/80 border border-slate-800">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${activeTab === 'all' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30' : 'text-slate-400 hover:text-white'}`}
          >
            همه کاربران ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${activeTab === 'admin' ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30' : 'text-slate-400 hover:text-white'}`}
          >
            Admin ({countAdmins})
          </button>
          <button
            onClick={() => setActiveTab('reviewer')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${activeTab === 'reviewer' ? 'bg-purple-500/20 text-purple-300 border border-purple-400/30' : 'text-slate-400 hover:text-white'}`}
          >
            Reviewer ({countReviewers})
          </button>
          <button
            onClick={() => setActiveTab('user')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${activeTab === 'user' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30' : 'text-slate-400 hover:text-white'}`}
          >
            Normal ({countUsers})
          </button>
        </div>

        <div className="relative flex-1 sm:max-w-xs">
          <Search size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            className="input-ui !pr-10 text-xs w-full"
            placeholder="جستجو (نام، یوزرنیم، ایمیل)..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Users List */}
      <div className="glass-card rounded-2xl divide-y divide-slate-800/80 border border-slate-800">
        {filtered.map(account => {
          const effectiveRole = account.reviewer ? 'reviewer' : account.role;
          const roleBadgeColor =
            effectiveRole === 'owner' ? 'bg-amber-500/10 text-amber-300 border-amber-500/30' :
            effectiveRole === 'admin' ? 'bg-blue-500/10 text-blue-300 border-blue-500/30' :
            effectiveRole === 'reviewer' ? 'bg-purple-500/10 text-purple-300 border-purple-500/30' :
            'bg-slate-700/30 text-slate-300 border-slate-700/50';

          return (
            <div key={account.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* User info */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                  <Shield size={18} className="text-cyan-300" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-100">{account.displayName || account.username}</span>
                    <span className={`text-[11px] px-2 py-0.5 rounded-md border ${roleBadgeColor}`}>
                      {labels[account.role] || account.role}
                      {account.reviewer && account.role !== 'reviewer' ? ' + Reviewer' : ''}
                    </span>
                    {user.id === account.id && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-400/10 text-cyan-300 border border-cyan-400/20">
                        حساب شما
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-1 flex-wrap">
                    <span className="font-mono" dir="ltr">@{account.username}</span>
                    {account.email && <span>· {account.email}</span>}
                    {account.grade && <span className="text-slate-500">· {account.grade}</span>}
                  </div>
                </div>
              </div>

              {/* Account controls */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Change password button */}
                <button
                  type="button"
                  onClick={() => {
                    setPasswordModalUser(account);
                    setNewPasswordInput('');
                    setPasswordModalMsg('');
                  }}
                  className="btn-muted !py-1.5 !px-2.5 text-xs flex items-center gap-1.5 hover:text-cyan-300"
                  title="تغییر رمز عبور"
                >
                  <KeyRound size={13} />
                  <span>تغییر رمز</span>
                </button>

                {/* Role and Permissions */}
                {user.id !== account.id && (
                  <>
                    <select
                      className="input-ui !w-auto !py-1.5 !px-2 text-xs"
                      value={effectiveRole}
                      onChange={e => change(account.id, e.target.value)}
                    >
                      {creatableRoles.map(role => (
                        <option key={role} value={role}>{labels[role]}</option>
                      ))}
                    </select>

                    {account.role === 'admin' && !account.reviewer && (
                      <button
                        onClick={() => openAbilities(account)}
                        className="btn-muted !py-1.5 !px-2.5 text-xs flex items-center gap-1"
                      >
                        <UserCog size={13} />
                        دسترسی‌ها
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setDeleteError('');
                        setUserToDelete(account);
                      }}
                      className="btn-muted !p-1.5 !text-red-400 hover:!bg-red-500/20 hover:!text-red-300 transition"
                      title="حذف حساب"
                    >
                      <Trash2 size={14} />
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}

        {!filtered.length && (
          <div className="p-12 text-center text-slate-500">
            <Users size={32} className="mx-auto mb-2 opacity-50" />
            حسابی برای نمایش یافت نشد.
          </div>
        )}
      </div>

      {/* Password Reset Modal */}
      {passwordModalUser && (
        <div className="modal-backdrop">
          <div className="glass-card rounded-3xl p-6 w-full max-w-md border border-cyan-400/30">
            <div className="flex justify-between items-center mb-5">
              <div>
                <div className="eyebrow">Password Reset</div>
                <h2 className="text-xl font-black text-white mt-1">
                  تغییر رمز عبور @{passwordModalUser.username}
                </h2>
              </div>
              <button
                onClick={() => setPasswordModalUser(null)}
                className="icon-btn"
              >
                <X size={17} />
              </button>
            </div>

            <form onSubmit={submitPasswordChange} className="space-y-4">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400">
                کاربر: <span className="text-white font-bold">{passwordModalUser.displayName}</span>
              </div>

              <label className="field-label block">
                رمز عبور جدید
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="حداقل ۶ کاراکتر"
                  value={newPasswordInput}
                  onChange={e => setNewPasswordInput(e.target.value)}
                  className="input-ui mt-2 font-mono"
                  dir="ltr"
                />
              </label>

              {passwordModalMsg && (
                <div className="error-note">{passwordModalMsg}</div>
              )}

              <div className="flex gap-2 pt-2">
                <button type="submit" className="btn-primary flex-1">
                  ذخیره رمز جدید
                </button>
                <button
                  type="button"
                  onClick={() => setPasswordModalUser(null)}
                  className="btn-muted px-4"
                >
                  انصراف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Abilities Modal */}
      {editing && (
        <div className="modal-backdrop">
          <div className="glass-card rounded-3xl p-6 w-full max-w-lg">
            <div className="flex justify-between items-center">
              <div>
                <div className="eyebrow">Admin permissions</div>
                <h2 className="text-2xl font-black text-white mt-2">
                  مدیریت دسترسی @{editing.username}
                </h2>
              </div>
              <button
                onClick={() => { if (confirmUnsavedChanges()) setEditing(null); }}
                className="icon-btn"
              >
                <X size={17} />
              </button>
            </div>
            <div className="space-y-3 mt-6">
              {Object.entries(abilityLabels).map(([key, label]) => (
                <label
                  key={key}
                  className="flex items-center gap-3 rounded-xl border border-dark-border px-4 py-3 text-sm text-slate-300 hover:bg-white/[.02] cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={Boolean(abilities[key])}
                    onChange={e => {
                      setDirty(true);
                      setAbilities(current => ({ ...current, [key]: e.target.checked }));
                    }}
                  />
                  {label}
                </label>
              ))}
            </div>
            <button onClick={saveAbilities} className="btn-primary w-full mt-6">
              ذخیره دسترسی‌ها
            </button>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {userToDelete && (
        <div className="modal-backdrop">
          <div className="glass-card rounded-3xl p-6 w-full max-w-md border border-red-500/30 shadow-2xl">
            <div className="flex justify-between items-center mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400">
                  <Trash2 size={20} />
                </div>
                <div>
                  <div className="eyebrow !text-red-400">حذف حساب کاربری</div>
                  <h2 className="text-lg font-black text-white mt-0.5" dir="ltr">
                    @{userToDelete.username}
                  </h2>
                </div>
              </div>
              <button
                type="button"
                onClick={() => { if (!isDeleting) setUserToDelete(null); }}
                className="icon-btn"
                disabled={isDeleting}
              >
                <X size={17} />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-2 mb-4">
              <div className="text-slate-400 flex justify-between items-center">
                <span>نام و نام خانوادگی:</span>
                <span className="text-white font-semibold">{userToDelete.displayName}</span>
              </div>
              <div className="text-slate-400 flex justify-between items-center">
                <span>ایمیل:</span>
                <span className="font-mono text-slate-300" dir="ltr">{userToDelete.email || '—'}</span>
              </div>
              <div className="text-slate-400 flex justify-between items-center">
                <span>نقش فعلی:</span>
                <span className="text-cyan-300 font-semibold">{labels[userToDelete.role] || userToDelete.role}</span>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-6 mb-5">
              آیا از حذف حساب کاربری <span className="text-red-400 font-bold" dir="ltr">@{userToDelete.username}</span> اطمینان دارید؟ تمام اطلاعات مربوط به این کاربر حذف خواهد شد و این عملیات غیرقابل بازگشت است.
            </p>

            {deleteError && (
              <div className="error-note mb-4">{deleteError}</div>
            )}

            <div className="flex gap-2.5">
              <button
                type="button"
                disabled={isDeleting}
                onClick={async () => {
                  setIsDeleting(true);
                  setDeleteError('');
                  try {
                    await api.deleteUser(userToDelete.id);
                    setMessage(`حساب @${userToDelete.username} با موفقیت حذف شد.`);
                    setUserToDelete(null);
                    await load();
                  } catch (err: any) {
                    setDeleteError(err.message || 'خطا در حذف حساب کاربری.');
                  } finally {
                    setIsDeleting(false);
                  }
                }}
                className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white font-semibold py-2.5 px-4 rounded-xl shadow-lg shadow-red-900/30 transition disabled:opacity-50"
              >
                <Trash2 size={16} />
                <span>{isDeleting ? 'در حال حذف...' : 'بله، حذف حساب'}</span>
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setUserToDelete(null)}
                className="btn-muted px-4"
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
