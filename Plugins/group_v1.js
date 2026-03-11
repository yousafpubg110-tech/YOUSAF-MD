/*
╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃   YOUSAF-BALOCH-MD  •  group_v1        ┃
┃   Commands: kick add promote demote    ┃
┃             ban                        ┃
┃        Created by MR YOUSAF BALOCH     ┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
*/
import fs   from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { OWNER, SYSTEM } from '../config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BAN_FILE  = path.join(__dirname, '..', 'database', 'banned.json');

function readBans() { try { if (!fs.existsSync(BAN_FILE)) return {}; return JSON.parse(fs.readFileSync(BAN_FILE,'utf8')); } catch { return {}; } }
function writeBans(d) { try { const dir=path.dirname(BAN_FILE); if (!fs.existsSync(dir)) fs.mkdirSync(dir,{recursive:true}); fs.writeFileSync(BAN_FILE,JSON.stringify(d,null,2)); } catch (e) { console.error('[BAN DB]',e.message); } }
export function addBan(gJid,uJid,reason='No reason',by='Admin') { const d=readBans(); if (!d[gJid]) d[gJid]={}; d[gJid][uJid]={reason,bannedBy:by,date:new Date().toLocaleString('en-PK',{timeZone:'Asia/Karachi'})}; writeBans(d); }
export function removeBan(gJid,uJid) { const d=readBans(); if (d[gJid]) { delete d[gJid][uJid]; writeBans(d); } }
export function isBanned(gJid,uJid) { return !!readBans()[gJid]?.[uJid]; }
export function getBanList(gJid) { return readBans()[gJid]||{}; }

function getTarget(msg,args) {
  const m=msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
  const q=msg.message?.extendedTextMessage?.contextInfo?.participant;
  if (m) return m; if (q) return q;
  if (args?.[0]) { const c=args[0].replace(/[^0-9]/g,''); if (c.length>=10) return c+'@s.whatsapp.net'; }
  return null;
}

async function kickHandler({sock,msg,from,args,isAdmin,isBotAdmin,isOwner}) {
  try {
    if (!isAdmin&&!isOwner) return msg.reply(`❌ Only admins can kick members!\n${SYSTEM.SHORT_WATERMARK}`);
    if (!isBotAdmin) return msg.reply(`❌ Bot must be admin to kick!\n${SYSTEM.SHORT_WATERMARK}`);
    const t=getTarget(msg,args); if (!t) return msg.reply(`❌ Please tag someone to kick!\n\n.kick @user\n${SYSTEM.SHORT_WATERMARK}`);
    const num=t.split('@')[0];
    await sock.groupParticipantsUpdate(from,[t],'remove');
    await sock.sendMessage(from,{text:`╭━━━『 👢 *KICKED* 』━━━╮\n\n✅ @${num} has been kicked!\n👑 *By:* ${OWNER.FULL_NAME}\n\n╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n${SYSTEM.SHORT_WATERMARK}`,mentions:[t]},{quoted:msg});
    await msg.react('✅');
  } catch (e) { console.error('[KICK]',e.message); try { await msg.react('❌'); await msg.reply(`❌ _${e.message}_`); } catch (_) {} }
}

async function addHandler({sock,msg,from,args,isAdmin,isBotAdmin,isOwner}) {
  try {
    if (!isAdmin&&!isOwner) return msg.reply(`❌ Only admins can add members!\n${SYSTEM.SHORT_WATERMARK}`);
    if (!isBotAdmin) return msg.reply(`❌ Bot must be admin to add!\n${SYSTEM.SHORT_WATERMARK}`);
    if (!args?.length) return msg.reply(`❌ Please provide a phone number!\n\n.add 923001234567\n${SYSTEM.SHORT_WATERMARK}`);
    await msg.react('⏳');
    const clean=args[0].replace(/[^0-9]/g,''); if (clean.length<10) { await msg.react('❌'); return msg.reply('❌ Invalid phone number! Include country code.'); }
    const jid=clean+'@s.whatsapp.net'; const result=await sock.groupParticipantsUpdate(from,[jid],'add');
    const status=result?.[0]?.status;
    if (status==='200') { await sock.sendMessage(from,{text:`✅ *@${clean} added to group!*\n${SYSTEM.SHORT_WATERMARK}`,mentions:[jid]},{quoted:msg}); await msg.react('✅'); }
    else if (status==='403') { await msg.react('❌'); await msg.reply(`❌ @${clean} has restricted who can add them.\n${SYSTEM.SHORT_WATERMARK}`); }
    else { await msg.react('❌'); await msg.reply(`❌ Could not add user (status: ${status})\n${SYSTEM.SHORT_WATERMARK}`); }
  } catch (e) { console.error('[ADD]',e.message); try { await msg.react('❌'); await msg.reply(`❌ _${e.message}_`); } catch (_) {} }
}

