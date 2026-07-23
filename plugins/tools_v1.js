/*
╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃   YOUSAF-BALOCH-MD  •  tools_v1        ┃
┃  Commands: calc, weather, qr,          ┃
┃            shortlink, short, ss,       ┃
┃            screenshot                  ┃
┃        Created by MR YOUSAF BALOCH     ┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
*/
import axios from 'axios';
import { createRequire } from 'module';
import { SYSTEM } from '../config.js';

const require = createRequire(import.meta.url);

// ─── CALC Handler ─────────────────────────────────────────────────────────────
async function calcHandler({ sock, msg, from, args }) {
  try {
    if (!args?.length) {
      return sock.sendMessage(from, {
        text: `❌ *Please provide a math expression!*\n\n.calc 5 + 5\n.calc 100 * 2.5\n.calc (10 + 5) * 2\n${SYSTEM?.SHORT_WATERMARK || ''}`
      }, { quoted: msg });
    }
    
    const expression = args.join(' ');
    const sanitized = expression.replace(/[^0-9+\-*/.()\s]/g, '');
    
    if (!sanitized) {
      return sock.sendMessage(from, {
        text: `❌ *Invalid mathematical expression!*\n${SYSTEM?.SHORT_WATERMARK || ''}`
      }, { quoted: msg });
    }

    // Safe evaluation
    const result = new Function('return ' + sanitized)();
    
    await sock.sendMessage(from, {
      text: `╭━━━『 🧮 *CALCULATOR* 』━━━╮\n\n📐 *Expression:*\n${expression}\n\n✅ *Result:*\n${result}\n\n╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n${SYSTEM?.SHORT_WATERMARK || ''}`
    }, { quoted: msg });

  } catch (error) {
    console.error('[CALC ERROR]:', error.message);
    await sock.sendMessage(from, {
      text: `❌ *Invalid expression!*\n\n💡 Example: .calc 5 + 5\n${SYSTEM?.SHORT_WATERMARK || ''}`
    }, { quoted: msg });
  }
}

// ─── WEATHER Handler ──────────────────────────────────────────────────────────
async function weatherHandler({ sock, msg, from, args }) {
  try {
    if (!args?.length) {
      return sock.sendMessage(from, {
        text: `❌ *Please provide a city name!*\n\n.weather Karachi\n.weather Lahore\n.weather Islamabad\n${SYSTEM?.SHORT_WATERMARK || ''}`
      }, { quoted: msg });
    }
    
    const city = args.join(' ');
    await sock.sendMessage(from, { text: `⏳ *Getting weather for ${city}...*\n${SYSTEM?.SHORT_WATERMARK || ''}` }, { quoted: msg });
    
    // Using Open-Meteo API (free, no key needed)
    const geoRes = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`, { timeout: 10000 });
    
    if (!geoRes.data.results?.length) {
      return sock.sendMessage(from, {
        text: `❌ *City not found!*\n\n💡 Try a different city name.\n${SYSTEM?.SHORT_WATERMARK || ''}`
      }, { quoted: msg });
    }
    
    const location = geoRes.data.results[0];
    const weatherRes = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current_weather=true`, { timeout: 10000 });
    
    const weather = weatherRes.data.current_weather;
    const temp = weather.temperature;
    const wind = weather.windspeed;
    const condition = weather.weathercode;
    
    const weatherEmojis = {
      0: '☀️ Clear', 1: '🌤️ Mainly Clear', 2: '⛅ Partly Cloudy', 3: '☁️ Overcast',
      45: '🌫️ Foggy', 48: '🌫️ Foggy', 51: '🌧️ Light Drizzle', 53: '🌧️ Drizzle',
      55: '🌧️ Heavy Drizzle', 61: '🌧️ Light Rain', 63: '🌧️ Rain', 65: '🌧️ Heavy Rain',
      71: '🌨️ Light Snow', 73: '🌨️ Snow', 75: '🌨️ Heavy Snow', 95: '⛈️ Thunderstorm'
    };
    
    const emoji = weatherEmojis[condition] || '🌡️';
    
    await sock.sendMessage(from, {
      text: `╭━━━『 🌤️ *WEATHER* 』━━━╮\n\n📍 *City:* ${location.name}, ${location.country || ''}\n\n${emoji}\n🌡️ *Temperature:* ${temp}°C\n💨 *Wind Speed:* ${wind} km/h\n\n╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n${SYSTEM?.SHORT_WATERMARK || ''}`
    }, { quoted: msg });

  } catch (error) {
    console.error('[WEATHER ERROR]:', error.message);
    await sock.sendMessage(from, {
      text: `❌ *Failed to get weather!*\n_${error.message}_\n${SYSTEM?.SHORT_WATERMARK || ''}`
    }, { quoted: msg });
  }
}

