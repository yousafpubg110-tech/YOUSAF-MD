/*
╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃   YOUSAF-BALOCH-MD  •  auto_v1         ┃
┃  Commands: autostatus autoread         ┃
┃            autoreply antivv autolike   ┃
┃        Created by MR YOUSAF BALOCH     ┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
*/
import { OWNER, SYSTEM, CONFIG } from '../config.js';

// ═══════════════════════════════════════════════════════════════════
//  FIX: CONFIG object کو directly update کرو
//  تاکہ EventHandler بھی updated value پڑھ سکے
// ═══════════════════════════════════════════════════════════════════

function toggleConfig(key, val) {
  CONFIG[key] = val;
}

// ─── autostatus ────────────────────────────────────────────────────
async function autostatusHandler({ msg, args }) {
  try {
    const s = args[0]?.toLowerCase();
    if (!['on', 'off'].includes(s)) {
      return msg.reply(
        `⚙️ *Auto Status View*\n\n` +
        `*.autostatus on*  — Auto view all statuses\n` +
        `*.autostatus off* — Disable\n\n` +
        `Current: *${CONFIG.AUTO_STATUS ? 'ON ✅' : 'OFF ❌'}*\n` +
        `${SYSTEM.SHORT_WATERMARK}`
      );
    }
    toggleConfig('AUTO_STATUS', s === 'on');
    toggleConfig('AUTO_READ_STATUS', s === 'on');
    await msg.react(s === 'on' ? '✅' : '❌');
    await msg.reply(
      `${s === 'on' ? '✅ Auto Status View *enabled*' : '❌ Auto Status View *disabled*'}\n` +
      `${SYSTEM.SHORT_WATERMARK}`
    );
  } catch (e) {
    await msg.react('❌');
    await msg.reply(`❌ _${e.message}_\n${SYSTEM.SHORT_WATERMARK}`);
  }
}

// ─── autolike ─────────────────────────────────────────────────────
async function autolikeHandler({ msg, args }) {
  try {
    const s = args[0]?.toLowerCase();
    if (!['on', 'off'].includes(s)) {
      return msg.reply(
        `⚙️ *Auto Like Status*\n\n` +
        `*.autolike on*  — Auto like status updates\n` +
        `*.autolike off* — Disable\n\n` +
        `Current: *${CONFIG.AUTO_LIKE_STATUS ? 'ON ✅' : 'OFF ❌'}*\n` +
        `${SYSTEM.SHORT_WATERMARK}`
      );
    }
    toggleConfig('AUTO_LIKE_STATUS', s === 'on');
    await msg.react(s === 'on' ? '✅' : '❌');
    await msg.reply(
      `${s === 'on' ? '✅ Auto Like Status *enabled*' : '❌ Auto Like Status *disabled*'}\n` +
      `${SYSTEM.SHORT_WATERMARK}`
    );
  } catch (e) {
    await msg.react('❌');
    await msg.reply(`❌ _${e.message}_\n${SYSTEM.SHORT_WATERMARK}`);
  }
}

// ─── autoreact ────────────────────────────────────────────────────
async function autoreactHandler({ msg, args }) {
  try {
    const s = args[0]?.toLowerCase();
    if (!['on', 'off'].includes(s)) {
      return msg.reply(
        `⚙️ *Auto React*\n\n` +
        `*.autoreact on*  — Auto react to messages\n` +
        `*.autoreact off* — Disable\n\n` +
        `Current: *${CONFIG.AUTO_REACT ? 'ON ✅' : 'OFF ❌'}*\n` +
        `${SYSTEM.SHORT_WATERMARK}`
      );
    }
    toggleConfig('AUTO_REACT', s === 'on');
    await msg.react(s === 'on' ? '✅' : '❌');
    await msg.reply(
      `${s === 'on' ? '✅ Auto React *enabled*' : '❌ Auto React *disabled*'}\n` +
      `${SYSTEM.SHORT_WATERMARK}`
    );
  } catch (e) {
    await msg.react('❌');
    await msg.reply(`❌ _${e.message}_\n${SYSTEM.SHORT_WATERMARK}`);
  }
}

