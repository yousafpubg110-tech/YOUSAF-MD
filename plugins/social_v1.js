/*
╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃   YOUSAF-BALOCH-MD  •  social_v1       ┃
┃  Commands: tiktok fb insta             ┃
┃            capcut inshot               ┃
┃        Created by MR YOUSAF BALOCH     ┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
*/
import axios from 'axios';
import { OWNER, SYSTEM } from '../config.js';

const CHANNEL = OWNER.CHANNEL;

async function getBuffer(url) {
  const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 60000 });
  return Buffer.from(res.data);
}

// ═══════════════════════════════════════════════════════════════════
//  TIKTOK
// ═══════════════════════════════════════════════════════════════════

async function downloadTikTok(url) {
  // Method 1 — tikwm
  try {
    const res = await axios.get(
      `https://tikwm.com/api/?url=${encodeURIComponent(url)}`,
      { timeout: 30000 }
    );
    const d = res.data?.data;
    if (d?.play) return { url: d.play, title: d.title || 'TikTok Video' };
  } catch (_) {}

  // Method 2 — tikdown
  try {
    const res = await axios.get(
      `https://api.tikdown.org/api/download?url=${encodeURIComponent(url)}`,
      { timeout: 30000 }
    );
    if (res.data?.success && res.data?.video) {
      return { url: res.data.video, title: res.data.title || 'TikTok Video' };
    }
  } catch (_) {}

  // Method 3 — cobalt
  try {
    const res = await axios.post('https://api.cobalt.tools/', {
      url,
      downloadMode: 'auto',
    }, {
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      timeout: 30000,
    });
    const dlUrl = res.data?.url || res.data?.tunnel;
    if (dlUrl) return { url: dlUrl, title: 'TikTok Video' };
  } catch (_) {}

  throw new Error('All TikTok download methods failed');
}

async function tiktokHandler({ sock, msg, from, args }) {
  try {
    if (!args?.length) {
      return msg.reply(
        `❌ *Please provide a TikTok URL!*\n\n` +
        `*.tiktok https://vm.tiktok.com/xxxxx*\n` +
        `${SYSTEM.SHORT_WATERMARK}`
      );
    }
    await msg.react('🎵');
    await msg.reply(`⏳ *Downloading TikTok video...*\n${SYSTEM.SHORT_WATERMARK}`);

    const data = await downloadTikTok(args[0]);
    const buf  = await getBuffer(data.url);

    await sock.sendMessage(from, {
      video:   buf,
      caption: `🎵 *${data.title}*\n\n📢 *Channel:* ${CHANNEL}\n${SYSTEM.SHORT_WATERMARK}`,
    }, { quoted: msg });
    await msg.react('✅');
  } catch (err) {
    console.error('[TIKTOK ERROR]:', err.message);
    await msg.react('❌');
    await msg.reply(`❌ *Download failed!*\n_${err.message}_\n${SYSTEM.SHORT_WATERMARK}`);
  }
}

// ═══════════════════════════════════════════════════════════════════
//  FACEBOOK
// ═══════════════════════════════════════════════════════════════════

async function downloadFacebook(url) {
  // Method 1 — getmyfb
  try {
    const res = await axios.post(
      'https://getmyfb.com/api/info',
      `url=${encodeURIComponent(url)}`,
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 30000,
      }
    );
    const hd = res.data?.links?.Download_HD || res.data?.links?.Download_SD;
    if (hd) return hd;
  } catch (_) {}

  // Method 2 — nexoracle
  try {
    const res = await axios.get(
      `https://api.nexoracle.com/downloader/facebook?apikey=free_key@maher_apis&url=${encodeURIComponent(url)}`,
      { timeout: 30000 }
    );
    const v = res.data?.result?.video || res.data?.result?.hd;
    if (v) return v;
  } catch (_) {}

  // Method 3 — cobalt
  try {
    const res = await axios.post('https://api.cobalt.tools/', {
      url,
      downloadMode: 'auto',
    }, {
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      timeout: 30000,
    });
    const dlUrl = res.data?.url || res.data?.tunnel;
    if (dlUrl) return dlUrl;
  } catch (_) {}

  throw new Error('All Facebook download methods failed');
}

