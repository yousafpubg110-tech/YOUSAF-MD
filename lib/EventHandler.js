/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║         YOUSAF-BALOCH-MD — EVENT HANDLER                        ║
 * ║  Anti-Link, Anti-Bad, Anti-Delete, Anti-ViewOnce                ║
 * ║  Auto-Status, Auto-Like, Auto-React, Welcome, Goodbye           ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import { CONFIG, SYSTEM, OWNER } from '../config.js';

// ═══════════════════════════════════════════════════════════════════
//  WARNING STORE
// ═══════════════════════════════════════════════════════════════════

const warnStore = new Map();

function addWarn(group, sender, type) {
  const key  = `${group}:${sender}`;
  const data = warnStore.get(key) || { link: 0, bad: 0 };
  data[type] = (data[type] || 0) + 1;
  warnStore.set(key, data);
  return data[type];
}

function clearWarns(group, sender) {
  warnStore.delete(`${group}:${sender}`);
}

// ═══════════════════════════════════════════════════════════════════
//  BAD WORDS
// ═══════════════════════════════════════════════════════════════════

const BAD_WORDS = [
  'sexy', 'porn', 'xxx', 'brazzer', 'brazzers',
  'xvideo', 'xvideos', 'pornhub', 'xnxx', 'xhamster',
  'nude', 'naked', 'fuck', 'sex', 'bitch', 'whore',
  'slut', 'dick', 'pussy', 'boobs', 'penis', 'vagina',
  'chudai', 'gaand', 'lund', 'chut', 'harami',
  'madarchod', 'bhenchod', 'randi', 'gandu', 'bsdk',
];

function containsBadWord(text) {
  const lower = text.toLowerCase().replace(/\s+/g, '');
  return BAD_WORDS.some(w => lower.includes(w.toLowerCase()));
}

function containsLink(text) {
  return /(https?:\/\/|www\.)|chat\.whatsapp\.com\/[a-zA-Z0-9]{5,}/i.test(text);
}

// ═══════════════════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════════════════

async function getGroupAdmins(sock, groupJid) {
  try {
    const meta   = await sock.groupMetadata(groupJid);
    const admins = meta.participants
      .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
      .map(p => p.id);
    const botJid = sock.user.id.replace(/:.*@/, '@');
    return { admins, isBotAdmin: admins.includes(botJid) };
  } catch {
    return { admins: [], isBotAdmin: false };
  }
}

function cleanJid(jid) {
  return jid?.replace(/:.*@/, '@') || jid;
}

// ═══════════════════════════════════════════════════════════════════
//  REGISTER ALL EVENTS
// ═══════════════════════════════════════════════════════════════════

