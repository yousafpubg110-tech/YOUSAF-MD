// ============================================================
//   YOUSAF-MD — SESSION MANAGER [HEROKU COMPATIBLE]
//   Fixed: Error 515 by separating pairing from connection
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

// Store for pending pairings
const pendingPairings = new Map();

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

  // Create temporary socket just to get pairing code
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
    connectTimeoutMs:               30000,
    defaultQueryTimeoutMs:          20000,
    keepAliveIntervalMs:            10000,
    emitOwnEvents:                  false,
    generateHighQualityLinkPreview: false,
  });

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      sock.end();
      reject(new Error('Pairing timeout - please try again'));
    }, 25000);

    let codeGenerated = false;

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect } = update;

      // Generate pairing code
      if (connection === 'connecting' && !codeGenerated) {
        codeGenerated = true;
        
        await new Promise(r => setTimeout(r, 2000));
        
        try {
          const rawCode = await sock.requestPairingCode(phone.replace(/\D/g, ''));
          const pairingCode = rawCode.match(/.{1,4}/g).join('-');
          
          clearTimeout(timeout);
          
          // Store pending pairing
          pendingPairings.set(instanceId, {
            phone: phone.replace(/\D/g, ''),
            sessionPath,
            code: pairingCode,
            paired: false
          });
          
          // IMPORTANT: Close socket immediately to avoid Heroku timeout
          // The actual connection will happen when user enters code
          setTimeout(() => {
            sock.end();
            console.log('[SESSION] Socket closed, waiting for user to enter code:', instanceId);
          }, 5000);
          
          resolve({ code: pairingCode, instanceId });
          
        } catch (e) {
          clearTimeout(timeout);
          sock.end();
          reject(new Error('Failed to generate code: ' + e.message));
        }
      }

      // If connection opens before we close it (rare), handle it
      if (connection === 'open') {
        console.log('[SESSION] Early connection - user was fast:', instanceId);
        
        const pairing = pendingPairings.get(instanceId);
        if (pairing) {
          pairing.paired = true;
          startBot(sock, instanceId, pairing.phone);
        }
      }

      // Handle close
      if (connection === 'close') {
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        console.log('[SESSION] Socket closed during pairing:', statusCode);
        
        // Don't cleanup - we want to keep session for when user enters code
      }
    });
  });
}

// Start bot after successful pairing
async function startBot(sock, instanceId, phone) {
  console.log('[SESSION] Starting bot:', instanceId);

  // Register admin
  const adminJid = phone + '@s.whatsapp.net';
  Database.registerAdmin(adminJid);

  // Load plugins
  loader(sock, instanceId);

  // Notify frontend
  try {
    const { notifyConnected } = require('../server');
    notifyConnected(instanceId);
  } catch {}

  // Welcome message
  try {
    const welcomeText = config.WELCOME_TEXT(phone);
    await sock.sendMessage(adminJid, { text: welcomeText });
  } catch (e) {
    console.error('[SESSION] Welcome message failed:', e.message);
  }

  // Update pending status
  const pairing = pendingPairings.get(instanceId);
  if (pairing) {
    pairing.paired = true;
  }
}

// Check and restore pending pairings (called periodically or on reconnect)
async function checkPendingPairing(instanceId) {
  const pairing = pendingPairings.get(instanceId);
  if (!pairing || pairing.paired) return false;

  console.log('[SESSION] Checking pending pairing:', instanceId);
  
  // Try to restore connection
  restoreSession(instanceId, pairing.sessionPath).then(() => {
    pairing.paired = true;
  }).catch(() => {
    console.log('[SESSION] Pending pairing not ready yet:', instanceId);
  });
  
  return true;
}

async function restoreSession(instanceId, sessionPath) {
  if (!sessionPath) sessionPath = path.join(SESSION_DIR, instanceId);
  if (!await fs.pathExists(sessionPath)) {
    console.log('[SESSION] Session not found:', instanceId);
    return false;
  }

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
        console.log('[SESSION] Connected:', instanceId);
        
        // Check if this was a pending pairing
        const pairing = pendingPairings.get(instanceId);
        if (pairing && !pairing.paired) {
          startBot(sock, instanceId, pairing.phone);
        } else {
          loader(sock, instanceId);
        }
      }

      if (connection === 'close') {
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        console.log('[SESSION] Closed:', instanceId, 'code:', statusCode);
        
        if (statusCode !== DisconnectReason.loggedOut && 
            statusCode !== DisconnectReason.forbidden) {
          setTimeout(() => restoreSession(instanceId, sessionPath), 8000);
        } else {
          pendingPairings.delete(instanceId);
          fs.remove(sessionPath).catch(() => {});
        }
      }
    });

    return true;
  } catch (e) {
    console.error('[SESSION] Restore error:', e.message);
    return false;
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

      // Check if this is a pending pairing
      const pairing = pendingPairings.get(entry);
      if (pairing && !pairing.paired) {
        console.log('[SESSION] Found pending pairing:', entry);
        // Don't auto-restore pending pairings - wait for user
        continue;
      }

      console.log('[SESSION] Restoring:', entry);
      await new Promise(r => setTimeout(r, 2000));
      restoreSession(entry, sessionPath).catch(() => {});
    }
  } catch (e) {
    console.error('[SESSION] Boot restore error:', e.message);
  }
}

module.exports = { 
  generatePairingCode, 
  restoreSession, 
  restoreAllSessions,
  checkPendingPairing,
  pendingPairings
};
      
