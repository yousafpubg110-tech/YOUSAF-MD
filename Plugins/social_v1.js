/*
╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃   YOUSAF-BALOCH-MD  •  social_v1       ┃
┃  Commands: tiktok fb insta             ┃
┃            capcut inshot               ┃
┃        Created by MR YOUSAF BALOCH     ┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
*/
import axios from 'axios';
import { SYSTEM } from '../config.js';

// ─── TikTok Downloader ────────────────────────────────────────────────────────
async function tiktokHandler({sock, msg, from, args}) {
  try {
    if (!args?.length) return msg.reply(`❌ *Please provide a TikTok URL!*\n\n.tiktok https://vm.tiktok.com/xxxxx\n.tt https://www.tiktok.com/@user/video/xxxxx\n${SYSTEM.SHORT_WATERMARK}`);
    await msg.react('🎵');
    const url = args[0];

    await msg.reply(`⏳ *Downloading TikTok video...*\n${SYSTEM.SHORT_WATERMARK}`);
    await msg.react('⬇️');

    // Method 1: TikTok API
    let videoData = null;
    try {
      const apiRes = await axios.get(`https://api.tikdown.org/api/download?url=${encodeURIComponent(url)}`, { timeout: 30000 });
      if (apiRes.data?.success && apiRes.data?.video) {
        videoData = { url: apiRes.data.video, title: apiRes.data.title || 'TikTok Video' };
      }
    } catch (_) {}

    // Method 2: Alternative API
    if (!videoData) {
      try {
        const altRes = await axios.get(`https://tikwm.com/api/?url=${encodeURIComponent(url)}`, { timeout: 30000 });
        if (altRes.data?.data?.play) {
          videoData = { url: altRes.data.data.play, title: altRes.data.data.title || 'TikTok Video' };
        }
      } catch (_) {}
    }

    if (!videoData) {
      await msg.react('❌');
      return msg.reply(`❌ *Failed to download TikTok video!*\n\n💡 Make sure the URL is valid and public.\n${SYSTEM.SHORT_WATERMARK}`);
    }

    const videoBuffer = await axios.get(videoData.url, { responseType: 'arraybuffer', timeout: 60000 });
    await sock.sendMessage(from, {
      video: Buffer.from(videoBuffer.data),
      caption: `🎵 *${videoData.title}*\n\n📢 *Channel:* View Channel\n${SYSTEM.SHORT_WATERMARK}`,
    }, { quoted: msg });
    await msg.react('✅');
  } catch (error) {
    console.error('[TIKTOK ERROR]:', error.message);
    await msg.react('❌');
    await msg.reply(`❌ *Download failed!*\n_${error.message}_\n${SYSTEM.SHORT_WATERMARK}`);
  }
}

// ─── Facebook Downloader ──────────────────────────────────────────────────────
async function fbHandler({sock, msg, from, args}) {
  try {
    if (!args?.length) return msg.reply(`❌ *Please provide a Facebook video URL!*\n\n.fb https://fb.watch/xxxxx\n.facebook https://www.facebook.com/watch?v=xxxxx\n${SYSTEM.SHORT_WATERMARK}`);
    await msg.react('📘');
    const url = args[0];

    await msg.reply(`⏳ *Downloading Facebook video...*\n${SYSTEM.SHORT_WATERMARK}`);
    await msg.react('⬇️');

    let videoUrl = null;
    try {
      const apiRes = await axios.get(`https://api.nexoracle.com/downloader/facebook?apikey=free_key@maher_apis&url=${encodeURIComponent(url)}`, { timeout: 30000 });
      if (apiRes.data?.result?.video) {
        videoUrl = apiRes.data.result.video;
      }
    } catch (_) {}

    if (!videoUrl) {
      await msg.react('❌');
      return msg.reply(`❌ *Failed to download Facebook video!*\n\n💡 Try a different URL or check if the video is public.\n${SYSTEM.SHORT_WATERMARK}`);
    }

    const videoBuffer = await axios.get(videoUrl, { responseType: 'arraybuffer', timeout: 60000 });
    await sock.sendMessage(from, {
      video: Buffer.from(videoBuffer.data),
      caption: `📘 *Facebook Video*\n\n📢 *Channel:* View Channel\n${SYSTEM.SHORT_WATERMARK}`,
    }, { quoted: msg });
    await msg.react('✅');
  } catch (error) {
    console.error('[FB ERROR]:', error.message);
    await msg.react('❌');
    await msg.reply(`❌ *Download failed!*\n_${error.message}_\n${SYSTEM.SHORT_WATERMARK}`);
  }
}

