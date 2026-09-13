import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  BookOpen, 
  Workflow, 
  Library, 
  Trophy, 
  ArrowLeft, 
  Sparkles, 
  Code2, 
  Cpu, 
  GraduationCap, 
  Compass, 
  CheckCircle2, 
  Layers, 
  Flame, 
  HelpCircle, 
  FileText, 
  Users, 
  ChevronLeft, 
  Search, 
  Award, 
  HeartHandshake, 
  Send,
  Globe
} from "lucide-react";
import Navbar from "./components/Navbar";
import { api } from "./lib/api";
import type { PublicBootstrap, Rank, ScoreboardRow, Section } from "./types";

const rankPieces: Record<Rank, string> = {
  pawn: "♟",
  knight: "♞",
  bishop: "♝",
  rook: "♜",
  queen: "♛",
  king: "♚"
};

const rankNames: Record<Rank, string> = {
  pawn: "پیاده",
  knight: "اسب",
  bishop: "فیل",
  rook: "رخ",
  queen: "وزیر",
  king: "شاه"
};

const rankDescriptions: Record<Rank, string> = {
  pawn: "آغاز راه و الفبای کدنویسی، منطق و مقدمات تفکر الگوریتمی",
  knight: "ساختمان داده‌های پایه‌ای، جست‌وجو و مفاهیم بنیادین مرحله اول",
  bishop: "الگوریتم‌های حریصانه، داینامیک، گراف و آمادگی مرحله دوم",
  rook: "درخت‌ها، داده‌ساختارهای پیشرفته و تحلیل پیچیدگی مرحله دوم",
  queen: "مباحث سنگین مرحله سوم، شبیه‌سازها و کارگاه‌های دوره تابستانه",
  king: "سطح جهانی IOI، الگوریتم‌های پیچیده و مباحث مدال‌آوران"
};

const sectionMeta: Record<Section, { title: string; subtitle: string; icon: typeof Code2; color: string; desc: string }> = {
  programming: {
    title: "برنامه‌نویسی و پیاده‌سازی",
    subtitle: "C++ و مهارت کدنویسی تمیز",
    icon: Code2,
    color: "from-cyan-500/20 to-blue-600/10 border-cyan-500/30 text-cyan-400",
    desc: "یادگیری عمیق C++، نحوه کار با STL، بهینه‌سازی زمان اجرا و پیاده‌سازی سریع الگوریتم‌ها بدون باگ."
  },
  algorithm: {
    title: "طراحی و تحلیل الگوریتم",
    subtitle: "از مبانی تا تکنیک‌های پیشرفته",
    icon: Cpu,
    color: "from-indigo-500/20 to-purple-600/10 border-indigo-500/30 text-indigo-400",
    desc: "گراف، برنامه‌ریزی پویا (DP)، ساختارهای داده‌ای سگمنت و فنویک، کوتاه‌ترین مسیرها و تطابق."
  },
  theory: {
    title: "ریاضیات نظری و ترکیبیات",
    subtitle: "شمارش، گراف، استقرا و بازی‌ها",
    icon: GraduationCap,
    color: "from-amber-500/20 to-orange-600/10 border-amber-500/30 text-amber-400",
    desc: "اصول شمارش، اصل لانه کبوتر، قضیه‌های نظریه گراف، بازی‌های دونفره، استقرا و نامساوی‌ها."
  }
};

