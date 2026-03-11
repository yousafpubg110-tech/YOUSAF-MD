/*
╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃   YOUSAF-BALOCH-MD  •  sticker_v1      ┃
┃  Commands: sticker take steal          ┃
┃            ttp                         ┃
┃        Created by MR YOUSAF BALOCH     ┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
*/
import { downloadMediaMessage } from '@whiskeysockets/baileys';
import { Sticker, StickerTypes } from 'wa-sticker-formatter';
import { SYSTEM } from '../config.js';

// ─── Get Image Buffer ─────────────────────────────────────────────────────────
async function getImageBuffer(sock, msg) {
  const isQuoted = !!msg.quoted;
  const target = isQuoted ? { 
    key: { remoteJid: msg.from || '', id: msg.quoted?.id, participant: msg.quoted?.sender }, 
    message: msg.quoted?.message 
  } : msg;
  
  const mime = isQuoted ? msg.quoted?.mimetype || '' : 
    msg.message?.imageMessage?.mimetype || 
    msg.message?.videoMessage?.mimetype || 
    msg.message?.stickerMessage?.mimetype || '';
  
  if (!mime || !/image|video|webp/i.test(mime)) return null;
  
  try {
    return await downloadMediaMessage(target, 'buffer', {});
  } catch { return null; }
}

// ─── STICKER Handler ──────────────────────────────────────────────────────────
async function stickerHandler({sock, msg, from}) {
  try {
    await msg.react('🎨');
    
    const buffer = await getImageBuffer(sock, msg);
    if (!buffer) {
      return msg.reply(`❌ *Please reply to an image or video!*\n\n.sticker (reply to image/video)\n.s (reply to image)\n${SYSTEM.SHORT_WATERMARK}`);
    }

    await msg.reply(`⏳ *Creating sticker...*\n${SYSTEM.SHORT_WATERMARK}`);
    await msg.react('⏳');

    const sticker = new Sticker(buffer, {
      pack: 'YOUSAF-BALOCH-MD',
      author: 'Created by MR YOUSAF BALOCH',
      type: StickerTypes.FULL,
      quality: 50,
    });

    const stickerBuffer = await sticker.toBuffer();
    await sock.sendMessage(from, { sticker: stickerBuffer }, { quoted: msg });
    await msg.react('✅');
  } catch (error) {
    console.error('[STICKER ERROR]:', error.message);
    await msg.react('❌');
    await msg.reply(`❌ *Failed to create sticker!*\n_${error.message}_\n${SYSTEM.SHORT_WATERMARK}`);
  }
}

// ─── TAKE Handler (Steal sticker with custom pack) ────────────────────────────
async function takeHandler({sock, msg, from, args}) {
  try {
    await msg.react('🎭');
    
    const buffer = await getImageBuffer(sock, msg);
    if (!buffer) {
      return msg.reply(`❌ *Please reply to a sticker!*\n\n.take Pack Name (reply to sticker)\n.steal Author Name (reply to sticker)\n${SYSTEM.SHORT_WATERMARK}`);
    }

    const packName = args?.length ? args.join(' ') : 'YOUSAF-BALOCH-MD';
    
    await msg.reply(`⏳ *Creating custom sticker...*\n${SYSTEM.SHORT_WATERMARK}`);
    await msg.react('⏳');

    const sticker = new Sticker(buffer, {
      pack: packName,
      author: 'Created by MR YOUSAF BALOCH',
      type: StickerTypes.FULL,
      quality: 50,
    });

    const stickerBuffer = await sticker.toBuffer();
    await sock.sendMessage(from, { sticker: stickerBuffer }, { quoted: msg });
    await msg.react('✅');
  } catch (error) {
    console.error('[TAKE ERROR]:', error.message);
    await msg.react('❌');
    await msg.reply(`❌ *Failed to create sticker!*\n_${error.message}_\n${SYSTEM.SHORT_WATERMARK}`);
  }
}

// ─── STEAL Handler (Alias for take) ───────────────────────────────────────────
async function stealHandler({sock, msg, from, args}) {
  return takeHandler({sock, msg, from, args});
}

// ─── TTP Handler (Text to Sticker) ────────────────────────────────────────────
async function ttpHandler({sock, msg, from, args}) {
  try {
    if (!args?.length) {
      return msg.reply(`❌ *Please provide text!*\n\n.ttp Hello World\n.ttp 🇵🇰 Pakistan Zindabad\n${SYSTEM.SHORT_WATERMARK}`);
    }
    
    await msg.react('✍️');
    const text = args.join(' ');
    
    await msg.reply(`⏳ *Creating text sticker...*\n${SYSTEM.SHORT_WATERMARK}`);
    await msg.react('⏳');

    // Use API to create text sticker
    const apiUrl = `https://api.nexoracle.com/image/ttp?apikey=free_key@maher_apis&text=${encodeURIComponent(text)}`;
    const res = await fetch(apiUrl);
    
    if (!res.ok) throw new Error('API failed');
    
    const imageBuffer = Buffer.from(await res.arrayBuffer());
    
    const sticker = new Sticker(imageBuffer, {
      pack: 'YOUSAF-BALOCH-MD',
      author: 'Created by MR YOUSAF BALOCH',
      type: StickerTypes.FULL,
      quality: 50,
    });

    const stickerBuffer = await sticker.toBuffer();
    await sock.sendMessage(from, { sticker: stickerBuffer }, { quoted: msg });
    await msg.react('✅');
  } catch (error) {
    console.error('[TTP ERROR]:', error.message);
    await msg.react('❌');
    await msg.reply(`❌ *Failed to create text sticker!*\n_${error.message}_\n${SYSTEM.SHORT_WATERMARK}`);
  }
}

export default [
  {command:['sticker','s','stick'], name:'sticker', category:'Sticker',description:'Create sticker from image/video',usage:'.sticker (reply to media)',cooldown:5,handler:stickerHandler},
  {command:['take'],                name:'take',    category:'Sticker',description:'Steal sticker with custom pack',usage:'.take Pack Name (reply)',cooldown:5,handler:takeHandler},
  {command:['steal'],               name:'steal',   category:'Sticker',description:'Steal sticker (alias)',usage:'.steal Pack Name (reply)',cooldown:5,handler:stealHandler},
  {command:['ttp'],                 name:'ttp',     category:'Sticker',description:'Text to sticker',usage:'.ttp <text>',cooldown:5,handler:ttpHandler},
];
