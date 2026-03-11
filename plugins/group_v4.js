/*
╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃   YOUSAF-BALOCH-MD  •  group_v4        ┃
┃  Commands: unwarn warnlist bannedlist  ┃
┃            ghost activity              ┃
┃        Created by MR YOUSAF BALOCH     ┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
*/
import { OWNER, SYSTEM } from '../config.js';
import { getUserWarns, resetWarnings, getGroupWarnings, MAX_WARNS } from './group_v3.js';
import { getBanList } from './group_v1.js';

// ─── in-memory activity tracker ───────────────────────────────────────────────
export const groupActivity = new Map();
export function trackMessage(gJid,uJid) {
  if (!groupActivity.has(gJid)) groupActivity.set(gJid,new Map());
  const gd=groupActivity.get(gJid); const cur=gd.get(uJid)||{messages:0}; cur.messages++; gd.set(uJid,cur);
}

async function unwarnHandler({sock,msg,from,isAdmin,isOwner}) {
  try {
    if (!isAdmin&&!isOwner) return msg.reply(`❌ Only admins can remove warnings!\n${SYSTEM.SHORT_WATERMARK}`);
    const target=msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]||msg.message?.extendedTextMessage?.contextInfo?.participant;
    if (!target) return msg.reply(`❌ Please mention a user!\n\n.unwarn @user\n${SYSTEM.SHORT_WATERMARK}`);
    const d=getUserWarns(from,target); const num=target.split('@')[0];
    if (d.count===0) return msg.reply(`ℹ️ @${num} has no warnings!\n${SYSTEM.SHORT_WATERMARK}`);
    const prev=d.count; resetWarnings(from,target);
    await sock.sendMessage(from,{text:`╭━━━『 ✅ *UNWARN* 』━━━╮\n\n✅ @${num} warnings cleared!\n📊 *Removed:* ${prev} warning(s)\n👑 *By:* ${OWNER.FULL_NAME}\n\n╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n${SYSTEM.SHORT_WATERMARK}`,mentions:[target]},{quoted:msg});
    await msg.react('✅');
  } catch (e) { console.error('[UNWARN]',e.message); try { await msg.react('❌'); await msg.reply(`❌ _${e.message}_`); } catch (_) {} }
}

async function warnlistHandler({sock,msg,from,isAdmin,isOwner}) {
  try {
    if (!isAdmin&&!isOwner) return msg.reply(`❌ Only admins can view warn list!\n${SYSTEM.SHORT_WATERMARK}`);
    const gw=getGroupWarnings(from); const entries=Object.entries(gw).filter(([,d])=>d.count>0);
    if (!entries.length) return msg.reply(`✅ *No warned members in this group!*\n\n🎉 Everyone is behaving!\n${SYSTEM.SHORT_WATERMARK}`);
    const mentions=entries.map(([j])=>j);
    const sections=entries.map(([j,d],i)=>{ const num=j.split('@')[0]; const ind=d.count>=MAX_WARNS?'🚫':d.count>=2?'🔴':'⚠️'; return `│ ${i+1}. ${ind} @${num} — ${d.count}/${MAX_WARNS} warns\n│    Last: ${d.reasons.at(-1)||'N/A'}`; }).join('\n│\n');
    await sock.sendMessage(from,{text:`╭━━━『 ⚠️ *WARN LIST* 』━━━╮\n\n📋 *Warned:* ${entries.length}\n\n╭─『 List 』\n${sections}\n╰──────────────────────────\n\n╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n${SYSTEM.SHORT_WATERMARK}`,mentions},{quoted:msg});
    await msg.react('✅');
  } catch (e) { console.error('[WARNLIST]',e.message); try { await msg.react('❌'); await msg.reply(`❌ _${e.message}_`); } catch (_) {} }
}

async function bannedlistHandler({sock,msg,from,isAdmin,isOwner}) {
  try {
    if (!isAdmin&&!isOwner) return msg.reply(`❌ Only admins can view banned list!\n${SYSTEM.SHORT_WATERMARK}`);
    const bans=getBanList(from); const entries=Object.entries(bans);
    if (!entries.length) return msg.reply(`📋 *No banned users in this group.*\n${SYSTEM.SHORT_WATERMARK}`);
    const mentions=entries.map(([j])=>j);
    const sections=entries.map(([j,info],i)=>`│ ${i+1}. 🚫 @${j.split('@')[0]}\n│    📋 ${info.reason}\n│    👑 By: ${info.bannedBy}\n│    📅 ${info.date}`).join('\n│\n');
    await sock.sendMessage(from,{text:`╭━━━『 🚫 *BAN LIST* 』━━━╮\n\n👥 *Banned:* ${entries.length}\n\n╭─『 List 』\n${sections}\n╰──────────────────────────\n\n╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n${SYSTEM.SHORT_WATERMARK}`,mentions},{quoted:msg});
    await msg.react('✅');
  } catch (e) { console.error('[BANNEDLIST]',e.message); try { await msg.react('❌'); await msg.reply(`❌ _${e.message}_`); } catch (_) {} }
}

