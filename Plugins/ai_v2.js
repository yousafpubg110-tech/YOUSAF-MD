/*
╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃   YOUSAF-BALOCH-MD  •  ai_v2           ┃
┃  Commands: imagine dalle bgremove      ┃
┃            upscale ocr                 ┃
┃        Created by MR YOUSAF BALOCH     ┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
*/
import axios from 'axios';
import { sanitizeUrl } from '../lib/utils.js';
import { downloadMediaMessage } from '@whiskeysockets/baileys';
import { SYSTEM } from '../config.js';

const GEMINI_KEY   = process.env.GEMINI_API_KEY   || '';
const REMOVEBG_KEY = process.env.REMOVEBG_API_KEY || '';
const RAPID_KEY    = process.env.RAPIDAPI_KEY      || '';
const safeUrl = u => { try { const p=new URL(u); return ['https:','http:'].includes(p.protocol)?p.href:null; } catch { return null; } };

// ─── download image from message ─────────────────────────────────────────────
async function getImageBuf(sock,msg) {
  const isQ=!!msg.quoted; const target=isQ?{key:{remoteJid:msg.from||'',id:msg.quoted?.id,participant:msg.quoted?.sender},message:msg.quoted?.message}:msg;
  const mime=isQ?msg.quoted?.mimetype||'':msg.message?.imageMessage?.mimetype||msg.message?.stickerMessage?.mimetype||'';
  if (!mime||!/image|webp/i.test(mime)) return null;
  try { return await downloadMediaMessage(target,'buffer',{}); } catch { return null; }
}

// ─── imagine / dalle ─────────────────────────────────────────────────────────
async function imagineHandler({sock,msg,from,args}) {
  try {
    if (!args?.length) return msg.reply(`❌ Please provide an image description!\n\n.imagine sunset over Pakistani mountains\n${SYSTEM.SHORT_WATERMARK}`);
    await msg.react('🎨'); await msg.reply('🎨 *Generating AI image…*');
    const prompt=args.join(' ');
    let imageUrl=null;
    // Nexoracle imagine
    try { const raw=`https://api.nexoracle.com/ai/imagine?apikey=free_key@maher_apis&prompt=${encodeURIComponent(prompt)}`; const safe=sanitizeUrl(raw); if (safe) { const r=await axios.get(safe,{timeout:60000}); const url=r.data?.result?.url||r.data?.url; if (url) imageUrl=safeUrl(url); } } catch (_) {}
    // Pollinations fallback (free, no key)
    if (!imageUrl) { imageUrl=safeUrl(`https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=512&height=512&nologo=true`); }
    if (!imageUrl) { await msg.react('❌'); return msg.reply(`❌ Image generation failed!\n${SYSTEM.SHORT_WATERMARK}`); }
    const imgRes=await axios.get(imageUrl,{responseType:'arraybuffer',timeout:60000}); const imgBuf=Buffer.from(imgRes.data);
    await sock.sendMessage(from,{image:imgBuf,caption:`🎨 *AI Generated Image*\n\n📝 *Prompt:* ${prompt}\n${SYSTEM.SHORT_WATERMARK}`},{quoted:msg});
    await msg.react('✅');
  } catch (e) { console.error('[IMAGINE]',e.message); try { await msg.react('❌'); await msg.reply(`❌ _${e.message}_\n${SYSTEM.SHORT_WATERMARK}`); } catch (_) {} }
}

// ─── bgremove ─────────────────────────────────────────────────────────────────
async function bgremoveHandler({sock,msg,from}) {
  try {
    if (!REMOVEBG_KEY) return msg.reply(`❌ *REMOVEBG_API_KEY not set in .env!*\n🔗 Get free key: remove.bg/api\n${SYSTEM.SHORT_WATERMARK}`);
    await msg.react('⏳'); await msg.reply('⏳ *Removing background…*');
    const imgBuf=await getImageBuf(sock,msg);
    if (!imgBuf) { await msg.react('❌'); return msg.reply(`❌ Please reply to an image!\n${SYSTEM.SHORT_WATERMARK}`); }
    const url=new URL('https://api.remove.bg/v1.0/removebg'); if (url.hostname!=='api.remove.bg') throw new Error('bad host');
    const FormData=(await import('form-data')).default; const form=new FormData(); form.append('image_file',imgBuf,{filename:'img.jpg',contentType:'image/jpeg'}); form.append('size','auto');
    const ctrl=new AbortController(); const timer=setTimeout(()=>ctrl.abort(),30000);
    let resultBuf;
    try { const r=await fetch(url.toString(),{method:'POST',signal:ctrl.signal,headers:{'X-Api-Key':REMOVEBG_KEY,...form.getHeaders()},body:form}); clearTimeout(timer); if (!r.ok) { const err=await r.json().catch(()=>({})); throw new Error(err?.errors?.[0]?.title||`remove.bg error: ${r.status}`); } resultBuf=Buffer.from(await r.arrayBuffer()); } finally { clearTimeout(timer); }
    await sock.sendMessage(from,{image:resultBuf,caption:`✅ *Background Removed!*\n${SYSTEM.SHORT_WATERMARK}`},{quoted:msg});
    await msg.react('✅');
  } catch (e) { console.error('[BGREMOVE]',e.message); try { await msg.react('❌'); await msg.reply(`❌ _${e.message}_\n💡 Make sure REMOVEBG_API_KEY is set in .env\n${SYSTEM.SHORT_WATERMARK}`); } catch (_) {} }
}

