/*
╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃   YOUSAF-BALOCH-MD  •  apk_tools_v1    ┃
┃  Commands: apk, apkdl, modapk,        ┃
┃            apkmod, playstore          ┃
┃        Created by MR YOUSAF BALOCH     ┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
*/
import axios from 'axios';
import { load as $ } from 'cheerio';
import { OWNER, SYSTEM } from '../config.js';

const CH = `\n📢 *Channel:* ${OWNER?.CHANNEL || ''}`;
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

// ═══════════════════════════════════════════════════════════════════
//  SEARCH FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

async function searchApkPure(query) {
  try {
    const res = await axios.get(
      `https://apkpure.com/search?q=${encodeURIComponent(query)}`,
      { timeout: 15000, headers: { 'User-Agent': UA } }
    );
    const doc = $(res.data);
    const apps = [];
    doc('.search-result-item').slice(0, 5).each((_, el) => {
      const title = doc(el).find('p.intro-title').text().trim();
      const href = doc(el).find('a').attr('href');
      const link = href ? (href.startsWith('http') ? href : `https://apkpure.com${href}`) : null;
      const version = doc(el).find('.ver-info-top span').first().text().trim();
      const rating = doc(el).find('.rating').text().trim();
      if (title && link) apps.push({ title, url: link, version, rating });
    });
    return apps;
  } catch (e) {
    return [];
  }
}

async function searchApkCombo(query, isMod = false) {
  let apps = [];
  try {
    const searchUrl = isMod 
      ? `https://apkmody.io/?s=${encodeURIComponent(query + ' mod')}`
      : `https://apkmody.io/?s=${encodeURIComponent(query)}`;

    const res = await axios.get(searchUrl, { timeout: 15000, headers: { 'User-Agent': UA } });
    const doc = $(res.data);
    
    doc('.post').slice(0, 5).each((_, el) => {
      const title = doc(el).find('.entry-title a').text().trim();
      const link = doc(el).find('.entry-title a').attr('href');
      const version = doc(el).find('.version').text().trim();
      if (title && link) apps.push({ title, url: link, version });
    });
  } catch (_) {}

  if (!apps.length) {
    apps = await searchApkPure(query);
  }

  return apps;
}

// ═══════════════════════════════════════════════════════════════════
//  HANDLERS
// ═══════════════════════════════════════════════════════════════════

async function apkHandler({ sock, msg, from, args }) {
  try {
    if (!args?.length) {
      return sock.sendMessage(from, {
        text: `❌ *Please provide an app name!*\n\n💡 *Example:*\n• *.apk WhatsApp*\n• *.apk Spotify*\n${CH}\n${SYSTEM?.SHORT_WATERMARK || ''}`
      }, { quoted: msg });
    }

    const query = args.join(' ');
    await sock.sendMessage(from, { text: `📱 *Searching APK for: ${query}...*\n${SYSTEM?.SHORT_WATERMARK || ''}` }, { quoted: msg });

    const apps = await searchApkCombo(query, false);
    if (!apps.length) {
      return sock.sendMessage(from, {
        text: `❌ *No APK found for _${query}_!*\n💡 Try different spelling.\n${CH}\n${SYSTEM?.SHORT_WATERMARK || ''}`
      }, { quoted: msg });
    }

    let result = `╭━━━『 📱 *APK SEARCH* 』━━━╮\n\n🔍 *Results for: ${query}*\n`;
    apps.forEach((a, i) => {
      result += `\n${i + 1}. *${a.title}*\n   📦 *Version:* ${a.version || 'Latest'}\n   🔗 *Link:* ${a.url}\n`;
    });
    result += `\n╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n💡 Copy link to open & download\n${CH}\n${SYSTEM?.SHORT_WATERMARK || ''}`;

    await sock.sendMessage(from, { text: result }, { quoted: msg });

  } catch (e) {
    console.error('[APK ERROR]:', e.message);
    await sock.sendMessage(from, { text: `❌ *Failed!*\n_${e.message}_\n${SYSTEM?.SHORT_WATERMARK || ''}` }, { quoted: msg });
  }
}

