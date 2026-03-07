// ============================================================
//   YOUSAF-MD — SESSION MANAGER
//   Developer: Muhammad Yousaf Baloch
//   Fixed: code 515 reconnect, unified handler, config JID fix
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

// ── HELPERS ───────────────────────────────────────────────
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

function makeSocket(state, version) {
  return makeWASocket({
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
  const sock                 = makeSocket(state, version);

  activeSessions.set(instanceId, sock);
  sock.ev.on('creds.update', saveCreds);

  let pairingDone = false;
  let botStarted  = false;

  const code = await new Promise((resolve, reject) => {
    const giveUp = setTimeout(() => {
      if (!pairingDone) reject(new Error('Timeout — please try again.'));
    }, 60000);

    sock.ev.on('connection.update', async ({ connection, lastDisconnect }) => {
      console.log('[SESSION] update:', connection, '| code:', lastDisconnect?.error?.output?.statusCode);

      // ── STEP 1: Request pairing code ─────────────────
      if (connection === 'connecting' && !pairingDone) {
        pairingDone = true;
        clearTimeout(giveUp);

        await new Promise(r => setTimeout(r, 2000));

        try {
          const raw       = await sock.requestPairingCode(cleanPhone);
          const formatted = raw.includes('-') ? raw : raw.slice(0, 4) + '-' + raw.slice(4);
          console.log('[SESSION] Code:', formatted);
          resolve(formatted);
        } catch (e1) {
          await new Promise(r => setTimeout(r, 3000));
          try {
            const raw       = await sock.requestPairingCode(cleanPhone);
            const formatted = raw.includes('-') ? raw : raw.slice(0, 4) + '-' + raw.slice(4);
            console.log('[SESSION] Code (retry):', formatted);
            resolve(formatted);
          } catch (e2) {
            reject(new Error('Pairing code failed: ' + e2.message));
          }
        }
        return;
      }

      // ── STEP 2: Bot connected ─────────────────────────
      if (connection === 'open' && !botStarted) {
        botStarted = true;

        if (!pairingDone) {
          pairingDone = true;
          clearTimeout(giveUp);
          resolve('CONNECTED');
        }

        console.log('[SESSION] ✅ Connected! Instance:', instanceId);

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

      // ── STEP 3: Disconnect handling ───────────────────
      if (connection === 'close') {
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        console.log('[SESSION] Close code:', statusCode, '| botStarted:', botStarted);

        activeSessions.delete(instanceId);

        // Code 515 = restart_required — reconnect with same creds
        // Code 428 = connection replaced — reconnect
        // Code 408 = timed out — reconnect
        const shouldReconnect =
          statusCode !== DisconnectReason.loggedOut &&
          statusCode !== DisconnectReason.forbidden &&
          statusCode !== DisconnectReason.badSession;

        if (!shouldReconnect) {
          console.log('[SESSION] Permanent logout — removing session');
          fs.remove(sessionPath).catch(() => {});
          if (!pairingDone) {
            pairingDone = true;
            clearTimeout(giveUp);
            reject(new Error('WhatsApp rejected the connection. Please try again.'));
          }
          return;
        }

        // If code was not yet sent — this is a pre-pairing close
        if (!pairingDone) {
          pairingDone = true;
          clearTimeout(giveUp);
          reject(new Error('Connection closed before pairing. Please try again.'));
          return;
        }

        // Reconnect after pairing or after bot was running
        console.log('[SESSION] Reconnecting in 3s...');
        setTimeout(() => restoreSession(instanceId, sessionPath), 3000);
      }
    });
  });

  return { code, instanceId };
}

// ── RESTORE SESSION ───────────────────────────────────────
async function restoreSession(instanceId, sessionPath) {
  if (!sessionPath) sessionPath = path.join(SESSION_DIR, instanceId);
  if (!await fs.pathExists(sessionPath)) return;
  if (!await fs.pathExists(path.join(sessionPath, 'creds.json'))) return;

  await cleanSessionFiles(sessionPath);

  try {
    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
    const { version }          = await fetchLatestBaileysVersion();
    const sock                 = makeSocket(state, version);

    activeSessions.set(instanceId, sock);
    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async ({ connection, lastDisconnect }) => {
      if (connection === 'open') {
        console.log('[SESSION] ✅ Restored:', instanceId);
        loader(sock, instanceId);
      }

      if (connection === 'close') {
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        activeSessions.delete(instanceId);

        const shouldReconnect =
          statusCode !== DisconnectReason.loggedOut &&
          statusCode !== DisconnectReason.forbidden &&
          statusCode !== DisconnectReason.badSession;

        if (!shouldReconnect) {
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

// ── RESTORE ALL ON BOOT ───────────────────────────────────
async function restoreAllSessions() {
  try {
    const entries = await fs.readdir(SESSION_DIR);
    for (const entry of entries) {
      const sessionPath = path.join(SESSION_DIR, entry);
      const stat        = await fs.stat(sessionPath).catch(() => null);
      if (!stat?.isDirectory()) continue;
      if (!await fs.pathExists(path.join(sessionPath, 'creds.json'))) continue;

      console.log('[SESSION] Restoring on boot:', entry);
      await new Promise(r => setTimeout(r, 1500));
      restoreSession(entry, sessionPath).catch(() => {});
    }
  } catch (e) {
    console.error('[SESSION] Boot restore error:', e.message);
  }
}

module.exports = { generatePairingCode, restoreSession, restoreAllSessions };
    
