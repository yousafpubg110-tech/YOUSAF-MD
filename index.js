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

// Express keep-alive
const app = express();
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => res.send(`YOUSAF-BALOCH-MD is running! ✅\nVersion: ${OWNER.VERSION}`));
app.listen(PORT, () => console.log(`✅ Express server running on port ${PORT}`));

const logger = pino({ level: 'silent' });
const plugins = new Map();

// ═══════════════════════════════════════════════════════════════════
//  PERMISSION LEVELS
//  Level 1 = OWNER   (Yousaf — hardcoded, immutable)
//  Level 2 = DEPLOYER (jo bhi bot apne number par lagaye)
//  Level 3 = USER     (group ke aam members)
// ═══════════════════════════════════════════════════════════════════

/**
 * DEPLOYER_ONLY commands — sirf deployer/owner yeh use kar sakta hai:
 * - Settings on/off karna
 * - Kick, ban, mute, promote, demote
 * - Bot ko configure karna
 */
const DEPLOYER_ONLY_COMMANDS = new Set([
  'setting', 'settings', 'set', 'config', 'configure',
  'antilink', 'antiviewonce', 'antispam', 'antibad', 'anticall',
  'autoread', 'autostatus', 'autoreact', 'autolike',
  'autolike', 'autotyping', 'autorecord',
  'kick', 'add', 'promote', 'demote', 'linkgroup', 'revoke',
  'mute', 'unmute', 'close', 'open',
  'restart', 'shutdown', 'block', 'unblock', 'ban', 'unban',
  'broadcast', 'bc', 'eval', 'exec', 'shell', 'update',
  'setprefix', 'setmode', 'setname', 'setwelcome', 'setgoodbye',
]);

// ═══════════════════════════════════════════════════════════════════
//  PLUGIN LOADER
// ═══════════════════════════════════════════════════════════════════

async function loadPlugins() {
  const pluginsDir = join(__dirname, SYSTEM.PLUGINS_DIR);
  if (!existsSync(pluginsDir)) {
    console.log(chalk.yellow('[PLUGINS] Creating plugins directory...'));
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
        if (regCount > 0) { loaded++; } else { failed++; }
        continue;
      }

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
        plugins.set(name, {
          ...handler,
          handler: handler.handler || handler.execute || handler.run,
        });
      }
      loaded++;
    } catch (err) {
      failed++;
      console.error(chalk.red(`[PLUGINS] ❌ ${file}:`), err.message);
    }
  }

  console.log(chalk.green(
    `[PLUGINS] ✅ ${loaded} files loaded, ${failed} failed. Total: ${plugins.size} commands`
  ));
}

// ═══════════════════════════════════════════════════════════════════
//  MESSAGE HANDLER
// ═══════════════════════════════════════════════════════════════════

