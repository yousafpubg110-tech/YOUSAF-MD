 // ============================================================
//   YOUSAF-MD — SESSION MANAGER
//   Developer: Muhammad Yousaf Baloch
//   Fixed: dual handler bug, connecting event skip, Heroku ws
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

const activeSessions = new Map();

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
    connectTimeoutMs:               60000,
    defaultQueryTimeoutMs:          30000,
    keepAliveIntervalMs:            8000,
    emitOwnEvents:                  true,
    generateHighQualityLinkPreview: false,
  });

  activeSessions.set(instanceId, sock);
  sock.ev.on('creds.update', saveCreds);

  // ── SINGLE unified handler for all events ────────────────
  // Avoids dual-handler bug — one handler manages full lifecycle
  let pairingDone = false;
  let botStarted  = false;
  let codeResolve = null;
  let codeReject  = null;

  const codePromise = new Promise((res, rej) => {
    codeResolve = res;
    codeReject  = rej;
  });

  const giveUp = setTimeout(() => {
    if (!pairingDone) codeReject(new Error('Timeout — please try again.'));
  }, 60000);

  sock.ev.on('connection.update', async ({ connection, lastDisconnect }) => {
    console.log('[SESSION] connection.update:', connection, '| instanceId:', instanceId);

    // ── Step 1: Request pairing code ──────────────────────
    if (connection === 'connecting' && !pairingDone) {
      pairingDone = true;
      clearTimeout(giveUp);

      // Give socket 2s to complete handshake
      await new Promise(r => setTimeout(r, 2000));

      try {
        const raw       = await sock.requestPairingCode(cleanPhone);
        const formatted = raw.includes('-') ? raw : raw.slice(0, 4) + '-' + raw.slice(4);
        console.log('[SESSION] Pairing code generated:', formatted);
        codeResolve(formatted);
      } catch (e1) {
        console.log('[SESSION] First attempt failed, retrying in 3s...');
        await new Promise(r => setTimeout(r, 3000));
        try {
          const raw       = await sock.requestPairingCode(cleanPhone);
          const formatted = raw.includes('-') ? raw : raw.slice(0, 4) + '-' + raw.slice(4);
          console.log('[SESSION] Pairing code generated (retry):', formatted);
          codeResolve(formatted);
        } catch (e2) {
          codeReject(new Error('Pairing code failed: ' + e2.message));
        }
      }
      return;
    }

    // ── Step 2: User entered code — bot is now OPEN ────────
    if (connection === 'open' && !botStarted) {
      botStarted = true;

      // If somehow pairing code was not sent yet (edge case), resolve with dummy
      if (!pairingDone) {
        pairingDone = true;
        clearTimeout(giveUp);
        codeResolve('ALREADY-OPEN');
      }

      console.log('[SESSION] ✅ Bot connected! Instance:', instanceId);

      const adminJid = cleanPhone + '@s.whatsapp.net';
      Database.registerAdmin(adminJid);
      loader(sock, instanceId);

      try {
        const { notifyConnected } = require('../server');
        notifyConnected(instanceId);
      } catch {}

      try {
        await sock.sendMessage(adminJid, { text: config.WELCOME_TEXT(cleanPhone) });
      } catch {}

      return;
    }

    // ── Step 3: Disconnected ──────────────────────────────
    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const loggedOut  = statusCode === DisconnectReason.loggedOut;
      const forbidden  = statusCode === DisconnectReason.forbidden;

      activeSessions.delete(instanceId);
      console.log('[SESSION] Disconnected — code:', statusCode, '| botStarted:', botStarted);

      // If closed before pairing code was even sent
      if (!pairingDone) {
        pairingDone = true;
        clearTimeout(giveUp);
        codeReject(new Error('WhatsApp closed connection. Please try again.'));
        return;
      }

      if (loggedOut || forbidden) {
        console.log('[SESSION] Logged out — removing session:', instanceId);
        fs.remove(sessionPath).catch(() => {});
        return;
      }

      if (botStarted) {
        console.log('[SESSION] Reconnecting in 5s:', instanceId);
        setTimeout(() => restoreSession(instanceId, sessionPath), 5000);
      }
    }
  });

  const code = await codePromise;
  return { code, instanceId };
}

// ── RESTORE EXISTING SESSION ON BOOT ─────────────────────
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
      connectTimeoutMs:      60000,
      defaultQueryTimeoutMs: 30000,
      keepAliveIntervalMs:   8000,
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
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        const loggedOut  = statusCode === DisconnectReason.loggedOut;
        const forbidden  = statusCode === DisconnectReason.forbidden;

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
    setTimeout(() => restoreSession(instanceId, sessionPath), 15000);
  }
}

// ── RESTORE ALL SESSIONS ON BOOT ─────────────────────────
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
