/*
╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃   YOUSAF-BALOCH-MD  •  sticker_v1      ┃
┃  Commands: sticker take steal ttp      ┃
┃        Created by MR YOUSAF BALOCH     ┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
*/
import { downloadMediaMessage } from '@whiskeysockets/baileys';
import { Sticker, StickerTypes } from 'wa-sticker-formatter';
import axios from 'axios';
import { SYSTEM } from '../config.js';

// ═══════════════════════════════════════════════════════════════════
//  HELPER — quoted message نکالو
// ═══════════════════════════════════════════════════════════════════

function getQuotedMsg(msg) {
  const ctx = msg.message?.extendedTextMessage?.contextInfo
    || msg.message?.imageMessage?.contextInfo
    || msg.message?.videoMessage?.contextInfo
    || msg.message?.stickerMessage?.contextInfo
    || null;

  if (!ctx?.quotedMessage) return null;

  return {
    key: {
      remoteJid: msg.key.remoteJid,
      id:        ctx.stanzaId,
      participant: ctx.participant,
      fromMe:    false,
    },
    message: ctx.quotedMessage,
  };
}

// ═══════════════════════════════════════════════════════════════════
//  HELPER — media buffer نکالو (خود یا quoted سے)
// ═══════════════════════════════════════════════════════════════════