// ─── autoread ─────────────────────────────────────────────────────
async function autoreadHandler({ msg, args }) {
  try {
    const s = args[0]?.toLowerCase();
    if (!['on', 'off'].includes(s)) {
      return msg.reply(
        `⚙️ *Auto Read*\n\n` +
        `*.autoread on*  — Auto read all messages\n` +
        `*.autoread off* — Disable\n\n` +
        `Current: *${CONFIG.AUTO_READ ? 'ON ✅' : 'OFF ❌'}*\n` +
        `${SYSTEM.SHORT_WATERMARK}`
      );
    }
    toggleConfig('AUTO_READ', s === 'on');
    await msg.react(s === 'on' ? '✅' : '❌');
    await msg.reply(
      `${s === 'on' ? '✅ Auto Read *enabled*' : '❌ Auto Read *disabled*'}\n` +
      `${SYSTEM.SHORT_WATERMARK}`
    );
  } catch (e) {
    await msg.react('❌');
    await msg.reply(`❌ _${e.message}_\n${SYSTEM.SHORT_WATERMARK}`);
  }
}

// ─── autotyping ───────────────────────────────────────────────────
async function autotypingHandler({ msg, args }) {
  try {
    const s = args[0]?.toLowerCase();
    if (!['on', 'off'].includes(s)) {
      return msg.reply(
        `⚙️ *Auto Typing*\n\n` +
        `*.autotyping on*  — Show typing indicator\n` +
        `*.autotyping off* — Disable\n\n` +
        `Current: *${CONFIG.AUTO_TYPING ? 'ON ✅' : 'OFF ❌'}*\n` +
        `${SYSTEM.SHORT_WATERMARK}`
      );
    }
    toggleConfig('AUTO_TYPING', s === 'on');
    await msg.react(s === 'on' ? '✅' : '❌');
    await msg.reply(
      `${s === 'on' ? '✅ Auto Typing *enabled*' : '❌ Auto Typing *disabled*'}\n` +
      `${SYSTEM.SHORT_WATERMARK}`
    );
  } catch (e) {
    await msg.react('❌');
    await msg.reply(`❌ _${e.message}_\n${SYSTEM.SHORT_WATERMARK}`);
  }
}

// ─── autorecording ────────────────────────────────────────────────
async function autorecordingHandler({ msg, args }) {
  try {
    const s = args[0]?.toLowerCase();
    if (!['on', 'off'].includes(s)) {
      return msg.reply(
        `⚙️ *Auto Recording*\n\n` +
        `*.autorecording on*  — Show recording indicator\n` +
        `*.autorecording off* — Disable\n\n` +
        `Current: *${CONFIG.AUTO_RECORDING ? 'ON ✅' : 'OFF ❌'}*\n` +
        `${SYSTEM.SHORT_WATERMARK}`
      );
    }
    toggleConfig('AUTO_RECORDING', s === 'on');
    await msg.react(s === 'on' ? '✅' : '❌');
    await msg.reply(
      `${s === 'on' ? '✅ Auto Recording *enabled*' : '❌ Auto Recording *disabled*'}\n` +
      `${SYSTEM.SHORT_WATERMARK}`
    );
  } catch (e) {
    await msg.react('❌');
    await msg.reply(`❌ _${e.message}_\n${SYSTEM.SHORT_WATERMARK}`);
  }
}

