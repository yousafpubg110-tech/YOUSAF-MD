/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║         YOUSAF-BALOCH-MD — EVENT HANDLER                        ║
 * ║         Anti-Link, Anti-BadWord, Welcome, Goodbye, Anti-Call    ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import { CONFIG, SYSTEM, OWNER } from '../config.js';

// ═══════════════════════════════════════════════════════════════════
//  WARNING STORE — Memory based
//  Structure: "groupJid:senderJid" => { link: 0, bad: 0 }
// ═══════════════════════════════════════════════════════════════════

const warnStore = new Map();

function getWarns(group, sender) {
  return warnStore.get(`${group}:${sender}`) || { link: 0, bad: 0 };
}

function addWarn(group, sender, type) {
  const key  = `${group}:${sender}`;
  const data = warnStore.get(key) || { link: 0, bad: 0 };
  data[type] = (data[type] || 0) + 1;
  warnStore.set(key, data);
  return data[type];
}

// Clear warns immediately after remove — so re-added user gets fresh start
function clearWarns(group, sender) {
  warnStore.delete(`${group}:${sender}`);
}

// ═══════════════════════════════════════════════════════════════════
//  BAD WORDS LIST
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
  return BAD_WORDS.some(word => lower.includes(word.toLowerCase()));
}

// ═══════════════════════════════════════════════════════════════════
//  LINK DETECTOR
// ═══════════════════════════════════════════════════════════════════

function containsLink(text) {
  return /(https?:\/\/|www\.)|chat\.whatsapp\.com\/[a-zA-Z0-9]{5,}/i.test(text);
}

// ═══════════════════════════════════════════════════════════════════
//  HELPER — get group admin list
// ═══════════════════════════════════════════════════════════════════

async function getGroupAdmins(sock, groupJid) {
  try {
    const meta   = await sock.groupMetadata(groupJid);
    const admins = meta.participants
      .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
      .map(p => p.id);
    const botJid   = sock.user.id.replace(/:.*@/, '@');
    return { admins, isBotAdmin: admins.includes(botJid) };
  } catch {
    return { admins: [], isBotAdmin: false };
  }
}

// ═══════════════════════════════════════════════════════════════════
//  REGISTER ALL EVENTS
//  Call once after connection === 'open'
// ═══════════════════════════════════════════════════════════════════

