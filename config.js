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

  // ── WELCOME MESSAGE — NO SESSION ID ───────────────────────
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

};

module.exports = config;
