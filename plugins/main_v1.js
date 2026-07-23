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
import { fileURLToPath } from 'url';
import { OWNER, CONFIG, SYSTEM } from '../config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

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
    `╭─『 👑 *${OWNER.BOT_NAME || 'YOUSAF-MD'}* 』\n`+
    `│ 👤 *Owner:*   ${OWNER.FULL_NAME}\n`+
    `│ 📱 *Number:*  +${OWNER.NUMBER}\n`+
    `│ 📢 *Channel:* ${OWNER.CHANNEL}\n`+
    `│ 📺 *YouTube:* ${OWNER.YOUTUBE}\n`+
    `│ 🎵 *TikTok:*  ${OWNER.TIKTOK}\n`+
    `│ 💻 *GitHub:*  ${OWNER.GITHUB}\n`+
    `╰──────────────────────────\n`+
    `_© ${OWNER.YEAR||new Date().getFullYear()} ${OWNER.BOT_NAME || 'YOUSAF-MD'}_`
  );
}

function getThumb(){
  const names = ['menu.jpg','menu.png','menu-thumb.jpg','menu-thumb.png','banner.jpg'];
  for(const name of names){
    try{
      const p1 = path.resolve(`./assets/${name}`);
      if(fs.existsSync(p1)) return fs.readFileSync(p1);
      const p2 = path.join(__dirname, `../assets/${name}`);
      if(fs.existsSync(p2)) return fs.readFileSync(p2);
    }catch(_){}
  }
  return null;
}

function getOwnerImg(){
  const names = ['owner.jpg','owner.png','banner.jpg'];
  for(const name of names){
    try{
      const p1 = path.resolve(`./assets/${name}`);
      if(fs.existsSync(p1)) return fs.readFileSync(p1);
      const p2 = path.join(__dirname, `../assets/${name}`);
      if(fs.existsSync(p2)) return fs.readFileSync(p2);
    }catch(_){}
  }
  return null;
}

async function sendMenuVoice(sock, from, msg){
  try{
    const names = ['menu-voice.m4a','menu-voice.mp3','menu-voice.ogg'];
    for(const name of names){
      const p1 = path.resolve(`./assets/${name}`);
      const p2 = path.join(__dirname, `../assets/${name}`);
      const target = fs.existsSync(p1) ? p1 : (fs.existsSync(p2) ? p2 : null);
      
      if(target){
        const voiceBuf=fs.readFileSync(target);
        await sock.sendMessage(from,{
          audio:    voiceBuf,
          mimetype: name.endsWith('.mp3') ? 'audio/mpeg' : 'audio/mp4',
          ptt:      true,
        },{quoted:msg});
        return;
      }
    }
  }catch(_){}
}

