/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║         YOUSAF-BALOCH-MD — MAIN BOT ENGINE                      ║
 * ║         Created by: Muhammad Yousaf Baloch                      ║
 * ║         Platforms: Heroku, Railway, Render, Koyeb, VPS          ║
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
import pino             from 'pino';
import chalk            from 'chalk';
import figlet           from 'figlet';
import gradient         from 'gradient-string';
import {
  existsSync, mkdirSync, readdirSync,
  readFileSync, writeFileSync,
} from 'fs';
import { join, dirname }    from 'path';
import { fileURLToPath }    from 'url';
import { createRequire }    from 'module';
import express              from 'express';

import {
  OWNER,
  CONFIG,
  SYSTEM,
  ADMIN_COMMANDS,
  DEPLOYER_ONLY_COMMANDS,
  validateConfig,
  initDatabase,
  isOwner,
  isDeployer,
  canUseCommand,
} from './config.js';

import { registerEvents }                       from './lib/EventHandler.js';
import { checkCooldown, cleanExpiredCooldowns } from './lib/CooldownManager.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require   = createRequire(import.meta.url);

// ═══════════════════════════════════════════════════════════════════
//  SESSION LOADER
// ═══════════════════════════════════════════════════════════════════

const SESSION_ID = process.env.SESSION_ID || (() => {
  const f = './session/SESSION_ID';
  if (existsSync(f)) {
    const val = readFileSync(f, 'utf8').trim();
    if (val && val !== 'YOUR_SESSION_ID_HERE') return val;
  }
  return null;
})();

if (SESSION_ID) {
  try {
    const encoded = SESSION_ID.replace('YOUSAF-MD_', '');
    const decoded = Buffer.from(encoded, 'base64').toString('utf8');
    const sessDir = SYSTEM.SESSION_DIR || './session';
    if (!existsSync(sessDir)) mkdirSync(sessDir, { recursive: true });
    writeFileSync(`${sessDir}/creds.json`, decoded);
    console.log(chalk.green('[SESSION] ✅ Session loaded successfully!'));
  } catch (e) {
    console.error(chalk.red('[SESSION] ❌ Failed:'), e.message);
  }
} else {
  console.log(chalk.yellow('[SESSION] No SESSION_ID — QR code will be shown'));
}

// ═══════════════════════════════════════════════════════════════════
//  EXPRESS — KEEP ALIVE
// ═══════════════════════════════════════════════════════════════════

const app  = express();
const PORT = process.env.PORT || 3000;

app.get('/', (_, res) => res.send(
  `<h2>🤖 ${OWNER.BOT_NAME} is running! ✅</h2>` +
  `<p>Version: ${OWNER.VERSION} | Owner: ${OWNER.FULL_NAME} | Status: 🟢 Online</p>`
));
app.get('/health', (_, res) => res.json({ status: 'ok', bot: OWNER.BOT_NAME }));

app.listen(PORT, () =>
  console.log(chalk.green(`✅ Express server running on port ${PORT}`))
);

// ═══════════════════════════════════════════════════════════════════
//  GLOBALS
// ═══════════════════════════════════════════════════════════════════

const logger  = pino({ level: 'silent' });
const plugins = new Map();

// ═══════════════════════════════════════════════════════════════════
//  PLUGIN LOADER
// ═══════════════════════════════════════════════════════════════════

