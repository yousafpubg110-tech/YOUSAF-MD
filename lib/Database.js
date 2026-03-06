// ============================================================
//   YOUSAF-MD — INTERNAL DATABASE ENGINE [COMPLETE]
//   Zero-Config: No MongoDB, No External URLs
//   Developer: Muhammad Yousaf Baloch
// ============================================================

'use strict';

const fs   = require('fs-extra');
const path = require('path');

const DB_DIR  = path.resolve('./database');
const DB_FILE = path.join(DB_DIR, 'yousaf_db.json');

// In-memory cache for speed
let _cache = null;

// In-memory active socket connections (not saved to disk)
const _activeSockets = {};

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

  // ── CORE KEY-VALUE ─────────────────────────────────────

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

  has(key) {
    return this.get(key) !== null;
  },

  // ── INSTANCE MANAGEMENT ────────────────────────────────

  /**
   * Called by SessionManager when pairing code is generated
   * Saves instance info + stores active socket in memory
   */
  createInstance(instanceId, phone, sock) {
    const jid = phone + '@s.whatsapp.net';
    const data = {
      instanceId,
      phone,
      jid,
      connected: false,
      createdAt: Date.now(),
    };
    this.set(`instances.${instanceId}`, data);
    _activeSockets[instanceId] = { sock, jid, phone, connected: false };
    return data;
  },

  /**
   * Called when WhatsApp connection is confirmed open
   */
  setConnected(instanceId, sock) {
    const existing = this.get(`instances.${instanceId}`, null);
    if (existing) {
      existing.connected   = true;
      existing.connectedAt = Date.now();
      this.set(`instances.${instanceId}`, existing);
    }
    if (_activeSockets[instanceId]) {
      _activeSockets[instanceId].sock      = sock;
      _activeSockets[instanceId].connected = true;
    }
  },

  /**
   * Remove instance from DB and memory
   */
  removeInstance(instanceId) {
    this.delete(`instances.${instanceId}`);
    delete _activeSockets[instanceId];
  },

  /**
   * Get instance data — returns null if not found or no jid
   */
  getInstance(instanceId) {
    // Check memory first
    if (_activeSockets[instanceId]) {
      return _activeSockets[instanceId];
    }
    const data = this.get(`instances.${instanceId}`, null);
    if (!data || !data.jid) return null;
    return data;
  },

  /**
   * Get active socket for an instance
   */
  getSocket(instanceId) {
    return _activeSockets[instanceId]?.sock || null;
  },

  /**
   * List all instances from disk
   */
  listInstances() {
    return this.get('instances', {});
  },

  /**
   * Get all active in-memory instances (for broadcast etc.)
   */
  getAllInstances() {
    return Object.values(_activeSockets).map(i => ({
      instanceId: i.instanceId,
      jid:        i.jid,
      phone:      i.phone,
      connected:  i.connected,
      sock:       i.sock,
    }));
  },

  /**
   * For backwards compat — same as getInstance
   */
  getInstanceByJid(jid) {
    const entry = Object.values(_activeSockets).find(i => i.jid === jid);
    return entry || null;
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

  registerAdmin(jid, instanceId) {
    return this.set(`admins.${jid}`, { instanceId, since: Date.now() });
  },

  isAdmin(jid) {
    return this.has(`admins.${jid}`);
  },

  // ── UTILITY ────────────────────────────────────────────

  flush() {
    _cache = null;
  },

  stats() {
    const db = _load();
    return {
      instances:       Object.keys(db.instances || {}).length,
      activeInstances: Object.keys(_activeSockets).length,
      admins:          Object.keys(db.admins    || {}).length,
      size:            JSON.stringify(db).length,
    };
  },
};

module.exports = Database;
