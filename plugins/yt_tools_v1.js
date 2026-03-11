/*
╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃   YOUSAF-BALOCH-MD  •  yt_tools_v1     ┃
┃  Commands: video audio play            ┃
┃            bayan song                  ┃
┃        Created by MR YOUSAF BALOCH     ┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
*/
import axios from 'axios';
import yts from 'yt-search';
import { sanitizeUrl } from '../lib/utils.js';
import { SYSTEM } from '../config.js';

function isValidYouTubeUrl(url) {
  try {
    const parsed = new URL(url);
    return (
      ['www.youtube.com', 'youtube.com', 'youtu.be', 'm.youtube.com'].includes(parsed.hostname) &&
      (parsed.protocol === 'https:' || parsed.protocol === 'http:')
    );
  } catch { return false; }
}

function extractVideoId(url) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname === 'youtu.be') return parsed.pathname.slice(1);
    return parsed.searchParams.get('v') || null;
  } catch { return null; }
}

function formatNumber(num) {
  if (!num || isNaN(num)) return '0';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

async function getBuffer(url) {
  try {
    const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 });
    return Buffer.from(res.data);
  } catch { return Buffer.from(''); }
}

// ── YTDL CORE Method ─────────────────────────────────────────────────────────
async function method_Ytdl(videoUrl, isAudio = false) {
  const { default: ytdl } = await import('@distube/ytdl-core');
  return new Promise((resolve, reject) => {
    const chunks = [];
    const stream = ytdl(videoUrl, {
      filter: isAudio ? 'audioonly' : format => format.container === 'mp4' && format.hasVideo && format.hasAudio,
      quality: isAudio ? 'highestaudio' : 'highestvideo',
      requestOptions: { headers: { 'User-Agent': 'Mozilla/5.0' } }
    });
    stream.on('data', chunk => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', err => reject(err));
  });
}

// ── Deline API Method ────────────────────────────────────────────────────────
async function method_Deline(videoUrl, isAudio = false) {
  const endpoint = isAudio ? 'ytmp3' : 'ytmp4';
  const apiUrl = `https://api.deline.web.id/downloader/${endpoint}?url=${encodeURIComponent(videoUrl)}`;
  const res = await axios.get(apiUrl, { timeout: 60000, headers: { "User-Agent": "Mozilla/5.0", "Accept": "application/json" } });
  const data = res.data;
  if (data.status === false) throw new Error('Deline API rejected video');
  if (!data.result || !data.result.dlink) throw new Error('No download link from Deline');
  const media = await axios.get(data.result.dlink, { responseType: 'arraybuffer', timeout: 60000 });
  return Buffer.from(media.data);
}

// ── Download Chain ───────────────────────────────────────────────────────────
async function downloadMedia(videoUrl, isAudio = false) {
  const methods = [
    { name: 'ytdl-core', fn: () => method_Ytdl(videoUrl, isAudio) },
    { name: 'deline-api', fn: () => method_Deline(videoUrl, isAudio) }
  ];
  for (const method of methods) {
    try {
      console.log(`[YTDL] Trying: ${method.name}`);
      const buffer = await method.fn();
      if (buffer && buffer.length > 1000) {
        console.log(`[YTDL] Success: ${method.name}`);
        return buffer;
      }
    } catch (err) {
      console.warn(`[YTDL] ${method.name} failed: ${err.message}`);
    }
  }
  throw new Error('All download methods failed.');
}

// ─── VIDEO Handler ────────────────────────────────────────────────────────────
async function videoHandler({sock, msg, from, args}) {
  try {
    if (!args?.length) return msg.reply(`❌ *Please provide a YouTube URL or search query!*\n\n.video https://youtu.be/xxxxx\n.video Despacito\n${SYSTEM.SHORT_WATERMARK}`);
    await msg.react('🎬');
    const query = args.join(' ');
    let videoUrl, videoInfo;

    if (isValidYouTubeUrl(query)) {
      const videoId = extractVideoId(query);
      if (!videoId) { await msg.react('❌'); return msg.reply('❌ Invalid YouTube URL!'); }
      const search = await yts({ videoId });
      videoInfo = search; videoUrl = query;
    } else {
      const search = await yts(query);
      if (!search.videos.length) { await msg.react('❌'); return msg.reply('❌ No videos found!'); }
      videoInfo = search.videos[0]; videoUrl = videoInfo.url;
    }

    await msg.reply(`╭━━━『 *YOUTUBE VIDEO* 』━━━╮\n🎬 *Title:* ${videoInfo.title}\n👤 *Channel:* ${videoInfo.author?.name || 'Unknown'}\n⏱️ *Duration:* ${videoInfo.timestamp}\n👁️ *Views:* ${formatNumber(videoInfo.views)}\n╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n⏳ *Downloading video...*\n${SYSTEM.SHORT_WATERMARK}`);

    await msg.react('⬇️');
    const videoBuffer = await downloadMedia(videoUrl, false);

    if (videoBuffer.length > 100 * 1024 * 1024) {
      await msg.react('⚠️');
      return msg.reply(`⚠️ *File too large!*\n\nVideo exceeds 100MB WhatsApp limit.\n\n💡 Try audio instead:\n*.audio ${videoUrl}*\n${SYSTEM.SHORT_WATERMARK}`);
    }

    let thumbnailBuffer = Buffer.from('');
    if (videoInfo.thumbnail) {
      const safeThumb = sanitizeUrl(videoInfo.thumbnail);
      if (safeThumb) thumbnailBuffer = await getBuffer(safeThumb);
    }

    await sock.sendMessage(from, {
      video: videoBuffer,
      mimetype: 'video/mp4',
      caption: `🎬 *${videoInfo.title}*\n\n👤 ${videoInfo.author?.name || 'Unknown'}\n⏱️ ${videoInfo.timestamp}\n${SYSTEM.SHORT_WATERMARK}`,
      contextInfo: {
        externalAdReply: {
          title: videoInfo.title,
          body: `🎬 YouTube Video`,
          thumbnail: thumbnailBuffer,
          mediaType: 1,
        },
      },
    }, { quoted: msg });
    await msg.react('✅');
  } catch (error) {
    console.error('[VIDEO ERROR]:', error.message);
    await msg.react('❌');
    await msg.reply(`❌ *Download failed!*\n_${error.message}_\n${SYSTEM.SHORT_WATERMARK}`);
  }
}

// ─── AUDIO Handler ────────────────────────────────────────────────────────────
async function audioHandler({sock, msg, from, args}) {
  try {
    if (!args?.length) return msg.reply(`❌ *Please provide a YouTube URL or search query!*\n\n.audio https://youtu.be/xxxxx\n.audio Despacito\n${SYSTEM.SHORT_WATERMARK}`);
    await msg.react('🎵');
    const query = args.join(' ');
    let videoUrl, videoInfo;

    if (isValidYouTubeUrl(query)) {
      const videoId = extractVideoId(query);
      if (!videoId) { await msg.react('❌'); return msg.reply('❌ Invalid YouTube URL!'); }
      const search = await yts({ videoId });
      videoInfo = search; videoUrl = query;
    } else {
      const search = await yts(query);
      if (!search.videos.length) { await msg.react('❌'); return msg.reply('❌ No videos found!'); }
      videoInfo = search.videos[0]; videoUrl = videoInfo.url;
    }

    await msg.reply(`╭━━━『 *YOUTUBE MP3* 』━━━╮\n🎵 *Title:* ${videoInfo.title}\n👤 *Artist:* ${videoInfo.author?.name || 'Unknown'}\n⏱️ *Duration:* ${videoInfo.timestamp}\n👁️ *Views:* ${formatNumber(videoInfo.views)}\n╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n⏳ *Downloading audio...*\n${SYSTEM.SHORT_WATERMARK}`);

    await msg.react('⬇️');
    const audioBuffer = await downloadMedia(videoUrl, true);

    let thumbnailBuffer = Buffer.from('');
    if (videoInfo.thumbnail) {
      const safeThumb = sanitizeUrl(videoInfo.thumbnail);
      if (safeThumb) thumbnailBuffer = await getBuffer(safeThumb);
    }

    await sock.sendMessage(from, {
      audio: audioBuffer,
      mimetype: 'audio/mpeg',
      contextInfo: {
        externalAdReply: {
          title: videoInfo.title,
          body: `${videoInfo.author?.name || 'Unknown'}`,
          thumbnail: thumbnailBuffer,
          mediaType: 2,
        },
      },
    }, { quoted: msg });
    await msg.react('✅');
  } catch (error) {
    console.error('[AUDIO ERROR]:', error.message);
    await msg.react('❌');
    await msg.reply(`❌ *Download failed!*\n_${error.message}_\n${SYSTEM.SHORT_WATERMARK}`);
  }
}

// ─── PLAY Handler ─────────────────────────────────────────────────────────────
async function playHandler({sock, msg, from, args}) {
  try {
    if (!args?.length) return msg.reply(`❌ *Please provide a song name!*\n\n.play Despacito\n.play Atif Aslam songs\n${SYSTEM.SHORT_WATERMARK}`);
    await msg.react('🎵');
    const query = args.join(' ');
    const search = await yts(query);
    if (!search.videos.length) { await msg.react('❌'); return msg.reply('❌ No songs found!'); }
    const videoInfo = search.videos[0];
    const videoUrl = videoInfo.url;

    await msg.reply(`╭━━━『 *PLAY MUSIC* 』━━━╮\n🎵 *Title:* ${videoInfo.title}\n👤 *Artist:* ${videoInfo.author?.name || 'Unknown'}\n⏱️ *Duration:* ${videoInfo.timestamp}\n👁️ *Views:* ${formatNumber(videoInfo.views)}\n╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n⏳ *Downloading...*\n${SYSTEM.SHORT_WATERMARK}`);

    await msg.react('⬇️');
    const audioBuffer = await downloadMedia(videoUrl, true);

    let thumbnailBuffer = Buffer.from('');
    if (videoInfo.thumbnail) {
      const safeThumb = sanitizeUrl(videoInfo.thumbnail);
      if (safeThumb) thumbnailBuffer = await getBuffer(safeThumb);
    }

    await sock.sendMessage(from, {
      audio: audioBuffer,
      mimetype: 'audio/mpeg',
      contextInfo: {
        externalAdReply: {
          title: videoInfo.title,
          body: `${videoInfo.author?.name || 'Unknown'}`,
          thumbnail: thumbnailBuffer,
          mediaType: 2,
        },
      },
    }, { quoted: msg });
    await msg.react('✅');
  } catch (error) {
    console.error('[PLAY ERROR]:', error.message);
    await msg.react('❌');
    await msg.reply(`❌ *Download failed!*\n_${error.message}_\n${SYSTEM.SHORT_WATERMARK}`);
  }
}

// ─── BAYAN Handler ────────────────────────────────────────────────────────────
async function bayanHandler({sock, msg, from, args}) {
  try {
    if (!args?.length) return msg.reply(`❌ *Please provide a bayan topic or scholar name!*\n\n.bayan Maulana Tariq Jameel\n.bayan Ramadan bayan\n${SYSTEM.SHORT_WATERMARK}`);
    await msg.react('🕌');
    const query = args.join(' ') + ' bayan';
    const search = await yts(query);
    if (!search.videos.length) { await msg.react('❌'); return msg.reply('❌ No bayan found!'); }
    const videoInfo = search.videos[0];
    const videoUrl = videoInfo.url;

    await msg.reply(`╭━━━『 *ISLAMIC BAYAN* 』━━━╮\n🕌 *Title:* ${videoInfo.title}\n👤 *Speaker:* ${videoInfo.author?.name || 'Unknown'}\n⏱️ *Duration:* ${videoInfo.timestamp}\n╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n⏳ *Downloading...*\n${SYSTEM.SHORT_WATERMARK}`);

    await msg.react('⬇️');
    const audioBuffer = await downloadMedia(videoUrl, true);

    await sock.sendMessage(from, {
      audio: audioBuffer,
      mimetype: 'audio/mpeg',
      caption: `🕌 *${videoInfo.title}*\n${SYSTEM.SHORT_WATERMARK}`,
    }, { quoted: msg });
    await msg.react('✅');
  } catch (error) {
    console.error('[BAYAN ERROR]:', error.message);
    await msg.react('❌');
    await msg.reply(`❌ *Download failed!*\n_${error.message}_\n${SYSTEM.SHORT_WATERMARK}`);
  }
}

// ─── SONG Handler ─────────────────────────────────────────────────────────────
async function songHandler({sock, msg, from, args}) {
  try {
    if (!args?.length) return msg.reply(`❌ *Please provide a song name!*\n\n.song Atif Aslam\n.song Bollywood songs\n${SYSTEM.SHORT_WATERMARK}`);
    await msg.react('🎶');
    const query = args.join(' ') + ' song';
    const search = await yts(query);
    if (!search.videos.length) { await msg.react('❌'); return msg.reply('❌ No songs found!'); }
    const videoInfo = search.videos[0];
    const videoUrl = videoInfo.url;

    await msg.reply(`╭━━━『 *SONG DOWNLOAD* 』━━━╮\n🎶 *Title:* ${videoInfo.title}\n👤 *Artist:* ${videoInfo.author?.name || 'Unknown'}\n⏱️ *Duration:* ${videoInfo.timestamp}\n╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n⏳ *Downloading...*\n${SYSTEM.SHORT_WATERMARK}`);

    await msg.react('⬇️');
    const audioBuffer = await downloadMedia(videoUrl, true);

    await sock.sendMessage(from, {
      audio: audioBuffer,
      mimetype: 'audio/mpeg',
      caption: `🎶 *${videoInfo.title}*\n${SYSTEM.SHORT_WATERMARK}`,
    }, { quoted: msg });
    await msg.react('✅');
  } catch (error) {
    console.error('[SONG ERROR]:', error.message);
    await msg.react('❌');
    await msg.reply(`❌ *Download failed!*\n_${error.message}_\n${SYSTEM.SHORT_WATERMARK}`);
  }
}

export default [
  {command:['video','ytv','ytmp4'], name:'video', category:'Downloader',description:'Download YouTube video',usage:'.video <url/query>',cooldown:15,handler:videoHandler},
  {command:['audio','yta','ytmp3'], name:'audio', category:'Downloader',description:'Download YouTube audio',usage:'.audio <url/query>',cooldown:15,handler:audioHandler},
  {command:['play','music'],         name:'play',  category:'Downloader',description:'Play music from YouTube',usage:'.play <song name>',cooldown:15,handler:playHandler},
  {command:['bayan'],                name:'bayan', category:'Downloader',description:'Download Islamic bayan',usage:'.bayan <scholar/topic>',cooldown:15,handler:bayanHandler},
  {command:['song'],                 name:'song',  category:'Downloader',description:'Download songs',usage:'.song <song name>',cooldown:15,handler:songHandler},
];
