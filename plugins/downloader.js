// ============================================================
//   YOUSAF-MD — DOWNLOADER PLUGIN [FIXED]
//   .play .song .audio .video .yt .tiktok .fb .ig .gdrive
//   FIXES: Dead downloadFromAPI function removed | yt-dlp
//          output extension bug fixed with glob file search |
//          file cleanup now uses finally blocks
//   Developer: Muhammad Yousaf Baloch
// ============================================================

'use strict';

const axios    = require('axios');
const ytSearch = require('yt-search');
const { exec } = require('child_process');
const path     = require('path');
const fs       = require('fs-extra');
const { promisify } = require('util');
const execAsync     = promisify(exec);

const TEMP = path.resolve('./temp');
fs.ensureDirSync(TEMP);

// ── SAFE UNLINK ────────────────────────────────────────────
function safeUnlink(...paths) {
  for (const p of paths) if (p) fs.unlink(p).catch(() => {});
}

// ── FIND FILE BY PREFIX (yt-dlp may add/change extensions) ─
// FIXED: yt-dlp sometimes appends extension automatically.
// We use a glob-style search to find the actual output file.
function findOutputFile(basePath) {
  // Direct match first
  if (fs.existsSync(basePath)) return basePath;

  // Search directory for file with same base name
  const dir      = path.dirname(basePath);
  const base     = path.basename(basePath, path.extname(basePath));
  const entries  = fs.readdirSync(dir);
  const match    = entries.find(f => f.startsWith(base) && f !== path.basename(basePath));
  return match ? path.join(dir, match) : null;
}

// ── YOUTUBE SEARCH ─────────────────────────────────────────
async function searchYouTube(query) {
  const result = await ytSearch(query);
  return result.videos?.[0] || null;
}

// ── WAIT MESSAGE ──────────────────────────────────────────
async function sendWait(sock, jid, msg) {
  return sock.sendMessage(jid, {
    text: '⏳ *Processing your request...*\nPlease wait a moment.',
  }, { quoted: msg });
}

// ── AUDIO DOWNLOADER ──────────────────────────────────────
async function handleAudio(sock, msg, ctx, query) {
  await sendWait(sock, ctx.jid, msg);

  const baseStamp = Date.now();
  const basePath  = path.join(TEMP, `${baseStamp}.mp3`);
  let   outPath   = null;

  try {
    const video = await searchYouTube(query);
    if (!video) return sock.sendMessage(ctx.jid, { text: '❌ No results found for that song.' }, { quoted: msg });

    await execAsync(
      `yt-dlp -x --audio-format mp3 --no-playlist --max-filesize 50m ` +
      `-o "${basePath}" "${video.url}" --quiet`
    );

    // FIXED: find actual output file after yt-dlp runs
    outPath = findOutputFile(basePath);
    if (!outPath) throw new Error('yt-dlp did not produce an output file.');

    await sock.sendMessage(ctx.jid, {
      audio:    { url: outPath },
      mimetype: 'audio/mp4',
      ptt:      false,
    }, { quoted: msg });

    await sock.sendMessage(ctx.jid, {
      text: `🎵 *${video.title}*\n⏱️ ${video.timestamp}\n👁️ ${Number(video.views || 0).toLocaleString()} views\n🔗 ${video.url}`,
    }, { quoted: msg });

  } catch (e) {
    sock.sendMessage(ctx.jid, { text: `❌ Audio download failed:\n${e.message}` }, { quoted: msg });
  } finally {
    safeUnlink(outPath, basePath);
  }
}

// ── VIDEO DOWNLOADER ──────────────────────────────────────
async function handleVideo(sock, msg, ctx, query) {
  await sendWait(sock, ctx.jid, msg);

  const baseStamp = Date.now();
  const basePath  = path.join(TEMP, `${baseStamp}.mp4`);
  let   outPath   = null;

  try {
    const isUrl  = query.startsWith('http');
    const target = isUrl ? query : (await searchYouTube(query))?.url;
    if (!target) return sock.sendMessage(ctx.jid, { text: '❌ No results found.' }, { quoted: msg });

    await execAsync(
      `yt-dlp -f "best[ext=mp4][filesize<50M]/best[filesize<50M]" ` +
      `--no-playlist -o "${basePath}" "${target}" --quiet`
    );

    outPath = findOutputFile(basePath);
    if (!outPath) throw new Error('yt-dlp did not produce an output file.');

    const sizeMB = fs.statSync(outPath).size / 1024 / 1024;
    if (sizeMB > 50) {
      return sock.sendMessage(ctx.jid, { text: '❌ Video too large (>50MB). Try a shorter video.' }, { quoted: msg });
    }

    await sock.sendMessage(ctx.jid, {
      video:    { url: outPath },
      mimetype: 'video/mp4',
      caption:  `🎬 Downloaded by *YOUSAF-MD*`,
    }, { quoted: msg });

  } catch (e) {
    sock.sendMessage(ctx.jid, { text: `❌ Video download failed:\n${e.message}` }, { quoted: msg });
  } finally {
    safeUnlink(outPath, basePath);
  }
}