export function registerEvents(sock) {

  // ── 1. AUTO STATUS VIEW + AUTO LIKE STATUS ───────────────────────
  sock.ev.on('messages.upsert', async (m) => {
    for (const msg of m.messages) {
      try {
        if (!msg.message) continue;

        const from = msg.key.remoteJid;

        // Status messages — from = 'status@broadcast'
        if (from === 'status@broadcast') {

          // Auto View Status
          if (CONFIG.AUTO_STATUS || CONFIG.AUTO_READ_STATUS) {
            await sock.readMessages([msg.key]).catch(() => {});
          }

          // Auto Like Status
          if (CONFIG.AUTO_LIKE_STATUS) {
            await sock.sendMessage(from, {
              react: { text: '❤️', key: msg.key },
            }, { statusJidList: [msg.key.participant] }).catch(() => {});
          }
        }
      } catch (err) {
        console.error('[EVENT] auto-status error:', err.message);
      }
    }
  });

  // ── 2. AUTO REACT ────────────────────────────────────────────────
  sock.ev.on('messages.upsert', async (m) => {
    if (!CONFIG.AUTO_REACT) return;
    if (m.type !== 'notify') return;

    const reacts = ['❤️', '😍', '🔥', '👍', '😂', '🎉', '💯', '✨'];

    for (const msg of m.messages) {
      try {
        if (!msg.message) continue;
        const from = msg.key.remoteJid;
        if (from === 'status@broadcast') continue;
        if (msg.key.fromMe) continue;

        const emoji = reacts[Math.floor(Math.random() * reacts.length)];
        await sock.sendMessage(from, {
          react: { text: emoji, key: msg.key },
        }).catch(() => {});
      } catch (err) {
        console.error('[EVENT] auto-react error:', err.message);
      }
    }
  });

  // ── 3. AUTO READ MESSAGES ────────────────────────────────────────
  sock.ev.on('messages.upsert', async (m) => {
    if (!CONFIG.AUTO_READ) return;
    if (m.type !== 'notify') return;

    for (const msg of m.messages) {
      try {
        if (!msg.message) continue;
        if (msg.key.fromMe) continue;
        await sock.readMessages([msg.key]).catch(() => {});
      } catch (err) {
        console.error('[EVENT] auto-read error:', err.message);
      }
    }
  });

  // ── 4. ANTI DELETE ───────────────────────────────────────────────
  sock.ev.on('messages.update', async (updates) => {
    if (!CONFIG.ANTI_DELETE) return;

    for (const update of updates) {
      try {
        const { key, update: msgUpdate } = update;

        // Delete کا signal — messageStubType === 1
        if (msgUpdate?.messageStubType !== 1) continue;

        // Bot کا خود کا deleted message ignore کرو
        if (key.fromMe) continue;

        const from   = key.remoteJid;
        const sender = cleanJid(key.participant || from);
        const num    = sender.split('@')[0];

        // Bot owner/deployer کا deleted message forward نہ کرو
        const { isDeployer, isOwner } = await import('../config.js');
        if (isOwner(sender) || isDeployer(sender)) continue;

        await sock.sendMessage(from, {
          text:
            `🗑️ *Anti-Delete Alert!*\n\n` +
            `@${num} deleted a message!\n\n` +
            `${SYSTEM.SHORT_WATERMARK}`,
          mentions: [sender],
        }).catch(() => {});

      } catch (err) {
        console.error('[EVENT] anti-delete error:', err.message);
      }
    }
  });

  // ── 5. ANTI VIEW ONCE ────────────────────────────────────────────
  sock.ev.on('messages.upsert', async (m) => {
    if (!CONFIG.ANTI_VIEW_ONCE) return;
    if (m.type !== 'notify') return;

    for (const msg of m.messages) {
      try {
        if (!msg.message) continue;
        if (msg.key.fromMe) continue;

        const from = msg.key.remoteJid;
        const viewOnceMsg =
          msg.message?.viewOnceMessage?.message ||
          msg.message?.viewOnceMessageV2?.message ||
          msg.message?.viewOnceMessageV2Extension?.message;

        if (!viewOnceMsg) continue;

        // View once message کو normal message میں convert کرو
        const mediaType = Object.keys(viewOnceMsg)[0];
        const mediaContent = viewOnceMsg[mediaType];

        if (!mediaContent) continue;

        await sock.sendMessage(from, {
          forward: {
            key: msg.key,
            message: { [mediaType]: { ...mediaContent, viewOnce: false } },
          },
        }, { quoted: msg }).catch(() => {});

      } catch (err) {
        console.error('[EVENT] anti-viewonce error:', err.message);
      }
    }
  });

  // ── 6. WELCOME / GOODBYE ─────────────────────────────────────────
  sock.ev.on('group_participants.update', async (update) => {
    try {
      const { id, participants, action } = update;
      if (!CONFIG.WELCOME && !CONFIG.GOODBYE) return;

      const meta = await sock.groupMetadata(id).catch(() => null);
      if (!meta) return;
      const groupName = meta.subject || 'this group';

      for (const participant of participants) {
        const num = participant.split('@')[0];

        if (action === 'add' && CONFIG.WELCOME) {
          await sock.sendMessage(id, {
            text:
              `╭━━━━━━━━━━━━━━━━━━━━╮\n` +
              `┃  👋 Welcome @${num}\n` +
              `┃  to *${groupName}*!\n` +
              `┃  We are glad you joined. 😊\n` +
              `╰━━━━━━━━━━━━━━━━━━━━╯\n` +
              `${SYSTEM.SHORT_WATERMARK}`,
            mentions: [participant],
          });
        }

        if ((action === 'remove' || action === 'leave') && CONFIG.GOODBYE) {
          await sock.sendMessage(id, {
            text:
              `╭━━━━━━━━━━━━━━━━━━━━╮\n` +
              `┃  👋 Goodbye @${num}\n` +
              `┃  has left *${groupName}*.\n` +
              `╰━━━━━━━━━━━━━━━━━━━━╯\n` +
              `${SYSTEM.SHORT_WATERMARK}`,
            mentions: [participant],
          });
        }
      }
    } catch (err) {
      console.error('[EVENT] group_participants error:', err.message);
    }
  });

  // ── 7. ANTI-CALL ─────────────────────────────────────────────────
  sock.ev.on('call', async (calls) => {
    if (!CONFIG.ANTI_CALL) return;
    try {
      for (const call of calls) {
        if (call.status === 'offer') {
          await sock.rejectCall(call.id, call.from).catch(() => {});
          await sock.sendMessage(call.from, {
            text:
              `❌ *Calls are not allowed!*\n\n` +
              `This bot does not accept calls.\n` +
              `${SYSTEM.SHORT_WATERMARK}`,
          });
        }
      }
    } catch (err) {
      console.error('[EVENT] anti-call error:', err.message);
    }
  });

  // ── 8. ANTI-LINK + ANTI-BAD WORD ────────────────────────────────
  sock.ev.on('messages.upsert', async (m) => {
    if (m.type !== 'notify') return;

    for (const msg of m.messages) {
      try {
        if (!msg.message) continue;

        const from    = msg.key.remoteJid;
        const sender  = cleanJid(msg.key.participant || msg.key.remoteJid);
        const isGroup = from.endsWith('@g.us');
        if (!isGroup) continue;

        const msgType = Object.keys(msg.message)[0];
        let text = '';
        if (msgType === 'conversation') {
          text = msg.message.conversation || '';
        } else if (msgType === 'extendedTextMessage') {
          text = msg.message.extendedTextMessage?.text || '';
        }
        if (!text) continue;

        const { admins, isBotAdmin } = await getGroupAdmins(sock, from);
        if (admins.includes(sender)) continue;

        const num = sender.split('@')[0];

        // ANTI-LINK
        if (CONFIG.ANTI_LINK && containsLink(text)) {
          await sock.sendMessage(from, { delete: msg.key }).catch(() => {});

          const warnCount = addWarn(from, sender, 'link');
          const remaining = 2 - warnCount;

          if (warnCount < 3) {
            await sock.sendMessage(from, {
              text:
                `🚫 *Anti-Link Warning ${warnCount}/2*\n\n` +
                `@${num} you sent a link!\n\n` +
                `You have been warned by *${OWNER.FULL_NAME}*.\n` +
                `You have *${remaining > 0 ? remaining : 0}* chance(s) remaining.\n\n` +
                `${SYSTEM.SHORT_WATERMARK}`,
              mentions: [sender],
            });
          } else {
            if (isBotAdmin) {
              await sock.sendMessage(from, {
                text:
                  `🔴 *Removed!*\n\n` +
                  `@${num} sent a link for the 3rd time.\n` +
                  `Removed by order of *${OWNER.FULL_NAME}*!\n\n` +
                  `${SYSTEM.SHORT_WATERMARK}`,
                mentions: [sender],
              });
              await sock.groupParticipantsUpdate(from, [sender], 'remove').catch(() => {});
            }
            clearWarns(from, sender);
          }
          continue;
        }

        // ANTI-BAD WORD
        if (CONFIG.ANTI_BAD && containsBadWord(text)) {
          await sock.sendMessage(from, { delete: msg.key }).catch(() => {});

          const warnCount = addWarn(from, sender, 'bad');

          if (warnCount === 1) {
            await sock.sendMessage(from, {
              text:
                `⚠️ *Bad Word Warning 1/3*\n\n` +
                `@${num} you used inappropriate language!\n` +
                `This is your *1st warning*.\n\n` +
                `${SYSTEM.SHORT_WATERMARK}`,
              mentions: [sender],
            });
          } else if (warnCount === 2) {
            await sock.sendMessage(from, {
              text:
                `🟠 *Bad Word Warning 2/3*\n\n` +
                `@${num} again inappropriate language!\n` +
                `⛔ *One more and you will be REMOVED!*\n\n` +
                `${SYSTEM.SHORT_WATERMARK}`,
              mentions: [sender],
            });
          } else {
            if (isBotAdmin) {
              await sock.sendMessage(from, {
                text:
                  `🔴 *Removed!*\n\n` +
                  `@${num} used bad words 3 times.\n` +
                  `Removed by order of *${OWNER.FULL_NAME}*!\n\n` +
                  `${SYSTEM.SHORT_WATERMARK}`,
                mentions: [sender],
              });
              await sock.groupParticipantsUpdate(from, [sender], 'remove').catch(() => {});
            }
            clearWarns(from, sender);
          }
        }

      } catch (err) {
        console.error('[EVENT] message event error:', err.message);
      }
    }
  });

  console.log('[EVENTS] ✅ EventHandler registered — AutoStatus, AutoLike, AutoReact, AntiDelete, AntiViewOnce, AntiLink, AntiBad, Welcome, Goodbye, AntiCall');
}

export default { registerEvents };