async function fbHandler({ sock, msg, from, args }) {
  try {
    if (!args?.length) {
      return msg.reply(
        `❌ *Please provide a Facebook video URL!*\n\n` +
        `*.fb https://fb.watch/xxxxx*\n` +
        `${SYSTEM.SHORT_WATERMARK}`
      );
    }
    await msg.react('📘');
    await msg.reply(`⏳ *Downloading Facebook video...*\n${SYSTEM.SHORT_WATERMARK}`);

    const videoUrl = await downloadFacebook(args[0]);
    const buf      = await getBuffer(videoUrl);

    await sock.sendMessage(from, {
      video:   buf,
      caption: `📘 *Facebook Video*\n\n📢 *Channel:* ${CHANNEL}\n${SYSTEM.SHORT_WATERMARK}`,
    }, { quoted: msg });
    await msg.react('✅');
  } catch (err) {
    console.error('[FB ERROR]:', err.message);
    await msg.react('❌');
    await msg.reply(`❌ *Download failed!*\n_${err.message}_\n${SYSTEM.SHORT_WATERMARK}`);
  }
}

// ═══════════════════════════════════════════════════════════════════
//  INSTAGRAM
// ═══════════════════════════════════════════════════════════════════

async function downloadInstagram(url) {
  // Method 1 — cobalt
  try {
    const res = await axios.post('https://api.cobalt.tools/', {
      url,
      downloadMode: 'auto',
    }, {
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      timeout: 30000,
    });
    const dlUrl = res.data?.url || res.data?.tunnel;
    if (dlUrl) return [{ url: dlUrl, type: 'video' }];
  } catch (_) {}

  // Method 2 — nexoracle
  try {
    const res = await axios.get(
      `https://api.nexoracle.com/downloader/instagram?apikey=free_key@maher_apis&url=${encodeURIComponent(url)}`,
      { timeout: 30000 }
    );
    if (res.data?.result?.length > 0) return res.data.result;
  } catch (_) {}

  // Method 3 — insta-dl api
  try {
    const res = await axios.get(
      `https://api.siputzx.my.id/api/d/instagram?url=${encodeURIComponent(url)}`,
      { timeout: 30000 }
    );
    if (res.data?.data) {
      return [{ url: res.data.data, type: 'video' }];
    }
  } catch (_) {}

  throw new Error('All Instagram download methods failed');
}

async function instaHandler({ sock, msg, from, args }) {
  try {
    if (!args?.length) {
      return msg.reply(
        `❌ *Please provide an Instagram URL!*\n\n` +
        `*.insta https://www.instagram.com/p/xxxxx*\n` +
        `*.ig https://www.instagram.com/reel/xxxxx*\n` +
        `${SYSTEM.SHORT_WATERMARK}`
      );
    }
    await msg.react('📸');
    await msg.reply(`⏳ *Downloading Instagram media...*\n${SYSTEM.SHORT_WATERMARK}`);

    const results = await downloadInstagram(args[0]);
    const media   = results[0];
    const buf     = await getBuffer(media.url);
    const isVideo = media.type === 'video' || media.url?.includes('.mp4');

    if (isVideo) {
      await sock.sendMessage(from, {
        video:   buf,
        caption: `📸 *Instagram Video*\n\n📢 *Channel:* ${CHANNEL}\n${SYSTEM.SHORT_WATERMARK}`,
      }, { quoted: msg });
    } else {
      await sock.sendMessage(from, {
        image:   buf,
        caption: `📸 *Instagram Image*\n\n📢 *Channel:* ${CHANNEL}\n${SYSTEM.SHORT_WATERMARK}`,
      }, { quoted: msg });
    }
    await msg.react('✅');
  } catch (err) {
    console.error('[INSTA ERROR]:', err.message);
    await msg.react('❌');
    await msg.reply(`❌ *Download failed!*\n_${err.message}_\n${SYSTEM.SHORT_WATERMARK}`);
  }
}

// ═══════════════════════════════════════════════════════════════════
//  CAPCUT
// ═══════════════════════════════════════════════════════════════════