async function modApkHandler({ sock, msg, from, args }) {
  try {
    if (!args?.length) {
      return sock.sendMessage(from, {
        text: `❌ *Please provide an app name!*\n\n💡 *Example:*\n• *.modapk CapCut Pro*\n• *.modapk Spotify Premium*\n${CH}\n${SYSTEM?.SHORT_WATERMARK || ''}`
      }, { quoted: msg });
    }

    const query = args.join(' ');
    await sock.sendMessage(from, { text: `💎 *Searching Mod APK for: ${query}...*\n${SYSTEM?.SHORT_WATERMARK || ''}` }, { quoted: msg });

    const apps = await searchApkCombo(query, true);
    if (!apps.length) {
      return sock.sendMessage(from, {
        text: `❌ *No Mod APK found for _${query}_!*\n💡 Try: *.apk ${query}*\n${CH}\n${SYSTEM?.SHORT_WATERMARK || ''}`
      }, { quoted: msg });
    }

    let result = `╭━━━『 💎 *MOD APK SEARCH* 』━━━╮\n\n🔍 *Results for: ${query}*\n`;
    apps.forEach((a, i) => {
      result += `\n${i + 1}. *${a.title}*\n   📦 *Version:* ${a.version || 'Latest'}\n   🔗 *Link:* ${a.url}\n`;
    });
    result += `\n╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n⚠️ _For educational purposes only_\n${CH}\n${SYSTEM?.SHORT_WATERMARK || ''}`;

    await sock.sendMessage(from, { text: result }, { quoted: msg });

  } catch (e) {
    console.error('[MODAPK ERROR]:', e.message);
    await sock.sendMessage(from, { text: `❌ *Failed!*\n_${e.message}_\n${SYSTEM?.SHORT_WATERMARK || ''}` }, { quoted: msg });
  }
}

async function playstoreHandler({ sock, msg, from, args }) {
  try {
    if (!args?.length) {
      return sock.sendMessage(from, {
        text: `❌ *Please provide an app name!*\n\n💡 *Example:*\n• *.playstore WhatsApp*\n• *.playstore YouTube*\n${CH}\n${SYSTEM?.SHORT_WATERMARK || ''}`
      }, { quoted: msg });
    }

    const query = args.join(' ');
    await sock.sendMessage(from, { text: `🛒 *Searching Play Store for: ${query}...*\n${SYSTEM?.SHORT_WATERMARK || ''}` }, { quoted: msg });

    const apps = await searchApkPure(query);
    if (!apps.length) {
      return sock.sendMessage(from, {
        text: `❌ *No apps found for _${query}_!*\n${CH}\n${SYSTEM?.SHORT_WATERMARK || ''}`
      }, { quoted: msg });
    }

    let result = `╭━━━『 🛒 *PLAY STORE SEARCH* 』━━━╮\n\n🔍 *Results for: ${query}*\n`;
    apps.forEach((a, i) => {
      result += `\n${i + 1}. *${a.title}*\n   ⭐ *Rating:* ${a.rating || 'N/A'}\n   📦 *Version:* ${a.version || 'Latest'}\n   🔗 *Link:* ${a.url}\n`;
    });
    result += `\n╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n${CH}\n${SYSTEM?.SHORT_WATERMARK || ''}`;

    await sock.sendMessage(from, { text: result }, { quoted: msg });

  } catch (e) {
    console.error('[PLAYSTORE ERROR]:', e.message);
    await sock.sendMessage(from, { text: `❌ *Failed!*\n_${e.message}_\n${SYSTEM?.SHORT_WATERMARK || ''}` }, { quoted: msg });
  }
}

// ═══════════════════════════════════════════════════════════════════
//  EXPORTS
// ═══════════════════════════════════════════════════════════════════

export default [
  { command: 'apk',       name: 'apk',       category: 'Downloader', description: 'Search APK',        usage: '.apk <name>',       cooldown: 5, handler: apkHandler       },
  { command: 'apkdl',     name: 'apk',       category: 'Downloader', description: 'Search APK',        usage: '.apkdl <name>',     cooldown: 5, handler: apkHandler       },
  { command: 'modapk',    name: 'modapk',    category: 'Downloader', description: 'Search Mod APK',    usage: '.modapk <name>',    cooldown: 5, handler: modApkHandler    },
  { command: 'apkmod',    name: 'modapk',    category: 'Downloader', description: 'Search Mod APK',    usage: '.apkmod <name>',    cooldown: 5, handler: modApkHandler    },
  { command: 'playstore', name: 'playstore', category: 'Downloader', description: 'Search Play Store', usage: '.playstore <name>', cooldown: 5, handler: playstoreHandler },
];

