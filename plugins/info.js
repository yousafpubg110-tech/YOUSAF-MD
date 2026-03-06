// ============================================================
//   YOUSAF-MD — INFO PLUGIN
//   .menu .ping .info .owner
//   Developer: Muhammad Yousaf Baloch
// ============================================================

'use strict';

const config   = require('../config');
const Database = require('../lib/Database');

module.exports = {
  commands: {

    async menu(sock, msg, ctx) {
      const menuText = config.MENU_TEXT(config.PREFIX);
      return sock.sendMessage(ctx.jid, { text: menuText }, { quoted: msg });
    },

    async ping(sock, msg, ctx) {
      const start = Date.now();
      const sent  = await sock.sendMessage(ctx.jid, { text: '🏓 Pinging...' }, { quoted: msg });
      const ms    = Date.now() - start;
      await sock.sendMessage(ctx.jid, {
        text: `🏓 *Pong!*\n\n⚡ Response Time: *${ms}ms*\n🤖 Bot: *${config.BOT_NAME} v${config.BOT_VERSION}*\n✅ Status: *Online & Active*`,
      }, { quoted: msg });
    },

    async info(sock, msg, ctx) {
      const stats  = Database.stats();
      const uptime = process.uptime();
      const hours  = Math.floor(uptime / 3600);
      const mins   = Math.floor((uptime % 3600) / 60);
      const secs   = Math.floor(uptime % 60);

      const text = `
╔══════════════════════════════╗
║    🤖 *${config.BOT_NAME} v${config.BOT_VERSION}*     ║
╚══════════════════════════════╝

📊 *System Information*
━━━━━━━━━━━━━━━━━━━━━━
⚡ *Uptime:* ${hours}h ${mins}m ${secs}s
👥 *Active Instances:* ${stats.instances}
💾 *DB Size:* ${(stats.size / 1024).toFixed(2)} KB
🖥️ *Memory:* ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB

👑 *Developer:* ${config.OWNER_NAME}
📞 *Contact:* +${config.OWNER_NUMBER}

🔗 *Official Links:*
   📦 ${config.LINKS.GITHUB}
   🎵 ${config.LINKS.TIKTOK}
   📺 ${config.LINKS.YOUTUBE}
   📢 ${config.LINKS.WHATSAPP}
━━━━━━━━━━━━━━━━━━━━━━
_Zero-Config WhatsApp Bot Platform_
      `.trim();

      return sock.sendMessage(ctx.jid, { text }, { quoted: msg });
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
          contacts:    [{ vcard }],
        },
      }, { quoted: msg });

      return sock.sendMessage(ctx.jid, {
        text: `👑 *Bot Owner & Developer*\n\n*${config.OWNER_NAME}*\n📞 +${config.OWNER_NUMBER}\n\n🔗 *Socials:*\n${config.LINKS.GITHUB}\n${config.LINKS.TIKTOK}\n${config.LINKS.YOUTUBE}`,
      }, { quoted: msg });
    },
  },
};

