/*
╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃   YOUSAF-BALOCH-MD  •  yt_tools_v1     ┃
┃  Commands: video audio play            ┃
┃            bayan song                  ┃
┃        Created by MR YOUSAF BALOCH     ┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
*/
import axios from 'axios';
import yts   from 'yt-search';
import { SYSTEM } from '../config.js';

function formatNumber(num) {
  if (!num || isNaN(num)) return '0';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000)    return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

function isValidYouTubeUrl(url) {
  try {
    const p = new URL(url);
    return ['www.youtube.com','youtube.com','youtu.be','m.youtube.com'].includes(p.hostname);
  } catch { return false; }
}

// ═══════════════════════════════════════════════════════════════════
//  DOWNLOAD METHODS — 4 fallback APIs
// ═══════════════════════════════════════════════════════════════════

// Method 1 — cobalt.tools (best, no IP block)
async function method_Cobalt(videoUrl, isAudio) {
  const res = await axios.post('https://api.cobalt.tools/', {
    url: videoUrl,
    downloadMode: isAudio ? 'audio' : 'auto',
    audioFormat: 'mp3',
    quality: '720',
  }, {
    headers: {
      'Accept':       'application/json',
      'Content-Type': 'application/json',
    },
    timeout: 30000,
  });

  const data = res.data;
  if (!data || (!data.url && !data.tunnel)) throw new Error('Cobalt: no download URL');

  const dlUrl  = data.url || data.tunnel;
  const media  = await axios.get(dlUrl, { responseType: 'arraybuffer', timeout: 60000 });
  return Buffer.from(media.data);
}

// Method 2 — yt-dlp3 API
async function method_YtDlp(videoUrl, isAudio) {
  const res = await axios.get(`https://yt-dlp3.p.rapidapi.com/${isAudio ? 'mp3' : 'mp4'}`, {
    params: { url: videoUrl },
    headers: {
      'X-RapidAPI-Key':  process.env.RAPIDAPI_KEY || '',
      'X-RapidAPI-Host': 'yt-dlp3.p.rapidapi.com',
    },
    timeout: 30000,
  });
  const dlUrl = res.data?.link || res.data?.url;
  if (!dlUrl) throw new Error('YtDlp: no URL');
  const media = await axios.get(dlUrl, { responseType: 'arraybuffer', timeout: 60000 });
  return Buffer.from(media.data);
}

// Method 3 — y2mate API
async function method_Y2mate(videoUrl, isAudio) {
  const step1 = await axios.post('https://www.y2mate.com/mates/analyzeV2/ajax', {
    k_query: videoUrl,
    k_page:  'home',
    hl:      'en',
    q_auto:  0,
  }, { timeout: 20000 });

  const vid = step1.data?.vid;
  if (!vid) throw new Error('Y2mate: no vid');

  const step2 = await axios.post('https://www.y2mate.com/mates/convertV2/index', {
    vid,
    ftype: isAudio ? 'mp3' : 'mp4',
    fquality: isAudio ? '128' : '720',
    token: '',
    timeExpire: '',
    k: step1.data?.links?.[isAudio ? 'mp3' : 'mp4']?.['128']?.k || '',
  }, { timeout: 20000 });

  const dlUrl = step2.data?.dlink;
  if (!dlUrl) throw new Error('Y2mate: no dlink');
  const media = await axios.get(dlUrl, { responseType: 'arraybuffer', timeout: 60000 });
  return Buffer.from(media.data);
}

// Method 4 — savemp3.cc API
async function method_SaveMp3(videoUrl, isAudio) {
  const endpoint = isAudio
    ? `https://api.savemp3.cc/api/json?url=${encodeURIComponent(videoUrl)}&type=mp3`
    : `https://api.savemp3.cc/api/json?url=${encodeURIComponent(videoUrl)}&type=mp4`;

  const res = await axios.get(endpoint, { timeout: 20000 });
  const dlUrl = res.data?.url || res.data?.link || res.data?.dlink;
  if (!dlUrl) throw new Error('SaveMp3: no URL');
  const media = await axios.get(dlUrl, { responseType: 'arraybuffer', timeout: 60000 });
  return Buffer.from(media.data);
}

// ── Download Chain — tries all methods ──────────────────────────────
async function downloadMedia(videoUrl, isAudio = false) {
  const methods = [
    { name: 'cobalt.tools',  fn: () => method_Cobalt(videoUrl, isAudio)  },
    { name: 'savemp3.cc',    fn: () => method_SaveMp3(videoUrl, isAudio) },
    { name: 'y2mate',        fn: () => method_Y2mate(videoUrl, isAudio)  },
    { name: 'yt-dlp-rapid',  fn: () => method_YtDlp(videoUrl, isAudio)  },
  ];

  for (const method of methods) {
    try {
      console.log(`[YTDL] Trying: ${method.name}`);
      const buf = await method.fn();
      if (buf && buf.length > 10000) {
        console.log(`[YTDL] ✅ Success: ${method.name} (${(buf.length/1024/1024).toFixed(1)}MB)`);
        return buf;
      }
    } catch (err) {
      console.warn(`[YTDL] ❌ ${method.name}: ${err.message}`);
    }
  }
  throw new Error('All download methods failed.');
}

