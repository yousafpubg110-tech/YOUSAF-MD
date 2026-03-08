// ============================================================
//   YOUSAF-MD — PERMISSION HANDLER
//   Fixed: isBotAdmin checks config OWNER_JID + Database
//   Developer: Muhammad Yousaf Baloch
// ============================================================

'use strict';

const Database = require('./Database');
const config   = require('../config');

function normaliseJid(jid = '') {
  return jid.replace(/:.*@/, '@').toLowerCase().trim();
}

function cleanNumber(jid = '') {
  return jid.replace(/[^0-9]/g, '');
}

function isDeveloper(jid) {
  if (!config.OWNER_JID) return false;
  return cleanNumber(jid) === cleanNumber(config.OWNER_JID);
}

function isBotAdmin(jid) {
  if (isDeveloper(jid)) return true;
  const norm = normaliseJid(jid);
  return Database.isAdmin(norm);
}

function isGroupAdmin(participants, jid) {
  const norm        = normaliseJid(jid);
  const participant = participants.find(p => normaliseJid(p.id) === norm);
  return participant?.admin === 'admin' || participant?.admin === 'superadmin';
}

function isBotGroupAdmin(participants, botJid) {
  return isGroupAdmin(participants, botJid);
}

function checkAdminAuth(jid, commandName) {
  if (isBotAdmin(jid)) {
    return { allowed: true, reason: 'bot_admin' };
  }
  return {
    allowed: false,
    reason:  'denied',
    message: `\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557\n\u2551  \uD83D\uDEAB *ACCESS DENIED*        \u2551\n\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255D\n\n\u26A0\uFE0F The command *${commandName}* is restricted to the *Bot Admin* only.\n\n\uD83D\uDC51 Only the paired owner can use this command.\n\n\uD83D\uDCDE Contact the bot owner if you need assistance.`,
  };
}

function buildContext(sock, msg, instanceId) {
  const jid       = msg.key?.remoteJid || '';
  const senderRaw = msg.key?.participant || msg.key?.remoteJid || '';
  const sender    = normaliseJid(senderRaw);
  const isGroup   = jid.endsWith('@g.us');
  const fromMe    = msg.key?.fromMe || false;

  const adminStatus = fromMe ? true : isBotAdmin(sender);

  return {
    jid,
    sender,
    isGroup,
    fromMe,
    instanceId,
    isBotAdmin:  adminStatus,
    isDeveloper: isDeveloper(sender),
    checkAdmin:  (cmd) => checkAdminAuth(sender, cmd),
    normalise:   normaliseJid,
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