// ─── QR Handler ───────────────────────────────────────────────────────────────
async function qrHandler({ sock, msg, from, args }) {
  try {
    if (!args?.length) {
      return sock.sendMessage(from, {
        text: `❌ *Please provide text to convert!*\n\n.qr Hello World\n.qr https://wa.me/923710636110\n${SYSTEM?.SHORT_WATERMARK || ''}`
      }, { quoted: msg });
    }
    
    const text = args.join(' ');
    await sock.sendMessage(from, { text: `⏳ *Generating QR code...*\n${SYSTEM?.SHORT_WATERMARK || ''}` }, { quoted: msg });
    
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(text)}`;
    const qrRes = await axios.get(qrUrl, { responseType: 'arraybuffer', timeout: 15000 });
    
    await sock.sendMessage(from, {
      image: Buffer.from(qrRes.data),
      caption: `📱 *QR Code Generated*\n\n📝 *Text:* ${text.substring(0, 100)}${text.length > 100 ? '...' : ''}\n\n${SYSTEM?.SHORT_WATERMARK || ''}`,
    }, { quoted: msg });

  } catch (error) {
    console.error('[QR ERROR]:', error.message);
    await sock.sendMessage(from, {
      text: `❌ *Failed to generate QR!*\n_${error.message}_\n${SYSTEM?.SHORT_WATERMARK || ''}`
    }, { quoted: msg });
  }
}

// ─── SHORTLINK Handler ────────────────────────────────────────────────────────
async function shortlinkHandler({ sock, msg, from, args }) {
  try {
    if (!args?.length) {
      return sock.sendMessage(from, {
        text: `❌ *Please provide a URL!*\n\n.shortlink https://google.com\n.short https://youtube.com\n${SYSTEM?.SHORT_WATERMARK || ''}`
      }, { quoted: msg });
    }
    
    let url = args[0];
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    
    await sock.sendMessage(from, { text: `⏳ *Shortening URL...*\n${SYSTEM?.SHORT_WATERMARK || ''}` }, { quoted: msg });
    
    // Using is.gd API (free, no key)
    const shortRes = await axios.get(`https://is.gd/create.php?format=simple&url=${encodeURIComponent(url)}`, { timeout: 15000 });
    const shortUrl = shortRes.data;
    
    await sock.sendMessage(from, {
      text: `╭━━━『 🔗 *SHORT LINK* 』━━━╮\n\n🔗 *Original:*\n${url.substring(0, 50)}${url.length > 50 ? '...' : ''}\n\n✅ *Shortened:*\n${shortUrl}\n\n╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n${SYSTEM?.SHORT_WATERMARK || ''}`
    }, { quoted: msg });

  } catch (error) {
    console.error('[SHORTLINK ERROR]:', error.message);
    await sock.sendMessage(from, {
      text: `❌ *Failed to shorten URL!*\n_${error.message}_\n${SYSTEM?.SHORT_WATERMARK || ''}`
    }, { quoted: msg });
  }
}

// ─── SCREENSHOT Handler ───────────────────────────────────────────────────────
async function screenshotHandler({ sock, msg, from, args }) {
  try {
    if (!args?.length) {
      return sock.sendMessage(from, {
        text: `❌ *Please provide a website URL!*\n\n.screenshot https://google.com\n.ss https://youtube.com\n${SYSTEM?.SHORT_WATERMARK || ''}`
      }, { quoted: msg });
    }
    
    let url = args[0];
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    
    await sock.sendMessage(from, { text: `⏳ *Taking screenshot...*\n${SYSTEM?.SHORT_WATERMARK || ''}` }, { quoted: msg });
    
    // Using Multi-Mirror Screenshot API
    const ssUrl = `https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=true&embed=screenshot.url`;
    const ssRes = await axios.get(ssUrl, { timeout: 25000 });
    const imgUrl = ssRes.data?.url || `https://image.thum.io/get/width/1024/crop/768/${url}`;

    const ssBuf = await axios.get(imgUrl, { responseType: 'arraybuffer', timeout: 25000 });
    
    await sock.sendMessage(from, {
      image: Buffer.from(ssBuf.data),
      caption: `📸 *Screenshot*\n\n🌐 *Website:* ${url}\n\n${SYSTEM?.SHORT_WATERMARK || ''}`,
    }, { quoted: msg });

  } catch (error) {
    console.error('[SCREENSHOT ERROR]:', error.message);
    await sock.sendMessage(from, {
      text: `❌ *Failed to take screenshot!*\n_${error.message}_\n${SYSTEM?.SHORT_WATERMARK || ''}`
    }, { quoted: msg });
  }
}

export default [
  { command: 'calc',       category: 'Tools', description: 'Calculate math expressions', usage: '.calc <expression>', cooldown: 3, handler: calcHandler },
  { command: 'calculator', category: 'Tools', description: 'Calculate math expressions', usage: '.calculator <expression>', cooldown: 3, handler: calcHandler },
  { command: 'weather',    category: 'Tools', description: 'Get weather information',    usage: '.weather <city>', cooldown: 5, handler: weatherHandler },
  { command: 'qr',         category: 'Tools', description: 'Generate QR code',           usage: '.qr <text>', cooldown: 5, handler: qrHandler },
  { command: 'shortlink',  category: 'Tools', description: 'Shorten URL',                usage: '.shortlink <url>', cooldown: 5, handler: shortlinkHandler },
  { command: 'short',      category: 'Tools', description: 'Shorten URL',                usage: '.short <url>', cooldown: 5, handler: shortlinkHandler },
  { command: 'screenshot', category: 'Tools', description: 'Take website screenshot',    usage: '.screenshot <url>', cooldown: 10, handler: screenshotHandler },
  { command: 'ss',         category: 'Tools', description: 'Take website screenshot',    usage: '.ss <url>', cooldown: 10, handler: screenshotHandler },
];

