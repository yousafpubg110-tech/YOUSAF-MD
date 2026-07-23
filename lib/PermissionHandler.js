// ============================================================
//   YOUSAF-MD — PERMISSION HANDLER (ESM)
//   Fixed: isBotAdmin checks config OWNER_JID + Database
//   Developer: Muhammad Yousaf Baloch
// ============================================================

import Database from './Database.js';
import {
  cleanNumber,
  isOwner,
  isDeployer,
  OWNER,
} from '../config.js';

function normaliseJid(jid = '') {
  if (typeof jid !== 'string') return '';
  return jid.replace(/:.*@/, '@').toLowerCase().trim();
}

function isDeveloper(jid) {
  if (!jid) return false;
  return isOwner(jid);
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
        message: `╔══════════════════════════════════════╗\n║  ❌ *Owner Only Command*              ║\n║  This command is locked to the owner  ║\n╚══════════════════════════════════════╝`,
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
        message: `╔══════════════════════════════════════╗\n║  ❌ *Permission Denied*               ║\n║  Only Owner/Deployer can modify       ║\n║  bot settings.                        ║\n╚══════════════════════════════════════╝`,
      };
    }
    return { allowed: true, reason: 'authorized_setting' };
  }

  if (!isBotAdmin(jid)) {
    return {
      allowed: false,
      reason:  'denied',
      message: `╔══════════════════════════════════════╗\n║  ❌ *Access Denied*                   ║\n║  You don't have permission to use     ║\n║  this command.                        ║\n╚══════════════════════════════════════╝`,
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

export {
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

export default {
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
