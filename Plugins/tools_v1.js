/*
╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃   YOUSAF-BALOCH-MD  •  tools_v1        ┃
┃  Commands: calc weather qr             ┃
┃            shortlink screenshot        ┃
┃        Created by MR YOUSAF BALOCH     ┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
*/
import axios from 'axios';
import { createRequire } from 'module';
import { SYSTEM } from '../config.js';

const require = createRequire(import.meta.url);

// ─── CALC Handler ─────────────────────────────────────────────────────────────
async function calcHandler({msg, args}) {
  try {
    if (!args?.length) return msg.reply(`❌ *Please provide a math expression!*\n\n.calc 5 + 5\n.calc 100 * 2.5\n.calc (10 + 5) * 2\n${SYSTEM.SHORT_WATERMARK}`);
    
    await msg.react('🧮');
    const expression = args.join(' ');
    
    // Safe evaluation using Function
    const result = new Function('return ' + expression.replace(/[^0-9+\-*/.()\s]/g, ''))();
    
    await msg.reply(`╭━━━『 🧮 *CALCULATOR* 』━━━╮\n\n📐 *Expression:*\n${expression}\n\n✅ *Result:*\n${result}\n\n╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n${SYSTEM.SHORT_WATERMARK}`);
    await msg.react('✅');
  } catch (error) {
    console.error('[CALC ERROR]:', error.message);
    await msg.react('❌');
    await msg.reply(`❌ *Invalid expression!*\n\n💡 Example: .calc 5 + 5\n${SYSTEM.SHORT_WATERMARK}`);
  }
}

// ─── WEATHER Handler ──────────────────────────────────────────────────────────
async function weatherHandler({sock, msg, from, args}) {
  try {
    if (!args?.length) return msg.reply(`❌ *Please provide a city name!*\n\n.weather Karachi\n.weather Lahore\n.weather Islamabad\n${SYSTEM.SHORT_WATERMARK}`);
    
    await msg.react('🌤️');
    const city = args.join(' ');
    
    await msg.reply(`⏳ *Getting weather for ${city}...*\n${SYSTEM.SHORT_WATERMARK}`);
    
    // Using Open-Meteo API (free, no key needed)
    const geoRes = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`, { timeout: 10000 });
    
    if (!geoRes.data.results?.length) {
      return msg.reply(`❌ *City not found!*\n\n💡 Try a different city name.\n${SYSTEM.SHORT_WATERMARK}`);
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
    
    await msg.reply(`╭━━━『 🌤️ *WEATHER* 』━━━╮\n\n📍 *City:* ${location.name}, ${location.country || ''}\n\n${emoji}\n🌡️ *Temperature:* ${temp}°C\n💨 *Wind Speed:* ${wind} km/h\n\n╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n${SYSTEM.SHORT_WATERMARK}`);
    await msg.react('✅');
  } catch (error) {
    console.error('[WEATHER ERROR]:', error.message);
    await msg.react('❌');
    await msg.reply(`❌ *Failed to get weather!*\n_${error.message}_\n${SYSTEM.SHORT_WATERMARK}`);
  }
}

// ─── QR Handler ───────────────────────────────────────────────────────────────
async function qrHandler({sock, msg, from, args}) {
  try {
    if (!args?.length) return msg.reply(`❌ *Please provide text to convert!*\n\n.qr Hello World\n.qr https://wa.me/923710636110\n${SYSTEM.SHORT_WATERMARK}`);
    
    await msg.react('📱');
    const text = args.join(' ');
    
    await msg.reply(`⏳ *Generating QR code...*\n${SYSTEM.SHORT_WATERMARK}`);
    
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(text)}`;
    const qrRes = await axios.get(qrUrl, { responseType: 'arraybuffer', timeout: 15000 });
    
    await sock.sendMessage(from, {
      image: Buffer.from(qrRes.data),
      caption: `📱 *QR Code Generated*\n\n📝 *Text:* ${text.substring(0, 100)}${text.length > 100 ? '...' : ''}\n\n${SYSTEM.SHORT_WATERMARK}`,
    }, { quoted: msg });
    await msg.react('✅');
  } catch (error) {
    console.error('[QR ERROR]:', error.message);
    await msg.react('❌');
    await msg.reply(`❌ *Failed to generate QR!*\n_${error.message}_\n${SYSTEM.SHORT_WATERMARK}`);
  }
}

// ─── SHORTLINK Handler ────────────────────────────────────────────────────────
async function shortlinkHandler({msg, args}) {
  try {
    if (!args?.length) return msg.reply(`❌ *Please provide a URL!*\n\n.shortlink https://google.com\n.short https://youtube.com\n${SYSTEM.SHORT_WATERMARK}`);
    
    await msg.react('🔗');
    const url = args[0];
    
    if (!url.startsWith('http')) {
      return msg.reply(`❌ *Invalid URL!*\n\n💡 URL must start with http:// or https://\n${SYSTEM.SHORT_WATERMARK}`);
    }
    
    await msg.reply(`⏳ *Shortening URL...*\n${SYSTEM.SHORT_WATERMARK}`);
    
    // Using is.gd API (free, no key)
    const shortRes = await axios.get(`https://is.gd/create.php?format=simple&url=${encodeURIComponent(url)}`, { timeout: 15000 });
    const shortUrl = shortRes.data;
    
    await msg.reply(`╭━━━『 🔗 *SHORT LINK* 』━━━╮\n\n🔗 *Original:*\n${url.substring(0, 50)}${url.length > 50 ? '...' : ''}\n\n✅ *Shortened:*\n${shortUrl}\n\n╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n${SYSTEM.SHORT_WATERMARK}`);
    await msg.react('✅');
  } catch (error) {
    console.error('[SHORTLINK ERROR]:', error.message);
    await msg.react('❌');
    await msg.reply(`❌ *Failed to shorten URL!*\n_${error.message}_\n${SYSTEM.SHORT_WATERMARK}`);
  }
}

