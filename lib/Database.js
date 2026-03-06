// ============================================================
//   YOUSAF-MD — INTERNAL DATABASE ENGINE [FIXED]
//   Zero-Config: No MongoDB, No External URLs
//   FIXES: getInstance returns null (not {}) when not found,
//          preventing "instance?.jid" undefined crashes
//   Developer: Muhammad Yousaf Baloch
// ============================================================

'use strict';

const fs   = require('fs-extra');
const path = require('path');

const DB_DIR  = path.resolve('./database');
const DB_FILE = path.join(DB_DIR, 'yousaf_db.json');

// In-memory cache for speed
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

const Database = {

  /** Get a value by dot-notation key */
  get(key, defaultVal = null) {
    const db   = _load();
    const keys = key.split('.');
    let   cur  = db;
    for (const k of keys) {
      if (cur == null || typeof cur !== 'object') return defaultVal;
      cur = cur[k];
    }
    return cur !== undefined ? cur : defaultVal;
  },

  /** Set a value by dot-notation key */
  set(key, value) {
    const db   = _load();
    const keys = key.split('.');
    let   cur  = db;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!cur[keys[i]] || typeof cur[keys[i]] !== 'object') {
        cur[keys[i]] = {};
      }
      cur = cur[keys[i]];
    }
    cur[keys[keys.length - 1]] = value;
    _save();
    return true;
  },

  /** Delete a key */
  delete(key) {
    const db   = _load();
    const keys = key.split('.');
    let   cur  = db;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!cur[keys[i]]) return false;
      cur = cur[keys[i]];
    }
    delete cur[keys[keys.length - 1]];
    _save();
    return true;
  },

  /** Check if key exists */
  has(key) {
    return this.get(key) !== null;
  },

  // ── INSTANCE MANAGEMENT ────────────────────────────────

  /** Get instance data — FIXED: returns null (not {}) if missing */
  getInstance(instanceId) {
    const data = this.get(`instances.${instanceId}`, null);
    // Ensure the returned object has a jid, otherwise treat as not found
    if (!data || !data.jid) return null;
    return data;
  },

  /** Save instance data */
  setInstance(instanceId, data) {
    return this.set(`instances.${instanceId}`, data);
  },

  /** List all active instances */
  listInstances() {
    return this.get('instances', {});
  },

  // ── SETTINGS MANAGEMENT ────────────────────────────────

  /** Get settings for a paired JID, merged with defaults */
  getSettings(jid) {
    const { DEFAULTS } = require('../config');
    const saved = this.get(`settings.${jid}`, {});
    return { ...DEFAULTS, ...saved };
  },

  /** Save full settings object */
  saveSettings(jid, settings) {
    return this.set(`settings.${jid}`, settings);
  },

  /** Toggle a boolean setting, returns new value */
  toggleSetting(jid, key) {
    const settings = this.getSettings(jid);
    settings[key]  = !settings[key];
    this.saveSettings(jid, settings);
    return settings[key];
  },

  // ── ADMIN MANAGEMENT ───────────────────────────────────

  /** Register a phone JID as Bot Admin for an instance */
  registerAdmin(jid, instanceId) {
    return this.set(`admins.${jid}`, { instanceId, since: Date.now() });
  },

  /** Check if a JID is a registered Bot Admin */
  isAdmin(jid) {
    return this.has(`admins.${jid}`);
  },

  // ── UTILITY ────────────────────────────────────────────

  /** Flush in-memory cache (force reload from disk) */
  flush() {
    _cache = null;
  },

  /** DB stats */
  stats() {
    const db = _load();
    return {
      instances: Object.keys(db.instances || {}).length,
      admins:    Object.keys(db.admins    || {}).length,
      size:      JSON.stringify(db).length,
    };
  },
};

module.exports = Database;

