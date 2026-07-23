// ============================================================
//   YOUSAF-MD — PERMISSION HANDLER
//   Fixed: isBotAdmin checks config OWNER_JID + Database
//   Developer: Muhammad Yousaf Baloch
// ============================================================

'use strict';

const Database = require('./Database');
const config   = require('../config');

function normaliseJid(jid = '') {
  if (typeof jid !== 'string') return '';
  return jid.replace(/:.*@/, '@').toLowerCase().trim();
}

function cleanNumber(jid = '') {
  if (typeof jid !== 'string') return '';
  return jid.replace(/[^0-9]/g, '');
}

function isDeveloper(jid) {
  if (!jid) return false;
  const userNum = cleanNumber(jid);
  if (!userNum) return false;

  const mainOwners = Array.isArray(config.OWNER_JID) 
    ? config.OWNER_JID 
    : [config.OWNER_JID || config.OWNER];

  return mainOwners.some(owner => cleanNumber(owner) === userNum);
}

function isDeployer(jid) {
  if (isDeveloper(jid)) return true;
  if (!jid) return false;
  const userNum = cleanNumber(jid);

  const deployers = Array.isArray(config.DEPLOYER_JID) 
    ? config.DEPLOYER_JID 
    : [config.DEPLOYER_JID || config.DEPLOYER];

  return deployers.some(dep => cleanNumber(dep) === userNum);
}

function isBotAdmin(jid) {
  if (isDeveloper(jid) || isDeployer(jid)) return true;
  const norm = normaliseJid(jid);
  return Database.isAdmin ? Database.isAdmin(norm) : false;
}

function isGroupAdmin(participants = [], jid = '') {
  if (!Array.isArray(participants)) return false;
  const norm        = normaliseJid(jid);
  const participant = participants.find(p => normaliseJid(p.id) === norm);
  return participant?.admin === 'admin' || participant?.admin === 'superadmin';
}

function isBotGroupAdmin(participants, botJid) {
  return isGroupAdmin(participants, botJid);
}

function checkAdminAuth(jid, commandName = '', category = '', isGroup = false, participants = []) {
  const mainOwner  = isDeveloper(jid);
  const tempOwner  = isDeployer(jid);
  const isOwnerOrDeployer = mainOwner || tempOwner;
  const groupAdmin = isGroup ? isGroupAdmin(participants, jid) : false;

  const cmdLower = commandName.toLowerCase();
  const catLower = category.toLowerCase();

  const lockedOwnerCommands = ['setowner', 'changeowner', 'setname', 'setwatermark', 'setownername'];
  if (lockedOwnerCommands.includes(cmdLower)) {
    if (!mainOwner) {
      return {
        allowed: false,
        reason:  'owner_locked',
        message: `\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557\n\u2551  \uD83D\uDEAB *ACCESS DENIED*        \u2551\n\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255D\n\n\u26A0\uFE0F The command *${commandName}* is strictly locked to the *Main Owner* only.\n\n\uD83D\uDC51 Only the main owner can use this command.`,
      };
    }
    return { allowed: true, reason: 'main_owner' };
  }

  const isSettingCommand = catLower.includes('setting') || cmdLower.startsWith('auto') || cmdLower.startsWith('anti') || ['welcome', 'goodbye'].includes(cmdLower);
  if (isSettingCommand) {
    if (!isOwnerOrDeployer && !groupAdmin) {
      return {
        allowed: false,
        reason:  'settings_restricted',
        message: `\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557\n\u2551  \uD83D\uDEAB *ACCESS DENIED*        \u2551\n\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255D\n\n\u26A0\uFE0F Regular group members cannot change bot settings.\n\n\uD83D\uDC51 Only Owner, Deployer, or Group Admins can modify settings.`,
      };
    }
    return { allowed: true, reason: 'authorized_setting' };
  }

  const accessMode = (config.COMMAND_ACCESS_MODE || 'all').toLowerCase();

  if (accessMode === 'owner' && !isOwnerOrDeployer) {
    return {
      allowed: false,
      reason:  'mode_owner_only',
      message: `\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557\n\u2551  \uD83D\uDEAB *ACCESS DENIED*        \u2551\n\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255D\n\n\u26A0\uFE0F The bot is currently restricted to Owner/Deployer use only.`,
    };
  }

  if (accessMode === 'admin' && isGroup && !groupAdmin && !isOwnerOrDeployer) {
    return {
      allowed: false,
      reason:  'mode_admin_only',
      message: `\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557\n\u2551  \uD83D\uDEAB *ACCESS DENIED*        \u2551\n\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255D\n\n\u26A0\uFE0F Bot usage in this group is currently restricted to Group Admins and Owner.`,
    };
  }

  if (!isBotAdmin(jid)) {
    return {
      allowed: false,
      reason:  'denied',
      message: `\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557\n\u2551  \uD83D\uDEAB *ACCESS DENIED*        \u2551\n\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255D\n\n\u26A0\uFE0F The command *${commandName}* is restricted to the *Bot Admin* only.\n\n\uD83D\uDC51 Only the paired owner can use this command.\n\n\uD83D\uDCDE Contact the bot owner if you need assistance.`,
    };
  }

  return { allowed: true, reason: 'public_access' };
}

function buildContext(sock, msg, instanceId, participants = []) {
  const jid       = msg.key?.remoteJid || '';
  const senderRaw = msg.key?.participant || msg.key?.remoteJid || '';
  const sender    = normaliseJid(senderRaw);
  const isGroup   = jid.endsWith('@g.us');
  const fromMe    = msg.key?.fromMe || false;

  const mainOwner  = isDeveloper(sender);
  const tempOwner  = isDeployer(sender);
  const adminStatus = fromMe ? true : (mainOwner || tempOwner || isBotAdmin(sender));
  const groupAdmin = isGroup ? isGroupAdmin(participants, sender) : false;

  return {
    jid,
    sender,
    isGroup,
    fromMe,
    instanceId,
    isBotAdmin:  adminStatus,
    isDeveloper: mainOwner,
    isDeployer:  tempOwner,
    isAdmin:     groupAdmin,
    checkAdmin:  (cmdName, cat) => checkAdminAuth(sender, cmdName, cat, isGroup, participants),
    normalise:   normaliseJid,
  };
}

module.exports = {
  normaliseJid,
  cleanNumber,
  isDeveloper,
  isDeployer,
  isBotAdmin,
  isGroupAdmin,
  isBotGroupAdmin,
  checkAdminAuth,
  buildContext,
};