// ─── upscale ──────────────────────────────────────────────────────────────────
async function upscaleHandler({sock,msg,from}) {
  try {
    if (!RAPID_KEY) return msg.reply(`❌ *RAPIDAPI_KEY not set in .env!*\n🔗 Get free key: rapidapi.com\n${SYSTEM.SHORT_WATERMARK}`);
    await msg.react('⏳'); await msg.reply('⏳ *Enhancing image quality…*');
    const imgBuf=await getImageBuf(sock,msg);
    if (!imgBuf) { await msg.react('❌'); return msg.reply(`❌ Please reply to an image!\n${SYSTEM.SHORT_WATERMARK}`); }
    const base64=imgBuf.toString('base64');
    const r=await axios.post('https://ai-picture-upscaler.p.rapidapi.com/upscale-picture',{image:`data:image/jpeg;base64,${base64}`,scale:4},{headers:{'Content-Type':'application/json','X-RapidAPI-Key':RAPID_KEY,'X-RapidAPI-Host':'ai-picture-upscaler.p.rapidapi.com'},timeout:45000});
    const result=r.data?.result||r.data?.data||r.data?.url;
    if (!result) throw new Error('No result from API');
    let resultBuf; if (typeof result==='string'&&result.startsWith('data:')) { resultBuf=Buffer.from(result.split(',')[1],'base64'); } else if (typeof result==='string') { const ir=await axios.get(result,{responseType:'arraybuffer',timeout:30000}); resultBuf=Buffer.from(ir.data); } else throw new Error('Unknown result format');
    await sock.sendMessage(from,{image:resultBuf,caption:`✨ *Image Enhanced (4x)!*\n${SYSTEM.SHORT_WATERMARK}`},{quoted:msg});
    await msg.react('✅');
  } catch (e) { console.error('[UPSCALE]',e.message); try { await msg.react('❌'); await msg.reply(`❌ _${e.message}_\n💡 Make sure RAPIDAPI_KEY is set.\n${SYSTEM.SHORT_WATERMARK}`); } catch (_) {} }
}

// ─── ocr ──────────────────────────────────────────────────────────────────────
async function ocrHandler({sock,msg,from}) {
  try {
    await msg.react('⏳'); await msg.reply('🔍 *Extracting text from image…*');
    const imgBuf=await getImageBuf(sock,msg);
    if (!imgBuf) { await msg.react('❌'); return msg.reply(`❌ Please reply to an image!\n${SYSTEM.SHORT_WATERMARK}`); }
    let text=null;
    // Gemini Vision
    if (GEMINI_KEY) { try { const base64=imgBuf.toString('base64'); const url=new URL('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'); url.searchParams.set('key',GEMINI_KEY); const ctrl=new AbortController(); const timer=setTimeout(()=>ctrl.abort(),30000); try { const r=await fetch(url.toString(),{method:'POST',signal:ctrl.signal,headers:{'Content-Type':'application/json'},body:JSON.stringify({contents:[{parts:[{text:'Extract ALL text from this image. Include both English and Urdu/Arabic text. Return only the text, nothing else.'},{inline_data:{mime_type:'image/jpeg',data:base64}}]}],generationConfig:{maxOutputTokens:2000,temperature:0}})}); clearTimeout(timer); if (r.ok) { const d=await r.json(); text=d?.candidates?.[0]?.content?.parts?.[0]?.text||null; } } finally { clearTimeout(timer); } } catch (_) {} }
    // OCR.space fallback
    if (!text) { try { const FormData=(await import('form-data')).default; const form=new FormData(); form.append('file',imgBuf,{filename:'img.jpg',contentType:'image/jpeg'}); form.append('apikey','helloworld'); form.append('language','eng'); const ctrl=new AbortController(); const timer=setTimeout(()=>ctrl.abort(),20000); try { const r=await fetch('https://api.ocr.space/parse/image',{method:'POST',signal:ctrl.signal,headers:form.getHeaders(),body:form}); clearTimeout(timer); if (r.ok) { const d=await r.json(); text=d?.ParsedResults?.[0]?.ParsedText||null; } } finally { clearTimeout(timer); } } catch (_) {} }
    if (!text||!text.trim()) { await msg.react('❌'); return msg.reply(`❌ No text found in image!\n${SYSTEM.SHORT_WATERMARK}`); }
    await msg.reply(`╭━━━『 🔍 *OCR RESULT* 』━━━╮\n\n📝 *Extracted Text:*\n${text.trim()}\n\n╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n${SYSTEM.SHORT_WATERMARK}`);
    await msg.react('✅');
  } catch (e) { console.error('[OCR]',e.message); try { await msg.react('❌'); await msg.reply(`❌ _${e.message}_\n${SYSTEM.SHORT_WATERMARK}`); } catch (_) {} }
}

export default [
  {command:['imagine'],  name:'imagine',  category:'AI',description:'Generate AI image',usage:'.imagine <description>',cooldown:15,handler:imagineHandler},
  {command:['dalle'],    name:'dalle',    category:'AI',description:'DALL-E image generation',usage:'.dalle <description>',cooldown:15,handler:imagineHandler},
  {command:['bgremove'], name:'bgremove', category:'AI',description:'Remove image background',usage:'.bgremove (reply to image)',cooldown:10,handler:bgremoveHandler},
  {command:['upscale'],  name:'upscale',  category:'AI',description:'Enhance image quality 4x',usage:'.upscale (reply to image)',cooldown:15,handler:upscaleHandler},
  {command:['ocr'],      name:'ocr',      category:'AI',description:'Extract text from image',usage:'.ocr (reply to image)',cooldown:10,handler:ocrHandler},
];
