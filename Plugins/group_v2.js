/*
╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃   YOUSAF-BALOCH-MD  •  group_v2        ┃
┃  Commands: tagall hidetag admins       ┃
┃            members link                ┃
┃        Created by MR YOUSAF BALOCH     ┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
*/
import { OWNER, SYSTEM } from '../config.js';

async function tagallHandler({sock,msg,from,args,sender,isAdmin,isOwner}) {
  try {
    if (!isAdmin&&!isOwner) return msg.reply(`❌ Only admins can tag all!\n${SYSTEM.SHORT_WATERMARK}`);
    await msg.react('📢');
    const meta=await sock.groupMetadata(from); const members=meta.participants; const message=args?.length?args.join(' '):`📢 Tag All by ${OWNER.BOT_NAME}`;
    const senderNum=sender?.split('@')[0]||'User'; const CHUNK=50;
    for (let i=0;i<members.length;i+=CHUNK) {
      const chunk=members.slice(i,i+CHUNK); const chunked=chunk.map(p=>p.id);
      const list=chunk.map(p=>{ const num=p.id.split('@')[0]; const icon=p.admin==='superadmin'?'👑':p.admin==='admin'?'🛡️':'👤'; return `${icon} @${num}`; }).join('\n');
      const text=i===0?`╭━━━『 📢 *TAG ALL* 』━━━╮\n\n📣 *Message:* ${message}\n👋 *By:* @${senderNum}\n👥 *Members:* ${members.length}\n\n${list}\n\n╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n${SYSTEM.SHORT_WATERMARK}`:list;
      await sock.sendMessage(from,{text,mentions:chunked},{quoted:i===0?msg:undefined});
      if (i+CHUNK<members.length) await new Promise(r=>setTimeout(r,1000));
    }
    await msg.react('✅');
  } catch (e) { console.error('[TAGALL]',e.message); try { await msg.react('❌'); await msg.reply(`❌ _${e.message}_`); } catch (_) {} }
}

async function hidetagHandler({sock,msg,from,args,isAdmin,isOwner}) {
  try {
    if (!isAdmin&&!isOwner) return msg.reply(`❌ Only admins can use hidetag!\n${SYSTEM.SHORT_WATERMARK}`);
    const meta=await sock.groupMetadata(from); const users=meta.participants.map(p=>p.id);
    const message=args?.length?args.join(' '):'📣';
    await sock.sendMessage(from,{text:message,mentions:users},{quoted:msg});
    await msg.react('✅');
  } catch (e) { console.error('[HIDETAG]',e.message); try { await msg.react('❌'); await msg.reply(`❌ _${e.message}_`); } catch (_) {} }
}

async function adminsHandler({sock,msg,from,sender,text}) {
  try {
    await msg.react('👑');
    const meta=await sock.groupMetadata(from); const admins=meta.participants.filter(p=>p.admin==='admin'||p.admin==='superadmin');
    if (!admins.length) return msg.reply(`❌ No admins found!\n${SYSTEM.SHORT_WATERMARK}`);
    const mentions=admins.map(a=>a.id);
    const section=admins.map((a,i)=>{ const num=a.id.split('@')[0]; const role=a.admin==='superadmin'?'👑 Owner':'🛡️ Admin'; return `│ ${i+1}. @${num} — ${role}`; }).join('\n');
    const extra=text?.trim()?`\n╭─『 💬 *Message* 』\n│ ${text.trim()}\n╰──────────────────────────`:'';
    await sock.sendMessage(from,{text:`╭━━━『 👑 *GROUP ADMINS* 』━━━╮\n\n👋 *Called by:* +${sender?.split('@')[0]||'User'}\n👥 *Total Admins:* ${admins.length}\n\n╭─『 🛡️ *Admin List* 』\n${section}\n╰──────────────────────────${extra}\n\n╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n${SYSTEM.SHORT_WATERMARK}`,mentions},{quoted:msg});
    await msg.react('✅');
  } catch (e) { console.error('[ADMINS]',e.message); try { await msg.react('❌'); await msg.reply(`❌ _${e.message}_`); } catch (_) {} }
}

async function membersHandler({sock,msg,from,sender}) {
  try {
    await msg.react('👥');
    const meta=await sock.groupMetadata(from); const members=meta.participants;
    const admins=members.filter(p=>p.admin); const normals=members.filter(p=>!p.admin);
    let msg2=`╭━━━『 👥 *GROUP MEMBERS* 』━━━╮\n\n👋 *Called by:* +${sender?.split('@')[0]||'User'}\n📊 *Total:* ${members.length}\n🛡️ *Admins:* ${admins.length}\n👤 *Members:* ${normals.length}\n\n╭─『 👑 *Admins* 』\n`;
    admins.forEach((a,i)=>{ const icon=a.admin==='superadmin'?'👑':'🛡️'; msg2+=`│ ${i+1}. ${icon} +${a.id.split('@')[0]}\n`; });
    msg2+=`╰──────────────────────────\n\n╭─『 👤 *Members* 』\n`;
    const shown=normals.slice(0,30); shown.forEach((m,i)=>{ msg2+=`│ ${i+1}. 👤 +${m.id.split('@')[0]}\n`; });
    if (normals.length>30) msg2+=`│ …and ${normals.length-30} more\n`;
    msg2+=`╰──────────────────────────\n\n╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n${SYSTEM.SHORT_WATERMARK}`;
    await msg.reply(msg2); await msg.react('✅');
  } catch (e) { console.error('[MEMBERS]',e.message); try { await msg.react('❌'); await msg.reply(`❌ _${e.message}_`); } catch (_) {} }
}

async function linkHandler({sock,msg,from,isAdmin,isBotAdmin,isOwner}) {
  try {
    if (!isAdmin&&!isOwner) return msg.reply(`❌ Only admins can get the invite link!\n${SYSTEM.SHORT_WATERMARK}`);
    if (!isBotAdmin) return msg.reply(`❌ Bot must be admin to get invite link!\n${SYSTEM.SHORT_WATERMARK}`);
    await msg.react('🔗');
    const code=await sock.groupInviteCode(from); const link=`https://chat.whatsapp.com/${code}`;
    const meta=await sock.groupMetadata(from);
    await msg.reply(`╭━━━『 🔗 *GROUP LINK* 』━━━╮\n\n📱 *Group:* ${meta.subject}\n👥 *Members:* ${meta.participants.length}\n📅 *Created:* ${new Date(meta.creation*1000).toLocaleDateString('en-PK')}\n\n🔗 *Invite Link:*\n${link}\n\n╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n${SYSTEM.SHORT_WATERMARK}`);
    await msg.react('✅');
  } catch (e) { console.error('[LINK]',e.message); try { await msg.react('❌'); await msg.reply(`❌ _${e.message}_`); } catch (_) {} }
}

export default [
  {command:['tagall'], name:'tagall', category:'Group',description:'Tag all members',usage:'.tagall [message]',groupOnly:true,cooldown:10,handler:tagallHandler},
  {command:['hidetag'],name:'hidetag',category:'Group',description:'Tag all silently',usage:'.hidetag [message]',groupOnly:true,cooldown:10,handler:hidetagHandler},
  {command:['admins'], name:'admins', category:'Group',description:'List group admins',usage:'.admins',groupOnly:true,cooldown:5,handler:adminsHandler},
  {command:['members'],name:'members',category:'Group',description:'List group members',usage:'.members',groupOnly:true,cooldown:5,handler:membersHandler},
  {command:['link'],   name:'link',   category:'Group',description:'Get group invite link',usage:'.link',groupOnly:true,cooldown:5,handler:linkHandler},
];
