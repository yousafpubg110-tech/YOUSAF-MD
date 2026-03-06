// ============================================================
//   YOUSAF-MD — MASTER CONFIGURATION FILE
//   Developer: Muhammad Yousaf Baloch
//   GitHub: https://github.com/yousafpubg110-tech/YOUSAF-MD
// ============================================================

'use strict';

const config = {
  // ── BRANDING ──────────────────────────────────────────────
  BOT_NAME:       'YOUSAF-MD',
  BOT_VERSION:    '3.0.0',
  BOT_TAGLINE:    'Zero-Config WhatsApp Bot Platform',

  // ── OWNER / DEVELOPER ─────────────────────────────────────
  OWNER_NAME:     'Muhammad Yousaf Baloch',
  OWNER_NUMBER:   '923710636110',
  OWNER_JID:      '923710636110@s.whatsapp.net',

  // ── SOCIAL LINKS ──────────────────────────────────────────
  LINKS: {
    GITHUB:    'https://github.com/yousafpubg110-tech/YOUSAF-MD',
    TIKTOK:    'https://tiktok.com/@loser_boy.110',
    YOUTUBE:   'https://www.youtube.com/@Yousaf_Baloch_Tech',
    WHATSAPP:  'https://whatsapp.com/channel/0029Vb3Uzps6buMH2RvGef0j',
  },

  // ── BOT DEFAULTS ──────────────────────────────────────────
  PREFIX:          '.',
  SESSION_DIR:     './sessions',
  DATABASE_DIR:    './database',
  TEMP_DIR:        './temp',

  // ── SERVER ────────────────────────────────────────────────
  PORT:            3000,
  MAX_INSTANCES:   100,

  // ── DEFAULT FEATURE FLAGS (toggled via .settings) ─────────
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

  // ── WELCOME MESSAGE TEMPLATE ──────────────────────────────
  WELCOME_TEXT: (jid, sessionId) => `
╔══════════════════════════════╗
║       🤖 *YOUSAF-MD v3.0*      ║
╚══════════════════════════════╝

✅ *Your Bot is Now LIVE!*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📱 *Paired Number:* ${jid.split('@')[0]}
🔑 *Session ID:* \`${sessionId}\`
⚡ *Status:* Running on High-Speed Server
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 *Quick Start:*
   • Type *.menu* — See all commands
   • Type *.settings* — Control your bot
   • Type *.help* — Get support
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👑 *Developer:* Muhammad Yousaf Baloch
📞 *Contact:* +92 371 0636110

🔗 *Official Links:*
   📦 GitHub: https://github.com/yousafpubg110-tech/YOUSAF-MD
   🎵 TikTok: https://tiktok.com/@loser_boy.110
   📺 YouTube: https://www.youtube.com/@Yousaf_Baloch_Tech
   📢 Channel: https://whatsapp.com/channel/0029Vb3Uzps6buMH2RvGef0j
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💾 *Note:* Your Session ID above is your backup.
Your bot is already running — no action needed!
  `.trim(),

  // ── MENU TEXT ─────────────────────────────────────────────
  MENU_TEXT: (prefix) => `
╔══════════════════════════════╗
║       🤖 *YOUSAF-MD v3.0*      ║
║   Zero-Config Bot Platform    ║
╚══════════════════════════════╝

⬇️ *DOWNLOADERS*
  ${prefix}play   [song name]
  ${prefix}audio  [name/link]
  ${prefix}video  [name/link]
  ${prefix}yt     [YouTube URL]
  ${prefix}tiktok [TikTok URL]
  ${prefix}fb     [Facebook URL]
  ${prefix}ig     [Instagram URL]

🎨 *MEDIA & STICKERS*
  ${prefix}sticker   — Image → Sticker
  ${prefix}ttp       — Text on Sticker
  ${prefix}attp      — Animated Text Sticker
  ${prefix}enhance   — Enhance Image Quality
  ${prefix}toimg     — Sticker → Image

👥 *GROUP TOOLS*
  ${prefix}tagall    — Tag All Members
  ${prefix}hidetag   — Hidden Tag All
  ${prefix}kick      — Remove Member
  ${prefix}add       — Add Member
  ${prefix}promote   — Make Admin
  ${prefix}demote    — Remove Admin
  ${prefix}groupinfo — Group Details

🔧 *TOOLS*
  ${prefix}google    — Google Search
  ${prefix}wiki      — Wikipedia
  ${prefix}tts       — Text to Speech
  ${prefix}playstore — Search App
  ${prefix}weather   — Current Weather
  ${prefix}calc      — Calculator
  ${prefix}time      — Current Time/Date

🛡️ *SAFETY (Admin Only)*
  ${prefix}settings  — Bot Control Panel
  ${prefix}antidel   — Toggle Anti-Delete
  ${prefix}antical   — Toggle Anti-Call
  ${prefix}antilink  — Toggle Anti-Link

ℹ️ *INFO*
  ${prefix}menu      — This Menu
  ${prefix}info      — Bot Information
  ${prefix}ping      — Check Bot Speed
  ${prefix}owner     — Owner Contact

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👑 *Dev:* Muhammad Yousaf Baloch
📦 *GitHub:* github.com/yousafpubg110-tech/YOUSAF-MD
  `.trim(),
};

module.exports = config;