// ─── autoreply ────────────────────────────────────────────────────
async function autoreplyHandler({ msg, args }) {
  try {
    const s = args[0]?.toLowerCase();
    if (!['on', 'off'].includes(s)) {
      return msg.reply(
        `⚙️ *Auto Reply*\n\n` +
        `*.autoreply on*  — Reply when owner is busy\n` +
        `*.autoreply off* — Disable\n\n` +
        `Current: *${CONFIG.AUTO_REPLY ? 'ON ✅' : 'OFF ❌'}*\n` +
        `${SYSTEM.SHORT_WATERMARK}`
      );
    }
    toggleConfig('AUTO_REPLY', s === 'on');
    await msg.react(s === 'on' ? '✅' : '❌');
    await msg.reply(
      `${s === 'on'
        ? '✅ Auto Reply *enabled*\n💡 Bot will reply with a busy message'
        : '❌ Auto Reply *disabled*'
      }\n${SYSTEM.SHORT_WATERMARK}`
    );
  } catch (e) {
    await msg.react('❌');
    await msg.reply(`❌ _${e.message}_\n${SYSTEM.SHORT_WATERMARK}`);
  }
}

// ─── antidelete ───────────────────────────────────────────────────
async function antideleteHandler({ msg, args }) {
  try {
    const s = args[0]?.toLowerCase();
    if (!['on', 'off'].includes(s)) {
      return msg.reply(
        `⚙️ *Anti Delete*\n\n` +
        `*.antidelete on*  — Show deleted messages\n` +
        `*.antidelete off* — Disable\n\n` +
        `Current: *${CONFIG.ANTI_DELETE ? 'ON ✅' : 'OFF ❌'}*\n` +
        `${SYSTEM.SHORT_WATERMARK}`
      );
    }
    toggleConfig('ANTI_DELETE', s === 'on');
    await msg.react(s === 'on' ? '✅' : '❌');
    await msg.reply(
      `${s === 'on' ? '✅ Anti Delete *enabled*' : '❌ Anti Delete *disabled*'}\n` +
      `${SYSTEM.SHORT_WATERMARK}`
    );
  } catch (e) {
    await msg.react('❌');
    await msg.reply(`❌ _${e.message}_\n${SYSTEM.SHORT_WATERMARK}`);
  }
}

// ─── antivv (anti view once) ──────────────────────────────────────
async function antivvHandler({ msg, args, isAdmin, isDeployer, isOwner }) {
  try {
    if (!isAdmin && !isDeployer && !isOwner) {
      return msg.reply(
        `❌ *Admins Only!*\n\n` +
        `Only admins can toggle Anti View-Once.\n` +
        `${SYSTEM.SHORT_WATERMARK}`
      );
    }
    const s = args[0]?.toLowerCase();
    if (!['on', 'off'].includes(s)) {
      return msg.reply(
        `⚙️ *Anti View-Once*\n\n` +
        `*.antivv on*  — Reveal view-once media\n` +
        `*.antivv off* — Disable\n\n` +
        `Current: *${CONFIG.ANTI_VIEW_ONCE ? 'ON ✅' : 'OFF ❌'}*\n` +
        `${SYSTEM.SHORT_WATERMARK}`
      );
    }
    toggleConfig('ANTI_VIEW_ONCE', s === 'on');
    await msg.react(s === 'on' ? '✅' : '❌');
    await msg.reply(
      `${s === 'on' ? '✅ Anti View-Once *enabled*' : '❌ Anti View-Once *disabled*'}\n` +
      `${SYSTEM.SHORT_WATERMARK}`
    );
  } catch (e) {
    await msg.react('❌');
    await msg.reply(`❌ _${e.message}_\n${SYSTEM.SHORT_WATERMARK}`);
  }
}

