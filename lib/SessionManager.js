// ============================================================
//   YOUSAF-MD — SESSION MANAGER (DUAL-ACTION ENGINE) [FIXED]
//   FIXES: Browser Configuration Fixed for WhatsApp Notification
//   Developer: Muhammad Yousaf Baloch
// ============================================================

'use strict';

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  Browsers // Added Browsers for official mapping
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

const activeSockets = new Map();

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
    // FIXED: Using official Ubuntu/Chrome mapping to ensure notification arrives
    browser: Browsers.ubuntu('Chrome'), 
    connectTimeoutMs:               60_000,
    defaultQueryTimeoutMs:          0,
    keepAliveIntervalMs:            10_000,
    generateHighQualityLinkPreview: true,
    syncFullHistory:                false,
  });

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

      try {
        const srv = require('../server');
        if (typeof srv.notifyConnected === 'function') srv.notifyConnected(instanceId);
      } catch {}

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

async function generatePairingCode(phoneNumber) {
  const cleaned = String(phoneNumber).replace(/\D/g, '');
  if (!cleaned || cleaned.length < 10 || cleaned.length > 15) {
    throw new Error('Invalid phone number. Use digits only with country code.');
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
    // FIXED: Matches official browser signature for pairing request
    browser: Browsers.ubuntu('Chrome'), 
  });

  tempSock.ev.on('creds.update', saveCreds);

  await new Promise(r => setTimeout(r, 3000)); // Slightly increased for stability

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
