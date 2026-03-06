// ============================================================
//   YOUSAF-MD — PLUGIN LOADER (MASTER INJECTOR) [FIXED]
//   FIXES: Dead import removed | Anti-Delete, Status, Call
//          events now properly wired to safety plugin
//   Developer: Muhammad Yousaf Baloch
// ============================================================

'use strict';

const { buildContext }   = require('../lib/PermissionHandler');
const config             = require('../config');
const safetyPlugin       = require('./safety');

// All plugin modules
const plugins = [
  require('./settings'),
  require('./downloader'),
  safetyPlugin,
  require('./group'),
  require('./media'),
  require('./tools'),
  require('./info'),
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

// ── MAIN LOADER — attaches ALL event listeners ─────────────
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

  // ── 2. ANTI-DELETE HOOK (FIXED: now actually wired) ────
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

  // ── 3. STATUS VIEW & LIKE HOOK (FIXED: now wired) ──────
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;
    const statusMsgs = messages.filter(m => m.key?.remoteJid === 'status@broadcast');
    if (statusMsgs.length) {
      await safetyPlugin.onStatusUpdate(sock, statusMsgs, instanceId).catch(() => {});
    }
  });

  // ── 4. ANTI-CALL HOOK (FIXED: now wired) ───────────────
  sock.ev.on('call', async (calls) => {
    try {
      await safetyPlugin.onCall(sock, calls, instanceId);
    } catch (e) {
      console.error('[LOADER] Anti-call error:', e.message);
    }
  });

  // ── 5. GROUP PARTICIPANT EVENTS (welcome/goodbye) ───────
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
  if (msg.key?.remoteJid === 'status@broadcast') return; // handled by status hook

  const ctx = buildContext(sock, msg, instanceId);

  // Extract text from all message types
  const text =
    msg.message?.conversation                            ||
    msg.message?.extendedTextMessage?.text               ||
    msg.message?.imageMessage?.caption                   ||
    msg.message?.videoMessage?.caption                   ||
    msg.message?.buttonsResponseMessage?.selectedButtonId ||
    msg.message?.listResponseMessage?.singleSelectReply?.selectedRowId ||
    '';

  // ── Run passive safety hooks on every message ──────────
  for (const plugin of plugins) {
    if (typeof plugin.onMessage === 'function') {
      await plugin.onMessage(sock, msg, ctx).catch(() => {});
    }
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
      return; // stop after first match
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