async function handleMessage(sock, msg) {
  try {
    if (!msg.message) return;

    const from   = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.remoteJid;
    const isGroup = from.endsWith('@g.us');

    // ── Permission levels ────────────────────────────────────────
    const ownerCheck    = isOwner(sender);      // Level 1 — Yousaf only
    const deployerCheck = isDeployer(sender);   // Level 2 — jo bhi bot lagaye

    // ── Group admin status ────────────────────────────────────────
    let isAdmin   = false;
    let isBotAdmin = false;

    if (isGroup) {
      try {
        const meta   = await sock.groupMetadata(from);
        const admins = meta.participants
          .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
          .map(p => p.id);
        const botJid = sock.user.id.replace(/:.*@/, '@');
        isAdmin    = admins.includes(sender);
        isBotAdmin = admins.includes(botJid);
      } catch { /* defaults false */ }
    }

    // ── Get message text ──────────────────────────────────────────
    const msgType = Object.keys(msg.message)[0];
    let text = '';

    if (msgType === 'conversation') {
      text = msg.message.conversation;
    } else if (msgType === 'extendedTextMessage') {
      text = msg.message.extendedTextMessage.text;
    }

    if (!text) return;

    const prefix = CONFIG.PREFIX;
    if (!text.startsWith(prefix)) return;

    const args    = text.slice(prefix.length).trim().split(/\s+/);
    const command = args.shift()?.toLowerCase();
    if (!command) return;

    const plugin = plugins.get(command);
    if (!plugin) return;

    // ═══════════════════════════════════════════════════════════
    //  PERMISSION GATE — 3 LEVELS
    // ═══════════════════════════════════════════════════════════

    // [1] ownerOnly — sirf Yousaf (OWNER) use kar sakta hai
    //     Example: eval, shell, exec
    if (plugin.ownerOnly && !ownerCheck) {
      return sock.sendMessage(from, {
        text: `❌ *Owner Only Command!*\n\nYeh command sirf bot ke original owner use kar sakte hain.\n${SYSTEM.SHORT_WATERMARK}`,
      }, { quoted: msg });
    }

    // [2] deployerOnly — deployer ya owner use kar sakta hai
    //     Example: settings, kick, ban, antilink on/off
    const isDeployerOnlyCmd = DEPLOYER_ONLY_COMMANDS.has(command) || plugin.deployerOnly;
    if (isDeployerOnlyCmd && !deployerCheck && !ownerCheck) {
      return sock.sendMessage(from, {
        text: `❌ *Permission Denied!*\n\nYeh command sirf woh use kar sakta hai jisne bot deploy kiya ho.\n${SYSTEM.SHORT_WATERMARK}`,
      }, { quoted: msg });
    }

    // [3] groupOnly — sirf group mein kaam karta hai
    if (plugin.groupOnly && !isGroup) {
      return sock.sendMessage(from, {
        text: `❌ *Group Only!*\n\nYeh command sirf group mein use ho sakti hai.\n${SYSTEM.SHORT_WATERMARK}`,
      }, { quoted: msg });
    }

    // [4] adminOnly — sirf group admin use kar sakta hai
    if (plugin.adminOnly && !isAdmin && !deployerCheck && !ownerCheck) {
      return sock.sendMessage(from, {
        text: `❌ *Admins Only!*\n\nYeh command sirf group admins use kar sakte hain.\n${SYSTEM.SHORT_WATERMARK}`,
      }, { quoted: msg });
    }

    // [5] botAdmin — bot ka admin hona zaroori hai
    if (plugin.botAdmin && !isBotAdmin) {
      return sock.sendMessage(from, {
        text: `❌ *Bot ko pehle admin banao!*\n\nYeh command chalane ke liye bot ka group admin hona zaroori hai.\n${SYSTEM.SHORT_WATERMARK}`,
      }, { quoted: msg });
    }

    // ── Execute plugin ────────────────────────────────────────────
    await plugin.handler({
      sock,
      msg,
      from,
      sender,
      args,
      text:       args.join(' '),
      isOwner:    ownerCheck,
      isDeployer: deployerCheck,
      isAdmin,
      isBotAdmin,
      // OWNER info — read only, plugins mein use karne ke liye
      ownerInfo:  OWNER,
    });

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
  console.log(gradient.pastel(
    `\n📱 Version: ${OWNER.VERSION} | 💻 Baileys: ${version} | 📦 Latest: ${isLatest}\n`
  ));

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

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log(chalk.yellow('[CONNECTION] 📱 QR code ready — scan to connect'));
    }

    if (connection === 'close') {
      const shouldReconnect =
        (lastDisconnect?.error instanceof Boom)
          ? lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut
          : true;

      console.log(chalk.red('[CONNECTION] ❌ Closed:'), lastDisconnect?.error?.message);

      if (shouldReconnect) {
        console.log(chalk.yellow('[CONNECTION] 🔄 Reconnecting...'));
        connectToWhatsApp();
      } else {
        console.log(chalk.red('[CONNECTION] 🚫 Logged out. Delete session folder and restart.'));
      }

    } else if (connection === 'open') {
      console.log(chalk.green('[CONNECTION] ✅ Connected!'));
      console.log(chalk.cyan(`[INFO] 🤖 ${OWNER.BOT_NAME} | 👑 ${OWNER.FULL_NAME} | 🔧 ${CONFIG.PREFIX} | 🌐 ${CONFIG.MODE}`));
      await loadPlugins();
      await initDatabase();
    }
  });

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
//  START
// ═══════════════════════════════════════════════════════════════════

console.log(chalk.green('[STARTUP] 🚀 Starting YOUSAF-BALOCH-MD...'));

const errors = validateConfig();
if (errors.length > 0) {
  console.error(chalk.red('[CONFIG] ❌ Errors:'));
  errors.forEach(e => console.error(chalk.red('  -'), e));
  process.exit(1);
}

[SYSTEM.SESSION_DIR, SYSTEM.TEMP_DIR, SYSTEM.PLUGINS_DIR, SYSTEM.DB_DIR, SYSTEM.LOGS_DIR].forEach(dir => {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
    console.log(chalk.blue(`[SETUP] 📁 Created: ${dir}`));
  }
});

connectToWhatsApp().catch(err => {
  console.error(chalk.red('[FATAL] ❌'), err.message);
  process.exit(1);
});

export default connectToWhatsApp;
