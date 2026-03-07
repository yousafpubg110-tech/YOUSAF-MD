// ============================================================
//   YOUSAF-MD — PLUGIN LOADER
//   Fixed: all plugins included, correct group event handler
//   Developer: Muhammad Yousaf Baloch
// ============================================================

'use strict';

const { buildContext } = require('../lib/PermissionHandler');
const config           = require('../config');
const safetyPlugin     = require('./safety');
const autoReplyPlugin  = require('./autoreply');

const plugins = [
  require('./menu'),
  require('./settings'),
  require('./downloader'),
  require('./group'),
  require('./media'),
  require('./tools'),
  require('./info'),
  safetyPlugin,
  autoReplyPlugin,
];

function parseCommand(text = '') {
  if (!text.startsWith(config.PREFIX)) return null;
  const parts   = text.slice(config.PREFIX.length).trim().split(/\s+/);
  const command = parts[0].toLowerCase();
  const args    = parts.slice(1);
  const body    = parts.slice(1).join(' ');
  return { command, args, body };
}

function loader(sock, instanceId) {

  // Single messages.upsert handler — no duplicate
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;

    for (const msg of messages) {
      try {
        if (msg.key?.remoteJid === 'status@broadcast') {
          await safetyPlugin.onStatusUpdate(sock, [msg], instanceId).catch(() => {});
          continue;
        }
        await handleMessage(sock, msg, instanceId);
      } catch (e) {
        console.error('[LOADER] Error:', e.message);
      }
    }
  });

  sock.ev.on('messages.delete', async (update) => {
    try {
      const keys = update?.keys || (update?.key ? [update.key] : []);
      if (keys.length) {
        await safetyPlugin.onDeletedMessage(sock, keys, instanceId);
      }
    } catch (e) {
      console.error('[LOADER] Anti-delete error:', e.message);
    }
  });

  sock.ev.on('call', async (calls) => {
    try {
      await safetyPlugin.onCall(sock, calls, instanceId);
    } catch (e) {
      console.error('[LOADER] Anti-call error:', e.message);
    }
  });

  sock.ev.on('group-participants.update', async (update) => {
    try {
      await handleGroupEvent(sock, update);
    } catch {}
  });

  console.log(`[LOADER] ${plugins.length} plugins loaded for: ${instanceId}`);
}

async function handleMessage(sock, msg, instanceId) {
  if (!msg.message) return;

  const ctx  = buildContext(sock, msg, instanceId);
  const text =
    msg.message?.conversation                                          ||
    msg.message?.extendedTextMessage?.text                             ||
    msg.message?.imageMessage?.caption                                 ||
    msg.message?.videoMessage?.caption                                 ||
    msg.message?.buttonsResponseMessage?.selectedButtonId              ||
    msg.message?.listResponseMessage?.singleSelectReply?.selectedRowId ||
    '';

  ctx.body = text;

  // Passive onMessage hooks
  for (const plugin of plugins) {
    if (typeof plugin.onMessage === 'function') {
      await plugin.onMessage(sock, msg, ctx).catch(() => {});
    }
  }

  // Command check first
  const parsed = parseCommand(text);

  if (parsed) {
    const { command, args, body } = parsed;
    for (const plugin of plugins) {
      if (!plugin.commands) continue;
      const handler = plugin.commands[command];
      if (typeof handler === 'function') {
        await handler(sock, msg, ctx, args, body).catch((e) => {
          console.error(`[PLUGIN:${command}] Error:`, e.message);
          sock.sendMessage(ctx.jid, {
            text: `⚠️ Error in *.${command}*\n\`${e.message}\``,
          }, { quoted: msg }).catch(() => {});
        });
        return;
      }
    }
    return;
  }

  // Auto-reply only for personal chat non-commands
  if (!ctx.isGroup && !msg.key?.fromMe) {
    await autoReplyPlugin.handleAutoReply(sock, msg, ctx).catch(() => {});
  }
}

// FIXED: uses Database.getAdmin() instead of getInstance()
async function handleGroupEvent(sock, update) {
  const { id: groupJid, participants, action } = update;
  const Database        = require('../lib/Database');
  const SettingsHandler = require('../lib/SettingsHandler');

  const adminJid = Database.getAdmin();
  if (!adminJid) return;

  const settings = SettingsHandler.get(adminJid);

  if (action === 'add' && settings.WELCOME_MSG) {
    for (const participant of participants) {
      await sock.sendMessage(groupJid, {
        text:     `👋 Welcome @${participant.split('@')[0]} to the group!\n\n_YOUSAF-MD_`,
        mentions: [participant],
      }).catch(() => {});
    }
  }

  if (action === 'remove' && settings.GOODBYE_MSG) {
    for (const participant of participants) {
      await sock.sendMessage(groupJid, {
        text:     `👋 Goodbye @${participant.split('@')[0]}!\n\n_YOUSAF-MD_`,
        mentions: [participant],
      }).catch(() => {});
    }
  }
}

module.exports = loader;
