// ============================================================
//   YOUSAF-MD — MASTER CONFIGURATION FILE
//   Fixed: OWNER_NUMBER env سے آتا ہے، hardcoded نہیں
//   Developer: Muhammad Yousaf Baloch
// ============================================================

'use strict';

const OWNER_NUMBER = (process.env.OWNER_NUMBER || process.env.OWNER_N || '').replace(/\D/g, '');

const config = {

  BOT_NAME:    process.env.BOT_NAM || 'YOUSAF-MD',
  BOT_VERSION: '3.0.0',
  BOT_TAGLINE: 'Personal WhatsApp Bot',

  OWNER_NAME:   'Muhammad Yousaf Baloch',
  OWNER_NUMBER: OWNER_NUMBER,
  OWNER_JID:    OWNER_NUMBER ? OWNER_NUMBER + '@s.whatsapp.net' : '',

  LINKS: {
    GITHUB:   'https://github.com/yousafpubg110-tech/YOUSAF-MD',
    TIKTOK:   'https://tiktok.com/@loser_boy.110',
    YOUTUBE:  'https://www.youtube.com/@Yousaf_Baloch_Tech',
    WHATSAPP: 'https://whatsapp.com/channel/0029Vb3Uzps6buMH2RvGef0j',
  },

  PREFIX:       process.env.PREFIX || '.',
  SESSION_DIR:  './sessions',
  DATABASE_DIR: './database',
  TEMP_DIR:     './temp',

  PORT: process.env.PORT || 3000,

  DEPLOYMENT_TYPE: 'personal-instance',

  DEFAULTS: {
    ANTI_DELETE:      process.env.ANTI_DE  !== 'true',
    AUTO_STATUS_VIEW: process.env.AUTO_ST  !== 'true',
    AUTO_LIKE_STATUS: process.env.AUTO_LI  !== 'true',
    ANTI_CALL:        process.env.ANTI_CA  === 'false',
    ANTI_LINK:        process.env.ANTI_LI  !== 'true',
    WELCOME_MSG:      process.env.WELCOME  === 'false',
    GOODBYE_MSG:      process.env.GOODBYE  === 'false',
    AUTO_REACT:       process.env.AUTO_RE  !== 'true',
  },

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
