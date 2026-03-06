// ============================================================
//   YOUSAF-MD — AUTO REPLY PLUGIN
//   Personal chat auto reply with AI conversation
//   Languages: Roman Urdu, Urdu, English
//   Developer: Muhammad Yousaf Baloch
// ============================================================

'use strict';

const axios  = require('axios');
const config = require('../config');

// ── FIRST MESSAGE STORE (in-memory) ──────────────────────
// Tracks which numbers already got the welcome message
const greeted = new Set();

// ── WELCOME MESSAGE ───────────────────────────────────────
const WELCOME_MSG = `👋 *Assalam o Alaikum!*

Main *Yousaf Baloch* ka Multi-Device WhatsApp AI System hoon. Yousaf bhai abhi offline hain, lekin main aap ki madad ke liye haazir hoon! 🤖

━━━━━━━━━━━━━━━━━━
🤖 *Main Kya Kar Sakta Hoon:*
• Aap se kisi bhi topic par baat kar sakta hoon
• Aap ke sawalat ka jawab de sakta hoon
• Bot ke commands use karne mein help kar sakta hoon

📋 *Bot Commands Dekhne Ke Liye:*
Type karein 👉 *.menu*

💬 *Seedha Baat Karne Ke Liye:*
Bas apna message type karein — main reply karoonga!

━━━━━━━━━━━━━━━━━━
> *© Powered By Mr Yousaf Baloch* 🇵🇰`;

// ── LANGUAGE DETECTOR ────────────────────────────────────
function detectLanguage(text) {
  // Urdu unicode range
  const urduRegex = /[\u0600-\u06FF]/;
  if (urduRegex.test(text)) return 'urdu';

  // Roman Urdu common words
  const romanUrduWords = [
    'kya', 'hai', 'hain', 'ho', 'kar', 'karo', 'bhai', 'yaar',
    'acha', 'theek', 'nahi', 'haan', 'ji', 'ap', 'aap', 'mujhe',
    'mein', 'tera', 'mera', 'kyun', 'kaise', 'kahan', 'kab',
    'bata', 'batao', 'lagao', 'send', 'bhejo', 'chahiye', 'wala',
    'abhi', 'kal', 'tha', 'thi', 'shukriya', 'thanks', 'thora',
    'bohat', 'bahut', 'accha', 'thik', 'zyada', 'kam', 'sab',
    'kuch', 'koi', 'milta', 'dena', 'lena', 'pata', 'nahi',
  ];
  const lower = text.toLowerCase();
  const isRoman = romanUrduWords.some(w => lower.includes(w));
  if (isRoman) return 'roman';

  return 'english';
}

// ── SYSTEM PROMPT BY LANGUAGE ─────────────────────────────
function getSystemPrompt(lang) {
  if (lang === 'urdu') {
    return `آپ یوسف بلوچ کا ذاتی AI اسسٹنٹ ہیں۔ آپ کا نام "YOUSAF-MD AI" ہے۔ آپ اردو میں بات کرتے ہیں۔ آپ ایک دوستانہ، مددگار اور سمجھدار اسسٹنٹ ہیں جو بالکل ایک حقیقی انسان کی طرح بات کرتا ہے۔ یوسف بلوچ ابھی آف لائن ہیں، آپ ان کی جگہ لوگوں سے بات کرتے ہیں۔ اگر کوئی مدد مانگے تو تفصیل سے مدد کریں۔ جواب مختصر اور دلچسپ رکھیں۔`;
  }
  if (lang === 'roman') {
    return `Aap Yousaf Baloch ke personal AI assistant hain. Aap ka naam "YOUSAF-MD AI" hai. Aap Roman Urdu mein baat karte hain bilkul ek real insan ki tarah. Yousaf bhai abhi offline hain, aap unki jagah logon se baat karte hain. Agar koi help mange to detail mein madad karein. Jawab chhota aur friendly rakhein. Kabhi kabhi "bhai", "yaar", "accha", "theek hai" jaisi words use karein taake natural lage.`;
  }
  return `You are Yousaf Baloch's personal AI assistant named "YOUSAF-MD AI". You speak in English like a real human. Yousaf is currently offline and you handle conversations on his behalf. Be friendly, helpful and conversational. If someone needs help, assist them in detail. Keep responses concise and engaging.`;
}

