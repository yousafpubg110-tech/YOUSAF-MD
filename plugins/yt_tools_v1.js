/*
╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃   YOUSAF-BALOCH-MD  •  yt_tools_v1     ┃
┃  Commands: video audio play            ┃
┃            bayan song ytmp3 ytmp4      ┃
┃        Created by MR YOUSAF BALOCH     ┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
*/
import axios from 'axios';
import yts   from 'yt-search';
import { SYSTEM, OWNER } from '../config.js';

function fmtNum(n) {
  if (!n || isNaN(n)) return '0';
  if (n >= 1e6) return (n/1e6).toFixed(1)+'M';
  if (n >= 1e3) return (n/1e3).toFixed(1)+'K';
  return String(n);
}

function isYTUrl(url) {
  try {
    const h = new URL(url).hostname;
    return ['www.youtube.com','youtube.com','youtu.be','m.youtube.com'].includes(h);
  } catch { return false; }
}

async function getBuffer(url) {
  const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 60000,
    headers: { 'User-Agent': 'Mozilla/5.0' } });
  return Buffer.from(res.data);
}

// ═══════════════════════════════════════════════════════════════════
//  SEARCH
// ═══════════════════════════════════════════════════════════════════

async function searchYT(query) {
  if (isYTUrl(query)) {
    try {
      const u  = new URL(query);
      const id = u.searchParams.get('v') || u.pathname.slice(1);
      const r  = await yts({ videoId: id });
      return { info: r, url: query };
    } catch {}
  }
  const r = await yts(query);
  if (!r.videos.length) throw new Error('No results found!');
  return { info: r.videos[0], url: r.videos[0].url };
}

// ═══════════════════════════════════════════════════════════════════
//  DOWNLOAD — 5 fallback methods
// ═══════════════════════════════════════════════════════════════════

// Method 1 — cobalt.tools (best, no IP block)
async function cobalt(url, isAudio) {
  const res = await axios.post('https://api.cobalt.tools/', {
    url,
    downloadMode: isAudio ? 'audio' : 'auto',
    audioFormat:  'mp3',
    quality:      '720',
  }, {
    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
    timeout: 30000,
  });
  const dlUrl = res.data?.url || res.data?.tunnel;
  if (!dlUrl) throw new Error('cobalt: no url');
  return await getBuffer(dlUrl);
}

// Method 2 — y2mate
async function y2mate(url, isAudio) {
  const r1 = await axios.post('https://www.y2mate.com/mates/analyzeV2/ajax', {
    k_query: url, k_page: 'home', hl: 'en', q_auto: 0,
  }, { timeout: 20000 });
  const vid = r1.data?.vid;
  if (!vid) throw new Error('y2mate: no vid');
  const key = r1.data?.links?.[isAudio ? 'mp3' : 'mp4']?.['128']?.k
    || r1.data?.links?.[isAudio ? 'mp3' : 'mp4']?.['720']?.k
    || '';
  const r2 = await axios.post('https://www.y2mate.com/mates/convertV2/index', {
    vid, ftype: isAudio ? 'mp3' : 'mp4',
    fquality: isAudio ? '128' : '720',
    token: '', timeExpire: '', k: key,
  }, { timeout: 20000 });
  const dlUrl = r2.data?.dlink;
  if (!dlUrl) throw new Error('y2mate: no dlink');
  return await getBuffer(dlUrl);
}

// Method 3 — yt5s
async function yt5s(url, isAudio) {
  const r1 = await axios.post('https://yt5s.io/api/ajaxSearch', {
    q: url, vt: isAudio ? 'mp3' : 'mp4',
  }, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    timeout: 20000,
  });
  const links = r1.data?.links?.[isAudio ? 'mp3' : 'mp4'];
  if (!links) throw new Error('yt5s: no links');
  const entry = Object.values(links)[0];
  if (!entry?.url) throw new Error('yt5s: no entry url');
  return await getBuffer(entry.url);
}

// Method 4 — SaveFrom
async function savefrom(url, isAudio) {
  const res = await axios.get(
    `https://worker.sf-tools.com/savefrom.php?sf_url=${encodeURIComponent(url)}`,
    { timeout: 20000, headers: { 'User-Agent': 'Mozilla/5.0' } }
  );
  const data  = res.data;
  const items = data?.url || [];
  const item  = items.find(i => isAudio
    ? i.type?.includes('audio') || i.ext === 'mp3'
    : i.type?.includes('video') || i.ext === 'mp4'
  );
  if (!item?.url) throw new Error('savefrom: no url');
  return await getBuffer(item.url);
}