// ── TIKTOK DOWNLOADER ─────────────────────────────────────
async function handleTikTok(sock, msg, ctx, url) {
  await sendWait(sock, ctx.jid, msg);

  const baseStamp = Date.now();
  const basePath  = path.join(TEMP, `tt_${baseStamp}.mp4`);
  let   outPath   = null;

  try {
    if (!url || !url.includes('tiktok')) {
      return sock.sendMessage(ctx.jid, { text: '❌ Please provide a valid TikTok URL.' }, { quoted: msg });
    }

    // yt-dlp handles TikTok no-watermark natively
    await execAsync(
      `yt-dlp -f "best[ext=mp4]" --no-watermark ` +
      `-o "${basePath}" "${url}" --quiet`
    );

    outPath = findOutputFile(basePath);
    if (!outPath) throw new Error('yt-dlp did not produce an output file.');

    await sock.sendMessage(ctx.jid, {
      video:    { url: outPath },
      mimetype: 'video/mp4',
      caption:  '🎵 *TikTok — No Watermark*\n_Downloaded by YOUSAF-MD_',
    }, { quoted: msg });

  } catch (e) {
    sock.sendMessage(ctx.jid, { text: `❌ TikTok download failed:\n${e.message}` }, { quoted: msg });
  } finally {
    safeUnlink(outPath, basePath);
  }
}

// ── SOCIAL VIDEO DOWNLOADER (FB / IG) ─────────────────────
async function handleSocialVideo(sock, msg, ctx, url, platform) {
  await sendWait(sock, ctx.jid, msg);

  const baseStamp = Date.now();
  const basePath  = path.join(TEMP, `social_${baseStamp}.mp4`);
  let   outPath   = null;

  try {
    await execAsync(
      `yt-dlp -f "best[ext=mp4][filesize<50M]/best[filesize<50M]" ` +
      `-o "${basePath}" "${url}" --quiet`
    );

    outPath = findOutputFile(basePath);
    if (!outPath) throw new Error('yt-dlp did not produce an output file.');

    await sock.sendMessage(ctx.jid, {
      video:    { url: outPath },
      mimetype: 'video/mp4',
      caption:  `📥 *${platform} Video*\n_Downloaded by YOUSAF-MD_`,
    }, { quoted: msg });

  } catch (e) {
    sock.sendMessage(ctx.jid, { text: `❌ ${platform} download failed:\n${e.message}` }, { quoted: msg });
  } finally {
    safeUnlink(outPath, basePath);
  }
}

// ── COMMANDS ───────────────────────────────────────────────
module.exports = {
  commands: {

    async play(sock, msg, ctx, args, body) {
      if (!body) return sock.sendMessage(ctx.jid, { text: '❌ Usage: .play [song name]' }, { quoted: msg });
      await handleAudio(sock, msg, ctx, body);
    },

    async song(sock, msg, ctx, args, body) {
      if (!body) return sock.sendMessage(ctx.jid, { text: '❌ Usage: .song [song name]' }, { quoted: msg });
      await handleAudio(sock, msg, ctx, body);
    },

    async audio(sock, msg, ctx, args, body) {
      if (!body) return sock.sendMessage(ctx.jid, { text: '❌ Usage: .audio [name or URL]' }, { quoted: msg });
      await handleAudio(sock, msg, ctx, body);
    },

    async video(sock, msg, ctx, args, body) {
      if (!body) return sock.sendMessage(ctx.jid, { text: '❌ Usage: .video [name or URL]' }, { quoted: msg });
      await handleVideo(sock, msg, ctx, body);
    },

    async yt(sock, msg, ctx, args, body) {
      if (!body) return sock.sendMessage(ctx.jid, { text: '❌ Usage: .yt [YouTube URL or search]' }, { quoted: msg });
      await handleVideo(sock, msg, ctx, body);
    },

    async tiktok(sock, msg, ctx, args, body) {
      if (!body) return sock.sendMessage(ctx.jid, { text: '❌ Usage: .tiktok [TikTok URL]' }, { quoted: msg });
      await handleTikTok(sock, msg, ctx, body);
    },

    async fb(sock, msg, ctx, args, body) {
      if (!body) return sock.sendMessage(ctx.jid, { text: '❌ Usage: .fb [Facebook video URL]' }, { quoted: msg });
      await handleSocialVideo(sock, msg, ctx, body, 'Facebook');
    },

    async ig(sock, msg, ctx, args, body) {
      if (!body) return sock.sendMessage(ctx.jid, { text: '❌ Usage: .ig [Instagram URL]' }, { quoted: msg });
      await handleSocialVideo(sock, msg, ctx, body, 'Instagram');
    },

    async gdrive(sock, msg, ctx, args, body) {
      if (!body) return sock.sendMessage(ctx.jid, { text: '❌ Usage: .gdrive [Google Drive link]' }, { quoted: msg });
      await sendWait(sock, ctx.jid, msg);

      const outPath = path.join(TEMP, `gdrive_${Date.now()}.bin`);
      try {
        const match  = body.match(/\/d\/([a-zA-Z0-9_-]+)/);
        const fileId = match?.[1];
        if (!fileId) return sock.sendMessage(ctx.jid, { text: '❌ Cannot parse Google Drive file ID from that link.' }, { quoted: msg });

        const dlUrl = `https://drive.google.com/uc?export=download&id=${fileId}&confirm=t`;
        const res   = await axios.get(dlUrl, { responseType: 'arraybuffer', timeout: 60000 });

        if (!res.data || res.data.byteLength < 100) throw new Error('Empty file or access denied.');

        await fs.writeFile(outPath, res.data);
        await sock.sendMessage(ctx.jid, {
          document: { url: outPath },
          fileName: `gdrive_${fileId}`,
          mimetype: 'application/octet-stream',
          caption:  '📂 *Google Drive File*\n_Downloaded by YOUSAF-MD_',
        }, { quoted: msg });

      } catch (e) {
        sock.sendMessage(ctx.jid, { text: `❌ Google Drive download failed:\n${e.message}` }, { quoted: msg });
      } finally {
        safeUnlink(outPath);
      }
    },
  },
};

