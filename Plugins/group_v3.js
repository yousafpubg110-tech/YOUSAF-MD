/*
╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃   YOUSAF-BALOCH-MD  •  group_v3        ┃
┃  Commands: antilink antiabuse          ┃
┃            antidelete antivv warn      ┃
┃  ✅ Warnings: JSON persistent (restart-safe) ┃
┃        Created by MR YOUSAF BALOCH     ┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
*/
import fs   from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { OWNER, SYSTEM } from '../config.js';

const __dirname   = path.dirname(fileURLToPath(import.meta.url));
const WARN_FILE   = path.join(__dirname,'..','database','warnings.json');
const SETS_FILE   = path.join(__dirname,'..','database','group_settings.json');

// ─── persistent helpers ───────────────────────────────────────────────────────
function ensureDb(file) { const dir=path.dirname(file); if (!fs.existsSync(dir)) fs.mkdirSync(dir,{recursive:true}); if (!fs.existsSync(file)) fs.writeFileSync(file,'{}'); }
function readJson(file) { try { ensureDb(file); return JSON.parse(fs.readFileSync(file,'utf8')); } catch { return {}; } }
function writeJson(file,data) { try { ensureDb(file); fs.writeFileSync(file,JSON.stringify(data,null,2)); } catch (e) { console.error('[DB]',e.message); } }

// Warning CRUD
export function getUserWarns(gJid,uJid) { const all=readJson(WARN_FILE); if (!all[gJid]) all[gJid]={}; if (!all[gJid][uJid]) all[gJid][uJid]={count:0,reasons:[],lastWarn:null}; return all[gJid][uJid]; }
export function addWarning(gJid,uJid,reason='No reason') { const all=readJson(WARN_FILE); if (!all[gJid]) all[gJid]={}; if (!all[gJid][uJid]) all[gJid][uJid]={count:0,reasons:[],lastWarn:null}; const d=all[gJid][uJid]; d.count++; d.reasons.push(reason); d.lastWarn=new Date().toLocaleString('en-PK',{timeZone:'Asia/Karachi'}); writeJson(WARN_FILE,all); return d; }
export function resetWarnings(gJid,uJid) { const all=readJson(WARN_FILE); if (all[gJid]) { delete all[gJid][uJid]; writeJson(WARN_FILE,all); } }
export function getGroupWarnings(gJid) { return readJson(WARN_FILE)[gJid]||{}; }
export const MAX_WARNS=3;

// Group settings CRUD
function getSetting(gJid,key) { return readJson(SETS_FILE)[gJid]?.[key]??false; }
function setSetting(gJid,key,val) { const all=readJson(SETS_FILE); if (!all[gJid]) all[gJid]={}; all[gJid][key]=val; writeJson(SETS_FILE,all); }
export function getGroupSetting(gJid,key) { return getSetting(gJid,key); }

// Link regex
const LINK_RE=/(https?:\/\/)?(www\.)?(chat\.whatsapp\.com|wa\.me|t\.me|telegram\.me|youtu\.be|youtube\.com|instagram\.com|facebook\.com|twitter\.com|x\.com|tiktok\.com|snapchat\.com|discord\.gg|bit\.ly|tinyurl\.com|goo\.gl)[^\s]*/i;
// Abuse words
const ABUSE_WORDS=['sexy','sex','porn','xxx','nude','naked','nudes','adult','boobs','penis','vagina','fuck','fucking','bitch','slut','whore','dick','pussy','rape','nsfw','18+','onlyfans','xvideos','xnxx','pornhub'];
function hasAbuse(text) { if (!text) return false; const l=text.toLowerCase(); return ABUSE_WORDS.some(w=>l.includes(w)); }