// Method 5 — SnapAny
async function snapany(url, isAudio) {
  const res = await axios.post('https://snapany.com/api/convert', {
    url, format: isAudio ? 'mp3' : 'mp4',
  }, {
    headers: { 'Content-Type': 'application/json' },
    timeout: 20000,
  });
  const dlUrl = res.data?.data?.url || res.data?.url;
  if (!dlUrl) throw new Error('snapany: no url');
  return await getBuffer(dlUrl);
}

async function downloadMedia(url, isAudio = false) {
  const methods = [
    { name: 'cobalt.tools', fn: () => cobalt(url, isAudio)    },
    { name: 'y2mate',       fn: () => y2mate(url, isAudio)    },
    { name: 'yt5s',         fn: () => yt5s(url, isAudio)      },
    { name: 'savefrom',     fn: () => savefrom(url, isAudio)  },
    { name: 'snapany',      fn: () => snapany(url, isAudio)   },
  ];

  for (const m of methods) {
    try {
      console.log(`[YT] Trying: ${m.name}`);
      const buf = await m.fn();
      if (buf && buf.length > 10000) {
        console.log(`[YT] ✅ ${m.name} — ${(buf.length/1024/1024).toFixed(1)}MB`);
        return buf;
      }
    } catch (e) {
      console.warn(`[YT] ❌ ${m.name}: ${e.message}`);
    }
  }
  throw new Error('All download methods failed. Try a shorter video.');
}

// ═══════════════════════════════════════════════════════════════════
//  HANDLERS
// ═══════════════════════════════════════════════════════════════════

async function videoHandler({ sock, msg, from, args }) {
  try {
    if (!args?.length) return msg.reply(
      `❌ *Usage:* .video <YouTube URL or search query>\n\n` +
      `*.video Despacito*\n*.video https://youtu.be/xxxxx*\n${SYSTEM.SHORT_WATERMARK}`
    );
    await msg.react('🎬');
    const { info, url } = await searchYT(args.join(' '));
    await msg.reply(
      `╭━━━『 *YOUTUBE VIDEO* 』━━━╮\n` +
      `🎬 *Title:*    ${info.title}\n` +
      `👤 *Channel:*  ${info.author?.name || 'Unknown'}\n` +
      `⏱️ *Duration:* ${info.timestamp || info.duration?.timestamp || 'N/A'}\n` +
      `👁️ *Views:*    ${fmtNum(info.views)}\n` +
      `╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n` +
      `⏳ *Downloading...*\n${SYSTEM.SHORT_WATERMARK}`
    );
    const buf = await downloadMedia(url, false);
    if (buf.length > 100 * 1024 * 1024) {
      return msg.reply(`⚠️ *File too large!* (${(buf.length/1024/1024).toFixed(0)}MB)\n💡 Try: *.audio ${url}*\n${SYSTEM.SHORT_WATERMARK}`);
    }
    await sock.sendMessage(from, {
      video:    buf,
      mimetype: 'video/mp4',
      caption:  `🎬 *${info.title}*\n👤 ${info.author?.name || ''}\n${SYSTEM.SHORT_WATERMARK}`,
    }, { quoted: msg });
    await msg.react('✅');
  } catch (e) {
    console.error('[VIDEO]:', e.message);
    await msg.react('❌');
    await msg.reply(`❌ *Download failed!*\n_${e.message}_\n${SYSTEM.SHORT_WATERMARK}`);
  }
}

