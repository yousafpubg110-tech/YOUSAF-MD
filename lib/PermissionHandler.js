// ============================================================
//   YOUSAF-MD — PERMISSION HANDLER
//   Dynamic authority detection — Paired Number = God Admin
//   Developer: Muhammad Yousaf Baloch
// ============================================================

'use strict';

const Database = require('./Database');
const config   = require('../config');

/**
 * Normalise a JID to bare JID (removes device suffix)
 */
function normaliseJid(jid = '') {
  return jid.replace(/:.*@/, '@').toLowerCase().trim();
}

/**
 * Check if a JID is the global developer (hardcoded)
 */
function isDeveloper(jid) {
  return normaliseJid(jid) === normaliseJid(config.OWNER_JID);
}

/**
 * Check if jid is the Bot Admin for their paired instance
 */
function isBotAdmin(jid) {
  const norm = normaliseJid(jid);
  return isDeveloper(norm) || Database.isAdmin(norm);
}

/**
 * Check if a participant is a WhatsApp Group Admin
 */
function isGroupAdmin(participants, jid) {
  const norm = normaliseJid(jid);
  const participant = participants.find(p => normaliseJid(p.id) === norm);
  return participant?.admin === 'admin' || participant?.admin === 'superadmin';
}

/**
 * Check if the bot itself is a group admin
 */
function isBotGroupAdmin(participants, botJid) {
  return isGroupAdmin(participants, botJid);
}

/**
 * Full authority check for admin commands
 * Returns: { allowed: bool, reason: string }
 */
function checkAdminAuth(jid, commandName) {
  if (isBotAdmin(jid)) {
    return { allowed: true, reason: 'bot_admin' };
  }
  return {
    allowed: false,
    reason:  'denied',
    message: `╔══════════════════════════╗\n║  🚫 *ACCESS DENIED*        ║\n╚══════════════════════════╝\n\n⚠️ The command *${commandName}* is restricted to the *Bot Admin* only.\n\n👑 Only *Muhammad Yousaf Baloch* (the paired owner) can control this bot's configuration.\n\n📞 Contact the bot owner if you need assistance.`,
  };
}

/**
 * Build a complete context object for every message
 */
function buildContext(sock, msg, instanceId) {
  const jid         = msg.key?.remoteJid || '';
  const senderRaw   = msg.key?.participant || msg.key?.remoteJid || '';
  const sender      = normaliseJid(senderRaw);
  const isGroup     = jid.endsWith('@g.us');
  const fromMe      = msg.key?.fromMe || false;

  return {
    jid,
    sender,
    isGroup,
    fromMe,
    instanceId,
    isBotAdmin:    isBotAdmin(sender),
    isDeveloper:   isDeveloper(sender),
    checkAdmin:    (cmd) => checkAdminAuth(sender, cmd),
    normalise:     normaliseJid,
  };
}

module.exports = {
  normaliseJid,
  isDeveloper,
  isBotAdmin,
  isGroupAdmin,
  isBotGroupAdmin,
  checkAdminAuth,
  buildContext,
};
