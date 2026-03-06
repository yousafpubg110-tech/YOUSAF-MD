// ============================================================
//   YOUSAF-MD — TOOLS PLUGIN
//   Google | Wikipedia | TTS | Play Store | Weather | Calc
//   Developer: Muhammad Yousaf Baloch
// ============================================================

'use strict';

const axios   = require('axios');
const cheerio = require('cheerio');
const path    = require('path');
const fs      = require('fs-extra');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync     = promisify(exec);

const TEMP = path.resolve('./temp');
fs.ensureDirSync(TEMP);

// ── HELPERS ────────────────────────────────────────────────

async function googleSearch(query) {
  const res = await axios.get(`https://www.google.com/search?q=${encodeURIComponent(query)}`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
    timeout: 10000,
  });
  const $ = cheerio.load(res.data);
  const results = [];

  $('div.g').each((i, el) => {
    if (i >= 5) return false;
    const title = $(el).find('h3').first().text().trim();
    const link  = $(el).find('a').first().attr('href')?.replace('/url?q=', '').split('&')[0];
    const desc  = $(el).find('.VwiC3b, .yXK7lf').first().text().trim();
    if (title) results.push({ title, link, desc });
  });

  return results;
}

async function wikiSearch(query) {
  const res = await axios.get('https://en.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(query), {
    timeout: 10000,
  });
  return res.data;
}

async function getWeather(city) {
  const res = await axios.get(`https://wttr.in/${encodeURIComponent(city)}?format=j1`, { timeout: 10000 });
  return res.data;
}

// ── COMMANDS ───────────────────────────────────────────────