// ─── Instagram Downloader ─────────────────────────────────────────────────────
async function instaHandler({sock, msg, from, args}) {
  try {
    if (!args?.length) return msg.reply(`❌ *Please provide an Instagram URL!*\n\n.insta https://www.instagram.com/p/xxxxx\n.ig https://www.instagram.com/reel/xxxxx\n${SYSTEM.SHORT_WATERMARK}`);
    await msg.react('📸');
    const url = args[0];

    await msg.reply(`⏳ *Downloading Instagram media...*\n${SYSTEM.SHORT_WATERMARK}`);
    await msg.react('⬇️');

    let mediaData = null;
    try {
      const apiRes = await axios.get(`https://api.nexoracle.com/downloader/instagram?apikey=free_key@maher_apis&url=${encodeURIComponent(url)}`, { timeout: 30000 });
      if (apiRes.data?.result?.length > 0) {
        mediaData = apiRes.data.result[0];
      }
    } catch (_) {}

    if (!mediaData) {
      await msg.react('❌');
      return msg.reply(`❌ *Failed to download Instagram media!*\n\n💡 Make sure the URL is valid and public.\n${SYSTEM.SHORT_WATERMARK}`);
    }

    const mediaBuffer = await axios.get(mediaData.url, { responseType: 'arraybuffer', timeout: 60000 });
    const isVideo = mediaData.type === 'video';

    if (isVideo) {
      await sock.sendMessage(from, {
        video: Buffer.from(mediaBuffer.data),
        caption: `📸 *Instagram Video*\n\n📢 *Channel:* View Channel\n${SYSTEM.SHORT_WATERMARK}`,
      }, { quoted: msg });
    } else {
      await sock.sendMessage(from, {
        image: Buffer.from(mediaBuffer.data),
        caption: `📸 *Instagram Image*\n\n📢 *Channel:* View Channel\n${SYSTEM.SHORT_WATERMARK}`,
      }, { quoted: msg });
    }
    await msg.react('✅');
  } catch (error) {
    console.error('[INSTA ERROR]:', error.message);
    await msg.react('❌');
    await msg.reply(`❌ *Download failed!*\n_${error.message}_\n${SYSTEM.SHORT_WATERMARK}`);
  }
}

// ─── CapCut Template Downloader ───────────────────────────────────────────────
async function capcutHandler({sock, msg, from, args}) {
  try {
    if (!args?.length) return msg.reply(`❌ *Please provide a CapCut template URL!*\n\n.capcut https://www.capcut.com/t/xxxxx\n${SYSTEM.SHORT_WATERMARK}`);
    await msg.react('✂️');
    const url = args[0];

    await msg.reply(`⏳ *Downloading CapCut template...*\n${SYSTEM.SHORT_WATERMARK}`);
    await msg.react('⬇️');

    let videoUrl = null;
    try {
      const apiRes = await axios.get(`https://api.nexoracle.com/downloader/capcut?apikey=free_key@maher_apis&url=${encodeURIComponent(url)}`, { timeout: 30000 });
      if (apiRes.data?.result?.video) {
        videoUrl = apiRes.data.result.video;
      }
    } catch (_) {}

    if (!videoUrl) {
      await msg.react('❌');
      return msg.reply(`❌ *Failed to download CapCut template!*\n\n💡 Make sure the URL is valid.\n${SYSTEM.SHORT_WATERMARK}`);
    }

    const videoBuffer = await axios.get(videoUrl, { responseType: 'arraybuffer', timeout: 60000 });
    await sock.sendMessage(from, {
      video: Buffer.from(videoBuffer.data),
      caption: `✂️ *CapCut Template*\n\n📢 *Channel:* View Channel\n${SYSTEM.SHORT_WATERMARK}`,
    }, { quoted: msg });
    await msg.react('✅');
  } catch (error) {
    console.error('[CAPCUT ERROR]:', error.message);
    await msg.react('❌');
    await msg.reply(`❌ *Download failed!*\n_${error.message}_\n${SYSTEM.SHORT_WATERMARK}`);
  }
}

// ─── Inshot Video Downloader ──────────────────────────────────────────────────
async function inshotHandler({sock, msg, from, args}) {
  try {
    if (!args?.length) return msg.reply(`❌ *Please provide an Inshot share URL!*\n\n.inshot https://inshot.com/share/xxxxx\n${SYSTEM.SHORT_WATERMARK}`);
    await msg.react('🎬');
    const url = args[0];

    await msg.reply(`⏳ *Downloading Inshot video...*\n${SYSTEM.SHORT_WATERMARK}`);
    await msg.react('⬇️');

    let videoUrl = null;
    try {
      const apiRes = await axios.get(`https://api.nexoracle.com/downloader/inshot?apikey=free_key@maher_apis&url=${encodeURIComponent(url)}`, { timeout: 30000 });
      if (apiRes.data?.result?.video) {
        videoUrl = apiRes.data.result.video;
      }
    } catch (_) {}

    if (!videoUrl) {
      await msg.react('❌');
      return msg.reply(`❌ *Failed to download Inshot video!*\n\n💡 Make sure the URL is valid.\n${SYSTEM.SHORT_WATERMARK}`);
    }

    const videoBuffer = await axios.get(videoUrl, { responseType: 'arraybuffer', timeout: 60000 });
    await sock.sendMessage(from, {
      video: Buffer.from(videoBuffer.data),
      caption: `🎬 *Inshot Video*\n\n📢 *Channel:* View Channel\n${SYSTEM.SHORT_WATERMARK}`,
    }, { quoted: msg });
    await msg.react('✅');
  } catch (error) {
    console.error('[INSHOT ERROR]:', error.message);
    await msg.react('❌');
    await msg.reply(`❌ *Download failed!*\n_${error.message}_\n${SYSTEM.SHORT_WATERMARK}`);
  }
}

export default [
  {command:['tiktok','tt'],   name:'tiktok', category:'Downloader',description:'Download TikTok videos',usage:'.tiktok <url>',cooldown:15,handler:tiktokHandler},
  {command:['fb','facebook'], name:'fb',     category:'Downloader',description:'Download Facebook videos',usage:'.fb <url>',cooldown:15,handler:fbHandler},
  {command:['insta','ig'],    name:'insta',  category:'Downloader',description:'Download Instagram media',usage:'.insta <url>',cooldown:15,handler:instaHandler},
  {command:['capcut'],        name:'capcut', category:'Downloader',description:'Download CapCut templates',usage:'.capcut <url>',cooldown:15,handler:capcutHandler},
  {command:['inshot'],        name:'inshot', category:'Downloader',description:'Download Inshot videos',usage:'.inshot <url>',cooldown:15,handler:inshotHandler},
];
