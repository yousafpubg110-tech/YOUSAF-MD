/*
╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃   YOUSAF-BALOCH-MD  •  auto_v1         ┃
┃  Commands: autostatus autoread         ┃
┃            autoreply autovv autolike   ┃
┃  ✅ Fixed: global.db initialized       ┃
┃        Created by MR YOUSAF BALOCH     ┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
*/
import { OWNER, SYSTEM, CONFIG } from '../config.js';

// ─── safe global.db init ──────────────────────────────────────────────────────
function initDb(){
  if (!global.db) global.db={data:{settings:{},chats:{},users:{}}};
  if (!global.db.data) global.db.data={settings:{},chats:{},users:{}};
  if (!global.db.data.settings) global.db.data.settings={};
  return global.db;
}
function getSetting(key,def=false){return initDb().data.settings[key]??def;}
function setSetting(key,val){initDb().data.settings[key]=val;}

// ─── autostatus ────────────────────────────────────────────────────────────────
async function autostatusHandler({msg,args}) {
  try {
    const s=args[0]?.toLowerCase(); if (!['on','off'].includes(s)) return msg.reply(`⚙️ *Auto Status View*\n\n.autostatus on — Auto view all statuses\n.autostatus off — Disable\n${SYSTEM.SHORT_WATERMARK}`);
    setSetting('autoStatusView',s==='on');
    await msg.reply(`${s==='on'?'✅ Auto Status View *enabled*':'❌ Auto Status View *disabled*'}\n${SYSTEM.SHORT_WATERMARK}`); await msg.react(s==='on'?'✅':'❌');
  } catch (e) { try { await msg.react('❌'); await msg.reply(`❌ _${e.message}_`); } catch (_) {} }
}

// ─── autoread ─────────────────────────────────────────────────────────────────
async function autoreadHandler({msg,args}) {
  try {
    const s=args[0]?.toLowerCase(); if (!['on','off'].includes(s)) return msg.reply(`⚙️ *Auto Read*\n\n.autoread on — Auto read all messages\n.autoread off — Disable\n${SYSTEM.SHORT_WATERMARK}`);
    setSetting('autoRead',s==='on');
    await msg.reply(`${s==='on'?'✅ Auto Read *enabled*':'❌ Auto Read *disabled*'}\n${SYSTEM.SHORT_WATERMARK}`); await msg.react(s==='on'?'✅':'❌');
  } catch (e) { try { await msg.react('❌'); await msg.reply(`❌ _${e.message}_`); } catch (_) {} }
}

// ─── autoreply ────────────────────────────────────────────────────────────────
async function autoreplyHandler({msg,args}) {
  try {
    const s=args[0]?.toLowerCase(); if (!['on','off'].includes(s)) return msg.reply(`⚙️ *Auto Reply*\n\n.autoreply on — Reply when owner is busy\n.autoreply off — Disable\n${SYSTEM.SHORT_WATERMARK}`);
    setSetting('autoReply',s==='on');
    await msg.reply(`${s==='on'?'✅ Auto Reply *enabled*\n💡 Bot will reply with a busy message':'❌ Auto Reply *disabled*'}\n${SYSTEM.SHORT_WATERMARK}`); await msg.react(s==='on'?'✅':'❌');
  } catch (e) { try { await msg.react('❌'); await msg.reply(`❌ _${e.message}_`); } catch (_) {} }
}

// ─── antivv (anti view once) ──────────────────────────────────────────────────
async function antivvHandler({sock,msg,from,args,isAdmin,isOwner}) {
  try {
    if (!isAdmin&&!isOwner) return msg.reply(`❌ Only admins can toggle anti view-once!\n${SYSTEM.SHORT_WATERMARK}`);
    const s=args[0]?.toLowerCase(); if (!['on','off'].includes(s)) return msg.reply(`⚙️ *Anti View-Once*\n\n.antivv on — Reveal view-once media\n.antivv off — Disable\n${SYSTEM.SHORT_WATERMARK}`);
    setSetting(`antivv_${from}`,s==='on');
    await msg.reply(`${s==='on'?'✅ Anti View-Once *enabled*':'❌ Anti View-Once *disabled*'}\n${SYSTEM.SHORT_WATERMARK}`); await msg.react(s==='on'?'✅':'❌');
  } catch (e) { try { await msg.react('❌'); await msg.reply(`❌ _${e.message}_`); } catch (_) {} }
}

