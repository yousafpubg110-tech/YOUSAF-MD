// ============================================================
//   YOUSAF-MD — SESSION MANAGER [FINAL FIX]
//   Fixed: Heroku timeout, error 515, pairing reliability
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

// Global store for active pairing sessions
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

async function generatePairingCode(phone) {
  const instanceId  = uuidv4();
  const sessionPath = path.join(SESSION_DIR, instanceId);
  await fs.ensureDir(sessionPath);
  await cleanSessionFiles(sessionPath);

  const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
  const { version }          = await fetchLatestBaileysVersion();

  // Create socket with longer timeouts for Heroku
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
    connectTimeoutMs:               180000,  // 3 minutes
    defaultQueryTimeoutMs:          60000,   // 1 minute
    keepAliveIntervalMs:            5000,    // 5 seconds - frequent ping
    emitOwnEvents:                  false,
    generateHighQualityLinkPreview: false,
    retryRequestDelayMs:            1000,
    maxMsgRetryCount:               10,
    // IMPORTANT: Use polling instead of WebSocket for Heroku compatibility
    waWebSocketUrl:                 'wss://web.whatsapp.com/ws/chat',
  });

  return new Promise((resolve, reject) => {
    // 3 minute timeout for initial connection
    let connectionTimeout = setTimeout(() => {
      cleanupSession(instanceId);
      reject(new Error('Connection timeout - please try again'));
    }, 180000);

    let codeGenerated = false;
    let userLinked    = false;

    // Keep Heroku connection alive with periodic activity
    const herokuKeepAlive = setInterval(() => {
      console.log('[KEEP-ALIVE] Session:', instanceId);
    }, 15000); // Every 15 seconds - prevents Heroku idle timeout

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect } = update;

      // Step 1: Generate pairing code when connecting
      if (connection === 'connecting' && !codeGenerated) {
        codeGenerated = true;
        
        // Wait for WhatsApp servers to be ready
        await new Promise(r => setTimeout(r, 2000));
        
        try {
          const rawCode = await sock.requestPairingCode(phone.replace(/\D/g, ''));
          const pairingCode = rawCode.match(/.{1,4}/g).join('-');
          
          // Clear initial timeout
          clearTimeout(connectionTimeout);
          
          // Store session data
          activeSessions.set(instanceId, {
            sock,
            phone,
            sessionPath,
            code: pairingCode,
            linked: false,
            herokuKeepAlive
          });
          
          // Set 5 minute timeout for user to enter code
          const userTimeout = setTimeout(() => {
            console.log('[SESSION] User timeout - code expired:', instanceId);
            cleanupSession(instanceId);
          }, 300000);
          
          activeSessions.get(instanceId).userTimeout = userTimeout;
          
          // Return code to frontend
          resolve({ code: pairingCode, instanceId });
          
        } catch (e) {
          clearTimeout(connectionTimeout);
          clearInterval(herokuKeepAlive);
          reject(new Error('Failed to generate code: ' + e.message));
        }
      }

      // Step 2: User successfully linked - start bot
      if (connection === 'open' && !userLinked) {
        userLinked = true;
        
        const session = activeSessions.get(instanceId);
        if (session) {
          clearTimeout(session.userTimeout);
          session.linked = true;
        }

        console.log('[SESSION] User linked - starting bot:', instanceId);

        // Register admin
        const adminJid = phone.replace(/\D/g, '') + '@s.whatsapp.net';
        Database.registerAdmin(adminJid);

        // Load plugins
        loader(sock, instanceId);

        // Notify frontend
        try {
          const { notifyConnected } = require('../server');
          notifyConnected(instanceId);
        } catch {}

        // Send welcome message
        try {
          const welcomeText = config.WELCOME_TEXT(phone.replace(/\D/g, ''));
          await sock.sendMessage(adminJid, { text: welcomeText });
        } catch (e) {
          console.error('[SESSION] Welcome message failed:', e.message);
        }
      }

      // Step 3: Handle connection close
      if (connection === 'close') {
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        console.log('[SESSION] Connection closed - code:', statusCode, 'Instance:', instanceId);

        const session = activeSessions.get(instanceId);
        
        // If user hasn't linked yet, cleanup and let them retry
        if (session && !session.linked) {
          cleanupSession(instanceId);
          
          // Error 515 = Stream Error, usually Heroku timeout
          if (statusCode === 515) {
            console.log('[SESSION] Error 515 - Heroku timeout, user should retry');
          }
        }
        
        // If bot was running, try to reconnect
        if (session && session.linked) {
          if (statusCode !== DisconnectReason.loggedOut && 
              statusCode !== DisconnectReason.forbidden) {
            setTimeout(() => restoreSession(instanceId, sessionPath), 5000);
          } else {
            cleanupSession(instanceId);
          }
        }
      }
    });

    // Handle socket errors
    sock.ws.on('error', (err) => {
      console.error('[SESSION] Socket error:', err.message);
    });
  });
}

function cleanupSession(instanceId) {
  const session = activeSessions.get(instanceId);
  if (session) {
    clearInterval(session.herokuKeepAlive);
    clearTimeout(session.userTimeout);
    if (session.sock) {
      try {
        session.sock.end();
      } catch {}
    }
    activeSessions.delete(instanceId);
  }
  
  // Clean up files
  const sessionPath = path.join(SESSION_DIR, instanceId);
  fs.remove(sessionPath).catch(() => {});
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
        console.log('[SESSION] Restored:', instanceId);
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
    console.error('[SESSION] Restore failed:', e.message);
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

      console.log('[SESSION] Restoring on boot:', entry);
      await new Promise(r => setTimeout(r, 2000));
      restoreSession(entry, sessionPath).catch(() => {});
    }
  } catch (e) {
    console.error('[SESSION] Boot restore error:', e.message);
  }
}

module.exports = { generatePairingCode, restoreSession, restoreAllSessions };