async function getMediaBuffer(msg) {
  // پہلے quoted check کرو
  const quoted = getQuotedMsg(msg);
  const target = quoted || msg;

  const m = target.message;
  if (!m) return null;

  const mediaMsg =
    m.imageMessage   ||
    m.videoMessage   ||
    m.stickerMessage ||
    m.documentMessage || null;

  if (!mediaMsg) return null;

  try {
    const buf = await downloadMediaMessage(
      target,
      'buffer',
      {},
    );
    return buf;
  } catch (e) {
    console.error('[STICKER] downloadMediaMessage error:', e.message);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════
//  MAKE STICKER — buffer سے sticker بناؤ
// ═══════════════════════════════════════════════════════════════════

async function makeSticker(buffer, packName = 'YOUSAF-BALOCH-MD') {
  const sticker = new Sticker(buffer, {
    pack:    packName,
    author:  'By MR YOUSAF BALOCH',
    type:    StickerTypes.FULL,
    quality: 50,
  });
  return sticker.toBuffer();
}

// ═══════════════════════════════════════════════════════════════════
//  HANDLERS
// ═══════════════════════════════════════════════════════════════════

async function stickerHandler({ sock, msg, from }) {
  try {
    const buf = await getMediaBuffer(msg);
    if (!buf) {
      return msg.reply(
        `❌ *Please reply to an image or video!*\n\n` +
        `*.sticker* (reply to image/video)\n` +
        `*.s* (reply to image)\n` +
        `${SYSTEM.SHORT_WATERMARK}`
      );
    }

    await msg.react('⏳');
    const stickerBuf = await makeSticker(buf);
    await sock.sendMessage(from, { sticker: stickerBuf }, { quoted: msg });
    await msg.react('✅');
  } catch (err) {
    console.error('[STICKER ERROR]:', err.message);
    await msg.react('❌');
    await msg.reply(`❌ *Failed to create sticker!*\n_${err.message}_\n${SYSTEM.SHORT_WATERMARK}`);
  }
}

async function takeHandler({ sock, msg, from, args }) {
  try {
    const buf = await getMediaBuffer(msg);
    if (!buf) {
      return msg.reply(
        `❌ *Please reply to a sticker or image!*\n\n` +
        `*.take Pack Name* (reply to sticker)\n` +
        `${SYSTEM.SHORT_WATERMARK}`
      );
    }

    const packName = args?.length ? args.join(' ') : 'YOUSAF-BALOCH-MD';
    await msg.react('⏳');
    const stickerBuf = await makeSticker(buf, packName);
    await sock.sendMessage(from, { sticker: stickerBuf }, { quoted: msg });
    await msg.react('✅');
  } catch (err) {
    console.error('[TAKE ERROR]:', err.message);
    await msg.react('❌');
    await msg.reply(`❌ *Failed!*\n_${err.message}_\n${SYSTEM.SHORT_WATERMARK}`);
  }
}

async function stealHandler({ sock, msg, from, args }) {
  return takeHandler({ sock, msg, from, args });
}

async function ttpHandler({ sock, msg, from, args }) {
  try {
    if (!args?.length) {
      return msg.reply(
        `❌ *Please provide text!*\n\n` +
        `*.ttp Hello World*\n` +
        `*.ttp Pakistan Zindabad*\n` +
        `${SYSTEM.SHORT_WATERMARK}`
      );
    }

    const text = args.join(' ');
    await msg.react('⏳');

    // Method 1 — nexoracle API
    let imageBuf = null;
    try {
      const res = await axios.get(
        `https://api.nexoracle.com/image/ttp?apikey=free_key@maher_apis&text=${encodeURIComponent(text)}`,
        { responseType: 'arraybuffer', timeout: 15000 }
      );
      if (res.data && res.data.byteLength > 1000) {
        imageBuf = Buffer.from(res.data);
      }
    } catch (_) {}

    // Method 2 — budi api fallback
    if (!imageBuf) {
      try {
        const res = await axios.get(
          `https://api.budi.web.id/api/maker/ttp?text=${encodeURIComponent(text)}&color=white&bg=black`,
          { responseType: 'arraybuffer', timeout: 15000 }
        );
        if (res.data && res.data.byteLength > 1000) {
          imageBuf = Buffer.from(res.data);
        }
      } catch (_) {}
    }

    // Method 3 — siputzx API fallback
    if (!imageBuf) {
      try {
        const res = await axios.get(
          `https://api.siputzx.my.id/api/m/ttp?text=${encodeURIComponent(text)}`,
          { responseType: 'arraybuffer', timeout: 15000 }
        );
        if (res.data && res.data.byteLength > 1000) {
          imageBuf = Buffer.from(res.data);
        }
      } catch (_) {}
    }

    if (!imageBuf) throw new Error('All TTP APIs failed');

    const stickerBuf = await makeSticker(imageBuf);
    await sock.sendMessage(from, { sticker: stickerBuf }, { quoted: msg });
    await msg.react('✅');
  } catch (err) {
    console.error('[TTP ERROR]:', err.message);
    await msg.react('❌');
    await msg.reply(`❌ *Failed to create text sticker!*\n_${err.message}_\n${SYSTEM.SHORT_WATERMARK}`);
  }
}

async function toImgHandler({ sock, msg, from }) {
  try {
    const buf = await getMediaBuffer(msg);
    if (!buf) {
      return msg.reply(
        `❌ *Please reply to a sticker!*\n\n` +
        `*.toimg* (reply to sticker)\n` +
        `${SYSTEM.SHORT_WATERMARK}`
      );
    }

    await msg.react('⏳');
    await sock.sendMessage(from, {
      image:   buf,
      caption: `✅ *Sticker converted to image!*\n${SYSTEM.SHORT_WATERMARK}`,
    }, { quoted: msg });
    await msg.react('✅');
  } catch (err) {
    console.error('[TOIMG ERROR]:', err.message);
    await msg.react('❌');
    await msg.reply(`❌ *Failed!*\n_${err.message}_\n${SYSTEM.SHORT_WATERMARK}`);
  }
}

export default [
  { command: ['sticker', 's', 'stick'], name: 'sticker', category: 'Sticker', description: 'Create sticker from image/video', usage: '.sticker (reply to media)', cooldown: 5, handler: stickerHandler },
  { command: ['take'],                  name: 'take',    category: 'Sticker', description: 'Steal sticker with custom pack',  usage: '.take Pack Name (reply)',  cooldown: 5, handler: takeHandler   },
  { command: ['steal'],                 name: 'steal',   category: 'Sticker', description: 'Steal sticker',                  usage: '.steal (reply to sticker)', cooldown: 5, handler: stealHandler  },
  { command: ['ttp'],                   name: 'ttp',     category: 'Sticker', description: 'Text to sticker',                usage: '.ttp <text>',               cooldown: 5, handler: ttpHandler    },
  { command: ['toimg', 'toimage'],      name: 'toimg',   category: 'Sticker', description: 'Sticker to image',              usage: '.toimg (reply to sticker)', cooldown: 5, handler: toImgHandler  },
];
