/*
╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃   YOUSAF-MD  •  main_v1               ┃
┃   Commands: alive ping runtime info   ┃
┃             menu public private       ┃
┃        Created by MR YOUSAF BALOCH    ┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
*/
import os   from 'os';
import fs   from 'fs';
import path from 'path';
import { OWNER, CONFIG, SYSTEM } from '../config.js';

function fmtUp(s){const h=Math.floor(s/3600),m=Math.floor((s%3600)/60),sec=Math.floor(s%60);return `${h}h ${m}m ${sec}s`;}
function fmtBytes(b){if(b>=1e9)return(b/1e9).toFixed(1)+' GB';if(b>=1e6)return(b/1e6).toFixed(1)+' MB';return(b/1e3).toFixed(1)+' KB';}

function greet(){
  const h=new Date(new Date().toLocaleString('en',{timeZone:'Asia/Karachi'})).getHours();
  if(h>=5&&h<12) return'🌅 Good Morning!';
  if(h>=12&&h<16)return'☀️ Good Afternoon!';
  if(h>=16&&h<20)return'🌆 Good Evening!';
  return'🌙 Good Night!';
}

function getTimeInfo(){
  const h=new Date(new Date().toLocaleString('en',{timeZone:'Asia/Karachi'})).getHours();
  if(h>=5&&h<12) return{emoji:'🌅',label:'Morning',  mode:'MORNING',  greet:'Good Morning!',  dua:'Allahumma bika asbahna wa bika amsayna'};
  if(h>=12&&h<16)return{emoji:'☀️',label:'Afternoon',mode:'AFTERNOON',greet:'Good Afternoon!',dua:'Subhan Allahi wa bihamdihi'};
  if(h>=16&&h<20)return{emoji:'🌆',label:'Evening',  mode:'EVENING',  greet:'Good Evening!',  dua:'Allahumma bika amsayna wa bika asbahna'};
  return          {emoji:'🌙',label:'Night',   mode:'NIGHT',    greet:'Good Night!',    dua:'Bismika Allahumma amutu wa ahya'};
}

function ownerFooter(){
  return(
    `╭─『 👑 *${OWNER.BOT_NAME}* 』\n`+
    `│ 👤 *Owner:*   ${OWNER.FULL_NAME}\n`+
    `│ 📱 *Number:*  +${OWNER.NUMBER}\n`+
    `│ 📢 *Channel:* ${OWNER.CHANNEL}\n`+
    `│ 📺 *YouTube:* ${OWNER.YOUTUBE}\n`+
    `│ 🎵 *TikTok:*  ${OWNER.TIKTOK}\n`+
    `│ 💻 *GitHub:*  ${OWNER.GITHUB}\n`+
    `╰──────────────────────────\n`+
    `_© ${OWNER.YEAR||new Date().getFullYear()} ${OWNER.BOT_NAME}_`
  );
}

function getThumb(){
  try{
    const p=path.resolve('./assets/menu-thumb.png');
    if(fs.existsSync(p)) return fs.readFileSync(p);
  }catch(_){}
  return null;
}

