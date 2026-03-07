// ============================================================
//   YOUSAF-MD — DATABASE ENGINE
//   Personal Instance — Settings & Admin only
//   No central session management
//   Developer: Muhammad Yousaf Baloch
// ============================================================

'use strict';

const fs   = require('fs-extra');
const path = require('path');

const DB_DIR  = path.resolve('./database');
const DB_FILE = path.join(DB_DIR, 'yousaf_db.json');

let _cache = null;

function _load() {
  if (_cache) return _cache;
  try {
    fs.ensureDirSync(DB_DIR);
    if (!fs.existsSync(DB_FILE)) {
      fs.writeJsonSync(DB_FILE, {}, { spaces: 2 });
    }
    _cache = fs.readJsonSync(DB_FILE);
  } catch {
    _cache = {};
  }
  return _cache;
}

function _save() {
  try {
    fs.ensureDirSync(DB_DIR);
    fs.writeJsonSync(DB_FILE, _cache, { spaces: 2 });
  } catch (e) {
    console.error('[DB] Save error:', e.message);
  }
}

// ── Prototype pollution guard ─────────────────────────────
const BLOCKED_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

function _isSafeKey(k) {
  return !BLOCKED_KEYS.has(k);
}

const Database = {

  // ── CORE KEY-VALUE ─────────────────────────────────────

  get(key, defaultVal = null) {
    const db   = _load();
    const keys = key.split('.');
    let   cur  = db;
    for (const k of keys) {
      if (!_isSafeKey(k)) return defaultVal;
      if (cur == null || typeof cur !== 'object') return defaultVal;
      cur = cur[k];
    }
    return cur !== undefined ? cur : defaultVal;
  },

  set(key, value) {
    const db   = _load();
    const keys = key.split('.');

    // Validate all key segments before touching the object
    for (const k of keys) {
      if (!_isSafeKey(k)) {
        console.warn('[DB] Blocked unsafe key:', k);
        return false;
      }
    }

    let cur = db;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!Object.prototype.hasOwnProperty.call(cur, keys[i]) ||
          typeof cur[keys[i]] !== 'object' ||
          cur[keys[i]] === null) {
        cur[keys[i]] = Object.create(null);
      }
      cur = cur[keys[i]];
    }

    cur[keys[keys.length - 1]] = value;
    _save();
    return true;
  },

  delete(key) {
    const db   = _load();
    const keys = key.split('.');
    for (const k of keys) {
      if (!_isSafeKey(k)) return false;
    }
    let cur = db;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!Object.prototype.hasOwnProperty.call(cur, keys[i])) return false;
      cur = cur[keys[i]];
    }
    delete cur[keys[keys.length - 1]];
    _save();
    return true;
  },

  has(key) {
    return this.get(key) !== null;
  },

  // ── SETTINGS MANAGEMENT ────────────────────────────────

  getSettings(jid) {
    const { DEFAULTS } = require('../config');
    const saved = this.get(`settings.${jid}`, {});
    return { ...DEFAULTS, ...saved };
  },

  saveSettings(jid, settings) {
    return this.set(`settings.${jid}`, settings);
  },

  toggleSetting(jid, key) {
    const settings = this.getSettings(jid);
    settings[key]  = !settings[key];
    this.saveSettings(jid, settings);
    return settings[key];
  },

  // ── ADMIN MANAGEMENT ───────────────────────────────────

  registerAdmin(jid) {
    return this.set('admin.jid', jid);
  },

  isAdmin(jid) {
    const adminJid = this.get('admin.jid', null);
    if (!adminJid) return false;
    const clean = (j) => j.replace(/[^0-9]/g, '');
    return clean(jid) === clean(adminJid);
  },

  getAdmin() {
    return this.get('admin.jid', null);
  },

  // ── UTILITY ────────────────────────────────────────────

  flush() {
    _cache = null;
  },

  stats() {
    const db = _load();
    return {
      settings: Object.keys(db.settings || {}).length,
      admin:    db.admin?.jid || 'not set',
      size:     JSON.stringify(db).length,
    };
  },
};

module.exports = Database;
