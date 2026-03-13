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

// ═══════════════════════════════════════════════════════════════════
//  [SECTION 1]  OWNER IDENTITY — LOCKED — READ ONLY
// ═══════════════════════════════════════════════════════════════════

export const OWNER = Object.freeze({
  NAME:      'Yousaf Baloch',
  FULL_NAME: 'Muhammad Yousaf Baloch',
  NUMBER:    '923710636110',
  JID:       '923710636110@s.whatsapp.net',
  BOT_NAME:  'YOUSAF-MD',
  VERSION:   '2.0.0',
  YEAR:      '2026',
  COUNTRY:   'Pakistan',

  YOUTUBE:        'https://www.youtube.com/@Yousaf_Baloch_Tech',
  TIKTOK:         'https://tiktok.com/@loser_boy.110',
  CHANNEL:        'https://whatsapp.com/channel/0029Vb3Uzps6buMH2RvGef0j',
  GITHUB:         'https://github.com/yousafpubg110-tech',
  WHATSAPP:       'https://wa.me/923710636110',

  REPO:           'https://github.com/yousafpubg110-tech/YOUSAF-MD',
  REPO_BALOCH_MD: 'https://github.com/yousafpubg110-tech/YOUSAF-BALOCH-MD',
});

// ═══════════════════════════════════════════════════════════════════
//  [SECTION 1-B]  DEPLOYER — LEVEL 2 BOT ADMIN
// ═══════════════════════════════════════════════════════════════════

function loadDeployers() {
  const raw = process.env.DEPLOYER_NUMBER || '';
  if (!raw.trim()) return [];
  return raw
    .split(',')
    .map(n => n.trim().replace(/[^0-9]/g, ''))
    .filter(n => n.length >= 7 && n.length <= 15);
}

export const DEPLOYERS = Object.freeze(loadDeployers());

// ═══════════════════════════════════════════════════════════════════
//  [SECTION 1-C]  DEPLOYER-ONLY COMMANDS
// ═══════════════════════════════════════════════════════════════════

export const DEPLOYER_ONLY_COMMANDS = Object.freeze([
  'setting', 'settings', 'set', 'config', 'configure',
  'antilink', 'antiviewonce', 'antispam', 'antibad', 'anticall',
  'autoread', 'autostatus', 'autoreact', 'autolike',
  'autotyping', 'autorecord',
  'kick', 'add', 'promote', 'demote', 'linkgroup', 'revoke',
  'mute', 'unmute', 'close', 'open',
  'restart', 'shutdown', 'block', 'unblock', 'ban', 'unban',
  'broadcast', 'bc', 'update',
  'setprefix', 'setmode', 'setname', 'setwelcome', 'setgoodbye',
]);

// ═══════════════════════════════════════════════════════════════════
//  [SECTION 1-D]  OWNER-ONLY COMMANDS
// ═══════════════════════════════════════════════════════════════════

export const OWNER_ONLY_COMMANDS = Object.freeze([
  'eval', 'exec', 'shell',
]);

// ═══════════════════════════════════════════════════════════════════
//  [SECTION 1-E]  SESSION ID LOADER
//  ENV سے لو، نہیں تو session/SESSION_ID فائل سے
// ═══════════════════════════════════════════════════════════════════

function loadSessionId() {
  // پہلے ENV سے چیک کرو
  if (process.env.SESSION_ID && process.env.SESSION_ID.trim()) {
    return process.env.SESSION_ID.trim();
  }
  // پھر فائل سے چیک کرو
  const f = './session/SESSION_ID';
  if (existsSync(f)) {
    const val = readFileSync(f, 'utf8').trim();
    if (val && val !== 'YOUR_SESSION_ID_HERE') return val;
  }
  return '';
}

export const SESSION_ID = loadSessionId();

// ═══════════════════════════════════════════════════════════════════
//  [SECTION 2]  BOT SETTINGS
// ═══════════════════════════════════════════════════════════════════

export const CONFIG = {
  SESSION_ID: SESSION_ID,
  PREFIX:     process.env.PREFIX     || '.',
  MODE:       (process.env.MODE      || 'public').toLowerCase(),
  APP_NAME:   process.env.APP_NAME   || OWNER.BOT_NAME,
  TIMEZONE:   process.env.TIMEZONE   || 'Asia/Karachi',
  LANGUAGE:   process.env.LANGUAGE   || 'en',

  AUTO_READ:        process.env.AUTO_READ        === 'true',
  AUTO_STATUS:      process.env.AUTO_STATUS      === 'true',
  AUTO_READ_STATUS: process.env.AUTO_READ_STATUS === 'true',
  AUTO_LIKE_STATUS: process.env.AUTO_LIKE_STATUS === 'true',
  AUTO_REACT:       process.env.AUTO_REACT       === 'true',
  AUTO_TYPING:      process.env.AUTO_TYPING      === 'true',
  AUTO_RECORDING:   process.env.AUTO_RECORDING   === 'true',
  AUTO_BIO:         process.env.AUTO_BIO         === 'true',
  AUTO_REPLY:       process.env.AUTO_REPLY        === 'true',
  AUTO_DOWNLOAD:    process.env.AUTO_DOWNLOAD     === 'true',

  ANTI_DELETE:    process.env.ANTI_DELETE    === 'true',
  ANTI_LINK:      process.env.ANTI_LINK      === 'true',
  ANTI_BAD:       process.env.ANTI_BAD       === 'true',
  ANTI_SPAM:      process.env.ANTI_SPAM      === 'true',
  ANTI_CALL:      process.env.ANTI_CALL      === 'true',
  ANTI_VIEW_ONCE: process.env.ANTI_VIEW_ONCE === 'true',

  WELCOME:         process.env.WELCOME           === 'true',
  GOODBYE:         process.env.GOODBYE           === 'true',
  MAX_WARN:        parseInt(process.env.MAX_WARN)        || 3,
  ANTI_SPAM_LIMIT: parseInt(process.env.ANTI_SPAM_LIMIT) || 5,

  MONGODB_URI: process.env.MONGODB_URI || '',
  DB_TYPE:     process.env.MONGODB_URI ? 'mongodb' : 'json',
  DB_PATH:     process.env.DB_PATH     || './database',

  SUPPORT_GROUP: process.env.SUPPORT_GROUP || OWNER.CHANNEL,
  SCRIPT_LINK:   process.env.SCRIPT_LINK   || OWNER.REPO,

  HEROKU_APP_NAME: process.env.HEROKU_APP_NAME || '',
  KEEP_ALIVE_URL:  process.env.KEEP_ALIVE_URL  || '',
  RENDER_APP_URL:  process.env.RENDER_APP_URL  || '',
};

