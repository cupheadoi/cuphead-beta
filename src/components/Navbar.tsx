import { BookOpen, Library, Menu, MessageCircle, Shield, Trophy, User, Workflow, X } from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { Rank, Section } from "../types";

type NavItem = { label: string; path: string; icon: typeof BookOpen };

export default function Navbar({ section = "programming", rank = "pawn" }: { section?: Section; rank?: Rank }) {
  const nav = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const items: NavItem[] = [
    { label: "آموزش‌های رسمی", path: `/learn/${section}/${rank}`, icon: BookOpen },
    { label: "مسئله‌نامه", path: "/problems", icon: Workflow },
    { label: "کتابخانه رسمی", path: "/collections", icon: Library },
    { label: "جدول امتیاز", path: "/scoreboard", icon: Trophy },
    { label: "ارتباط با ما", path: "/contact", icon: MessageCircle },
  ];
  const go = (path: string) => { setOpen(false); nav(path); };
  const active = (path: string) => path.startsWith("/learn") ? location.pathname.startsWith("/learn") || location.pathname.startsWith("/lesson") : location.pathname === path || location.pathname.startsWith(`${path}/`);

  return <header className="sticky top-0 z-50 border-b border-slate-400/10 bg-[#081321]/78 backdrop-blur-2xl" dir="rtl">
    <div className="relative mx-auto flex min-h-[4.5rem] max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
      <button onClick={() => go("/learn/programming/pawn")} className="brand-lockup shrink-0" aria-label="خانه‌ی CupHead">
        <img src="/logotype.png" alt="CupHead" />
      </button>
      <nav className="hidden flex-1 items-center justify-center gap-1 lg:flex" aria-label="ناوبری اصلی">
        {items.map(({ label, path, icon: Icon }) => <button key={label} onClick={() => go(path)} className={`nav-pill ${active(path) ? "active" : ""}`} aria-current={active(path) ? "page" : undefined}><Icon size={16} strokeWidth={1.8} /><span>{label}</span></button>)}
      </nav>
      <div className="hidden shrink-0 items-center gap-2 sm:flex">
        <button onClick={() => go("/profile")} className={`icon-btn ${location.pathname === "/profile" ? "!border-cyan-300/40 !bg-cyan-400/[.08] !text-cyan-100" : ""}`} aria-label="پروفایل"><User size={18} /></button>
        <button onClick={() => go("/admin")} className={`icon-btn ${location.pathname.startsWith("/admin") ? "!border-cyan-300/40 !bg-cyan-400/[.08] !text-cyan-100" : ""}`} aria-label="پنل مدیریت"><Shield size={18} /></button>
      </div>
      <button onClick={() => setOpen(value => !value)} className="icon-btn sm:hidden" aria-label={open ? "بستن منو" : "باز کردن منو"} aria-expanded={open}>{open ? <X size={20} /> : <Menu size={20} />}</button>
      {open && <nav className="nav-drawer lg:hidden" aria-label="ناوبری موبایل">
        <div className="grid gap-1">{items.map(({ label, path, icon: Icon }) => <button key={label} onClick={() => go(path)} className={`nav-pill w-full justify-start ${active(path) ? "active" : ""}`} aria-current={active(path) ? "page" : undefined}><Icon size={17} strokeWidth={1.8} /><span>{label}</span></button>)}</div>
        <div className="mt-2 grid grid-cols-2 gap-2 border-t border-slate-400/10 pt-2"><button onClick={() => go("/profile")} className="btn-muted !justify-start"><User size={17} /> پروفایل</button><button onClick={() => go("/admin")} className="btn-muted !justify-start"><Shield size={17} /> مدیریت</button></div>
      </nav>}
    </div>
  </header>;
}