async function ghostHandler({sock,msg,from,text,isAdmin,isBotAdmin,isOwner}) {
  try {
    if (!isAdmin&&!isOwner) return msg.reply(`❌ Only admins can check ghost members!\n${SYSTEM.SHORT_WATERMARK}`);
    await msg.react('👻'); await msg.reply('👻 *Checking ghost members…*\n⏳ Please wait…');
    const meta=await sock.groupMetadata(from); const members=meta.participants;
    const gd=groupActivity.get(from);
    let ghosts; if (gd&&gd.size>0) ghosts=members.filter(m=>!m.admin&&!gd.has(m.id)); else ghosts=members.filter(m=>!m.admin);
    if (!ghosts.length) return msg.reply(`✅ *No ghost members found!*\n🎉 Everyone is active!\n${SYSTEM.SHORT_WATERMARK}`);
    const shouldKick=(text||'').toLowerCase().includes('kick')&&isBotAdmin;
    const shown=ghosts.slice(0,50); const mentions=shown.map(m=>m.id);
    const ghostList=shown.map((m,i)=>`│ ${i+1}. 👻 @${m.id.split('@')[0]}`).join('\n');
    const extra=ghosts.length>50?`│ …and ${ghosts.length-50} more\n`:'';
    await sock.sendMessage(from,{text:`╭━━━『 👻 *GHOST MEMBERS* 』━━━╮\n\n👥 *Total ghosts:* ${ghosts.length}\n${!gd?'⚠️ _No activity data yet_\n':''}\n${ghostList}\n${extra}\n╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n\n${shouldKick?'🚀 Kicking…':'💡 Use _.ghost kick_ to remove them'}\n${SYSTEM.SHORT_WATERMARK}`,mentions},{quoted:msg});
    if (shouldKick) { for (const m of shown) { try { await sock.groupParticipantsUpdate(from,[m.id],'remove'); await new Promise(r=>setTimeout(r,500)); } catch (_) {} } await msg.reply(`✅ *Kicked ${shown.length} ghost members!*\n${SYSTEM.SHORT_WATERMARK}`); }
    await msg.react('✅');
  } catch (e) { console.error('[GHOST]',e.message); try { await msg.react('❌'); await msg.reply(`❌ _${e.message}_`); } catch (_) {} }
}

async function activityHandler({sock,msg,from,isAdmin,isOwner}) {
  try {
    if (!isAdmin&&!isOwner) return msg.reply(`❌ Only admins can view activity!\n${SYSTEM.SHORT_WATERMARK}`);
    await msg.react('📊'); const gd=groupActivity.get(from);
    if (!gd||gd.size===0) return msg.reply(`📊 *No activity data yet!*\n\n💡 Activity is tracked since the bot started.\n${SYSTEM.SHORT_WATERMARK}`);
    const sorted=[...gd.entries()].sort((a,b)=>b[1].messages-a[1].messages).slice(0,10);
    const mentions=sorted.map(([j])=>j);
    const top=sorted.map(([j,d],i)=>{ const num=j.split('@')[0]; const medal=i===0?'🥇':i===1?'🥈':i===2?'🥉':`${i+1}.`; const bar='█'.repeat(Math.min(10,Math.round(d.messages/10)))||'░'; return `│ ${medal} @${num}\n│    💬 ${d.messages} msgs  ${bar}`; }).join('\n│\n');
    await sock.sendMessage(from,{text:`╭━━━『 📊 *TOP MEMBERS* 』━━━╮\n\n👥 *Active Members:* ${gd.size}\n\n╭─『 🏆 *Top 10* 』\n${top}\n╰──────────────────────────\n\n╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n${SYSTEM.SHORT_WATERMARK}`,mentions},{quoted:msg});
    await msg.react('✅');
  } catch (e) { console.error('[ACTIVITY]',e.message); try { await msg.react('❌'); await msg.reply(`❌ _${e.message}_`); } catch (_) {} }
}

export default [
  {command:['unwarn'],    name:'unwarn',    category:'Group',description:'Remove warnings',usage:'.unwarn @user',groupOnly:true,cooldown:3,handler:unwarnHandler},
  {command:['warnlist'],  name:'warnlist',  category:'Group',description:'View warn list',usage:'.warnlist',groupOnly:true,cooldown:5,handler:warnlistHandler},
  {command:['bannedlist'],name:'bannedlist',category:'Group',description:'View ban list',usage:'.bannedlist',groupOnly:true,cooldown:5,handler:bannedlistHandler},
  {command:['ghost'],     name:'ghost',     category:'Group',description:'Find inactive members',usage:'.ghost [kick]',groupOnly:true,cooldown:10,handler:ghostHandler},
  {command:['activity'],  name:'activity',  category:'Group',description:'Top active members',usage:'.activity',groupOnly:true,cooldown:5,handler:activityHandler},
];
