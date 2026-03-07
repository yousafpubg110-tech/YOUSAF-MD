// ============================================================
//   YOUSAF-MD — MASTER CONFIGURATION FILE
//   Developer: Muhammad Yousaf Baloch
//   GitHub: https://github.com/yousafpubg110-tech/YOUSAF-MD
// ============================================================

'use strict';

const config = {

  // ── BRANDING ──────────────────────────────────────────────
  BOT_NAME:    'YOUSAF-MD',
  BOT_VERSION: '3.0.0',
  BOT_TAGLINE: 'Personal WhatsApp Bot',

  // ── OWNER / DEVELOPER ─────────────────────────────────────
  OWNER_NAME:   'Muhammad Yousaf Baloch',
  OWNER_NUMBER: '923710636110',
  OWNER_JID:    '923710636110@s.whatsapp.net',

  // ── SOCIAL LINKS ──────────────────────────────────────────
  LINKS: {
    GITHUB:   'https://github.com/yousafpubg110-tech/YOUSAF-MD',
    TIKTOK:   'https://tiktok.com/@loser_boy.110',
    YOUTUBE:  'https://www.youtube.com/@Yousaf_Baloch_Tech',
    WHATSAPP: 'https://whatsapp.com/channel/0029Vb3Uzps6buMH2RvGef0j',
  },

  // ── BOT DEFAULTS ──────────────────────────────────────────
  PREFIX:       '.',
  SESSION_DIR:  './sessions',
  DATABASE_DIR: './database',
  TEMP_DIR:     './temp',

  // ── SERVER ────────────────────────────────────────────────
  PORT: process.env.PORT || 3000,

  // ── DEPLOYMENT TYPE ───────────────────────────────────────
  DEPLOYMENT_TYPE: 'personal-instance',

  // ── DEFAULT FEATURE FLAGS ─────────────────────────────────
  DEFAULTS: {
    ANTI_DELETE:      true,
    AUTO_STATUS_VIEW: true,
    AUTO_LIKE_STATUS: true,
    ANTI_CALL:        false,
    ANTI_LINK:        true,
    WELCOME_MSG:      false,
    GOODBYE_MSG:      false,
    AUTO_REACT:       true,
  },

  // ── MENU TEXT ─────────────────────────────────────────────
  MENU_TEXT: (prefix) => `
꧁༺ 🤖 *YOUSAF-MD v3.0* 🤖 ༻꧂
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 *GENERAL COMMANDS*
┌─────────────────────
│ ${prefix}menu — تمام commands دیکھیں
│ ${prefix}ping — Bot کی speed چیک کریں
│ ${prefix}info — Bot کی معلومات
│ ${prefix}owner — Developer سے رابطہ
└─────────────────────

⚙️ *SETTINGS COMMANDS*
┌─────────────────────
│ ${prefix}settings — مکمل settings panel
│ ${prefix}set [feature] [on/off] — setting بدلیں
│ ${prefix}antidel — Anti-Delete toggle
│ ${prefix}antical — Anti-Call toggle
│ ${prefix}antilink — Anti-Link toggle
│ ${prefix}autolike — Auto-Like Status toggle
│ ${prefix}autoview — Auto-View Status toggle
└─────────────────────

🛡️ *SAFETY FEATURES*
┌─────────────────────
│ ✅ Anti-Delete — Delete ہونے والے messages واپس لائے
│ ✅ Anti-Call — نامعلوم calls reject کرے
│ ✅ Anti-Link — Groups میں links block کرے
│ ✅ Auto-Status View — Status خود دیکھے
│ ✅ Auto-Like Status — Status پر like کرے
└─────────────────────

👥 *GROUP COMMANDS*
┌─────────────────────
│ ${prefix}kick @tag — Member نکالیں
│ ${prefix}add [number] — Member شامل کریں
│ ${prefix}promote @tag — Admin بنائیں
│ ${prefix}demote @tag — Admin سے ہٹائیں
│ ${prefix}link — Group link لیں
│ ${prefix}revoke — Group link بدلیں
│ ${prefix}tagall — سب کو tag کریں
│ ${prefix}mute — Group band کریں
│ ${prefix}unmute — Group کھولیں
└─────────────────────

🎵 *DOWNLOADER COMMANDS*
┌─────────────────────
│ ${prefix}yt [link] — YouTube video download
│ ${prefix}ytmp3 [link] — YouTube audio download
│ ${prefix}tiktok [link] — TikTok video download
│ ${prefix}insta [link] — Instagram video download
└─────────────────────

🎨 *MEDIA COMMANDS*
┌─────────────────────
│ ${prefix}sticker — Image کو sticker بنائیں
│ ${prefix}toimg — Sticker کو image بنائیں
│ ${prefix}enhance — Image quality بہتر کریں
└─────────────────────

🛠️ *TOOLS COMMANDS*
┌─────────────────────
│ ${prefix}translate [text] — متن ترجمہ کریں
│ ${prefix}weather [city] — موسم دیکھیں
│ ${prefix}calc [expression] — حساب لگائیں
│ ${prefix}tts [text] — Text to speech
└─────────────────────

💬 *AUTO-REPLY*
┌─────────────────────
│ hi / hello / سلام — خودکار جواب
│ how are you — خودکار جواب
└─────────────────────

❖──────────────────────────────❖
👑 *Developer:* Muhammad Yousaf Baloch
📢 WhatsApp Channel join کریں!
❖──────────────────────────────❖`.trim(),

  // ── WELCOME MESSAGE (NO SESSION ID) ───────────────────────
  WELCOME_TEXT: (phone) => `
꧁༺ 🤖 *YOUSAF-MD* 🤖 ༻꧂

┌─────────────────────┐
│ ✅ *Bot Connected!*
│ 📱 *Number:* +${phone}
│ ⚡ *Status:* Online & Active
└─────────────────────┘

📌 *Quick Start:*
   • *.menu* — تمام commands دیکھیں
   • *.settings* — Bot کنٹرول کریں
   • *.ping* — Bot چیک کریں

🔗 *Official Links:*
   📢 https://whatsapp.com/channel/0029Vb3Uzps6buMH2RvGef0j
   📺 https://www.youtube.com/@Yousaf_Baloch_Tech
   🎵 https://tiktok.com/@loser_boy.110
   💻 https://github.com/yousafpubg110-tech/YOUSAF-MD

❖──────────────────────❖
> *© Powered By Mr Yousaf Baloch* 🇵🇰
❖──────────────────────❖`.trim(),

};

module.exports = config;
