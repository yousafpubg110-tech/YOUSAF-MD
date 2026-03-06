// ============================================================
//   YOUSAF-MD — MEDIA PLUGIN [FIXED]
//   FIXES: Dead jimp import removed | Proper webp format flag
//          added to static sticker conversion | sticker file
//          cleanup moved to after sendMessage (not before)
//   Developer: Muhammad Yousaf Baloch
// ============================================================

'use strict';

const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const { promisify }            = require('util');
const { exec }                 = require('child_process');
const execAsync                = promisify(exec);
const fs                       = require('fs-extra');
const path                     = require('path');

const TEMP        = path.resolve('./temp');
const PACK_NAME   = 'YOUSAF-MD';
const AUTHOR_NAME = 'Muhammad Yousaf Baloch';

fs.ensureDirSync(TEMP);

// ── IMAGE/VIDEO → WEBP ─────────────────────────────────────
// FIXED: added -f webp to ensure correct output format for static images
async function toWebp(inputPath, outputPath, isAnimated = false) {
  if (isAnimated) {
    await execAsync(
      `ffmpeg -i "${inputPath}" -vcodec libwebp -loop 0 -preset default -an -vsync 0 ` +
      `-vf "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2" ` +
      `"${outputPath}" -y -loglevel error`
    );
  } else {
    await execAsync(
      `ffmpeg -i "${inputPath}" -f webp ` +
      `-vf "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2" ` +
      `"${outputPath}" -y -loglevel error`
    );
  }
}

// ── EXIF METADATA for sticker pack name ───────────────────
// FIXED: removed dead jimp import, now purely ffmpeg-based
async function addExif(stickerPath, packName, authorName) {
  try {
    const tmpPath = stickerPath.replace('.webp', '_tmp.webp');
    await execAsync(
      `ffmpeg -i "${stickerPath}" -metadata title="${packName}" ` +
      `-metadata artist="${authorName}" "${tmpPath}" -y -loglevel error`
    );
    await fs.move(tmpPath, stickerPath, { overwrite: true });
  } catch {
    // Non-fatal: sticker still works without exif
  }
}

// ── GET MEDIA FROM QUOTED OR CURRENT MESSAGE ───────────────
async function getMedia(sock, msg) {
  const quoted   = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  const msgToUse = quoted
    ? { message: quoted, key: { ...msg.key, id: msg.message.extendedTextMessage.contextInfo.stanzaId } }
    : msg;

  const type = Object.keys(msgToUse.message || {})[0];
  if (!['imageMessage', 'videoMessage', 'stickerMessage'].includes(type)) return null;

  try {
    const buffer = await downloadMediaMessage(msgToUse, 'buffer', {});
    return { buffer, type };
  } catch {
    return null;
  }
}

// ── SAFE UNLINK ────────────────────────────────────────────
function safeUnlink(...paths) {
  for (const p of paths) fs.unlink(p).catch(() => {});
}