async function promoteHandler({sock,msg,from,args,isAdmin,isBotAdmin,isOwner}) {
  try {
    if (!isAdmin&&!isOwner) return msg.reply(`❌ Only admins can promote!\n${SYSTEM.SHORT_WATERMARK}`);
    if (!isBotAdmin) return msg.reply(`❌ Bot must be admin to promote!\n${SYSTEM.SHORT_WATERMARK}`);
    const t=getTarget(msg,args); if (!t) return msg.reply(`❌ Please tag someone to promote!\n\n.promote @user\n${SYSTEM.SHORT_WATERMARK}`);
    const num=t.split('@')[0];
    await sock.groupParticipantsUpdate(from,[t],'promote');
    await sock.sendMessage(from,{text:`╭━━━『 ⬆️ *PROMOTED* 』━━━╮\n\n✅ @${num} is now Admin!\n👑 *By:* ${OWNER.FULL_NAME}\n\n╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n${SYSTEM.SHORT_WATERMARK}`,mentions:[t]},{quoted:msg});
    await msg.react('✅');
  } catch (e) { console.error('[PROMOTE]',e.message); try { await msg.react('❌'); await msg.reply(`❌ _${e.message}_`); } catch (_) {} }
}

async function demoteHandler({sock,msg,from,args,isAdmin,isBotAdmin,isOwner}) {
  try {
    if (!isAdmin&&!isOwner) return msg.reply(`❌ Only admins can demote!\n${SYSTEM.SHORT_WATERMARK}`);
    if (!isBotAdmin) return msg.reply(`❌ Bot must be admin to demote!\n${SYSTEM.SHORT_WATERMARK}`);
    const t=getTarget(msg,args); if (!t) return msg.reply(`❌ Please tag someone to demote!\n\n.demote @user\n${SYSTEM.SHORT_WATERMARK}`);
    const num=t.split('@')[0];
    await sock.groupParticipantsUpdate(from,[t],'demote');
    await sock.sendMessage(from,{text:`╭━━━『 ⬇️ *DEMOTED* 』━━━╮\n\n✅ @${num} admin removed!\n👑 *By:* ${OWNER.FULL_NAME}\n\n╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n${SYSTEM.SHORT_WATERMARK}`,mentions:[t]},{quoted:msg});
    await msg.react('✅');
  } catch (e) { console.error('[DEMOTE]',e.message); try { await msg.react('❌'); await msg.reply(`❌ _${e.message}_`); } catch (_) {} }
}

async function banHandler({sock,msg,from,sender,text,args,isAdmin,isBotAdmin,isOwner}) {
  try {
    if (!isAdmin&&!isOwner) return msg.reply(`❌ Only admins can ban!\n${SYSTEM.SHORT_WATERMARK}`);
    const input=(text||'').toLowerCase().trim();
    if (input==='list'||input==='show') {
      const bans=getBanList(from); const entries=Object.entries(bans);
      if (!entries.length) return msg.reply(`📋 *No banned users in this group.*\n${SYSTEM.SHORT_WATERMARK}`);
      const mentions=entries.map(([j])=>j);
      let m2=`╭━━━『 🚫 *BAN LIST* 』━━━╮\n\n`;
      entries.forEach(([j,info],i)=>{ m2+=`${i+1}. @${j.split('@')[0]}\n   📋 ${info.reason}\n   👑 By: ${info.bannedBy}\n   📅 ${info.date}\n\n`; });
      m2+=`╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n${SYSTEM.SHORT_WATERMARK}`;
      return await sock.sendMessage(from,{text:m2,mentions},{quoted:msg});
    }
    const t=getTarget(msg,args); if (!t) return msg.reply(`❌ Please tag someone to ban!\n\n.ban @user [reason]\n.ban list\n${SYSTEM.SHORT_WATERMARK}`);
    const num=t.split('@')[0]; const reason=input.replace(/@\d+/g,'').trim()||'Rule violation';
    addBan(from,t,reason,sender.split('@')[0]);
    if (isBotAdmin) await sock.groupParticipantsUpdate(from,[t],'remove');
    await sock.sendMessage(from,{text:`╭━━━『 🚫 *BANNED* 』━━━╮\n\n🚫 @${num} has been banned!\n📋 *Reason:* ${reason}\n👑 *By:* ${OWNER.FULL_NAME}${!isBotAdmin?'\n\n⚠️ Bot is not admin — kick manually.':''}\n\n╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n${SYSTEM.SHORT_WATERMARK}`,mentions:[t]},{quoted:msg});
    await msg.react('✅');
  } catch (e) { console.error('[BAN]',e.message); try { await msg.react('❌'); await msg.reply(`❌ _${e.message}_`); } catch (_) {} }
}

export default [
  {command:['kick'],   name:'kick',   category:'Group',description:'Kick a member',usage:'.kick @user',groupOnly:true,cooldown:3,handler:kickHandler},
  {command:['add'],    name:'add',    category:'Group',description:'Add a member',usage:'.add 923xxxxxxxxx',groupOnly:true,cooldown:3,handler:addHandler},
  {command:['promote'],name:'promote',category:'Group',description:'Promote to admin',usage:'.promote @user',groupOnly:true,cooldown:3,handler:promoteHandler},
  {command:['demote'], name:'demote', category:'Group',description:'Remove admin',usage:'.demote @user',groupOnly:true,cooldown:3,handler:demoteHandler},
  {command:['ban'],    name:'ban',    category:'Group',description:'Ban a member',usage:'.ban @user [reason]',groupOnly:true,cooldown:3,handler:banHandler},
];
