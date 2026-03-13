/*
╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃   YOUSAF-BALOCH-MD  •  apk_tools_v1    ┃
┃  Commands: apk modapk playstore        ┃
┃            apkmod apkdl                ┃
┃        Created by MR YOUSAF BALOCH     ┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
*/
import axios from 'axios';
import { load as cheerioLoad } from 'cheerio';
import { OWNER, SYSTEM } from '../config.js';

const DL_FOOTER = `\n📢 *Channel:* ${OWNER.CHANNEL}`;

function safeUrl(u) {
  try {
    const p = new URL(u);
    return ['https:', 'http:'].includes(p.protocol) ? p.href : null;
  } catch { return null; }
}

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept-Language': 'en-US,en;q=0.9',
};

// ═══════════════════════════════════════════════════════════════════
//  SEARCH FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

async function searchApkMody(query) {
  const url = safeUrl(`https://apkmody.io/?s=${encodeURIComponent(query)}`);
  if (!url) throw new Error('bad query');
  const res = await axios.get(url, { timeout: 15000, headers: HEADERS });
  const $   = cheerioLoad(res.data);
  const apps = [];
  $('.post').slice(0, 5).each((_, el) => {
    const title   = $(el).find('.entry-title a').text().trim();
    const link    = $(el).find('.entry-title a').attr('href');
    const version = $(el).find('.version').text().trim();
    if (title && link) apps.push({ title, url: link, version });
  });
  return apps;
}

async function searchApkPure(query) {
  const url = safeUrl(`https://apkpure.com/search?q=${encodeURIComponent(query)}`);
  if (!url) throw new Error('bad query');
  const res = await axios.get(url, { timeout: 15000, headers: HEADERS });
  const $   = cheerioLoad(res.data);
  const apps = [];
  $('.search-result-item').slice(0, 5).each((_, el) => {
    const title   = $(el).find('p.intro-title').text().trim();
    const href    = $(el).find('a').attr('href');
    const link    = href ? (href.startsWith('http') ? href : `https://apkpure.com${href}`) : null;
    const version = $(el).find('.ver-info-top span').first().text().trim();
    const rating  = $(el).find('.rating').text().trim();
    if (title && link) apps.push({ title, url: link, version, rating });
  });
  return apps;
}

async function searchApkCombo(query, isMod = false) {
  let apps = [];

  // Method 1 — ApkMody
  try {
    apps = await searchApkMody(isMod ? query + ' mod premium' : query);
  } catch (_) {}

  // Method 2 — ApkPure fallback
  if (!apps.length) {
    try {
      apps = await searchApkPure(query);
    } catch (_) {}
  }

  // Method 3 — ApkMody with different query
  if (!apps.length && isMod) {
    try {
      apps = await searchApkMody(query + ' modded unlocked');
    } catch (_) {}
  }

  return apps;
}

// ═══════════════════════════════════════════════════════════════════
//  HANDLERS
// ═══════════════════════════════════════════════════════════════════

async function apkHandler({ msg, args }) {
  try {
    if (!args?.length) {
      return msg.reply(
        `❌ *Please provide an app name!*\n\n` +
        `*.apk WhatsApp*\n*.apk Spotify*\n` +
        `${DL_FOOTER}\n${SYSTEM.SHORT_WATERMARK}`
      );
    }

    const query = args.join(' ');
    await msg.react('📱');
    await msg.reply(`⏳ *Searching APK for: ${query}...*`);

    const apps = await searchApkCombo(query, false);

    if (!apps.length) {
      await msg.react('❌');
      return msg.reply(
        `❌ *No APK found for _${query}_!*\n\n` +
        `💡 Try different spelling or app name.\n` +
        `${DL_FOOTER}\n${SYSTEM.SHORT_WATERMARK}`
      );
    }

    let result = `╭━━━『 📱 *APK SEARCH* 』━━━╮\n\n🔍 *Results for: ${query}*\n`;
    apps.forEach((a, i) => {
      result +=
        `\n${i + 1}. *${a.title}*\n` +
        `   📦 Version: ${a.version || 'Latest'}\n` +
        `   🔗 ${a.url}\n`;
    });
    result += `\n╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n💡 Copy the link to download${DL_FOOTER}\n${SYSTEM.SHORT_WATERMARK}`;

    await msg.reply(result);
    await msg.react('✅');
  } catch (err) {
    console.error('[APK ERROR]:', err.message);
    await msg.react('❌');
    await msg.reply(`❌ *Failed!*\n_${err.message}_\n${SYSTEM.SHORT_WATERMARK}`);
  }
}