module.exports = {
  commands: {

    // ── .google ──────────────────────────────────────────
    async google(sock, msg, ctx, args, body) {
      if (!body) return sock.sendMessage(ctx.jid, { text: '❌ Usage: .google [query]' }, { quoted: msg });

      await sock.sendMessage(ctx.jid, { text: '🔍 Searching Google...' }, { quoted: msg });

      try {
        const results = await googleSearch(body);
        if (!results.length) return sock.sendMessage(ctx.jid, { text: '❌ No results found.' }, { quoted: msg });

        let text = `🔍 *Google Results for:* "${body}"\n━━━━━━━━━━━━━━━━━━━━━━\n\n`;
        results.forEach((r, i) => {
          text += `*${i + 1}. ${r.title}*\n`;
          if (r.desc) text += `${r.desc.substring(0, 150)}...\n`;
          if (r.link) text += `🔗 ${r.link}\n`;
          text += '\n';
        });
        text += `_Powered by YOUSAF-MD_`;

        return sock.sendMessage(ctx.jid, { text }, { quoted: msg });
      } catch (e) {
        sock.sendMessage(ctx.jid, { text: `❌ Google search failed: ${e.message}` }, { quoted: msg });
      }
    },

    // ── .wiki ────────────────────────────────────────────
    async wiki(sock, msg, ctx, args, body) {
      if (!body) return sock.sendMessage(ctx.jid, { text: '❌ Usage: .wiki [topic]' }, { quoted: msg });

      try {
        const data = await wikiSearch(body);
        if (!data.extract) return sock.sendMessage(ctx.jid, { text: '❌ No Wikipedia article found.' }, { quoted: msg });

        const text = `
📖 *Wikipedia: ${data.title}*
━━━━━━━━━━━━━━━━━━━━━━

${data.extract.substring(0, 800)}...

🔗 *Read more:* ${data.content_urls?.desktop?.page || ''}

_Powered by YOUSAF-MD_
        `.trim();

        return sock.sendMessage(ctx.jid, { text }, { quoted: msg });
      } catch (e) {
        sock.sendMessage(ctx.jid, { text: `❌ Wikipedia search failed: ${e.message}` }, { quoted: msg });
      }
    },

    // ── .tts — Text to Speech ─────────────────────────────
    async tts(sock, msg, ctx, args, body) {
      if (!body) return sock.sendMessage(ctx.jid, { text: '❌ Usage: .tts [text]' }, { quoted: msg });

      try {
        const lang     = args[0]?.match(/^[a-z]{2}$/) ? args.shift() : 'en';
        const text     = body;
        const encoded  = encodeURIComponent(text);
        const url      = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encoded}&tl=${lang}&client=tw-ob`;
        const outPath  = path.join(TEMP, `tts_${Date.now()}.mp3`);

        const res = await axios.get(url, {
          responseType: 'arraybuffer',
          headers: { 'User-Agent': 'Mozilla/5.0' },
          timeout: 15000,
        });
        await fs.writeFile(outPath, res.data);

        await sock.sendMessage(ctx.jid, {
          audio:    { url: outPath },
          mimetype: 'audio/mp4',
          ptt:      true,
        }, { quoted: msg });

        fs.unlink(outPath).catch(() => {});
      } catch (e) {
        sock.sendMessage(ctx.jid, { text: `❌ TTS failed: ${e.message}` }, { quoted: msg });
      }
    },

    // ── .playstore ────────────────────────────────────────
    async playstore(sock, msg, ctx, args, body) {
      if (!body) return sock.sendMessage(ctx.jid, { text: '❌ Usage: .playstore [app name]' }, { quoted: msg });

      try {
        const res = await axios.get(
          `https://play.google.com/store/search?q=${encodeURIComponent(body)}&c=apps`,
          { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 10000 }
        );
        const $       = cheerio.load(res.data);
        const appName = $('div.WsMG1c').first().text().trim();
        const devName = $('div.KoLSrc').first().text().trim() || $('div.b8cIId').first().text().trim();
        const rating  = $('div.pf5lIe').first().text().trim();

        if (!appName) return sock.sendMessage(ctx.jid, { text: '❌ No app found on Play Store.' }, { quoted: msg });

        const text = `
🎮 *Play Store Result*
━━━━━━━━━━━━━━━━━━━━━━
📱 *App:* ${appName}
👤 *Developer:* ${devName || 'N/A'}
⭐ *Rating:* ${rating || 'N/A'}
🔗 https://play.google.com/store/search?q=${encodeURIComponent(body)}&c=apps

_YOUSAF-MD_
        `.trim();

        return sock.sendMessage(ctx.jid, { text }, { quoted: msg });
      } catch (e) {
        sock.sendMessage(ctx.jid, { text: `❌ Play Store search failed: ${e.message}` }, { quoted: msg });
      }
    },

    // ── .weather ─────────────────────────────────────────
    async weather(sock, msg, ctx, args, body) {
      if (!body) return sock.sendMessage(ctx.jid, { text: '❌ Usage: .weather [city name]' }, { quoted: msg });

      try {
        const data    = await getWeather(body);
        const current = data.current_condition?.[0];
        const area    = data.nearest_area?.[0];
        const city    = area?.areaName?.[0]?.value || body;
        const country = area?.country?.[0]?.value  || '';

        const text = `
🌤️ *Weather Report*
━━━━━━━━━━━━━━━━━━━━━━
📍 *Location:* ${city}, ${country}
🌡️ *Temp:* ${current?.temp_C}°C / ${current?.temp_F}°F
💧 *Humidity:* ${current?.humidity}%
🌬️ *Wind:* ${current?.windspeedKmph} km/h
☁️ *Condition:* ${current?.weatherDesc?.[0]?.value}
👁️ *Visibility:* ${current?.visibility} km
☀️ *UV Index:* ${current?.uvIndex}

_Powered by wttr.in | YOUSAF-MD_
        `.trim();

        return sock.sendMessage(ctx.jid, { text }, { quoted: msg });
      } catch (e) {
        sock.sendMessage(ctx.jid, { text: `❌ Weather fetch failed: ${e.message}` }, { quoted: msg });
      }
    },

    // ── .calc ─────────────────────────────────────────────
    async calc(sock, msg, ctx, args, body) {
      if (!body) return sock.sendMessage(ctx.jid, { text: '❌ Usage: .calc [expression] e.g. .calc 2+2*5' }, { quoted: msg });

      try {
        // Safe eval using Function constructor with math operations only
        const sanitised = body.replace(/[^0-9+\-*/().%\s^]/g, '');
        if (!sanitised) return sock.sendMessage(ctx.jid, { text: '❌ Invalid expression.' }, { quoted: msg });

        const result = Function(`"use strict"; return (${sanitised})`)();
        return sock.sendMessage(ctx.jid, {
          text: `🧮 *Calculator*\n\n*Input:* ${body}\n*Result:* ${result}`,
        }, { quoted: msg });
      } catch {
        sock.sendMessage(ctx.jid, { text: '❌ Invalid math expression.' }, { quoted: msg });
      }
    },

    // ── .time ─────────────────────────────────────────────
    async time(sock, msg, ctx, args, body) {
      const zone = body || 'Asia/Karachi';
      const now  = new Date().toLocaleString('en-US', { timeZone: zone, dateStyle: 'full', timeStyle: 'long' });
      return sock.sendMessage(ctx.jid, {
        text: `🕐 *Current Time*\n\n📍 *Zone:* ${zone}\n🗓️ ${now}\n\n_YOUSAF-MD_`,
      }, { quoted: msg });
    },
  },
};
                                                                                     
