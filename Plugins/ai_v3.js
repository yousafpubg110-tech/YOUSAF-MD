/*
╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃   YOUSAF-BALOCH-MD  •  ai_v3           ┃
┃  Commands: translate tts romanurdu     ┃
┃            sentiment code              ┃
┃        Created by MR YOUSAF BALOCH     ┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
*/
import axios from 'axios';
import { SYSTEM } from '../config.js';

const GROQ_KEY   = process.env.GROQ_API_KEY  || '';
const GEMINI_KEY = process.env.GEMINI_API_KEY || '';

async function askGroq(prompt,systemMsg='You are a helpful assistant.',model='llama3-70b-8192') {
  if (!GROQ_KEY) throw new Error('GROQ_API_KEY not set');
  const url=new URL('https://api.groq.com/openai/v1/chat/completions'); if (url.hostname!=='api.groq.com') throw new Error('bad host');
  const ctrl=new AbortController(); const timer=setTimeout(()=>ctrl.abort(),30000);
  try { const r=await fetch(url.toString(),{method:'POST',signal:ctrl.signal,headers:{'Content-Type':'application/json','Authorization':`Bearer ${GROQ_KEY}`},body:JSON.stringify({model,messages:[{role:'system',content:systemMsg},{role:'user',content:prompt}],max_tokens:1000,temperature:0.3})}); clearTimeout(timer); if (r.ok) { const d=await r.json(); return d?.choices?.[0]?.message?.content||null; } throw new Error(`${r.status}`); } finally { clearTimeout(timer); }
}
async function askGemini(prompt) {
  if (!GEMINI_KEY) throw new Error('GEMINI_API_KEY not set');
  const url=new URL('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'); url.searchParams.set('key',GEMINI_KEY); if (url.hostname!=='generativelanguage.googleapis.com') throw new Error('bad host');
  const ctrl=new AbortController(); const timer=setTimeout(()=>ctrl.abort(),30000);
  try { const r=await fetch(url.toString(),{method:'POST',signal:ctrl.signal,headers:{'Content-Type':'application/json'},body:JSON.stringify({contents:[{parts:[{text:prompt}]}],generationConfig:{maxOutputTokens:1000,temperature:0.3}})}); clearTimeout(timer); if (r.ok) { const d=await r.json(); return d?.candidates?.[0]?.content?.parts?.[0]?.text||null; } throw new Error(`${r.status}`); } finally { clearTimeout(timer); }
}

// ─── translate ────────────────────────────────────────────────────────────────
const LANG_NAMES={'en':'English','ur':'Urdu','ar':'Arabic','hi':'Hindi','fr':'French','de':'German','es':'Spanish','zh':'Chinese','ru':'Russian','ja':'Japanese','ko':'Korean','tr':'Turkish'};
async function translateHandler({msg,args}) {
  try {
    if (!args?.length) return msg.reply(`❌ Please provide text and target language!\n\n*Format:*\n.translate en Hello world\n.translate ur How are you?\n\n*Languages:* ${Object.keys(LANG_NAMES).join(', ')}\n${SYSTEM.SHORT_WATERMARK}`);
    await msg.react('🌍');
    let lang='ur'; let textArgs=[...args]; if (Object.keys(LANG_NAMES).includes(args[0])) { lang=args[0]; textArgs=textArgs.slice(1); }
    const text=textArgs.join(' '); if (!text) return msg.reply(`❌ Please provide text to translate!\n${SYSTEM.SHORT_WATERMARK}`);
    await msg.reply(`⏳ *Translating to ${LANG_NAMES[lang]||lang}…*`);
    const prompt=`Translate the following text to ${LANG_NAMES[lang]||lang}. Return ONLY the translation, nothing else.\n\nText: ${text}`;
    let result=null; for (const fn of [()=>askGroq(prompt,'You are a professional translator.'),()=>askGemini(prompt)]) { try { result=await fn(); if (result) break; } catch (_) {} }
    if (!result) { await msg.react('❌'); return msg.reply(`❌ Translation failed!\n${SYSTEM.SHORT_WATERMARK}`); }
    await msg.reply(`╭━━━『 🌍 *TRANSLATION* 』━━━╮\n\n📝 *Original:*\n${text}\n\n🔄 *${LANG_NAMES[lang]||lang}:*\n${result}\n\n╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n${SYSTEM.SHORT_WATERMARK}`);
    await msg.react('✅');
  } catch (e) { console.error('[TRANSLATE]',e.message); try { await msg.react('❌'); await msg.reply(`❌ _${e.message}_\n${SYSTEM.SHORT_WATERMARK}`); } catch (_) {} }
}

// ─── tts ──────────────────────────────────────────────────────────────────────
async function ttsHandler({sock,msg,from,args}) {
  try {
    if (!args?.length) return msg.reply(`❌ Please provide text!\n\n.tts Hello world\n.tts السلام علیکم\n${SYSTEM.SHORT_WATERMARK}`);
    await msg.react('🔊');
    const text=args.join(' ');
    // Google TTS (free)
    const ttsUrl=new URL('https://translate.google.com/translate_tts'); ttsUrl.searchParams.set('ie','UTF-8'); ttsUrl.searchParams.set('q',text); ttsUrl.searchParams.set('tl','ur'); ttsUrl.searchParams.set('client','tw-ob');
    const r=await axios.get(ttsUrl.toString(),{responseType:'arraybuffer',timeout:15000,headers:{'User-Agent':'Mozilla/5.0','Referer':'https://translate.google.com/'}});
    const audioBuf=Buffer.from(r.data);
    await sock.sendMessage(from,{audio:audioBuf,mimetype:'audio/mpeg',ptt:false},{quoted:msg});
    await msg.react('✅');
  } catch (e) { console.error('[TTS]',e.message); try { await msg.react('❌'); await msg.reply(`❌ TTS failed: _${e.message}_\n${SYSTEM.SHORT_WATERMARK}`); } catch (_) {} }
}