async function loadPlugins() {
  const pluginsDir = join(__dirname, SYSTEM.PLUGINS_DIR);

  if (!existsSync(pluginsDir)) {
    mkdirSync(pluginsDir, { recursive: true });
    return;
  }

  let files;
  try {
    files = readdirSync(pluginsDir).filter(f => f.endsWith('.js'));
  } catch (err) {
    console.error(chalk.red('[PLUGINS] Cannot read dir:'), err.message);
    return;
  }

  if (!files.length) {
    console.log(chalk.yellow('[PLUGINS] No plugin files found.'));
    return;
  }

  let loaded = 0, failed = 0;

  for (const file of files) {
    try {
      const mod     = await import(`file://${join(pluginsDir, file)}`);
      const handler = mod.default;
      if (!handler) { failed++; continue; }

      if (Array.isArray(handler)) {
        let reg = 0;
        for (const item of handler) {
          if (!item?.command || !(item.handler || item.execute)) continue;
          const cmds = Array.isArray(item.command) ? item.command : [item.command];
          for (const name of cmds) {
            plugins.set(name.toLowerCase(), {
              ...item,
              handler: item.handler || item.execute,
            });
          }
          reg++;
        }
        if (reg > 0) { loaded++; } else { failed++; }
        continue;
      }

      let names = [];
      if (handler.command instanceof RegExp) {
        names = handler.command.source
          .replace('^(', '').replace(')$', '')
          .split('|').map(c => c.trim().toLowerCase());
      } else if (Array.isArray(handler.command)) {
        names = handler.command.map(c => c.toLowerCase());
      } else if (typeof handler.command === 'string') {
        names = [handler.command.toLowerCase()];
      }

      if (!names.length) { failed++; continue; }

      for (const name of names) {
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
    `[PLUGINS] ✅ ${loaded} loaded, ${failed} failed. Commands: ${plugins.size}`
  ));
}

// ═══════════════════════════════════════════════════════════════════
//  MSG HELPERS
// ═══════════════════════════════════════════════════════════════════

function attachMsgHelpers(sock, msg) {
  const from = msg.key.remoteJid;

  msg.react = async (emoji) => {
    try {
      await sock.sendMessage(from, { react: { text: emoji, key: msg.key } });
    } catch (_) {}
  };

  msg.reply = async (text) => {
    try {
      await sock.sendMessage(from, { text }, { quoted: msg });
    } catch (_) {}
  };
}

// ═══════════════════════════════════════════════════════════════════
//  MESSAGE HANDLER
// ═══════════════════════════════════════════════════════════════════

async function handleMessage(sock, msg) {
  try {
    if (!msg.message) return;

    attachMsgHelpers(sock, msg);

    const from    = msg.key.remoteJid;
    const isGroup = from.endsWith('@g.us');

    const rawSender = msg.key.participant || msg.key.remoteJid;
    const sender    = rawSender?.replace(/:.*@/, '@') || rawSender;

    const ownerCheck    = isOwner(sender);
    const deployerCheck = isDeployer(sender);

    let groupAdmins = [];
    let isAdmin     = false;
    let isBotAdmin  = false;

    if (isGroup) {
      try {
        const meta  = await sock.groupMetadata(from);
        groupAdmins = meta.participants
          .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
          .map(p => p.id);
        const botJid = sock.user.id.replace(/:.*@/, '@');
        isAdmin    = groupAdmins.some(a => a.replace(/:.*@/, '@') === sender);
        isBotAdmin = groupAdmins.some(a => a.replace(/:.*@/, '@') === botJid);
      } catch (_) {}
    }

    const msgType = Object.keys(msg.message)[0];
    let text = '';
    if (msgType === 'conversation') {
      text = msg.message.conversation || '';
    } else if (msgType === 'extendedTextMessage') {
      text = msg.message.extendedTextMessage?.text || '';
    }

    if (!text) return;

    const prefix = CONFIG.PREFIX;
    if (!text.startsWith(prefix)) return;

    const args    = text.slice(prefix.length).trim().split(/\s+/);
    const command = args.shift()?.toLowerCase();
    if (!command) return;

    const plugin = plugins.get(command);
    if (!plugin) return;

    if (CONFIG.MODE === 'private' && !ownerCheck && !deployerCheck) return;

    // ── PERMISSION GATE ────────────────────────────────────────────

    if (plugin.ownerOnly && !ownerCheck) {
      return sock.sendMessage(from, {
        text: `❌ *Owner Only Command!*\n\n${SYSTEM.SHORT_WATERMARK}`,
      }, { quoted: msg });
    }

    if (plugin.deployerOnly && !deployerCheck && !ownerCheck) {
      return sock.sendMessage(from, {
        text: `❌ *Permission Denied!*\nOnly deployer can use this.\n${SYSTEM.SHORT_WATERMARK}`,
      }, { quoted: msg });
    }

    if (!canUseCommand(command, sender, groupAdmins)) {
      if (DEPLOYER_ONLY_COMMANDS.includes(command)) {
        return sock.sendMessage(from, {
          text: `❌ *Permission Denied!*\nOnly deployer or owner can use this.\n${SYSTEM.SHORT_WATERMARK}`,
        }, { quoted: msg });
      }
      if (ADMIN_COMMANDS.includes(command)) {
        return sock.sendMessage(from, {
          text: `❌ *Admins Only!*\nOnly admins, deployer or owner can use this.\n${SYSTEM.SHORT_WATERMARK}`,
        }, { quoted: msg });
      }
      return;
    }

    if (plugin.groupOnly && !isGroup) {
      return sock.sendMessage(from, {
        text: `❌ *Group Only!*\n${SYSTEM.SHORT_WATERMARK}`,
      }, { quoted: msg });
    }

    if (plugin.adminOnly && !isAdmin && !deployerCheck && !ownerCheck) {
      return sock.sendMessage(from, {
        text: `❌ *Admins Only!*\n${SYSTEM.SHORT_WATERMARK}`,
      }, { quoted: msg });
    }

    if (plugin.botAdmin && !isBotAdmin) {
      return sock.sendMessage(from, {
        text: `❌ *Make me admin first!*\n${SYSTEM.SHORT_WATERMARK}`,
      }, { quoted: msg });
    }

    if (!ownerCheck && !deployerCheck) {
      const { onCooldown, remaining } = checkCooldown(sender, command);
      if (onCooldown) {
        return sock.sendMessage(from, {
          text: `⏳ Wait *${remaining}s* before using .${command} again.\n${SYSTEM.SHORT_WATERMARK}`,
        }, { quoted: msg });
      }
    }

    await plugin.handler({
      sock, msg, from, sender, args,
      text:       args.join(' '),
      isOwner:    ownerCheck,
      isDeployer: deployerCheck,
      isAdmin,
      isBotAdmin,
      groupAdmins,
      ownerInfo:  OWNER,
    });

  } catch (err) {
    console.error('[MSG HANDLER ERROR]:', err.message);
  }
}

// ═══════════════════════════════════════════════════════════════════
//  CONNECTED NOTIFICATION
// ═══════════════════════════════════════════════════════════════════

async function sendConnectedNotification(sock) {
  try {
    const raw = process.env.DEPLOYER_NUMBER || '';
    if (!raw.trim()) return;
    const numbers = raw
      .split(',')
      .map(n => n.trim().replace(/[^0-9]/g, ''))
      .filter(n => n.length >= 7);
    for (const num of numbers) {
      await sock.sendMessage(`${num}@s.whatsapp.net`, {
        text:
          `╭━━━『 ✅ *BOT CONNECTED* 』━━━╮\n\n` +
          `🤖 *${OWNER.BOT_NAME}* connected!\n\n` +
          `├ 👑 *Owner:*   ${OWNER.FULL_NAME}\n` +
          `├ ✨ *Version:* ${OWNER.VERSION}\n` +
          `├ 🔧 *Prefix:*  ${CONFIG.PREFIX}\n` +
          `├ 🌐 *Mode:*    ${CONFIG.MODE.toUpperCase()}\n` +
          `└ 🟢 *Status:*  Online\n\n` +
          `💡 *${CONFIG.PREFIX}menu* — All commands\n\n` +
          `╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n` +
          `_⚡ ${OWNER.BOT_NAME} by ${OWNER.FULL_NAME}_`,
      });
    }
  } catch (e) {
    console.error('[NOTIFY]:', e.message);
  }
}

// ═══════════════════════════════════════════════════════════════════
//  WHATSAPP CONNECTION
// ═══════════════════════════════════════════════════════════════════

async function connectToWhatsApp() {
  const { state, saveCreds }  = await useMultiFileAuthState(SYSTEM.SESSION_DIR);
  const { version, isLatest } = await fetchLatestBaileysVersion();

  console.log(chalk.cyan(figlet.textSync('YOUSAF-BALOCH-MD', { font: 'Standard' })));
  console.log(gradient.pastel(`\n📱 v${OWNER.VERSION} | Baileys: ${version} | Latest: ${isLatest}\n`));

  const sock = makeWASocket({
    version,
    logger,
    printQRInTerminal:              true,
    auth: {
      creds: state.creds,
      keys:  makeCacheableSignalKeyStore(state.keys, logger),
    },
    browser:                        Browsers.macOS('Desktop'),
    generateHighQualityLinkPreview: true,
    syncFullHistory:                false,
    markOnlineOnConnect:            true,
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) console.log(chalk.yellow('[CONNECTION] Scan QR code'));

    if (connection === 'close') {
      const code = lastDisconnect?.error?.output?.statusCode;
      console.log(chalk.red('[CONNECTION] Closed — Code:'), code);

      if (code !== DisconnectReason.loggedOut) {
        console.log(chalk.yellow('[CONNECTION] Reconnecting in 5s...'));
        setTimeout(() => connectToWhatsApp(), 5000);
      } else {
        console.log(chalk.red('[CONNECTION] Logged out!'));
        process.exit(1);
      }

    } else if (connection === 'open') {
      console.log(chalk.green('[CONNECTION] ✅ Connected!'));
      console.log(chalk.cyan(
        `[INFO] ${OWNER.BOT_NAME} | Prefix: ${CONFIG.PREFIX} | Mode: ${CONFIG.MODE}`
      ));

      await loadPlugins();
      await initDatabase();
      registerEvents(sock);
      setInterval(() => cleanExpiredCooldowns(), 5 * 60 * 1000);
      setTimeout(() => sendConnectedNotification(sock), 3000);
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

console.log(chalk.green('[STARTUP] Starting YOUSAF-BALOCH-MD...'));

const errors = validateConfig();
if (errors.length > 0) {
  errors.forEach(e => console.error(chalk.red('[CONFIG ERROR]'), e));
  process.exit(1);
}

[SYSTEM.SESSION_DIR, SYSTEM.TEMP_DIR, SYSTEM.PLUGINS_DIR, SYSTEM.DB_DIR, SYSTEM.LOGS_DIR]
  .forEach(dir => {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
      console.log(chalk.blue(`[SETUP] Created: ${dir}`));
    }
  });

connectToWhatsApp().catch(err => {
  console.error(chalk.red('[FATAL]'), err.message);
  process.exit(1);
});

export default connectToWhatsApp;