// ─── warn + kick helper ───────────────────────────────────────────────────────
async function warnAndKick(sock,gJid,senderJid,reason,isBotAdmin,msgToDelete=null) {
  if (msgToDelete) { try { await sock.sendMessage(gJid,{delete:msgToDelete.key}); } catch (_) {} }
  const data=addWarning(gJid,senderJid,reason); const count=data.count; const num=senderJid.split('@')[0];
  const emoji=count===1?'⚠️':count===2?'🔴':'🚫';
  const action=count===1?`آپ کے پاس ابھی 2 چانس باقی ہیں۔`:count===2?`⛔ آخری 1 چانس باقی ہے! اگلی غلطی پر kick!`:`🚫 تمام چانس ختم! Remove ہو رہے ہیں!`;
  await sock.sendMessage(gJid,{text:`╭━━━『 ${emoji} *WARNING* 』━━━╮\n\n👑 *By ${OWNER.FULL_NAME}*\n\n📋 *Reason:* ${reason}\n👤 @${num}\n📊 *Warns:* ${count}/${MAX_WARNS}\n\n${action}\n\n╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n${SYSTEM.SHORT_WATERMARK}`,mentions:[senderJid]});
  if (count>=MAX_WARNS) {
    if (isBotAdmin) { await new Promise(r=>setTimeout(r,1500)); await sock.groupParticipantsUpdate(gJid,[senderJid],'remove'); resetWarnings(gJid,senderJid); await sock.sendMessage(gJid,{text:`🚫 *@${num} کو ${MAX_WARNS} warnings کے بعد remove کر دیا گیا!*\n👑 *By:* ${OWNER.FULL_NAME}\n${SYSTEM.SHORT_WATERMARK}`,mentions:[senderJid]}); }
    else await sock.sendMessage(gJid,{text:`⚠️ Bot admin نہیں ہے — @${num} کو manually remove کریں!\n${SYSTEM.SHORT_WATERMARK}`,mentions:[senderJid]});
  }
}

// ─── auto event exports (for index.js runEventPlugins) ───────────────────────
export async function autoDeleteLinks(sock,msg,from,sender,text,isBotAdmin) {
  if (!getSetting(from,'antilink')||!text) return;
  try { const meta=await sock.groupMetadata(from); const m=meta.participants.find(p=>p.id===sender); if (m?.admin) return; } catch (_) {}
  if (LINK_RE.test(text)) await warnAndKick(sock,from,sender,'Sending links (anti-link)',isBotAdmin,msg);
}
export async function autoAntiAbuse(sock,msg,from,sender,text,isBotAdmin) {
  if (!getSetting(from,'antiabuse')||!text) return;
  try { const meta=await sock.groupMetadata(from); const m=meta.participants.find(p=>p.id===sender); if (m?.admin) return; } catch (_) {}
  if (hasAbuse(text)) await warnAndKick(sock,from,sender,'Inappropriate/abusive content',isBotAdmin,msg);
}

