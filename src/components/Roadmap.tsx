import { motion } from 'framer-motion';
import type { Lesson,Rank,RoadmapModule } from '../types';
import TopicCard from './TopicCard';
export default function Roadmap({modules,lessons,rank,onOpen}:{modules:RoadmapModule[];lessons:Lesson[];rank:Rank;onOpen:(l:Lesson)=>void}){
 const accent=`piece-line-${rank}`; const map=new Map(lessons.map(x=>[x.id,x]));
 return <div className="relative py-8"><div className={`absolute top-0 bottom-0 right-5 sm:right-8 w-px sm:w-1 rounded-full ${accent} opacity-45`}/><div className="space-y-16">{modules.map((mod,i)=><motion.section key={mod.id} initial={{opacity:0,x:24}} whileInView={{opacity:1,x:0}} viewport={{once:true,amount:.15}} transition={{duration:.35,delay:Math.min(i*.08,.24)}} className="relative pr-12 sm:pr-20">
  <div className={`absolute top-2 right-[13px] sm:right-[22px] w-4 h-4 sm:w-6 sm:h-6 rounded-full border-[3px] sm:border-4 border-dark-bg ${accent} shadow-[0_0_16px_currentColor] z-10`}/>
  <div className="mb-6"><div className="text-[11px] uppercase tracking-[.3em] text-slate-600 mb-2">Module {i+1}</div><h2 className="text-xl sm:text-2xl font-bold text-slate-100">{mod.title}</h2><p className="text-slate-400 mt-1">{mod.description}</p></div>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{mod.lessonIds.map(id=>map.get(id)).filter(Boolean).map(l=><TopicCard key={l!.id} lesson={l!} rank={rank} onOpen={()=>onOpen(l!)}/>)}</div>
 </motion.section>)}</div></div>
}
