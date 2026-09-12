import { useEffect,useMemo,useState } from 'react';
import { useNavigate,useParams } from 'react-router-dom';
import { ArrowLeft,ArrowRight,CheckCircle2,ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from './components/Navbar';
import MarkdownView from './components/MarkdownView';
import Loading from './components/Loading';
import { api } from './lib/api';
import ReactionBar from './components/ReactionBar';
import type { PublicBootstrap } from './types';
export default function LessonPage(){
 const {slug}=useParams(); const nav=useNavigate(); const [data,setData]=useState<PublicBootstrap|null>(null); const [done,setDone]=useState(false);
 useEffect(()=>{api.publicBootstrap().then(setData)},[]);
 const lesson=data?.lessons.find(x=>x.slug===slug);
 useEffect(()=>{if(lesson){setDone(localStorage.getItem(`cuphead_progress_${lesson.id}`)==='true');window.scrollTo({top:0})}},[lesson?.id]);
 const seq=useMemo(()=>{if(!data||!lesson)return[];return data.roadmap[lesson.section][lesson.rank].flatMap(m=>m.lessonIds).map(id=>data.lessons.find(l=>l.id===id)).filter(Boolean)},[data,lesson]);
 if(!data)return <Loading/>; if(!lesson)return <div className="min-h-screen"><Navbar section="programming" rank="pawn"/><div className="max-w-4xl mx-auto p-10">درس پیدا نشد.</div></div>;
 const idx=seq.findIndex(x=>x?.id===lesson.id),prev=idx>0?seq[idx-1]:null,next=idx>=0&&idx<seq.length-1?seq[idx+1]:null;
 function toggle(){if(!lesson)return;const n=!done;setDone(n);localStorage.setItem(`cuphead_progress_${lesson.id}`,String(n))}
 const rankStyle=`piece-border-${lesson.rank}`;
 return <div className="min-h-screen relative overflow-x-hidden"><div className="fixed top-0 left-1/2 -translate-x-1/2 w-3/4 h-96 bg-blue-900/20 blur-[120px] pointer-events-none rounded-full"/><Navbar section={lesson.section} rank={lesson.rank}/><main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-10 pb-24">
  <button onClick={()=>nav(`/learn/${lesson.section}/${lesson.rank}`)} className="flex items-center gap-2 text-slate-400 hover:text-white transition mb-7"><ArrowRight size={18}/> بازگشت به نقشه راه</button>
  <motion.header initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} className={`glass-card rounded-3xl p-6 sm:p-9 border-s-4 ${lesson.status==='review'?'border-amber-400 bg-amber-500/[.04]':rankStyle} mb-10`}><div className="flex flex-col md:flex-row md:items-center gap-6 justify-between"><div><div className="flex flex-wrap gap-2 mb-4"><div className={`inline-flex px-3 py-1 rounded-full border text-xs font-bold ${rankStyle}`}>{lesson.difficulty}</div>{lesson.status==='review'&&<div className="meta-chip !text-amber-300 !border-amber-400/30">نیازمند بررسی</div>}</div><h1 className="text-3xl sm:text-4xl font-black text-white">{lesson.title}</h1><p className="text-slate-400 mt-3 leading-7">{lesson.summary}</p></div><button onClick={toggle} className={`shrink-0 btn-muted ${done?'!border-emerald-500/40 !text-emerald-300 !bg-emerald-500/10':''}`}><CheckCircle2 size={19}/>{done?'تکمیل شده':'علامت تکمیل'}</button></div></motion.header>
  <MarkdownView markdown={lesson.contentMarkdown}/>
  <ReactionBar contentType="lesson" contentId={lesson.id}/>
  {lesson.practice.length>0&&<section className="mt-12"><h2 className="text-2xl font-bold text-white mb-4">تمرین و مسئله</h2><div className="grid gap-3">{lesson.practice.map((p,i)=><a key={i} href={p.url} target="_blank" rel="noreferrer" className="glass-card neon-hover rounded-2xl p-4 flex items-center justify-between"><div><div className="font-bold text-slate-200">{p.name}</div><div className="text-sm text-slate-500 mt-1">سختی: {p.difficulty}</div></div><ExternalLink size={18} className="text-slate-600"/></a>)}</div></section>}
  <nav className="grid sm:grid-cols-2 gap-3 mt-14 pt-7 border-t border-dark-border"><button disabled={!prev} onClick={()=>prev&&nav(`/lesson/${prev.slug}`)} className="glass-card neon-hover rounded-2xl p-4 text-start disabled:opacity-30 disabled:hover:transform-none"><span className="text-xs text-slate-500 flex items-center gap-1"><ArrowRight size={14}/> درس قبلی</span><span className="block mt-1 font-bold">{prev?.title||'—'}</span></button><button disabled={!next} onClick={()=>next&&nav(`/lesson/${next.slug}`)} className="glass-card neon-hover rounded-2xl p-4 text-start disabled:opacity-30 disabled:hover:transform-none"><span className="text-xs text-slate-500 flex items-center gap-1">درس بعدی <ArrowLeft size={14}/></span><span className="block mt-1 font-bold">{next?.title||'—'}</span></button></nav>
  <div className="submission-notices mt-8"><li>اگر در آموزش‌ها مشکلی پیدا کردید، درجهت برطرف کردن به ادمین @WhoMan_H در تلگرام پیام دهید.</li></div>
 </main></div>
}
