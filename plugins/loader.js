// ============================================================
//   YOUSAF-MD — PLUGIN LOADER (MASTER INJECTOR)
//   Developer: Muhammad Yousaf Baloch
// ============================================================

'use strict';

const { buildContext }   = require('../lib/PermissionHandler');
const config             = require('../config');
const safetyPlugin       = require('./safety');
const autoReplyPlugin    = require('./autoreply');

// All plugin modules
const plugins = [
  require('./menu'),
  require('./settings'),
  require('./downloader'),
  safetyPlugin,
  require('./group'),
  require('./media'),
  require('./tools'),
  require('./info'),
  autoReplyPlugin,
];

// ── PARSE COMMAND FROM TEXT ────────────────────────────────
function parseCommand(text = '') {
  if (!text.startsWith(config.PREFIX)) return null;
  const parts   = text.slice(config.PREFIX.length).trim().split(/\s+/);
  const command = parts[0].toLowerCase();
  const args    = parts.slice(1);
  const body    = parts.slice(1).join(' ');
  return { command, args, body };
}

// ── MAIN LOADER ────────────────────────────────────────────
function loader(sock, instanceId) {

  // ── 1. MESSAGE HANDLER ─────────────────────────────────
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;

    for (const msg of messages) {
      try {
        await handleMessage(sock, msg, instanceId);
      } catch (e) {
        console.error(`[LOADER] Unhandled error in ${instanceId}:`, e.message);
      }
    }
  });

  // ── 2. ANTI-DELETE HOOK ────────────────────────────────
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

  // ── 3. STATUS VIEW & LIKE HOOK ─────────────────────────
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;
    const statusMsgs = messages.filter(m => m.key?.remoteJid === 'status@broadcast');
    if (statusMsgs.length) {
      await safetyPlugin.onStatusUpdate(sock, statusMsgs, instanceId).catch(() => {});
    }
  });

  // ── 4. ANTI-CALL HOOK ──────────────────────────────────
  sock.ev.on('call', async (calls) => {
    try {
      await safetyPlugin.onCall(sock, calls, instanceId);
    } catch (e) {
      console.error('[LOADER] Anti-call error:', e.message);
    }
  });

  // ── 5. GROUP PARTICIPANT EVENTS ─────────────────────────
  sock.ev.on('group-participants.update', async (update) => {
    try {
      await handleGroupEvent(sock, update, instanceId);
    } catch {}
  });

  console.log(`[LOADER] ✅ ${plugins.length} plugin(s) + 4 event hooks loaded for: ${instanceId}`);
}

// ── MESSAGE DISPATCHER ─────────────────────────────────────
async function handleMessage(sock, msg, instanceId) {
  if (!msg.message) return;
  if (msg.key?.remoteJid === 'status@broadcast') return;

  const ctx = buildContext(sock, msg, instanceId);

  const text =
    msg.message?.conversation                                          ||
    msg.message?.extendedTextMessage?.text                             ||
    msg.message?.imageMessage?.caption                                 ||
    msg.message?.videoMessage?.caption                                 ||
    msg.message?.buttonsResponseMessage?.selectedButtonId              ||
    msg.message?.listResponseMessage?.singleSelectReply?.selectedRowId ||
    '';

  ctx.body = text;

  // ── Run passive safety hooks on every message ──────────
  for (const plugin of plugins) {
    if (typeof plugin.onMessage === 'function') {
      await plugin.onMessage(sock, msg, ctx).catch(() => {});
    }
  }

  // ── AUTO REPLY — personal chat (non-command messages) ──
  const isPersonalChat = !ctx.jid.endsWith('@g.us');
  const isCommand      = text.startsWith(config.PREFIX);

  if (isPersonalChat && !msg.key?.fromMe) {
    await autoReplyPlugin.handleAutoReply(sock, msg, ctx).catch(() => {});
  }

  // ── Parse and route command ────────────────────────────
  const parsed = parseCommand(text);
  if (!parsed) return;

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
}

// ── GROUP EVENTS (Welcome/Goodbye) ─────────────────────────
async function handleGroupEvent(sock, update, instanceId) {
  const { id: groupJid, participants, action } = update;
  const { Database }    = require('../lib/Database');
  const SettingsHandler = require('../lib/SettingsHandler');
  const instance        = Database.getInstance ? require('../lib/Database').getInstance(instanceId) : null;
  if (!instance?.jid) return;

  const settings = SettingsHandler.get(instance.jid);

  if (action === 'add' && settings.WELCOME_MSG) {
    for (const participant of participants) {
      await sock.sendMessage(groupJid, {
        text: `👋 Welcome @${participant.split('@')[0]} to the group!\n\n_YOUSAF-MD_`,
        mentions: [participant],
      }).catch(() => {});
    }
  }

  if (action === 'remove' && settings.GOODBYE_MSG) {
    for (const participant of participants) {
      await sock.sendMessage(groupJid, {
        text: `👋 Goodbye @${participant.split('@')[0]}! We'll miss you.\n\n_YOUSAF-MD_`,
        mentions: [participant],
      }).catch(() => {});
    }
  }
}

module.exports = loader;
    
