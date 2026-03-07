// ============================================================
//   YOUSAF-MD — SESSION MANAGER
//   Fixed: removed old DB calls, correct admin registration
//   single connection.update handler, no session ID leak
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

const path           = require('path');
const fs             = require('fs-extra');
const pino           = require('pino');
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
    browser:                        Browsers.macOS('Chrome'),  // ✅ FIXED
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

  // Single handler for entire lifecycle
  const code = await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Pairing code timeout — please try again'));
    }, 60000);

    let codeSent    = false;
    let connectSeen = false;
    let botStarted  = false;

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect } = update;

      // Step 1: Get pairing code on first connecting event
      if (connection === 'connecting' && !connectSeen && !codeSent) {
        connectSeen = true;

        setTimeout(async () => {
          if (codeSent) return;
          codeSent = true;
          clearTimeout(timeout);

          try {
            const rawCode   = await sock.requestPairingCode(phone.replace(/\D/g, ''));
            const formatted = rawCode && !rawCode.includes('-')
              ? rawCode.slice(0, 4) + '-' + rawCode.slice(4)
              : rawCode;
            resolve(formatted);
          } catch (e) {
            setTimeout(async () => {
              try {
                const rawCode   = await sock.requestPairingCode(phone.replace(/\D/g, ''));
                const formatted = rawCode && !rawCode.includes('-')
                  ? rawCode.slice(0, 4) + '-' + rawCode.slice(4)
                  : rawCode;
                resolve(formatted);
              } catch (e2) {
                reject(new Error('Failed to get pairing code: ' + e2.message));
              }
            }, 2000);
          }
        }, 1500);
      }

      // Step 2: User entered code in WhatsApp — now start bot
      if (connection === 'open' && !botStarted) {
        botStarted = true;
        console.log('[SESSION] Bot connected successfully');

        // Register paired number as admin
        const adminJid = phone.replace(/\D/g, '') + '@s.whatsapp.net';
        Database.registerAdmin(adminJid);

        // Load plugins
        loader(sock, instanceId);

        // Notify dashboard
        try {
          const { notifyConnected } = require('../server');
          notifyConnected(instanceId);
        } catch {}

        // Welcome message — no session ID
        try {
          const welcomeText = config.WELCOME_TEXT(phone.replace(/\D/g, ''));
          await sock.sendMessage(adminJid, { text: welcomeText });
        } catch {}
      }

      // Step 3: Disconnect handling
      if (connection === 'close' && botStarted) {
        const statusCode      = lastDisconnect?.error?.output?.statusCode;
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut &&
                                statusCode !== DisconnectReason.forbidden;

        console.log('[SESSION] Disconnected — code:', statusCode);

        if (shouldReconnect) {
          setTimeout(() => restoreSession(instanceId, sessionPath), 5000);
        } else {
          console.log('[SESSION] Logged out — clearing session');
          fs.remove(sessionPath).catch(() => {});
        }
      }

      if (connection === 'close' && !codeSent) {
        clearTimeout(timeout);
        reject(new Error('WhatsApp closed connection — please try again'));
      }
    });
  });

  return { code, instanceId };
}

async function restoreSession(instanceId, sessionPath) {
  if (!sessionPath) sessionPath = path.join(SESSION_DIR, instanceId);
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
      browser:               Browsers.macOS('Chrome'),  // ✅ FIXED
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
        console.log('[SESSION] Session restored:', instanceId);
        loader(sock, instanceId);
      }

      if (connection === 'close') {
        const statusCode      = lastDisconnect?.error?.output?.statusCode;
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut &&
                                statusCode !== DisconnectReason.forbidden;

        if (shouldReconnect) {
          setTimeout(() => restoreSession(instanceId, sessionPath), 8000);
        } else {
          fs.remove(sessionPath).catch(() => {});
        }
      }
    });

  } catch (e) {
    console.error('[SESSION] Restore failed:', e.message);
    setTimeout(() => restoreSession(instanceId, sessionPath), 15000);
  }
}

async function restoreAllSessions() {
  try {
    const entries = await fs.readdir(SESSION_DIR);
    for (const entry of entries) {
      const sessionPath = path.join(SESSION_DIR, entry);
      const stat        = await fs.stat(sessionPath);
      if (!stat.isDirectory()) continue;

      const credsPath = path.join(sessionPath, 'creds.json');
      if (!await fs.pathExists(credsPath)) continue;

      console.log('[SESSION] Restoring on boot:', entry);
      await new Promise(resolve => setTimeout(resolve, 2000));
      restoreSession(entry, sessionPath).catch(() => {});
    }
  } catch (e) {
    console.error('[SESSION] Boot restore error:', e.message);
  }
}

module.exports = { generatePairingCode, restoreSession, restoreAllSessions };
