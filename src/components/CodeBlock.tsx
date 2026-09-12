import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Check, Copy } from 'lucide-react';

const Highlighter = SyntaxHighlighter as any;

export default function CodeBlock({code,language='cpp'}:{code:string;language?:string}){
 const [copied,setCopied]=useState(false);
 async function copy(){try{await navigator.clipboard.writeText(code);setCopied(true);setTimeout(()=>setCopied(false),1600)}catch{}}
 return <div className="relative rounded-2xl overflow-hidden border border-dark-border shadow-2xl" dir="ltr">
  <div className="h-11 bg-[#151b26] flex items-center justify-between px-4 border-b border-white/10">
   <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-red-400/70"/><span className="w-2.5 h-2.5 rounded-full bg-amber-300/70"/><span className="w-2.5 h-2.5 rounded-full bg-emerald-400/70"/><span className="text-[11px] font-mono text-slate-500 ms-2">{language.toUpperCase()}</span></div>
   <button type="button" onClick={copy} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition">{copied?<Check size={15} className="text-emerald-400"/>:<Copy size={15}/>} {copied?'Copied':'Copy'}</button>
  </div>
  <Highlighter language={language} style={vscDarkPlus} showLineNumbers customStyle={{margin:0,padding:'1rem',background:'#0d111a',fontFamily:'"JetBrains Mono", monospace',fontSize:'14px',lineHeight:'1.7'}} lineNumberStyle={{minWidth:'2.5em',paddingRight:'1em',color:'#4b5563',textAlign:'right'}}>{code.trim()}</Highlighter>
 </div>
}
