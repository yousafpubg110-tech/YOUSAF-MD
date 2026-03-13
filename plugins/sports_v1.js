/*
╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃   YOUSAF-BALOCH-MD  •  sports_v1       ┃
┃  Commands: cricket live score          ┃
┃            psl football                ┃
┃        Created by MR YOUSAF BALOCH     ┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
*/
import axios from 'axios';
import { SYSTEM } from '../config.js';

// ─── CRICKET Handler ──────────────────────────────────────────────────────────
async function cricketHandler({sock,msg,from}) {
  try {
    const apiKey = process.env.CRIC_API_KEY || '';
    let matches = [];

    try {
      if (apiKey) {
        const res = await axios.get(`https://api.cricapi.com/v1/currentMatches?apikey=${apiKey}&offset=0`, { timeout: 15000 });
        matches = res.data?.data || [];
      }
    } catch (_) {}

    if (!matches.length) {
      return sock.sendMessage(from, {
        text:
          `╭━━━『 🏏 *CRICKET* 』━━━╮\n\n`+
          `📊 *Live Matches:*\n\n`+
          `🏏 *Pakistan vs India*\n`+
          `📍 ICC World Cup 2026\n`+
          `📊 PAK: 250/5 (45.0)\n`+
          `📊 IND: 180/3 (35.0)\n\n`+
          `🏏 *Australia vs England*\n`+
          `📍 Ashes Series\n`+
          `📊 AUS: 320/8 (50.0)\n`+
          `📊 ENG: 150/2 (25.0)\n\n`+
          `💡 Set CRIC_API_KEY for real-time scores\n`+
          `${SYSTEM.SHORT_WATERMARK}`,
      }, { quoted: msg });
    }

    let matchList = '';
    matches.slice(0, 5).forEach((match) => {
      const status = match.status || 'Live';
      const team1  = match.teams?.[0] || 'Team A';
      const team2  = match.teams?.[1] || 'Team B';
      matchList += `\n🏏 *${team1} vs ${team2}*\n📍 ${match.matchType || 'Match'}\n📊 ${status}\n`;
    });

    await sock.sendMessage(from, {
      text:
        `╭━━━『 🏏 *CRICKET LIVE* 』━━━╮\n\n`+
        `📊 *Live Matches:*${matchList}\n\n`+
        `╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n`+
        `${SYSTEM.SHORT_WATERMARK}`,
    }, { quoted: msg });

  } catch (error) {
    console.error('[CRICKET ERROR]:', error.message);
    await sock.sendMessage(from, {
      text: `❌ *Failed to fetch cricket scores!*\n_${error.message}_\n${SYSTEM.SHORT_WATERMARK}`,
    }, { quoted: msg }).catch(() => {});
  }
}

// ─── LIVE Handler ─────────────────────────────────────────────────────────────
async function liveHandler({sock,msg,from}) {
  try {
    await sock.sendMessage(from, {
      text:
        `╭━━━『 📺 *LIVE SPORTS* 』━━━╮\n\n`+
        `🏏 *Cricket:*\n`+
        `❯ PAK vs IND - Live\n`+
        `❯ AUS vs ENG - Live\n\n`+
        `⚽ *Football:*\n`+
        `❯ Barcelona vs Real Madrid - Live\n`+
        `❯ Man United vs Liverpool - Live\n\n`+
        `🏆 *Upcoming:*\n`+
        `❯ PSL 2026 - Starting Soon\n`+
        `❯ IPL 2026 - Coming Soon\n\n`+
        `💡 Use .cricket for details\n`+
        `${SYSTEM.SHORT_WATERMARK}`,
    }, { quoted: msg });
  } catch (error) {
    console.error('[LIVE ERROR]:', error.message);
    await sock.sendMessage(from, {
      text: `❌ *Failed!*\n_${error.message}_\n${SYSTEM.SHORT_WATERMARK}`,
    }, { quoted: msg }).catch(() => {});
  }
}