function buildMenu(senderName){
  const pfx=CONFIG.PREFIX || '.';
  const now=new Date(new Date().toLocaleString('en',{timeZone:'Asia/Karachi'}));
  const time=now.toLocaleTimeString('en-PK',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
  const date=now.toLocaleDateString('en-PK',{day:'2-digit',month:'long',year:'numeric'});
  const day=now.toLocaleDateString('en-PK',{weekday:'long'});
  const T=getTimeInfo();
  const up=process.uptime();
  const hrs=Math.floor(up/3600),mins=Math.floor((up%3600)/60),secs=Math.floor(up%60);
  let pluginCount=0;
  try{pluginCount=fs.readdirSync('./plugins').filter(f=>f.endsWith('.js')).length;}catch(_){}

  return (
    `╔══════════════════════════════════════════════════════════════╗\n`+
    `║     🚀 *${OWNER.BOT_NAME || 'YOUSAF-MD'}* ─ *Ultra Pro Max* 🚀             ║\n`+
    `║           ✨ *Best WhatsApp Bot Ever* ✨                      ║\n`+
    `║              👑 *By ${OWNER.FULL_NAME}* 👑                   ║\n`+
    `╚══════════════════════════════════════════════════════════════╝\n\n`+

    `╭━『 ⏰ *TIME MODE* 』━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮\n`+
    `┃  ${T.emoji} *${T.label}* — ${T.greet}\n`+
    `┃  🤲 *${T.dua}*\n`+
    `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯\n\n`+

    `╭━『 📊 *BOT INFORMATION* 』━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮\n`+
    `┃  👤 *User*     : ${senderName}\n`+
    `┃  👑 *Owner*    : ${OWNER.FULL_NAME}\n`+
    `┃  📱 *Number*   : +${OWNER.NUMBER}\n`+
    `┃  🤖 *Bot Name* : ${OWNER.BOT_NAME || 'YOUSAF-MD'}\n`+
    `┃  📅 *Date*     : ${date}\n`+
    `┃  📆 *Day*      : ${day}\n`+
    `┃  ⏰ *Time*     : ${time}\n`+
    `┃  ⏱️ *Uptime*   : ${hrs}h ${mins}m ${secs}s\n`+
    `┃  🔌 *Plugins*  : ${pluginCount}+ Active\n`+
    `┃  📟 *Prefix*   : [ ${pfx} ]\n`+
    `┃  🌐 *Mode*     : ${T.mode}\n`+
    `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯\n\n`+

    `╭━『 🔗 *SOCIAL MEDIA* 』━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮\n`+
    `┃  📢 *Channel*   : ${OWNER.CHANNEL}\n`+
    `┃  📺 *YouTube*   : ${OWNER.YOUTUBE}\n`+
    `┃  🎵 *TikTok*    : ${OWNER.TIKTOK}\n`+
    `┃  💻 *GitHub*    : ${OWNER.GITHUB}\n`+
    `┃  📱 *WhatsApp*  : ${OWNER.WHATSAPP || OWNER.NUMBER}\n`+
    `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯\n\n`+

    `━━━━━━━━━━『 📋 *MAIN MENU* 』━━━━━━━━━━\n\n`+

    `╭━『 🏠 *MAIN* 』━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮\n`+
    `┃  ${pfx}menu      » Full Menu Display\n`+
    `┃  ${pfx}alive     » Bot Status Check\n`+
    `┃  ${pfx}ping      » Speed Test\n`+
    `┃  ${pfx}runtime   » Bot Uptime\n`+
    `┃  ${pfx}info      » Bot Information\n`+
    `┃  ${pfx}owner     » Owner Information\n`+
    `┃  ${pfx}support   » Support Group\n`+
    `┃  ${pfx}script    » Get Bot Script\n`+
    `┃  ${pfx}settings  » Bot Settings\n`+
    `┃  ${pfx}public    » Set Public Mode\n`+
    `┃  ${pfx}private   » Set Private Mode\n`+
    `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯\n\n`+

    `╭━『 ⚙️ *AUTO FEATURES* 』━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮\n`+
    `┃  ${pfx}autoviewstatus  » Auto View Status\n`+
    `┃  ${pfx}antidelete      » Anti Delete Messages\n`+
    `┃  ${pfx}autoreact       » Auto React to Messages\n`+
    `┃  ${pfx}autoread        » Auto Read Messages\n`+
    `┃  ${pfx}autotyping      » Typing Indicator\n`+
    `┃  ${pfx}autorecording   » Recording Status\n`+
    `┃  ${pfx}autobio         » Auto Bio Rotate\n`+
    `┃  ${pfx}anticall        » Auto Reject Calls\n`+
    `┃  ${pfx}autoreply       » Auto Reply\n`+
    `┃  ${pfx}autodownload    » Auto Download Media\n`+
    `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯\n\n`+

    `╭━『 🤖 *ARTIFICIAL INTELLIGENCE* 』━━━━━━━━━━━━━━━━━━━━━━━━╮\n`+
    `┃  ${pfx}ai              » Gemini AI Chat\n`+
    `┃  ${pfx}chatgpt         » ChatGPT Response\n`+
    `┃  ${pfx}gpt4            » GPT-4 AI\n`+
    `┃  ${pfx}deepseek        » DeepSeek AI\n`+
    `┃  ${pfx}claude          » Claude AI\n`+
    `┃  ${pfx}bing            » Bing AI\n`+
    `┃  ${pfx}doctor          » AI Doctor\n`+
    `┃  ${pfx}lawyer          » AI Lawyer\n`+
    `┃  ${pfx}homework        » Homework Helper\n`+
    `┃  ${pfx}khuwab          » Dream Interpretation\n`+
    `┃  ${pfx}resume          » Resume Builder\n`+
    `┃  ${pfx}romanurdu       » Roman Urdu AI\n`+
    `┃  ${pfx}imagine         » Generate AI Art\n`+
    `┃  ${pfx}dalle           » DALL-E Image\n`+
    `┃  ${pfx}bgremove        » Remove Background\n`+
    `┃  ${pfx}aicode          » Generate Code\n`+
    `┃  ${pfx}explain         » Explain Code\n`+
    `┃  ${pfx}debug           » Debug Code\n`+
    `┃  ${pfx}translate       » Translate Text\n`+
    `┃  ${pfx}ocr             » Read Image Text\n`+
    `┃  ${pfx}tts             » Text to Speech\n`+
    `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯\n\n`+

    `╭━『 📥 *DOWNLOADERS* 』━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮\n`+
    `┃  ${pfx}ytmp3           » YouTube Audio MP3\n`+
    `┃  ${pfx}ytmp4           » YouTube Video MP4\n`+
    `┃  ${pfx}play            » Search & Play Song\n`+
    `┃  ${pfx}song            » Search Song\n`+
    `┃  ${pfx}video           » Search Video\n`+
    `┃  ${pfx}music           » Music Download\n`+
    `┃  ${pfx}drama           » Drama Download\n`+
    `┃  ${pfx}movie           » Movie Info & Download\n`+
    `┃  ${pfx}tiktok          » TikTok Without Watermark\n`+
    `┃  ${pfx}ttmp3           » TikTok Audio Only\n`+
    `┃  ${pfx}instagram       » Instagram Post/Reel\n`+
    `┃  ${pfx}igreel          » Instagram Reel\n`+
    `┃  ${pfx}facebook        » Facebook Video\n`+
    `┃  ${pfx}twitter         » Twitter / X Video\n`+
    `┃  ${pfx}x               » X (Twitter) Video\n`+
    `┃  ${pfx}soundcloud      » SoundCloud Audio\n`+
    `┃  ${pfx}snapchat        » Snapchat Media\n`+
    `┃  ${pfx}threads         » Threads Video\n`+
    `┃  ${pfx}pinterest       » Pinterest Image\n`+
    `┃  ${pfx}wallpaper       » HD Wallpaper\n`+
    `┃  ${pfx}ringtone        » Ringtone Download\n`+
    `┃  ${pfx}gdrive          » Google Drive File\n`+
    `┃  ${pfx}mediafire       » MediaFire File\n`+
    `┃  ${pfx}apk             » Download APK\n`+
    `┃  ${pfx}modapk          » Modded APK\n`+
    `┃  ${pfx}playstore       » Play Store App Info\n`+
    `┃  ${pfx}naat            » Naat Download\n`+
    `┃  ${pfx}bayan           » Islamic Bayan\n`+
    `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯\n\n`+

    `╭━『 🖼️ *IMAGE TOOLS* 』━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮\n`+
    `┃  ${pfx}remini          » AI Image Enhancer\n`+
    `┃  ${pfx}enhance         » HD Quality Enhance\n`+
    `┃  ${pfx}blur            » Blur Effect\n`+
    `┃  ${pfx}sepia           » Sepia Effect\n`+
    `┃  ${pfx}grayscale       » Black & White\n`+
    `┃  ${pfx}cartoon         » Cartoon Effect\n`+
    `┃  ${pfx}sketch          » Pencil Sketch\n`+
    `┃  ${pfx}watermark       » Add Watermark\n`+
    `┃  ${pfx}rembg           » Remove Background\n`+
    `┃  ${pfx}wanted          » Wanted Poster\n`+
    `┃  ${pfx}wasted          » Wasted Effect\n`+
    `┃  ${pfx}jail            » Jail Effect\n`+
    `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯\n\n`+

    `╭━『 🎭 *STICKER* 』━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮\n`+
    `┃  ${pfx}sticker         » Image to Sticker\n`+
    `┃  ${pfx}s               » Quick Sticker\n`+
    `┃  ${pfx}sgif            » Video to GIF Sticker\n`+
    `┃  ${pfx}toimg           » Sticker to Image\n`+
    `┃  ${pfx}ttp             » Text to Sticker\n`+
    `┃  ${pfx}attp            » Animated Text Sticker\n`+
    `┃  ${pfx}emojimix        » Mix Two Emojis\n`+
    `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯\n\n`+

    `╭━『 🎨 *DESIGN* 』━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮\n`+
    `┃  ${pfx}logo            » 30+ Logo Styles\n`+
    `┃  ${pfx}dp              » 30+ DP Styles\n`+
    `┃  ${pfx}carbon          » Code Screenshot\n`+
    `┃  ${pfx}meme            » Create Meme\n`+
    `┃  ${pfx}dpmaker         » Custom DP Maker\n`+
    `┃  ${pfx}logomaker       » Custom Logo Maker\n`+
    `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯\n\n`+

    `╭━『 🔧 *TOOLS* 』━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮\n`+
    `┃  ${pfx}calc            » Calculator\n`+
    `┃  ${pfx}convert         » Unit Converter\n`+
    `┃  ${pfx}currency        » Currency Converter\n`+
    `┃  ${pfx}weather         » Weather Info\n`+
    `┃  ${pfx}pdf             » Image to PDF\n`+
    `┃  ${pfx}ocr             » Read Image Text (OCR)\n`+
    `┃  ${pfx}qr              » Generate QR Code\n`+
    `┃  ${pfx}short           » Shorten URL\n`+
    `┃  ${pfx}screenshot      » Website Screenshot\n`+
    `┃  ${pfx}tts             » Text to Speech\n`+
    `┃  ${pfx}unit            » Unit Converter\n`+
    `┃  ${pfx}ttsurdu         » Urdu Text to Speech\n`+
    `┃  ${pfx}capcut          » CapCut Template\n`+
    `┃  ${pfx}inshot          » InShot Template\n`+
    `┃  ${pfx}compressor      » Image Compressor\n`+
    `┃  ${pfx}watermark       » Add Watermark to Image\n`+
    `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯\n\n`+

    `╭━『 🔍 *SEARCH* 』━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮\n`+
    `┃  ${pfx}google          » Google Search\n`+
    `┃  ${pfx}wiki            » Wikipedia Search\n`+
    `┃  ${pfx}lyrics          » Song Lyrics\n`+
    `┃  ${pfx}news            » Latest News\n`+
    `┃  ${pfx}technews        » Tech News\n`+
    `┃  ${pfx}github          » GitHub Profile/Repo\n`+
    `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯\n\n`+

    `╭━『 ☪️ *ISLAMIC* 』━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮\n`+
    `┃  ${pfx}quran           » Read Quran by Surah\n`+
    `┃  ${pfx}ayat            » Random Ayat\n`+
    `┃  ${pfx}hadith          » Random Hadith\n`+
    `┃  ${pfx}prayertime      » Today Prayer Times\n`+
    `┃  ${pfx}hijri           » Hijri Date\n`+
    `┃  ${pfx}dua             » Random Dua\n`+
    `┃  ${pfx}asma            » Asma-ul-Husna (99 Names)\n`+
    `┃  ${pfx}zakatcalc       » Zakat Calculator\n`+
    `┃  ${pfx}ramadan         » Ramadan Info & Times\n`+
    `┃  ${pfx}tafsir          » Quran Tafsir\n`+
    `┃  ${pfx}hajj            » Hajj & Umrah Guide\n`+
    `┃  ${pfx}names           » Islamic Baby Names\n`+
    `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯\n\n`+

    `╭━『 🏏 *CRICKET & SPORTS* 』━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮\n`+
    `┃  ${pfx}score           » Live Cricket Score\n`+
    `┃  ${pfx}livescore       » All Live Matches\n`+
    `┃  ${pfx}matchinfo       » Match Details\n`+
    `┃  ${pfx}schedule        » Match Schedule\n`+
    `┃  ${pfx}psl             » PSL 2026 Updates\n`+
    `┃  ${pfx}ipl             » IPL Updates\n`+
    `┃  ${pfx}pointstable     » Points Table\n`+
    `┃  ${pfx}football        » Football Score\n`+
    `┃  ${pfx}toss            » Toss Result\n`+
    `┃  ${pfx}news            » Cricket News\n`+
    `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯\n\n`+

    `╭━『 👥 *GROUP MANAGEMENT* 』━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮\n`+
    `┃  ${pfx}add             » Add Member to Group\n`+
    `┃  ${pfx}kick            » Kick Member\n`+
    `┃  ${pfx}promote         » Make Admin\n`+
    `┃  ${pfx}demote          » Remove Admin\n`+
    `┃  ${pfx}tagall          » Tag All Members\n`+
    `┃  ${pfx}hidetag         » Silent Tag All\n`+
    `┃  ${pfx}admins          » Show Admin List\n`+
    `┃  ${pfx}members         » Show Member List\n`+
    `┃  ${pfx}warn            » Warn a Member\n`+
    `┃  ${pfx}unwarn          » Remove Warning\n`+
    `┃  ${pfx}warnlist        » Show Warn List\n`+
    `┃  ${pfx}groupopen       » Open Group (All Send)\n`+
    `┃  ${pfx}groupclose      » Close Group (Admins Only)\n`+
    `┃  ${pfx}antilink        » Anti Link System\n`+
    `┃  ${pfx}antiabuse       » Anti Bad Words\n`+
    `┃  ${pfx}antidelete      » Anti Delete\n`+
    `┃  ${pfx}antivv          » Anti View Once\n`+
    `┃  ${pfx}antispam        » Anti Spam\n`+
    `┃  ${pfx}settings        » Group Bot Settings\n`+
    `┃  ${pfx}mute            » Mute Member\n`+
    `┃  ${pfx}unmute          » Unmute Member\n`+
    `┃  ${pfx}invite          » Get Group Invite Link\n`+
    `┃  ${pfx}ghost           » Ghost Mode\n`+
    `┃  ${pfx}activity        » Group Activity\n`+
    `┃  ${pfx}bannedlist      » Banned Members List\n`+
    `┃  ${pfx}autosticker     » Auto Sticker Mode\n`+
    `┃  ${pfx}poll            » Create Poll\n`+
    `┃  ${pfx}unban           » Unban Member\n`+
    `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯\n\n`+

    `╭━『 💰 *ECONOMY SYSTEM* 』━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮\n`+
    `┃  ${pfx}balance         » Check Your Balance\n`+
    `┃  ${pfx}daily           » Claim Daily Reward\n`+
    `┃  ${pfx}work            » Work for Coins\n`+
    `┃  ${pfx}shop            » View Item Shop\n`+
    `┃  ${pfx}buy             » Buy Item from Shop\n`+
    `┃  ${pfx}leaderboard     » Top 10 Richest Users\n`+
    `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯\n\n`+

    `╭━『 🎮 *GAMES* 』━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮\n`+
    `┃  ${pfx}tictactoe       » Tic Tac Toe Game\n`+
    `┃  ${pfx}quiz            » Quiz Game\n`+
    `┃  ${pfx}dice            » Roll a Dice\n`+
    `┃  ${pfx}coin            » Flip a Coin\n`+
    `┃  ${pfx}math            » Math Challenge\n`+
    `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯\n\n`+

    `╭━『 😄 *FUN* 』━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮\n`+
    `┃  ${pfx}joke            » Random Joke\n`+
    `┃  ${pfx}quote           » Motivational Quote\n`+
    `┃  ${pfx}fact            » Random Fact\n`+
    `┃  ${pfx}truth           » Truth Question\n`+
    `┃  ${pfx}dare            » Dare Challenge\n`+
    `┃  ${pfx}meme            » Random Meme\n`+
    `┃  ${pfx}ship            » Love Meter\n`+
    `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯\n\n`+

    `╭━『 👑 *OWNER / DEPLOYER ONLY* 』━━━━━━━━━━━━━━━━━━━━━━━━━╮\n`+
    `┃  ${pfx}broadcast       » Broadcast Message to All\n`+
    `┃  ${pfx}ban             » Ban a User\n`+
    `┃  ${pfx}unban           » Unban a User\n`+
    `┃  ${pfx}block           » Block a User\n`+
    `┃  ${pfx}unblock         » Unblock a User\n`+
    `┃  ${pfx}restart         » Restart Bot\n`+
    `┃  ${pfx}shutdown        » Shutdown Bot\n`+
    `┃  ${pfx}eval            » Execute JS Code\n`+
    `┃  ${pfx}exec            » Execute Shell Command\n`+
    `┃  ${pfx}shell           » Shell Access\n`+
    `┃  ${pfx}join            » Join a Group\n`+
    `┃  ${pfx}leave           » Leave a Group\n`+
    `┃  ${pfx}public          » Set Bot to Public Mode\n`+
    `┃  ${pfx}private         » Set Bot to Private Mode\n`+
    `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯\n\n`+

    `╔══════════════════════════════════════════════════════════════╗\n`+
    `║                  💎 *BOT FEATURES* 💎                        ║\n`+
    `╠══════════════════════════════════════════════════════════════╣\n`+
    `║  ✅ 500+ Active Commands & Plugins                           ║\n`+
    `║  ✅ Auto View & Like Status                                  ║\n`+
    `║  ✅ Anti Delete Messages                                     ║\n`+
    `║  ✅ 3-Strike Warning System (Auto Kick)                      ║\n`+
    `║  ✅ Economy System (Coins, Daily, Shop)                      ║\n`+
    `║  ✅ Live Cricket & Football Scores                           ║\n`+
    `║  ✅ AI — Gemini, GPT-4, Claude, DeepSeek                    ║\n`+
    `║  ✅ AI Image Generation (DALL-E, Pollinations)               ║\n`+
    `║  ✅ 30+ Logo & DP Styles                                     ║\n`+
    `║  ✅ Full Islamic Suite (Quran, Hadith, Prayer)               ║\n`+
    `║  ✅ Universal Deploy — Heroku, Render, Railway, VPS          ║\n`+
    `║  ✅ Public & Private Mode Support                            ║\n`+
    `║  ✅ Multi-Platform Session via YOUSAF-PAIRING-V1             ║\n`+
    `╠══════════════════════════════════════════════════════════════╣\n`+
    `║  👑 *Owner:*   ${OWNER.FULL_NAME}\n`+
    `║  📱 *Number:*  +${OWNER.NUMBER}\n`+
    `║  📢 *Channel:* ${OWNER.CHANNEL}\n`+
    `║  📺 *YouTube:* ${OWNER.YOUTUBE}\n`+
    `║  🎵 *TikTok:*  ${OWNER.TIKTOK}\n`+
    `╚══════════════════════════════════════════════════════════════╝\n\n`+
    `_✨ © ${OWNER.YEAR||new Date().getFullYear()} ${OWNER.BOT_NAME || 'YOUSAF-MD'} ✨_\n`+
    `_⚡ Developed by ${OWNER.FULL_NAME} ⚡_`
  ).trim();
}

async function aliveHandler({sock,msg,from,sender}){
  try{
    const senderNum=sender?.split('@')[0]||'User';
    await sock.sendMessage(from,{
      text:
        `╭━━━『 🤖 *${OWNER.BOT_NAME || 'YOUSAF-MD'}* 』━━━╮\n\n`+
        `👋 *Hello +${senderNum}!*\n${greet()}\n\n`+
        `✅ *Bot is Active & Running!*\n\n`+
        `📊 *Stats:*\n`+
        `├ ⏱️ *Uptime:*  ${fmtUp(process.uptime())}\n`+
        `├ 👑 *Owner:*   ${OWNER.FULL_NAME}\n`+
        `├ 📞 *Contact:* +${OWNER.NUMBER}\n`+
        `├ ✨ *Version:* ${OWNER.VERSION || '1.0.0'}\n`+
        `├ 🔧 *Prefix:*  ${CONFIG.PREFIX}\n`+
        `├ 🌐 *Mode:*    ${CONFIG.MODE ? CONFIG.MODE.toUpperCase() : 'PUBLIC'}\n`+
        `└ 🟢 *Status:*  Online\n\n`+
        `${ownerFooter()}\n`+
        `╰━━━━━━━━━━━━━━━━━━━━━━━━╯`,
    },{quoted:msg});
  }catch(e){
    await sock.sendMessage(from,{text:`❌ _${e.message}_`},{quoted:msg}).catch(()=>{});
  }
}

async function pingHandler({sock,msg,from}){
  try{
    const start=Date.now();
    await sock.sendMessage(from,{text:'⚡ Pinging...'},{quoted:msg});
    const latency=Date.now()-start;
    await sock.sendMessage(from,{
      text:
        `╭━━━『 ⚡ *PING* 』━━━╮\n\n`+
        `🏓 *Pong!*\n`+
        `⚡ *Latency:* ${latency}ms\n`+
        `⏱️ *Uptime:* ${fmtUp(process.uptime())}\n`+
        `🟢 *Status:* Online\n\n`+
        `╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n${SYSTEM?.SHORT_WATERMARK || ''}`,
    },{quoted:msg});
  }catch(e){
    await sock.sendMessage(from,{text:`❌ _${e.message}_`},{quoted:msg}).catch(()=>{});
  }
}

async function runtimeHandler({sock,msg,from}){
  try{
    const up=process.uptime();
    const days=Math.floor(up/86400),h=Math.floor((up%86400)/3600),m=Math.floor((up%3600)/60),s=Math.floor(up%60);
    await sock.sendMessage(from,{
      text:
        `╭━━━『 ⏱️ *RUNTIME* 』━━━╮\n\n`+
        `🕐 *Bot has been running for:*\n\n`+
        `${days>0?`📅 *Days:*    ${days}d\n`:''}`+
        `⏰ *Hours:*   ${h}h\n`+
        `⏱️ *Minutes:* ${m}m\n`+
        `⏳ *Seconds:* ${s}s\n\n`+
        `🟢 *Status:* Active\n\n`+
        `╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n${SYSTEM?.SHORT_WATERMARK || ''}`,
    },{quoted:msg});
  }catch(e){
    await sock.sendMessage(from,{text:`❌ _${e.message}_`},{quoted:msg}).catch(()=>{});
  }
}

async function infoHandler({sock,msg,from,sender}){
  try{
    const uptime=process.uptime();
    const totalMem=os.totalmem(),freeMem=os.freemem(),usedMem=totalMem-freeMem;
    const senderNum=sender?.split('@')[0]||'User';
    await sock.sendMessage(from,{
      text:
        `╭━━━『 🤖 *BOT INFO* 』━━━╮\n\n`+
        `👋 *Requested by:* +${senderNum}\n\n`+
        `╭─『 🤖 *Bot Details* 』\n`+
        `│ ✨ *Name:*    ${OWNER.BOT_NAME || 'YOUSAF-MD'}\n`+
        `│ 📌 *Version:* ${OWNER.VERSION || '1.0.0'}\n`+
        `│ 👑 *Owner:*   ${OWNER.FULL_NAME}\n`+
        `│ 📞 *Contact:* +${OWNER.NUMBER}\n`+
        `│ 🔧 *Prefix:*  ${CONFIG.PREFIX}\n`+
        `│ 🌐 *Mode:*    ${CONFIG.MODE ? CONFIG.MODE.toUpperCase() : 'PUBLIC'}\n`+
        `╰──────────────────────────\n\n`+
        `╭─『 💻 *System Stats* 』\n`+
        `│ ⏱️  *Uptime:*    ${fmtUp(uptime)}\n`+
        `│ 🖥️  *OS:*        ${os.platform()} (${os.arch()})\n`+
        `│ 📦 *Node.js:*   ${process.version}\n`+
        `│ 💾 *RAM Used:*  ${fmtBytes(usedMem)} / ${fmtBytes(totalMem)}\n`+
        `│ 🔢 *CPU Cores:* ${os.cpus().length}\n`+
        `╰──────────────────────────\n\n`+
        `${ownerFooter()}\n`+
        `╰━━━━━━━━━━━━━━━━━━━━━━━━╯`,
    },{quoted:msg});
  }catch(e){
    await sock.sendMessage(from,{text:`❌ _${e.message}_`},{quoted:msg}).catch(()=>{});
  }
}

async function menuHandler({sock,msg,from,sender}){
  try{
    const senderNum=sender?.split('@')[0]||'User';
    const menuText=buildMenu(senderNum);
    const thumbBuf=getThumb();

    if(thumbBuf){
      await sock.sendMessage(from,{
        image:   thumbBuf,
        caption: menuText,
      },{quoted:msg});
    } else {
      await sock.sendMessage(from,{text:menuText},{quoted:msg});
    }

    setTimeout(()=>sendMenuVoice(sock,from,msg),2000);

  }catch(e){
    await sock.sendMessage(from,{text:`❌ _${e.message}_`},{quoted:msg}).catch(()=>{});
  }
}

async function ownerHandler({sock,msg,from}){
  try{
    const ownerBuf=getOwnerImg();
    const ownerText=
      `╭━━━『 👑 *OWNER INFO* 』━━━╮\n\n`+
      `${ownerFooter()}\n\n`+
      `╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n${SYSTEM?.SHORT_WATERMARK || ''}`;

    if(ownerBuf){
      await sock.sendMessage(from,{
        image:   ownerBuf,
        caption: ownerText,
      },{quoted:msg});
    } else {
      await sock.sendMessage(from,{text:ownerText},{quoted:msg});
    }
  }catch(e){
    await sock.sendMessage(from,{text:`❌ _${e.message}_`},{quoted:msg}).catch(()=>{});
  }
}

async function supportHandler({sock,msg,from}){
  try{
    await sock.sendMessage(from,{
      text:
        `╭━━━『 📢 *SUPPORT* 』━━━╮\n\n`+
        `📢 *WhatsApp Channel:*\n${OWNER.CHANNEL}\n\n`+
        `📺 *YouTube:*\n${OWNER.YOUTUBE}\n\n`+
        `📱 *Contact Owner:*\n${OWNER.WHATSAPP || OWNER.NUMBER}\n\n`+
        `╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n${SYSTEM?.SHORT_WATERMARK || ''}`,
    },{quoted:msg});
  }catch(e){
    await sock.sendMessage(from,{text:`❌ _${e.message}_`},{quoted:msg}).catch(()=>{});
  }
}

async function scriptHandler({sock,msg,from}){
  try{
    await sock.sendMessage(from,{
      text:
        `╭━━━『 💻 *GET SCRIPT* 』━━━╮\n\n`+
        `🔗 *GitHub Repository:*\n${OWNER.REPO || OWNER.GITHUB}\n\n`+
        `⭐ Star the repo if you like it!\n\n`+
        `╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n${SYSTEM?.SHORT_WATERMARK || ''}`,
    },{quoted:msg});
  }catch(e){
    await sock.sendMessage(from,{text:`❌ _${e.message}_`},{quoted:msg}).catch(()=>{});
  }
}

async function publicHandler({sock,msg,from,isDeployer,isOwner}){
  try{
    if(!isDeployer&&!isOwner){
      return sock.sendMessage(from,{text:`❌ *Permission Denied!*\n\n${SYSTEM?.SHORT_WATERMARK || ''}`},{quoted:msg});
    }
    CONFIG.MODE='public';
    await sock.sendMessage(from,{
      text:`✅ *Bot mode set to PUBLIC!*\nEveryone can now use the bot.\n\n${SYSTEM?.SHORT_WATERMARK || ''}`,
    },{quoted:msg});
  }catch(e){
    await sock.sendMessage(from,{text:`❌ _${e.message}_`},{quoted:msg}).catch(()=>{});
  }
}

async function privateHandler({sock,msg,from,isDeployer,isOwner}){
  try{
    if(!isDeployer&&!isOwner){
      return sock.sendMessage(from,{text:`❌ *Permission Denied!*\n\n${SYSTEM?.SHORT_WATERMARK || ''}`},{quoted:msg});
    }
    CONFIG.MODE='private';
    await sock.sendMessage(from,{
      text:`✅ *Bot mode set to PRIVATE!*\nOnly deployer & owner can use the bot.\n\n${SYSTEM?.SHORT_WATERMARK || ''}`,
    },{quoted:msg});
  }catch(e){
    await sock.sendMessage(from,{text:`❌ _${e.message}_`},{quoted:msg}).catch(()=>{});
  }
}

export default [
  { command: 'alive',   handler: aliveHandler   },
  { command: 'ping',    handler: pingHandler     },
  { command: 'runtime', handler: runtimeHandler  },
  { command: 'info',    handler: infoHandler     },
  { command: 'menu',    handler: menuHandler     },
  { command: 'owner',   handler: ownerHandler    },
  { command: 'support', handler: supportHandler  },
  { command: 'script',  handler: scriptHandler   },
  { command: 'public',  handler: publicHandler   },
  { command: 'private', handler: privateHandler  },
];
