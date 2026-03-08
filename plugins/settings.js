// ============================================================
//   YOUSAF-MD — SETTINGS PLUGIN
//   Developer: Muhammad Yousaf Baloch
// ============================================================

'use strict';

const SettingsHandler = require('../lib/SettingsHandler');

module.exports = {
  commands: {

    async settings(sock, msg, ctx) {
      const menu = SettingsHandler.buildMenu(ctx.sender);
      return sock.sendMessage(ctx.jid, { text: menu }, { quoted: msg });
    },

    async set(sock, msg, ctx, args) {
      if (args.length < 2) {
        return sock.sendMessage(ctx.jid, {
          text: 'Usage: .set [feature] [on/off]\nExample: .set antidelete on',
        }, { quoted: msg });
      }
      const result = SettingsHandler.applyCommand(ctx.sender, args);
      return sock.sendMessage(ctx.jid, { text: result.message }, { quoted: msg });
    },

    async antidel(sock, msg, ctx) {
      const newVal = SettingsHandler.toggle(ctx.sender, 'ANTI_DELETE');
      return sock.sendMessage(ctx.jid, {
        text: `Anti-Delete → ${newVal ? 'ENABLED' : 'DISABLED'}`,
      }, { quoted: msg });
    },

    async antical(sock, msg, ctx) {
      const newVal = SettingsHandler.toggle(ctx.sender, 'ANTI_CALL');
      return sock.sendMessage(ctx.jid, {
        text: `Anti-Call → ${newVal ? 'ENABLED' : 'DISABLED'}`,
      }, { quoted: msg });
    },

    async antilink(sock, msg, ctx) {
      const newVal = SettingsHandler.toggle(ctx.sender, 'ANTI_LINK');
      return sock.sendMessage(ctx.jid, {
        text: `Anti-Link → ${newVal ? 'ENABLED' : 'DISABLED'}`,
      }, { quoted: msg });
    },

    async autolike(sock, msg, ctx) {
      const newVal = SettingsHandler.toggle(ctx.sender, 'AUTO_LIKE_STATUS');
      return sock.sendMessage(ctx.jid, {
        text: `Auto-Like → ${newVal ? 'ENABLED' : 'DISABLED'}`,
      }, { quoted: msg });
    },

    async autoview(sock, msg, ctx) {
      const newVal = SettingsHandler.toggle(ctx.sender, 'AUTO_STATUS_VIEW');
      return sock.sendMessage(ctx.jid, {
        text: `Auto-View → ${newVal ? 'ENABLED' : 'DISABLED'}`,
      }, { quoted: msg });
    },

  },
};
