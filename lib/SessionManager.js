// ============================================================
//   YOUSAF-MD — SESSION MANAGER (STABLE ENGINE)
//   FIXES: Auto-Session Cleanup | Sync Delay | Code Rejection
//   Developer: Muhammad Yousaf Baloch
// ============================================================

'use strict';

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  Browsers 
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

      console.log(`[SESSION] ⚠️ Instance ${instanceId} closed. Code: ${statusCode}`);

      activeSockets.delete(instanceId);
      if (shouldReconnect) {
        setTimeout(() => bootInstance(instanceId, onConnected), 5000);
      }
    }
  });

  return sock;
}

// ── GENERATE PAIRING CODE (FIXED LOGIC) ────────────────────
async function generatePairingCode(phoneNumber) {
  const cleaned = String(phoneNumber).replace(/\D/g, '');
  if (!cleaned || cleaned.length < 10) {
    throw new Error('Invalid phone number.');
  }

  // سیشن کلین اپ: ہر بار نیا آئی ڈی اور صاف ستھرا فولڈر
  const instanceId  = uuid();
  const sessionPath = path.join(SESSION_DIR, instanceId);
  
  if (fs.existsSync(sessionPath)) {
    await fs.remove(sessionPath);
  }
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
    browser: Browsers.ubuntu('Chrome'), 
  });

  tempSock.ev.on('creds.update', saveCreds);

  // 5 سیکنڈ کا انتظار تاکہ واٹس ایپ سرور ریڈی ہو جائے
  await new Promise(r => setTimeout(r, 5000)); 

  if (!tempSock.authState.creds.registered) {
    const rawCode = await tempSock.requestPairingCode(cleaned);
    const code    = rawCode?.match(/.{1,4}/g)?.join('-') || rawCode;

    let booted = false;
    tempSock.ev.on('connection.update', async (update) => {
      if (update.connection === 'open' && !booted) {
        booted = true;
        console.log(`[SESSION] 🔗 Pairing Success: ${instanceId}`);
        tempSock.ev.removeAllListeners();
        setTimeout(() => {
          tempSock.ws?.close();
          bootInstance(instanceId);
        }, 2000);
      }
    });

    return { code, instanceId };
  } else {
    throw new Error('Number already registered.');
  }
}

async function _sendWelcome(sock, jid, instanceId) {
  try {
    await new Promise(r => setTimeout(r, 3000));
    const text = config.WELCOME_TEXT(jid, instanceId);
    await sock.sendMessage(jid, {
      image: { url: WELCOME_IMG },
      caption: text,
    });
  } catch (e) {
    console.error('[SESSION] Welcome error:', e.message);
  }
}

async function restoreAllSessions() {
  await fs.ensureDir(SESSION_DIR);
  const entries = await fs.readdir(SESSION_DIR);
  for (const entry of entries) {
    const fullPath = path.join(SESSION_DIR, entry);
    if (fs.existsSync(path.join(fullPath, 'creds.json'))) {
      await bootInstance(entry).catch(() => {});
      await new Promise(r => setTimeout(r, 3000));
    }
  }
}

function getSocket(instanceId) { return activeSockets.get(instanceId) || null; }
function getAllSockets()        { return activeSockets; }

module.exports = { bootInstance, generatePairingCode, restoreAllSessions, getSocket, getAllSockets };
