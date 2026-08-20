import 'dotenv/config';
const _prefixes = process.env.PREFIXES ? process.env.PREFIXES.split(',') : ['.', '!', '/', '#'];

// ─────────────────────────────────────────────────────────────────
// PERMANENT BRAND LOCK — these identify the original author/owner of
// this software and are intentionally NOT read from environment
// variables. No deployer (on Heroku, Render, VPS, or anywhere else)
// can override these by setting env vars on their own hosting
// account — only editing this source file directly would change
// them, which is outside the scope of a normal one-click deployment.
// See LICENSE for the terms this protects.
// ─────────────────────────────────────────────────────────────────
const BRAND = Object.freeze({
    botName: 'YOUSAF-MD',
    botOwner: 'Muhammad Yousaf Baloch',
    author: 'MR YOUSAF BALOCH',
    packname: 'YOUSAF-MD',
    description: 'Enterprise WhatsApp Multi-Device Bot by Muhammad Yousaf Baloch',
    channelLink: 'https://whatsapp.com/channel/0029Vb3Uzps6buMH2RvGef0j',
    channelJid: '120363391372789917@newsletter',
    updateZipUrl: 'https://github.com/yousafpubg110-tech/YOUSAF-MD/archive/refs/heads/main.zip',
    ytChannel: 'Yousaf_Baloch_Tech',
    youtubeLink: 'https://www.youtube.com/@Yousaf_Baloch_Tech',
    tiktokLink: 'https://tiktok.com/@loser_boy.110',
    githubLink: 'https://github.com/yousafpubg110-tech',
    whatsappLink: 'https://wa.me/923710636110',
});

const config = {
    // Bot Identity — permanently locked to the original author (see BRAND above)
    ...BRAND,
    // Each deployer sets THEIR OWN number here so they become the
    // operational owner/admin of their own deployed copy (can use
    // owner-only commands, toggle settings, etc. on their instance).
    // This does NOT change who the software's original author is.
    ownerNumber: process.env.OWNER_NUMBER || '923710636110',
    version: '3.0.0',
    // Bot Config
    prefixes: _prefixes,
    prefix: _prefixes[0],
    commandMode: process.env.COMMAND_MODE || 'public',
    timeZone: process.env.TIMEZONE || 'Asia/Karachi',
    // Session
    sessionId: process.env.SESSION_ID || '',
    pairingNumber: process.env.PAIRING_NUMBER || '',
    // Performance
    port: Number(process.env.PORT) || 5000,
    maxStoreMessages: Number(process.env.MAX_STORE_MESSAGES) || 20,
    tempCleanupInterval: Number(process.env.CLEANUP_INTERVAL) || 1 * 60 * 60 * 1000,
    storeWriteInterval: Number(process.env.STORE_WRITE_INTERVAL) || 10000,
    // API Keys
    giphyApiKey: process.env.GIPHY_API_KEY || 'qnl7ssQChTdPjsKta2Ax2LMaGXz303tq',
    removeBgKey: process.env.REMOVEBG_KEY || '',
    // Warn system
    warnCount: 3,
    // External APIs
    APIs: {
        xteam: 'https://api.xteam.xyz',
        dzx: 'https://api.dhamzxploit.my.id',
        lol: 'https://api.lolhuman.xyz',
        violetics: 'https://violetics.pw',
        neoxr: 'https://api.neoxr.my.id',
        zenzapis: 'https://zenzapis.xyz',
        akuari: 'https://api.akuari.my.id',
        akuari2: 'https://apimu.my.id',
        nrtm: 'https://fg-nrtm.ddns.net',
        fgmods: 'https://api-fgmods.ddns.net'
    },
    APIKeys: {
        'https://api.xteam.xyz': 'd90a9e986e18778b',
        'https://api.lolhuman.xyz': '85faf717d0545d14074659ad',
        'https://api.neoxr.my.id': process.env.NEOXR_KEY || 'yourkey',
        'https://violetics.pw': 'beta',
        'https://zenzapis.xyz': process.env.ZENZAPIS_KEY || 'yourkey',
        'https://api-fgmods.ddns.net': 'fg-dylux'
    }
};
export default config;
