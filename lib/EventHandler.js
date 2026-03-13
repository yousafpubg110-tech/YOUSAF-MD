/**
 * EventHandler — YOUSAF-MD
 * Created by: Muhammad Yousaf Baloch
 */

import { CONFIG, SYSTEM, OWNER, isOwner, isDeployer } from '../config.js';

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

const BAD_WORDS = [
  'sexy','porn','xxx','brazzer','brazzers',
  'xvideo','xvideos','pornhub','xnxx','xhamster',
  'nude','naked','fuck','sex','bitch','whore',
  'slut','dick','pussy','boobs','penis','vagina',
  'chudai','gaand','lund','chut','harami',
  'madarchod','bhenchod','randi','gandu','bsdk',
];

function containsBadWord(text) {
  const lower = text.toLowerCase().replace(/\s+/g, '');
  return BAD_WORDS.some(w => lower.includes(w));
}

function containsLink(text) {
  return /(https?:\/\/|www\.)|chat\.whatsapp\.com\/[a-zA-Z0-9]{5,}/i.test(text);
}

function fixJid(jid) {
  return jid ? jid.replace(/:.*@/, '@') : jid;
}

async function getGroupAdmins(sock, groupJid) {
  try {
    const meta   = await sock.groupMetadata(groupJid);
    const admins = meta.participants
      .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
      .map(p => p.id);
    const botJid = fixJid(sock.user.id);
    return { admins, isBotAdmin: admins.some(a => fixJid(a) === botJid) };
  } catch {
    return { admins: [], isBotAdmin: false };
  }
}