function buildMenu(senderName){
  const pfx=CONFIG.PREFIX;
  const now=new Date(new Date().toLocaleString('en',{timeZone:'Asia/Karachi'}));
  const time=now.toLocaleTimeString('en-PK',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
  const date=now.toLocaleDateString('en-PK',{day:'2-digit',month:'long',year:'numeric'});
  const day=now.toLocaleDateString('en-PK',{weekday:'long'});
  const T=getTimeInfo();
  const up=process.uptime();
  const hrs=Math.floor(up/3600),mins=Math.floor((up%3600)/60),secs=Math.floor(up%60);
  let pluginCount=0;
  try{pluginCount=fs.readdirSync('./plugins').filter(f=>f.endsWith('.js')).length;}catch(_){}

  return `
╔══════════════════════════════════════════════════════════════╗
║     🚀 *${OWNER.BOT_NAME}* ─ *Ultra Pro Max* 🚀             ║
║           ✨ *Best WhatsApp Bot Ever* ✨                      ║
║              👑 *By ${OWNER.FULL_NAME}* 👑                   ║
╚══════════════════════════════════════════════════════════════╝

╭━『 ⏰ *TIME MODE* 』━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃  ${T.emoji} *${T.label}* — ${T.greet}
┃  🤲 *${T.dua}*
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯

╭━『 📊 *BOT INFORMATION* 』━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃  👤 *User*     : ${senderName}
┃  👑 *Owner*    : ${OWNER.FULL_NAME}
┃  📱 *Number*   : +${OWNER.NUMBER}
┃  🤖 *Bot Name* : ${OWNER.BOT_NAME}
┃  📅 *Date*     : ${date}
┃  📆 *Day*      : ${day}
┃  ⏰ *Time*     : ${time}
┃  ⏱️ *Uptime*   : ${hrs}h ${mins}m ${secs}s
┃  🔌 *Plugins*  : ${pluginCount}+ Active
┃  📟 *Prefix*   : [ ${pfx} ]
┃  🌐 *Mode*     : ${T.mode}
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯

╭━『 🔗 *SOCIAL MEDIA* 』━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃  📢 *Channel*   : ${OWNER.CHANNEL}
┃  📺 *YouTube*   : ${OWNER.YOUTUBE}
┃  🎵 *TikTok*    : ${OWNER.TIKTOK}
┃  💻 *GitHub*    : ${OWNER.GITHUB}
┃  📱 *WhatsApp*  : ${OWNER.WHATSAPP}
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯

━━━━━━━━━━『 📋 *MAIN MENU* 』━━━━━━━━━━

╭━『 🏠 *MAIN* 』━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃  ${pfx}menu      » Full Menu Display
┃  ${pfx}alive     » Bot Status Check
┃  ${pfx}ping      » Speed Test
┃  ${pfx}runtime   » Bot Uptime
┃  ${pfx}info      » Bot Information
┃  ${pfx}owner     » Owner Information
┃  ${pfx}support   » Support Group
┃  ${pfx}script    » Get Bot Script
┃  ${pfx}settings  » Bot Settings
┃  ${pfx}public    » Set Public Mode
┃  ${pfx}private   » Set Private Mode
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯

╭━『 ⚙️ *AUTO FEATURES* 』━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃  ${pfx}autoviewstatus  » Auto View Status
┃  ${pfx}antidelete      » Anti Delete Messages
┃  ${pfx}autoreact       » Auto React to Messages
┃  ${pfx}autoread        » Auto Read Messages
┃  ${pfx}autotyping      » Typing Indicator
┃  ${pfx}autorecording   » Recording Status
┃  ${pfx}autobio         » Auto Bio Rotate
┃  ${pfx}anticall        » Auto Reject Calls
┃  ${pfx}autoreply       » Auto Reply
┃  ${pfx}autodownload    » Auto Download Media
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯

╭━『 🤖 *ARTIFICIAL INTELLIGENCE* 』━━━━━━━━━━━━━━━━━━━━━━━━╮
┃  ${pfx}ai              » Gemini AI Chat
┃  ${pfx}chatgpt         » ChatGPT Response
┃  ${pfx}gpt4            » GPT-4 AI
┃  ${pfx}deepseek        » DeepSeek AI
┃  ${pfx}claude          » Claude AI
┃  ${pfx}bing            » Bing AI
┃  ${pfx}doctor          » AI Doctor
┃  ${pfx}lawyer          » AI Lawyer
┃  ${pfx}homework        » Homework Helper
┃  ${pfx}khuwab          » Dream Interpretation
┃  ${pfx}resume          » Resume Builder
┃  ${pfx}romanurdu       » Roman Urdu AI
┃  ${pfx}imagine         » Generate AI Art
┃  ${pfx}dalle           » DALL-E Image
┃  ${pfx}bgremove        » Remove Background
┃  ${pfx}aicode          » Generate Code
┃  ${pfx}explain         » Explain Code
┃  ${pfx}debug           » Debug Code
┃  ${pfx}translate       » Translate Text
┃  ${pfx}ocr             » Read Image Text
┃  ${pfx}tts             » Text to Speech
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯

╭━『 📥 *DOWNLOADERS* 』━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃  ${pfx}ytmp3           » YouTube Audio MP3
┃  ${pfx}ytmp4           » YouTube Video MP4
┃  ${pfx}play            » Search & Play Song
┃  ${pfx}song            » Search Song
┃  ${pfx}video           » Search Video
┃  ${pfx}music           » Music Download
┃  ${pfx}drama           » Drama Download
┃  ${pfx}movie           » Movie Info & Download
┃  ${pfx}tiktok          » TikTok Without Watermark
┃  ${pfx}ttmp3           » TikTok Audio Only
┃  ${pfx}instagram       » Instagram Post/Reel
┃  ${pfx}igreel          » Instagram Reel
┃  ${pfx}facebook        » Facebook Video
┃  ${pfx}twitter         » Twitter / X Video
┃  ${pfx}x               » X (Twitter) Video
┃  ${pfx}soundcloud      » SoundCloud Audio
┃  ${pfx}snapchat        » Snapchat Media
┃  ${pfx}threads         » Threads Video
┃  ${pfx}pinterest       » Pinterest Image
┃  ${pfx}wallpaper       » HD Wallpaper
┃  ${pfx}ringtone        » Ringtone Download
┃  ${pfx}gdrive          » Google Drive File
┃  ${pfx}mediafire       » MediaFire File
┃  ${pfx}apk             » Download APK
┃  ${pfx}modapk          » Modded APK
┃  ${pfx}playstore       » Play Store App Info
┃  ${pfx}naat            » Naat Download
┃  ${pfx}bayan           » Islamic Bayan
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯

╭━『 🖼️ *IMAGE TOOLS* 』━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃  ${pfx}remini          » AI Image Enhancer
┃  ${pfx}enhance         » HD Quality Enhance
┃  ${pfx}blur            » Blur Effect
┃  ${pfx}sepia           » Sepia Effect
┃  ${pfx}grayscale       » Black & White
┃  ${pfx}cartoon         » Cartoon Effect
┃  ${pfx}sketch          » Pencil Sketch
┃  ${pfx}watermark       » Add Watermark
┃  ${pfx}rembg           » Remove Background
┃  ${pfx}wanted          » Wanted Poster
┃  ${pfx}wasted          » Wasted Effect
┃  ${pfx}jail            » Jail Effect
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯

╭━『 🎭 *STICKER* 』━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃  ${pfx}sticker         » Image to Sticker
┃  ${pfx}s               » Quick Sticker
┃  ${pfx}sgif            » Video to GIF Sticker
┃  ${pfx}toimg           » Sticker to Image
┃  ${pfx}ttp             » Text to Sticker
┃  ${pfx}attp            » Animated Text Sticker
┃  ${pfx}emojimix        » Mix Two Emojis
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯

╭━『 🎨 *DESIGN* 』━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃  ${pfx}logo            » 30+ Logo Styles
┃  ${pfx}dp              » 30+ DP Styles
┃  ${pfx}carbon          » Code Screenshot
┃  ${pfx}meme            » Create Meme
┃  ${pfx}dpmaker         » Custom DP Maker
┃  ${pfx}logomaker       » Custom Logo Maker
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯

╭━『 🔧 *TOOLS* 』━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃  ${pfx}calc            » Calculator
┃  ${pfx}convert         » Unit Converter
┃  ${pfx}currency        » Currency Converter
┃  ${pfx}weather         » Weather Info
┃  ${pfx}pdf             » Image to PDF
┃  ${pfx}ocr             » Read Image Text (OCR)
┃  ${pfx}qr              » Generate QR Code
┃  ${pfx}short           » Shorten URL
┃  ${pfx}screenshot      » Website Screenshot
┃  ${pfx}tts             » Text to Speech
┃  ${pfx}unit            » Unit Converter
┃  ${pfx}ttsurdu         » Urdu Text to Speech
┃  ${pfx}capcut          » CapCut Template
┃  ${pfx}inshot          » InShot Template
┃  ${pfx}compressor      » Image Compressor
┃  ${pfx}watermark       » Add Watermark to Image
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯

╭━『 🔍 *SEARCH* 』━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃  ${pfx}google          » Google Search
┃  ${pfx}wiki            » Wikipedia Search
┃  ${pfx}lyrics          » Song Lyrics
┃  ${pfx}news            » Latest News
┃  ${pfx}technews        » Tech News
┃  ${pfx}github          » GitHub Profile/Repo
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯

╭━『 ☪️ *ISLAMIC* 』━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃  ${pfx}quran           » Read Quran by Surah
┃  ${pfx}ayat            » Random Ayat
┃  ${pfx}hadith          » Random Hadith
┃  ${pfx}prayertime      » Today Prayer Times
┃  ${pfx}hijri           » Hijri Date
┃  ${pfx}dua             » Random Dua
┃  ${pfx}asma            » Asma-ul-Husna (99 Names)
┃  ${pfx}zakatcalc       » Zakat Calculator
┃  ${pfx}ramadan         » Ramadan Info & Times
┃  ${pfx}tafsir          » Quran Tafsir
┃  ${pfx}hajj            » Hajj & Umrah Guide
┃  ${pfx}names           » Islamic Baby Names
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯

╭━『 🏏 *CRICKET & SPORTS* 』━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃  ${pfx}score           » Live Cricket Score
┃  ${pfx}livescore       » All Live Matches
┃  ${pfx}matchinfo       » Match Details
┃  ${pfx}schedule        » Match Schedule
┃  ${pfx}psl             » PSL 2026 Updates
┃  ${pfx}ipl             » IPL Updates
┃  ${pfx}pointstable     » Points Table
┃  ${pfx}football        » Football Score
┃  ${pfx}toss            » Toss Result
┃  ${pfx}news            » Cricket News
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯

╭━『 👥 *GROUP MANAGEMENT* 』━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃  ${pfx}add             » Add Member to Group
┃  ${pfx}kick            » Kick Member
┃  ${pfx}promote         » Make Admin
┃  ${pfx}demote          » Remove Admin
┃  ${pfx}tagall          » Tag All Members
┃  ${pfx}hidetag         » Silent Tag All
┃  ${pfx}admins          » Show Admin List
┃  ${pfx}members         » Show Member List
┃  ${pfx}warn            » Warn a Member
┃  ${pfx}unwarn          » Remove Warning
┃  ${pfx}warnlist        » Show Warn List
┃  ${pfx}groupopen       » Open Group (All Send)
┃  ${pfx}groupclose      » Close Group (Admins Only)
┃  ${pfx}antilink        » Anti Link System
┃  ${pfx}antiabuse       » Anti Bad Words
┃  ${pfx}antidelete      » Anti Delete
┃  ${pfx}antivv          » Anti View Once
┃  ${pfx}antispam        » Anti Spam
┃  ${pfx}settings        » Group Bot Settings
┃  ${pfx}mute            » Mute Member
┃  ${pfx}unmute          » Unmute Member
┃  ${pfx}invite          » Get Group Invite Link
┃  ${pfx}ghost           » Ghost Mode
┃  ${pfx}activity        » Group Activity
┃  ${pfx}bannedlist      » Banned Members List
┃  ${pfx}autosticker     » Auto Sticker Mode
┃  ${pfx}poll            » Create Poll
┃  ${pfx}unban           » Unban Member
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯

╭━『 💰 *ECONOMY SYSTEM* 』━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃  ${pfx}balance         » Check Your Balance
┃  ${pfx}daily           » Claim Daily Reward
┃  ${pfx}work            » Work for Coins
┃  ${pfx}shop            » View Item Shop
┃  ${pfx}buy             » Buy Item from Shop
┃  ${pfx}leaderboard     » Top 10 Richest Users
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯

╭━『 🎮 *GAMES* 』━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃  ${pfx}tictactoe       » Tic Tac Toe Game
┃  ${pfx}quiz            » Quiz Game
┃  ${pfx}dice            » Roll a Dice
┃  ${pfx}coin            » Flip a Coin
┃  ${pfx}math            » Math Challenge
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯

╭━『 😄 *FUN* 』━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃  ${pfx}joke            » Random Joke
┃  ${pfx}quote           » Motivational Quote
┃  ${pfx}fact            » Random Fact
┃  ${pfx}truth           » Truth Question
┃  ${pfx}dare            » Dare Challenge
┃  ${pfx}meme            » Random Meme
┃  ${pfx}ship            » Love Meter
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯

╭━『 👑 *OWNER / DEPLOYER ONLY* 』━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃  ${pfx}broadcast       » Broadcast Message to All
┃  ${pfx}ban             » Ban a User
┃  ${pfx}unban           » Unban a User
┃  ${pfx}block           » Block a User
┃  ${pfx}unblock         » Unblock a User
┃  ${pfx}restart         » Restart Bot
┃  ${pfx}shutdown        » Shutdown Bot
┃  ${pfx}eval            » Execute JS Code
┃  ${pfx}exec            » Execute Shell Command
┃  ${pfx}shell           » Shell Access
┃  ${pfx}join            » Join a Group
┃  ${pfx}leave           » Leave a Group
┃  ${pfx}public          » Set Bot to Public Mode
┃  ${pfx}private         » Set Bot to Private Mode
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯

╔══════════════════════════════════════════════════════════════╗
║                  💎 *BOT FEATURES* 💎                        ║
╠══════════════════════════════════════════════════════════════╣
║  ✅ 500+ Active Commands & Plugins                           ║
║  ✅ Auto View & Like Status                                  ║
║  ✅ Anti Delete Messages                                     ║
║  ✅ 3-Strike Warning System (Auto Kick)                      ║
║  ✅ Economy System (Coins, Daily, Shop)                      ║
║  ✅ Live Cricket & Football Scores                           ║
║  ✅ AI — Gemini, GPT-4, Claude, DeepSeek                    ║
║  ✅ AI Image Generation (DALL-E, Pollinations)               ║
║  ✅ 30+ Logo & DP Styles                                     ║
║  ✅ Full Islamic Suite (Quran, Hadith, Prayer)               ║
║  ✅ Universal Deploy — Heroku, Render, Railway, VPS          ║
║  ✅ Public & Private Mode Support                            ║
║  ✅ Multi-Platform Session via YOUSAF-PAIRING-V1             ║
╠══════════════════════════════════════════════════════════════╣
║  👑 *Owner:*   ${OWNER.FULL_NAME}
║  📱 *Number:*  +${OWNER.NUMBER}
║  📢 *Channel:* ${OWNER.CHANNEL}
║  📺 *YouTube:* ${OWNER.YOUTUBE}
║  🎵 *TikTok:*  ${OWNER.TIKTOK}
╚══════════════════════════════════════════════════════════════╝

_✨ © ${OWNER.YEAR||new Date().getFullYear()} ${OWNER.BOT_NAME} ✨_
_⚡ Developed by ${OWNER.FULL_NAME} ⚡_`.trim();
}

// ═══════════════════════════════════════════════════════════════════
//  HANDLERS
// ═══════════════════════════════════════════════════════════════════

async function aliveHandler({sock,msg,from,sender}){
  try{
    await msg.react('✅');
    const senderNum=sender?.split('@')[0]||'User';
    await msg.reply(
      `╭━━━『 🤖 *${OWNER.BOT_NAME}* 』━━━╮\n\n`+
      `👋 *Hello +${senderNum}!*\n${greet()}\n\n`+
      `✅ *Bot is Active & Running!*\n\n`+
      `📊 *Stats:*\n`+
      `├ ⏱️ *Uptime:*  ${fmtUp(process.uptime())}\n`+
      `├ 👑 *Owner:*   ${OWNER.FULL_NAME}\n`+
      `├ 📞 *Contact:* +${OWNER.NUMBER}\n`+
      `├ ✨ *Version:* ${OWNER.VERSION}\n`+
      `├ 🔧 *Prefix:*  ${CONFIG.PREFIX}\n`+
      `├ 🌐 *Mode:*    ${CONFIG.MODE.toUpperCase()}\n`+
      `└ 🟢 *Status:*  Online\n\n`+
      `${ownerFooter()}\n`+
      `╰━━━━━━━━━━━━━━━━━━━━━━━━╯`
    );
  }catch(e){try{await msg.react('❌');await msg.reply(`❌ _${e.message}_`);}catch(_){}}
}

async function pingHandler({msg}){
  try{
    const start=Date.now();await msg.react('⚡');const latency=Date.now()-start;
    await msg.reply(
      `╭━━━『 ⚡ *PING* 』━━━╮\n\n`+
      `🏓 *Pong!*\n`+
      `⚡ *Latency:* ${latency}ms\n`+
      `⏱️ *Uptime:* ${fmtUp(process.uptime())}\n`+
      `🟢 *Status:* Online\n\n`+
      `╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n${SYSTEM.SHORT_WATERMARK}`
    );
  }catch(e){try{await msg.react('❌');await msg.reply(`❌ _${e.message}_`);}catch(_){}}
}

async function runtimeHandler({msg}){
  try{
    await msg.react('⏱️');
    const up=process.uptime();
    const days=Math.floor(up/86400),h=Math.floor((up%86400)/3600),m=Math.floor((up%3600)/60),s=Math.floor(up%60);
    await msg.reply(
      `╭━━━『 ⏱️ *RUNTIME* 』━━━╮\n\n`+
      `🕐 *Bot has been running for:*\n\n`+
      `${days>0?`📅 *Days:*    ${days}d\n`:''}`+
      `⏰ *Hours:*   ${h}h\n`+
      `⏱️ *Minutes:* ${m}m\n`+
      `⏳ *Seconds:* ${s}s\n\n`+
      `🟢 *Status:* Active\n\n`+
      `╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n${SYSTEM.SHORT_WATERMARK}`
    );
  }catch(e){try{await msg.react('❌');await msg.reply(`❌ _${e.message}_`);}catch(_){}}
}

async function infoHandler({msg,sender}){
  try{
    await msg.react('🔍');
    const uptime=process.uptime();
    const totalMem=os.totalmem(),freeMem=os.freemem(),usedMem=totalMem-freeMem;
    const senderNum=sender?.split('@')[0]||'User';
    await msg.reply(
      `╭━━━『 🤖 *BOT INFO* 』━━━╮\n\n`+
      `👋 *Requested by:* +${senderNum}\n\n`+
      `╭─『 🤖 *Bot Details* 』\n`+
      `│ ✨ *Name:*    ${OWNER.BOT_NAME}\n`+
      `│ 📌 *Version:* ${OWNER.VERSION}\n`+
      `│ 👑 *Owner:*   ${OWNER.FULL_NAME}\n`+
      `│ 📞 *Contact:* +${OWNER.NUMBER}\n`+
      `│ 🔧 *Prefix:*  ${CONFIG.PREFIX}\n`+
      `│ 🌐 *Mode:*    ${CONFIG.MODE.toUpperCase()}\n`+
      `╰──────────────────────────\n\n`+
      `╭─『 💻 *System Stats* 』\n`+
      `│ ⏱️  *Uptime:*    ${fmtUp(uptime)}\n`+
      `│ 🖥️  *OS:*        ${os.platform()} (${os.arch()})\n`+
      `│ 📦 *Node.js:*   ${process.version}\n`+
      `│ 💾 *RAM Used:*  ${fmtBytes(usedMem)} / ${fmtBytes(totalMem)}\n`+
      `│ 🔢 *CPU Cores:* ${os.cpus().length}\n`+
      `╰──────────────────────────\n\n`+
      `${ownerFooter()}\n`+
      `╰━━━━━━━━━━━━━━━━━━━━━━━━╯`
    );
  }catch(e){try{await msg.react('❌');await msg.reply(`❌ _${e.message}_`);}catch(_){}}
}

async function menuHandler({sock,msg,from,sender}){
  try{
    await msg.react('📋');
    const senderNum=sender?.split('@')[0]||'User';
    const menuText=buildMenu(senderNum);
    const thumbBuf=getThumb();

    if(thumbBuf){
      try{
        // Image + full menu as caption — attached together
        await sock.sendMessage(from,{
          image  : thumbBuf,
          caption: menuText,
        },{quoted:msg});
      }catch(captionErr){
        // Fallback if caption too long
        console.error('[MENU] caption fallback:',captionErr.message);
        await sock.sendMessage(from,{
          image  : thumbBuf,
          caption: `🚀 *${OWNER.BOT_NAME}* — Ultra Pro Max\n👑 *By ${OWNER.FULL_NAME}*\n\n⏳ Loading menu...`,
        },{