// ── Search helper ────────────────────────────────────────────────────
async function searchYT(query) {
  if (isValidYouTubeUrl(query)) {
    try {
      const id  = new URL(query).searchParams.get('v') || new URL(query).pathname.slice(1);
      const res = await yts({ videoId: id });
      return { info: res, url: query };
    } catch {}
  }
  const res = await yts(query);
  if (!res.videos.length) throw new Error('No results found!');
  const v = res.videos[0];
  return { info: v, url: v.url };
}

// ═══════════════════════════════════════════════════════════════════
//  HANDLERS
// ═══════════════════════════════════════════════════════════════════

async function videoHandler({ sock, msg, from, args }) {
  try {
    if (!args?.length) {
      return msg.reply(
        `❌ *Please provide a YouTube URL or search query!*\n\n` +
        `*.video Despacito*\n*.video https://youtu.be/xxxxx*\n` +
        `${SYSTEM.SHORT_WATERMARK}`
      );
    }

    await msg.react('🎬');
    const { info, url } = await searchYT(args.join(' '));

    await msg.reply(
      `╭━━━『 *YOUTUBE VIDEO* 』━━━╮\n` +
      `🎬 *Title:*    ${info.title}\n` +
      `👤 *Channel:*  ${info.author?.name || 'Unknown'}\n` +
      `⏱️ *Duration:* ${info.timestamp}\n` +
      `👁️ *Views:*    ${formatNumber(info.views)}\n` +
      `╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n` +
      `⏳ *Downloading video...*\n${SYSTEM.SHORT_WATERMARK}`
    );

    const buf = await downloadMedia(url, false);

    if (buf.length > 100 * 1024 * 1024) {
      return msg.reply(
        `⚠️ *File too large!* (${(buf.length/1024/1024).toFixed(0)}MB)\n\n` +
        `💡 Try: *.audio ${url}*\n${SYSTEM.SHORT_WATERMARK}`
      );
    }

    await sock.sendMessage(from, {
      video:    buf,
      mimetype: 'video/mp4',
      caption:  `🎬 *${info.title}*\n👤 ${info.author?.name || ''}\n${SYSTEM.SHORT_WATERMARK}`,
    }, { quoted: msg });

    await msg.react('✅');
  } catch (err) {
    console.error('[VIDEO ERROR]:', err.message);
    await msg.react('❌');
    await msg.reply(`❌ *Download failed!*\n_${err.message}_\n${SYSTEM.SHORT_WATERMARK}`);
  }
}

async function audioHandler({ sock, msg, from, args }) {
  try {
    if (!args?.length) {
      return msg.reply(
        `❌ *Please provide a YouTube URL or song name!*\n\n` +
        `*.audio Despacito*\n*.audio https://youtu.be/xxxxx*\n` +
        `${SYSTEM.SHORT_WATERMARK}`
      );
    }

    await msg.react('🎵');
    const { info, url } = await searchYT(args.join(' '));

    await msg.reply(
      `╭━━━『 *YOUTUBE MP3* 』━━━╮\n` +
      `🎵 *Title:*    ${info.title}\n` +
      `👤 *Artist:*   ${info.author?.name || 'Unknown'}\n` +
      `⏱️ *Duration:* ${info.timestamp}\n` +
      `╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n` +
      `⏳ *Downloading audio...*\n${SYSTEM.SHORT_WATERMARK}`
    );

    const buf = await downloadMedia(url, true);

    await sock.sendMessage(from, {
      audio:    buf,
      mimetype: 'audio/mpeg',
      ptt:      false,
    }, { quoted: msg });

    await msg.react('✅');
  } catch (err) {
    console.error('[AUDIO ERROR]:', err.message);
    await msg.react('❌');
    await msg.reply(`❌ *Download failed!*\n_${err.message}_\n${SYSTEM.SHORT_WATERMARK}`);
  }
}

