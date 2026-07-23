/*
╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃   YOUSAF-BALOCH-MD  •  social_v1                              ┃
┃   Commands: tiktok, tt, fb, facebook, insta, ig, capcut,      ┃
┃             inshot                                            ┃
┃   Features: TikTok, Facebook, Instagram, CapCut, InShot       ┃
┃   Created by MR YOUSAF BALOCH                                 ┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
*/
import axios from 'axios';
import { OWNER, SYSTEM } from '../config.js';

const CHANNEL = OWNER?.CHANNEL || '';

async function getBuffer(url) {
  const res = await axios.get(url, {
    responseType: 'arraybuffer',
    timeout: 60000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  });
  return Buffer.from(res.data);
}

// ═══════════════════════════════════════════════════════════════════
//  TIKTOK DOWNLOADER
// ═══════════════════════════════════════════════════════════════════

async function downloadTikTok(url) {
  // Method 1 — tikwm
  try {
    const res = await axios.get(`https://tikwm.com/api/?url=${encodeURIComponent(url)}`, { timeout: 25000 });
    const d = res.data?.data;
    if (d?.play) return { url: d.play, title: d.title || 'TikTok Video' };
  } catch (_) {}

  // Method 2 — davidcyril API
  try {
    const res = await axios.get(`https://api.davidcyriltech.my.id/download/tiktok?url=${encodeURIComponent(url)}`, { timeout: 25000 });
    const dl = res.data?.result?.video || res.data?.result?.nowatermark || res.data?.url;
    if (dl) return { url: dl, title: 'TikTok Video' };
  } catch (_) {}

  // Method 3 — guru API
  try {
    const res = await axios.get(`https://api.guruapi.tech/tiktok?url=${encodeURIComponent(url)}`, { timeout: 25000 });
    const dl = res.data?.result?.video || res.data?.result?.nowatermark;
    if (dl) return { url: dl, title: 'TikTok Video' };
  } catch (_) {}

  throw new Error('All TikTok servers are currently busy.');
}

async function tiktokHandler({ sock, msg, from, args }) {
  try {
    if (!args || !args.length) {
      return sock.sendMessage(from, {
        text: `❌ *Usage:* .tiktok <TikTok URL>\n\n*.tiktok https://vm.tiktok.com/xxxxx*\n${SYSTEM?.SHORT_WATERMARK || ''}`
      }, { quoted: msg });
    }

    await sock.sendMessage(from, { text: `⏳ *Downloading TikTok video...*\n${SYSTEM?.SHORT_WATERMARK || ''}` }, { quoted: msg });

    const data = await downloadTikTok(args[0]);
    const buf  = await getBuffer(data.url);

    await sock.sendMessage(from, {
      video: buf,
      caption: `🎵 *${data.title}*\n\n📢 *Channel:* ${CHANNEL}\n${SYSTEM?.SHORT_WATERMARK || ''}`,
    }, { quoted: msg });

  } catch (err) {
    console.error('[TIKTOK ERROR]:', err.message);
    await sock.sendMessage(from, { text: `❌ *TikTok Download failed!*\n_${err.message}_\n${SYSTEM?.SHORT_WATERMARK || ''}` }, { quoted: msg });
  }
}

// ═══════════════════════════════════════════════════════════════════
//  FACEBOOK DOWNLOADER
// ═══════════════════════════════════════════════════════════════════

async function downloadFacebook(url) {
  // Method 1 — davidcyril API
  try {
    const res = await axios.get(`https://api.davidcyriltech.my.id/download/fbdl?url=${encodeURIComponent(url)}`, { timeout: 25000 });
    const dl = res.data?.result?.hd || res.data?.result?.sd || res.data?.result?.url;
    if (dl) return dl;
  } catch (_) {}

  // Method 2 — guru API
  try {
    const res = await axios.get(`https://api.guruapi.tech/facebook?url=${encodeURIComponent(url)}`, { timeout: 25000 });
    const dl = res.data?.result?.hd || res.data?.result?.sd;
    if (dl) return dl;
  } catch (_) {}

  // Method 3 — getmyfb
  try {
    const res = await axios.post('https://getmyfb.com/api/info', `url=${encodeURIComponent(url)}`, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      timeout: 25000,
    });
    const hd = res.data?.links?.Download_HD || res.data?.links?.Download_SD;
    if (hd) return hd;
  } catch (_) {}

  throw new Error('All Facebook servers failed');
}

async function fbHandler({ sock, msg, from, args }) {
  try {
    if (!args || !args.length) {
      return sock.sendMessage(from, {
        text: `❌ *Usage:* .fb <Facebook URL>\n\n*.fb https://fb.watch/xxxxx*\n${SYSTEM?.SHORT_WATERMARK || ''}`
      }, { quoted: msg });
    }

    await sock.sendMessage(from, { text: `⏳ *Downloading Facebook video...*\n${SYSTEM?.SHORT_WATERMARK || ''}` }, { quoted: msg });

    const videoUrl = await downloadFacebook(args[0]);
    const buf      = await getBuffer(videoUrl);

    await sock.sendMessage(from, {
      video: buf,
      caption: `📘 *Facebook Video*\n\n📢 *Channel:* ${CHANNEL}\n${SYSTEM?.SHORT_WATERMARK || ''}`,
    }, { quoted: msg });

  } catch (err) {
    console.error('[FB ERROR]:', err.message);
    await sock.sendMessage(from, { text: `❌ *Facebook Download failed!*\n_${err.message}_\n${SYSTEM?.SHORT_WATERMARK || ''}` }, { quoted: msg });
  }
}

