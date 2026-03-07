// ============================================================
//   YOUSAF-MD — SESSION MANAGER
//   Developer: Muhammad Yousaf Baloch
//   Rewritten: Simple & reliable pairing flow
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

// ── ACTIVE SOCKETS MAP ────────────────────────────────────
const activeSessions = new Map();

// ── CLEAN TEMP FILES ─────────────────────────────────────
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

// ── GENERATE PAIRING CODE ────────────────────────────────
async function generatePairingCode(phone) {
  const cleanPhone  = phone.replace(/\D/g, '');
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
    connectTimeoutMs:               60_000,
    defaultQueryTimeoutMs:          30_000,
    keepAliveIntervalMs:            10_000,
    emitOwnEvents:                  true,
    generateHighQualityLinkPreview: false,
  });

  activeSessions.set(instanceId, sock);

  // ── GET PAIRING CODE ────────────────────────────────────
  const code = await new Promise((resolve, reject) => {
    const giveUp = setTimeout(() => {
      reject(new Error('Timeout — WhatsApp server did not respond. Try again.'));
    }, 60_000);

    let pairingRequested = false;

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async ({ connection, lastDisconnect, qr }) => {

      // WhatsApp is ready — request pairing code once
      if (connection === 'open' && !pairingRequested) {
        // Edge case: already open before we request — should not happen in fresh session
        clearTimeout(giveUp);
        resolve('ALREADY_OPEN');
        return;
      }

      if (connection === 'connecting' && !pairingRequested) {
        pairingRequested = true;

        // Wait for socket to fully handshake then request code
        await new Promise(r => setTimeout(r, 2500));

        try {
          const raw = await sock.requestPairingCode(cleanPhone);
          const formatted = raw.includes('-') ? raw : raw.slice(0, 4) + '-' + raw.slice(4);
          clearTimeout(giveUp);
          resolve(formatted);
        } catch (err) {
          // One retry after 3s
          await new Promise(r => setTimeout(r, 3000));
          try {
            const raw = await sock.requestPairingCode(cleanPhone);
            const formatted = raw.includes('-') ? raw : raw.slice(0, 4) + '-' + raw.slice(4);
            clearTimeout(giveUp);
            resolve(formatted);
          } catch (err2) {
            clearTimeout(giveUp);
            reject(new Error('Could not get pairing code: ' + err2.message));
          }
        }
        return;
      }

      if (connection === 'close' && !pairingRequested) {
        clearTimeout(giveUp);
        reject(new Error('Connection closed before pairing. Please try again.'));
      }
    });
  });

  // ── WATCH FOR OPEN (user enters code in WhatsApp) ───────
  _watchSession(sock, instanceId, sessionPath, cleanPhone);

  return { code, instanceId };
}

// ── WATCH SESSION — fires when user enters code ──────────
function _watchSession(sock, instanceId, sessionPath, phone) {
  let botStarted = false;

  sock.ev.on('connection.update', async ({ connection, lastDisconnect }) => {

    if (connection === 'open' && !botStarted) {
      botStarted = true;
      console.log('[SESSION] ✅ Bot connected! Instance:', instanceId);

      // Register admin
      const adminJid = phone + '@s.whatsapp.net';
      Database.registerAdmin(adminJid);

      // Load all plugins
      loader(sock, instanceId);

      // Notify dashboard via socket.io
      try {
        const { notifyConnected } = require('../server');
        notifyConnected(instanceId);
      } catch {}

      // Send welcome message
      try {
        await sock.sendMessage(adminJid, {
          text: config.WELCOME_TEXT(phone),
        });
      } catch {}
    }

    if (connection === 'close') {
      const code         = lastDisconnect?.error?.output?.statusCode;
      const loggedOut    = code === DisconnectReason.loggedOut;
      const forbidden    = code === DisconnectReason.forbidden;

      activeSessions.delete(instanceId);

      if (loggedOut || forbidden) {
        console.log('[SESSION] Logged out — removing session:', instanceId);
        fs.remove(sessionPath).catch(() => {});
        return;
      }

      if (botStarted) {
        console.log('[SESSION] Reconnecting in 5s — instance:', instanceId);
        setTimeout(() => restoreSession(instanceId, sessionPath), 5000);
      }
    }
  });
}

// ── RESTORE EXISTING SESSION ON BOOT ────────────────────
async function restoreSession(instanceId, sessionPath) {
  if (!sessionPath) sessionPath = path.join(SESSION_DIR, instanceId);
  if (!await fs.pathExists(sessionPath)) return;
  if (!await fs.pathExists(path.join(sessionPath, 'creds.json'))) return;

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
      connectTimeoutMs:      60_000,
      defaultQueryTimeoutMs: 30_000,
      keepAliveIntervalMs:   10_000,
      emitOwnEvents:         true,
    });

    activeSessions.set(instanceId, sock);
    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async ({ connection, lastDisconnect }) => {
      if (connection === 'open') {
        console.log('[SESSION] ✅ Session restored:', instanceId);
        loader(sock, instanceId);
      }

      if (connection === 'close') {
        const code      = lastDisconnect?.error?.output?.statusCode;
        const loggedOut = code === DisconnectReason.loggedOut;
        const forbidden = code === DisconnectReason.forbidden;

        activeSessions.delete(instanceId);

        if (loggedOut || forbidden) {
          fs.remove(sessionPath).catch(() => {});
          return;
        }

        setTimeout(() => restoreSession(instanceId, sessionPath), 8000);
      }
    });

  } catch (e) {
    console.error('[SESSION] Restore error:', e.message);
    setTimeout(() => restoreSession(instanceId, sessionPath), 15_000);
  }
}

// ── RESTORE ALL SESSIONS ON BOOT ────────────────────────
async function restoreAllSessions() {
  try {
    const entries = await fs.readdir(SESSION_DIR);
    for (const entry of entries) {
      const sessionPath = path.join(SESSION_DIR, entry);
      const stat        = await fs.stat(sessionPath).catch(() => null);
      if (!stat || !stat.isDirectory()) continue;

      const credsExist = await fs.pathExists(path.join(sessionPath, 'creds.json'));
      if (!credsExist) continue;

      console.log('[SESSION] Restoring on boot:', entry);
      await new Promise(r => setTimeout(r, 1500));
      restoreSession(entry, sessionPath).catch(() => {});
    }
  } catch (e) {
    console.error('[SESSION] Boot restore error:', e.message);
  }
}

module.exports = { generatePairingCode, restoreSession, restoreAllSessions };
