/** @type {import('tailwindcss').Config} */
export default {
 content:["./index.html","./src/**/*.{js,ts,jsx,tsx}"],
 theme:{extend:{
  fontFamily:{sans:['Vazirmatn','sans-serif'],mono:['JetBrains Mono','monospace']},
  colors:{dark:{bg:'#090d16',card:'#111827',border:'#1f2937'}},
  boxShadow:{'blue-glow':'0 0 30px rgba(56,189,248,.18)'},
  keyframes:{'ambient-drift':{'0%,100%':{transform:'translate3d(-50%,0,0) scale(1)'},'50%':{transform:'translate3d(-50%,24px,0) scale(1.06)'}},'pulse-soft':{'0%,100%':{opacity:'.5'},'50%':{opacity:'1'}}},
  animation:{'ambient-drift':'ambient-drift 10s ease-in-out infinite','pulse-soft':'pulse-soft 3s ease-in-out infinite'}
 }},plugins:[]};