export default function HomePage() {
  const navigate = useNavigate();
  const [bootstrap, setBootstrap] = useState<PublicBootstrap | null>(null);
  const [collections, setCollections] = useState<any[]>([]);
  const [topUsers, setTopUsers] = useState<ScoreboardRow[]>([]);
  const [selectedRank, setSelectedRank] = useState<Rank>("pawn");
  const [selectedSection, setSelectedSection] = useState<Section>("programming");

  useEffect(() => {
    api.publicBootstrap().then(setBootstrap).catch(() => {});
    api.collections().then(setCollections).catch(() => {});
    api.scoreboard().then(rows => setTopUsers(rows.slice(0, 5))).catch(() => {});
  }, []);

  const totalLessons = bootstrap?.lessons?.filter(l => l.status === "published")?.length || 0;
  const totalProblems = bootstrap?.problems?.length || 0;
  const totalSources = bootstrap?.sources?.length || 0;

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#030914] text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200" dir="rtl">
      {/* Background Ambient Glows */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -right-40 -top-40 h-[600px] w-[600px] rounded-full bg-cyan-500/10 blur-[140px]" />
        <div className="absolute -left-40 top-1/3 h-[500px] w-[500px] rounded-full bg-indigo-500/10 blur-[140px]" />
        <div className="absolute right-1/4 bottom-10 h-[600px] w-[600px] rounded-full bg-blue-600/08 blur-[160px]" />
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:28px_28px] opacity-25" />
      </div>

      <Navbar section={selectedSection} rank={selectedRank} />

      {/* Hero Section */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 pt-12 pb-20 sm:px-6 sm:pt-20 sm:pb-28 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-12">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-right lg:col-span-7"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-500/[0.08] px-3.5 py-1.5 text-xs font-semibold text-cyan-300 backdrop-blur-md">
              <Sparkles size={14} className="animate-pulse text-cyan-300" />
              <span>پلتفرم جامع آموزش و حل مسئله المپیاد کامپیوتر</span>
            </div>

            <h1 className="mt-6 text-4xl font-black leading-[1.2] tracking-tight text-white sm:text-5xl lg:text-6xl">
              مسیر هوشمندانه شما برای <br />
              <span className="bg-gradient-to-l from-cyan-300 via-blue-200 to-white bg-clip-text text-transparent">
                موفقیت در المپیاد کامپیوتر
              </span>
            </h1>

            <div className="mt-6 grid grid-cols-1 gap-2.5 sm:grid-cols-2 max-w-2xl">
              <div className="flex items-center gap-3 rounded-xl border border-slate-800/90 bg-slate-900/50 px-3.5 py-2.5 text-sm font-medium text-slate-200 backdrop-blur-sm transition hover:border-slate-700">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                  <Workflow size={15} />
                </div>
                <span>بانک مسائل دسته‌بندی‌شده</span>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-slate-800/90 bg-slate-900/50 px-3.5 py-2.5 text-sm font-medium text-slate-200 backdrop-blur-sm transition hover:border-slate-700">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  <Globe size={15} />
                </div>
                <span>سوالات ترجمه‌شده از مسابقات رسمی جهانی</span>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-slate-800/90 bg-slate-900/50 px-3.5 py-2.5 text-sm font-medium text-slate-200 backdrop-blur-sm transition hover:border-slate-700">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  <HelpCircle size={15} />
                </div>
                <span>راهنمایی‌های لایه‌ای</span>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-slate-800/90 bg-slate-900/50 px-3.5 py-2.5 text-sm font-medium text-slate-200 backdrop-blur-sm transition hover:border-slate-700">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  <GraduationCap size={15} />
                </div>
                <span>درسنامه‌های سطح‌بندی‌شده</span>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                onClick={() => navigate(`/learn/${selectedSection}/${selectedRank}`)}
                className="btn-primary group flex items-center gap-2.5 !px-6 !py-3.5 text-base font-bold shadow-lg shadow-cyan-500/20"
              >
                <span>ورود به نقشه راه رسمی</span>
                <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
              </button>

              <button
                onClick={() => navigate("/problems")}
                className="btn-muted flex items-center gap-2.5 !px-6 !py-3.5 text-base font-semibold border-slate-700/80 hover:border-slate-500"
              >
                <Workflow size={18} className="text-cyan-400" />
                <span>بانک مسائل (مسئله‌نامه)</span>
              </button>

              <button
                onClick={() => navigate("/collections")}
                className="btn-muted flex items-center gap-2.5 !px-5 !py-3.5 text-sm font-semibold border-slate-700/80 hover:border-slate-500"
              >
                <Library size={17} className="text-indigo-400" />
                <span>کتابخانه رسمی</span>
              </button>
            </div>

            {/* Micro Stats Bar */}
            <div className="mt-12 grid grid-cols-3 gap-4 border-t border-slate-800/80 pt-8 sm:max-w-xl">
              <div>
                <div className="text-2xl font-black text-white sm:text-3xl">
                  {totalLessons > 0 ? `${totalLessons}+` : "۴۰+"}
                </div>
                <div className="text-xs text-slate-400 sm:text-sm mt-1">درسنامه طبقه‌بندی شده</div>
              </div>
              <div>
                <div className="text-2xl font-black text-cyan-300 sm:text-3xl">
                  {totalProblems > 0 ? `${totalProblems}+` : "۲۰۰+"}
                </div>
                <div className="text-xs text-slate-400 sm:text-sm mt-1">مسئله با ترجمه فارسی</div>
              </div>
              <div>
                <div className="text-2xl font-black text-indigo-300 sm:text-3xl">
                  ۶ سطح
                </div>
                <div className="text-xs text-slate-400 sm:text-sm mt-1">رتبه‌بندی پیاده تا شاه</div>
              </div>
            </div>
          </motion.div>

          {/* Interactive Chess Showcase Box */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-5"
          >
            <div className="glass-card relative overflow-hidden rounded-3xl border border-slate-700/60 bg-slate-900/60 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
              <div className="flex items-center justify-between border-b border-slate-800 pb-5">
                <div className="flex items-center gap-2">
                  <Compass className="text-cyan-400" size={20} />
                  <span className="text-sm font-bold text-white">انتخاب سطح و مسیر یادگیری</span>
                </div>
                <span className="text-xs rounded-full bg-cyan-500/10 px-2.5 py-1 text-cyan-300 border border-cyan-500/20">
                  {rankNames[selectedRank]}
                </span>
              </div>

              {/* Central Chess Piece Animation */}
              <div className="my-7 flex flex-col items-center justify-center text-center">
                <div className="relative py-2">
                  <span className={`chess-piece piece-${selectedRank}`}>
                    {rankPieces[selectedRank]}
                  </span>
                </div>
                <div className="mt-3 text-xl font-black text-white">
                  رتبه {rankNames[selectedRank]}
                </div>
                <p className="mt-2 text-xs leading-relaxed text-slate-400 max-w-xs">
                  {rankDescriptions[selectedRank]}
                </p>
              </div>

              {/* Ranks Quick Grid */}
              <div className="grid grid-cols-6 gap-1.5 rounded-2xl bg-slate-950/60 p-1.5 border border-slate-800">
                {(["pawn", "knight", "bishop", "rook", "queen", "king"] as Rank[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => setSelectedRank(r)}
                    className={`flex flex-col items-center justify-center rounded-xl py-2 text-xs transition-all ${
                      selectedRank === r 
                        ? `bg-slate-800/90 text-white font-bold border border-slate-600 shadow-md` 
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
                    }`}
                  >
                    <span className={`chess-mini piece-${r}`}>{rankPieces[r]}</span>
                    <span className="text-[10px] mt-0.5">{rankNames[r]}</span>
                  </button>
                ))}
              </div>

              {/* Jump button */}
              <div className="mt-5">
                <button
                  onClick={() => navigate(`/learn/${selectedSection}/${selectedRank}`)}
                  className="btn-primary w-full !justify-center !py-3 text-sm font-bold flex items-center gap-2"
                >
                  <span>مشاهده نقشه راه سطح {rankNames[selectedRank]}</span>
                  <ArrowLeft size={16} />
                </button>
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* 3 Core Pillars Section */}
      <section className="relative z-10 border-t border-slate-800/60 bg-slate-950/40 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-400">سرفصل‌های آموزشی</h2>
            <p className="mt-2 text-3xl font-black text-white sm:text-4xl">
              سه ستون اصلی آمادگی المپیاد
            </p>
            <p className="mt-3 text-sm text-slate-400">
              مطالب متناسب با استانداردهای رسمی باشگاه دانش‌پژوهان جوان و مسابقات بین‌المللی
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {(["programming", "algorithm", "theory"] as Section[]).map((secKey) => {
              const sec = sectionMeta[secKey];
              const Icon = sec.icon;
              return (
                <div 
                  key={secKey}
                  className="glass-card group relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/40 p-7 transition-all duration-300 hover:-translate-y-1 hover:border-slate-700 hover:bg-slate-900/70"
                >
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${sec.color} border flex items-center justify-center mb-6`}>
                    <Icon size={24} />
                  </div>

                  <h3 className="text-xl font-bold text-white group-hover:text-cyan-200 transition-colors">
                    {sec.title}
                  </h3>
                  <div className="text-xs font-semibold text-slate-400 mt-1">
                    {sec.subtitle}
                  </div>

                  <p className="mt-4 text-sm leading-relaxed text-slate-300/80">
                    {sec.desc}
                  </p>

                  <div className="mt-6 pt-5 border-t border-slate-800/80 flex items-center justify-between">
                    <Link
                      to={`/learn/${secKey}/pawn`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300"
                    >
                      <span>ورود به سرفصل</span>
                      <ArrowLeft size={14} />
                    </Link>
                    <span className="text-[11px] text-slate-500 font-mono">۶ سطح شطرنجی</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Platform Key Features Grid */}
      <section className="relative z-10 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-400">چرا CupHead؟</h2>
            <p className="mt-2 text-3xl font-black text-white sm:text-4xl">
              امکاناتی برای یادگیری عمیق و اصولی
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            
            <div className="glass-card rounded-2xl border border-slate-800 p-6 bg-slate-900/40">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 flex items-center justify-center mb-4">
                <FileText size={20} />
              </div>
              <h4 className="text-base font-bold text-white">ترجمه و صورت فارسی مسائل</h4>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">
                ترجمه دقیق و روان مسائل سامانه‌های Codeforces، CSES، AtCoder و مسابقات رسمی مرحله اول، دوم و سوم.
              </p>
            </div>

            <div className="glass-card rounded-2xl border border-slate-800 p-6 bg-slate-900/40">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 flex items-center justify-center mb-4">
                <HelpCircle size={20} />
              </div>
              <h4 className="text-base font-bold text-white">راهنمایی‌های چندلایه</h4>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">
                راهنمایی‌های گام‌به‌گام (لایه‌های ۱ تا ۳) تا قبل از دیدن پاسخ نهایی، مسیر فکر کردن برای شما حفظ شود.
              </p>
            </div>

            <div className="glass-card rounded-2xl border border-slate-800 p-6 bg-slate-900/40">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 flex items-center justify-center mb-4">
                <Library size={20} />
              </div>
              <h4 className="text-base font-bold text-white">کتابخانه رسمی و شبیه‌ساز</h4>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">
                دسته‌بندی موضوعی و مجموعه‌های مرحله‌ای شامل دوره‌های گذشته و مجموعه‌های استاندارد تمرین المپیاد.
              </p>
            </div>

            <div className="glass-card rounded-2xl border border-slate-800 p-6 bg-slate-900/40">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center justify-center mb-4">
                <Award size={20} />
              </div>
              <h4 className="text-base font-bold text-white">مشارکت و امتیازدهی (XP)</h4>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">
                امکان ثبت ترجمه، هینت و راه‌حل توسط کاربران، دریافت امتیاز و ثبت نام در جدول برترین‌های المپیاد.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Featured Collections & Top Contributors Row */}
      <section className="relative z-10 border-t border-slate-800/60 bg-slate-950/40 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-12">
            
            {/* Left/Main Column: Featured Collections */}
            <div className="lg:col-span-7">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-black text-white">کتابخانه رسمی و مجموعه‌ها</h3>
                  <p className="text-xs text-slate-400 mt-1">مجموعه‌های برگزیده مسئله برای تمرین ساخت‌یافته</p>
                </div>
                <Link to="/collections" className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
                  <span>همه مجموعه‌ها</span>
                  <ChevronLeft size={14} />
                </Link>
              </div>

              <div className="space-y-3">
                {collections.slice(0, 3).map((col) => (
                  <Link
                    key={col.id || col.slug}
                    to={`/collections/${col.slug}`}
                    className="glass-card group flex items-center justify-between rounded-2xl border border-slate-800 p-4 transition hover:border-cyan-500/30 hover:bg-slate-900/70"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 flex items-center justify-center shrink-0">
                        <Library size={18} />
                      </div>
                      <div>
                        <div className="font-bold text-white group-hover:text-cyan-300 transition text-sm">
                          {col.title || col.name}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                          {col.description || 'مجموعه تخصصی مسائل المپیاد کامپیوتر'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 shrink-0">
                      <span className="rounded-lg bg-slate-800 px-2 py-1 text-[11px] font-mono">
                        {col.problemCount || col.problems?.length || 'مجموعه'} مسئله
                      </span>
                      <ArrowLeft size={14} className="text-slate-500 group-hover:text-cyan-300 transition" />
                    </div>
                  </Link>
                ))}

                {collections.length === 0 && (
                  <div className="glass-card rounded-2xl border border-slate-800 p-8 text-center text-slate-500 text-sm">
                    در حال بارگذاری مجموعه‌ها...
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Top Contributors Scoreboard Preview */}
            <div className="lg:col-span-5">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-black text-white">برترین مشارکت‌کنندگان</h3>
                  <p className="text-xs text-slate-400 mt-1">جدول امتیاز تجربه و مشارکت در پلتفرم</p>
                </div>
                <Link to="/scoreboard" className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
                  <span>جدول کامل</span>
                  <ChevronLeft size={14} />
                </Link>
              </div>

              <div className="glass-card rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                <div className="space-y-2">
                  {topUsers.map((user, idx) => (
                    <div 
                      key={user.id || user.username}
                      className="flex items-center justify-between rounded-xl bg-slate-950/50 p-3 border border-slate-800/70"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                          idx === 0 ? 'bg-amber-400 text-slate-950' :
                          idx === 1 ? 'bg-slate-300 text-slate-950' :
                          idx === 2 ? 'bg-amber-700 text-white' :
                          'bg-slate-800 text-slate-400'
                        }`}>
                          {idx + 1}
                        </span>
                        <span className="font-bold text-sm text-slate-200">{user.username}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs font-bold text-cyan-300">
                        <Flame size={14} className="text-amber-400" />
                        <span>{user.xp} XP</span>
                      </div>
                    </div>
                  ))}

                  {topUsers.length === 0 && (
                    <div className="py-6 text-center text-slate-500 text-xs">
                      کاربران پس از ثبت و تأیید مشارکت‌ها در جدول رده‌بندی قرار می‌گیرند.
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 text-center">
                  <Link
                    to="/contact"
                    className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold inline-flex items-center gap-1"
                  >
                    <span>می‌خواهید مشارکت کنید؟ ثبت درخواست همکاری</span>
                    <ArrowLeft size={12} />
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Community Contribution & Expansion Note */}
      <section className="relative z-10 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="glass-card relative overflow-hidden rounded-3xl border border-cyan-500/25 bg-gradient-to-br from-slate-900/90 via-[#071326]/80 to-slate-900/90 p-6 sm:p-8 md:p-10 shadow-xl backdrop-blur-xl">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              
              <div className="flex items-start gap-4 max-w-3xl">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 flex items-center justify-center shrink-0 mt-1">
                  <HeartHandshake size={26} />
                </div>
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-300 border border-cyan-500/20 mb-2">
                    <span>مشارکت جامعه المپیاد و توسعه کتابخانه</span>
                  </div>
                  <h3 className="text-xl font-black text-white sm:text-2xl">
                    کتابخانه‌ای که با دست‌های شما کامل‌تر می‌شود
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300">
                    بخش قابل توجهی از <strong>بانک مسائل، ترجمه‌های فارسی و راهنمایی‌های چندلایه (Hints)</strong> با کمک، همفکری و ارسال‌های دانش‌آموزان و علاقه‌مندان المپیاد کامپیوتر شکل گرفته است. شما هم می‌توانید با پیشنهاد مسئله‌های نو، افزودن هینت و بهبود ترجمه‌ها، در گسترش این کتابخانه سهیم باشید و امتیاز تجربه (XP) کسب کنید.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                <Link
                  to="/submit-problem"
                  className="btn-primary flex items-center justify-center gap-2 !px-5 !py-3 text-sm font-bold whitespace-nowrap shadow-md shadow-cyan-500/20"
                >
                  <Send size={16} />
                  <span>پیشنهاد مسئله جدید</span>
                </Link>
                <Link
                  to="/contact"
                  className="btn-muted flex items-center justify-center gap-2 !px-5 !py-3 text-sm font-semibold border-slate-700 whitespace-nowrap"
                >
                  <Users size={16} className="text-cyan-400" />
                  <span>همکاری در ترجمه و هینت</span>
                </Link>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="relative z-10 py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="glass-card relative overflow-hidden rounded-3xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/60 via-slate-900/80 to-indigo-950/60 p-8 text-center sm:p-12 shadow-2xl">
            <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-cyan-400/10 blur-3xl" />
            <div className="absolute -left-20 -bottom-20 h-60 w-60 rounded-full bg-indigo-400/10 blur-3xl" />
            
            <h2 className="text-3xl font-black text-white sm:text-4xl">
              همین حالا یادگیری المپیاد را آغاز کنید
            </h2>
            <p className="mt-4 max-w-xl mx-auto text-sm leading-relaxed text-slate-300">
              بدون نیاز به سردرگمی میان منابع مختلف؛ گام‌به‌گام با نقشه راه استاندارد CupHead پیش بروید و پیشرفت خود را بسنجید.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/learn/programming/pawn"
                className="btn-primary flex items-center gap-2 !px-8 !py-3.5 text-base font-bold shadow-lg shadow-cyan-500/20"
              >
                <span>شروع با سطح پیاده (Pawn)</span>
                <ArrowLeft size={18} />
              </Link>
              <Link
                to="/auth?mode=register"
                className="btn-muted flex items-center gap-2 !px-6 !py-3.5 text-base font-semibold border-slate-700"
              >
                <Users size={18} className="text-cyan-400" />
                <span>عضویت در CupHead</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/80 bg-[#020611] py-12 text-slate-400">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition">
              <img src="/logotype.png" alt="CupHead" className="h-7 w-auto" />
              <span className="text-xs text-slate-500">| پلتفرم المپیاد کامپیوتر</span>
            </Link>
            
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-semibold">
              <Link to="/learn/programming/pawn" className="hover:text-slate-200">آموزش‌ها</Link>
              <Link to="/problems" className="hover:text-slate-200">مسئله‌نامه</Link>
              <Link to="/collections" className="hover:text-slate-200">کتابخانه رسمی</Link>
              <Link to="/scoreboard" className="hover:text-slate-200">جدول امتیاز</Link>
              <Link to="/contact" className="hover:text-slate-200">ارتباط با ما</Link>
            </div>

            <div className="text-xs text-slate-600">
              © 2026 CupHead. تمامی حقوق محفوظ است.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
