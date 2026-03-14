/*
╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃   YOUSAF-BALOCH-MD  •  apk_tools_v1    ┃
┃  Commands: apk modapk playstore        ┃
┃        Created by MR YOUSAF BALOCH     ┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
*/
import axios from 'axios';
import { load as $ } from 'cheerio';
import { OWNER, SYSTEM } from '../config.js';

const CH = `\n📢 *Channel:* ${OWNER.CHANNEL}`;
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

// ═══════════════════════════════════════════════════════════════════
//  SEARCH FUNCTIONS — 3 sources each
// ═══════════════════════════════════════════════════════════════════

async function searchApkMody(query) {
  const res = await axios.get(
    `https://apkmody.io/?s=${encodeURIComponent(query)}`,
    { timeout: 15000, headers: { 'User-Agent': UA } }
  );
  const doc  = $(res.data);
  const apps = [];
  doc('.post').slice(0, 5).each((_, el) => {
    const title   = doc(el).find('.entry-title a').text().trim();
    const link    = doc(el).find('.entry-title a').attr('href');
    const version = doc(el).find('.version').text().trim();
    if (title && link) apps.push({ title, url: link, version });
  });
  return apps;
}

async function searchApkPure(query) {
  const res = await axios.get(
    `https://apkpure.com/search?q=${encodeURIComponent(query)}`,
    { timeout: 15000, headers: { 'User-Agent': UA } }
  );
  const doc  = $(res.data);
  const apps = [];
  doc('.search-result-item').slice(0, 5).each((_, el) => {
    const title   = doc(el).find('p.intro-title').text().trim();
    const href    = doc(el).find('a').attr('href');
    const link    = href ? (href.startsWith('http') ? href : `https://apkpure.com${href}`) : null;
    const version = doc(el).find('.ver-info-top span').first().text().trim();
    const rating  = doc(el).find('.rating').text().trim();
    if (title && link) apps.push({ title, url: link, version, rating });
  });
  return apps;
}

async function searchApkCombo(query, isMod = false) {
  let apps = [];

  try { apps = await searchApkMody(isMod ? `${query} mod premium` : query); } catch (_) {}
  if (!apps.length) { try { apps = await searchApkPure(query); } catch (_) {} }
  if (!apps.length && isMod) { try { apps = await searchApkMody(`${query} modded unlocked`); } catch (_) {} }

  return apps;
}

// ═══════════════════════════════════════════════════════════════════
//  HANDLERS
// ═══════════════════════════════════════════════════════════════════

async function apkHandler({ msg, args }) {
  try {
    if (!args?.length) return msg.reply(
      `❌ *Please provide an app name!*\n\n*.apk WhatsApp*\n*.apk Spotify*\n${CH}\n${SYSTEM.SHORT_WATERMARK}`
    );
    const query = args.join(' ');
    await msg.react('📱');
    await msg.reply(`⏳ *Searching APK for: ${query}...*`);

    const apps = await searchApkCombo(query, false);
    if (!apps.length) {
      await msg.react('❌');
      return msg.reply(`❌ *No APK found for _${query}_!*\n💡 Try different spelling.\n${CH}\n${SYSTEM.SHORT_WATERMARK}`);
    }

    let result = `╭━━━『 📱 *APK SEARCH* 』━━━╮\n\n🔍 *Results for: ${query}*\n`;
    apps.forEach((a, i) => {
      result += `\n${i+1}. *${a.title}*\n   📦 ${a.version || 'Latest'}\n   🔗 ${a.url}\n`;
    });
    result += `\n╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n💡 Copy link to download\n${CH}\n${SYSTEM.SHORT_WATERMARK}`;

    await msg.reply(result);
    await msg.react('✅');
  } catch (e) {
    console.error('[APK]:', e.message);
    await msg.react('❌');
    await msg.reply(`❌ *Failed!*\n_${e.message}_\n${SYSTEM.SHORT_WATERMARK}`);
  }
}

async function modApkHandler({ msg, args }) {
  try {
    if (!args?.length) return msg.reply(
      `❌ *Please provide an app name!*\n\n*.modapk CapCut Pro*\n*.modapk Spotify Premium*\n${CH}\n${SYSTEM.SHORT_WATERMARK}`
    );
    const query = args.join(' ');
    await msg.react('💎');
    await msg.reply(`⏳ *Searching Mod APK for: ${query}...*`);

    const apps = await searchApkCombo(query, true);
    if (!apps.length) {
      await msg.react('❌');
      return msg.reply(`❌ *No Mod APK found for _${query}_!*\n💡 Try: *.apk ${query}*\n${CH}\n${SYSTEM.SHORT_WATERMARK}`);
    }

    let result = `╭━━━『 💎 *MOD APK* 』━━━╮\n\n🔍 *Results for: ${query}*\n`;
    apps.forEach((a, i) => {
      result += `\n${i+1}. *${a.title}*\n   📦 ${a.version || 'Latest'}\n   🔗 ${a.url}\n`;
    });
    result += `\n╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n⚠️ _For educational purposes only_\n${CH}\n${SYSTEM.SHORT_WATERMARK}`;

    await msg.reply(result);
    await msg.react('✅');
  } catch (e) {
    console.error('[MODAPK]:', e.message);
    await msg.react('❌');
    await msg.reply(`❌ *Failed!*\n_${e.message}_\n${SYSTEM.SHORT_WATERMARK}`);
  }
}

async function playstoreHandler({ msg, args }) {
  try {
    if (!args?.length) return msg.reply(
      `❌ *Please provide an app name!*\n\n*.playstore WhatsApp*\n*.playstore YouTube*\n${CH}\n${SYSTEM.SHORT_WATERMARK}`
    );
    const query = args.join(' ');
    await msg.react('🛒');
    await msg.reply(`⏳ *Searching Play Store for: ${query}...*`);

    const apps = await searchApkPure(query);
    if (!apps.length) {
      await msg.react('❌');
      return msg.reply(`❌ *No apps found for _${query}_!*\n${CH}\n${SYSTEM.SHORT_WATERMARK}`);
    }

    let result = `╭━━━『 🛒 *PLAY STORE* 』━━━╮\n\n🔍 *Results for: ${query}*\n`;
    apps.forEach((a, i) => {
      result +=
        `\n${i+1}. *${a.title}*\n` +
        `   ⭐ ${a.rating || 'N/A'}\n` +
        `   📦 ${a.version || 'Latest'}\n` +
        `   🔗 ${a.url}\n`;
    });
    result += `\n╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n${CH}\n${SYSTEM.SHORT_WATERMARK}`;

    await msg.reply(result);
    await msg.react('✅');
  } catch (e) {
    console.error('[PLAYSTORE]:', e.message);
    await msg.react('❌');
    await msg.reply(`❌ *Failed!*\n_${e.message}_\n${SYSTEM.SHORT_WATERMARK}`);
  }
}

export default [
  { command: ['apk','apkdl'],     name: 'apk',       category: 'Downloader', description: 'Search APK',          usage: '.apk <name>',       cooldown: 10, handler: apkHandler       },
  { command: ['modapk','apkmod'], name: 'modapk',    category: 'Downloader', description: 'Search Mod APK',      usage: '.modapk <name>',    cooldown: 10, handler: modApkHandler    },
  { command: ['playstore'],       name: 'playstore', category: 'Downloader', description: 'Search Play Store',   usage: '.playstore <name>', cooldown: 10, handler: playstoreHandler },
];