// ─── roman urdu ───────────────────────────────────────────────────────────────
async function romanUrduHandler({msg,args}) {
  try {
    if (!args?.length) return msg.reply(`❌ Please provide English text to convert to Roman Urdu!\n\n.romanurdu How are you?\n.romanurdu I love Pakistan\n${SYSTEM.SHORT_WATERMARK}`);
    await msg.react('✍️'); await msg.reply('⏳ *Converting to Roman Urdu…*');
    const text=args.join(' ');
    const prompt=`Convert the following English text to natural Roman Urdu (Urdu written in English letters). Return ONLY the Roman Urdu translation.\n\nText: ${text}`;
    let result=null; for (const fn of [()=>askGroq(prompt,'You are an expert in Pakistani Roman Urdu language.'),()=>askGemini(prompt)]) { try { result=await fn(); if (result) break; } catch (_) {} }
    if (!result) { await msg.react('❌'); return msg.reply(`❌ Conversion failed!\n${SYSTEM.SHORT_WATERMARK}`); }
    await msg.reply(`╭━━━『 ✍️ *ROMAN URDU* 』━━━╮\n\n📝 *English:*\n${text}\n\n🇵🇰 *Roman Urdu:*\n${result}\n\n╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n${SYSTEM.SHORT_WATERMARK}`);
    await msg.react('✅');
  } catch (e) { console.error('[ROMANURDU]',e.message); try { await msg.react('❌'); await msg.reply(`❌ _${e.message}_\n${SYSTEM.SHORT_WATERMARK}`); } catch (_) {} }
}

// ─── sentiment ────────────────────────────────────────────────────────────────
async function sentimentHandler({msg,args}) {
  try {
    if (!args?.length) return msg.reply(`❌ Please provide text to analyze!\n\n.sentiment I love this bot!\n${SYSTEM.SHORT_WATERMARK}`);
    await msg.react('🎭'); await msg.reply('⏳ *Analyzing sentiment…*');
    const text=args.join(' ');
    const prompt=`Analyze the sentiment of this text and respond in this exact format:\nSentiment: [Positive/Negative/Neutral]\nScore: [0-100]\nEmoji: [appropriate emoji]\nExplanation: [1-2 sentences]\n\nText: "${text}"`;
    let result=null; for (const fn of [()=>askGroq(prompt,'You are a sentiment analysis expert.'),()=>askGemini(prompt)]) { try { result=await fn(); if (result) break; } catch (_) {} }
    if (!result) { await msg.react('❌'); return msg.reply(`❌ Analysis failed!\n${SYSTEM.SHORT_WATERMARK}`); }
    await msg.reply(`╭━━━『 🎭 *SENTIMENT ANALYSIS* 』━━━╮\n\n📝 *Text:*\n"${text}"\n\n📊 *Analysis:*\n${result}\n\n╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n${SYSTEM.SHORT_WATERMARK}`);
    await msg.react('✅');
  } catch (e) { console.error('[SENTIMENT]',e.message); try { await msg.react('❌'); await msg.reply(`❌ _${e.message}_\n${SYSTEM.SHORT_WATERMARK}`); } catch (_) {} }
}

// ─── code fixer ───────────────────────────────────────────────────────────────
async function codeHandler({msg,args}) {
  try {
    if (!args?.length) return msg.reply(`❌ Please provide code or a coding question!\n\n.code fix this: console.log("Hello)\n.code How to sort array in Python?\n${SYSTEM.SHORT_WATERMARK}`);
    await msg.react('💻'); await msg.reply('⏳ *Analyzing code…*');
    const code=args.join(' ');
    const prompt=`You are an expert programmer. ${code.toLowerCase().includes('fix')?'Find bugs and fix this code':'Answer this coding question or write this code'}:\n\n${code}\n\nProvide: 1) Brief explanation 2) The solution/fixed code`;
    let result=null; for (const fn of [()=>askGroq(prompt,'You are an expert code reviewer and debugger.',  'llama3-70b-8192'),()=>askGemini(prompt)]) { try { result=await fn(); if (result) break; } catch (_) {} }
    if (!result) { await msg.react('❌'); return msg.reply(`❌ Code analysis failed!\n${SYSTEM.SHORT_WATERMARK}`); }
    await msg.reply(`╭━━━『 💻 *CODE AI* 』━━━╮\n\n📝 *Query:*\n${code}\n\n🔧 *Solution:*\n${result}\n\n╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n${SYSTEM.SHORT_WATERMARK}`);
    await msg.react('✅');
  } catch (e) { console.error('[CODE]',e.message); try { await msg.react('❌'); await msg.reply(`❌ _${e.message}_\n${SYSTEM.SHORT_WATERMARK}`); } catch (_) {} }
}

export default [
  {command:['translate'],  name:'translate',  category:'AI',description:'Translate text to any language',usage:'.translate [lang] <text>',cooldown:5,handler:translateHandler},
  {command:['tts'],        name:'tts',        category:'AI',description:'Text to speech',usage:'.tts <text>',cooldown:5,handler:ttsHandler},
  {command:['romanurdu'],  name:'romanurdu',  category:'AI',description:'Convert English to Roman Urdu',usage:'.romanurdu <text>',cooldown:5,handler:romanUrduHandler},
  {command:['sentiment'],  name:'sentiment',  category:'AI',description:'Analyze text sentiment',usage:'.sentiment <text>',cooldown:5,handler:sentimentHandler},
  {command:['code'],       name:'code',       category:'AI',description:'Code helper and fixer',usage:'.code <query>',cooldown:5,handler:codeHandler},
];
