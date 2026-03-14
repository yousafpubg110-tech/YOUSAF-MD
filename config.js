/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║            YOUSAF-MD — CORE CONFIGURATION                       ║
 * ║            Created by: Muhammad Yousaf Baloch                   ║
 * ║            Version: 2.0.0  |  500+ Commands                     ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import { config } from 'dotenv';
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import { join } from 'path';

config();

export const OWNER = Object.freeze({
  NAME:           'Yousaf Baloch',
  FULL_NAME:      'Muhammad Yousaf Baloch',
  NUMBER:         '923710636110',
  JID:            '923710636110@s.whatsapp.net',
  BOT_NAME:       'YOUSAF-MD',
  VERSION:        '2.0.0',
  YEAR:           '2026',
  COUNTRY:        'Pakistan',
  YOUTUBE:        'https://www.youtube.com/@Yousaf_Baloch_Tech',
  TIKTOK:         'https://tiktok.com/@loser_boy.110',
  CHANNEL:        'https://whatsapp.com/channel/0029Vb3Uzps6buMH2RvGef0j',
  GITHUB:         'https://github.com/yousafpubg110-tech',
  WHATSAPP:       'https://wa.me/923710636110',
  REPO:           'https://github.com/yousafpubg110-tech/YOUSAF-MD',
  REPO_BALOCH_MD: 'https://github.com/yousafpubg110-tech/YOUSAF-BALOCH-MD',
});

function loadDeployers() {
  const raw = process.env.DEPLOYER_NUMBER || '';
  if (!raw.trim()) return [];
  return raw
    .split(',')
    .map(n => n.trim().replace(/[^0-9]/g, ''))
    .filter(n => n.length >= 7 && n.length <= 15);
}

export const DEPLOYERS = Object.freeze(loadDeployers());

export const OWNER_ONLY_COMMANDS = Object.freeze([
  'eval', 'exec', 'shell',
]);

export const ADMIN_COMMANDS = Object.freeze([
  'setting', 'settings',
  'antilink', 'antiviewonce', 'antispam', 'antibad', 'anticall', 'antidelete', 'antivv',
  'autoread', 'autostatus', 'autoreact', 'autolike', 'autotyping', 'autorecording', 'autoreply',
  'setwelcome', 'setgoodbye', 'welcome', 'goodbye',
  'mute', 'unmute', 'close', 'open', 'groupopen', 'groupclose',
  'warn', 'unwarn', 'kick', 'add', 'promote', 'demote',
  'linkgroup', 'revoke', 'invite', 'antiabuse',
]);

export const DEPLOYER_ONLY_COMMANDS = Object.freeze([
  'config', 'configure', 'set',
  'restart', 'shutdown',
  'block', 'unblock', 'ban', 'unban',
  'broadcast', 'bc', 'update',
  'setprefix', 'setmode', 'setname',
  'join', 'leave',
]);

function loadSessionId() {
  if (process.env.SESSION_ID?.trim()) return process.env.SESSION_ID.trim();
  const f = './session/SESSION_ID';
  if (existsSync(f)) {
    const val = readFileSync(f, 'utf8').trim();
    if (val && val !== 'YOUR_SESSION_ID_HERE') return val;
  }
  return '';
}

export const SESSION_ID = loadSessionId();

function envBool(key, defaultVal = false) {
  const val = process.env[key];
  if (val === undefined || val === '') return defaultVal;
  return val === 'true';
}

