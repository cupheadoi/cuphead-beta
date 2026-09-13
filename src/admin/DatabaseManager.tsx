import React, { useEffect, useRef, useState } from 'react';
import { 
  Database, 
  Download, 
  Upload, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  HardDrive, 
  Server, 
  ShieldCheck, 
  HelpCircle,
  FileCode2,
  Users,
  Layers,
  Info,
  AlertCircle
} from 'lucide-react';
import { api, authToken } from '../lib/api';
import type { SessionUser } from '../types';

interface DatabaseInfo {
  path: string;
  size: number;
  userCount: number;
  problemCount: number;
  isVercel: boolean;
  isCustomPath: boolean;
}

interface SyncStatus {
  hasToken: boolean;
  tokenValid?: boolean;
  tokenAuthFailed?: boolean;
  enabled: boolean;
  provider: string;
  lastSyncedAt: string | null;
  lastSyncError: string | null;
  lastBlobUrl: string | null;
  isSyncing: boolean;
  localFileSize: number;
}

export default function DatabaseManager({ user }: { user: SessionUser }) {
  const [info, setInfo] = useState<DatabaseInfo | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncingNow, setSyncingNow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Restore state
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const [confirmRestoreModal, setConfirmRestoreModal] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  async function loadInfo() {
    setLoading(true);
    setError(null);
    try {
      const [data, syncData] = await Promise.all([
        api.databaseInfo(),
        api.databaseSyncStatus().catch(() => null)
      ]);
      setInfo(data);
      if (syncData) setSyncStatus(syncData);
    } catch (err: any) {
      setError(err.message || 'خطا در دریافت وضعیت پایگاه‌داده.');
    } finally {
      setLoading(false);
    }
  }

  async function handleManualSync() {
    setSyncingNow(true);
    setError(null);
    try {
      const res = await api.databaseSyncNow();
      if (res.ok) {
        setSuccessMessage('پایگاه‌داده با موفقیت به فضای ابری Vercel Blob ارسال و ذخیره شد.');
        await loadInfo();
      } else {
        throw new Error(res.error || res.message || 'خطا در همگام‌سازی ابری');
      }
    } catch (err: any) {
      setError(err.message || 'خطا در همگام‌سازی ابری.');
    } finally {
      setSyncingNow(false);
    }
  }

  useEffect(() => {
    loadInfo();
  }, []);

  async function handleDownloadBackup() {
    try {
      const token = authToken();
      const res = await fetch('/api/admin/database/backup', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (!res.ok) throw new Error('خطا در دانلود فایل پشتیبان');
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cuphead-backup-${new Date().toISOString().slice(0, 10)}.sqlite`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setSuccessMessage('نسخه پشتیبان SQLite با موفقیت دانلود شد.');
    } catch (err: any) {
      setError(err.message || 'خطا در دانلود نسخه پشتیبان.');
    }
  }

  function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith('.sqlite') && !file.name.endsWith('.db')) {
      setError('لطفاً یک فایل با پسوند .sqlite یا .db انتخاب کنید.');
      return;
    }
    setRestoreFile(file);
    setConfirmRestoreModal(true);
  }

  async function executeRestore() {
    if (!restoreFile) return;
    setRestoring(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const res = await api.restoreDatabase(restoreFile);
      setSuccessMessage(res.message || 'پایگاه‌داده با موفقیت بازیابی شد.');
      setConfirmRestoreModal(false);
      setRestoreFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      await loadInfo();
    } catch (err: any) {
      setError(err.message || 'خطا در بازیابی پایگاه‌داده.');
    } finally {
      setRestoring(false);
    }
  }

  const formatSize = (bytes: number) => {
    if (!bytes) return '۰ کیلوبایت';
    if (bytes < 1024) return `${bytes} بایت`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} کیلوبایت`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} مگابایت`;
  };

  return (
    <div className="space-y-8 animate-fadeIn" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-700/40 pb-6">
        <div>
          <div className="eyebrow flex items-center gap-1.5 text-cyan-400 font-semibold mb-2">
            <Database size={15} />
            <span>مدیریت پایگاه‌داده و ماندگاری اطلاعات</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">پایگاه داده (SQLite) و پشتیبان‌گیری</h1>
          <p className="text-slate-400 text-sm mt-1.5 leading-relaxed">
            مدیریت کامل فایل پایگاه‌داده CupHead، پشتیبان‌گیری سریع، بازیابی اطلاعات و راهنمای استقرار پایدار روی سرور اختصاصی یا ابری.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={loadInfo} 
            disabled={loading}
            className="btn-muted flex items-center gap-2 text-xs"
            title="بروزرسانی وضعیت"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin text-cyan-400' : ''} />
            <span>بروزرسانی وضعیت</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 px-4 py-3 rounded-xl flex items-center gap-3 text-sm">
          <AlertTriangle size={18} className="shrink-0 text-rose-400" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="mr-auto text-xs text-rose-400 hover:text-white">بستن</button>
        </div>
      )}
      {successMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-4 py-3 rounded-xl flex items-center gap-3 text-sm">
          <CheckCircle2 size={18} className="shrink-0 text-emerald-400" />
          <span>{successMessage}</span>
          <button onClick={() => setSuccessMessage(null)} className="mr-auto text-xs text-emerald-400 hover:text-white">بستن</button>
        </div>
      )}

      {/* Vercel Ephemeral Warning if on Vercel */}
      {info?.isVercel && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 text-amber-200">
          <div className="flex items-start gap-3">
            <AlertTriangle size={22} className="shrink-0 text-amber-400 mt-0.5" />
            <div className="space-y-2 text-sm leading-relaxed">
              <h3 className="font-bold text-amber-300 text-base">محیط بدون دیسک Vercel (Serverless Ephemeral) فعال است</h3>
              <p className="text-amber-200/90">
                پلتفرم Vercel بر پایه توابع بدون سرور (Serverless) کار می‌کند و حافظه دیسک پایدار ندارد. در Vercel با هر دیپلوی جدید یا به خواب رفتن سرور، فایل‌های موقت در دایرکتوری <code className="bg-black/30 px-1.5 py-0.5 rounded text-amber-300 font-mono">/tmp</code> ریست می‌شوند.
              </p>
              <div className="pt-2 text-xs text-amber-300/90 flex flex-wrap gap-2">
                <span className="bg-amber-400/20 px-2 py-1 rounded-lg">راهکار موقت: قبل از هر دیپلوی، نسخه پشتیبان را دانلود کرده و پس از دیپلوی بازگردانید.</span>
                <span className="bg-amber-400/20 px-2 py-1 rounded-lg">راهکار دائمی: انتقال به سرور اختصاصی (VPS) یا سرویس‌های دارای دیسک مداوم (مانند Railway یا Render).</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-5 border border-slate-700/50 bg-slate-900/40">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-medium">موتور دیتابیس</span>
            <Database size={17} className="text-cyan-400" />
          </div>
          <div className="text-xl font-bold text-white">SQLite 3</div>
          <div className="text-xs text-slate-400 mt-1 font-mono truncate" title={info?.path || 'server/data/cuphead.sqlite'}>
            {info?.isVercel ? '/tmp/cuphead.sqlite' : (info?.path ? info.path.split('/').slice(-2).join('/') : 'cuphead.sqlite')}
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-700/50 bg-slate-900/40">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-medium">حجم پایگاه‌داده</span>
            <HardDrive size={17} className="text-indigo-400" />
          </div>
          <div className="text-xl font-bold text-white">{info ? formatSize(info.size) : '---'}</div>
          <div className="text-xs text-slate-400 mt-1">تک‌فایل و کاملاً پرتابل</div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-700/50 bg-slate-900/40">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-medium">کاربران ثبت‌شده</span>
            <Users size={17} className="text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-white">{info ? info.userCount.toLocaleString('fa-IR') : '---'}</div>
          <div className="text-xs text-emerald-400/80 mt-1">حساب‌های کاربری فعال</div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-700/50 bg-slate-900/40">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-medium">نوع ماندگاری</span>
            <Server size={17} className={syncStatus?.enabled ? 'text-emerald-400' : (info?.isVercel ? 'text-amber-400' : 'text-cyan-400')} />
          </div>
          <div className="text-xl font-bold text-white">
            {syncStatus?.enabled ? 'دائمی (Vercel Blob)' : (info?.isVercel ? 'موقت (دیسک محلی)' : 'دائمی (سرور شخصی)')}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {syncStatus?.enabled ? 'پایداری خودکار در برابر دیپلوی' : (info?.isVercel ? 'نیازمند تنظیم توکن یا بک‌آپ' : 'حفظ ۱۰۰٪ داده‌ها روی هارد')}
          </div>
        </div>
      </div>

      {/* Cloud Sync Status Card (Vercel Blob & SQLite Bridge) */}
      <div className="glass-card rounded-2xl p-6 border border-slate-700/60 bg-gradient-to-br from-slate-900/80 to-slate-900/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${syncStatus?.enabled ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'}`}>
              <Database size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">همگام‌سازی ابری Vercel Blob (پایداری در برابر دیپلوی)</h3>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${syncStatus?.enabled ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300' : 'bg-slate-700/50 border-slate-600 text-slate-400'}`}>
                  {syncStatus?.enabled ? 'فعال و متصل' : 'حالت لوکال SQLite'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {syncStatus?.enabled 
                  ? 'تمامی تغییرات و کاربران به‌طور خودکار روی مخزن ابری Vercel Blob ذخیره می‌شوند و در دیپلوی‌های بعدی گیت‌هاب پایدار می‌مانند.'
                  : 'دیتابیس در حالت استاندارد محلی SQLite اجرا می‌شود. برای فعال‌سازی خودکار پایداری در ورسل، کافیست متغیر BLOB_READ_WRITE_TOKEN را ست کنید.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {syncStatus?.enabled && (
              <button
                onClick={handleManualSync}
                disabled={syncingNow}
                className="btn-primary flex items-center gap-2 !px-4 !py-2.5 text-xs font-semibold"
              >
                <RefreshCw size={14} className={syncingNow ? 'animate-spin' : ''} />
                <span>{syncingNow ? 'در حال ارسال به فضای ابری...' : 'همگام‌سازی فوری به فضای ابری'}</span>
              </button>
            )}
          </div>
        </div>

        {syncStatus?.lastSyncError && (
          <div className="mt-4 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2.5">
            <AlertCircle size={16} className="shrink-0 mt-0.5 text-amber-400" />
            <div className="leading-relaxed">
              <span className="font-bold">وضعیت همگام‌ساز: </span>
              {syncStatus.lastSyncError}
            </div>
          </div>
        )}

        {syncStatus?.enabled ? (
          <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-400">
            <div>
              <span className="text-slate-500 ml-1">آخرین همگام‌سازی ابری:</span>
              <span className="text-emerald-300 font-mono" dir="ltr">
                {syncStatus.lastSyncedAt ? new Date(syncStatus.lastSyncedAt).toLocaleString('fa-IR') : 'هنوز انجام نشده'}
              </span>
            </div>
            <div className="truncate">
              <span className="text-slate-500 ml-1">آدرس ذخیره‌سازی ابری:</span>
              <span className="text-cyan-300 font-mono" dir="ltr" title={syncStatus.lastBlobUrl || ''}>
                {syncStatus.lastBlobUrl ? syncStatus.lastBlobUrl.slice(0, 45) + '...' : 'پایدار روی Vercel Blob'}
              </span>
            </div>
          </div>
        ) : (
          <div className="mt-4 pt-4 border-t border-slate-800/80 text-xs text-slate-400 leading-relaxed">
            <span className="text-cyan-300 font-semibold ml-1">نکته بسیار مهم برای Vercel:</span>
            برای اینکه بدون نیاز به هیچ پایگاه‌داده خارجی اطلاعات روی Vercel بماند، در داشبورد Vercel به بخش <code className="text-cyan-200 bg-black/40 px-1 py-0.5 rounded font-mono">Storage &gt; Create Database &gt; Blob</code> رفته و آن را به پروژه متصل کنید. ورسل متغیر <code className="text-cyan-200 bg-black/40 px-1 py-0.5 rounded font-mono">BLOB_READ_WRITE_TOKEN</code> را اضافه کرده و دیتابیس به صورت خودکار دائمی خواهد شد.
          </div>
        )}
      </div>

      {/* Backup & Restore Action Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Backup Card */}
        <div className="glass-card rounded-2xl p-6 border border-slate-700/60 bg-gradient-to-br from-slate-900/70 to-slate-900/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Download size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">دانلود نسخه پشتیبان (Backup)</h3>
                <p className="text-xs text-slate-400">خروجی کامل دیتابیس فعلی با تمامی حساب‌ها و مسائل</p>
              </div>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed mt-4">
              فایل یکپارچه <code className="text-cyan-300 font-mono bg-cyan-950/40 px-1.5 py-0.5 rounded">cuphead.sqlite</code> را با یک کلیک دریافت کنید. این فایل شامل تمامی اطلاعات کاربران، درسنامه‌ها، مشارکت‌ها و تنظیمات است و روی هر سرور دیگری بلافاصله قابل اجرا است.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-800">
            <button
              onClick={handleDownloadBackup}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3"
            >
              <Download size={16} />
              <span>دانلود آنی فایل پایگاه‌داده (.sqlite)</span>
            </button>
          </div>
        </div>

        {/* Restore Card */}
        <div className="glass-card rounded-2xl p-6 border border-slate-700/60 bg-gradient-to-br from-slate-900/70 to-slate-900/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Upload size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">بازیابی پایگاه‌داده (Restore)</h3>
                <p className="text-xs text-slate-400">بارگذاری و جایگزینی دیتابیس پشتیبان قبلی</p>
              </div>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed mt-4">
              اگر سایت را مجدداً دیپلوی کرده‌اید یا می‌خواهید داده‌های قبلی را بازگردانید، فایل پشتیبان <code className="text-indigo-300 font-mono bg-indigo-950/40 px-1.5 py-0.5 rounded">.sqlite</code> خود را بارگذاری کنید. سیستم بدون قطعی دیتابیس را لود می‌کند.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-800">
            <input 
              type="file" 
              ref={fileInputRef} 
              accept=".sqlite,.db" 
              onChange={handleFileSelected} 
              className="hidden" 
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn-muted w-full flex items-center justify-center gap-2 py-3 text-indigo-300 border-indigo-500/30 hover:bg-indigo-500/10"
            >
              <Upload size={16} />
              <span>انتخاب فایل پایگاه‌داده و بازیابی...</span>
            </button>
          </div>
        </div>
      </div>

      {/* Deployment & Self-Hosting Guide */}
      <div className="glass-card rounded-2xl p-6 sm:p-8 border border-slate-700/60 bg-slate-900/60">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Server size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">راهنمای استقرار پایدار و انتقال به سرور اختصاصی (کمترین دردسر)</h2>
            <p className="text-xs text-slate-400 mt-1">توضیح کامل تفاوت Vercel و سرور شخصی، و نحوه اجرای دائمی بدون ریست شدن داده‌ها</p>
          </div>
        </div>

        <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
          {/* Section 1 */}
          <div className="bg-slate-800/40 rounded-xl p-5 border border-slate-700/40">
            <h3 className="font-bold text-white text-base flex items-center gap-2 mb-2">
              <HelpCircle size={16} className="text-cyan-400" />
              <span>چرا گیت‌هاب (GitHub) داده‌های جدید را ذخیره نمی‌کند؟</span>
            </h3>
            <p className="text-slate-300 text-sm">
              گیت‌هاب یک مخزن «کد منبع» (Source Code Repository) است، نه یک پایگاه‌داده. وقتی کاربری در سایت ثبت‌نام می‌کند، اطلاعات در فایل دیتابیس سرور ذخیره می‌شود، نه به عنوان یک Commit جدید روی گیت‌هاب! بنابراین اگر گیت‌هاب را دیپلوی مجدد کنید، ورسل فایل‌های پیش‌فرض گیت‌هاب را می‌خواند و تغییرات اعمال‌شده در زمان اجرا از بین می‌روند.
            </p>
          </div>

          {/* Section 2 */}
          <div className="bg-slate-800/40 rounded-xl p-5 border border-slate-700/40">
            <h3 className="font-bold text-white text-base flex items-center gap-2 mb-2">
              <ShieldCheck size={16} className="text-emerald-400" />
              <span>روی سرور اختصاصی خودتان (VPS / لینوکس / داکر) چه اتفاقی می‌افتد؟</span>
            </h3>
            <p className="text-slate-300 text-sm">
              روی هر سرور واقعی یا مجازی (مانند سرور ابری لینوکس، اوبونتو، هاست نودجی‌اس یا داکر):
            </p>
            <ul className="list-disc list-inside space-y-1.5 mt-2.5 text-slate-300 pr-2">
              <li>فایل پایگاه‌داده <strong className="text-white">همیشه روی هارد دیسک سرور شما باقی می‌ماند</strong> و با هیچ ری‌استارتی پاک نمی‌شود.</li>
              <li>اجرای سرور تنها با یک دستور استاندارد انجام می‌شود: <code className="bg-black/40 px-2 py-0.5 rounded text-emerald-300 font-mono">npm start</code></li>
              <li>نیازی به هیچ سرویس خارجی یا حساب دیتابیس جداگانه ندارید. صفر هزینه اضافی، حداکثر سرعت و استقلال کامل.</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="bg-slate-800/40 rounded-xl p-5 border border-slate-700/40">
            <h3 className="font-bold text-white text-base flex items-center gap-2 mb-2">
              <FileCode2 size={16} className="text-indigo-400" />
              <span>تنظیم مسیر دیتابیس خارج از گیت (برای جلوگیری از تداخل در Git Pull)</span>
            </h3>
            <p className="text-slate-300 text-sm">
              برای اینکه هنگام کشیدن تغییرات جدید از گیت‌هاب روی سرور اختصاصی (<code className="bg-black/40 px-1.5 py-0.5 rounded text-indigo-300 font-mono">git pull</code>)، فایل دیتابیس کاربران بازنویسی نشود، متغیر زیر در فایل <code className="bg-black/40 px-1.5 py-0.5 rounded text-indigo-300 font-mono">.env</code> سرورتان پشتیبانی شده است:
            </p>
            <div className="bg-black/60 rounded-lg p-3 my-3 text-xs font-mono text-cyan-300" dir="ltr">
              DATABASE_PATH=/var/data/cuphead.sqlite
            </div>
            <p className="text-slate-400 text-xs">
              با تنظیم این متغیر، دیتابیس در پوشه‌ای مجزا از کد ذخیره می‌شود؛ بنابراین با هر آپدیت کد از گیت‌هاب، داده‌های کاربران کاملاً دست‌نخورده باقی می‌مانند.
            </p>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Restore */}
      {confirmRestoreModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn" dir="rtl">
          <div className="glass-card max-w-md w-full rounded-2xl p-6 border border-amber-500/40 bg-slate-900 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-amber-400">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                <AlertTriangle size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">تأیید بازیابی پایگاه‌داده</h3>
                <p className="text-xs text-slate-400">عملیات غیرقابل بازگشت</p>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              شما در حال جایگزینی پایگاه‌داده فعلی با فایل زیر هستید:
            </p>
            <div className="bg-black/40 p-3 rounded-xl border border-slate-700/50 text-xs font-mono text-cyan-300 flex justify-between items-center" dir="ltr">
              <span>{restoreFile?.name}</span>
              <span className="text-slate-400">({restoreFile ? formatSize(restoreFile.size) : ''})</span>
            </div>
            <p className="text-xs text-amber-300/90 leading-relaxed bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
              توجه: تمامی تغییرات و کاربرانی که پس از ساخت این فایل پشتیبان ایجاد شده‌اند با محتوای این فایل جایگزین خواهند شد. آیا مطمئن هستید؟
            </p>

            <div className="flex gap-3 pt-2">
              <button
                onClick={executeRestore}
                disabled={restoring}
                className="btn-primary !bg-amber-500 hover:!bg-amber-600 flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
              >
                {restoring ? (
                  <>
                    <RefreshCw size={15} className="animate-spin" />
                    <span>در حال بازیابی...</span>
                  </>
                ) : (
                  <span>تأیید و جایگزینی دیتابیس</span>
                )}
              </button>
              <button
                onClick={() => {
                  setConfirmRestoreModal(false);
                  setRestoreFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                disabled={restoring}
                className="btn-muted px-4 py-2.5 text-sm"
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
