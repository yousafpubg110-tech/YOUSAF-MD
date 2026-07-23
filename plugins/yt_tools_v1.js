/*
╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃   YOUSAF-BALOCH-MD  •  yt_tools_v1                             ┃
┃   Commands: video, audio, play, song, ytmp3, ytmp4, bayan    ┃
┃             music, drama, movie, ytv, yta                       ┃
┃   Features: Multi-Server Fallback, No IP Block, Owner Only    ┃
┃   Created by MR YOUSAF BALOCH                                  ┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
*/
import axios from 'axios';
import yts from 'yt-search';
import { SYSTEM, OWNER } from '../config.js';

// ═══════════════════════════════════════════════════════════════════
//  UTILITIES & HELPERS
// ═══════════════════════════════════════════════════════════════════

function fmtNum(n) {
  if (!n || isNaN(n)) return '0';
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return String(n);
}

function isYTUrl(url) {
  try {
    const h = new URL(url).hostname;
    return ['www.youtube.com', 'youtube.com', 'youtu.be', 'm.youtube.com'].includes(h);
  } catch {
    return false;
  }
}

async function getBuffer(url) {
  const res = await axios.get(url, {
    responseType: 'arraybuffer',
    timeout: 90000,
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': '*/*',
    },
  });
  return Buffer.from(res.data);
}

// ═══════════════════════════════════════════════════════════════════
//  SEARCH ENGINE
// ═══════════════════════════════════════════════════════════════════

async function searchYT(query) {
  if (isYTUrl(query)) {
    try {
      const u = new URL(query);
      const id = u.searchParams.get('v') || u.pathname.slice(1);
      const r = await yts({ videoId: id });
      return { info: r, url: query };
    } catch (_) {}
  }
  const r = await yts(query);
  if (!r.videos || !r.videos.length) throw new Error('No YouTube results found for your query!');
  return { info: r.videos[0], url: r.videos[0].url };
}

// ═══════════════════════════════════════════════════════════════════
//  ULTRA HEAVY MULTI-SERVER DOWNLOAD ENGINES (7 FALLBACKS)
// ═══════════════════════════════════════════════════════════════════

async function engineDavid(url, isAudio) {
  const type = isAudio ? 'ytmp3' : 'ytmp4';
  const res = await axios.get(`https://api.davidcyriltech.my.id/download/${type}?url=${encodeURIComponent(url)}`, { timeout: 35000 });
  const dl = res.data?.result?.download_url || res.data?.result?.url || res.data?.url;
  if (!dl) throw new Error('David Engine: No link returned');
  return await getBuffer(dl);
}

async function engineGuru(url, isAudio) {
  const type = isAudio ? 'ytmp3' : 'ytmp4';
  const res = await axios.get(`https://api.guruapi.tech/${type}?url=${encodeURIComponent(url)}`, { timeout: 35000 });
  const dl = res.data?.result?.download_url || res.data?.result?.url || res.data?.url;
  if (!dl) throw new Error('Guru Engine: No link returned');
  return await getBuffer(dl);
}

async function engineWidipe(url, isAudio) {
  const type = isAudio ? 'yump3' : 'yump4';
  const res = await axios.get(`https://widipe.sharevips.com/download/${type}?url=${encodeURIComponent(url)}`, { timeout: 35000 });
  const dl = res.data?.result?.mp3 || res.data?.result?.mp4 || res.data?.result?.url;
  if (!dl) throw new Error('Widipe Engine: No link returned');
  return await getBuffer(dl);
}

async function engineCobalt(url, isAudio) {
  const res = await axios.post('https://api.cobalt.tools/', {
    url,
    downloadMode: isAudio ? 'audio' : 'auto',
    audioFormat: 'mp3',
    videoQuality: '720',
  }, {
    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
    timeout: 30000,
  });
  const dl = res.data?.url || res.data?.tunnel;
  if (!dl) throw new Error('Cobalt Engine: No link returned');
  return await getBuffer(dl);
}

async function engineOkatsu(url, isAudio) {
  const type = isAudio ? 'ytmp3' : 'ytmp4';
  const res = await axios.get(`https://api.okatsu.my.id/download/${type}?url=${encodeURIComponent(url)}`, { timeout: 35000 });
  const dl = res.data?.result?.dl_url || res.data?.result?.url;
  if (!dl) throw new Error('Okatsu Engine: No link returned');
  return await getBuffer(dl);
}

async function engineY2Mate(url, isAudio) {
  const r1 = await axios.post('https://www.y2mate.com/mates/analyzeV2/ajax', {
    k_query: url, k_page: 'home', hl: 'en', q_auto: 0,
  }, { timeout: 20000 });
  const vid = r1.data?.vid;
  if (!vid) throw new Error('Y2Mate: No VID');
  const key = r1.data?.links?.[isAudio ? 'mp3' : 'mp4']?.['128']?.k || r1.data?.links?.[isAudio ? 'mp3' : 'mp4']?.['720']?.k || '';
  const r2 = await axios.post('https://www.y2mate.com/mates/convertV2/index', {
    vid, ftype: isAudio ? 'mp3' : 'mp4', fquality: isAudio ? '128' : '720', token: '', timeExpire: '', k: key,
  }, { timeout: 20000 });
  const dl = r2.data?.dlink;
  if (!dl) throw new Error('Y2Mate: No Download Link');
  return await getBuffer(dl);
}

async function engineSaveFrom(url, isAudio) {
  const res = await axios.get(`https://worker.sf-tools.com/savefrom.php?sf_url=${encodeURIComponent(url)}`, {
    timeout: 25000,
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  const items = res.data?.url || [];
  const item = items.find(i => isAudio ? (i.type?.includes('audio') || i.ext === 'mp3') : (i.type?.includes('video') || i.ext === 'mp4'));
  if (!item?.url) throw new Error('SaveFrom: No direct link');
  return await getBuffer(item.url);
}

async function downloadMediaMaster(url, isAudio = false) {
  const engines = [
    { name: 'David-Cyril Primary Engine', fn: () => engineDavid(url, isAudio) },
    { name: 'Guru-API Secondary Engine', fn: () => engineGuru(url, isAudio) },
    { name: 'Widipe Mirror Engine',      fn: () => engineWidipe(url, isAudio) },
    { name: 'Cobalt-Tools Direct Engine',fn: () => engineCobalt(url, isAudio) },
    { name: 'Okatsu High-Speed Engine',  fn: () => engineOkatsu(url, isAudio) },
    { name: 'Y2Mate Fallback Engine',     fn: () => engineY2Mate(url, isAudio) },
    { name: 'SaveFrom Worker Engine',    fn: () => engineSaveFrom(url, isAudio) },
  ];

  let lastError = '';
  for (const eng of engines) {
    try {
      console.log(`[YT-DOWNLOAD] Attempting with ${eng.name}...`);
      const buf = await eng.fn();
      if (buf && buf.length > 10000) {
        console.log(`[YT-DOWNLOAD] ✅ Success via ${eng.name} — Size: ${(buf.length / 1024 / 1024).toFixed(2)} MB`);
        return buf;
      }
    } catch (err) {
      console.warn(`[YT-DOWNLOAD] ❌ ${eng.name} failed: ${err.message}`);
      lastError = err.message;
    }
  }
  throw new Error(`All 7 Download Servers were unable to fetch this video. Details: ${lastError}`);
}

// ═══════════════════════════════════════════════════════════════════
//  HANDLERS & COMMAND LOGIC
// ═══════════════════════════════════════════════════════════════════

async function videoHandler({ sock, msg, from, args }) {
  try {
    if (!args || !args.length) {
      return sock.sendMessage(from, {
        text: `╭━━━『 ❌ *INVALID USAGE* 』━━━╮\n\n` +
              `Please provide a YouTube video link or search term.\n\n` +
              `📌 *Examples:*\n` +
              `• .video Ertugrul Ghazi Episode 1\n` +
              `• .ytv https://youtu.be/xxxxxx\n\n` +
              `╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n${SYSTEM?.SHORT_WATERMARK || ''}`
      }, { quoted: msg });
    }

    const query = args.join(' ');
    const { info, url } = await searchYT(query);

    await sock.sendMessage(from, {
      text: `╭━━━『 🎬 *YOUTUBE VIDEO DOWNLOADER* 』━━━╮\n\n` +
            `🎬 *Title:*    ${info.title}\n` +
            `👤 *Channel:*  ${info.author?.name || 'Unknown'}\n` +
            `⏱️ *Duration:* ${info.timestamp || info.duration?.timestamp || 'N/A'}\n` +
            `👁️ *Views:*    ${fmtNum(info.views)}\n` +
            `📅 *Uploaded:* ${info.ago || 'N/A'}\n\n` +
            `⏳ *Downloading Video via Ultra Servers... Please wait!*\n\n` +
            `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯\n${SYSTEM?.SHORT_WATERMARK || ''}`
    }, { quoted: msg });

    const buf = await downloadMediaMaster(url, false);

    await sock.sendMessage(from, {
      video: buf,
      mimetype: 'video/mp4',
      caption: `╭━━━『 🎬 *YOUTUBE VIDEO* 』━━━╮\n\n` +
               `🎬 *Title:* ${info.title}\n` +
               `👤 *Channel:* ${info.author?.name || 'Unknown'}\n\n` +
               `👑 *Owner:* ${OWNER?.FULL_NAME || 'MR YOUSAF BALOCH'}\n` +
               `╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n${SYSTEM?.SHORT_WATERMARK || ''}`,
    }, { quoted: msg });

  } catch (e) {
    console.error('[VIDEO COMMAND ERROR]:', e.message);
    await sock.sendMessage(from, {
      text: `❌ *Download Failed!*\n\n_Reason: ${e.message}_\n\n${SYSTEM?.SHORT_WATERMARK || ''}`
    }, { quoted: msg });
  }
}

async function audioHandler({ sock, msg, from, args }) {
  try {
    if (!args || !args.length) {
      return sock.sendMessage(from, {
        text: `╭━━━『 ❌ *INVALID USAGE* 』━━━╮\n\n` +
              `Please provide a song name or YouTube link.\n\n` +
              `📌 *Examples:*\n` +
              `• .audio Atif Aslam New Song\n` +
              `• .ytmp3 https://youtu.be/xxxxxx\n\n` +
              `╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n${SYSTEM?.SHORT_WATERMARK || ''}`
      }, { quoted: msg });
    }

    const query = args.join(' ');
    const { info, url } = await searchYT(query);

    await sock.sendMessage(from, {
      text: `╭━━━『 🎵 *YOUTUBE AUDIO MP3* 』━━━╮\n\n` +
            `🎵 *Title:*    ${info.title}\n` +
            `👤 *Artist:*   ${info.author?.name || 'Unknown'}\n` +
            `⏱️ *Duration:* ${info.timestamp || info.duration?.timestamp || 'N/A'}\n` +
            `👁️ *Views:*    ${fmtNum(info.views)}\n\n` +
            `⏳ *Converting & Downloading Audio... Please wait!*\n\n` +
            `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯\n${SYSTEM?.SHORT_WATERMARK || ''}`
    }, { quoted: msg });

    const buf = await downloadMediaMaster(url, true);

    await sock.sendMessage(from, {
      audio: buf,
      mimetype: 'audio/mpeg',
      ptt: false,
    }, { quoted: msg });

  } catch (e) {
    console.error('[AUDIO COMMAND ERROR]:', e.message);
    await sock.sendMessage(from, {
      text: `❌ *Audio Download Failed!*\n\n_Reason: ${e.message}_\n\n${SYSTEM?.SHORT_WATERMARK || ''}`
    }, { quoted: msg });
  }
}

async function playHandler({ sock, msg, from, args }) {
  return audioHandler({ sock, msg, from, args });
}

async function songHandler({ sock, msg, from, args }) {
  if (args && args.length) args.push('song');
  return audioHandler({ sock, msg, from, args });
}

async function bayanHandler({ sock, msg, from, args }) {
  if (args && args.length) args.push('bayan');
  return audioHandler({ sock, msg, from, args });
}

async function dramaHandler({ sock, msg, from, args }) {
  if (args && args.length) args.push('drama episode');
  return videoHandler({ sock, msg, from, args });
}

async function movieHandler({ sock, msg, from, args }) {
  if (args && args.length) args.push('full movie');
  return videoHandler({ sock, msg, from, args });
}

// ═══════════════════════════════════════════════════════════════════
//  EXPORT DISPATCHER
// ═══════════════════════════════════════════════════════════════════

export default [
  { command: 'video', handler: videoHandler },
  { command: 'ytv',   handler: videoHandler },
  { command: 'ytmp4', handler: videoHandler },
  { command: 'drama', handler: dramaHandler },
  { command: 'movie', handler: movieHandler },
  { command: 'audio', handler: audioHandler },
  { command: 'yta',   handler: audioHandler },
  { command: 'ytmp3', handler: audioHandler },
  { command: 'play',  handler: playHandler  },
  { command: 'music', handler: playHandler  },
  { command: 'song',  handler: songHandler  },
  { command: 'bayan', handler: bayanHandler }
];

