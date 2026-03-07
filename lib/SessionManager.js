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

// Global store for pairing contexts
const pairingContexts = new Map();

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
    connectTimeoutMs:               60000,
    defaultQueryTimeoutMs:          30000,
    keepAliveIntervalMs:            15000,
    emitOwnEvents:                  false,
    generateHighQualityLinkPreview: false,
    retryRequestDelayMs:            2000,
    maxMsgRetryCount:               5,
  });

  return new Promise((resolve, reject) => {
    // Initial 2 minute timeout for code generation
    let timeout = setTimeout(() => {
      sock.end();
      reject(new Error('Pairing timeout - please try again'));
    }, 120000);

    let codeSent    = false;
    let botStarted  = false;
    let pairingCode = null;

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect } = update;

      // Step 1: Get pairing code
      if (connection === 'connecting' && !codeSent) {
        codeSent = true;
        
        // Wait for stable connection
        await new Promise(r => setTimeout(r, 3000));
        
        try {
          const rawCode   = await sock.requestPairingCode(phone.replace(/\D/g, ''));
          pairingCode     = rawCode.match(/.{1,4}/g).join('-');
          
          // Clear initial timeout
          clearTimeout(timeout);
          
          // Set 5 minute timeout for user to enter code
          timeout = setTimeout(() => {
            const ctx = pairingContexts.get(instanceId);
            if (ctx && !ctx.botStarted) {
              ctx.sock.end();
              pairingContexts.delete(instanceId);
              console.log('[SESSION] Code expired:', instanceId);
            }
          }, 300000);
          
          // Store context globally
          pairingContexts.set(instanceId, {
            sock,
            timeout,
            phone,
            sessionPath,
            code: pairingCode,
            botStarted: false
          });
          
          // Return to server.js
          resolve({ 
            code: pairingCode, 
            instanceId 
          });
          
        } catch (e) {
          clearTimeout(timeout);
          reject(new Error('Failed to generate pairing code: ' + e.message));
        }
      }

      // Step 2: User linked - start bot
      if (connection === 'open' && !botStarted) {
        botStarted = true;
        
        // Update context
        const ctx = pairingContexts.get(instanceId);
        if (ctx) {
          clearTimeout(ctx.timeout);
          ctx.botStarted = true;
        }

        console.log('[SESSION] Bot connected successfully');

        // Register admin
        const adminJid = phone.replace(/\D/g, '') + '@s.whatsapp.net';
        Database.registerAdmin(adminJid);

        // Start bot
        loader(sock, instanceId);

        // Notify dashboard
        try {
          const { notifyConnected } = require('../server');
          notifyConnected(instanceId);
        } catch {}

        // Welcome message - no session ID
        try {
          const welcomeText = config.WELCOME_TEXT(phone.replace(/\D/g, ''));
          await sock.sendMessage(adminJid, { text: welcomeText });
        } catch (e) {
          console.error('[SESSION] Welcome message failed:', e.message);
        }
      }

      // Step 3: Handle close before start
      if (connection === 'close' && !botStarted) {
        const ctx = pairingContexts.get(instanceId);
        if (ctx) {
          clearTimeout(ctx.timeout);
          pairingContexts.delete(instanceId);
        }
        
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        console.log('[SESSION] Closed before start - code:', statusCode);
        
        fs.remove(sessionPath).catch(() => {});
      }
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
        console.log('[SESSION] Session restored:', instanceId);
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
      