// ═══════════════════════════════════════════════════════════════════
//  INSTAGRAM DOWNLOADER
// ═══════════════════════════════════════════════════════════════════

async function downloadInstagram(url) {
  // Method 1 — davidcyril API
  try {
    const res = await axios.get(`https://api.davidcyriltech.my.id/download/instagram?url=${encodeURIComponent(url)}`, { timeout: 25000 });
    const dl = res.data?.result?.[0]?.url || res.data?.result?.url || res.data?.url;
    if (dl) return [{ url: dl, type: 'video' }];
  } catch (_) {}

  // Method 2 — guru API
  try {
    const res = await axios.get(`https://api.guruapi.tech/insta?url=${encodeURIComponent(url)}`, { timeout: 25000 });
    const dl = res.data?.result?.[0]?.url || res.data?.result?.url;
    if (dl) return [{ url: dl, type: 'video' }];
  } catch (_) {}

  throw new Error('All Instagram servers failed');
}

async function instaHandler({ sock, msg, from, args }) {
  try {
    if (!args || !args.length) {
      return sock.sendMessage(from, {
        text: `❌ *Usage:* .insta <Instagram URL>\n\n*.insta https://www.instagram.com/reel/xxxxx*\n${SYSTEM?.SHORT_WATERMARK || ''}`
      }, { quoted: msg });
    }

    await sock.sendMessage(from, { text: `⏳ *Downloading Instagram media...*\n${SYSTEM?.SHORT_WATERMARK || ''}` }, { quoted: msg });

    const results = await downloadInstagram(args[0]);
    const media   = results[0];
    const buf     = await getBuffer(media.url);
    const isVideo = media.type === 'video' || media.url?.includes('.mp4');

    if (isVideo) {
      await sock.sendMessage(from, {
        video: buf,
        caption: `📸 *Instagram Video*\n\n📢 *Channel:* ${CHANNEL}\n${SYSTEM?.SHORT_WATERMARK || ''}`,
      }, { quoted: msg });
    } else {
      await sock.sendMessage(from, {
        image: buf,
        caption: `📸 *Instagram Image*\n\n📢 *Channel:* ${CHANNEL}\n${SYSTEM?.SHORT_WATERMARK || ''}`,
      }, { quoted: msg });
    }

  } catch (err) {
    console.error('[INSTA ERROR]:', err.message);
    await sock.sendMessage(from, { text: `❌ *Instagram Download failed!*\n_${err.message}_\n${SYSTEM?.SHORT_WATERMARK || ''}` }, { quoted: msg });
  }
}

// ═══════════════════════════════════════════════════════════════════
//  CAPCUT & INSHOT DOWNLOADER
// ═══════════════════════════════════════════════════════════════════

async function downloadCapcut(url) {
  try {
    const res = await axios.get(`https://api.davidcyriltech.my.id/download/capcut?url=${encodeURIComponent(url)}`, { timeout: 25000 });
    const dl = res.data?.result?.video || res.data?.result?.url;
    if (dl) return dl;
  } catch (_) {}

  throw new Error('CapCut download failed');
}

async function capcutHandler({ sock, msg, from, args }) {
  try {
    if (!args || !args.length) {
      return sock.sendMessage(from, {
        text: `❌ *Usage:* .capcut <CapCut URL>\n\n${SYSTEM?.SHORT_WATERMARK || ''}`
      }, { quoted: msg });
    }

    await sock.sendMessage(from, { text: `⏳ *Downloading CapCut template...*\n${SYSTEM?.SHORT_WATERMARK || ''}` }, { quoted: msg });

    const videoUrl = await downloadCapcut(args[0]);
    const buf      = await getBuffer(videoUrl);

    await sock.sendMessage(from, {
      video: buf,
      caption: `✂️ *CapCut Template*\n\n📢 *Channel:* ${CHANNEL}\n${SYSTEM?.SHORT_WATERMARK || ''}`,
    }, { quoted: msg });

  } catch (err) {
    console.error('[CAPCUT ERROR]:', err.message);
    await sock.sendMessage(from, { text: `❌ *CapCut Download failed!*\n_${err.message}_\n${SYSTEM?.SHORT_WATERMARK || ''}` }, { quoted: msg });
  }
}

async function inshotHandler({ sock, msg, from, args }) {
  return capcutHandler({ sock, msg, from, args });
}

// ═══════════════════════════════════════════════════════════════════
//  EXPORT DISPATCHER
// ═══════════════════════════════════════════════════════════════════

export default [
  { command: 'tiktok',   handler: tiktokHandler },
  { command: 'tt',       handler: tiktokHandler },
  { command: 'fb',       handler: fbHandler     },
  { command: 'facebook', handler: fbHandler     },
  { command: 'insta',    handler: instaHandler  },
  { command: 'ig',       handler: instaHandler  },
  { command: 'capcut',   handler: capcutHandler },
  { command: 'inshot',   handler: inshotHandler }
];

