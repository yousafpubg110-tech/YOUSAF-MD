// ============================================================
//   YOUSAF-MD — INFO PLUGIN
//   .ping .info .owner
//   Developer: Muhammad Yousaf Baloch
// ============================================================

'use strict';

const config   = require('../config');
const Database = require('../lib/Database');

const MENU_IMG  = 'https://raw.githubusercontent.com/yousafpubg110-tech/YOUSAF-MD/main/assets/menu.jpg';
const OWNER_IMG = 'https://raw.githubusercontent.com/yousafpubg110-tech/YOUSAF-MD/main/assets/owner.jpg';

module.exports = {
  commands: {

    async ping(sock, msg, ctx) {
      const start = Date.now();
      await sock.sendMessage(ctx.jid, { text: '🏓 Pinging...' }, { quoted: msg });
      const ms = Date.now() - start;
      await sock.sendMessage(ctx.jid, {
        text: `🏓 *Pong!*\n\n⚡ Response Time: *${ms}ms*\n🤖 Bot: *${config.BOT_NAME} v${config.BOT_VERSION}*\n✅ Status: *Online & Active*`,
      }, { quoted: msg });
    },

    async info(sock, msg, ctx) {
      const stats  = Database.stats();
      const uptime = process.uptime();
      const h      = Math.floor(uptime / 3600);
      const m      = Math.floor((uptime % 3600) / 60);
      const s      = Math.floor(uptime % 60);

      const text = `
꧁༺ 🤖 *YOUSAF-MD INFO* ༻꧂

┌─────────────────────┐
│ 🤖 *Bot :* ${config.BOT_NAME}
│ ⚡ *Version :* ${config.BOT_VERSION}
│ ⏱️ *Uptime :* ${h}h ${m}m ${s}s
│ 👥 *Instances :* ${stats.instances}
│ 💾 *DB Size :* ${(stats.size / 1024).toFixed(2)} KB
│ 🖥️ *Memory :* ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB
│ 👑 *Dev :* ${config.OWNER_NAME}
│ 📞 *Contact :* +${config.OWNER_NUMBER}
└─────────────────────┘

❖──────────────────────❖
> *© Powered By Mr Yousaf Baloch* 🇵🇰
❖──────────────────────❖`.trim();

      return sock.sendMessage(ctx.jid, {
        image: { url: MENU_IMG },
        caption: text,
      }, { quoted: msg });
    },

    async owner(sock, msg, ctx) {
      const vcard =
        `BEGIN:VCARD\n` +
        `VERSION:3.0\n` +
        `FN:${config.OWNER_NAME}\n` +
        `ORG:${config.BOT_NAME};\n` +
        `TEL;type=CELL;type=VOICE;waid=${config.OWNER_NUMBER}:+${config.OWNER_NUMBER}\n` +
        `END:VCARD`;

      await sock.sendMessage(ctx.jid, {
        contacts: {
          displayName: config.OWNER_NAME,
          contacts: [{ vcard }],
        },
      }, { quoted: msg });

      const text = `
꧁༺ 👑 *BOT OWNER* ༻꧂

┌─────────────────────┐
│ 👑 *Name :* ${config.OWNER_NAME}
│ 📞 *Number :* +${config.OWNER_NUMBER}
│ 🌍 *Country :* Pakistan 🇵🇰
│ 💼 *Role :* Full Stack Developer
└─────────────────────┘

🔗 *Social Media Links:*

📢 *WhatsApp Channel*
${config.LINKS.WHATSAPP}

📺 *YouTube*
${config.LINKS.YOUTUBE}

🎵 *TikTok*
${config.LINKS.TIKTOK}

💻 *GitHub*
${config.LINKS.GITHUB}

❖──────────────────────❖
> *© Powered By Mr Yousaf Baloch* 🇵🇰
❖──────────────────────❖`.trim();

      return sock.sendMessage(ctx.jid, {
        image: { url: OWNER_IMG },
        caption: text,
      }, { quoted: msg });
    },

  },
};
