/*
╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃   YOUSAF-BALOCH-MD  •  group_v6        ┃
┃  Commands: autosticker autobio poll    ┃
┃            unban  (4 — remainder)      ┃
┃        Created by MR YOUSAF BALOCH     ┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
*/
import { OWNER, SYSTEM } from '../config.js';
import { removeBan } from './group_v1.js';
import { getGroupSetting } from './group_v3.js';
import fs   from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname  = path.dirname(fileURLToPath(import.meta.url));
const SETS_FILE  = path.join(__dirname,'..','database','group_settings.json');
function setSetting(gJid,key,val) { try { const dir=path.dirname(SETS_FILE); if (!fs.existsSync(dir)) fs.mkdirSync(dir,{recursive:true}); const all=fs.existsSync(SETS_FILE)?JSON.parse(fs.readFileSync(SETS_FILE,'utf8')):{}; if (!all[gJid]) all[gJid]={}; all[gJid][key]=val; fs.writeFileSync(SETS_FILE,JSON.stringify(all,null,2)); } catch (e) { console.error('[SETTINGS DB]',e.message); } }
export function isAutoStickerEnabled(gJid) { return getGroupSetting(gJid,'autosticker'); }

const activePolls=new Map();

async function autoStickerHandler({msg,from,args,isAdmin,isOwner}) {
  try {
    if (!isAdmin&&!isOwner) return msg.reply(`❌ Only admins can toggle auto sticker!\n${SYSTEM.SHORT_WATERMARK}`);
    const s=args[0]?.toLowerCase(); if (!['on','off'].includes(s)) return msg.reply(`⚙️ *Auto Sticker*\n\n.autosticker on — Auto convert images to stickers\n.autosticker off\n${SYSTEM.SHORT_WATERMARK}`);
    setSetting(from,'autosticker',s==='on');
    await msg.reply(`${s==='on'?'✅ Auto Sticker *enabled*\n🎨 Images will be auto-converted!':'❌ Auto Sticker *disabled*'}\n${SYSTEM.SHORT_WATERMARK}`); await msg.react(s==='on'?'✅':'❌');
  } catch (e) { try { await msg.react('❌'); await msg.reply(`❌ _${e.message}_`); } catch (_) {} }
}

async function autobioHandler({sock,msg,from,sender,text,isOwner}) {
  try {
    const senderNum=sender?.split('@')[0]||'';
    if (!isOwner&&senderNum!==OWNER.NUMBER) return msg.reply(`❌ Only Bot Owner can change bio!\n${SYSTEM.SHORT_WATERMARK}`);
    const input=(text||'').trim(); const lower=input.toLowerCase();
    if (lower.startsWith('set ')||(!['on','off'].includes(lower)&&input.length>3)) {
      const bioText=input.replace(/^set\s*/i,'').trim();
      if (!bioText) return msg.reply(`❌ Please provide bio text!\n\n.autobio set Your bio here\n${SYSTEM.SHORT_WATERMARK}`);
      await sock.updateProfileStatus(bioText.substring(0,140));
      await msg.reply(`✅ *Bio updated!*\n\n📝 *New Bio:*\n${bioText}\n${SYSTEM.SHORT_WATERMARK}`); await msg.react('✅'); return;
    }
    if (lower==='on') { if (!global.db) global.db={data:{settings:{}}}; if (!global.db.data?.settings) global.db.data.settings={}; global.db.data.settings.autoBio=true; await msg.reply(`✅ *Auto Bio enabled!*\n${SYSTEM.SHORT_WATERMARK}`); }
    else if (lower==='off') { if (global.db?.data?.settings) global.db.data.settings.autoBio=false; await msg.reply(`❌ *Auto Bio disabled!*\n${SYSTEM.SHORT_WATERMARK}`); }
    else return msg.reply(`⚙️ *Auto Bio*\n\n.autobio on — Start rotating\n.autobio off — Stop\n.autobio set Your text — Set custom\n${SYSTEM.SHORT_WATERMARK}`);
    await msg.react('✅');
  } catch (e) { try { await msg.react('❌'); await msg.reply(`❌ _${e.message}_`); } catch (_) {} }
}