async function audioHandler({ sock, msg, from, args }) {
  try {
    if (!args?.length) return msg.reply(
      `❌ *Usage:* .audio <YouTube URL or song name>\n\n` +
      `*.audio Despacito*\n${SYSTEM.SHORT_WATERMARK}`
    );
    await msg.react('🎵');
    const { info, url } = await searchYT(args.join(' '));
    await msg.reply(
      `╭━━━『 *YOUTUBE MP3* 』━━━╮\n` +
      `🎵 *Title:*    ${info.title}\n` +
      `👤 *Artist:*   ${info.author?.name || 'Unknown'}\n` +
      `⏱️ *Duration:* ${info.timestamp || info.duration?.timestamp || 'N/A'}\n` +
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
  } catch (e) {
    console.error('[AUDIO]:', e.message);
    await msg.react('❌');
    await msg.reply(`❌ *Download failed!*\n_${e.message}_\n${SYSTEM.SHORT_WATERMARK}`);
  }
}

async function playHandler({ sock, msg, from, args }) {
  try {
    if (!args?.length) return msg.reply(
      `❌ *Usage:* .play <song name>\n*.play Atif Aslam*\n${SYSTEM.SHORT_WATERMARK}`
    );
    await msg.react('🎵');
    const { info, url } = await searchYT(args.join(' '));
    await msg.reply(
      `╭━━━『 *PLAY MUSIC* 』━━━╮\n` +
      `🎵 *Title:*    ${info.title}\n` +
      `👤 *Artist:*   ${info.author?.name || 'Unknown'}\n` +
      `⏱️ *Duration:* ${info.timestamp || info.duration?.timestamp || 'N/A'}\n` +
      `👁️ *Views:*    ${fmtNum(info.views)}\n` +
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
  } catch (e) {
    console.error('[PLAY]:', e.message);
    await msg.react('❌');
    await msg.reply(`❌ *Download failed!*\n_${e.message}_\n${SYSTEM.SHORT_WATERMARK}`);
  }
}

async function songHandler({ sock, msg, from, args }) {
  try {
    if (!args?.length) return msg.reply(
      `❌ *Usage:* .song <song name>\n*.song Atif Aslam*\n${SYSTEM.SHORT_WATERMARK}`
    );
    await msg.react('🎶');
    const { info, url } = await searchYT(args.join(' ') + ' song');
    await msg.reply(
      `╭━━━『 *SONG DOWNLOAD* 』━━━╮\n` +
      `🎶 *Title:*    ${info.title}\n` +
      `👤 *Artist:*   ${info.author?.name || 'Unknown'}\n` +
      `⏱️ *Duration:* ${info.timestamp || info.duration?.timestamp || 'N/A'}\n` +
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
  } catch (e) {
    console.error('[SONG]:', e.message);
    await msg.react('❌');
    await msg.reply(`❌ *Download failed!*\n_${e.message}_\n${SYSTEM.SHORT_WATERMARK}`);
  }
}

async function bayanHandler({ sock, msg, from, args }) {
  try {
    if (!args?.length) return msg.reply(
      `❌ *Usage:* .bayan <scholar/topic>\n*.bayan Maulana Tariq Jameel*\n${SYSTEM.SHORT_WATERMARK}`
    );
    await msg.react('🕌');
    const { info, url } = await searchYT(args.join(' ') + ' bayan');
    await msg.reply(
      `╭━━━『 *ISLAMIC BAYAN* 』━━━╮\n` +
      `🕌 *Title:*    ${info.title}\n` +
      `👤 *Speaker:*  ${info.author?.name || 'Unknown'}\n` +
      `⏱️ *Duration:* ${info.timestamp || info.duration?.timestamp || 'N/A'}\n` +
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
  } catch (e) {
    console.error('[BAYAN]:', e.message);
    await msg.react('❌');
    await msg.reply(`❌ *Download failed!*\n_${e.message}_\n${SYSTEM.SHORT_WATERMARK}`);
  }
}

export default [
  { command: ['video','ytv','ytmp4'], name: 'video', category: 'Downloader', description: 'Download YouTube video', usage: '.video <url/query>', cooldown: 15, handler: videoHandler },
  { command: ['audio','yta','ytmp3'], name: 'audio', category: 'Downloader', description: 'Download YouTube audio', usage: '.audio <url/query>', cooldown: 15, handler: audioHandler },
  { command: ['play','music'],        name: 'play',  category: 'Downloader', description: 'Play music',            usage: '.play <song>',      cooldown: 15, handler: playHandler  },
  { command: ['song'],                name: 'song',  category: 'Downloader', description: 'Download song',         usage: '.song <name>',      cooldown: 15, handler: songHandler  },
  { command: ['bayan'],               name: 'bayan', category: 'Downloader', description: 'Islamic bayan',         usage: '.bayan <topic>',    cooldown: 15, handler: bayanHandler },
];