// ─── command handlers ─────────────────────────────────────────────────────────
async function antilinkHandler({msg,from,args,isAdmin,isOwner}) {
  try {
    if (!isAdmin&&!isOwner) return msg.reply(`❌ Only admins can manage anti-link!\n${SYSTEM.SHORT_WATERMARK}`);
    const s=args[0]?.toLowerCase(); if (!['on','off'].includes(s)) return msg.reply(`⚙️ *Anti-Link*\n\n.antilink on — Enable\n.antilink off — Disable\n\n3 warnings = kick\n${SYSTEM.SHORT_WATERMARK}`);
    setSetting(from,'antilink',s==='on'); await msg.reply(`${s==='on'?'✅ Anti-Link *enabled*':'❌ Anti-Link *disabled*'}\n${SYSTEM.SHORT_WATERMARK}`); await msg.react(s==='on'?'✅':'❌');
  } catch (e) { try { await msg.react('❌'); await msg.reply(`❌ _${e.message}_`); } catch (_) {} }
}
async function antiabusHandler({msg,from,args,isAdmin,isOwner}) {
  try {
    if (!isAdmin&&!isOwner) return msg.reply(`❌ Only admins can manage anti-abuse!\n${SYSTEM.SHORT_WATERMARK}`);
    const s=args[0]?.toLowerCase(); if (!['on','off'].includes(s)) return msg.reply(`⚙️ *Anti-Abuse*\n\n.antiabuse on\n.antiabuse off\n${SYSTEM.SHORT_WATERMARK}`);
    setSetting(from,'antiabuse',s==='on'); await msg.reply(`${s==='on'?'✅ Anti-Abuse *enabled*':'❌ Anti-Abuse *disabled*'}\n${SYSTEM.SHORT_WATERMARK}`); await msg.react(s==='on'?'✅':'❌');
  } catch (e) { try { await msg.react('❌'); await msg.reply(`❌ _${e.message}_`); } catch (_) {} }
}
async function antideleteHandler({msg,from,args,isAdmin,isOwner}) {
  try {
    if (!isAdmin&&!isOwner) return msg.reply(`❌ Only admins can manage anti-delete!\n${SYSTEM.SHORT_WATERMARK}`);
    const s=args[0]?.toLowerCase(); if (!['on','off'].includes(s)) return msg.reply(`⚙️ *Anti-Delete*\n\n.antidelete on\n.antidelete off\n${SYSTEM.SHORT_WATERMARK}`);
    setSetting(from,'antidelete',s==='on');
    if (!global.db) global.db={data:{settings:{}}}; if (!global.db.data) global.db.data={settings:{}}; if (!global.db.data.settings) global.db.data.settings={};
    global.db.data.settings[`antidelete_${from}`]=s==='on';
    await msg.reply(`${s==='on'?'✅ Anti-Delete *enabled*':'❌ Anti-Delete *disabled*'}\n${SYSTEM.SHORT_WATERMARK}`); await msg.react(s==='on'?'✅':'❌');
  } catch (e) { try { await msg.react('❌'); await msg.reply(`❌ _${e.message}_`); } catch (_) {} }
}
async function antivvHandler({msg,from,args,isAdmin,isOwner}) {
  try {
    if (!isAdmin&&!isOwner) return msg.reply(`❌ Only admins can manage anti view-once!\n${SYSTEM.SHORT_WATERMARK}`);
    const s=args[0]?.toLowerCase(); if (!['on','off'].includes(s)) return msg.reply(`⚙️ *Anti View-Once*\n\n.antivv on — Reveal view-once\n.antivv off\n${SYSTEM.SHORT_WATERMARK}`);
    setSetting(from,'antivv',s==='on');
    if (!global.db) global.db={data:{settings:{}}}; if (!global.db.data) global.db.data={settings:{}}; if (!global.db.data.settings) global.db.data.settings={};
    global.db.data.settings[`antivv_${from}`]=s==='on';
    await msg.reply(`${s==='on'?'✅ Anti View-Once *enabled*':'❌ Anti View-Once *disabled*'}\n${SYSTEM.SHORT_WATERMARK}`); await msg.react(s==='on'?'✅':'❌');
  } catch (e) { try { await msg.react('❌'); await msg.reply(`❌ _${e.message}_`); } catch (_) {} }
}
async function warnHandler({sock,msg,from,text,args,isAdmin,isBotAdmin,isOwner}) {
  try {
    if (!isAdmin&&!isOwner) return msg.reply(`❌ Only admins can warn!\n${SYSTEM.SHORT_WATERMARK}`);
    const target=msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]||msg.message?.extendedTextMessage?.contextInfo?.participant;
    if (!target) return msg.reply(`❌ Please mention or reply to a user!\n\n.warn @user [reason]\n${SYSTEM.SHORT_WATERMARK}`);
    const meta=await sock.groupMetadata(from); const member=meta.participants.find(p=>p.id===target);
    if (member?.admin) return msg.reply(`❌ Cannot warn an admin!\n${SYSTEM.SHORT_WATERMARK}`);
    const reason=(text||'').replace(/@\d+/g,'').trim()||'Rule violation';
    await warnAndKick(sock,from,target,reason,isBotAdmin,null); await msg.react('✅');
  } catch (e) { console.error('[WARN]',e.message); try { await msg.react('❌'); await msg.reply(`❌ _${e.message}_`); } catch (_) {} }
}

export default [
  {command:['antilink'],  name:'antilink',  category:'Group',description:'Auto-delete links + warn (3=kick)',usage:'.antilink on/off',groupOnly:true,cooldown:5,handler:antilinkHandler},
  {command:['antiabuse'], name:'antiabuse', category:'Group',description:'Auto-delete abuse + warn (3=kick)',usage:'.antiabuse on/off',groupOnly:true,cooldown:5,handler:antiabusHandler},
  {command:['antidelete'],name:'antidelete',category:'Group',description:'Reveal deleted messages',usage:'.antidelete on/off',groupOnly:true,cooldown:5,handler:antideleteHandler},
  {command:['antivv'],    name:'antivv',    category:'Group',description:'Reveal view-once media',usage:'.antivv on/off',groupOnly:true,cooldown:5,handler:antivvHandler},
  {command:['warn'],      name:'warn',      category:'Group',description:'Warn a member (3=kick)',usage:'.warn @user [reason]',groupOnly:true,cooldown:3,handler:warnHandler},
];