export function registerEvents(sock) {

  // ── 1. WELCOME / GOODBYE ────────────────────────────────────────
  sock.ev.on('group_participants.update', async (update) => {
    try {
      const { id, participants, action } = update;
      if (!CONFIG.WELCOME && !CONFIG.GOODBYE) return;

      const meta      = await sock.groupMetadata(id).catch(() => null);
      if (!meta) return;
      const groupName = meta.subject || 'this group';

      for (const participant of participants) {
        const num = participant.split('@')[0];

        if (action === 'add' && CONFIG.WELCOME) {
          await sock.sendMessage(id, {
            text:
              `╭━━━━━━━━━━━━━━━━━━━━╮\n` +
              `┃  Welcome @${num}\n` +
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
              `┃  Goodbye @${num}\n` +
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

  // ── 2. ANTI-CALL ────────────────────────────────────────────────
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

  // ── 3. ANTI-LINK + ANTI-BAD WORD ────────────────────────────────
  sock.ev.on('messages.upsert', async (m) => {
    if (m.type !== 'notify') return;

    for (const msg of m.messages) {
      try {
        if (!msg.message) continue;

        const from    = msg.key.remoteJid;
        const sender  = msg.key.participant || msg.key.remoteJid;
        const isGroup = from.endsWith('@g.us');
        if (!isGroup) continue;

        // Get text
        const msgType = Object.keys(msg.message)[0];
        let text = '';
        if (msgType === 'conversation') {
          text = msg.message.conversation || '';
        } else if (msgType === 'extendedTextMessage') {
          text = msg.message.extendedTextMessage?.text || '';
        }
        if (!text) continue;

        // Admin check — admins are exempt
        const { admins, isBotAdmin } = await getGroupAdmins(sock, from);
        if (admins.includes(sender)) continue;

        const num = sender.split('@')[0];

        // ══════════════════════════════════════════════════════════
        //  ANTI-LINK
        // ══════════════════════════════════════════════════════════
        if (CONFIG.ANTI_LINK && containsLink(text)) {

          // Delete message immediately
          await sock.sendMessage(from, { delete: msg.key }).catch(() => {});

          const warnCount = addWarn(from, sender, 'link');
          const remaining = 2 - warnCount;

          if (warnCount < 3) {
            await sock.sendMessage(from, {
              text:
                `🚫 *Anti-Link Warning ${warnCount}/2*\n\n` +
                `@${num} you sent a link!\n\n` +
                `You have been warned by *${OWNER.FULL_NAME}* (Bot Owner).\n` +
                `Do NOT send links again!\n\n` +
                `You have *${remaining > 0 ? remaining : 0}* chance(s) remaining.\n\n` +
                `${SYSTEM.SHORT_WATERMARK}`,
              mentions: [sender],
            });
          } else {
            // 3rd offense — remove
            if (isBotAdmin) {
              await sock.sendMessage(from, {
                text:
                  `🔴 *Final Warning — Removed*\n\n` +
                  `@${num} sent a link for the 3rd time.\n` +
                  `Removed from group by order of *${OWNER.FULL_NAME}*!\n\n` +
                  `${SYSTEM.SHORT_WATERMARK}`,
                mentions: [sender],
              });
              await sock.groupParticipantsUpdate(from, [sender], 'remove').catch(() => {});
            }
            // Clear warns immediately — fresh start if re-added
            clearWarns(from, sender);
          }

          continue; // skip bad word check for same message
        }

        // ══════════════════════════════════════════════════════════
        //  ANTI-BAD WORD
        // ══════════════════════════════════════════════════════════
        if (CONFIG.ANTI_BAD && containsBadWord(text)) {

          // Delete message immediately
          await sock.sendMessage(from, { delete: msg.key }).catch(() => {});

          const warnCount = addWarn(from, sender, 'bad');

          if (warnCount === 1) {
            await sock.sendMessage(from, {
              text:
                `⚠️ *Bad Word Warning 1/3*\n\n` +
                `@${num} you used inappropriate language!\n\n` +
                `Such words are strictly prohibited in this group.\n` +
                `This is your *1st warning* from *${OWNER.FULL_NAME}* (Bot Owner).\n\n` +
                `Do not repeat this or your warnings will increase.\n\n` +
                `${SYSTEM.SHORT_WATERMARK}`,
              mentions: [sender],
            });

          } else if (warnCount === 2) {
            await sock.sendMessage(from, {
              text:
                `🟠 *Bad Word Warning 2/3*\n\n` +
                `@${num} you used inappropriate language again!\n\n` +
                `This is your *2nd warning* from *${OWNER.FULL_NAME}* (Bot Owner).\n\n` +
                `⛔ *One more violation and you will be REMOVED from this group!*\n\n` +
                `${SYSTEM.SHORT_WATERMARK}`,
              mentions: [sender],
            });

          } else {
            // 3rd offense — remove
            if (isBotAdmin) {
              await sock.sendMessage(from, {
                text:
                  `🔴 *Final Warning — Removed*\n\n` +
                  `@${num} used inappropriate language for the 3rd time.\n` +
                  `Removed from group by order of *${OWNER.FULL_NAME}*!\n\n` +
                  `${SYSTEM.SHORT_WATERMARK}`,
                mentions: [sender],
              });
              await sock.groupParticipantsUpdate(from, [sender], 'remove').catch(() => {});
            }
            // Clear warns immediately — fresh start if re-added
            clearWarns(from, sender);
          }
        }

      } catch (err) {
        console.error('[EVENT] message event error:', err.message);
      }
    }
  });

  console.log('[EVENTS] ✅ EventHandler registered — Anti-Link, Anti-BadWord, Welcome, Goodbye, Anti-Call');
}

export default { registerEvents };