async function playHandler({ sock, msg, from, args }) {
  try {
    if (!args?.length) {
      return msg.reply(
        `❌ *Please provide a song name!*\n\n` +
        `*.play Atif Aslam*\n*.play Despacito*\n` +
        `${SYSTEM.SHORT_WATERMARK}`
      );
    }

    await msg.react('🎵');
    const { info, url } = await searchYT(args.join(' '));

    await msg.reply(
      `╭━━━『 *PLAY MUSIC* 』━━━╮\n` +
      `🎵 *Title:*    ${info.title}\n` +
      `👤 *Artist:*   ${info.author?.name || 'Unknown'}\n` +
      `⏱️ *Duration:* ${info.timestamp}\n` +
      `👁️ *Views:*    ${formatNumber(info.views)}\n` +
      `╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n` +
      `⏳ *Downloading...*\n${SYSTEM.SHORT_WATERMARK}`
    );

    const buf = await downloadMedia(url, true);

    await sock.sendMessage(from, {
      audio:    buf,
      mimetype: 'audio/mpeg',
      ptt:      false,
    }, { quoted: msg });

    await msg.react('✅');
  } catch (err) {
    console.error('[PLAY ERROR]:', err.message);
    await msg.react('❌');
    await msg.reply(`❌ *Download failed!*\n_${err.message}_\n${SYSTEM.SHORT_WATERMARK}`);
  }
}

async function bayanHandler({ sock, msg, from, args }) {
  try {
    if (!args?.length) {
      return msg.reply(
        `❌ *Please provide a scholar name or topic!*\n\n` +
        `*.bayan Maulana Tariq Jameel*\n*.bayan Ramadan*\n` +
        `${SYSTEM.SHORT_WATERMARK}`
      );
    }

    await msg.react('🕌');
    const { info, url } = await searchYT(args.join(' ') + ' bayan');

    await msg.reply(
      `╭━━━『 *ISLAMIC BAYAN* 』━━━╮\n` +
      `🕌 *Title:*    ${info.title}\n` +
      `👤 *Speaker:*  ${info.author?.name || 'Unknown'}\n` +
      `⏱️ *Duration:* ${info.timestamp}\n` +
      `╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n` +
      `⏳ *Downloading...*\n${SYSTEM.SHORT_WATERMARK}`
    );

    const buf = await downloadMedia(url, true);

    await sock.sendMessage(from, {
      audio:    buf,
      mimetype: 'audio/mpeg',
      ptt:      false,
    }, { quoted: msg });

    await msg.react('✅');
  } catch (err) {
    console.error('[BAYAN ERROR]:', err.message);
    await msg.react('❌');
    await msg.reply(`❌ *Download failed!*\n_${err.message}_\n${SYSTEM.SHORT_WATERMARK}`);
  }
}

async function songHandler({ sock, msg, from, args }) {
  try {
    if (!args?.length) {
      return msg.reply(
        `❌ *Please provide a song name!*\n\n` +
        `*.song Atif Aslam*\n*.song Bollywood*\n` +
        `${SYSTEM.SHORT_WATERMARK}`
      );
    }

    await msg.react('🎶');
    const { info, url } = await searchYT(args.join(' ') + ' song');

    await msg.reply(
      `╭━━━『 *SONG DOWNLOAD* 』━━━╮\n` +
      `🎶 *Title:*    ${info.title}\n` +
      `👤 *Artist:*   ${info.author?.name || 'Unknown'}\n` +
      `⏱️ *Duration:* ${info.timestamp}\n` +
      `╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n` +
      `⏳ *Downloading...*\n${SYSTEM.SHORT_WATERMARK}`
    );

    const buf = await downloadMedia(url, true);

    await sock.sendMessage(from, {
      audio:    buf,
      mimetype: 'audio/mpeg',
      ptt:      false,
    }, { quoted: msg });

    await msg.react('✅');
  } catch (err) {
    console.error('[SONG ERROR]:', err.message);
    await msg.react('❌');
    await msg.reply(`❌ *Download failed!*\n_${err.message}_\n${SYSTEM.SHORT_WATERMARK}`);
  }
}

export default [
  { command: ['video','ytv','ytmp4'], name: 'video', category: 'Downloader', description: 'Download YouTube video', usage: '.video <url/query>', cooldown: 15, handler: videoHandler },
  { command: ['audio','yta','ytmp3'], name: 'audio', category: 'Downloader', description: 'Download YouTube audio', usage: '.audio <url/query>', cooldown: 15, handler: audioHandler },
  { command: ['play','music'],        name: 'play',  category: 'Downloader', description: 'Play music from YouTube', usage: '.play <song name>', cooldown: 15, handler: playHandler  },
  { command: ['bayan'],               name: 'bayan', category: 'Downloader', description: 'Download Islamic bayan', usage: '.bayan <topic>', cooldown: 15, handler: bayanHandler },
  { command: ['song'],                name: 'song',  category: 'Downloader', description: 'Download songs', usage: '.song <name>', cooldown: 15, handler: songHandler },
];