async function modApkHandler({ msg, args }) {
  try {
    if (!args?.length) {
      return msg.reply(
        `❌ *Please provide an app name!*\n\n` +
        `*.modapk CapCut Pro*\n*.modapk Spotify Premium*\n` +
        `${DL_FOOTER}\n${SYSTEM.SHORT_WATERMARK}`
      );
    }

    const query = args.join(' ');
    await msg.react('💎');
    await msg.reply(`⏳ *Searching Mod APK for: ${query}...*`);

    const apps = await searchApkCombo(query, true);

    if (!apps.length) {
      await msg.react('❌');
      return msg.reply(
        `❌ *No Mod APK found for _${query}_!*\n\n` +
        `💡 Try: *.apk ${query}* for original version.\n` +
        `${DL_FOOTER}\n${SYSTEM.SHORT_WATERMARK}`
      );
    }

    let result = `╭━━━『 💎 *MOD APK SEARCH* 』━━━╮\n\n🔍 *Results for: ${query}*\n`;
    apps.forEach((a, i) => {
      result +=
        `\n${i + 1}. *${a.title}*\n` +
        `   📦 Version: ${a.version || 'Latest'}\n` +
        `   🔗 ${a.url}\n`;
    });
    result +=
      `\n╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n` +
      `⚠️ _Mod APKs are for educational purposes only_\n` +
      `${DL_FOOTER}\n${SYSTEM.SHORT_WATERMARK}`;

    await msg.reply(result);
    await msg.react('✅');
  } catch (err) {
    console.error('[MODAPK ERROR]:', err.message);
    await msg.react('❌');
    await msg.reply(`❌ *Failed!*\n_${err.message}_\n${SYSTEM.SHORT_WATERMARK}`);
  }
}

async function playstoreHandler({ msg, args }) {
  try {
    if (!args?.length) {
      return msg.reply(
        `❌ *Please provide an app name!*\n\n` +
        `*.playstore WhatsApp*\n*.playstore YouTube*\n` +
        `${DL_FOOTER}\n${SYSTEM.SHORT_WATERMARK}`
      );
    }

    const query = args.join(' ');
    await msg.react('🛒');
    await msg.reply(`⏳ *Searching Play Store for: ${query}...*`);

    const apps = await searchApkPure(query);

    if (!apps.length) {
      await msg.react('❌');
      return msg.reply(
        `❌ *No apps found for _${query}_!*\n` +
        `${DL_FOOTER}\n${SYSTEM.SHORT_WATERMARK}`
      );
    }

    let result = `╭━━━『 🛒 *PLAY STORE SEARCH* 』━━━╮\n\n🔍 *Results for: ${query}*\n`;
    apps.forEach((a, i) => {
      result +=
        `\n${i + 1}. *${a.title}*\n` +
        `   ⭐ Rating: ${a.rating || 'N/A'}\n` +
        `   📦 Version: ${a.version || 'Latest'}\n` +
        `   🔗 ${a.url}\n`;
    });
    result += `\n╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n${DL_FOOTER}\n${SYSTEM.SHORT_WATERMARK}`;

    await msg.reply(result);
    await msg.react('✅');
  } catch (err) {
    console.error('[PLAYSTORE ERROR]:', err.message);
    await msg.react('❌');
    await msg.reply(`❌ *Failed!*\n_${err.message}_\n${SYSTEM.SHORT_WATERMARK}`);
  }
}

export default [
  { command: ['apk', 'apkdl'],    name: 'apk',       category: 'Downloader', description: 'Search APK files',        usage: '.apk <app name>',       cooldown: 10, handler: apkHandler       },
  { command: ['modapk', 'apkmod'],name: 'modapk',    category: 'Downloader', description: 'Search Mod APKs',         usage: '.modapk <app name>',    cooldown: 10, handler: modApkHandler    },
  { command: ['playstore'],       name: 'playstore', category: 'Downloader', description: 'Search Play Store apps',  usage: '.playstore <app name>', cooldown: 10, handler: playstoreHandler },
];
