// ============================================================
//   YOUSAF-MD — AUTO REPLY PLUGIN
//   Real AI conversation via Claude API
//   Detects language: Urdu / Roman Urdu / English
//   Developer: Muhammad Yousaf Baloch
// ============================================================

'use strict';

const axios  = require('axios');
const config = require('../config');

// ── FIRST MESSAGE TRACKER ─────────────────────────────────
const greeted = new Set();

// ── CONVERSATION HISTORY ──────────────────────────────────
const conversations = new Map();

function getHistory(jid) {
  if (!conversations.has(jid)) conversations.set(jid, []);
  return conversations.get(jid);
}

function addToHistory(jid, role, content) {
  const history = getHistory(jid);
  history.push({ role, content });
  if (history.length > 20) history.splice(0, history.length - 20);
}

// ── LANGUAGE DETECTOR ─────────────────────────────────────
function detectLanguage(text) {
  if (/[\u0600-\u06FF]/.test(text)) return 'urdu';

  const romanWords = [
    'kya', 'hai', 'hain', 'ho', 'kar', 'karo', 'bhai', 'yaar',
    'acha', 'theek', 'nahi', 'haan', 'ji', 'ap', 'aap', 'mujhe',
    'mein', 'tera', 'mera', 'kyun', 'kaise', 'kahan', 'kab',
    'bata', 'batao', 'chahiye', 'abhi', 'kal', 'tha', 'thi',
    'shukriya', 'thora', 'bohat', 'bahut', 'accha', 'thik',
    'kuch', 'koi', 'pata', 'yeh', 'woh', 'phir', 'tum', 'hum',
  ];
  const lower = text.toLowerCase();
  if (romanWords.some(w => lower.split(/\s+/).includes(w))) return 'roman';

  return 'english';
}

// ── SYSTEM PROMPT ─────────────────────────────────────────
function getSystemPrompt(lang) {
  const base = `You are YOUSAF-MD AI, the personal AI assistant of Muhammad Yousaf Baloch (a Pakistani developer). You handle WhatsApp conversations on his behalf when he is unavailable. You behave like a real helpful human — not a robot. Never repeat the same message twice. Always read the conversation history and reply accordingly. Never send unsolicited messages. Only reply when the user sends a message. If someone needs technical help with the bot, guide them properly.`;

  if (lang === 'urdu') {
    return `${base} آپ صرف اردو میں جواب دیں۔ قدرتی اور دوستانہ انداز میں بات کریں جیسے کوئی حقیقی انسان کرتا ہے۔ بار بار ایک ہی جواب مت دیں۔ گفتگو کی تاریخ پڑھ کر متعلقہ جواب دیں۔`;
  }
  if (lang === 'roman') {
    return `${base} Sirf Roman Urdu mein jawab dein. Bilkul ek real Pakistani banda ki tarah baat karein — friendly, natural aur helpful. Kabhi ek hi jawab repeat mat karein. Conversation history padh ke relevant jawab dein. "bhai", "yaar", "theek hai" jaisi natural words use karein.`;
  }
  return `${base} Reply only in English. Be natural, friendly and helpful like a real person. Never repeat the same response. Read conversation history and give contextually relevant replies.`;
}

// ── AI REPLY ──────────────────────────────────────────────
async function getAIReply(userMessage, lang, history) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (apiKey) {
    try {
      const messages = [
        ...history.slice(-10),
        { role: 'user', content: userMessage },
      ];

      const response = await axios.post(
        'https://api.anthropic.com/v1/messages',
        {
          model:      'claude-haiku-4-5-20251001',
          max_tokens: 300,
          system:     getSystemPrompt(lang),
          messages,
        },
        {
          headers: {
            'Content-Type':      'application/json',
            'x-api-key':         apiKey,
            'anthropic-version': '2023-06-01',
          },
          timeout: 15000,
        }
      );

      return response.data?.content?.[0]?.text || null;
    } catch (e) {
      console.error('[AUTOREPLY] API error:', e.message);
    }
  }

  // Fallback — only used when API key not set
  if (lang === 'roman') return 'Bhai abhi API key set nahi hai, is liye proper reply nahi de sakta. Owner se poochhein ke ANTHROPIC_API_KEY set karein.';
  if (lang === 'urdu') return 'API key ابھی سیٹ نہیں ہے۔ مالک سے کہیں کہ ANTHROPIC_API_KEY لگائیں۔';
  return 'API key is not configured. Please ask the owner to set ANTHROPIC_API_KEY.';
}