// ─── antilink ─────────────────────────────────────────────────────
async function antilinkHandler({ msg, args, isAdmin, isDeployer, isOwner }) {
  try {
    if (!isAdmin && !isDeployer && !isOwner) {
      return msg.reply(
        `❌ *Admins Only!*\n\n` +
        `Only admins can toggle Anti-Link.\n` +
        `${SYSTEM.SHORT_WATERMARK}`
      );
    }
    const s = args[0]?.toLowerCase();
    if (!['on', 'off'].includes(s)) {
      return msg.reply(
        `⚙️ *Anti Link*\n\n` +
        `*.antilink on*  — Delete links in group\n` +
        `*.antilink off* — Disable\n\n` +
        `Current: *${CONFIG.ANTI_LINK ? 'ON ✅' : 'OFF ❌'}*\n` +
        `${SYSTEM.SHORT_WATERMARK}`
      );
    }
    toggleConfig('ANTI_LINK', s === 'on');
    await msg.react(s === 'on' ? '✅' : '❌');
    await msg.reply(
      `${s === 'on' ? '✅ Anti Link *enabled*' : '❌ Anti Link *disabled*'}\n` +
      `${SYSTEM.SHORT_WATERMARK}`
    );
  } catch (e) {
    await msg.react('❌');
    await msg.reply(`❌ _${e.message}_\n${SYSTEM.SHORT_WATERMARK}`);
  }
}

// ─── antibad ──────────────────────────────────────────────────────
async function antibadHandler({ msg, args, isAdmin, isDeployer, isOwner }) {
  try {
    if (!isAdmin && !isDeployer && !isOwner) {
      return msg.reply(
        `❌ *Admins Only!*\n\n` +
        `Only admins can toggle Anti Bad Words.\n` +
        `${SYSTEM.SHORT_WATERMARK}`
      );
    }
    const s = args[0]?.toLowerCase();
    if (!['on', 'off'].includes(s)) {
      return msg.reply(
        `⚙️ *Anti Bad Words*\n\n` +
        `*.antibad on*  — Delete bad words\n` +
        `*.antibad off* — Disable\n\n` +
        `Current: *${CONFIG.ANTI_BAD ? 'ON ✅' : 'OFF ❌'}*\n` +
        `${SYSTEM.SHORT_WATERMARK}`
      );
    }
    toggleConfig('ANTI_BAD', s === 'on');
    await msg.react(s === 'on' ? '✅' : '❌');
    await msg.reply(
      `${s === 'on' ? '✅ Anti Bad Words *enabled*' : '❌ Anti Bad Words *disabled*'}\n` +
      `${SYSTEM.SHORT_WATERMARK}`
    );
  } catch (e) {
    await msg.react('❌');
    await msg.reply(`❌ _${e.message}_\n${SYSTEM.SHORT_WATERMARK}`);
  }
}

// ─── anticall ─────────────────────────────────────────────────────
async function anticallHandler({ msg, args }) {
  try {
    const s = args[0]?.toLowerCase();
    if (!['on', 'off'].includes(s)) {
      return msg.reply(
        `⚙️ *Anti Call*\n\n` +
        `*.anticall on*  — Auto reject calls\n` +
        `*.anticall off* — Disable\n\n` +
        `Current: *${CONFIG.ANTI_CALL ? 'ON ✅' : 'OFF ❌'}*\n` +
        `${SYSTEM.SHORT_WATERMARK}`
      );
    }
    toggleConfig('ANTI_CALL', s === 'on');
    await msg.react(s === 'on' ? '✅' : '❌');
    await msg.reply(
      `${s === 'on' ? '✅ Anti Call *enabled*' : '❌ Anti Call *disabled*'}\n` +
      `${SYSTEM.SHORT_WATERMARK}`
    );
  } catch (e) {
    await msg.react('❌');
    await msg.reply(`❌ _${e.message}_\n${SYSTEM.SHORT_WATERMARK}`);
  }
}

