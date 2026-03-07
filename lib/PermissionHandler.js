// ============================================================
//   YOUSAF-MD — PERMISSION HANDLER
//   Developer: Muhammad Yousaf Baloch
// ============================================================

'use strict';

const Database = require('./Database');
const config   = require('../config');

function normaliseJid(jid = '') {
  return jid.replace(/:.*@/, '@').toLowerCase().trim();
}

function isDeveloper(jid) {
  return normaliseJid(jid) === normaliseJid(config.OWNER_JID);
}

function isBotAdmin(jid) {
  const norm = normaliseJid(jid);
  return isDeveloper(norm) || Database.isAdmin(norm);
}

function isGroupAdmin(participants, jid) {
  const norm = normaliseJid(jid);
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
    message: `╔══════════════════════════╗\n║  🚫 *ACCESS DENIED*        ║\n╚══════════════════════════╝\n\n⚠️ The command *${commandName}* is restricted to the *Bot Admin* only.\n\n👑 Only the paired owner can control this bot.\n\n📞 Contact the bot owner if you need assistance.`,
  };
}

function buildContext(sock, msg, instanceId) {
  const jid       = msg.key?.remoteJid || '';
  const senderRaw = msg.key?.participant || msg.key?.remoteJid || '';
  const sender    = normaliseJid(senderRaw);
  const isGroup   = jid.endsWith('@g.us');
  const fromMe    = msg.key?.fromMe || false;

  return {
    jid,
    sender,
    isGroup,
    fromMe,
    instanceId,
    isBotAdmin:  isBotAdmin(sender),
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
