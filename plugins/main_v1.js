/*
╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃   YOUSAF-BALOCH-MD  •  main_v1         ┃
┃   Commands: alive ping runtime info    ┃
┃             menu                       ┃
┃        Created by MR YOUSAF BALOCH     ┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
*/
import os from 'os';
import { OWNER, CONFIG, SYSTEM } from '../config.js';

function fmtUp(s){const h=Math.floor(s/3600),m=Math.floor((s%3600)/60),sec=Math.floor(s%60);return `${h}h ${m}m ${sec}s`;}
function fmtBytes(b){if(b>=1e9)return(b/1e9).toFixed(1)+' GB';if(b>=1e6)return(b/1e6).toFixed(1)+' MB';return(b/1e3).toFixed(1)+' KB';}
function greet(){const h=new Date(new Date().toLocaleString('en',{timeZone:'Asia/Karachi'})).getHours();if(h>=5&&h<12)return'🌅 Good Morning!';if(h>=12&&h<16)return'☀️ Good Afternoon!';if(h>=16&&h<20)return'🌆 Good Evening!';return'🌙 Good Night!';}

// Full ownerFooter for main/menu commands only
function ownerFooter() {
  return `╭─『 👑 *${OWNER.BOT_NAME}* 』
│ 👤 *Owner:*   ${OWNER.FULL_NAME}
│ 📱 *Number:*  +${OWNER.NUMBER}
│ 📢 *Channel:* ${OWNER.CHANNEL}
│ 📺 *YouTube:* ${OWNER.YOUTUBE}
│ 🎵 *TikTok:*  ${OWNER.TIKTOK}
│ 💻 *GitHub:*  ${OWNER.GITHUB}
╰──────────────────────────
_© ${OWNER.YEAR||new Date().getFullYear()} ${OWNER.BOT_NAME}_`;
}

async function aliveHandler({sock,msg,from,sender}) {
  try {
    await msg.react('✅');
    const senderNum=sender?.split('@')[0]||'User'; const uptime=process.uptime();
    await msg.reply(`╭━━━『 🤖 *${OWNER.BOT_NAME}* 』━━━╮\n\n👋 *Hello +${senderNum}!*\n${greet()}\n\n✅ *Bot is Active & Running!*\n\n📊 *Stats:*\n├ ⏱️ *Uptime:* ${fmtUp(uptime)}\n├ 👑 *Owner:* ${OWNER.FULL_NAME}\n├ 📞 *Contact:* +${OWNER.NUMBER}\n├ ✨ *Version:* ${OWNER.VERSION||'2.0.0'}\n├ 🔧 *Prefix:* ${CONFIG.PREFIX}\n└ 🟢 *Status:* Online\n\n${ownerFooter()}\n╰━━━━━━━━━━━━━━━━━━━━━━━━╯`);
  } catch (e) { try { await msg.react('❌'); await msg.reply(`❌ _${e.message}_`); } catch (_) {} }
}

async function pingHandler({msg}) {
  try {
    const start=Date.now(); await msg.react('⚡'); const latency=Date.now()-start;
    await msg.reply(`╭━━━『 ⚡ *PING* 』━━━╮\n\n🏓 *Pong!*\n⚡ *Latency:* ${latency}ms\n⏱️ *Uptime:* ${fmtUp(process.uptime())}\n🟢 *Status:* Online\n\n╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n${SYSTEM.SHORT_WATERMARK}`);
  } catch (e) { try { await msg.react('❌'); await msg.reply(`❌ _${e.message}_`); } catch (_) {} }
}

async function runtimeHandler({msg}) {
  try {
    await msg.react('⏱️');
    const up=process.uptime(); const days=Math.floor(up/86400); const h=Math.floor((up%86400)/3600); const m=Math.floor((up%3600)/60); const s=Math.floor(up%60);
    await msg.reply(`╭━━━『 ⏱️ *RUNTIME* 』━━━╮\n\n🕐 *Bot has been running for:*\n\n${days>0?`📅 *Days:*    ${days}d\n`:''}⏰ *Hours:*   ${h}h\n⏱️ *Minutes:* ${m}m\n⏳ *Seconds:* ${s}s\n\n🟢 *Status:* Active\n\n╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n${SYSTEM.SHORT_WATERMARK}`);
  } catch (e) { try { await msg.react('❌'); await msg.reply(`❌ _${e.message}_`); } catch (_) {} }
}

