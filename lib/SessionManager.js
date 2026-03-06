// ============================================================
//   YOUSAF-MD — SESSION MANAGER [FIXED v2]
//   Fix: Wait for connection.update before requesting code
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

// ── CLEAN STALE SESSION FILES ─────────────────────────────
async function cleanSessionFiles(sessionPath) {
  try {
    const files = await fs.readdir(sessionPath);
    for (const file of files) {
      if (file.endsWith('.tmp') || file.endsWith('.lock')) {
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
    browser:                        Browsers.ubuntu('Chrome'),
    printQRInTerminal:              false,
    logger,
    syncFullHistory:                false,
    markOnlineOnConnect:            false,
    connectTimeoutMs:               60000,
    defaultQueryTimeoutMs:          30000,
    keepAliveIntervalMs:            25000,
    emitOwnEvents:                  false,
    fireInitQueries:                false,
    generateHighQualityLinkPreview: false,
  });

  // ── Wait for WhatsApp connection then request code ──────
  const code = await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('WhatsApp connection timeout. Please try again.'));
    }, 30000);

    sock.ev.on('connection.update', async (update) => {
      // WhatsApp is ready when connecting — request code now
      if (update.connection === 'connecting' || update.qr !== undefined) {
        try {
          clearTimeout(timeout);
          const cleanPhone  = phone.replace(/\D/g, '');
          const pairingCode = await sock.requestPairingCode(cleanPhone);
          resolve(pairingCode);
        } catch (e) {
          // Retry once after 2 seconds
          setTimeout(async () => {
            try {
              const cleanPhone  = phone.replace(/\D/g, '');
              const pairingCode = await sock.requestPairingCode(cleanPhone);
              resolve(pairingCode);
            } catch (e2) {
              reject(e2);
            }
          }, 2000);
        }
      }
    });
  });

  // Format code: XXXX-XXXX
  const formattedCode = code
    ? code.replace(/[-\s]/g, '').replace(/(.{4})(.{4})/, '$1-$2')
    : code;

  // Save instance
  Database.createInstance(instanceId, phone, sock);

  // ── Handle connection events ────────────────────────────
  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === 'open') {
      console.log(`[SESSION] ✅ Connected: ${instanceId}`);
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
      const statusCode      = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut &&
                              statusCode !== DisconnectReason.forbidden;

      console.log(`[SESSION] ❌ Disconnected: ${instanceId} code: ${statusCode}`);

      if (shouldReconnect) {
        setTimeout(() => restoreSession(instanceId), 5000);
      } else {
        Database.removeInstance(instanceId);
        fs.remove(sessionPath).catch(() => {});
      }
    }
  });

  return { code: formattedCode, instanceId };
}

// ── RESTORE EXISTING SESSION ──────────────────────────────
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
      browser:              Browsers.ubuntu('Chrome'),
      printQRInTerminal:    false,
      logger,
      syncFullHistory:      false,
      markOnlineOnConnect:  false,
      connectTimeoutMs:     60000,
      defaultQueryTimeoutMs: 30000,
      keepAliveIntervalMs:  25000,
      emitOwnEvents:        false,
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

      console.log(`[SESSION] 🔄 Restoring: ${entry}`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      restoreSession(entry).catch(() => {});
    }
  } catch (e) {
    console.error('[SESSION] ❌ restoreAllSessions error:', e.message);
  }
}

module.exports = { generatePairingCode, restoreAllSessions, restoreSession };