// ─── autolike ─────────────────────────────────────────────────────────────────
async function autolikeHandler({msg,args}) {
  try {
    const s=args[0]?.toLowerCase(); if (!['on','off'].includes(s)) return msg.reply(`⚙️ *Auto Like Status*\n\n.autolike on — Auto like status updates\n.autolike off — Disable\n${SYSTEM.SHORT_WATERMARK}`);
    setSetting('autoLikeStatus',s==='on');
    await msg.reply(`${s==='on'?'✅ Auto Like *enabled*':'❌ Auto Like *disabled*'}\n${SYSTEM.SHORT_WATERMARK}`); await msg.react(s==='on'?'✅':'❌');
  } catch (e) { try { await msg.react('❌'); await msg.reply(`❌ _${e.message}_`); } catch (_) {} }
}

// ─── event: auto view status ──────────────────────────────────────────────────
export async function autoViewStatus(sock,rawMsg) {
  try {
    if (!rawMsg.key?.remoteJid?.endsWith('status@broadcast')) return;
    if (!getSetting('autoStatusView')) return;
    await sock.readMessages([rawMsg.key]);
    if (getSetting('autoLikeStatus')) {
      const emoji=['❤️','🔥','💯','👍','😍'][Math.floor(Math.random()*5)];
      try { await sock.sendMessage(rawMsg.key.remoteJid,{react:{text:emoji,key:rawMsg.key}}); } catch (_) {}
    }
  } catch (_) {}
}

// ─── event: auto read messages ───────────────────────────────────────────────
export async function autoReadMessages(sock,rawMsg) {
  try {
    if (!getSetting('autoRead')) return;
    if (rawMsg.key?.remoteJid?.endsWith('status@broadcast')) return;
    await sock.readMessages([rawMsg.key]);
  } catch (_) {}
}

// ─── event: auto reply ────────────────────────────────────────────────────────
export async function autoReplyHandler(sock,rawMsg,from,sender) {
  try {
    if (!getSetting('autoReply')) return;
    if (from.endsWith('@g.us')) return; // Only private chats
    const ownerNum=OWNER.NUMBER; if (sender?.split('@')[0]===ownerNum) return;
    const msgs=[
      `Hey! ${OWNER.FULL_NAME} is busy right now. I'll reply when free.\n\nFor urgent matters: wa.me/${ownerNum}`,
      `Assalamualaikum! Bot is running but owner is away. Please wait or contact +${ownerNum}`,
      `${OWNER.BOT_NAME} here! Owner is currently unavailable. Try again later! 😊`,
    ];
    await sock.sendMessage(from,{text:msgs[Math.floor(Math.random()*msgs.length)]+`\n\n${SYSTEM.SHORT_WATERMARK}`},{quoted:rawMsg});
  } catch (_) {}
}

// ─── event: reveal view-once ─────────────────────────────────────────────────
export async function autoViewOnce(sock,rawMsg,from) {
  try {
    if (!from.endsWith('@g.us')) return;
    if (!getSetting(`antivv_${from}`)) return;
    const msgType=Object.keys(rawMsg.message||{})[0]||'';
    const viewOnce=rawMsg.message?.viewOnceMessage||rawMsg.message?.viewOnceMessageV2||rawMsg.message?.viewOnceMessageV2Extension;
    if (!viewOnce) return;
    const inner=viewOnce.message; if (!inner) return;
    const innerType=Object.keys(inner)[0]||'';
    const media=inner[innerType];
    if (innerType.includes('image')) {
      await sock.sendMessage(from,{image:media,caption:`👁️ *View-Once revealed!*\n${SYSTEM.SHORT_WATERMARK}`},{quoted:rawMsg});
    } else if (innerType.includes('video')) {
      await sock.sendMessage(from,{video:media,caption:`👁️ *View-Once revealed!*\n${SYSTEM.SHORT_WATERMARK}`},{quoted:rawMsg});
    }
  } catch (_) {}
}

export default [
  {command:['autostatus','autoview'],name:'autostatus',category:'Owner',description:'Auto view status',usage:'.autostatus on/off',ownerOnly:true,cooldown:5,handler:autostatusHandler},
  {command:['autoread'],             name:'autoread',  category:'Owner',description:'Auto read messages',usage:'.autoread on/off',ownerOnly:true,cooldown:5,handler:autoreadHandler},
  {command:['autoreply'],            name:'autoreply', category:'Owner',description:'Auto reply when busy',usage:'.autoreply on/off',ownerOnly:true,cooldown:5,handler:autoreplyHandler},
  {command:['antivv','antiviewonce'],name:'antivv',    category:'Group',description:'Reveal view-once media',usage:'.antivv on/off',groupOnly:true,cooldown:5,handler:antivvHandler},
  {command:['autolike'],             name:'autolike',  category:'Owner',description:'Auto like status',usage:'.autolike on/off',ownerOnly:true,cooldown:5,handler:autolikeHandler},
];
