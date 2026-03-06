// ============================================================
//   YOUSAF-MD — SESSION MANAGER (DUAL-ACTION ENGINE) [FIXED]
//   FIXES: Dead import removed | Double-boot fixed | Phone
//          validation added | notifyConnected wired properly
//   Developer: Muhammad Yousaf Baloch
// ============================================================

'use strict';

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
} = require('@whiskeysockets/baileys');

const pino         = require('pino');
const path         = require('path');
const fs           = require('fs-extra');
const { v4: uuid } = require('uuid');

const Database = require('./Database');
const config   = require('../config');

const SESSION_DIR = path.resolve(config.SESSION_DIR);
const logger      = pino({ level: 'silent' });

const WELCOME_IMG = 'https://raw.githubusercontent.com/yousafpubg110-tech/YOUSAF-MD/main/assets/welcome.jpg';

// Active socket map: instanceId → socket
const activeSockets = new Map();

// ── BOOT A BOT INSTANCE ────────────────────────────────────
async function bootInstance(instanceId, onConnected) {
  const sessionPath = path.join(SESSION_DIR, instanceId);
  await fs.ensureDir(sessionPath);

  const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
  const { version }          = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    logger,
    printQRInTerminal:              false,
    auth: {
      creds: state.creds,
      keys:  makeCacheableSignalKeyStore(state.keys, logger),
    },
    browser:                        ['YOUSAF-MD', 'Chrome', '3.0.0'],
    connectTimeoutMs:               60_000,
    defaultQueryTimeoutMs:          0,
    keepAliveIntervalMs:            10_000,
    generateHighQualityLinkPreview: true,
    syncFullHistory:                false,
  });

  // Load all plugins into this socket instance
  require('../plugins/loader')(sock, instanceId);

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === 'open') {
      const jid = sock.user?.id?.replace(/:.*@/, '@') || '';
      console.log(`[SESSION] ✅ Instance ${instanceId} connected: ${jid}`);

      activeSockets.set(instanceId, sock);
      Database.registerAdmin(jid, instanceId);
      Database.setInstance(instanceId, {
        jid,
        instanceId,
        connectedAt: Date.now(),
        status:      'active',
      });

      if (typeof onConnected === 'function') onConnected(sock, jid, instanceId);

      // FIXED: notify web dashboard socket — lazy require to avoid circular dep
      try {
        const srv = require('../server');
        if (typeof srv.notifyConnected === 'function') srv.notifyConnected(instanceId);
      } catch {}

      // Dual-Action: send private welcome message
      await _sendWelcome(sock, jid, instanceId);
    }

    if (connection === 'close') {
      const statusCode      = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

      console.log(`[SESSION] ⚠️  Instance ${instanceId} closed. Code: ${statusCode}. Reconnect: ${shouldReconnect}`);

      activeSockets.delete(instanceId);
      Database.set(`instances.${instanceId}.status`, shouldReconnect ? 'reconnecting' : 'logged_out');

      if (shouldReconnect) {
        setTimeout(() => bootInstance(instanceId, onConnected), 5000);
      }
    }
  });

  return sock;
}

// ── GENERATE PAIRING CODE ──────────────────────────────────
async function generatePairingCode(phoneNumber) {
  const cleaned = String(phoneNumber).replace(/\D/g, '');
  if (!cleaned || cleaned.length < 10 || cleaned.length > 15) {
    throw new Error('Invalid phone number. Use digits only with country code (e.g. 923001234567).');
  }

  const instanceId  = uuid();
  const sessionPath = path.join(SESSION_DIR, instanceId);
  await fs.ensureDir(sessionPath);

  const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
  const { version }          = await fetchLatestBaileysVersion();

  const tempSock = makeWASocket({
    version,
    logger,
    printQRInTerminal: false,
    auth: {
      creds: state.creds,
      keys:  makeCacheableSignalKeyStore(state.keys, logger),
    },
    browser: ['YOUSAF-MD', 'Chrome', '3.0.0'],
  });

  tempSock.ev.on('creds.update', saveCreds);

  await new Promise(r => setTimeout(r, 2500));

  const rawCode = await tempSock.requestPairingCode(cleaned);
  const code    = rawCode?.match(/.{1,4}/g)?.join('-') || rawCode;

  let booted = false;

  tempSock.ev.on('connection.update', async (update) => {
    if (update.connection === 'open' && !booted) {
      booted = true;
      console.log(`[SESSION] 🔗 Pairing successful → ${instanceId}`);
      tempSock.ev.removeAllListeners();
      tempSock.ws?.close();
      setTimeout(() => bootInstance(instanceId), 1000);
    }
  });

  return { code, instanceId };
}

// ── SEND PRIVATE WELCOME (DUAL-ACTION) ────────────────────
async function _sendWelcome(sock, jid, instanceId) {
  try {
    await new Promise(r => setTimeout(r, 3000));
    const text = config.WELCOME_TEXT(jid, instanceId);
    await sock.sendMessage(jid, {
      image: { url: WELCOME_IMG },
      caption: text,
    });
    console.log(`[SESSION] 📩 Welcome sent → ${jid}`);
  } catch (e) {
    console.error('[SESSION] Welcome error:', e.message);
  }
}

// ── RESTORE ALL SESSIONS ON STARTUP ───────────────────────
async function restoreAllSessions() {
  await fs.ensureDir(SESSION_DIR);
  const entries = await fs.readdir(SESSION_DIR);

  let count = 0;
  for (const entry of entries) {
    const fullPath  = path.join(SESSION_DIR, entry);
    const stat      = await fs.stat(fullPath).catch(() => null);
    if (!stat?.isDirectory()) continue;

    const credsFile = path.join(fullPath, 'creds.json');
    if (!fs.existsSync(credsFile)) continue;

    console.log(`[SESSION] 🔄 Restoring: ${entry}`);
    await bootInstance(entry).catch(e =>
      console.error(`[SESSION] Restore failed for ${entry}:`, e.message)
    );
    count++;
    await new Promise(r => setTimeout(r, 3000));
  }

  console.log(`[SESSION] ✅ Restored ${count} instance(s)`);
}

function getSocket(instanceId) { return activeSockets.get(instanceId) || null; }
function getAllSockets()        { return activeSockets; }

module.exports = { bootInstance, generatePairingCode, restoreAllSessions, getSocket, getAllSockets };
