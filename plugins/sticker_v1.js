/*
╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃   YOUSAF-BALOCH-MD  •  sticker_v1      ┃
┃  Commands: sticker s take steal        ┃
┃            ttp toimg                   ┃
┃        Created by MR YOUSAF BALOCH     ┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
*/
import { downloadMediaMessage } from '@whiskeysockets/baileys';
import { Sticker, StickerTypes } from 'wa-sticker-formatter';
import axios from 'axios';
import { SYSTEM } from '../config.js';

// ═══════════════════════════════════════════════════════════════════
//  MEDIA BUFFER — خود یا quoted سے
// ═══════════════════════════════════════════════════════════════════

async function getMediaBuffer(msg) {
  // quoted message check
  const ctx =
    msg.message?.extendedTextMessage?.contextInfo ||
    msg.message?.imageMessage?.contextInfo        ||
    msg.message?.videoMessage?.contextInfo        ||
    msg.message?.stickerMessage?.contextInfo      ||
    null;

  let target = msg;

  if (ctx?.quotedMessage) {
    target = {
      key: {
        remoteJid:   msg.key.remoteJid,
        id:          ctx.stanzaId,
        participant: ctx.participant,
        fromMe:      false,
      },
      message: ctx.quotedMessage,
    };
  }

  const m = target.message;
  if (!m) return null;

  const hasMedia =
    m.imageMessage   ||
    m.videoMessage   ||
    m.stickerMessage ||
    m.documentMessage;

  if (!hasMedia) return null;

  try {
    return await downloadMediaMessage(target, 'buffer', {});
  } catch (e) {
    console.error('[STICKER] downloadMediaMessage:', e.message);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════
//  MAKE STICKER
// ═══════════════════════════════════════════════════════════════════

async function makeSticker(buffer, pack = 'YOUSAF-MD', author = 'MR YOUSAF BALOCH') {
  const sticker = new Sticker(buffer, {
    pack,
    author,
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
  } catch (e) {
    console.error('[STICKER]:', e.message);
    await msg.react('❌');
    await msg.reply(`❌ *Failed!*\n_${e.message}_\n${SYSTEM.SHORT_WATERMARK}`);
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
    const pack = args?.length ? args.join(' ') : 'YOUSAF-MD';
    await msg.react('⏳');
    const stickerBuf = await makeSticker(buf, pack);
    await sock.sendMessage(from, { sticker: stickerBuf }, { quoted: msg });
    await msg.react('✅');
  } catch (e) {
    console.error('[TAKE]:', e.message);
    await msg.react('❌');
    await msg.reply(`❌ *Failed!*\n_${e.message}_\n${SYSTEM.SHORT_WATERMARK}`);
  }
}

async function ttpHandler({ sock, msg, from, args }) {
  try {
    if (!args?.length) {
      return msg.reply(
        `❌ *Please provide text!*\n\n` +
        `*.ttp Hello World*\n*.ttp Pakistan Zindabad*\n` +
        `${SYSTEM.SHORT_WATERMARK}`
      );
    }
    const text = args.join(' ');
    await msg.react('⏳');

    let imageBuf = null;

    // Method 1 — nexoracle
    if (!imageBuf) {
      try {
        const res = await axios.get(
          `https://api.nexoracle.com/image/ttp?apikey=free_key@maher_apis&text=${encodeURIComponent(text)}`,
          { responseType: 'arraybuffer', timeout: 15000 }
        );
        if (res.data?.byteLength > 1000) imageBuf = Buffer.from(res.data);
      } catch (_) {}
    }

    // Method 2 — budi api
    if (!imageBuf) {
      try {
        const res = await axios.get(
          `https://api.budi.web.id/api/maker/ttp?text=${encodeURIComponent(text)}&color=white&bg=black`,
          { responseType: 'arraybuffer', timeout: 15000 }
        );
        if (res.data?.byteLength > 1000) imageBuf = Buffer.from(res.data);
      } catch (_) {}
    }

    // Method 3 — siputzx
    if (!imageBuf) {
      try {
        const res = await axios.get(
          `https://api.siputzx.my.id/api/m/ttp?text=${encodeURIComponent(text)}`,
          { responseType: 'arraybuffer', timeout: 15000 }
        );
        if (res.data?.byteLength > 1000) imageBuf = Buffer.from(res.data);
      } catch (_) {}
    }

    // Method 4 — sazumi
    if (!imageBuf) {
      try {
        const res = await axios.get(
          `https://api.sazumi.moe/sticker/ttp?text=${encodeURIComponent(text)}`,
          { responseType: 'arraybuffer', timeout: 15000 }
        );
        if (res.data?.byteLength > 1000) imageBuf = Buffer.from(res.data);
      } catch (_) {}
    }

    if (!imageBuf) throw new Error('All TTP APIs failed. Try again later.');

    const stickerBuf = await makeSticker(imageBuf);
    await sock.sendMessage(from, { sticker: stickerBuf }, { quoted: msg });
    await msg.react('✅');
  } catch (e) {
    console.error('[TTP]:', e.message);
    await msg.react('❌');
    await msg.reply(`❌ *Failed!*\n_${e.message}_\n${SYSTEM.SHORT_WATERMARK}`);
  }
}

async function toImgHandler({ sock, msg, from }) {
  try {
    const buf = await getMediaBuffer(msg);
    if (!buf) {
      return msg.reply(
        `❌ *Please reply to a sticker!*\n*.toimg* (reply to sticker)\n${SYSTEM.SHORT_WATERMARK}`
      );
    }
    await msg.react('⏳');
    await sock.sendMessage(from, {
      image:   buf,
      caption: `✅ *Converted to image!*\n${SYSTEM.SHORT_WATERMARK}`,
    }, { quoted: msg });
    await msg.react('✅');
  } catch (e) {
    console.error('[TOIMG]:', e.message);
    await msg.react('❌');
    await msg.reply(`❌ *Failed!*\n_${e.message}_\n${SYSTEM.SHORT_WATERMARK}`);
  }
}

export default [
  { command: ['sticker','s','stick'], name: 'sticker', category: 'Sticker', description: 'Image to sticker',       usage: '.sticker (reply to media)',   cooldown: 5, handler: stickerHandler },
  { command: ['take','steal'],        name: 'take',    category: 'Sticker', description: 'Steal/rename sticker',   usage: '.take Pack Name (reply)',      cooldown: 5, handler: takeHandler   },
  { command: ['ttp'],                 name: 'ttp',     category: 'Sticker', description: 'Text to sticker',        usage: '.ttp <text>',                  cooldown: 5, handler: ttpHandler    },
  { command: ['toimg','toimage'],     name: 'toimg',   category: 'Sticker', description: 'Sticker to image',       usage: '.toimg (reply to sticker)',    cooldown: 5, handler: toImgHandler  },
];