// ─── welcome ──────────────────────────────────────────────────────
async function welcomeHandler({ msg, args, isAdmin, isDeployer, isOwner }) {
  try {
    if (!isAdmin && !isDeployer && !isOwner) {
      return msg.reply(`❌ *Admins Only!*\n${SYSTEM.SHORT_WATERMARK}`);
    }
    const s = args[0]?.toLowerCase();
    if (!['on', 'off'].includes(s)) {
      return msg.reply(
        `⚙️ *Welcome Message*\n\n` +
        `*.welcome on*  — Send welcome to new members\n` +
        `*.welcome off* — Disable\n\n` +
        `Current: *${CONFIG.WELCOME ? 'ON ✅' : 'OFF ❌'}*\n` +
        `${SYSTEM.SHORT_WATERMARK}`
      );
    }
    toggleConfig('WELCOME', s === 'on');
    await msg.react(s === 'on' ? '✅' : '❌');
    await msg.reply(
      `${s === 'on' ? '✅ Welcome Message *enabled*' : '❌ Welcome Message *disabled*'}\n` +
      `${SYSTEM.SHORT_WATERMARK}`
    );
  } catch (e) {
    await msg.react('❌');
    await msg.reply(`❌ _${e.message}_\n${SYSTEM.SHORT_WATERMARK}`);
  }
}

// ─── goodbye ──────────────────────────────────────────────────────
async function goodbyeHandler({ msg, args, isAdmin, isDeployer, isOwner }) {
  try {
    if (!isAdmin && !isDeployer && !isOwner) {
      return msg.reply(`❌ *Admins Only!*\n${SYSTEM.SHORT_WATERMARK}`);
    }
    const s = args[0]?.toLowerCase();
    if (!['on', 'off'].includes(s)) {
      return msg.reply(
        `⚙️ *Goodbye Message*\n\n` +
        `*.goodbye on*  — Send goodbye to leaving members\n` +
        `*.goodbye off* — Disable\n\n` +
        `Current: *${CONFIG.GOODBYE ? 'ON ✅' : 'OFF ❌'}*\n` +
        `${SYSTEM.SHORT_WATERMARK}`
      );
    }
    toggleConfig('GOODBYE', s === 'on');
    await msg.react(s === 'on' ? '✅' : '❌');
    await msg.reply(
      `${s === 'on' ? '✅ Goodbye Message *enabled*' : '❌ Goodbye Message *disabled*'}\n` +
      `${SYSTEM.SHORT_WATERMARK}`
    );
  } catch (e) {
    await msg.react('❌');
    await msg.reply(`❌ _${e.message}_\n${SYSTEM.SHORT_WATERMARK}`);
  }
}

// ─── settings (full overview) ─────────────────────────────────────
async function settingsHandler({ msg }) {
  try {
    await msg.reply(
      `╭━━━『 ⚙️ *BOT SETTINGS* 』━━━╮\n\n` +
      `👁️ *Auto Status View:* ${CONFIG.AUTO_STATUS ? 'ON ✅' : 'OFF ❌'}\n` +
      `❤️ *Auto Like Status:* ${CONFIG.AUTO_LIKE_STATUS ? 'ON ✅' : 'OFF ❌'}\n` +
      `😊 *Auto React:*       ${CONFIG.AUTO_REACT ? 'ON ✅' : 'OFF ❌'}\n` +
      `✅ *Auto Read:*        ${CONFIG.AUTO_READ ? 'ON ✅' : 'OFF ❌'}\n` +
      `⌨️ *Auto Typing:*      ${CONFIG.AUTO_TYPING ? 'ON ✅' : 'OFF ❌'}\n` +
      `🎙️ *Auto Recording:*   ${CONFIG.AUTO_RECORDING ? 'ON ✅' : 'OFF ❌'}\n` +
      `💬 *Auto Reply:*       ${CONFIG.AUTO_REPLY ? 'ON ✅' : 'OFF ❌'}\n\n` +
      `🗑️ *Anti Delete:*      ${CONFIG.ANTI_DELETE ? 'ON ✅' : 'OFF ❌'}\n` +
      `🔗 *Anti Link:*        ${CONFIG.ANTI_LINK ? 'ON ✅' : 'OFF ❌'}\n` +
      `🤬 *Anti Bad Words:*   ${CONFIG.ANTI_BAD ? 'ON ✅' : 'OFF ❌'}\n` +
      `📵 *Anti Call:*        ${CONFIG.ANTI_CALL ? 'ON ✅' : 'OFF ❌'}\n` +
      `👁️ *Anti View Once:*   ${CONFIG.ANTI_VIEW_ONCE ? 'ON ✅' : 'OFF ❌'}\n\n` +
      `👋 *Welcome Msg:*      ${CONFIG.WELCOME ? 'ON ✅' : 'OFF ❌'}\n` +
      `👋 *Goodbye Msg:*      ${CONFIG.GOODBYE ? 'ON ✅' : 'OFF ❌'}\n\n` +
      `🌐 *Bot Mode:*         ${CONFIG.MODE.toUpperCase()}\n` +
      `📟 *Prefix:*           ${CONFIG.PREFIX}\n\n` +
      `╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n` +
      `${SYSTEM.SHORT_WATERMARK}`
    );
  } catch (e) {
    await msg.react('❌');
    await msg.reply(`❌ _${e.message}_\n${SYSTEM.SHORT_WATERMARK}`);
  }
}