// ── AI REPLY FUNCTION ─────────────────────────────────────
async function getAIReply(userMessage, lang, conversationHistory) {
  try {
    const systemPrompt = getSystemPrompt(lang);

    // Build messages array with history
    const messages = [
      ...conversationHistory.slice(-10), // last 10 messages for context
      { role: 'user', content: userMessage },
    ];

    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model:      'claude-haiku-4-5-20251001',
        max_tokens: 300,
        system:     systemPrompt,
        messages:   messages,
      },
      {
        headers: {
          'Content-Type':      'application/json',
          'x-api-key':         process.env.ANTHROPIC_API_KEY || '',
          'anthropic-version': '2023-06-01',
        },
        timeout: 15000,
      }
    );

    return response.data?.content?.[0]?.text || null;

  } catch (e) {
    // Fallback replies if API not available
    const fallbacks = {
      roman: [
        'Bhai abhi thora busy hoon, thodi der mein reply karoonga! 😊',
        'Acha bhai, samajh gaya. Koi aur sawaal ho to batao!',
        'Ji bilkul, main aap ki help ke liye haazir hoon! Batao kya chahiye?',
        'Yaar interesting point hai! Aur kuch batao?',
        'Theek hai bhai, note kar liya. Aur koi kaam ho to batao!',
      ],
      urdu: [
        'جی بالکل، میں آپ کی مدد کے لیے حاضر ہوں! بتائیں کیا چاہیے؟',
        'سمجھ گیا، کوئی اور سوال ہو تو بتائیں!',
        'بھائی ابھی تھوڑا مصروف ہوں، تھوڑی دیر میں جواب دیتا ہوں!',
      ],
      english: [
        "Got it! Let me know if you need anything else 😊",
        "Sure, I'm here to help! What else can I do for you?",
        "Interesting! Tell me more about it.",
        "I understand. Is there anything specific you need help with?",
      ],
    };
    const arr = fallbacks[lang] || fallbacks.english;
    return arr[Math.floor(Math.random() * arr.length)];
  }
}

// ── CONVERSATION HISTORY STORE ────────────────────────────
const conversations = new Map();

function getHistory(jid) {
  if (!conversations.has(jid)) conversations.set(jid, []);
  return conversations.get(jid);
}

function addToHistory(jid, role, content) {
  const history = getHistory(jid);
  history.push({ role, content });
  // Keep only last 20 messages
  if (history.length > 20) history.splice(0, history.length - 20);
}

// ── MAIN HANDLER ──────────────────────────────────────────
async function handleAutoReply(sock, msg, ctx) {
  try {
    const jid      = ctx.jid;
    const isGroup  = jid.endsWith('@g.us');
    const isOwner  = ctx.sender === config.OWNER_NUMBER + '@s.whatsapp.net' ||
                     ctx.sender === config.OWNER_NUMBER;

    // Only personal chats, not groups, not owner's own messages
    if (isGroup || isOwner) return;
    // Only if message is from someone else, not bot itself
    if (msg.key?.fromMe) return;

    const text = ctx.body?.trim();
    if (!text) return;

    // Check if it's a bot command — skip auto reply
    const prefix = config.PREFIX || '.';
    if (text.startsWith(prefix)) return;

    const senderJid = ctx.sender || jid;

    // ── FIRST TIME GREETING ───────────────────────────────
    if (!greeted.has(senderJid)) {
      greeted.add(senderJid);
      await sock.sendMessage(jid, {
        text: WELCOME_MSG,
      }, { quoted: msg });

      // Small delay then ask if they want to chat
      setTimeout(async () => {
        const lang = detectLanguage(text);
        let followUp;
        if (lang === 'roman') {
          followUp = `Bhai agar aap mujh se baat karna chahte hain to main bilkul tayyar hoon! 😊 Koi bhi sawaal poochh sakte hain.`;
        } else if (lang === 'urdu') {
          followUp = `اگر آپ مجھ سے بات کرنا چاہتے ہیں تو میں بالکل تیار ہوں! 😊 کوئی بھی سوال پوچھ سکتے ہیں۔`;
        } else {
          followUp = `If you'd like to chat, I'm right here! 😊 Feel free to ask me anything.`;
        }
        await sock.sendMessage(jid, { text: followUp });
      }, 2000);

      return;
    }

    // ── AI CONVERSATION ───────────────────────────────────
    const lang    = detectLanguage(text);
    const history = getHistory(senderJid);

    // Add user message to history
    addToHistory(senderJid, 'user', text);

    // Show typing indicator
    await sock.sendPresenceUpdate('composing', jid);

    // Get AI reply
    const reply = await getAIReply(text, lang, history);

    // Stop typing
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
    // Owner can clear conversation history
    async clearchat(sock, msg, ctx) {
      if (!ctx.isOwner) return;
      conversations.clear();
      greeted.clear();
      await sock.sendMessage(ctx.jid, {
        text: '✅ Auto reply history cleared!',
      }, { quoted: msg });
    },
  },
};

