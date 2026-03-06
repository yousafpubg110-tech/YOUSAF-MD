// ============================================================
//   YOUSAF-MD — GROUP TOOLS PLUGIN
//   .tagall .hidetag .kick .add .promote .demote .groupinfo
//   Developer: Muhammad Yousaf Baloch
// ============================================================

'use strict';

const { isGroupAdmin, isBotGroupAdmin, normaliseJid } = require('../lib/PermissionHandler');

async function getGroupMeta(sock, jid) {
  return sock.groupMetadata(jid);
}

module.exports = {
  commands: {

    // ── .tagall ──────────────────────────────────────────
    async tagall(sock, msg, ctx, args, body) {
      if (!ctx.isGroup) return sock.sendMessage(ctx.jid, { text: '❌ This command is for groups only.' }, { quoted: msg });

      const meta        = await getGroupMeta(sock, ctx.jid);
      const participants = meta.participants;
      const mentions     = participants.map(p => p.id);
      const text         = body
        ? `📢 *${body}*\n\n` + mentions.map(id => `@${id.split('@')[0]}`).join(' ')
        : `📢 *Tag All* — Everyone mentioned!\n\n` + mentions.map(id => `@${id.split('@')[0]}`).join(' ');

      return sock.sendMessage(ctx.jid, { text, mentions }, { quoted: msg });
    },

    // ── .hidetag ─────────────────────────────────────────
    async hidetag(sock, msg, ctx, args, body) {
      if (!ctx.isGroup) return sock.sendMessage(ctx.jid, { text: '❌ Groups only.' }, { quoted: msg });

      const meta        = await getGroupMeta(sock, ctx.jid);
      const mentions     = meta.participants.map(p => p.id);
      const text         = body || '📢 Attention everyone!';

      return sock.sendMessage(ctx.jid, { text, mentions }, { quoted: msg });
    },

    // ── .kick ─────────────────────────────────────────────
    async kick(sock, msg, ctx) {
      if (!ctx.isGroup) return sock.sendMessage(ctx.jid, { text: '❌ Groups only.' }, { quoted: msg });
      if (!ctx.isBotAdmin) {
        const auth = ctx.checkAdmin('.kick');
        return sock.sendMessage(ctx.jid, { text: auth.message }, { quoted: msg });
      }

      const meta = await getGroupMeta(sock, ctx.jid);
      if (!isBotGroupAdmin(meta.participants, sock.user?.id)) {
        return sock.sendMessage(ctx.jid, { text: '❌ I need to be a group admin to kick members.' }, { quoted: msg });
      }

      const target = msg.message?.extendedTextMessage?.contextInfo?.participant
        || (msg.message?.extendedTextMessage?.text?.match(/@(\d+)/)?.[1] && `${msg.message.extendedTextMessage.text.match(/@(\d+)/)[1]}@s.whatsapp.net`);

      if (!target) return sock.sendMessage(ctx.jid, { text: '❌ Reply to a message or mention the user to kick.' }, { quoted: msg });

      await sock.groupParticipantsUpdate(ctx.jid, [target], 'remove');
      return sock.sendMessage(ctx.jid, {
        text: `✅ @${target.split('@')[0]} has been removed from the group.`,
        mentions: [target],
      }, { quoted: msg });
    },

    // ── .add ──────────────────────────────────────────────
    async add(sock, msg, ctx, args) {
      if (!ctx.isGroup) return sock.sendMessage(ctx.jid, { text: '❌ Groups only.' }, { quoted: msg });
      if (!ctx.isBotAdmin) {
        const auth = ctx.checkAdmin('.add');
        return sock.sendMessage(ctx.jid, { text: auth.message }, { quoted: msg });
      }

      const meta = await getGroupMeta(sock, ctx.jid);
      if (!isBotGroupAdmin(meta.participants, sock.user?.id)) {
        return sock.sendMessage(ctx.jid, { text: '❌ I need to be a group admin to add members.' }, { quoted: msg });
      }

      const number = args[0]?.replace(/[^0-9]/g, '');
      if (!number) return sock.sendMessage(ctx.jid, { text: '❌ Usage: .add [number with country code]' }, { quoted: msg });

      const jid = `${number}@s.whatsapp.net`;
      await sock.groupParticipantsUpdate(ctx.jid, [jid], 'add');
      return sock.sendMessage(ctx.jid, {
        text: `✅ @${number} has been added to the group.`,
        mentions: [jid],
      }, { quoted: msg });
    },

    // ── .promote ──────────────────────────────────────────
    async promote(sock, msg, ctx) {
      if (!ctx.isGroup) return sock.sendMessage(ctx.jid, { text: '❌ Groups only.' }, { quoted: msg });
      if (!ctx.isBotAdmin) {
        const auth = ctx.checkAdmin('.promote');
        return sock.sendMessage(ctx.jid, { text: auth.message }, { quoted: msg });
      }

      const target = msg.message?.extendedTextMessage?.contextInfo?.participant;
      if (!target) return sock.sendMessage(ctx.jid, { text: '❌ Reply to a message to promote that user.' }, { quoted: msg });

      await sock.groupParticipantsUpdate(ctx.jid, [target], 'promote');
      return sock.sendMessage(ctx.jid, {
        text: `⬆️ @${target.split('@')[0]} has been promoted to admin!`,
        mentions: [target],
      }, { quoted: msg });
    },

    // ── .demote ───────────────────────────────────────────
    async demote(sock, msg, ctx) {
      if (!ctx.isGroup) return sock.sendMessage(ctx.jid, { text: '❌ Groups only.' }, { quoted: msg });
      if (!ctx.isBotAdmin) {
        const auth = ctx.checkAdmin('.demote');
        return sock.sendMessage(ctx.jid, { text: auth.message }, { quoted: msg });
      }

      const target = msg.message?.extendedTextMessage?.contextInfo?.participant;
      if (!target) return sock.sendMessage(ctx.jid, { text: '❌ Reply to a message to demote that user.' }, { quoted: msg });

      await sock.groupParticipantsUpdate(ctx.jid, [target], 'demote');
      return sock.sendMessage(ctx.jid, {
        text: `⬇️ @${target.split('@')[0]} has been demoted.`,
        mentions: [target],
      }, { quoted: msg });
    },

    // ── .groupinfo ────────────────────────────────────────
    async groupinfo(sock, msg, ctx) {
      if (!ctx.isGroup) return sock.sendMessage(ctx.jid, { text: '❌ Groups only.' }, { quoted: msg });

      const meta    = await getGroupMeta(sock, ctx.jid);
      const admins  = meta.participants.filter(p => p.admin).map(p => `• @${p.id.split('@')[0]}`).join('\n');
      const created = new Date(meta.creation * 1000).toLocaleDateString();

      const text = `
╔══════════════════════╗
║  👥 *GROUP INFO*       ║
╚══════════════════════╝

📛 *Name:* ${meta.subject}
🆔 *ID:* ${ctx.jid}
📅 *Created:* ${created}
👥 *Members:* ${meta.participants.length}
🔒 *Restrict:* ${meta.restrict ? 'Yes' : 'No'}
📝 *Announce:* ${meta.announce ? 'Yes' : 'No'}

👑 *Admins:*
${admins || 'None'}

📌 *Description:*
${meta.desc || 'No description set.'}
      `.trim();

      return sock.sendMessage(ctx.jid, {
        text,
        mentions: meta.participants.filter(p => p.admin).map(p => p.id),
      }, { quoted: msg });
    },
  },
};