export const CONFIG = {
  SESSION_ID:       SESSION_ID,
  PREFIX:           process.env.PREFIX     || '.',
  MODE:             (process.env.MODE      || 'public').toLowerCase(),
  APP_NAME:         process.env.APP_NAME   || OWNER.BOT_NAME,
  TIMEZONE:         process.env.TIMEZONE   || 'Asia/Karachi',
  LANGUAGE:         process.env.LANGUAGE   || 'en',

  AUTO_READ:        envBool('AUTO_READ',        false),
  AUTO_STATUS:      envBool('AUTO_STATUS',       true),
  AUTO_READ_STATUS: envBool('AUTO_READ_STATUS',  true),
  AUTO_LIKE_STATUS: envBool('AUTO_LIKE_STATUS',  true),
  AUTO_REACT:       envBool('AUTO_REACT',        false),
  AUTO_TYPING:      envBool('AUTO_TYPING',       false),
  AUTO_RECORDING:   envBool('AUTO_RECORDING',    false),
  AUTO_BIO:         envBool('AUTO_BIO',          false),
  AUTO_REPLY:       envBool('AUTO_REPLY',        false),
  AUTO_DOWNLOAD:    envBool('AUTO_DOWNLOAD',     false),

  ANTI_DELETE:      envBool('ANTI_DELETE',       true),
  ANTI_LINK:        envBool('ANTI_LINK',         false),
  ANTI_BAD:         envBool('ANTI_BAD',          false),
  ANTI_SPAM:        envBool('ANTI_SPAM',         false),
  ANTI_CALL:        envBool('ANTI_CALL',         false),
  ANTI_VIEW_ONCE:   envBool('ANTI_VIEW_ONCE',    true),

  WELCOME:          envBool('WELCOME',           false),
  GOODBYE:          envBool('GOODBYE',           false),
  MAX_WARN:         parseInt(process.env.MAX_WARN)        || 3,
  ANTI_SPAM_LIMIT:  parseInt(process.env.ANTI_SPAM_LIMIT) || 5,

  MONGODB_URI:      process.env.MONGODB_URI || '',
  DB_TYPE:          process.env.MONGODB_URI ? 'mongodb' : 'json',
  DB_PATH:          process.env.DB_PATH     || './database',

  SUPPORT_GROUP:    process.env.SUPPORT_GROUP || OWNER.CHANNEL,
  SCRIPT_LINK:      process.env.SCRIPT_LINK   || OWNER.REPO,

  HEROKU_APP_NAME:  process.env.HEROKU_APP_NAME || '',
  KEEP_ALIVE_URL:   process.env.KEEP_ALIVE_URL  || '',
  RENDER_APP_URL:   process.env.RENDER_APP_URL  || '',
};

export const SYSTEM = Object.freeze({
  BAILEYS_VERSION:  process.env.BAILEYS_VERSION || '6.7.9',
  NODE_MIN:         '18.0.0',
  SESSION_DIR:      './session',
  TEMP_DIR:         './temp',
  PLUGINS_DIR:      './plugins',
  DB_DIR:           './database',
  LOGS_DIR:         './logs',
  MAX_FILE_SIZE:    100 * 1024 * 1024,
  COOLDOWN_MS:      parseInt(process.env.COOLDOWN_DEFAULT) || 3000,
  COMMAND_TIMEOUT:  30000,

  WATERMARK:
    `\n\n┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄\n` +
    `⚡ *YOUSAF-MD* by *${OWNER.FULL_NAME}*\n` +
    `┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄`,

  SHORT_WATERMARK: `\n_⚡ YOUSAF-MD_`,

  FOOTER:
    `👑 Owner: ${OWNER.FULL_NAME}\n` +
    `📱 +${OWNER.NUMBER}\n` +
    `📢 ${OWNER.CHANNEL}\n` +
    `▶️ ${OWNER.YOUTUBE}\n` +
    `🎵 ${OWNER.TIKTOK}`,
});