// ── WELCOME MESSAGE ───────────────────────────────────────
function buildWelcome(lang) {
  if (lang === 'urdu') {
    return `السلام علیکم! 👋\n\nمیں *YOUSAF-MD AI* ہوں — یوسف بلوچ کا ذاتی اسسٹنٹ۔\n\nآپ مجھ سے کسی بھی موضوع پر بات کر سکتے ہیں، یا bot کے commands جاننے کے لیے *.menu* لکھیں۔\n\n> _© Powered By Mr Yousaf Baloch_ 🇵🇰`;
  }
  if (lang === 'roman') {
    return `Assalam o Alaikum! 👋\n\nMain *YOUSAF-MD AI* hoon — Yousaf Baloch ka personal assistant.\n\nAap mujh se kisi bhi topic par baat kar sakte hain, ya bot commands dekhne ke liye *.menu* likhein.\n\n> _© Powered By Mr Yousaf Baloch_ 🇵🇰`;
  }
  return `Hello! 👋\n\nI'm *YOUSAF-MD AI* — Yousaf Baloch's personal assistant.\n\nFeel free to chat with me about anything, or type *.menu* to see bot commands.\n\n> _© Powered By Mr Yousaf Baloch_ 🇵🇰`;
}

// ── MAIN HANDLER ──────────────────────────────────────────
async function handleAutoReply(sock, msg, ctx) {
  try {
    const jid     = ctx.jid;
    const isGroup = jid.endsWith('@g.us');

    // Only personal chats
    if (isGroup) return;

    // Skip own messages
    if (msg.key?.fromMe) return;

    // Skip owner's messages
    const senderJid = ctx.sender || jid;
    const ownerJid  = config.OWNER_NUMBER + '@s.whatsapp.net';
    if (senderJid === ownerJid) return;

    const text = ctx.body?.trim();
    if (!text) return;

    // Skip commands
    if (text.startsWith(config.PREFIX || '.')) return;

    const lang = detectLanguage(text);

    // First time greeting — one message only, no follow-up
    if (!greeted.has(senderJid)) {
      greeted.add(senderJid);
      await sock.sendMessage(jid, {
        text: buildWelcome(lang),
      }, { quoted: msg });

      // Add first user message to history so AI has context
      addToHistory(senderJid, 'user', text);

      // Reply to their first actual message too
      await sock.sendPresenceUpdate('composing', jid);
      const reply = await getAIReply(text, lang, []);
      await sock.sendPresenceUpdate('paused', jid);

      if (reply) {
        addToHistory(senderJid, 'assistant', reply);
        await sock.sendMessage(jid, { text: reply }, { quoted: msg });
      }
      return;
    }

    // Normal AI conversation
    addToHistory(senderJid, 'user', text);
    await sock.sendPresenceUpdate('composing', jid);

    const history = getHistory(senderJid);
    const reply   = await getAIReply(text, lang, history);

    await sock.sendPresenceUpdate('paused', jid);

    if (reply) {
      addToHistory(senderJid, 'assistant', reply);
      await sock.sendMessage(jid, { text: reply }, { quoted: msg });
    }

  } catch (e) {
    console.error('[AUTOREPLY] Error:', e.message);
  }
}

// ── EXPORT ────────────────────────────────────────────────
module.exports = {
  handleAutoReply,
  commands: {
    async clearchat(sock, msg, ctx) {
      if (!ctx.isOwner) return;
      conversations.clear();
      greeted.clear();
      await sock.sendMessage(ctx.jid, {
        text: 'All conversation history cleared!',
      }, { quoted: msg });
    },
  },
};