module.exports = {
  commands: {

    // ── .sticker ─────────────────────────────────────────
    async sticker(sock, msg, ctx) {
      const media = await getMedia(sock, msg);
      if (!media) {
        return sock.sendMessage(ctx.jid, {
          text: '❌ Send or reply to an *image* or *video* to make a sticker.',
        }, { quoted: msg });
      }

      const isVideo   = media.type === 'videoMessage';
      const ext       = isVideo ? '.mp4' : '.jpg';
      const inputPath = path.join(TEMP, `stk_in_${Date.now()}${ext}`);
      const outPath   = path.join(TEMP, `stk_out_${Date.now()}.webp`);

      try {
        await fs.writeFile(inputPath, media.buffer);
        await toWebp(inputPath, outPath, isVideo);
        await addExif(outPath, PACK_NAME, AUTHOR_NAME);

        // FIXED: cleanup happens AFTER send, not before
        await sock.sendMessage(ctx.jid, { sticker: { url: outPath } }, { quoted: msg });
      } catch (e) {
        sock.sendMessage(ctx.jid, { text: `❌ Sticker failed: ${e.message}` }, { quoted: msg });
      } finally {
        safeUnlink(inputPath, outPath);
      }
    },

    // ── .toimg — Sticker → Image ──────────────────────────
    async toimg(sock, msg, ctx) {
      const media = await getMedia(sock, msg);
      if (!media || media.type !== 'stickerMessage') {
        return sock.sendMessage(ctx.jid, {
          text: '❌ Reply to a *sticker* to convert it to an image.',
        }, { quoted: msg });
      }

      const inputPath = path.join(TEMP, `img_in_${Date.now()}.webp`);
      const outPath   = path.join(TEMP, `img_out_${Date.now()}.png`);

      try {
        await fs.writeFile(inputPath, media.buffer);
        await execAsync(`ffmpeg -i "${inputPath}" "${outPath}" -y -loglevel error`);
        await sock.sendMessage(ctx.jid, {
          image:   { url: outPath },
          caption: '🖼️ Sticker → Image\n_YOUSAF-MD_',
        }, { quoted: msg });
      } catch (e) {
        sock.sendMessage(ctx.jid, { text: `❌ Convert failed: ${e.message}` }, { quoted: msg });
      } finally {
        safeUnlink(inputPath, outPath);
      }
    },

    // ── .ttp — Text to Picture Sticker ───────────────────
    async ttp(sock, msg, ctx, args, body) {
      if (!body) {
        return sock.sendMessage(ctx.jid, { text: '❌ Usage: .ttp [your text]' }, { quoted: msg });
      }

      const pngPath  = path.join(TEMP, `ttp_${Date.now()}.png`);
      const webpPath = path.join(TEMP, `ttp_${Date.now()}.webp`);

      try {
        // Escape special shell characters
        const safeText = body.replace(/[`$"\\]/g, '\\$&').substring(0, 100);

        // Try ImageMagick first, fallback to ffmpeg drawtext
        try {
          await execAsync(
            `convert -size 512x512 xc:"#1a1a2e" -font DejaVu-Sans-Bold ` +
            `-pointsize 56 -fill white -stroke "#4facfe" -strokewidth 1 ` +
            `-gravity Center -annotate 0 "${safeText}" "${pngPath}"`
          );
        } catch {
          // ffmpeg fallback
          await execAsync(
            `ffmpeg -f lavfi -i color=c=0x1a1a2e:s=512x512 ` +
            `-vf "drawtext=text='${safeText}':fontcolor=white:fontsize=52:` +
            `x=(w-text_w)/2:y=(h-text_h)/2:bordercolor=0x4facfe:borderw=2" ` +
            `-frames:v 1 "${pngPath}" -y -loglevel error`
          );
        }

        await execAsync(`ffmpeg -i "${pngPath}" -f webp "${webpPath}" -y -loglevel error`);
        await addExif(webpPath, PACK_NAME, AUTHOR_NAME);
        await sock.sendMessage(ctx.jid, { sticker: { url: webpPath } }, { quoted: msg });
      } catch (e) {
        sock.sendMessage(ctx.jid, { text: `❌ TTP failed: ${e.message}` }, { quoted: msg });
      } finally {
        safeUnlink(pngPath, webpPath);
      }
    },

    // ── .attp — Animated Text Sticker ────────────────────
    async attp(sock, msg, ctx, args, body) {
      if (!body) {
        return sock.sendMessage(ctx.jid, { text: '❌ Usage: .attp [your text]' }, { quoted: msg });
      }

      const outPath = path.join(TEMP, `attp_${Date.now()}.webp`);

      try {
        const safeText = body.replace(/[`$"\\]/g, '\\$&').substring(0, 60);

        await execAsync(
          `ffmpeg -f lavfi -i color=c=0x1a1a2e:s=512x512:r=12 ` +
          `-vf "drawtext=text='${safeText}':fontcolor=white:fontsize=52:` +
          `x='mod(t*120\\,w+tw)-tw':y=(h-text_h)/2:bordercolor=black:borderw=2" ` +
          `-t 3 -vcodec libwebp -loop 0 -preset default "${outPath}" -y -loglevel error`
        );

        await addExif(outPath, PACK_NAME, AUTHOR_NAME);
        await sock.sendMessage(ctx.jid, { sticker: { url: outPath } }, { quoted: msg });
      } catch (e) {
        sock.sendMessage(ctx.jid, { text: `❌ ATTP failed: ${e.message}` }, { quoted: msg });
      } finally {
        safeUnlink(outPath);
      }
    },

    // ── .enhance — 2× Upscale Image ──────────────────────
    async enhance(sock, msg, ctx) {
      const media = await getMedia(sock, msg);
      if (!media || media.type !== 'imageMessage') {
        return sock.sendMessage(ctx.jid, {
          text: '❌ Reply to an *image* to enhance it.',
        }, { quoted: msg });
      }

      await sock.sendMessage(ctx.jid, { text: '⏳ Enhancing image...' }, { quoted: msg });

      const inputPath = path.join(TEMP, `enh_in_${Date.now()}.jpg`);
      const outPath   = path.join(TEMP, `enh_out_${Date.now()}.jpg`);

      try {
        await fs.writeFile(inputPath, media.buffer);
        await execAsync(
          `ffmpeg -i "${inputPath}" -vf "scale=iw*2:ih*2:flags=lanczos" ` +
          `"${outPath}" -y -loglevel error`
        );
        await sock.sendMessage(ctx.jid, {
          image:   { url: outPath },
          caption: '✨ Image enhanced (2× upscale)\n_YOUSAF-MD_',
        }, { quoted: msg });
      } catch (e) {
        sock.sendMessage(ctx.jid, { text: `❌ Enhance failed: ${e.message}` }, { quoted: msg });
      } finally {
        safeUnlink(inputPath, outPath);
      }
    },
  },
};
        
