// ============================================================
//   YOUSAF-MD — SAFETY PLUGIN
//   Anti-Delete | Auto-Status View | Auto-Like | Anti-Call | Anti-Link
//   Developer: Muhammad Yousaf Baloch
// ============================================================

'use strict';

const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const SettingsHandler          = require('../lib/SettingsHandler');
const Database                 = require('../lib/Database');
const { normaliseJid }         = require('../lib/PermissionHandler');
const fs                       = require('fs-extra');
const path                     = require('path');

const TEMP = path.resolve('./temp');
fs.ensureDirSync(TEMP);

// ── MESSAGE CACHE for Anti-Delete ─────────────────────────
const msgCache = new Map();

function cacheMessage(msg) {
  const key = msg.key?.id;
  if (!key) return;
  msgCache.set(key, {
    msg,
    cachedAt: Date.now(),
  });

  // Prune old cache entries (>24h)
  if (msgCache.size > 5000) {
    const cutoff = Date.now() - 86400000;
    for (const [k, v] of msgCache) {
      if (v.cachedAt < cutoff) msgCache.delete(k);
    }
  }
}

// ── LINK DETECTION ────────────────────────────────────────
const LINK_REGEX = /(?:https?:\/\/|www\.)[^\s]+|(?:wa\.me\/|chat\.whatsapp\.com\/)[^\s]+/i;

function containsLink(text = '') {
  return LINK_REGEX.test(text);
}

// ── MAIN MESSAGE HOOK ──────────────────────────────────────
async function onMessage(sock, msg, ctx) {
  if (!msg.message) return;

  const senderJid = ctx.sender;

  // Cache every message for Anti-Delete
  cacheMessage(msg);

  // FIXED: use getAdmin() instead of getInstance()
  const adminJid = Database.getAdmin();
  if (!adminJid) return;

  const settings = SettingsHandler.get(adminJid);

  // ── ANTI-LINK ─────────────────────────────────────────
  if (ctx.isGroup && settings.ANTI_LINK && !ctx.isBotAdmin) {
    const text =
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text || '';

    if (containsLink(text)) {
      try {
        await sock.sendMessage(ctx.jid, {
          delete: msg.key,
        });
        await sock.sendMessage(ctx.jid, {
          text:     `🔗 *Anti-Link Protection*\n\nLinks are not allowed in this group, @${senderJid.split('@')[0]}!`,
          mentions: [senderJid],
        });
      } catch {}
    }
  }
}

// ── DELETED MESSAGE HOOK ───────────────────────────────────
async function onDeletedMessage(sock, keys, instanceId) {
  try {
    // FIXED: use getAdmin() instead of getInstance()
    const adminJid = Database.getAdmin();
    if (!adminJid) return;

    const settings = SettingsHandler.get(adminJid);
    if (!settings.ANTI_DELETE) return;

    for (const key of keys) {
      const cached = msgCache.get(key.id);
      if (!cached) continue;

      const { msg } = cached;
      const sender  = msg.key?.participant || msg.key?.remoteJid || '';
      const jid     = msg.key?.remoteJid   || '';

      if (msg.key?.fromMe) continue;

      const msgType = Object.keys(msg.message || {})[0];
      let replyText = `🗑️ *Anti-Delete Alert!*\n\n👤 *From:* @${sender.split('@')[0]}\n📍 *Chat:* ${jid.endsWith('@g.us') ? 'Group' : 'Private'}\n🕒 *Deleted at:* ${new Date().toLocaleTimeString()}`;

      const text =
        msg.message?.conversation ||
        msg.message?.extendedTextMessage?.text;

      if (text) {
        replyText += `\n\n💬 *Deleted Message:*\n${text}`;
        await sock.sendMessage(jid, {
          text:     replyText,
          mentions: [sender],
        });
        continue;
      }

      try {
        const buffer  = await downloadMediaMessage(msg, 'buffer', {});
        const outPath = path.join(TEMP, `del_${Date.now()}`);

        if (msgType === 'imageMessage') {
          await fs.writeFile(outPath + '.jpg', buffer);
          await sock.sendMessage(jid, { image: { url: outPath + '.jpg' }, caption: replyText });
          fs.unlink(outPath + '.jpg').catch(() => {});
        } else if (msgType === 'videoMessage') {
          await fs.writeFile(outPath + '.mp4', buffer);
          await sock.sendMessage(jid, { video: { url: outPath + '.mp4' }, caption: replyText });
          fs.unlink(outPath + '.mp4').catch(() => {});
        } else if (msgType === 'audioMessage') {
          await fs.writeFile(outPath + '.mp3', buffer);
          await sock.sendMessage(jid, { audio: { url: outPath + '.mp3' }, mimetype: 'audio/mp4' });
          await sock.sendMessage(jid, { text: replyText });
          fs.unlink(outPath + '.mp3').catch(() => {});
        } else {
          await sock.sendMessage(jid, { text: replyText });
        }
      } catch {
        await sock.sendMessage(jid, { text: replyText }).catch(() => {});
      }
    }
  } catch (e) {
    console.error('[SAFETY:AntiDelete]', e.message);
  }
}

// ── STATUS VIEW & LIKE HOOK ───────────────────────────────
async function onStatusUpdate(sock, update, instanceId) {
  try {
    // FIXED: use getAdmin() instead of getInstance()
    const adminJid = Database.getAdmin();
    if (!adminJid) return;

    const settings = SettingsHandler.get(adminJid);

    for (const status of update) {
      if (settings.AUTO_STATUS_VIEW) {
        await sock.readMessages([status.key]).catch(() => {});
      }
      if (settings.AUTO_LIKE_STATUS) {
        await sock.sendMessage(status.key.remoteJid, {
          react: { text: '❤️', key: status.key },
        }).catch(() => {});
      }
    }
  } catch (e) {
    console.error('[SAFETY:Status]', e.message);
  }
}

// ── ANTI-CALL HOOK ────────────────────────────────────────
async function onCall(sock, calls, instanceId) {
  try {
    // FIXED: use getAdmin() instead of getInstance()
    const adminJid = Database.getAdmin();
    if (!adminJid) return;

    const settings = SettingsHandler.get(adminJid);
    if (!settings.ANTI_CALL) return;

    for (const call of calls) {
      if (call.status !== 'offer') continue;
      await sock.rejectCall(call.id, call.from).catch(() => {});
      await sock.sendMessage(call.from, {
        text: `📵 *Auto-Rejected*\nSorry, I cannot receive calls. Please send a message instead.\n\n_YOUSAF-MD Anti-Call Protection_`,
      }).catch(() => {});
    }
  } catch (e) {
    console.error('[SAFETY:AntiCall]', e.message);
  }
}

module.exports = {
  onMessage,
  onDeletedMessage,
  onStatusUpdate,
  onCall,
  commands: {},
};