export function registerEvents(sock) {

  // 1. AUTO STATUS VIEW + AUTO LIKE
  sock.ev.on('messages.upsert', async (m) => {
    for (const msg of m.messages) {
      try {
        if (!msg.message) continue;
        if (msg.key.remoteJid !== 'status@broadcast') continue;
        if (CONFIG.AUTO_STATUS || CONFIG.AUTO_READ_STATUS) {
          await sock.readMessages([msg.key]).catch(() => {});
        }
        if (CONFIG.AUTO_LIKE_STATUS) {
          await sock.sendMessage('status@broadcast', {
            react: { text: '❤️', key: msg.key },
          }, { statusJidList: [msg.key.participant] }).catch(() => {});
        }
      } catch (_) {}
    }
  });

  // 2. AUTO REACT
  sock.ev.on('messages.upsert', async (m) => {
    if (!CONFIG.AUTO_REACT) return;
    if (m.type !== 'notify') return;
    const reacts = ['❤️','😍','🔥','👍','😂','🎉','💯','✨'];
    for (const msg of m.messages) {
      try {
        if (!msg.message) continue;
        if (msg.key.remoteJid === 'status@broadcast') continue;
        if (msg.key.fromMe) continue;
        await sock.sendMessage(msg.key.remoteJid, {
          react: { text: reacts[Math.floor(Math.random() * reacts.length)], key: msg.key },
        }).catch(() => {});
      } catch (_) {}
    }
  });

  // 3. AUTO READ
  sock.ev.on('messages.upsert', async (m) => {
    if (!CONFIG.AUTO_READ) return;
    if (m.type !== 'notify') return;
    for (const msg of m.messages) {
      try {
        if (!msg.message) continue;
        if (msg.key.fromMe) continue;
        await sock.readMessages([msg.key]).catch(() => {});
      } catch (_) {}
    }
  });

  // 4. ANTI DELETE
  sock.ev.on('messages.update', async (updates) => {
    if (!CONFIG.ANTI_DELETE) return;
    for (const update of updates) {
      try {
        if (update.update?.messageStubType !== 1) continue;
        if (update.key.fromMe) continue;
        const from   = update.key.remoteJid;
        const sender = fixJid(update.key.participant || from);
        if (isOwner(sender) || isDeployer(sender)) continue;
        const num = sender.split('@')[0];
        await sock.sendMessage(from, {
          text:
            `🗑️ *Anti-Delete Alert!*\n\n` +
            `@${num} deleted a message!\n\n` +
            `${SYSTEM.SHORT_WATERMARK}`,
          mentions: [sender],
        }).catch(() => {});
      } catch (_) {}
    }
  });

  // 5. ANTI VIEW ONCE
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
        const mediaType    = Object.keys(viewOnceMsg)[0];
        const mediaContent = viewOnceMsg[mediaType];
        if (!mediaContent || !mediaContent.url) continue;
        if (mediaType.includes('image')) {
          await sock.sendMessage(from, {
            image:   { url: mediaContent.url },
            caption: `👁️ *View-Once Revealed!*\n${SYSTEM.SHORT_WATERMARK}`,
          }, { quoted: msg }).catch(() => {});
        } else if (mediaType.includes('video')) {
          await sock.sendMessage(from, {
            video:   { url: mediaContent.url },
            caption: `👁️ *View-Once Revealed!*\n${SYSTEM.SHORT_WATERMARK}`,
          }, { quoted: msg }).catch(() => {});
        }
      } catch (_) {}
    }
  });

  // 6. WELCOME / GOODBYE
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
              `┃  We are glad you joined 😊\n` +
              `╰━━━━━━━━━━━━━━━━━━━━╯\n` +
              `${SYSTEM.SHORT_WATERMARK}`,
            mentions: [participant],
          }).catch(() => {});
        }
        if ((action === 'remove' || action === 'leave') && CONFIG.GOODBYE) {
          await sock.sendMessage(id, {
            text:
              `╭━━━━━━━━━━━━━━━━━━━━╮\n` +
              `┃  👋 Goodbye @${num}\n` +
              `┃  has left *${groupName}*\n` +
              `╰━━━━━━━━━━━━━━━━━━━━╯\n` +
              `${SYSTEM.SHORT_WATERMARK}`,
            mentions: [participant],
          }).catch(() => {});
        }
      }
    } catch (_) {}
  });

  // 7. ANTI CALL
  sock.ev.on('call', async (calls) => {
    if (!CONFIG.ANTI_CALL) return;
    for (const call of calls) {
      try {
        if (call.status !== 'offer') continue;
        await sock.rejectCall(call.id, call.from).catch(() => {});
        await sock.sendMessage(call.from, {
          text: `❌ *Calls not allowed!*\n${SYSTEM.SHORT_WATERMARK}`,
        }).catch(() => {});
      } catch (_) {}
    }
  });

  // 8. ANTI LINK + ANTI BAD WORD
  sock.ev.on('messages.upsert', async (m) => {
    if (m.type !== 'notify') return;
    for (const msg of m.messages) {
      try {
        if (!msg.message) continue;
        const from    = msg.key.remoteJid;
        const sender  = fixJid(msg.key.participant || from);
        if (!from.endsWith('@g.us')) continue;

        const msgType = Object.keys(msg.message)[0];
        let text = '';
        if (msgType === 'conversation') {
          text = msg.message.conversation || '';
        } else if (msgType === 'extendedTextMessage') {
          text = msg.message.extendedTextMessage?.text || '';
        }
        if (!text) continue;

        const { admins, isBotAdmin } = await getGroupAdmins(sock, from);
        if (admins.some(a => fixJid(a) === sender)) continue;
        if (isOwner(sender) || isDeployer(sender)) continue;

        const num = sender.split('@')[0];

        if (CONFIG.ANTI_LINK && containsLink(text)) {
          await sock.sendMessage(from, { delete: msg.key }).catch(() => {});
          const warnCount = addWarn(from, sender, 'link');
          if (warnCount < 3) {
            await sock.sendMessage(from, {
              text:
                `🚫 *Anti-Link Warning ${warnCount}/2*\n\n` +
                `@${num} sent a link!\n` +
                `*${2 - warnCount}* chance(s) remaining.\n\n` +
                `${SYSTEM.SHORT_WATERMARK}`,
              mentions: [sender],
            }).catch(() => {});
          } else {
            if (isBotAdmin) {
              await sock.sendMessage(from, {
                text: `🔴 *Removed!* @${num} sent links 3 times.\n${SYSTEM.SHORT_WATERMARK}`,
                mentions: [sender],
              }).catch(() => {});
              await sock.groupParticipantsUpdate(from, [sender], 'remove').catch(() => {});
            }
            clearWarns(from, sender);
          }
          continue;
        }

        if (CONFIG.ANTI_BAD && containsBadWord(text)) {
          await sock.sendMessage(from, { delete: msg.key }).catch(() => {});
          const warnCount = addWarn(from, sender, 'bad');
          if (warnCount === 1) {
            await sock.sendMessage(from, {
              text:
                `⚠️ *Bad Word Warning 1/3*\n\n` +
                `@${num} used bad language!\n` +
                `This is your *1st warning*.\n\n` +
                `${SYSTEM.SHORT_WATERMARK}`,
              mentions: [sender],
            }).catch(() => {});
          } else if (warnCount === 2) {
            await sock.sendMessage(from, {
              text:
                `🟠 *Bad Word Warning 2/3*\n\n` +
                `@${num} again bad language!\n` +
                `⛔ *One more = REMOVED!*\n\n` +
                `${SYSTEM.SHORT_WATERMARK}`,
              mentions: [sender],
            }).catch(() => {});
          } else {
            if (isBotAdmin) {
              await sock.sendMessage(from, {
                text: `🔴 *Removed!* @${num} used bad words 3 times.\n${SYSTEM.SHORT_WATERMARK}`,
                mentions: [sender],
              }).catch(() => {});
              await sock.groupParticipantsUpdate(from, [sender], 'remove').catch(() => {});
            }
            clearWarns(from, sender);
          }
        }
      } catch (_) {}
    }
  });

  console.log('[EVENTS] ✅ All events registered successfully!');
}

export default { registerEvents };
