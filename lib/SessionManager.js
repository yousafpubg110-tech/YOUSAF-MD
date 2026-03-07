// ============================================================
//   YOUSAF-MD — SESSION MANAGER [FIXED VERSION]
//   Fixed: Connection timeout, pairing reliability
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
    browser:                        Browsers.ubuntu('Chrome'),
    printQRInTerminal:              false,
    logger,
    syncFullHistory:                false,
    markOnlineOnConnect:            false,
    connectTimeoutMs:               120000,  // ← 2 منٹ (پہلے 1 منٹ)
    defaultQueryTimeoutMs:          60000,   // ← 1 منٹ (پہلے 30 سیکنڈ)
    keepAliveIntervalMs:            10000,   // ← 10 سیکنڈ (پہلے 25 سیکنڈ)
    emitOwnEvents:                  false,
    generateHighQualityLinkPreview: false,
    // ← نیا: retry logic
    retryRequestDelayMs:            2000,
    maxMsgRetryCount:               5,
  });

  // ← نیا: socket alive رکھنے کے لیے
  const keepAlive = setInterval(() => {
    if (sock.ws && sock.ws.readyState === 1) {
      sock.ws.ping();
    }
  }, 10000);

  return new Promise((resolve, reject) => {
    // ← نیا: 3 منٹ کا timeout (پہلے 1 منٹ)
    const timeout = setTimeout(() => {
      clearInterval(keepAlive);
      sock.end();
      reject(new Error('⏰ Pairing timeout (3 minutes) — Please try again'));
    }, 180000);

    let codeSent    = false;
    let botStarted  = false;
    let pairingCode = null;

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect } = update;

      // Step 1: Get pairing code
      if (connection === 'connecting' && !codeSent) {
        codeSent = true;
        
        // ← نیا: wait for stable connection
        await new Promise(r => setTimeout(r, 5000));
        
        try {
          const rawCode   = await sock.requestPairingCode(phone.replace(/\D/g, ''));
          pairingCode     = rawCode.match(/.{1,4}/g).join('-');
          
          clearTimeout(timeout);
          // ← نیا: longer wait for user
          const newTimeout = setTimeout(() => {
            clearInterval(keepAlive);
            sock.end();
            reject(new Error('⏰ Code expired — Please generate new code'));
          }, 300000); // 5 منٹ user کو time
          
          resolve({ 
            code: pairingCode, 
            instanceId,
            timeout: newTimeout,
            keepAlive,
            sock,
            sessionPath
          });
          
        } catch (e) {
          reject(new Error('❌ Failed to generate pairing code: ' + e.message));
        }
      }

      // Step 2: User linked — start bot
      if (connection === 'open' && !botStarted) {
        botStarted = true;
        clearInterval(keepAlive);
        console.log('[SESSION] ✅ WhatsApp linked! Starting bot...');

        // Register admin
        const adminJid = phone.replace(/\D/g, '') + '@s.whatsapp.net';
        Database.registerAdmin(adminJid);

        // Start bot
        loader(sock, instanceId);

        // Notify
        try {
          const { notifyConnected } = require('../server');
          notifyConnected(instanceId);
        } catch {}

        // Welcome message
        try {
          const welcomeText = config.WELCOME_TEXT(phone.replace(/\D/g, ''));
          await sock.sendMessage(adminJid, { text: welcomeText });
        } catch (e) {
          console.error('[SESSION] Welcome message failed:', e.message);
        }
      }

      // Step 3: Handle close
      if (connection === 'close') {
        clearInterval(keepAlive);
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        
        console.log('[SESSION] Connection closed — code:', statusCode);

        // If not logged out, reconnect
        if (statusCode !== DisconnectReason.loggedOut && 
            statusCode !== DisconnectReason.forbidden) {
          if (botStarted) {
            setTimeout(() => restoreSession(instanceId, sessionPath), 5000);
          }
        } else {
          fs.remove(sessionPath).catch(() => {});
        }
      }
    });

    // ← نیا: handle socket errors
    sock.ws.on('error', (err) => {
      console.error('[SESSION] Socket error:', err.message);
    });
  });
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
      browser:               Browsers.ubuntu('Chrome'),
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
        console.log('[SESSION] ✅ Restored:', instanceId);
        loader(sock, instanceId);
      }

      if (connection === 'close') {
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        
        if (statusCode !== DisconnectReason.loggedOut && 
            statusCode !== DisconnectReason.forbidden) {
          setTimeout(() => restoreSession(instanceId, sessionPath), 8000);
        } else {
          fs.remove(sessionPath).catch(() => {});
        }
      }
    });

  } catch (e) {
    console.error('[SESSION] ❌ Restore failed:', e.message);
    setTimeout(() => restoreSession(instanceId, sessionPath), 15000);
  }
}

async function restoreAllSessions() {
  try {
    const entries = await fs.readdir(SESSION_DIR);
    for (const entry of entries) {
      const sessionPath = path.join(SESSION_DIR, entry);
      const stat        = await fs.stat(sessionPath).catch(() => null);
      if (!stat || !stat.isDirectory()) continue;

      const credsPath = path.join(sessionPath, 'creds.json');
      if (!await fs.pathExists(credsPath)) continue;

      console.log('[SESSION] 🔄 Restoring:', entry);
      await new Promise(r => setTimeout(r, 2000));
      restoreSession(entry, sessionPath).catch(() => {});
    }
  } catch (e) {
    console.error('[SESSION] ❌ Boot restore error:', e.message);
  }
}

module.exports = { generatePairingCode, restoreSession, restoreAllSessions };
        