export default [
  { command: ['autostatus', 'autoviewstatus'], name: 'autostatus',    category: 'Settings', description: 'Auto view status',        usage: '.autostatus on/off',    cooldown: 3, handler: autostatusHandler    },
  { command: ['autolike'],                     name: 'autolike',      category: 'Settings', description: 'Auto like status',        usage: '.autolike on/off',      cooldown: 3, handler: autolikeHandler      },
  { command: ['autoreact'],                    name: 'autoreact',     category: 'Settings', description: 'Auto react messages',     usage: '.autoreact on/off',     cooldown: 3, handler: autoreactHandler     },
  { command: ['autoread'],                     name: 'autoread',      category: 'Settings', description: 'Auto read messages',      usage: '.autoread on/off',      cooldown: 3, handler: autoreadHandler      },
  { command: ['autotyping'],                   name: 'autotyping',    category: 'Settings', description: 'Auto typing indicator',   usage: '.autotyping on/off',    cooldown: 3, handler: autotypingHandler    },
  { command: ['autorecording'],                name: 'autorecording', category: 'Settings', description: 'Auto recording indicator',usage: '.autorecording on/off', cooldown: 3, handler: autorecordingHandler },
  { command: ['autoreply'],                    name: 'autoreply',     category: 'Settings', description: 'Auto reply busy message', usage: '.autoreply on/off',     cooldown: 3, handler: autoreplyHandler     },
  { command: ['antidelete'],                   name: 'antidelete',    category: 'Settings', description: 'Anti delete messages',    usage: '.antidelete on/off',    cooldown: 3, handler: antideleteHandler    },
  { command: ['antivv', 'antiviewonce'],        name: 'antivv',        category: 'Settings', description: 'Anti view once',          usage: '.antivv on/off',        cooldown: 3, handler: antivvHandler        },
  { command: ['antilink'],                     name: 'antilink',      category: 'Settings', description: 'Anti link in groups',     usage: '.antilink on/off',      cooldown: 3, handler: antilinkHandler      },
  { command: ['antibad', 'antiabuse'],         name: 'antibad',       category: 'Settings', description: 'Anti bad words',         usage: '.antibad on/off',       cooldown: 3, handler: antibadHandler       },
  { command: ['anticall'],                     name: 'anticall',      category: 'Settings', description: 'Auto reject calls',       usage: '.anticall on/off',      cooldown: 3, handler: anticallHandler      },
  { command: ['welcome', 'setwelcome'],        name: 'welcome',       category: 'Settings', description: 'Welcome new members',     usage: '.welcome on/off',       cooldown: 3, handler: welcomeHandler       },
  { command: ['goodbye', 'setgoodbye'],        name: 'goodbye',       category: 'Settings', description: 'Goodbye message',        usage: '.goodbye on/off',       cooldown: 3, handler: goodbyeHandler       },
  { command: ['settings', 'setting'],          name: 'settings',      category: 'Settings', description: 'Show all settings',      usage: '.settings',             cooldown: 3, handler: settingsHandler       },
];