// ═══════════════════════════════════════════════════════════════════
//  [SECTION 3]  SYSTEM CONSTANTS
// ═══════════════════════════════════════════════════════════════════

export const SYSTEM = Object.freeze({
  BAILEYS_VERSION : process.env.BAILEYS_VERSION || '6.7.9',
  NODE_MIN        : '18.0.0',
  SESSION_DIR     : './session',
  TEMP_DIR        : './temp',
  PLUGINS_DIR     : './plugins',
  DB_DIR          : './database',
  LOGS_DIR        : './logs',
  MAX_FILE_SIZE   : 100 * 1024 * 1024,
  COOLDOWN_MS     : parseInt(process.env.COOLDOWN_DEFAULT) || 3000,
  COMMAND_TIMEOUT : 30000,

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

// ═══════════════════════════════════════════════════════════════════
//  [SECTION 4]  DATABASE INITIALIZER
// ═══════════════════════════════════════════════════════════════════

export async function initDatabase() {
  if (CONFIG.DB_TYPE === 'mongodb' && CONFIG.MONGODB_URI) {
    try {
      const mongoose = await import('mongoose');
      await mongoose.default.connect(CONFIG.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log('[DB] ✅ MongoDB connected successfully!');
      return 'mongodb';
    } catch (err) {
      console.warn('[DB] ⚠️  MongoDB failed! Falling back to JSON...');
      return initJsonDatabase();
    }
  } else {
    return initJsonDatabase();
  }
}

function initJsonDatabase() {
  try {
    const dbDir  = SYSTEM.DB_DIR;
    const dbFile = join(dbDir, 'database.json');

    if (!existsSync(dbDir)) mkdirSync(dbDir, { recursive: true });

    if (!existsSync(dbFile)) {
      writeFileSync(dbFile, JSON.stringify({
        users  : {},
        groups : {},
        economy: {},
        banned : [],
        created: new Date().toISOString(),
        owner  : OWNER.FULL_NAME,
        bot    : OWNER.BOT_NAME,
      }, null, 2));
    }

    console.log('[DB] ✅ JSON database ready at: ' + dbFile);
    return 'json';
  } catch (err) {
    console.error('[DB] ❌ JSON database error: ' + err.message);
    return 'json';
  }
}

// ═══════════════════════════════════════════════════════════════════
//  [SECTION 5]  OWNER FOOTER
// ═══════════════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════════════
//  [SECTION 6]  PERMISSION HELPERS
// ═══════════════════════════════════════════════════════════════════

export function isOwner(sender) {
  if (!sender) return false;
  return sender.split('@')[0] === OWNER.NUMBER;
}

export function isDeployer(sender) {
  if (!sender) return false;
  const num = sender.split('@')[0];
  if (num === OWNER.NUMBER) return true;
  return DEPLOYERS.includes(num);
}

export function isDeployerOnlyCommand(commandName) {
  return DEPLOYER_ONLY_COMMANDS.includes(commandName?.toLowerCase());
}

export function isOwnerOnlyCommand(commandName) {
  return OWNER_ONLY_COMMANDS.includes(commandName?.toLowerCase());
}

export function isRestrictedCommand(commandName) {
  return isDeployerOnlyCommand(commandName);
}

export function getPermLevel(sender) {
  if (!sender) return 3;
  const num = sender.split('@')[0];
  if (num === OWNER.NUMBER) return 1;
  if (DEPLOYERS.includes(num)) return 2;
  return 3;
}

// ═══════════════════════════════════════════════════════════════════
//  [SECTION 7]  STARTUP VALIDATOR
// ═══════════════════════════════════════════════════════════════════

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
    console.log('[CONFIG] ✅ SESSION_ID loaded successfully!');
  }

  if (DEPLOYERS.length === 0) {
    warnings.push('DEPLOYER_NUMBER not set. Only Owner has admin access.');
  } else {
    console.log(`[CONFIG] ✅ Deployers loaded: ${DEPLOYERS.join(', ')}`);
  }

  warnings.forEach(w => console.warn(`[CONFIG WARN] ⚠️  ${w}`));
  return errors;
}

export default {
  OWNER,
  DEPLOYERS,
  DEPLOYER_ONLY_COMMANDS,
  OWNER_ONLY_COMMANDS,
  CONFIG,
  SYSTEM,
  SESSION_ID,
  initDatabase,
  ownerFooter,
  isOwner,
  isDeployer,
  isDeployerOnlyCommand,
  isOwnerOnlyCommand,
  isRestrictedCommand,
  getPermLevel,
  validateConfig,
};
