/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║            YOUSAF-BALOCH-MD — CORE CONFIGURATION                ║
 * ║            Created by: Muhammad Yousaf Baloch                   ║
 * ║            Version: 2.0.0  |  500+ Commands                     ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import { config } from 'dotenv';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

config();

// ═══════════════════════════════════════════════════════════════════
//  [SECTION 1]  🔒 OWNER IDENTITY — LOCKED — READ ONLY
//  ⚠️  DO NOT MODIFY — HARD-CODED — IMMUTABLE
//  یہ معلومات کبھی نہیں بدلیں گی — ہر جگہ یہی نظر آئیں گی
// ═══════════════════════════════════════════════════════════════════

export const OWNER = Object.freeze({
  NAME:      'Yousuf Baloch',
  FULL_NAME: 'Muhammad Yousaf Baloch',
  NUMBER:    '923710636110',
  JID:       '923710636110@s.whatsapp.net',
  BOT_NAME:  'YOUSAF-BALOCH-MD',
  VERSION:   '2.0.0',
  YEAR:      '2026',
  COUNTRY:   'Pakistan',

  YOUTUBE:  'https://www.youtube.com/@Yousaf_Baloch_Tech',
  TIKTOK:   'https://tiktok.com/@loser_boy.110',
  CHANNEL:  'https://whatsapp.com/channel/0029Vb3Uzps6buMH2RvGef0j',
  GITHUB:   'https://github.com/musakhanbaloch03-sad',
  REPO:     'https://github.com/musakhanbaloch03-sad/YOUSAF-BALOCH-MD',
  WHATSAPP: 'https://wa.me/923710636110',
});

// ═══════════════════════════════════════════════════════════════════
//  [SECTION 1-B]  🔑 DEPLOYER — LEVEL 2
//  جو کوئی بھی بوٹ اپنے نمبر پر لگائے وہ DEPLOYER ہے
//  DEPLOYER_NUMBER=923001234567,923007654321 (comma separated)
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
//  [SECTION 1-C]  🚫 DEPLOYER-ONLY COMMANDS
//  یہ commands صرف DEPLOYER یا OWNER یوز کر سکتا ہے
//  عام یوزر یہ کبھی نہیں چلا سکتا
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
//  [SECTION 1-D]  👑 OWNER-ONLY COMMANDS
//  صرف Yousaf (OWNER) یوز کر سکتا ہے — deployer بھی نہیں
// ═══════════════════════════════════════════════════════════════════

export const OWNER_ONLY_COMMANDS = Object.freeze([
  'eval', 'exec', 'shell',
]);

// ═══════════════════════════════════════════════════════════════════
//  [SECTION 2]  ✅ BOT SETTINGS
// ═══════════════════════════════════════════════════════════════════

export const CONFIG = {
  SESSION_ID: process.env.SESSION_ID || '',
  PREFIX:     process.env.PREFIX     || '.',
  MODE:       (process.env.MODE      || 'public').toLowerCase(),
  APP_NAME:   process.env.APP_NAME   || OWNER.BOT_NAME,
  TIMEZONE:   process.env.TIMEZONE   || 'Asia/Karachi',
  LANGUAGE:   process.env.LANGUAGE   || 'en',

  AUTO_READ:        process.env.AUTO_READ        === 'true',
  AUTO_READ_STATUS: process.env.AUTO_READ_STATUS === 'true',
  AUTO_LIKE_STATUS: process.env.AUTO_LIKE_STATUS === 'true',
  AUTO_REACT:       process.env.AUTO_REACT       === 'true',

  ANTI_LINK:      process.env.ANTI_LINK      === 'true',
  ANTI_BAD:       process.env.ANTI_BAD       === 'true',
  ANTI_SPAM:      process.env.ANTI_SPAM      === 'true',
  ANTI_CALL:      process.env.ANTI_CALL      === 'true',
  ANTI_VIEW_ONCE: process.env.ANTI_VIEW_ONCE === 'true',

  WELCOME:  process.env.WELCOME  === 'true',
  GOODBYE:  process.env.GOODBYE  === 'true',
  MAX_WARN: parseInt(process.env.MAX_WARN) || 3,

  MONGODB_URI: process.env.MONGODB_URI || '',
  DB_TYPE:     process.env.MONGODB_URI ? 'mongodb' : 'json',
  DB_PATH:     process.env.DB_PATH || './database',

  HEROKU_APP_NAME: process.env.HEROKU_APP_NAME || '',
  KEEP_ALIVE_URL:  process.env.KEEP_ALIVE_URL  || '',
};