async function pollHandler({sock,msg,from,sender,text,isAdmin,isOwner}) {
  try {
    if (!isAdmin&&!isOwner) return msg.reply(`❌ Only admins can create polls!\n${SYSTEM.SHORT_WATERMARK}`);
    const input=(text||'').trim(); const lower=input.toLowerCase();
    if (!input||lower==='results'||lower==='result') {
      const poll=activePolls.get(from); if (!poll) return msg.reply(`❌ No active poll!\n\n.poll Question | Option 1 | Option 2\n${SYSTEM.SHORT_WATERMARK}`);
      const total=Object.values(poll.votes).reduce((a,b)=>a+b.length,0);
      const sections=poll.options.map((opt,i)=>{ const count=poll.votes[i]?.length||0; const pct=total>0?Math.round((count/total)*100):0; const bar='█'.repeat(Math.round(pct/10))+'░'.repeat(10-Math.round(pct/10)); return `│ ${i+1}. *${opt}*\n│    ${bar} ${pct}% (${count} votes)`; }).join('\n│\n');
      return msg.reply(`╭━━━『 📊 *POLL RESULTS* 』━━━╮\n\n❓ *${poll.question}*\n👥 *Total:* ${total}\n\n${sections}\n\n╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n${SYSTEM.SHORT_WATERMARK}`);
    }
    if (lower==='end'||lower==='close') { activePolls.delete(from); return msg.reply(`✅ *Poll ended!*\n${SYSTEM.SHORT_WATERMARK}`); }
    const parts=input.split('|').map(s=>s.trim()).filter(Boolean);
    if (parts.length<3) return msg.reply(`❌ Please provide question and at least 2 options!\n\n.poll Question | Option 1 | Option 2\n${SYSTEM.SHORT_WATERMARK}`);
    const [question,...options]=parts; const votes={}; options.forEach((_,i)=>{votes[i]=[];});
    activePolls.set(from,{question,options,votes,creator:sender,createdAt:Date.now()});
    const optList=options.map((opt,i)=>`│ ${i+1}. ${opt}`).join('\n');
    await msg.reply(`╭━━━『 📊 *NEW POLL* 』━━━╮\n\n❓ *${question}*\n\n╭─『 Options 』\n${optList}\n╰──────────────────────────\n\n💡 Reply with number to vote!\n📊 *.poll results* — see results\n🔚 *.poll end* — close poll\n\n╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n${SYSTEM.SHORT_WATERMARK}`);
    await msg.react('✅');
  } catch (e) { try { await msg.react('❌'); await msg.reply(`❌ _${e.message}_`); } catch (_) {} }
}

async function unbanHandler({sock,msg,from,isAdmin,isOwner}) {
  try {
    if (!isAdmin&&!isOwner) return msg.reply(`❌ Only admins can unban!\n${SYSTEM.SHORT_WATERMARK}`);
    const target=msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]||msg.message?.extendedTextMessage?.contextInfo?.participant;
    if (!target) return msg.reply(`❌ Please mention a user to unban!\n\n.unban @user\n${SYSTEM.SHORT_WATERMARK}`);
    const num=target.split('@')[0]; removeBan(from,target);
    await sock.sendMessage(from,{text:`✅ *@${num} has been unbanned!*\nThey can now be added back.\n${SYSTEM.SHORT_WATERMARK}`,mentions:[target]},{quoted:msg});
    await msg.react('✅');
  } catch (e) { try { await msg.react('❌'); await msg.reply(`❌ _${e.message}_`); } catch (_) {} }
}

export default [
  {command:['autosticker'],name:'autosticker',category:'Group',description:'Auto convert images to stickers',usage:'.autosticker on/off',groupOnly:true,cooldown:5,handler:autoStickerHandler},
  {command:['autobio'],    name:'autobio',    category:'Group',description:'Set/rotate bot bio',usage:'.autobio on/off/set',cooldown:5,handler:autobioHandler},
  {command:['poll'],       name:'poll',       category:'Group',description:'Create a group poll',usage:'.poll Q | A | B',groupOnly:true,cooldown:5,handler:pollHandler},
  {command:['unban'],      name:'unban',      category:'Group',description:'Remove ban from user',usage:'.unban @user',groupOnly:true,cooldown:3,handler:unbanHandler},
];