export async function initDatabase() {
  if (CONFIG.DB_TYPE === 'mongodb' && CONFIG.MONGODB_URI) {
    try {
      const mongoose = await import('mongoose');
      await mongoose.default.connect(CONFIG.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
      console.log('[DB] ✅ MongoDB connected!');
      return 'mongodb';
    } catch {
      console.warn('[DB] ⚠️ MongoDB failed! Falling back to JSON...');
      return initJsonDatabase();
    }
  }
  return initJsonDatabase();
}

function initJsonDatabase() {
  try {
    const dbDir  = SYSTEM.DB_DIR;
    const dbFile = join(dbDir, 'database.json');
    if (!existsSync(dbDir)) mkdirSync(dbDir, { recursive: true });
    if (!existsSync(dbFile)) {
      writeFileSync(dbFile, JSON.stringify({
        users: {}, groups: {}, economy: {}, banned: [],
        created: new Date().toISOString(),
        owner: OWNER.FULL_NAME,
        bot:   OWNER.BOT_NAME,
      }, null, 2));
    }
    console.log('[DB] ✅ JSON database ready');
    return 'json';
  } catch (err) {
    console.error('[DB] ❌ Error:', err.message);
    return 'json';
  }
}

export function ownerFooter() {
  return (
    `╭━━━━━━━━━━━━━━━━━━━━━━╮\n` +
    `┃ 👑 *${OWNER.FULL_NAME}*\n` +
    `┃ 📱 +${OWNER.NUMBER}\n` +
    `┃ 📢 ${OWNER.CHANNEL}\n` +
    `┃ ▶️  ${OWNER.YOUTUBE}\n` +
    `┃ 🎵 ${OWNER.TIKTOK}\n` +
    `╰━━━━━━━━━━━━━━━━━━━━━━╯\n` +
    `_⚡ YOUSAF-MD v${OWNER.VERSION}_`
  );
}

export function cleanNumber(sender) {
  if (!sender) return '';
  return sender.split('@')[0].split(':')[0].replace(/[^0-9]/g, '');
}

export function isOwner(sender) {
  return cleanNumber(sender) === OWNER.NUMBER;
}

export function isDeployer(sender) {
  const num = cleanNumber(sender);
  if (!num) return false;
  if (num === OWNER.NUMBER) return true;
  return DEPLOYERS.includes(num);
}

export function isAdminLevel(sender, groupAdmins = []) {
  if (isDeployer(sender)) return true;
  const num = cleanNumber(sender);
  return groupAdmins.some(a => cleanNumber(a) === num);
}

// ═══════════════════════════════════════════════════════════════════
//  PERMISSION CHECK
//  Owner   — everything ✅
//  Deployer — everything ✅ (same as owner)
//  Admin   — group management only ✅
//  User    — general commands only ✅
// ═══════════════════════════════════════════════════════════════════

export function canUseCommand(commandName, sender, groupAdmins = []) {
  const cmd = commandName?.toLowerCase();
  if (!cmd) return false;

  // Deployer has FULL authority — same as Owner
  if (isDeployer(sender)) return true;

  // Owner only — eval, exec, shell
  if (OWNER_ONLY_COMMANDS.includes(cmd)) return isOwner(sender);

  // Deployer only commands — already handled above
  if (DEPLOYER_ONLY_COMMANDS.includes(cmd)) return isDeployer(sender);

  // Admin commands — group admins can use
  if (ADMIN_COMMANDS.includes(cmd)) return isAdminLevel(sender, groupAdmins);

  // Everyone else
  return true;
}

export function isOwnerOnlyCommand(cmd)    { return OWNER_ONLY_COMMANDS.includes(cmd?.toLowerCase()); }
export function isDeployerOnlyCommand(cmd) { return DEPLOYER_ONLY_COMMANDS.includes(cmd?.toLowerCase()); }
export function isAdminCommand(cmd)        { return ADMIN_COMMANDS.includes(cmd?.toLowerCase()); }
export function isRestrictedCommand(cmd)   { return isDeployerOnlyCommand(cmd) || isAdminCommand(cmd); }

export function getPermLevel(sender) {
  const num = cleanNumber(sender);
  if (!num) return 4;
  if (num === OWNER.NUMBER)    return 1;
  if (DEPLOYERS.includes(num)) return 2;
  return 4;
}

export function validateConfig() {
  const errors   = [];
  const warnings = [];

  if (!['public', 'private'].includes(CONFIG.MODE)) {
    errors.push(`Invalid MODE "${CONFIG.MODE}". Use: public | private`);
  }
  if (!CONFIG.PREFIX || CONFIG.PREFIX.length > 3) {
    errors.push('PREFIX must be 1-3 characters.');
  }
  if (!CONFIG.SESSION_ID) {
    warnings.push('SESSION_ID not set. Get one from YOUSAF-PAIRING-V1.');
  } else {
    console.log('[CONFIG] ✅ SESSION_ID loaded!');
  }
  if (DEPLOYERS.length === 0) {
    warnings.push('DEPLOYER_NUMBER not set. Only Owner has admin access.');
  } else {
    console.log(`[CONFIG] ✅ Deployers loaded: ${DEPLOYERS.join(', ')}`);
  }

  console.log('[CONFIG] ✅ AUTO_STATUS:', CONFIG.AUTO_STATUS);
  console.log('[CONFIG] ✅ AUTO_LIKE_STATUS:', CONFIG.AUTO_LIKE_STATUS);
  console.log('[CONFIG] ✅ ANTI_DELETE:', CONFIG.ANTI_DELETE);
  console.log('[CONFIG] ✅ ANTI_VIEW_ONCE:', CONFIG.ANTI_VIEW_ONCE);

  warnings.forEach(w => console.warn(`[CONFIG WARN] ⚠️  ${w}`));
  return errors;
}

export default {
  OWNER, DEPLOYERS,
  OWNER_ONLY_COMMANDS, ADMIN_COMMANDS, DEPLOYER_ONLY_COMMANDS,
  CONFIG, SYSTEM, SESSION_ID,
  initDatabase, ownerFooter,
  cleanNumber, isOwner, isDeployer, isAdminLevel, canUseCommand,
  isOwnerOnlyCommand, isDeployerOnlyCommand, isAdminCommand,
  isRestrictedCommand, getPermLevel, validateConfig,
};
