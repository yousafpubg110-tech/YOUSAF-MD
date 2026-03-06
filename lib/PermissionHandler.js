// ============================================================
//   YOUSAF-MD — SESSION MANAGER
//   Developer: Muhammad Yousaf Baloch
// ============================================================

'use strict';

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  Browsers,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
} = require('@whiskeysockets/baileys');

const path   = require('path');
const fs     = require('fs-extra');
const pino   = require('pino');
const { v4: uuidv4 } = require('uuid');

const config   = require('../config');
const Database = require('./Database');
const loader   = require('../plugins/loader');

const SESSION_DIR = path.resolve(config.SESSION_DIR || './sessions');
fs.ensureDirSync(SESSION_DIR);

const logger = pino({ level: 'silent' });

async function cleanSessionFiles(sessionPath) {
  try {
    const files = await fs.readdir(sessionPath);
    for (const file of files) {
      if (file.endsWith('.tmp') || file.endsWith('.lock') || file === 'session.json.bak') {
        await fs.unlink(path.join(sessionPath, file)).catch(() => {});
      }
    }
  } catch {}
}

// ── GENERATE PAIRING CODE ─────────────────────────────────
async function generatePairingCode(phone) {
  const instanceId  = uuidv4();
  const sessionPath = path.join(SESSION_DIR, instanceId);
  await fs.ensureDir(sessionPath);
  await cleanSessionFiles(sessionPath);

  const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
  const { version }          = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: {
      creds: state.creds,
      keys:  makeCacheableSignalKeyStore(state.keys, logger),
    },
    browser:               Browsers.ubuntu('Chrome'),
    printQRInTerminal:     false,
    logger,
    syncFullHistory:       false,
    markOnlineOnConnect:   false,
    connectTimeoutMs:      60000,
    defaultQueryTimeoutMs: 30000,
    keepAliveIntervalMs:   25000,
    emitOwnEvents:         false,
    fireInitQueries:       false,
    generateHighQualityLinkPreview: false,
  });

  // ── صحیح طریقہ: connection event کا انتظار کریں ──────
  const code = await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Pairing code timeout — please try again'));
    }, 60000);

    let codeSent = false;

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect } = update;

      // WhatsApp connecting state میں code request کریں
      if (connection === 'connecting' && !codeSent) {
        try {
          codeSent = true;
          clearTimeout(timeout);
          const pairingCode = await sock.requestPairingCode(phone.replace(/\D/g, ''));
          let formatted = pairingCode;
          if (formatted && !formatted.includes('-')) {
            formatted = formatted.slice(0, 4) + '-' + formatted.slice(4);
          }
          resolve(formatted);
        } catch (e) {
          // ایک بار retry
          codeSent = false;
          await new Promise(r => setTimeout(r, 2000));
          if (codeSent) return;
          try {
            codeSent = true;
            clearTimeout(timeout);
            const pairingCode = await sock.requestPairingCode(phone.replace(/\D/g, ''));
            let formatted = pairingCode;
            if (formatted && !formatted.includes('-')) {
              formatted = formatted.slice(0, 4) + '-' + formatted.slice(4);
            }
            resolve(formatted);
          } catch (e2) {
            clearTimeout(timeout);
            reject(new Error('Code request failed: ' + e2.message));
          }
        }
      }

      if (connection === 'close' && !codeSent) {
        clearTimeout(timeout);
        reject(new Error('WhatsApp closed connection — please try again'));
      }
    });
  });

  // Database میں save کریں
  Database.createInstance(instanceId, phone, sock);
  sock.ev.on('creds.update', saveCreds);

  // ── Connection events ───────────────────────────────────
  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === 'open') {
      console.log(`[SESSION] ✅ Bot connected: ${instanceId}`);
      loader(sock, instanceId);
      Database.setConnected(instanceId, sock);
      try {
        const { notifyConnected } = require('../server');
        notifyConnected(instanceId);
      } catch {}
      try {
        const welcomeText = config.WELCOME_TEXT(phone + '@s.whatsapp.net', instanceId);
        await sock.sendMessage(phone + '@s.whatsapp.net', { text: welcomeText });
      } catch {}
    }

    if (connection === 'close') {
      const statusCode     = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut &&
                              statusCode !== DisconnectReason.forbidden;
      console.log(`[SESSION] ❌ Disconnected: ${instanceId} — code: ${statusCode}`);
      if (shouldReconnect) {
        setTimeout(() => restoreSession(instanceId), 5000);
      } else {
        Database.removeInstance(instanceId);
        fs.remove(sessionPath).catch(() => {});
      }
    }
  });

  return { code, instanceId };
}

// ── RESTORE SESSION ───────────────────────────────────────
async function restoreSession(instanceId) {
  const sessionPath = path.join(SESSION_DIR, instanceId);
  if (!await fs.pathExists(sessionPath)) return;
  await cleanSessionFiles(sessionPath);

  try {
    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
    const { version }          = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
      version,
      auth: {
        creds: state.creds,
        keys:  makeCacheableSignalKeyStore(state.keys, logger),
      },
      browser:               Browsers.ubuntu('Chrome'),
      printQRInTerminal:     false,
      logger,
      syncFullHistory:       false,
      markOnlineOnConnect:   false,
      connectTimeoutMs:      60000,
      defaultQueryTimeoutMs: 30000,
      keepAliveIntervalMs:   25000,
      emitOwnEvents:         false,
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect } = update;

      if (connection === 'open') {
        console.log(`[SESSION] ✅ Restored: ${instanceId}`);
        loader(sock, instanceId);
        Database.setConnected(instanceId, sock);
      }

      if (connection === 'close') {
        const statusCode      = lastDisconnect?.error?.output?.statusCode;
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut &&
                                statusCode !== DisconnectReason.forbidden;
        if (shouldReconnect) {
          setTimeout(() => restoreSession(instanceId), 8000);
        } else {
          Database.removeInstance(instanceId);
          fs.remove(sessionPath).catch(() => {});
        }
      }
    });

  } catch (e) {
    console.error(`[SESSION] ❌ Restore failed: ${instanceId}`, e.message);
    setTimeout(() => restoreSession(instanceId), 15000);
  }
}

// ── RESTORE ALL SESSIONS ON BOOT ─────────────────────────
async function restoreAllSessions() {
  try {
    const entries = await fs.readdir(SESSION_DIR);
    for (const entry of entries) {
      const sessionPath = path.join(SESSION_DIR, entry);
      const stat        = await fs.stat(sessionPath);
      if (!stat.isDirectory()) continue;
      const credsPath = path.join(sessionPath, 'creds.json');
      if (!await fs.pathExists(credsPath)) continue;
      console.log(`[SESSION] 🔄 Restoring session: ${entry}`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      restoreSession(entry).catch(() => {});
    }
  } catch (e) {
    console.error('[SESSION] ❌ restoreAllSessions error:', e.message);
  }
}

module.exports = { generatePairingCode, restoreAllSessions, restoreSession };
