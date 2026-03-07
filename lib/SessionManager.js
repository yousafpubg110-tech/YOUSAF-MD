// ============================================================
//   YOUSAF-MD — SESSION MANAGER [FIXED]
//   Fixes: Browser fingerprint, session cleanup, sync delay
//   Baileys: 6.7.10 compatible
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

// Silent logger — prevent pino from slowing server
const logger = pino({ level: 'silent' });

// ── CLEAN STALE SESSION FILES ─────────────────────────────
// Removes temp/corrupt files before starting new session
async function cleanSessionFiles(sessionPath) {
  try {
    const files = await fs.readdir(sessionPath);
    for (const file of files) {
      // Remove temp files and lock files that may corrupt session
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

  // Clean any stale files first
  await cleanSessionFiles(sessionPath);

  const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
  const { version }          = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: {
      creds:    state.creds,
      keys:     makeCacheableSignalKeyStore(state.keys, logger),
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
    fireInitQueries:      false,
    generateHighQualityLinkPreview: false,
  });

  // Request pairing code ONLY after WhatsApp signals it is ready
  // We wait for the 'connecting' state which means the handshake has started
  const code = await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Pairing code timeout — please try again'));
    }, 60000);

    let codeSent = false;

    sock.ev.on('connection.update', async (update) => {
      const { connection } = update;

      // 'connecting' means the WebSocket is open and handshake has begun
      // This is the correct moment to request the pairing code
      if (connection === 'connecting' && !codeSent) {
        codeSent = true;
        clearTimeout(timeout);

        try {
          const rawCode = await sock.requestPairingCode(phone.replace(/\D/g, ''));
          const formatted = rawCode && !rawCode.includes('-')
            ? rawCode.slice(0, 4) + '-' + rawCode.slice(4)
            : rawCode;
          resolve(formatted);
        } catch (e) {
          // Single retry after 3 seconds
          setTimeout(async () => {
            try {
              const rawCode = await sock.requestPairingCode(phone.replace(/\D/g, ''));
              const formatted = rawCode && !rawCode.includes('-')
                ? rawCode.slice(0, 4) + '-' + rawCode.slice(4)
                : rawCode;
              resolve(formatted);
            } catch (e2) {
              reject(new Error('Failed to get pairing code: ' + e2.message));
            }
          }, 3000);
        }
      }

      if (connection === 'close' && !codeSent) {
        clearTimeout(timeout);
        reject(new Error('WhatsApp closed connection before pairing — please try again'));
      }
    });
  });

  // Save instance to database
  Database.createInstance(instanceId, phone, sock);

  // ── Handle connection events after pairing ──────────────
  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === 'open') {
      console.log(`[SESSION] ✅ Bot connected: ${instanceId}`);

      // Load plugins
      loader(sock, instanceId);

      // Update DB status
      Database.setConnected(instanceId, sock);

      // Notify dashboard via server
      try {
        const { notifyConnected } = require('../server');
        notifyConnected(instanceId);
      } catch {}

      // Send welcome message to owner
      try {
        const welcomeText = config.WELCOME_TEXT(phone + '@s.whatsapp.net', instanceId);
        await sock.sendMessage(phone + '@s.whatsapp.net', { text: welcomeText });
      } catch {}
    }

    if (connection === 'close') {
      const code     = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = code !== DisconnectReason.loggedOut &&
                              code !== DisconnectReason.forbidden;

      console.log(`[SESSION] ❌ Disconnected: ${instanceId} — code: ${code}`);

      if (shouldReconnect) {
        console.log(`[SESSION] 🔄 Reconnecting: ${instanceId}`);
        setTimeout(() => restoreSession(instanceId), 5000);
      } else {
        console.log(`[SESSION] 🗑️ Removing session: ${instanceId}`);
        Database.removeInstance(instanceId);
        fs.remove(sessionPath).catch(() => {});
      }
    }
  });

  return { code, instanceId };
}

// ── RESTORE SESSION (on server restart) ──────────────────
async function restoreSession(instanceId) {
  const sessionPath = path.join(SESSION_DIR, instanceId);

  if (!await fs.pathExists(sessionPath)) return;

  // Clean stale files before restoring
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
        const code            = lastDisconnect?.error?.output?.statusCode;
        const shouldReconnect = code !== DisconnectReason.loggedOut &&
                                code !== DisconnectReason.forbidden;

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
    // Retry after 15 seconds
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

      // Check if it has creds file (valid session)
      const credsPath = path.join(sessionPath, 'creds.json');
      if (!await fs.pathExists(credsPath)) continue;

      console.log(`[SESSION] 🔄 Restoring session: ${entry}`);
      // Stagger restores to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
      restoreSession(entry).catch(() => {});
    }
  } catch (e) {
    console.error('[SESSION] ❌ restoreAllSessions error:', e.message);
  }
}

module.exports = { generatePairingCode, restoreAllSessions, restoreSession };
