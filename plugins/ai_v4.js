/*
╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃   YOUSAF-BALOCH-MD  •  ai_v4           ┃
┃  Commands: doctor lawyer homework      ┃
┃            resume khuwab              ┃
┃        Created by MR YOUSAF BALOCH     ┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
*/
import { SYSTEM } from '../config.js';

const GROQ_KEY   = process.env.GROQ_API_KEY  || '';
const GEMINI_KEY = process.env.GEMINI_API_KEY || '';

async function askAI(prompt,systemMsg,timeout=30000) {
  // Try Groq first
  if (GROQ_KEY) {
    try {
      const url=new URL('https://api.groq.com/openai/v1/chat/completions'); if (url.hostname!=='api.groq.com') throw new Error('bad host');
      const ctrl=new AbortController(); const timer=setTimeout(()=>ctrl.abort(),timeout);
      try { const r=await fetch(url.toString(),{method:'POST',signal:ctrl.signal,headers:{'Content-Type':'application/json','Authorization':`Bearer ${GROQ_KEY}`},body:JSON.stringify({model:'llama3-70b-8192',messages:[{role:'system',content:systemMsg},{role:'user',content:prompt}],max_tokens:1500,temperature:0.7})}); clearTimeout(timer); if (r.ok) { const d=await r.json(); return d?.choices?.[0]?.message?.content||null; } } finally { clearTimeout(timer); }
    } catch (_) {}
  }
  // Try Gemini
  if (GEMINI_KEY) {
    try {
      const url=new URL('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'); url.searchParams.set('key',GEMINI_KEY);
      const ctrl=new AbortController(); const timer=setTimeout(()=>ctrl.abort(),timeout);
      try { const r=await fetch(url.toString(),{method:'POST',signal:ctrl.signal,headers:{'Content-Type':'application/json'},body:JSON.stringify({contents:[{parts:[{text:systemMsg+'\n\n'+prompt}]}],generationConfig:{maxOutputTokens:1500,temperature:0.7}})}); clearTimeout(timer); if (r.ok) { const d=await r.json(); return d?.candidates?.[0]?.content?.parts?.[0]?.text||null; } } finally { clearTimeout(timer); }
    } catch (_) {}
  }
  return null;
}

function makeSpecialistHandler(label,emoji,systemMsg) {
  return async function({msg,args}) {
    try {
      if (!args?.length) return msg.reply(`❌ Please describe your ${label.toLowerCase()} query!\n\n.${label.toLowerCase()} ${label==='Doctor'?'I have headache and fever for 3 days':label==='Lawyer'?'What are tenant rights in Pakistan?':label==='Homework'?'Explain photosynthesis':label==='Resume'?'I am a software engineer with 3 years experience':label==='Khuwab'?'I saw a snake in my dream':''}\n${SYSTEM.SHORT_WATERMARK}`);
      await msg.react('⏳'); await msg.reply(`⏳ *${label} AI is thinking…*`);
      const query=args.join(' ');
      const result=await askAI(query,systemMsg);
      if (!result) { await msg.react('❌'); return msg.reply(`❌ AI failed to respond! Try again.\n${SYSTEM.SHORT_WATERMARK}`); }
      await msg.reply(`╭━━━『 ${emoji} *${label.toUpperCase()} AI* 』━━━╮\n\n📝 *Your Query:*\n${query}\n\n💬 *Response:*\n${result}\n\n╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n${SYSTEM.SHORT_WATERMARK}`);
      await msg.react('✅');
    } catch (e) { console.error(`[${label.toUpperCase()}]`,e.message); try { await msg.react('❌'); await msg.reply(`❌ _${e.message}_\n${SYSTEM.SHORT_WATERMARK}`); } catch (_) {} }
  };
}

const doctorHandler  = makeSpecialistHandler('Doctor','🏥','You are a medical doctor. Provide general health information and suggestions. Always remind users to consult a real doctor for serious conditions.');
const lawyerHandler  = makeSpecialistHandler('Lawyer','⚖️','You are a legal advisor. Provide general legal information, especially about Pakistani law. Remind users to consult a professional lawyer for legal matters.');
const homeworkHandler= makeSpecialistHandler('Homework','📚','You are a helpful tutor. Explain concepts clearly, step by step, and help students understand their homework. Focus on educational value.');
const resumeHandler  = makeSpecialistHandler('Resume','📄','You are a professional resume writer and career coach. Help users write a compelling resume, cover letter, or improve their career profile.');
const khuwabHandler  = makeSpecialistHandler('Khuwab','🌙','You are an Islamic dream interpreter (Khuwab expert). Interpret dreams based on Islamic teachings and Islamic scholars. Provide meaning according to Islamic tradition.');

export default [
  {command:['doctor'],  name:'doctor',  category:'AI',description:'AI doctor consultation',usage:'.doctor <symptoms>',cooldown:5,handler:doctorHandler},
  {command:['lawyer'],  name:'lawyer',  category:'AI',description:'AI legal advice',usage:'.lawyer <legal question>',cooldown:5,handler:lawyerHandler},
  {command:['homework'],name:'homework',category:'AI',description:'AI homework helper',usage:'.homework <question>',cooldown:5,handler:homeworkHandler},
  {command:['resume'],  name:'resume',  category:'AI',description:'AI resume builder',usage:'.resume <your info>',cooldown:5,handler:resumeHandler},
  {command:['khuwab'],  name:'khuwab',  category:'AI',description:'Islamic dream interpretation',usage:'.khuwab <dream description>',cooldown:5,handler:khuwabHandler},
];
