// ============================================================
//   YOUSAF-MD — SETTINGS PLUGIN
//   Added: .public and .private commands
//   Developer: Muhammad Yousaf Baloch
// ============================================================

'use strict';

const SettingsHandler = require('../lib/SettingsHandler');

module.exports = {
  commands: {

    // ── .settings ─────────────────────────────────────────
    async settings(sock, msg, ctx) {
      const auth = ctx.checkAdmin('.settings');
      if (!auth.allowed) {
        return sock.sendMessage(ctx.jid, { text: auth.message }, { quoted: msg });
      }
      const menu = SettingsHandler.buildMenu(ctx.sender);
      return sock.sendMessage(ctx.jid, { text: menu }, { quoted: msg });
    },

    // ── .set [feature] [on/off] ───────────────────────────
    async set(sock, msg, ctx, args) {
      const auth = ctx.checkAdmin('.set');
      if (!auth.allowed) {
        return sock.sendMessage(ctx.jid, { text: auth.message }, { quoted: msg });
      }
      if (args.length < 2) {
        return sock.sendMessage(ctx.jid, {
          text: '❌ *Usage:* .set [feature] [on/off]\n\n*Example:* .set antidelete on',
        }, { quoted: msg });
      }
      const result = SettingsHandler.applyCommand(ctx.sender, args);
      return sock.sendMessage(ctx.jid, { text: result.message }, { quoted: msg });
    },

    // ── .public — Bot کو سب کے لیے کھولیں ────────────────
    async public(sock, msg, ctx) {
      const auth = ctx.checkAdmin('.public');
      if (!auth.allowed) {
        return sock.sendMessage(ctx.jid, { text: auth.message }, { quoted: msg });
      }
      const settings      = SettingsHandler.get(ctx.sender);
      settings.BOT_MODE   = true;
      SettingsHandler.save(ctx.sender, settings);
      return sock.sendMessage(ctx.jid, {
        text: `🌐 *Bot Mode Changed!*\n\n✅ Bot اب *PUBLIC* ہے\nسب لوگ commands use کر سکتے ہیں۔`,
      }, { quoted: msg });
    },

    // ── .private — Bot صرف Admin کے لیے ──────────────────
    async private(sock, msg, ctx) {
      const auth = ctx.checkAdmin('.private');
      if (!auth.allowed) {
        return sock.sendMessage(ctx.jid, { text: auth.message }, { quoted: msg });
      }
      const settings      = SettingsHandler.get(ctx.sender);
      settings.BOT_MODE   = false;
      SettingsHandler.save(ctx.sender, settings);
      return sock.sendMessage(ctx.jid, {
        text: `🔒 *Bot Mode Changed!*\n\n✅ Bot اب *PRIVATE* ہے\nصرف Bot Admin commands use کر سکتا ہے۔`,
      }, { quoted: msg });
    },

    // ── .antidel ──────────────────────────────────────────
    async antidel(sock, msg, ctx) {
      const auth = ctx.checkAdmin('.antidel');
      if (!auth.allowed) {
        return sock.sendMessage(ctx.jid, { text: auth.message }, { quoted: msg });
      }
      const newVal = SettingsHandler.toggle(ctx.sender, 'ANTI_DELETE');
      return sock.sendMessage(ctx.jid, {
        text: `🗑️ *Anti-Delete* → ${newVal ? '🟢 ENABLED' : '🔴 DISABLED'}`,
      }, { quoted: msg });
    },

    // ── .antical ──────────────────────────────────────────
    async antical(sock, msg, ctx) {
      const auth = ctx.checkAdmin('.antical');
      if (!auth.allowed) {
        return sock.sendMessage(ctx.jid, { text: auth.message }, { quoted: msg });
      }
      const newVal = SettingsHandler.toggle(ctx.sender, 'ANTI_CALL');
      return sock.sendMessage(ctx.jid, {
        text: `📵 *Anti-Call* → ${newVal ? '🟢 ENABLED' : '🔴 DISABLED'}`,
      }, { quoted: msg });
    },

    // ── .antilink ─────────────────────────────────────────
    async antilink(sock, msg, ctx) {
      const auth = ctx.checkAdmin('.antilink');
      if (!auth.allowed) {
        return sock.sendMessage(ctx.jid, { text: auth.message }, { quoted: msg });
      }
      const newVal = SettingsHandler.toggle(ctx.sender, 'ANTI_LINK');
      return sock.sendMessage(ctx.jid, {
        text: `🔗 *Anti-Link* → ${newVal ? '🟢 ENABLED' : '🔴 DISABLED'}`,
      }, { quoted: msg });
    },

    // ── .autolike ─────────────────────────────────────────
    async autolike(sock, msg, ctx) {
      const auth = ctx.checkAdmin('.autolike');
      if (!auth.allowed) {
        return sock.sendMessage(ctx.jid, { text: auth.message }, { quoted: msg });
      }
      const newVal = SettingsHandler.toggle(ctx.sender, 'AUTO_LIKE_STATUS');
      return sock.sendMessage(ctx.jid, {
        text: `❤️ *Auto-Like Status* → ${newVal ? '🟢 ENABLED' : '🔴 DISABLED'}`,
      }, { quoted: msg });
    },

    // ── .autoview ─────────────────────────────────────────
    async autoview(sock, msg, ctx) {
      const auth = ctx.checkAdmin('.autoview');
      if (!auth.allowed) {
        return sock.sendMessage(ctx.jid, { text: auth.message }, { quoted: msg });
      }
      const newVal = SettingsHandler.toggle(ctx.sender, 'AUTO_STATUS_VIEW');
      return sock.sendMessage(ctx.jid, {
        text: `👁️ *Auto-Status View* → ${newVal ? '🟢 ENABLED' : '🔴 DISABLED'}`,
      }, { quoted: msg });
    },

  },
};
        
