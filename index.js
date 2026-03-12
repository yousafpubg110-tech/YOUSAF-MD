/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║         YOUSAF-BALOCH-MD — MAIN BOT ENGINE                      ║
 * ║         Created by: Muhammad Yousaf Baloch                      ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import {
  makeWASocket,
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  Browsers,
  makeCacheableSignalKeyStore,
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import pino from 'pino';
import chalk from 'chalk';
import figlet from 'figlet';
import gradient from 'gradient-string';
import { existsSync, mkdirSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import express from 'express';

import {
  OWNER,
  CONFIG,
  SYSTEM,
  validateConfig,
  initDatabase,
  isOwner,
  isDeployer,
  isRestrictedCommand,
} from './config.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

// Express server for keep-alive
const app = express();
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => res.send(`YOUSAF-BALOCH-MD is running! ✅\nVersion: ${OWNER.VERSION}`));
app.listen(PORT, () => console.log(`✅ Express server running on port ${PORT}`));

const logger = pino({ level: 'silent' });
const plugins = new Map();

// ═══════════════════════════════════════════════════════════════════
//  PLUGIN LOADER
// ═══════════════════════════════════════════════════════════════════

async function loadPlugins() {
  const pluginsDir = join(__dirname, SYSTEM.PLUGINS_DIR);
  if (!existsSync(pluginsDir)) {
    console.log(chalk.yellow('[PLUGINS] Plugins directory not found, creating...'));
    mkdirSync(pluginsDir, { recursive: true });
    return;
  }

  let files;
  try {
    files = readdirSync(pluginsDir).filter(f => f.endsWith('.js'));
  } catch (err) {
    console.error(chalk.red('[PLUGINS] Failed to read plugins directory:'), err.message);
    return;
  }

  if (!files.length) {
    console.log(chalk.yellow('[PLUGINS] No plugin files found.'));
    return;
  }

  let loaded = 0, failed = 0;

  for (const file of files) {
    try {
      const mod = await import(`file://${join(pluginsDir, file)}`);
      const handler = mod.default;

      if (!handler) { failed++; continue; }

      // Support ARRAY exports: export default [ {...}, {...} ]
      if (Array.isArray(handler)) {
        let regCount = 0;
        for (const item of handler) {
          if (!item || !item.command || !(item.handler || item.execute)) continue;
          const cmds = Array.isArray(item.command) ? item.command : [item.command];
          for (const name of cmds) {
            plugins.set(name.toLowerCase(), {
              ...item,
              handler: item.handler || item.execute,
            });
          }
          regCount++;
        }
        if (regCount > 0) { loaded++; }
        else { failed++; }
        continue;
      }

      // Support SINGLE export: export default { command, handler }
      let commandNames = [];
      if (handler.command instanceof RegExp) {
        commandNames = handler.command.source
          .replace('^(', '').replace(')$', '')
          .split('|').map(c => c.trim().toLowerCase());
      } else if (Array.isArray(handler.command)) {
        commandNames = handler.command.map(c => c.toLowerCase());
      } else if (typeof handler.command === 'string') {
        commandNames = [handler.command.toLowerCase()];
      }

      if (!commandNames.length) { failed++; continue; }
      for (const name of commandNames) {
        plugins.set(name, { ...handler, handler: handler.handler || handler.execute || handler.run });
      }
      loaded++;
    } catch (err) {
      failed++;
      console.error(chalk.red(`[PLUGINS] Failed to load ${file}:`), err.message);
    }
  }

  console.log(chalk.green(`[PLUGINS] ✅ ${loaded} files loaded, ${failed} failed. Total: ${plugins.size} commands`));
}

// ═══════════════════════════════════════════════════════════════════
//  MESSAGE HANDLER
// ═══════════════════════════════════════════════════════════════════

async function handleMessage(sock, msg) {
  try {
    if (!msg.message) return;
    
    const from = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.remoteJid;
    const isGroup = from.endsWith('@g.us');
    
    // Get message text
    const messageTypes = Object.keys(msg.message);
    const msgType = messageTypes[0];
    let text = '';
    
    if (msgType === 'conversation') {
      text = msg.message.conversation;
    } else if (msgType === 'extendedTextMessage') {
      text = msg.message.extendedTextMessage.text;
    }
    
    if (!text) return;
    
    // Check for prefix
    const prefix = CONFIG.PREFIX;
    if (!text.startsWith(prefix)) return;
    
    // Parse command
    const args = text.slice(prefix.length).trim().split(/\s+/);
    const command = args.shift()?.toLowerCase();
    
    if (!command) return;
    
    // Get plugin
    const plugin = plugins.get(command);
    if (!plugin) return;
    
    // Permission checks
    const ownerCheck = isOwner(sender);
    const deployerCheck = isDeployer(sender);
    
    // Owner only commands
    if (plugin.ownerOnly && !ownerCheck) {
      return sock.sendMessage(from, {
        text: `❌ *Access Denied!*\n\nThis command is only for the bot owner.\n${SYSTEM.SHORT_WATERMARK}`,
      }, { quoted: msg });
    }
    
    // Restricted commands (deployer+ only)
    if (isRestrictedCommand(command) && !deployerCheck && !ownerCheck) {
      return sock.sendMessage(from, {
        text: `❌ *Access Denied!*\n\nOnly bot deployer/owner can use this command.\n${SYSTEM.SHORT_WATERMARK}`,
      }, { quoted: msg });
    }
    
    // Group only commands
    if (plugin.groupOnly && !isGroup) {
      return sock.sendMessage(from, {
        text: `❌ *This command only works in groups!*\n${SYSTEM.SHORT_WATERMARK}`,
      }, { quoted: msg });
    }
    
    // Execute handler
    const context = {
      sock,
      msg,
      from,
      sender,
      args,
      text: args.join(' '),
      isOwner: ownerCheck,
      isDeployer: deployerCheck,
      isAdmin: false, // Will be set if needed
      isBotAdmin: false, // Will be set if needed
    };
    
    await plugin.handler(context);
    
  } catch (error) {
    console.error('[MESSAGE HANDLER ERROR]:', error.message);
  }
}

// ═══════════════════════════════════════════════════════════════════
//  CONNECTION HANDLER
// ═══════════════════════════════════════════════════════════════════

async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState(SYSTEM.SESSION_DIR);
  const { version, isLatest } = await fetchLatestBaileysVersion();
  
  console.log(chalk.cyan(figlet.textSync('YOUSAF-BALOCH-MD', { font: 'Standard' })));
  console.log(gradient.pastel(`\n📱 Version: ${OWNER.VERSION} | 💻 Baileys: ${version} | 📦 Latest: ${isLatest}\n`));

  const sock = makeWASocket({
    version,
    logger,
    printQRInTerminal: true,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger),
    },
    browser: Browsers.macOS('Desktop'),
    generateHighQualityLinkPreview: true,
    syncFullHistory: true,
  });

  // Save credentials
  sock.ev.on('creds.update', saveCreds);

  // Connection update
  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;
    
    if (qr) {
      console.log(chalk.yellow('[CONNECTION] 📱 Scan QR code to connect'));
    }
    
    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log(chalk.red('[CONNECTION] ❌ Connection closed due to:'), lastDisconnect?.error?.message);
      
      if (shouldReconnect) {
        console.log(chalk.yellow('[CONNECTION] 🔄 Reconnecting...'));
        connectToWhatsApp();
      }
    } else if (connection === 'open') {
      console.log(chalk.green('[CONNECTION] ✅ Connected successfully!'));
      console.log(chalk.cyan(`[INFO] 🤖 Bot: ${OWNER.BOT_NAME}`));
      console.log(chalk.cyan(`[INFO] 👑 Owner: ${OWNER.FULL_NAME}`));
      console.log(chalk.cyan(`[INFO] 🔧 Prefix: ${CONFIG.PREFIX}`));
      console.log(chalk.cyan(`[INFO] 🌐 Mode: ${CONFIG.MODE}`));
      
      // Load plugins
      await loadPlugins();
      
      // Initialize database
      await initDatabase();
    }
  });

  // Messages handler
  sock.ev.on('messages.upsert', async (m) => {
    if (m.type === 'notify') {
      for (const msg of m.messages) {
        await handleMessage(sock, msg);
      }
    }
  });

  return sock;
}

// ═══════════════════════════════════════════════════════════════════
//  START BOT
// ═══════════════════════════════════════════════════════════════════

console.log(chalk.green('[STARTUP] 🚀 Starting YOUSAF-BALOCH-MD...'));

// Validate config
const errors = validateConfig();
if (errors.length > 0) {
  console.error(chalk.red('[CONFIG] ❌ Validation errors:'));
  errors.forEach(e => console.error(chalk.red('  -'), e));
  process.exit(1);
}

// Create required directories
[SYSTEM.SESSION_DIR, SYSTEM.TEMP_DIR, SYSTEM.PLUGINS_DIR, SYSTEM.DB_DIR, SYSTEM.LOGS_DIR].forEach(dir => {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
    console.log(chalk.blue(`[SETUP] 📁 Created directory: ${dir}`));
  }
});

// Connect to WhatsApp
connectToWhatsApp().catch(err => {
  console.error(chalk.red('[FATAL] ❌ Failed to start bot:'), err.message);
  process.exit(1);
});

export default connectToWhatsApp;
 
