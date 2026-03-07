// ============================================================
//   YOUSAF-MD — MENU PLUGIN
//   .menu command
//   Developer: Muhammad Yousaf Baloch
// ============================================================

'use strict';

const config = require('../config');

// Uptime helper
function getUptime() {
  const uptime = process.uptime();
  const h      = Math.floor(uptime / 3600);
  const m      = Math.floor((uptime % 3600) / 60);
  const s      = Math.floor(uptime % 60);
  return `${h > 0 ? h + 'h ' : ''}${m}m ${s}s`;
}

const MENU_TEXT = (prefix) => `
꧁༺ 🤖 *YOUSAF-MD* 🤖 ༻꧂

┌─────────────────────┐
│ 👑 *Owner :* Mr Yousaf Baloch
│ ⚡ *Version :* ${config.BOT_VERSION}
│ 📜 *Commands :* 100+
│ 🌐 *Platform :* Multi-Device
│ 📦 *Prefix :* ${prefix}
│ ⏱️ *Runtime :* ${getUptime()}
│ 🔥 *Status :* Active & Online
└─────────────────────┘

✦━━━━『 🤖 *AI TOOLS* 』━━━━✦
╔══════════════════════╗
║ ✧ ɢᴘᴛ
║ ✧ ɢᴇᴍɪɴɪ
║ ✧ ᴄʜᴀᴛɢᴘᴛ
║ ✧ ᴄʟᴀᴜᴅᴇ
║ ✧ ᴅᴇᴇᴘsᴇᴇᴋ
║ ✧ ᴄᴏᴘɪʟᴏᴛ
║ ✧ ʙᴀʀᴅ
║ ✧ ɪᴍᴀɢɪɴᴇ
║ ✧ ᴄᴏᴅᴇᴀɪ
║ ✧ ᴀɪ
╚══════════════════════╝

✦━━━━『 ⬇️ *DOWNLOADERS* 』━━━━✦
╔══════════════════════╗
║ ✧ ᴘʟᴀʏ
║ ✧ sᴏɴɢ
║ ✧ ᴀᴜᴅɪᴏ
║ ✧ ᴠɪᴅᴇᴏ
║ ✧ ʏᴛ
║ ✧ ʏᴛᴠ
║ ✧ ʏᴛᴍᴘ3
║ ✧ ᴛɪᴋᴛᴏᴋ
║ ✧ ᴛɪᴋᴛᴏᴋ2
║ ✧ ᴛᴛᴍᴘ3
║ ✧ ғʙ
║ ✧ ɪɢ
║ ✧ ɪɢᴅʟ
║ ✧ ɢᴅʀɪᴠᴇ
║ ✧ ᴘɪɴᴛᴇʀᴇsᴛ
║ ✧ ᴄᴀᴘᴄᴜᴛ
╚══════════════════════╝

✦━━━━『 🎨 *MEDIA & STICKERS* 』━━━━✦
╔══════════════════════╗
║ ✧ sᴛɪᴄᴋᴇʀ
║ ✧ ᴛᴛᴘ
║ ✧ ᴀᴛᴛᴘ
║ ✧ ᴇɴʜᴀɴᴄᴇ
║ ✧ ᴛᴏɪᴍɢ
║ ✧ ɪᴍɢ
║ ✧ ɪᴍɢ2
║ ✧ ʀᴇᴍᴏᴠᴇʙɢ
║ ✧ ʀᴇᴍɪɴɪ
║ ✧ ᴄᴀᴘᴛɪᴏɴ
╚══════════════════════╝

✦━━━━『 👥 *GROUP TOOLS* 』━━━━✦
╔══════════════════════╗
║ ✧ ᴛᴀɢᴀʟʟ
║ ✧ ʜɪᴅᴇᴛᴀɢ
║ ✧ ᴛᴀɢᴀᴅᴍɪɴs
║ ✧ ᴋɪᴄᴋ
║ ✧ ᴀᴅᴅ
║ ✧ ᴘʀᴏᴍᴏᴛᴇ
║ ✧ ᴅᴇᴍᴏᴛᴇ
║ ✧ ɢʀᴏᴜᴘɪɴғᴏ
║ ✧ ɪɴᴠɪᴛᴇ
║ ✧ ʀᴇᴠᴏᴋᴇ
║ ✧ ʟɪɴᴋ
║ ✧ ᴍᴜᴛᴇ
║ ✧ ᴜɴᴍᴜᴛᴇ
║ ✧ ᴘᴏʟʟ
║ ✧ ɢᴄᴘᴘ
║ ✧ ᴜᴘᴅᴀᴛᴇɢɴᴀᴍᴇ
║ ✧ ᴜᴘᴅᴀᴛᴇɢᴅᴇsᴄ
║ ✧ ʙʀᴏᴀᴅᴄᴀsᴛ
║ ✧ ᴀᴄᴄᴇᴘᴛᴀʟʟ
║ ✧ ʀᴇᴊᴇᴄᴛᴀʟʟ
╚══════════════════════╝

✦━━━━『 🔧 *UTILITY TOOLS* 』━━━━✦
╔══════════════════════╗
║ ✧ ɢᴏᴏɢʟᴇ
║ ✧ ᴡɪᴋɪ
║ ✧ ᴛᴛs
║ ✧ ᴘʟᴀʏsᴛᴏʀᴇ
║ ✧ ᴡᴇᴀᴛʜᴇʀ
║ ✧ ᴄᴀʟᴄ
║ ✧ ᴛɪᴍᴇ
║ ✧ ᴅᴀᴛᴇ
║ ✧ ɴᴇᴡs
║ ✧ ᴅᴇғɪɴᴇ
║ ✧ ᴛʀᴀɴsʟᴀᴛᴇ
║ ✧ ss
║ ✧ ɪᴅ
║ ✧ ʙɪɴᴀʀʏ
║ ✧ ʙᴀsᴇ64
║ ✧ ᴛᴏᴜʀʟ
║ ✧ ᴡsᴛᴀʟᴋ
║ ✧ sɪᴍᴅᴀᴛᴀ
╚══════════════════════╝

✦━━━━『 🎵 *AUDIO EFFECTS* 』━━━━✦
╔══════════════════════╗
║ ✧ ʙᴀss
║ ✧ sʟᴏᴡ
║ ✧ ғᴀsᴛ
║ ✧ ʀᴏʙᴏᴛ
║ ✧ ʀᴇᴠᴇʀsᴇ
║ ✧ ɴɪɢʜᴛᴄᴏʀᴇ
║ ✧ ᴄʜɪᴘᴍᴜɴᴋ
║ ✧ ᴅᴇᴇᴘ
║ ✧ sᴍᴏᴏᴛʜ
║ ✧ ʀᴀᴅɪᴏ
╚══════════════════════╝

✦━━━━『 😂 *FUN & GAMES* 』━━━━✦
╔══════════════════════╗
║ ✧ ᴊᴏᴋᴇ
║ ✧ sʜᴀʏᴀʀɪ
║ ✧ ʀᴏᴀsᴛ
║ ✧ ғʟɪʀᴛ
║ ✧ ǫᴜᴏᴛᴇ
║ ✧ 8ʙᴀʟʟ
║ ✧ ʟᴏᴠᴇᴛᴇsᴛ
║ ✧ ᴅᴀʀᴇ
║ ✧ ᴛʀᴜᴛʜ
║ ✧ ᴄᴏᴍᴘᴀᴛɪʙɪʟɪᴛʏ
║ ✧ sʜɪᴘ
║ ✧ ᴀᴜʀᴀ
║ ✧ ᴍᴏᴛɪᴠᴀᴛᴇ
║ ✧ ᴄᴏɪɴғʟɪᴘ
║ ✧ ʀᴏʟʟ
║ ✧ ᴘɪᴄᴋᴜᴘ
║ ✧ ᴋɪss
║ ✧ ʜᴜɢ
║ ✧ sʟᴀᴘ
║ ✧ ᴅᴀɴᴄᴇ
╚══════════════════════╝

✦━━━━『 🔍 *SEARCH* 』━━━━✦
╔══════════════════════╗
║ ✧ ʏᴛs
║ ✧ ʏᴛsᴛᴀʟᴋ
║ ✧ ᴛɪᴋᴛᴏᴋsᴇᴀʀᴄʜ
║ ✧ xsᴛᴀʟᴋ
║ ✧ ɢᴏᴏɢʟᴇ
║ ✧ ᴍᴏᴠɪᴇɪɴғᴏ
╚══════════════════════╝

✦━━━━『 🛡️ *SAFETY* 』━━━━✦
╔══════════════════════╗
║ ✧ ᴀɴᴛɪᴅᴇʟ
║ ✧ ᴀɴᴛɪᴄᴀʟ
║ ✧ ᴀɴᴛɪʟɪɴᴋ
║ ✧ ᴀᴜᴛᴏsᴛᴀᴛᴜs
║ ✧ ᴀᴜᴛᴏʟɪᴋᴇ
║ ✧ ᴀᴜᴛᴏʀᴇᴀᴄᴛ
║ ✧ ᴡᴇʟᴄᴏᴍᴇ
║ ✧ ɢᴏᴏᴅʙʏᴇ
╚══════════════════════╝

✦━━━━『 ⚙️ *SETTINGS* 』━━━━✦
╔══════════════════════╗
║ ✧ sᴇᴛᴛɪɴɢs
║ ✧ sᴇᴛ
║ ✧ ᴘʀᴇғɪx
║ ✧ ʙᴏᴛɴᴀᴍᴇ
║ ✧ ᴅᴇsᴄʀɪᴘᴛɪᴏɴ
║ ✧ ᴍᴏᴅᴇ
║ ✧ ᴀᴜᴛᴏᴠɪᴇᴡ
║ ✧ ᴀᴜᴛᴏᴛʏᴘɪɴɢ
║ ✧ ᴏɴʟɪɴᴇ
╚══════════════════════╝

✦━━━━『 👑 *OWNER ONLY* 』━━━━✦
╔══════════════════════╗
║ ✧ ʙʟᴏᴄᴋ
║ ✧ ᴜɴʙʟᴏᴄᴋ
║ ✧ ʙᴀɴ
║ ✧ ᴜɴʙᴀɴ
║ ✧ ʟᴇᴀᴠᴇ
║ ✧ sᴛᴀᴛᴜs
║ ✧ ғᴏʀᴡᴀʀᴅ
║ ✧ sᴜᴅᴏ
║ ✧ ᴅᴇʟsᴜᴅᴏ
╚══════════════════════╝

✦━━━━『 ℹ️ *MAIN* 』━━━━✦
╔══════════════════════╗
║ ✧ ᴍᴇɴᴜ
║ ✧ ᴘɪɴɢ
║ ✧ ɪɴғᴏ
║ ✧ ᴏᴡɴᴇʀ
║ ✧ ᴀʟɪᴠᴇ
║ ✧ ᴜᴘᴛɪᴍᴇ
║ ✧ ʀᴇᴘᴏ
╚══════════════════════╝

❖──────────────────────❖
> *© Powered By Mr Yousaf Baloch* 🇵🇰
❖──────────────────────❖
`.trim();

module.exports = {
  commands: {

    async menu(sock, msg, ctx) {
      // Try with image first, fallback to text only if image fails
      try {
        return await sock.sendMessage(ctx.jid, {
          image:   { url: 'https://raw.githubusercontent.com/yousafpubg110-tech/YOUSAF-MD/main/assets/menu.jpg' },
          caption: MENU_TEXT(config.PREFIX),
          buttons: [
            {
              buttonId:   'whatsapp_channel',
              buttonText: { displayText: '📢 Join WhatsApp Channel' },
              type:       1,
              nativeFlowInfo: {
                name:       'open_url',
                paramsJson: JSON.stringify({ url: config.LINKS.WHATSAPP }),
              },
            },
          ],
          headerType: 4,
        }, { quoted: msg });
      } catch {
        // Fallback — text only if image fails
        return sock.sendMessage(ctx.jid, {
          text: MENU_TEXT(config.PREFIX),
        }, { quoted: msg });
      }
    },

  },
};
