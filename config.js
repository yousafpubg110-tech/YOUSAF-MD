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
  // process.env.PORT is required for Heroku
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

  // ── WELCOME MESSAGE — NO SESSION ID ───────────────────────
  // Called from SessionManager with phone number only
  WELCOME_TEXT: (phone) => `
꧁༺ 🤖 *YOUSAF-MD* 🤖 ༻꧂

┌─────────────────────────┐
│ ✅ *Bot Connected!*
│ 📱 *Number:* +${phone}
│ ⚡ *Status:* Online & Active
└─────────────────────────┘

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

  // ── MENU TEXT ─────────────────────────────────────────────
  // Used by info.js .menu command
  MENU_TEXT: (prefix) => `
꧁༺ 🤖 *YOUSAF-MD v3.0* 🤖 ༻꧂
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 *GENERAL*
┌─────────────────────
│ ${prefix}menu     — یہ menu
│ ${prefix}ping     — Bot speed چیک
│ ${prefix}info     — Bot معلومات
│ ${prefix}owner    — Developer contact
└─────────────────────

⚙️ *SETTINGS (Admin Only)*
┌─────────────────────
│ ${prefix}settings  — مکمل settings panel
│ ${prefix}set [feature] [on/off]
│ ${prefix}antidel   — Anti-Delete toggle
│ ${prefix}antical   — Anti-Call toggle
│ ${prefix}antilink  — Anti-Link toggle
│ ${prefix}autolike  — Auto-Like Status toggle
│ ${prefix}autoview  — Auto-View Status toggle
└─────────────────────

🛡️ *SAFETY FEATURES*
┌─────────────────────
│ ✅ Anti-Delete
│ ✅ Anti-Call
│ ✅ Anti-Link
│ ✅ Auto-Status View
│ ✅ Auto-Like Status
└─────────────────────

👥 *GROUP (Admin Only)*
┌─────────────────────
│ ${prefix}kick @tag    — Member نکالیں
│ ${prefix}add [number] — Member شامل کریں
│ ${prefix}promote @tag — Admin بنائیں
│ ${prefix}demote @tag  — Admin سے ہٹائیں
│ ${prefix}link         — Group link
│ ${prefix}revoke       — Group link بدلیں
│ ${prefix}tagall       — سب کو tag کریں
│ ${prefix}mute         — Group band کریں
│ ${prefix}unmute       — Group کھولیں
└─────────────────────

🎵 *DOWNLOADERS*
┌─────────────────────
│ ${prefix}yt [link]     — YouTube video
│ ${prefix}ytmp3 [link]  — YouTube audio
│ ${prefix}tiktok [link] — TikTok video
│ ${prefix}insta [link]  — Instagram video
│ ${prefix}play [name]   — Song search & download
└─────────────────────

🎨 *MEDIA*
┌─────────────────────
│ ${prefix}sticker  — Image to sticker
│ ${prefix}toimg    — Sticker to image
│ ${prefix}enhance  — Image quality بہتر کریں
│ ${prefix}ttp      — Text to sticker
└─────────────────────

🛠️ *TOOLS*
┌─────────────────────
│ ${prefix}translate [text] — ترجمہ
│ ${prefix}weather [city]   — موسم
│ ${prefix}calc [expression]— حساب
│ ${prefix}tts [text]       — Text to speech
│ ${prefix}wiki [topic]     — Wikipedia
│ ${prefix}google [query]   — Google search
└─────────────────────

💬 *AI AUTO-REPLY*
┌─────────────────────
│ Personal chat میں AI سے بات کریں
│ Roman Urdu / Urdu / English سب چلتا ہے
│ ${prefix}clearchat — Chat history صاف کریں
└─────────────────────

❖──────────────────────────────❖
👑 *Developer:* Muhammad Yousaf Baloch
📢 Channel join کریں!
❖──────────────────────────────❖`.trim(),

};

module.exports = config;