// ─── SCREENSHOT Handler ───────────────────────────────────────────────────────
async function screenshotHandler({sock, msg, from, args}) {
  try {
    if (!args?.length) return msg.reply(`❌ *Please provide a website URL!*\n\n.screenshot https://google.com\n.ss https://youtube.com\n${SYSTEM.SHORT_WATERMARK}`);
    
    await msg.react('📸');
    const url = args[0];
    
    if (!url.startsWith('http')) {
      return msg.reply(`❌ *Invalid URL!*\n\n💡 URL must start with http:// or https://\n${SYSTEM.SHORT_WATERMARK}`);
    }
    
    await msg.reply(`⏳ *Taking screenshot...*\n${SYSTEM.SHORT_WATERMARK}`);
    
    // Using screenshot API
    const ssUrl = `https://api.screenshotmachine.com?key=free&url=${encodeURIComponent(url)}&dimension=1024x768`;
    const ssRes = await axios.get(ssUrl, { responseType: 'arraybuffer', timeout: 30000 });
    
    await sock.sendMessage(from, {
      image: Buffer.from(ssRes.data),
      caption: `📸 *Screenshot*\n\n🌐 *Website:* ${url}\n\n${SYSTEM.SHORT_WATERMARK}`,
    }, { quoted: msg });
    await msg.react('✅');
  } catch (error) {
    console.error('[SCREENSHOT ERROR]:', error.message);
    await msg.react('❌');
    await msg.reply(`❌ *Failed to take screenshot!*\n_${error.message}_\n${SYSTEM.SHORT_WATERMARK}`);
  }
}

export default [
  {command:['calc','calculator'], name:'calc',       category:'Tools',description:'Calculate math expressions',usage:'.calc <expression>',cooldown:3,handler:calcHandler},
  {command:['weather'],           name:'weather',    category:'Tools',description:'Get weather information',usage:'.weather <city>',cooldown:5,handler:weatherHandler},
  {command:['qr'],                name:'qr',         category:'Tools',description:'Generate QR code',usage:'.qr <text>',cooldown:5,handler:qrHandler},
  {command:['shortlink','short'], name:'shortlink',  category:'Tools',description:'Shorten URL',usage:'.shortlink <url>',cooldown:5,handler:shortlinkHandler},
  {command:['screenshot','ss'],   name:'screenshot', category:'Tools',description:'Take website screenshot',usage:'.screenshot <url>',cooldown:10,handler:screenshotHandler},
];