async function infoHandler({msg,sender}) {
  try {
    await msg.react('🔍');
    const uptime=process.uptime(); const totalMem=os.totalmem(); const freeMem=os.freemem(); const usedMem=totalMem-freeMem;
    const senderNum=sender?.split('@')[0]||'User';
    await msg.reply(`╭━━━『 🤖 *BOT INFO* 』━━━╮\n\n👋 *Requested by:* +${senderNum}\n\n╭─『 🤖 *Bot Details* 』\n│ ✨ *Name:*    ${OWNER.BOT_NAME}\n│ 📌 *Version:* ${OWNER.VERSION||'2.0.0'}\n│ 👑 *Owner:*   ${OWNER.FULL_NAME}\n│ 📞 *Contact:* +${OWNER.NUMBER}\n│ 🔧 *Prefix:*  ${CONFIG.PREFIX}\n│ 🌐 *Mode:*    ${CONFIG.MODE||'public'}\n╰──────────────────────────\n\n╭─『 💻 *System Stats* 』\n│ ⏱️  *Uptime:*  ${fmtUp(uptime)}\n│ 🖥️  *OS:*      ${os.platform()} (${os.arch()})\n│ 📦 *Node.js:* ${process.version}\n│ 💾 *RAM:*     ${fmtBytes(usedMem)} / ${fmtBytes(totalMem)}\n│ 🔢 *CPU Cores:* ${os.cpus().length}\n╰──────────────────────────\n\n${ownerFooter()}\n╰━━━━━━━━━━━━━━━━━━━━━━━━╯`);
  } catch (e) { try { await msg.react('❌'); await msg.reply(`❌ _${e.message}_`); } catch (_) {} }
}

async function menuHandler({sock,msg,from,sender}) {
  try {
    await msg.react('📋');
    const senderNum=sender?.split('@')[0]||'User'; const uptime=process.uptime();
    const now=new Date(new Date().toLocaleString('en',{timeZone:'Asia/Karachi'}));
    const time=now.toLocaleTimeString('en-PK',{hour:'2-digit',minute:'2-digit'});
    const date=now.toLocaleDateString('en-PK',{day:'2-digit',month:'long',year:'numeric'});
    const menuText=`╭━━━『 🤖 *${OWNER.BOT_NAME}* 』━━━╮

👋 *Hello +${senderNum}!*
${greet()}

📅 *Date:* ${date}
🕐 *Time:* ${time}
⏱️ *Uptime:* ${fmtUp(uptime)}

╭─『 📋 *MAIN MENU* 』

│ 🎥 *DOWNLOADERS*
│  ❯ .video .ytmp4 .ytv .audio .ytmp3
│  ❯ .play .song .music .drama .movie
│  ❯ .tiktok .tt .fb .ig .twitter .x
│  ❯ .pinterest .soundcloud .snapchat
│  ❯ .threads .wallpaper .ringtone
│  ❯ .gdrive .mediafire .apk .modapk

│ 👥 *GROUP*
│  ❯ .kick .add .promote .demote .ban
│  ❯ .tagall .hidetag .admins .members
│  ❯ .antilink .antiabuse .warn .unwarn
│  ❯ .antidelete .antivv .warnlist
│  ❯ .settings .mute .unmute .invite
│  ❯ .ghost .activity .bannedlist
│  ❯ .autosticker .poll .unban

│ 🎨 *STICKERS*
│  ❯ .sticker .s .take .steal .ttp

│ 🤖 *AI*
│  ❯ .gpt .chatgpt .gemini .bing
│  ❯ .imagine .dalle .bgremove .ocr
│  ❯ .translate .tts .code .doctor
│  ❯ .lawyer .homework .resume .khuwab

│ ☪️ *ISLAMIC*
│  ❯ .quran .ayat .hadith .dua .prayer
│  ❯ .prayertime .hijri .asma .names
│  ❯ .tafsir .zakat .hajj

│ 🏏 *SPORTS*
│  ❯ .cricket .score .live .psl .ipl
│  ❯ .football .schedule .toss .news

│ 🛠️ *TOOLS*
│  ❯ .calc .currency .weather .qr
│  ❯ .shortlink .carbon .screenshot
│  ❯ .dpmaker .logomaker .meme
│  ❯ .remini .compressor .watermark
│  ❯ .unit .ttsurdu .capcut .inshot

│ 🎮 *GAMES*
│  ❯ .dice .coin .quiz .math .tictactoe

│ 💰 *ECONOMY*
│  ❯ .balance .daily .work .shop .top

│ ℹ️ *BOT*
│  ❯ .alive .ping .runtime .info .menu
│  ❯ .owner .support

╰─────────────────────────

${ownerFooter()}
╰━━━━━━━━━━━━━━━━━━━━━━━━╯`;
    try {
      const menuThumb=Buffer.from('');
      await sock.sendMessage(from,{text:menuText},{quoted:msg});
    } catch (_) { await msg.reply(menuText); }
    await msg.react('✅');
  } catch (e) { try { await msg.react('❌'); await msg.reply(`❌ _${e.message}_`); } catch (_) {} }
}

export default [
  {command:['alive','active','bot'],name:'alive',category:'Info',description:'Check if bot is online',usage:'.alive',cooldown:5,handler:aliveHandler},
  {command:['ping','speed'],       name:'ping', category:'Info',description:'Check bot latency',usage:'.ping',cooldown:5,handler:pingHandler},
  {command:['runtime','uptime'],   name:'runtime',category:'Info',description:'Bot running time',usage:'.runtime',cooldown:5,handler:runtimeHandler},
  {command:['info','botinfo','sysinfo'],name:'info',category:'Info',description:'Bot and system info',usage:'.info',cooldown:5,handler:infoHandler},
  {command:['menu','help','list'], name:'menu', category:'Info',description:'Show all commands',usage:'.menu',cooldown:5,handler:menuHandler},
];
