// ============================================================
//   YOUSAF-MD — DOWNLOADER PLUGIN
//   .play .song .audio .video .yt .tiktok .fb .ig .gdrive
//   .movie .trailer .playstore .img .image
//   Pure JavaScript — No Python, No yt-dlp
//   Developer: Muhammad Yousaf Baloch
// ============================================================

'use strict';

const ytdl     = require('@distube/ytdl-core');
const ytSearch = require('yt-search');
const axios    = require('axios');
const path     = require('path');
const fs       = require('fs-extra');

const TEMP = path.resolve('./temp');
fs.ensureDirSync(TEMP);

const MAX_SIZE_MB = 250;

function safeUnlink(...paths) {
  for (const p of paths) if (p) fs.unlink(p).catch(() => {});
}

async function searchYouTube(query) {
  const result = await ytSearch(query);
  return result.videos?.[0] || null;
}

async function sendWait(sock, jid, msg) {
  return sock.sendMessage(jid, {
    text: '⏳ *Processing your request...*\nPlease wait a moment.',
  }, { quoted: msg });
}

// ── AUDIO DOWNLOADER ──────────────────────────────────────
async function handleAudio(sock, msg, ctx, query) {
  await sendWait(sock, ctx.jid, msg);
  const outPath = path.join(TEMP, `audio_${Date.now()}.mp3`);
  try {
    const video = await searchYouTube(query);
    if (!video) return sock.sendMessage(ctx.jid, { text: '❌ No results found for that song.' }, { quoted: msg });

    await new Promise((resolve, reject) => {
      const stream = ytdl(video.url, {
        filter:  'audioonly',
        quality: 'highestaudio',
      });
      const writer = fs.createWriteStream(outPath);
      stream.pipe(writer);
      stream.on('error', reject);
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    const sizeMB = fs.statSync(outPath).size / 1024 / 1024;
    if (sizeMB > MAX_SIZE_MB) {
      return sock.sendMessage(ctx.jid, { text: `❌ File too large (>${MAX_SIZE_MB}MB).` }, { quoted: msg });
    }

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
    safeUnlink(outPath);
  }
}

// ── VIDEO DOWNLOADER ──────────────────────────────────────
// Default: 480p — if user writes "720" at end: 720p
async function handleVideo(sock, msg, ctx, query, quality = '480p') {
  await sendWait(sock, ctx.jid, msg);
  const outPath = path.join(TEMP, `video_${Date.now()}.mp4`);
  try {
    const isUrl = query.startsWith('http');
    const url   = isUrl ? query : (await searchYouTube(query))?.url;
    if (!url) return sock.sendMessage(ctx.jid, { text: '❌ No results found.' }, { quoted: msg });

    // 480p = format 135 (video) + 140 (audio) merged
    // 720p = format 136 (video) + 140 (audio) merged
    // ytdl videoandaudio filter picks closest available
    const qualityLabel = quality === '720p' ? 'highestvideo' : 'lowestvideo';

    await new Promise((resolve, reject) => {
      const stream = ytdl(url, {
        filter:  'videoandaudio',
        quality: quality === '720p' ? '136' : '135',
      });
      const writer = fs.createWriteStream(outPath);
      stream.pipe(writer);
      stream.on('error', (err) => {
        // fallback if exact quality not found
        const fallback = ytdl(url, { filter: 'videoandaudio', quality: 'lowest' });
        const w2 = fs.createWriteStream(outPath);
        fallback.pipe(w2);
        fallback.on('error', reject);
        w2.on('finish', resolve);
        w2.on('error', reject);
      });
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    const sizeMB = fs.statSync(outPath).size / 1024 / 1024;
    if (sizeMB > MAX_SIZE_MB) {
      return sock.sendMessage(ctx.jid, { text: `❌ Video too large (>${MAX_SIZE_MB}MB).` }, { quoted: msg });
    }

    await sock.sendMessage(ctx.jid, {
      video:    { url: outPath },
      mimetype: 'video/mp4',
      caption:  `🎬 *Quality: ${quality}*\n_Downloaded by YOUSAF-MD_`,
    }, { quoted: msg });

  } catch (e) {
    sock.sendMessage(ctx.jid, { text: `❌ Video download failed:\n${e.message}` }, { quoted: msg });
  } finally {
    safeUnlink(outPath);
  }
}

// ── TIKTOK DOWNLOADER ─────────────────────────────────────
async function handleTikTok(sock, msg, ctx, url) {
  await sendWait(sock, ctx.jid, msg);
  const outPath = path.join(TEMP, `tt_${Date.now()}.mp4`);
  try {
    if (!url || !url.includes('tiktok')) {
      return sock.sendMessage(ctx.jid, { text: '❌ Please provide a valid TikTok URL.' }, { quoted: msg });
    }

    const apiUrl   = `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`;
    const res      = await axios.get(apiUrl, { timeout: 15000 });
    const data     = res.data?.data;
    if (!data?.play) throw new Error('Could not fetch TikTok video.');

    const videoRes = await axios.get(data.play, { responseType: 'arraybuffer', timeout: 30000 });
    await fs.writeFile(outPath, videoRes.data);

    const sizeMB = Buffer.byteLength(videoRes.data) / 1024 / 1024;
    if (sizeMB > MAX_SIZE_MB) {
      return sock.sendMessage(ctx.jid, { text: `❌ File too large (>${MAX_SIZE_MB}MB).` }, { quoted: msg });
    }

    await sock.sendMessage(ctx.jid, {
      video:    { url: outPath },
      mimetype: 'video/mp4',
      caption:  `🎵 *TikTok — No Watermark*\n_Downloaded by YOUSAF-MD_`,
    }, { quoted: msg });

  } catch (e) {
    sock.sendMessage(ctx.jid, { text: `❌ TikTok download failed:\n${e.message}` }, { quoted: msg });
  } finally {
    safeUnlink(outPath);
  }
}

// ── FACEBOOK DOWNLOADER ───────────────────────────────────
async function handleFacebook(sock, msg, ctx, url) {
  await sendWait(sock, ctx.jid, msg);
  const outPath = path.join(TEMP, `fb_${Date.now()}.mp4`);
  try {
    const apiUrl = `https://facebook-reel-and-video-downloader.p.rapidapi.com/app/main.php?url=${encodeURIComponent(url)}`;
    const res    = await axios.get(apiUrl, {
      timeout: 20000,
      headers: {
        'X-RapidAPI-Host': 'facebook-reel-and-video-downloader.p.rapidapi.com',
        'X-RapidAPI-Key':  process.env.RAPIDAPI_KEY || '',
      },
    });

    const hdLink = res.data?.links?.['Download High Quality'] ||
                   res.data?.links?.['Download Low Quality'];
    if (!hdLink) throw new Error('No download link found.');

    const videoRes = await axios.get(hdLink, { responseType: 'arraybuffer', timeout: 30000 });
    await fs.writeFile(outPath, videoRes.data);

    await sock.sendMessage(ctx.jid, {
      video:    { url: outPath },
      mimetype: 'video/mp4',
      caption:  `📘 *Facebook Video*\n_Downloaded by YOUSAF-MD_`,
    }, { quoted: msg });

  } catch (e) {
    sock.sendMessage(ctx.jid, { text: `❌ Facebook download failed:\n${e.message}` }, { quoted: msg });
  } finally {
    safeUnlink(outPath);
  }
}

// ── INSTAGRAM DOWNLOADER ──────────────────────────────────
async function handleInstagram(sock, msg, ctx, url) {
  await sendWait(sock, ctx.jid, msg);
  const outPath = path.join(TEMP, `ig_${Date.now()}.mp4`);
  try {
    const apiUrl = `https://instagram-downloader-download-instagram-videos-stories.p.rapidapi.com/index?url=${encodeURIComponent(url)}`;
    const res    = await axios.get(apiUrl, {
      timeout: 20000,
      headers: {
        'X-RapidAPI-Host': 'instagram-downloader-download-instagram-videos-stories.p.rapidapi.com',
        'X-RapidAPI-Key':  process.env.RAPIDAPI_KEY || '',
      },
    });

    const mediaUrl = res.data?.media || res.data?.url || res.data?.[0]?.url;
    if (!mediaUrl) throw new Error('No download link found.');

    const videoRes = await axios.get(mediaUrl, { responseType: 'arraybuffer', timeout: 30000 });
    await fs.writeFile(outPath, videoRes.data);

    await sock.sendMessage(ctx.jid, {
      video:    { url: outPath },
      mimetype: 'video/mp4',
      caption:  `📸 *Instagram Video*\n_Downloaded by YOUSAF-MD_`,
    }, { quoted: msg });

  } catch (e) {
    sock.sendMessage(ctx.jid, { text: `❌ Instagram download failed:\n${e.message}` }, { quoted: msg });
  } finally {
    safeUnlink(outPath);
  }
}

// ── MOVIE INFO ────────────────────────────────────────────
async function handleMovie(sock, msg, ctx, query) {
  await sendWait(sock, ctx.jid, msg);
  try {
    const res = await axios.get(
      `https://www.omdbapi.com/?t=${encodeURIComponent(query)}&apikey=trilogy&plot=short`,
      { timeout: 10000 }
    );
    const m = res.data;
    if (m.Response === 'False') throw new Error('Movie not found.');

    const text = `🎬 *${m.Title}* (${m.Year})

📋 *Genre:* ${m.Genre}
⭐ *IMDB:* ${m.imdbRating}/10
⏱️ *Runtime:* ${m.Runtime}
🌍 *Country:* ${m.Country}
🎭 *Cast:* ${m.Actors}
🎬 *Director:* ${m.Director}
📝 *Plot:* ${m.Plot}

> _Info by YOUSAF-MD_`;

    await sock.sendMessage(ctx.jid, {
      image:   { url: m.Poster !== 'N/A' ? m.Poster : 'https://via.placeholder.com/300x450' },
      caption: text,
    }, { quoted: msg });

  } catch (e) {
    sock.sendMessage(ctx.jid, { text: `❌ Movie info failed:\n${e.message}` }, { quoted: msg });
  }
}

// ── TRAILER DOWNLOADER ────────────────────────────────────
async function handleTrailer(sock, msg, ctx, query, quality = '480p') {
  await sendWait(sock, ctx.jid, msg);
  const outPath = path.join(TEMP, `trailer_${Date.now()}.mp4`);
  try {
    const video = await searchYouTube(`${query} official trailer`);
    if (!video) return sock.sendMessage(ctx.jid, { text: '❌ Trailer not found.' }, { quoted: msg });

    await new Promise((resolve, reject) => {
      const stream = ytdl(video.url, {
        filter:  'videoandaudio',
        quality: quality === '720p' ? '136' : '135',
      });
      const writer = fs.createWriteStream(outPath);
      stream.pipe(writer);
      stream.on('error', (err) => {
        const fallback = ytdl(video.url, { filter: 'videoandaudio', quality: 'lowest' });
        const w2 = fs.createWriteStream(outPath);
        fallback.pipe(w2);
        fallback.on('error', reject);
        w2.on('finish', resolve);
        w2.on('error', reject);
      });
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    const sizeMB = fs.statSync(outPath).size / 1024 / 1024;
    if (sizeMB > MAX_SIZE_MB) {
      return sock.sendMessage(ctx.jid, {
        text: `❌ Trailer too large. Watch here:\n🔗 ${video.url}`,
      }, { quoted: msg });
    }

    await sock.sendMessage(ctx.jid, {
      video:    { url: outPath },
      mimetype: 'video/mp4',
      caption:  `🎬 *${video.title}*\n🎥 Quality: ${quality}\n🔗 ${video.url}\n\n_Downloaded by YOUSAF-MD_`,
    }, { quoted: msg });

  } catch (e) {
    sock.sendMessage(ctx.jid, { text: `❌ Trailer download failed:\n${e.message}` }, { quoted: msg });
  } finally {
    safeUnlink(outPath);
  }
}

// ── PLAYSTORE SEARCH ──────────────────────────────────────
async function handlePlayStore(sock, msg, ctx, query) {
  await sendWait(sock, ctx.jid, msg);
  try {
    const searchUrl = `https://play.google.com/store/search?q=${encodeURIComponent(query)}&c=apps`;
    const text = `📱 *Play Store: ${query}*

🔍 *Search Results:*
${searchUrl}

> _Search by YOUSAF-MD_`;

    await sock.sendMessage(ctx.jid, { text }, { quoted: msg });

  } catch (e) {
    sock.sendMessage(ctx.jid, { text: `❌ Play Store search failed:\n${e.message}` }, { quoted: msg });
  }
}

// ── GOOGLE IMAGE SEARCH (FREE — DuckDuckGo) ───────────────
async function handleImageSearch(sock, msg, ctx, query) {
  await sendWait(sock, ctx.jid, msg);
  const outPath = path.join(TEMP, `img_${Date.now()}.jpg`);
  try {
    // Step 1: get vqd token
    const initRes = await axios.get(
      `https://duckduckgo.com/?q=${encodeURIComponent(query)}&iax=images&ia=images`,
      { timeout: 10000, headers: { 'User-Agent': 'Mozilla/5.0' } }
    );
    const vqdMatch = initRes.data.match(/vqd=([\d-]+)/);
    if (!vqdMatch) throw new Error('Could not initialize image search.');
    const vqd = vqdMatch[1];

    // Step 2: get image results
    const imgRes = await axios.get(
      `https://duckduckgo.com/i.js?q=${encodeURIComponent(query)}&vqd=${vqd}&o=json&p=1`,
      {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Referer':    'https://duckduckgo.com/',
        },
      }
    );

    const results = imgRes.data?.results;
    if (!results || results.length === 0) throw new Error('No images found.');

    // Pick random from top 5
    const pick     = results[Math.floor(Math.random() * Math.min(5, results.length))];
    const imageUrl = pick.image;
    if (!imageUrl) throw new Error('No image URL found.');

    // Step 3: download image
    const dlRes = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      timeout:      20000,
      headers:      { 'User-Agent': 'Mozilla/5.0' },
    });
    await fs.writeFile(outPath, dlRes.data);

    await sock.sendMessage(ctx.jid, {
      image:   { url: outPath },
      caption: `🖼️ *${query}*\n_Image by YOUSAF-MD_`,
    }, { quoted: msg });

  } catch (e) {
    sock.sendMessage(ctx.jid, { text: `❌ Image search failed:\n${e.message}` }, { quoted: msg });
  } finally {
    safeUnlink(outPath);
  }
}

// ── QUALITY PARSER ────────────────────────────────────────
function parseQuality(body) {
  const is720 = /\s720p?$/i.test(body);
  const query = body.replace(/\s720p?$/i, '').trim();
  return { query, quality: is720 ? '720p' : '480p' };
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
      if (!body) return sock.sendMessage(ctx.jid, { text: '❌ Usage: .video [name or URL] (optional: 720)' }, { quoted: msg });
      const { query, quality } = parseQuality(body);
      await handleVideo(sock, msg, ctx, query, quality);
    },

    async yt(sock, msg, ctx, args, body) {
      if (!body) return sock.sendMessage(ctx.jid, { text: '❌ Usage: .yt [YouTube URL or search] (optional: 720)' }, { quoted: msg });
      const { query, quality } = parseQuality(body);
      await handleVideo(sock, msg, ctx, query, quality);
    },

    async tiktok(sock, msg, ctx, args, body) {
      if (!body) return sock.sendMessage(ctx.jid, { text: '❌ Usage: .tiktok [TikTok URL]' }, { quoted: msg });
      await handleTikTok(sock, msg, ctx, body);
    },

    async fb(sock, msg, ctx, args, body) {
      if (!body) return sock.sendMessage(ctx.jid, { text: '❌ Usage: .fb [Facebook video URL]' }, { quoted: msg });
      await handleFacebook(sock, msg, ctx, body);
    },

    async ig(sock, msg, ctx, args, body) {
      if (!body) return sock.sendMessage(ctx.jid, { text: '❌ Usage: .ig [Instagram URL]' }, { quoted: msg });
      await handleInstagram(sock, msg, ctx, body);
    },

    async movie(sock, msg, ctx, args, body) {
      if (!body) return sock.sendMessage(ctx.jid, { text: '❌ Usage: .movie [movie name]' }, { quoted: msg });
      await handleMovie(sock, msg, ctx, body);
    },

    async trailer(sock, msg, ctx, args, body) {
      if (!body) return sock.sendMessage(ctx.jid, { text: '❌ Usage: .trailer [movie name] (optional: 720)' }, { quoted: msg });
      const { query, quality } = parseQuality(body);
      await handleTrailer(sock, msg, ctx, query, quality);
    },

    async playstore(sock, msg, ctx, args, body) {
      if (!body) return sock.sendMessage(ctx.jid, { text: '❌ Usage: .playstore [app name]' }, { quoted: msg });
      await handlePlayStore(sock, msg, ctx, body);
    },

    async img(sock, msg, ctx, args, body) {
      if (!body) return sock.sendMessage(ctx.jid, { text: '❌ Usage: .img [search query]' }, { quoted: msg });
      await handleImageSearch(sock, msg, ctx, body);
    },

    async image(sock, msg, ctx, args, body) {
      if (!body) return sock.sendMessage(ctx.jid, { text: '❌ Usage: .image [search query]' }, { quoted: msg });
      await handleImageSearch(sock, msg, ctx, body);
    },

    async gdrive(sock, msg, ctx, args, body) {
      if (!body) return sock.sendMessage(ctx.jid, { text: '❌ Usage: .gdrive [Google Drive link]' }, { quoted: msg });
      await sendWait(sock, ctx.jid, msg);

      const outPath = path.join(TEMP, `gdrive_${Date.now()}.bin`);
      try {
        const match  = body.match(/\/d\/([a-zA-Z0-9_-]+)/);
        const fileId = match?.[1];
        if (!fileId) return sock.sendMessage(ctx.jid, { text: '❌ Cannot parse Google Drive file ID.' }, { quoted: msg });

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
        