// ═══════════════════════════════════════════════════════════════════
//  [SECTION 3]  ⚙️  SYSTEM CONSTANTS
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
  COOLDOWN_MS     : 3000,
  COMMAND_TIMEOUT : 30000,

  WATERMARK:       `\n\n┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄\n⚡ *${OWNER.BOT_NAME}* by *${OWNER.FULL_NAME}*\n┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄`,
  SHORT_WATERMARK: `\n_⚡ ${OWNER.BOT_NAME}_`,
  FOOTER:          `👑 Owner: ${OWNER.FULL_NAME}\n📢 ${OWNER.CHANNEL}`,
});

// ═══════════════════════════════════════════════════════════════════
//  [SECTION 4]  ✅ DATABASE INITIALIZER — BUG FIXED
//  پرانے کوڈ میں non-async function میں await تھا — crash ہوتا تھا
//  اب fs اور path اوپر import ہیں — کوئی مسئلہ نہیں
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
      console.warn('[DB] ⚠️  MongoDB failed! Falling back to JSON database...');
      return initJsonDatabase();
    }
  } else {
    return initJsonDatabase();
  }
}

// BUG FIX: async ہٹایا، اوپر سے import کی ہوئی fs/path use کی
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
//  [SECTION 5]  ✅ ownerFooter() — ہمیشہ OWNER کی info دکھاتا ہے
// ═══════════════════════════════════════════════════════════════════

export function ownerFooter() {
  return `
╭━━━━━━━━━━━━━━━━━━━━━━╮
┃ 👑 *${OWNER.FULL_NAME}*
┃ 📱 +${OWNER.NUMBER}
┃ 📢 ${OWNER.CHANNEL}
╰━━━━━━━━━━━━━━━━━━━━━━╯
_⚡ ${OWNER.BOT_NAME} v${OWNER.VERSION}_`;
}

// ═══════════════════════════════════════════════════════════════════
//  [SECTION 6]  ✅ PERMISSION HELPER FUNCTIONS
//  3 levels: OWNER (1) > DEPLOYER (2) > USER (3)
// ═══════════════════════════════════════════════════════════════════

export function isOwner(sender) {
  if (!sender) return false;
  return sender.split('@')[0] === OWNER.NUMBER;
}

export function isDeployer(sender) {
  if (!sender) return false;
  const num = sender.split('@')[0];
  if (num === OWNER.NUMBER) return true;   // OWNER ہمیشہ DEPLOYER بھی ہے
  return DEPLOYERS.includes(num);
}

export function isDeployerOnlyCommand(commandName) {
  return DEPLOYER_ONLY_COMMANDS.includes(commandName?.toLowerCase());
}

export function isOwnerOnlyCommand(commandName) {
  return OWNER_ONLY_COMMANDS.includes(commandName?.toLowerCase());
}

// پرانی function — backward compatibility کے لیے رکھی
export function isRestrictedCommand(commandName) {
  return isDeployerOnlyCommand(commandName);
}

export function getPermLevel(sender) {
  if (!sender) return 3;
  const num = sender.split('@')[0];
  if (num === OWNER.NUMBER) return 1;        // OWNER
  if (DEPLOYERS.includes(num)) return 2;     // DEPLOYER
  return 3;                                  // USER
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