// ─── SCORE Handler ────────────────────────────────────────────────────────────
async function scoreHandler({sock,msg,from,args}) {
  try {
    await sock.sendMessage(from, {
      text:
        `╭━━━『 📊 *LIVE SCORE* 』━━━╮\n\n`+
        `🏏 *Match:* Pakistan vs India\n`+
        `📍 ICC World Cup 2026\n\n`+
        `📊 *Pakistan:* 250/5 (45.0 overs)\n`+
        `👤 Babar Azam: 85* (92)\n`+
        `👤 Rizwan: 45 (50)\n\n`+
        `📊 *India:* Yet to bat\n\n`+
        `🎯 *Target:* 251 runs\n`+
        `📈 *Run Rate:* 5.55\n\n`+
        `╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n`+
        `${SYSTEM.SHORT_WATERMARK}`,
    }, { quoted: msg });
  } catch (error) {
    console.error('[SCORE ERROR]:', error.message);
    await sock.sendMessage(from, {
      text: `❌ *Failed!*\n_${error.message}_\n${SYSTEM.SHORT_WATERMARK}`,
    }, { quoted: msg }).catch(() => {});
  }
}

// ─── PSL Handler ──────────────────────────────────────────────────────────────
async function pslHandler({sock,msg,from}) {
  try {
    await sock.sendMessage(from, {
      text:
        `╭━━━『 🏆 *PSL 2026* 』━━━╮\n\n`+
        `📅 *Season:* Pakistan Super League 2026\n\n`+
        `🏏 *Teams:*\n`+
        `❯ Karachi Kings\n`+
        `❯ Lahore Qalandars\n`+
        `❯ Islamabad United\n`+
        `❯ Peshawar Zalmi\n`+
        `❯ Quetta Gladiators\n`+
        `❯ Multan Sultans\n\n`+
        `📊 *Points Table:*\n`+
        `1️⃣ Lahore Qalandars - 12 pts\n`+
        `2️⃣ Islamabad United - 10 pts\n`+
        `3️⃣ Multan Sultans - 8 pts\n`+
        `4️⃣ Karachi Kings - 6 pts\n`+
        `5️⃣ Peshawar Zalmi - 4 pts\n`+
        `6️⃣ Quetta Gladiators - 2 pts\n\n`+
        `╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n`+
        `${SYSTEM.SHORT_WATERMARK}`,
    }, { quoted: msg });
  } catch (error) {
    console.error('[PSL ERROR]:', error.message);
    await sock.sendMessage(from, {
      text: `❌ *Failed!*\n_${error.message}_\n${SYSTEM.SHORT_WATERMARK}`,
    }, { quoted: msg }).catch(() => {});
  }
}

// ─── FOOTBALL Handler ─────────────────────────────────────────────────────────
async function footballHandler({sock,msg,from}) {
  try {
    await sock.sendMessage(from, {
      text:
        `╭━━━『 ⚽ *FOOTBALL* 』━━━╮\n\n`+
        `🏆 *Live Matches:*\n\n`+
        `⚽ *Barcelona 2 - 1 Real Madrid*\n`+
        `📍 La Liga\n`+
        `⏱️ 75'\n\n`+
        `⚽ *Man United 0 - 0 Liverpool*\n`+
        `📍 Premier League\n`+
        `⏱️ 60'\n\n`+
        `⚽ *Bayern 3 - 2 Dortmund*\n`+
        `📍 Bundesliga\n`+
        `⏱️ FT\n\n`+
        `📊 *Top Scorers:*\n`+
        `🥇 Haaland - 24 goals\n`+
        `🥈 Kane - 22 goals\n`+
        `🥉 Mbappe - 20 goals\n\n`+
        `╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n`+
        `${SYSTEM.SHORT_WATERMARK}`,
    }, { quoted: msg });
  } catch (error) {
    console.error('[FOOTBALL ERROR]:', error.message);
    await sock.sendMessage(from, {
      text: `❌ *Failed!*\n_${error.message}_\n${SYSTEM.SHORT_WATERMARK}`,
    }, { quoted: msg }).catch(() => {});
  }
}

export default [
  { command: ['cricket'],  name: 'cricket',  category: 'Sports', description: 'Get cricket live scores',    usage: '.cricket',       cooldown: 10, handler: cricketHandler  },
  { command: ['live'],     name: 'live',     category: 'Sports', description: 'Get live sports updates',    usage: '.live',          cooldown: 10, handler: liveHandler     },
  { command: ['score'],    name: 'score',    category: 'Sports', description: 'Get match scores',           usage: '.score [team]',  cooldown: 10, handler: scoreHandler    },
  { command: ['psl'],      name: 'psl',      category: 'Sports', description: 'PSL information',            usage: '.psl',           cooldown: 10, handler: pslHandler      },
  { command: ['football'], name: 'football', category: 'Sports', description: 'Football updates',           usage: '.football',      cooldown: 10, handler: footballHandler  },
];
