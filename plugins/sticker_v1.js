/*
╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃   YOUSAF-BALOCH-MD  •  sticker_v1      ┃
┃  Commands: sticker, s, stick, take,    ┃
┃            steal, ttp, attp, toimg,    ┃
┃            toimage, ttsstik            ┃
┃        Created by MR YOUSAF BALOCH     ┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
*/
import { downloadMediaMessage } from '@whiskeysockets/baileys';
import { Sticker, StickerTypes } from 'wa-sticker-formatter';
import axios from 'axios';
import { SYSTEM } from '../config.js';

// ═══════════════════════════════════════════════════════════════════
//  MEDIA BUFFER EXTRACTOR — تصویری، ویڈیو یا آڈیو میڈیا ڈاؤنلوڈر
// ═══════════════════════════════════════════════════════════════════

async function getMediaBuffer(msg) {
  try {
    const ctx =
      msg.message?.extendedTextMessage?.contextInfo ||
      msg.message?.imageMessage?.contextInfo        ||
      msg.message?.videoMessage?.contextInfo        ||
      msg.message?.stickerMessage?.contextInfo      ||
      msg.message?.audioMessage?.contextInfo        ||
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
      m.audioMessage   ||
      m.documentMessage;

    if (!hasMedia) return null;

    // Baileys Media Downloader
    const buffer = await downloadMediaMessage(target, 'buffer', {});
    return buffer;
  } catch (e) {
    console.error('[STICKER BUFFER ERROR]:', e.message);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════
//  MAKE STICKER (100% Visible & HD WebP Converter)
// ═══════════════════════════════════════════════════════════════════

async function makeSticker(buffer, pack = 'YOUSAF-MD', author = 'MR YOUSAF BALOCH') {
  try {
    const sticker = new Sticker(buffer, {
      pack: pack || 'YOUSAF-MD',
      author: author || 'MR YOUSAF BALOCH',
      type: StickerTypes.FULL,
      categories: ['🤩', '🎉'],
      id: 'yousaf-md-sticker-' + Date.now(),
      quality: 70,
    });
    
    // Convert directly to WebP Buffer
    return await sticker.toBuffer();
  } catch (err) {
    console.error('[MAKE STICKER ERROR]:', err.message);
    throw err;
  }
}

// ═══════════════════════════════════════════════════════════════════
//  HANDLERS
// ═══════════════════════════════════════════════════════════════════

// 1. Image/Video to Sticker Handler
async function stickerHandler({ sock, msg, from }) {
  try {
    const buf = await getMediaBuffer(msg);
    if (!buf) {
      return sock.sendMessage(from, {
        text: `❌ *Please reply to an image or short video!*\n\n💡 *Usage:*\n• Reply to image/video with *.s*\n• Or send image with caption *.sticker*\n\n${SYSTEM?.SHORT_WATERMARK || ''}`
      }, { quoted: msg });
    }

    await sock.sendMessage(from, { text: `⏳ *Generating WhatsApp Sticker...*\n${SYSTEM?.SHORT_WATERMARK || ''}` }, { quoted: msg });

    const stickerBuf = await makeSticker(buf);
    
    // Send as genuine sticker media
    await sock.sendMessage(from, {
      sticker: stickerBuf
    }, { quoted: msg });

  } catch (e) {
    console.error('[STICKER ERROR]:', e.message);
    await sock.sendMessage(from, { text: `❌ *Failed to create sticker!*\n_${e.message}_\n${SYSTEM?.SHORT_WATERMARK || ''}` }, { quoted: msg });
  }
}

// 2. Take/Steal Pack Name Handler
async function takeHandler({ sock, msg, from, args }) {
  try {
    const buf = await getMediaBuffer(msg);
    if (!buf) {
      return sock.sendMessage(from, {
        text: `❌ *Please reply to a sticker or image!*\n\n💡 *Usage:*\n• *.take My New Pack*\n• *.steal YOUSAF-MD*\n\n${SYSTEM?.SHORT_WATERMARK || ''}`
      }, { quoted: msg });
    }

    const packName = args?.length ? args.join(' ') : 'YOUSAF-MD';
    await sock.sendMessage(from, { text: `⏳ *Updating sticker pack details...*\n${SYSTEM?.SHORT_WATERMARK || ''}` }, { quoted: msg });
    
    const stickerBuf = await makeSticker(buf, packName, 'MR YOUSAF BALOCH');
    
    await sock.sendMessage(from, {
      sticker: stickerBuf
    }, { quoted: msg });

  } catch (e) {
    console.error('[TAKE ERROR]:', e.message);
    await sock.sendMessage(from, { text: `❌ *Failed to change sticker pack!*\n_${e.message}_\n${SYSTEM?.SHORT_WATERMARK || ''}` }, { quoted: msg });
  }
}

// 3. Text to Sticker Handler (TTP & ATTP)
async function ttpHandler({ sock, msg, from, args }) {
  try {
    if (!args?.length) {
      return sock.sendMessage(from, {
        text: `❌ *Please provide text to convert into sticker!*\n\n💡 *Usage:*\n• *.ttp Hello World*\n• *.attp Baloch Bot*\n\n${SYSTEM?.SHORT_WATERMARK || ''}`
      }, { quoted: msg });
    }

    const text = args.join(' ');
    await sock.sendMessage(from, { text: `⏳ *Creating text sticker for: "${text}"...*\n${SYSTEM?.SHORT_WATERMARK || ''}` }, { quoted: msg });

    let imageBuf = null;

    // Server 1 — Canvas High Res Generator
    if (!imageBuf) {
      try {
        const res = await axios.get(
          `https://dummyimage.com/512x512/000000/ffffff.png&text=${encodeURIComponent(text)}`,
          { responseType: 'arraybuffer', timeout: 15000 }
        );
        if (res.data?.byteLength > 1000) imageBuf = Buffer.from(res.data);
      } catch (_) {}
    }

    // Server 2 — David Cyril API
    if (!imageBuf) {
      try {
        const res = await axios.get(
          `https://api.davidcyriltech.my.id/ttp?text=${encodeURIComponent(text)}`,
          { responseType: 'arraybuffer', timeout: 15000 }
        );
        if (res.data?.byteLength > 1000) imageBuf = Buffer.from(res.data);
      } catch (_) {}
    }

    // Server 3 — Guru API
    if (!imageBuf) {
      try {
        const res = await axios.get(
          `https://api.guruapi.tech/ttp?text=${encodeURIComponent(text)}`,
          { responseType: 'arraybuffer', timeout: 15000 }
        );
        if (res.data?.byteLength > 1000) imageBuf = Buffer.from(res.data);
      } catch (_) {}
    }

    if (!imageBuf) throw new Error('All TTP image servers are busy. Try again later.');

    const stickerBuf = await makeSticker(imageBuf);
    
    await sock.sendMessage(from, {
      sticker: stickerBuf
    }, { quoted: msg });

  } catch (e) {
    console.error('[TTP ERROR]:', e.message);
    await sock.sendMessage(from, { text: `❌ *Failed to create text sticker!*\n_${e.message}_\n${SYSTEM?.SHORT_WATERMARK || ''}` }, { quoted: msg });
  }
}

// 4. Voice Note / Audio to Text Sticker
async function ttsStickerHandler({ sock, msg, from, args }) {
  try {
    if (!args?.length) {
      return sock.sendMessage(from, {
        text: `❌ *Please provide text for TTS sticker!*\n\n💡 *Usage:*\n• *.ttsstik Hello Baloch*\n\n${SYSTEM?.SHORT_WATERMARK || ''}`
      }, { quoted: msg });
    }

    const text = args.join(' ');
    await sock.sendMessage(from, { text: `⏳ *Generating voice sticker...*\n${SYSTEM?.SHORT_WATERMARK || ''}` }, { quoted: msg });

    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=ur&client=tw-ob`;
    const res = await axios.get(ttsUrl, { responseType: 'arraybuffer', timeout: 15000 });

    const stickerBuf = await makeSticker(Buffer.from(res.data));
    
    await sock.sendMessage(from, {
      sticker: stickerBuf
    }, { quoted: msg });

  } catch (e) {
    console.error('[TTS STICKER ERROR]:', e.message);
    await sock.sendMessage(from, { text: `❌ *Failed to create TTS sticker!*\n_${e.message}_\n${SYSTEM?.SHORT_WATERMARK || ''}` }, { quoted: msg });
  }
}

// 5. Sticker to Image Converter Handler
async function toImgHandler({ sock, msg, from }) {
  try {
    const buf = await getMediaBuffer(msg);
    if (!buf) {
      return sock.sendMessage(from, {
        text: `❌ *Please reply to a sticker!*\n\n💡 *Usage:*\n• Reply to any sticker with *.toimg*\n\n${SYSTEM?.SHORT_WATERMARK || ''}`
      }, { quoted: msg });
    }

    await sock.sendMessage(from, { text: `⏳ *Converting sticker back to image...*\n${SYSTEM?.SHORT_WATERMARK || ''}` }, { quoted: msg });

    await sock.sendMessage(from, {
      image: buf,
      caption: `✅ *Converted to Image Successfully!*\n\n${SYSTEM?.SHORT_WATERMARK || ''}`,
    }, { quoted: msg });

  } catch (e) {
    console.error('[TOIMG ERROR]:', e.message);
    await sock.sendMessage(from, { text: `❌ *Failed to convert sticker to image!*\n_${e.message}_\n${SYSTEM?.SHORT_WATERMARK || ''}` }, { quoted: msg });
  }
}

// ═══════════════════════════════════════════════════════════════════
//  EXPORT DISPATCHER
// ═══════════════════════════════════════════════════════════════════

export default [
  { command: 'sticker',  name: 'sticker', category: 'Sticker', description: 'Convert image/video to sticker', usage: '.sticker (reply to media)', cooldown: 3, handler: stickerHandler },
  { command: 's',        name: 'sticker', category: 'Sticker', description: 'Convert image/video to sticker', usage: '.s (reply to media)',       cooldown: 3, handler: stickerHandler },
  { command: 'stick',    name: 'sticker', category: 'Sticker', description: 'Convert image/video to sticker', usage: '.stick (reply to media)',   cooldown: 3, handler: stickerHandler },
  { command: 'take',     name: 'take',    category: 'Sticker', description: 'Rename sticker pack & author',  usage: '.take Pack Name (reply)',    cooldown: 3, handler: takeHandler },
  { command: 'steal',    name: 'take',    category: 'Sticker', description: 'Rename sticker pack & author',  usage: '.steal Pack Name (reply)',   cooldown: 3, handler: takeHandler },
  { command: 'ttp',      name: 'ttp',     category: 'Sticker', description: 'Create sticker from text',      usage: '.ttp <text>',                cooldown: 3, handler: ttpHandler },
  { command: 'attp',     name: 'ttp',     category: 'Sticker', description: 'Create animated text sticker', usage: '.attp <text>',               cooldown: 3, handler: ttpHandler },
  { command: 'ttsstik', name: 'ttsstik',category: 'Sticker', description: 'Create TTS voice sticker',       usage: '.ttsstik <text>',            cooldown: 3, handler: ttsStickerHandler },
  { command: 'toimg',    name: 'toimg',   category: 'Sticker', description: 'Convert sticker to image',      usage: '.toimg (reply to sticker)',  cooldown: 3, handler: toImgHandler },
  { command: 'toimage',  name: 'toimg',   category: 'Sticker', description: 'Convert sticker to image',      usage: '.toimage (reply to sticker)',cooldown: 3, handler: toImgHandler },
];