async function downloadCapcut(url) {
  // Method 1 — cobalt
  try {
    const res = await axios.post('https://api.cobalt.tools/', {
      url,
      downloadMode: 'auto',
    }, {
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      timeout: 30000,
    });
    const dlUrl = res.data?.url || res.data?.tunnel;
    if (dlUrl) return dlUrl;
  } catch (_) {}

  // Method 2 — nexoracle
  try {
    const res = await axios.get(
      `https://api.nexoracle.com/downloader/capcut?apikey=free_key@maher_apis&url=${encodeURIComponent(url)}`,
      { timeout: 30000 }
    );
    const v = res.data?.result?.video;
    if (v) return v;
  } catch (_) {}

  throw new Error('All CapCut download methods failed');
}

async function capcutHandler({ sock, msg, from, args }) {
  try {
    if (!args?.length) {
      return msg.reply(
        `❌ *Please provide a CapCut template URL!*\n\n` +
        `*.capcut https://www.capcut.com/t/xxxxx*\n` +
        `${SYSTEM.SHORT_WATERMARK}`
      );
    }
    await msg.react('✂️');
    await msg.reply(`⏳ *Downloading CapCut template...*\n${SYSTEM.SHORT_WATERMARK}`);

    const videoUrl = await downloadCapcut(args[0]);
    const buf      = await getBuffer(videoUrl);

    await sock.sendMessage(from, {
      video:   buf,
      caption: `✂️ *CapCut Template*\n\n📢 *Channel:* ${CHANNEL}\n${SYSTEM.SHORT_WATERMARK}`,
    }, { quoted: msg });
    await msg.react('✅');
  } catch (err) {
    console.error('[CAPCUT ERROR]:', err.message);
    await msg.react('❌');
    await msg.reply(`❌ *Download failed!*\n_${err.message}_\n${SYSTEM.SHORT_WATERMARK}`);
  }
}

// ═══════════════════════════════════════════════════════════════════
//  INSHOT
// ═══════════════════════════════════════════════════════════════════

async function inshotHandler({ sock, msg, from, args }) {
  try {
    if (!args?.length) {
      return msg.reply(
        `❌ *Please provide an Inshot share URL!*\n\n` +
        `*.inshot https://inshot.com/share/xxxxx*\n` +
        `${SYSTEM.SHORT_WATERMARK}`
      );
    }
    await msg.react('🎬');
    await msg.reply(`⏳ *Downloading Inshot video...*\n${SYSTEM.SHORT_WATERMARK}`);

    let videoUrl = null;
    try {
      const res = await axios.get(
        `https://api.nexoracle.com/downloader/inshot?apikey=free_key@maher_apis&url=${encodeURIComponent(args[0])}`,
        { timeout: 30000 }
      );
      videoUrl = res.data?.result?.video;
    } catch (_) {}

    if (!videoUrl) throw new Error('Could not fetch Inshot video');

    const buf = await getBuffer(videoUrl);
    await sock.sendMessage(from, {
      video:   buf,
      caption: `🎬 *Inshot Video*\n\n📢 *Channel:* ${CHANNEL}\n${SYSTEM.SHORT_WATERMARK}`,
    }, { quoted: msg });
    await msg.react('✅');
  } catch (err) {
    console.error('[INSHOT ERROR]:', err.message);
    await msg.react('❌');
    await msg.reply(`❌ *Download failed!*\n_${err.message}_\n${SYSTEM.SHORT_WATERMARK}`);
  }
}

export default [
  { command: ['tiktok', 'tt'],    name: 'tiktok',  category: 'Downloader', description: 'Download TikTok videos',     usage: '.tiktok <url>',   cooldown: 15, handler: tiktokHandler },
  { command: ['fb', 'facebook'],  name: 'fb',      category: 'Downloader', description: 'Download Facebook videos',   usage: '.fb <url>',       cooldown: 15, handler: fbHandler     },
  { command: ['insta', 'ig'],     name: 'insta',   category: 'Downloader', description: 'Download Instagram media',   usage: '.insta <url>',    cooldown: 15, handler: instaHandler  },
  { command: ['capcut'],          name: 'capcut',  category: 'Downloader', description: 'Download CapCut templates',  usage: '.capcut <url>',   cooldown: 15, handler: capcutHandler },
  { command: ['inshot'],          name: 'inshot',  category: 'Downloader', description: 'Download Inshot videos',     usage: '.inshot <url>',   cooldown: 15, handler: inshotHandler },
];
