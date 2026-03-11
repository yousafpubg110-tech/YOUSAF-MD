/*
╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃   YOUSAF-BALOCH-MD  •  ai_v1           ┃
┃  Commands: gpt chatgpt gemini bing     ┃
┃            blackbox                    ┃
┃        Created by MR YOUSAF BALOCH     ┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
*/
import axios from 'axios';
import { sanitizeUrl } from '../lib/utils.js';
import { SYSTEM } from '../config.js';

const GROQ_KEY   = process.env.GROQ_API_KEY  || '';
const GEMINI_KEY = process.env.GEMINI_API_KEY || '';

// ─── Multi-method AI backend ─────────────────────────────────────────────────
async function askGroq(prompt,systemMsg='You are a helpful assistant.',model='llama3-70b-8192') {
  if (!GROQ_KEY) throw new Error('GROQ_API_KEY not set');
  const url=new URL('https://api.groq.com/openai/v1/chat/completions'); if (url.hostname!=='api.groq.com') throw new Error('bad host');
  const ctrl=new AbortController(); const timer=setTimeout(()=>ctrl.abort(),30000);
  try {
    const r=await fetch(url.toString(),{method:'POST',signal:ctrl.signal,headers:{'Content-Type':'application/json','Authorization':`Bearer ${GROQ_KEY}`},body:JSON.stringify({model,messages:[{role:'system',content:systemMsg},{role:'user',content:prompt}],max_tokens:1000,temperature:0.7})});
    clearTimeout(timer); if (r.ok) { const d=await r.json(); return d?.choices?.[0]?.message?.content||null; }
    throw new Error(`Groq error: ${r.status}`);
  } finally { clearTimeout(timer); }
}

async function askGemini(prompt) {
  if (!GEMINI_KEY) throw new Error('GEMINI_API_KEY not set');
  const url=new URL('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'); url.searchParams.set('key',GEMINI_KEY);
  if (url.hostname!=='generativelanguage.googleapis.com') throw new Error('bad host');
  const ctrl=new AbortController(); const timer=setTimeout(()=>ctrl.abort(),30000);
  try {
    const r=await fetch(url.toString(),{method:'POST',signal:ctrl.signal,headers:{'Content-Type':'application/json'},body:JSON.stringify({contents:[{parts:[{text:prompt}]}],generationConfig:{maxOutputTokens:1000,temperature:0.7}})});
    clearTimeout(timer); if (r.ok) { const d=await r.json(); return d?.candidates?.[0]?.content?.parts?.[0]?.text||null; }
    throw new Error(`Gemini error: ${r.status}`);
  } finally { clearTimeout(timer); }
}

async function askNexoracle(endpoint,prompt) {
  const raw=`https://api.nexoracle.com/ai/${endpoint}?apikey=free_key@maher_apis&prompt=${encodeURIComponent(prompt)}`;
  const safe=sanitizeUrl(raw); if (!safe) throw new Error('bad url');
  const r=await axios.get(safe,{timeout:30000}); const d=r.data?.result||r.data?.data||r.data?.response;
  if (!d) throw new Error('empty response'); return d;
}

// ─── generic AI handler factory ───────────────────────────────────────────────
function makeAiHandler(label,emoji,fallbacks) {
  return async function({msg,args}) {
    try {
      if (!args?.length) return msg.reply(`❌ Please provide a question!\n\n*Example:*\n.${label.toLowerCase()} What is AI?\n${SYSTEM.SHORT_WATERMARK}`);
      const question=args.join(' ');
      await msg.reply(`${emoji} *${label} is thinking…*`);
      let answer=null;
      for (const [n,fn] of fallbacks) {
        try { answer=await fn(question); if (answer) break; } catch (e) { console.warn(`[${label}] ${n}: ${e.message}`); }
      }
      if (!answer) { await msg.react('❌'); return msg.reply(`❌ AI failed to respond! Try again.\n${SYSTEM.SHORT_WATERMARK}`); }
      await msg.reply(`╭━━━『 ${emoji} *${label}* 』━━━╮\n\n📝 *Your Question:*\n${question}\n\n💬 *AI Response:*\n${answer}\n\n╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n${SYSTEM.SHORT_WATERMARK}`);
      await msg.react('✅');
    } catch (e) { console.error(`[${label}]`,e.message); try { await msg.react('❌'); await msg.reply(`❌ Error: ${e.message}\n${SYSTEM.SHORT_WATERMARK}`); } catch (_) {} }
  };
}

const gptHandler = makeAiHandler('ChatGPT','🤖',[
  ['groq',    q=>askGroq(q)],
  ['gemini',  q=>askGemini(q)],
  ['nexo',    q=>askNexoracle('gpt4',q)],
]);
const geminiHandler = makeAiHandler('Gemini','✨',[
  ['gemini',  q=>askGemini(q)],
  ['groq',    q=>askGroq(q)],
  ['nexo',    q=>askNexoracle('gemini',q)],
]);
const bingHandler = makeAiHandler('Bing AI','🔍',[
  ['groq',    q=>askGroq(q,'You are Bing AI, a helpful assistant by Microsoft.')],
  ['nexo',    q=>askNexoracle('bing',q)],
]);
const blackboxHandler = makeAiHandler('BlackBox AI','💻',[
  ['groq',    q=>askGroq(q,'You are a coding assistant. Provide code solutions.',  'llama3-70b-8192')],
  ['nexo',    q=>askNexoracle('blackbox',q)],
]);

export default [
  {command:['gpt'],     name:'gpt',     category:'AI',description:'Chat with GPT AI',usage:'.gpt <question>',cooldown:5,handler:gptHandler},
  {command:['chatgpt'], name:'chatgpt', category:'AI',description:'ChatGPT AI',usage:'.chatgpt <question>',cooldown:5,handler:gptHandler},
  {command:['gemini'],  name:'gemini',  category:'AI',description:'Google Gemini AI',usage:'.gemini <question>',cooldown:5,handler:geminiHandler},
  {command:['bing'],    name:'bing',    category:'AI',description:'Bing AI',usage:'.bing <question>',cooldown:5,handler:bingHandler},
  {command:['blackbox'],name:'blackbox',category:'AI',description:'BlackBox code AI',usage:'.blackbox <question>',cooldown:5,handler:blackboxHandler},
];
