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
  BOT_TAGLINE: 'Zero-Config WhatsApp Bot Platform',

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
  PORT:          3000,
  MAX_INSTANCES: 100,

  // ── DEFAULT FEATURE FLAGS ─────────────────────────────────
  DEFAULTS: {
    ANTI_DELETE:      true,
    AUTO_STATUS_VIEW: true,
    AUTO_LIKE_STATUS: true,
    ANTI_CALL:        true,
    ANTI_LINK:        false,
    WELCOME_MSG:      true,
    GOODBYE_MSG:      true,
    AUTO_REACT:       false,
  },

  // ── WELCOME MESSAGE ───────────────────────────────────────
  WELCOME_TEXT: (jid, sessionId) => `
꧁༺ 🤖 *YOUSAF-MD* 🤖 ༻꧂

┌─────────────────────┐
│ ✅ *Bot is Now LIVE!*
│ 📱 *Number :* ${jid.split('@')[0]}
│ 🔑 *Session :* ${sessionId}
│ ⚡ *Status :* Online & Active
└─────────────────────┘

📌 *Quick Start:*
   • *.menu* — تمام commands دیکھیں
   • *.settings* — Bot کنٹرول کریں
   • *.ping* — Bot چیک کریں

🔗 *Official Links:*
   📢 ${config.LINKS?.WHATSAPP || 'https://whatsapp.com/channel/0029Vb3Uzps6buMH2RvGef0j'}
   📺 ${config.LINKS?.YOUTUBE  || 'https://www.youtube.com/@Yousaf_Baloch_Tech'}
   🎵 ${config.LINKS?.TIKTOK   || 'https://tiktok.com/@loser_boy.110'}
   💻 ${config.LINKS?.GITHUB   || 'https://github.com/yousafpubg110-tech/YOUSAF-MD'}

❖──────────────────────❖
> *© Powered By Mr Yousaf Baloch* 🇵🇰
❖──────────────────────❖`.trim(),

};

module.exports = config;
