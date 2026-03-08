// ============================================================
//   YOUSAF-MD — SESSION MANAGER
//   Developer: Muhammad Yousaf Baloch
//   Fixed: loader lazy require (circular dependency fix)
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

// FIXED: loader lazy require کریں — circular dependency ختم
// server.js → SessionManager.js → loader.js → PermissionHandler circular تھا
function getLoader() {
  return require('../plugins/loader');
}

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

      if (connection === 'open' && !botStarted) {
        botStarted = true;

        if (!pairingDone) {
          pairingDone = true;
          clearTimeout(giveUp);
          resolve('CONNECTED');
        }

        console.log('[SESSION] ✅ Bot connected! Instance:', instanceId);

        const adminJid = cleanPhone + '@s.whatsapp.net';
        Database.registerAdmin(adminJid);

        // FIXED: lazy require — server پوری طرح load ہو چکا ہے اب
        const loader = getLoader();
        loader(sock, instanceId);

        try {
          const { notifyConnected } = require('../server');
          notifyConnected(instanceId);
        } catch {}

        setTimeout(async () => {
          try {
            await sock.sendMessage(adminJid, {
              text: config.WELCOME_TEXT(cleanPhone),
            });
            console.log('[SESSION] Welcome sent to:', adminJid);
          } catch (e) {
            console.error('[SESSION] Welcome failed:', e.message);
          }
        }, 3000);

        return;
      }

      if (connection === 'close') {
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        console.log('[SESSION] Closed — code:', statusCode, '| botStarted:', botStarted);

        activeSessions.delete(instanceId);

        const permanentLogout =
          statusCode === DisconnectReason.loggedOut  ||
          statusCode === DisconnectReason.forbidden  ||
          statusCode === DisconnectReason.badSession;

        if (permanentLogout) {
          console.log('[SESSION] Permanent logout — removing session');
          fs.remove(sessionPath).catch(() => {});
          if (!pairingDone) {
            pairingDone = true;
            clearTimeout(giveUp);
            reject(new Error('WhatsApp rejected. Please try again.'));
          }
          return;
        }

        if (!pairingDone) {
          pairingDone = true;
          clearTimeout(giveUp);
          reject(new Error('Connection closed. Please try again.'));
          return;
        }

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
        console.log('[SESSION] ✅ Session restored:', instanceId);
        const loader = getLoader();
        loader(sock, instanceId);

        // Welcome message on restore
        const adminJid = Database.getAdmin();
        if (adminJid) {
          const phone = adminJid.replace('@s.whatsapp.net', '');
          setTimeout(async () => {
            try {
              await sock.sendMessage(adminJid, {
                text: config.WELCOME_TEXT(phone),
              });
              console.log('[SESSION] Welcome sent to:', adminJid);
            } catch {}
          }, 3000);
        }
      }

      if (connection === 'close') {
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        activeSessions.delete(instanceId);

        const permanentLogout =
          statusCode === DisconnectReason.loggedOut  ||
          statusCode === DisconnectReason.forbidden  ||
          statusCode === DisconnectReason.badSession;

        if (permanentLogout) {
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
  
