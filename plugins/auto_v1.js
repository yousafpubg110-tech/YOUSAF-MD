/*
╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃   YOUSAF-BALOCH-MD  •  auto_v1         ┃
┃  Commands: autostatus, autoread,       ┃
┃            autoreply, antivv, autolike ┃
┃        Created by MR YOUSAF BALOCH     ┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
*/
import { OWNER, SYSTEM, CONFIG } from '../config.js';

// ─── SAFE HELPER FUNCTIONS ─────────────────────────────────────────

// Universal Chat JID resolver
function getTargetJid(ctx) {
  return ctx?.from || ctx?.chat || ctx?.msg?.key?.remoteJid || ctx?.m?.key?.remoteJid || null;
}

// Universal Reply Function (Supports both msg.reply and sock.sendMessage)
async function safeReply(ctx, text) {
  try {
    const { sock, msg, m } = ctx;
    const targetMsg = msg || m;
    
    // 1. Try built-in reply method if available
    if (targetMsg && typeof targetMsg.reply === 'function') {
      return await targetMsg.reply(text);
    }
    
    // 2. Fallback to Baileys sock.sendMessage
    const jid = getTargetJid(ctx);
    if (sock && jid) {
      return await sock.sendMessage(jid, { text }, { quoted: targetMsg });
    }
  } catch (err) {
    console.error('Error in safeReply:', err);
  }
}

// Universal Reaction Function
async function safeReact(ctx, emoji) {
  try {
    const { sock, msg, m } = ctx;
    const targetMsg = msg || m;
    
    // 1. Try built-in react method if available
    if (targetMsg && typeof targetMsg.react === 'function') {
      return await targetMsg.react(emoji);
    }
    
    // 2. Fallback to Baileys reaction protocol
    const jid = getTargetJid(ctx);
    if (sock && jid && targetMsg?.key) {
      return await sock.sendMessage(jid, {
        react: { text: emoji, key: targetMsg.key }
      });
    }
  } catch (err) {
    console.error('Error in safeReact:', err);
  }
}

// Helper to update config safely in-memory
function toggleConfig(key, val) {
  if (CONFIG && typeof CONFIG === 'object') {
    CONFIG[key] = val;
  }
}

// ─── COMMAND HANDLERS ──────────────────────────────────────────────

// 1. autostatus
async function autostatusHandler(ctx) {
  try {
    const { args } = ctx;
    const s = args?.[0]?.toLowerCase();
    const current = CONFIG?.AUTO_STATUS ? 'ON ✅' : 'OFF ❌';
    const watermark = SYSTEM?.SHORT_WATERMARK || '';

    if (!['on', 'off'].includes(s)) {
      return await safeReply(ctx,
        `⚙️ *Auto Status View*\n\n` +
        `*.autostatus on*  — Auto view all statuses\n` +
        `*.autostatus off* — Disable\n\n` +
        `Current: *${current}*\n` +
        `${watermark}`
      );
    }

    const state = s === 'on';
    toggleConfig('AUTO_STATUS', state);
    toggleConfig('AUTO_READ_STATUS', state);

    await safeReact(ctx, state ? '✅' : '❌');
    await safeReply(ctx,
      `${state ? '✅ Auto Status View *enabled*' : '❌ Auto Status View *disabled*'}\n` +
      `${watermark}`
    );
  } catch (e) {
    await safeReact(ctx, '❌');
    await safeReply(ctx, `❌ _${e.message}_\n${SYSTEM?.SHORT_WATERMARK || ''}`);
  }
}

// 2. autolike
async function autolikeHandler(ctx) {
  try {
    const { args } = ctx;
    const s = args?.[0]?.toLowerCase();
    const current = CONFIG?.AUTO_LIKE_STATUS ? 'ON ✅' : 'OFF ❌';
    const watermark = SYSTEM?.SHORT_WATERMARK || '';

    if (!['on', 'off'].includes(s)) {
      return await safeReply(ctx,
        `⚙️ *Auto Like Status*\n\n` +
        `*.autolike on*  — Auto like status updates\n` +
        `*.autolike off* — Disable\n\n` +
        `Current: *${current}*\n` +
        `${watermark}`
      );
    }

    const state = s === 'on';
    toggleConfig('AUTO_LIKE_STATUS', state);

    await safeReact(ctx, state ? '✅' : '❌');
    await safeReply(ctx,
      `${state ? '✅ Auto Like Status *enabled*' : '❌ Auto Like Status *disabled*'}\n` +
      `${watermark}`
    );
  } catch (e) {
    await safeReact(ctx, '❌');
    await safeReply(ctx, `❌ _${e.message}_\n${SYSTEM?.SHORT_WATERMARK || ''}`);
  }
}

// 3. autoreact
async function autoreactHandler(ctx) {
  try {
    const { args } = ctx;
    const s = args?.[0]?.toLowerCase();
    const current = CONFIG?.AUTO_REACT ? 'ON ✅' : 'OFF ❌';
    const watermark = SYSTEM?.SHORT_WATERMARK || '';

    if (!['on', 'off'].includes(s)) {
      return await safeReply(ctx,
        `⚙️ *Auto React*\n\n` +
        `*.autoreact on*  — Auto react to messages\n` +
        `*.autoreact off* — Disable\n\n` +
        `Current: *${current}*\n` +
        `${watermark}`
      );
    }

    const state = s === 'on';
    toggleConfig('AUTO_REACT', state);

    await safeReact(ctx, state ? '✅' : '❌');
    await safeReply(ctx,
      `${state ? '✅ Auto React *enabled*' : '❌ Auto React *disabled*'}\n` +
      `${watermark}`
    );
  } catch (e) {
    await safeReact(ctx, '❌');
    await safeReply(ctx, `❌ _${e.message}_\n${SYSTEM?.SHORT_WATERMARK || ''}`);
  }
}

// 4. autoread
async function autoreadHandler(ctx) {
  try {
    const { args } = ctx;
    const s = args?.[0]?.toLowerCase();
    const current = CONFIG?.AUTO_READ ? 'ON ✅' : 'OFF ❌';
    const watermark = SYSTEM?.SHORT_WATERMARK || '';

    if (!['on', 'off'].includes(s)) {
      return await safeReply(ctx,
        `⚙️ *Auto Read*\n\n` +
        `*.autoread on*  — Auto read all messages\n` +
        `*.autoread off* — Disable\n\n` +
        `Current: *${current}*\n` +
        `${watermark}`
      );
    }

    const state = s === 'on';
    toggleConfig('AUTO_READ', state);

    await safeReact(ctx, state ? '✅' : '❌');
    await safeReply(ctx,
      `${state ? '✅ Auto Read *enabled*' : '❌ Auto Read *disabled*'}\n` +
      `${watermark}`
    );
  } catch (e) {
    await safeReact(ctx, '❌');
    await safeReply(ctx, `❌ _${e.message}_\n${SYSTEM?.SHORT_WATERMARK || ''}`);
  }
}

// 5. autotyping
async function autotypingHandler(ctx) {
  try {
    const { args } = ctx;
    const s = args?.[0]?.toLowerCase();
    const current = CONFIG?.AUTO_TYPING ? 'ON ✅' : 'OFF ❌';
    const watermark = SYSTEM?.SHORT_WATERMARK || '';

    if (!['on', 'off'].includes(s)) {
      return await safeReply(ctx,
        `⚙️ *Auto Typing*\n\n` +
        `*.autotyping on*  — Show typing indicator\n` +
        `*.autotyping off* — Disable\n\n` +
        `Current: *${current}*\n` +
        `${watermark}`
      );
    }

    const state = s === 'on';
    toggleConfig('AUTO_TYPING', state);

    await safeReact(ctx, state ? '✅' : '❌');
    await safeReply(ctx,
      `${state ? '✅ Auto Typing *enabled*' : '❌ Auto Typing *disabled*'}\n` +
      `${watermark}`
    );
  } catch (e) {
    await safeReact(ctx, '❌');
    await safeReply(ctx, `❌ _${e.message}_\n${SYSTEM?.SHORT_WATERMARK || ''}`);
  }
}

// 6. autorecording
async function autorecordingHandler(ctx) {
  try {
    const { args } = ctx;
    const s = args?.[0]?.toLowerCase();
    const current = CONFIG?.AUTO_RECORDING ? 'ON ✅' : 'OFF ❌';
    const watermark = SYSTEM?.SHORT_WATERMARK || '';

    if (!['on', 'off'].includes(s)) {
      return await safeReply(ctx,
        `⚙️ *Auto Recording*\n\n` +
        `*.autorecording on*  — Show recording indicator\n` +
        `*.autorecording off* — Disable\n\n` +
        `Current: *${current}*\n` +
        `${watermark}`
      );
    }

    const state = s === 'on';
    toggleConfig('AUTO_RECORDING', state);

    await safeReact(ctx, state ? '✅' : '❌');
    await safeReply(ctx,
      `${state ? '✅ Auto Recording *enabled*' : '❌ Auto Recording *disabled*'}\n` +
      `${watermark}`
    );
  } catch (e) {
    await safeReact(ctx, '❌');
    await safeReply(ctx, `❌ _${e.message}_\n${SYSTEM?.SHORT_WATERMARK || ''}`);
  }
}

// 7. autoreply
async function autoreplyHandler(ctx) {
  try {
    const { args } = ctx;
    const s = args?.[0]?.toLowerCase();
    const current = CONFIG?.AUTO_REPLY ? 'ON ✅' : 'OFF ❌';
    const watermark = SYSTEM?.SHORT_WATERMARK || '';

    if (!['on', 'off'].includes(s)) {
      return await safeReply(ctx,
        `⚙️ *Auto Reply*\n\n` +
        `*.autoreply on*  — Reply when owner is busy\n` +
        `*.autoreply off* — Disable\n\n` +
        `Current: *${current}*\n` +
        `${watermark}`
      );
    }

    const state = s === 'on';
    toggleConfig('AUTO_REPLY', state);

    await safeReact(ctx, state ? '✅' : '❌');
    await safeReply(ctx,
      `${state
        ? '✅ Auto Reply *enabled*\n💡 Bot will reply with a busy message'
        : '❌ Auto Reply *disabled*'
      }\n${watermark}`
    );
  } catch (e) {
    await safeReact(ctx, '❌');
    await safeReply(ctx, `❌ _${e.message}_\n${SYSTEM?.SHORT_WATERMARK || ''}`);
  }
}

// 8. antidelete
async function antideleteHandler(ctx) {
  try {
    const { args } = ctx;
    const s = args?.[0]?.toLowerCase();
    const current = CONFIG?.ANTI_DELETE ? 'ON ✅' : 'OFF ❌';
    const watermark = SYSTEM?.SHORT_WATERMARK || '';

    if (!['on', 'off'].includes(s)) {
      return await safeReply(ctx,
        `⚙️ *Anti Delete*\n\n` +
        `*.antidelete on*  — Show deleted messages\n` +
        `*.antidelete off* — Disable\n\n` +
        `Current: *${current}*\n` +
        `${watermark}`
      );
    }

    const state = s === 'on';
    toggleConfig('ANTI_DELETE', state);

    await safeReact(ctx, state ? '✅' : '❌');
    await safeReply(ctx,
      `${state ? '✅ Anti Delete *enabled*' : '❌ Anti Delete *disabled*'}\n` +
      `${watermark}`
    );
  } catch (e) {
    await safeReact(ctx, '❌');
    await safeReply(ctx, `❌ _${e.message}_\n${SYSTEM?.SHORT_WATERMARK || ''}`);
  }
}

// 9. antivv
async function antivvHandler(ctx) {
  try {
    const { args, isAdmin, isDeployer, isOwner } = ctx;
    const watermark = SYSTEM?.SHORT_WATERMARK || '';

    if (!isAdmin && !isDeployer && !isOwner) {
      return await safeReply(ctx,
        `❌ *Admins Only!*\n\n` +
        `Only admins can toggle Anti View-Once.\n` +
        `${watermark}`
      );
    }

    const s = args?.[0]?.toLowerCase();
    const current = CONFIG?.ANTI_VIEW_ONCE ? 'ON ✅' : 'OFF ❌';

    if (!['on', 'off'].includes(s)) {
      return await safeReply(ctx,
        `⚙️ *Anti View-Once*\n\n` +
        `*.antivv on*  — Reveal view-once media\n` +
        `*.antivv off* — Disable\n\n` +
        `Current: *${current}*\n` +
        `${watermark}`
      );
    }

    const state = s === 'on';
    toggleConfig('ANTI_VIEW_ONCE', state);

    await safeReact(ctx, state ? '✅' : '❌');
    await safeReply(ctx,
      `${state ? '✅ Anti View-Once *enabled*' : '❌ Anti View-Once *disabled*'}\n` +
      `${watermark}`
    );
  } catch (e) {
    await safeReact(ctx, '❌');
    await safeReply(ctx, `❌ _${e.message}_\n${SYSTEM?.SHORT_WATERMARK || ''}`);
  }
}

// 10. antilink
async function antilinkHandler(ctx) {
  try {
    const { args, isAdmin, isDeployer, isOwner } = ctx;
    const watermark = SYSTEM?.SHORT_WATERMARK || '';

    if (!isAdmin && !isDeployer && !isOwner) {
      return await safeReply(ctx,
        `❌ *Admins Only!*\n\n` +
        `Only admins can toggle Anti-Link.\n` +
        `${watermark}`
      );
    }

    const s = args?.[0]?.toLowerCase();
    const current = CONFIG?.ANTI_LINK ? 'ON ✅' : 'OFF ❌';

    if (!['on', 'off'].includes(s)) {
      return await safeReply(ctx,
        `⚙️ *Anti Link*\n\n` +
        `*.antilink on*  — Delete links in group\n` +
        `*.antilink off* — Disable\n\n` +
        `Current: *${current}*\n` +
        `${watermark}`
      );
    }

    const state = s === 'on';
    toggleConfig('ANTI_LINK', state);

    await safeReact(ctx, state ? '✅' : '❌');
    await safeReply(ctx,
      `${state ? '✅ Anti Link *enabled*' : '❌ Anti Link *disabled*'}\n` +
      `${watermark}`
    );
  } catch (e) {
    await safeReact(ctx, '❌');
    await safeReply(ctx, `❌ _${e.message}_\n${SYSTEM?.SHORT_WATERMARK || ''}`);
  }
}

// 11. antibad
async function antibadHandler(ctx) {
  try {
    const { args, isAdmin, isDeployer, isOwner } = ctx;
    const watermark = SYSTEM?.SHORT_WATERMARK || '';

    if (!isAdmin && !isDeployer && !isOwner) {
      return await safeReply(ctx,
        `❌ *Admins Only!*\n\n` +
        `Only admins can toggle Anti Bad Words.\n` +
        `${watermark}`
      );
    }

    const s = args?.[0]?.toLowerCase();
    const current = CONFIG?.ANTI_BAD ? 'ON ✅' : 'OFF ❌';

    if (!['on', 'off'].includes(s)) {
      return await safeReply(ctx,
        `⚙️ *Anti Bad Words*\n\n` +
        `*.antibad on*  — Delete bad words\n` +
        `*.antibad off* — Disable\n\n` +
        `Current: *${current}*\n` +
        `${watermark}`
      );
    }

    const state = s === 'on';
    toggleConfig('ANTI_BAD', state);

    await safeReact(ctx, state ? '✅' : '❌');
    await safeReply(ctx,
      `${state ? '✅ Anti Bad Words *enabled*' : '❌ Anti Bad Words *disabled*'}\n` +
      `${watermark}`
    );
  } catch (e) {
    await safeReact(ctx, '❌');
    await safeReply(ctx, `❌ _${e.message}_\n${SYSTEM?.SHORT_WATERMARK || ''}`);
  }
}

// 12. anticall
async function anticallHandler(ctx) {
  try {
    const { args } = ctx;
    const s = args?.[0]?.toLowerCase();
    const current = CONFIG?.ANTI_CALL ? 'ON ✅' : 'OFF ❌';
    const watermark = SYSTEM?.SHORT_WATERMARK || '';

    if (!['on', 'off'].includes(s)) {
      return await safeReply(ctx,
        `⚙️ *Anti Call*\n\n` +
        `*.anticall on*  — Auto reject calls\n` +
        `*.anticall off* — Disable\n\n` +
        `Current: *${current}*\n` +
        `${watermark}`
      );
    }

    const state = s === 'on';
    toggleConfig('ANTI_CALL', state);

    await safeReact(ctx, state ? '✅' : '❌');
    await safeReply(ctx,
      `${state ? '✅ Anti Call *enabled*' : '❌ Anti Call *disabled*'}\n` +
      `${watermark}`
    );
  } catch (e) {
    await safeReact(ctx, '❌');
    await safeReply(ctx, `❌ _${e.message}_\n${SYSTEM?.SHORT_WATERMARK || ''}`);
  }
}

// 13. welcome
async function welcomeHandler(ctx) {
  try {
    const { args, isAdmin, isDeployer, isOwner } = ctx;
    const watermark = SYSTEM?.SHORT_WATERMARK || '';

    if (!isAdmin && !isDeployer && !isOwner) {
      return await safeReply(ctx, `❌ *Admins Only!*\n${watermark}`);
    }

    const s = args?.[0]?.toLowerCase();
    const current = CONFIG?.WELCOME ? 'ON ✅' : 'OFF ❌';

    if (!['on', 'off'].includes(s)) {
      return await safeReply(ctx,
        `⚙️ *Welcome Message*\n\n` +
        `*.welcome on*  — Send welcome to new members\n` +
        `*.welcome off* — Disable\n\n` +
        `Current: *${current}*\n` +
        `${watermark}`
      );
    }

    const state = s === 'on';
    toggleConfig('WELCOME', state);

    await safeReact(ctx, state ? '✅' : '❌');
    await safeReply(ctx,
      `${state ? '✅ Welcome Message *enabled*' : '❌ Welcome Message *disabled*'}\n` +
      `${watermark}`
    );
  } catch (e) {
    await safeReact(ctx, '❌');
    await safeReply(ctx, `❌ _${e.message}_\n${SYSTEM?.SHORT_WATERMARK || ''}`);
  }
}

// 14. goodbye
async function goodbyeHandler(ctx) {
  try {
    const { args, isAdmin, isDeployer, isOwner } = ctx;
    const watermark = SYSTEM?.SHORT_WATERMARK || '';

    if (!isAdmin && !isDeployer && !isOwner) {
      return await safeReply(ctx, `❌ *Admins Only!*\n${watermark}`);
    }

    const s = args?.[0]?.toLowerCase();
    const current = CONFIG?.GOODBYE ? 'ON ✅' : 'OFF ❌';

    if (!['on', 'off'].includes(s)) {
      return await safeReply(ctx,
        `⚙️ *Goodbye Message*\n\n` +
        `*.goodbye on*  — Send goodbye to leaving members\n` +
        `*.goodbye off* — Disable\n\n` +
        `Current: *${current}*\n` +
        `${watermark}`
      );
    }

    const state = s === 'on';
    toggleConfig('GOODBYE', state);

    await safeReact(ctx, state ? '✅' : '❌');
    await safeReply(ctx,
      `${state ? '✅ Goodbye Message *enabled*' : '❌ Goodbye Message *disabled*'}\n` +
      `${watermark}`
    );
  } catch (e) {
    await safeReact(ctx, '❌');
    await safeReply(ctx, `❌ _${e.message}_\n${SYSTEM?.SHORT_WATERMARK || ''}`);
  }
}

// 15. cmdmode
async function cmdmodeHandler(ctx) {
  try {
    const { args, isDeployer, isDeveloper, isOwner } = ctx;
    const watermark = SYSTEM?.SHORT_WATERMARK || '';

    if (!isDeployer && !isDeveloper && !isOwner) {
      return await safeReply(ctx, `❌ *Owner / Deployer Only!*\n${watermark}`);
    }

    const mode = args?.[0]?.toLowerCase();
    const current = (CONFIG?.COMMAND_ACCESS_MODE || 'all').toUpperCase();

    if (!['owner', 'admin', 'all'].includes(mode)) {
      return await safeReply(ctx,
        `⚙️ *Command Access Mode*\n\n` +
        `*.cmdmode owner* — Bot commands accessible to Owner/Deployer only\n` +
        `*.cmdmode admin* — Bot commands in groups accessible to Admins only\n` +
        `*.cmdmode all*   — Bot commands accessible to Everyone\n\n` +
        `Current Mode: *${current}*\n` +
        `${watermark}`
      );
    }

    toggleConfig('COMMAND_ACCESS_MODE', mode);

    await safeReact(ctx, '✅');
    await safeReply(ctx,
      `✅ Command Access Mode set to: *${mode.toUpperCase()}*\n` +
      `${watermark}`
    );
  } catch (e) {
    await safeReact(ctx, '❌');
    await safeReply(ctx, `❌ _${e.message}_\n${SYSTEM?.SHORT_WATERMARK || ''}`);
  }
}

// 16. settings
async function settingsHandler(ctx) {
  try {
    const text =
      `╭━━━『 ⚙️ *BOT SETTINGS* 』━━━╮\n\n` +
      `👁️ *Auto Status View:* ${CONFIG?.AUTO_STATUS ? 'ON ✅' : 'OFF ❌'}\n` +
      `❤️ *Auto Like Status:* ${CONFIG?.AUTO_LIKE_STATUS ? 'ON ✅' : 'OFF ❌'}\n` +
      `😊 *Auto React:*       ${CONFIG?.AUTO_REACT ? 'ON ✅' : 'OFF ❌'}\n` +
      `✅ *Auto Read:*        ${CONFIG?.AUTO_READ ? 'ON ✅' : 'OFF ❌'}\n` +
      `⌨️ *Auto Typing:*      ${CONFIG?.AUTO_TYPING ? 'ON ✅' : 'OFF ❌'}\n` +
      `🎙️ *Auto Recording:*   ${CONFIG?.AUTO_RECORDING ? 'ON ✅' : 'OFF ❌'}\n` +
      `💬 *Auto Reply:*       ${CONFIG?.AUTO_REPLY ? 'ON ✅' : 'OFF ❌'}\n\n` +
      `🗑️ *Anti Delete:*      ${CONFIG?.ANTI_DELETE ? 'ON ✅' : 'OFF ❌'}\n` +
      `🔗 *Anti Link:*        ${CONFIG?.ANTI_LINK ? 'ON ✅' : 'OFF ❌'}\n` +
      `🤬 *Anti Bad Words:*   ${CONFIG?.ANTI_BAD ? 'ON ✅' : 'OFF ❌'}\n` +
      `📵 *Anti Call:*        ${CONFIG?.ANTI_CALL ? 'ON ✅' : 'OFF ❌'}\n` +
      `👁️ *Anti View Once:*   ${CONFIG?.ANTI_VIEW_ONCE ? 'ON ✅' : 'OFF ❌'}\n\n` +
      `👋 *Welcome Msg:*      ${CONFIG?.WELCOME ? 'ON ✅' : 'OFF ❌'}\n` +
      `👋 *Goodbye Msg:*      ${CONFIG?.GOODBYE ? 'ON ✅' : 'OFF ❌'}\n\n` +
      `🌐 *Bot Mode:*         ${(CONFIG?.MODE || 'PUBLIC').toUpperCase()}\n` +
      `🔒 *Cmd Access Mode:*  ${(CONFIG?.COMMAND_ACCESS_MODE || 'ALL').toUpperCase()}\n` +
      `📟 *Prefix:*           ${CONFIG?.PREFIX || '.'}\n\n` +
      `╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n` +
      `${SYSTEM?.SHORT_WATERMARK || ''}`;

    await safeReply(ctx, text);
  } catch (e) {
    await safeReact(ctx, '❌');
    await safeReply(ctx, `❌ _${e.message}_\n${SYSTEM?.SHORT_WATERMARK || ''}`);
  }
}

// ─── EXPORTS ───────────────────────────────────────────────────────

export default [
  { command: 'autostatus',     alias: ['autoviewstatus'], name: 'autostatus',    category: 'Settings', description: 'Auto view status',        usage: '.autostatus on/off',    cooldown: 3, handler: autostatusHandler    },
  { command: 'autoviewstatus', alias: [],                 name: 'autostatus',    category: 'Settings', description: 'Auto view status',        usage: '.autoviewstatus on/off',cooldown: 3, handler: autostatusHandler    },
  { command: 'autolike',       alias: [],                 name: 'autolike',      category: 'Settings', description: 'Auto like status',        usage: '.autolike on/off',      cooldown: 3, handler: autolikeHandler      },
  { command: 'autoreact',      alias: [],                 name: 'autoreact',     category: 'Settings', description: 'Auto react messages',     usage: '.autoreact on/off',     cooldown: 3, handler: autoreactHandler     },
  { command: 'autoread',       alias: [],                 name: 'autoread',      category: 'Settings', description: 'Auto read messages',      usage: '.autoread on/off',      cooldown: 3, handler: autoreadHandler      },
  { command: 'autotyping',     alias: [],                 name: 'autotyping',    category: 'Settings', description: 'Auto typing indicator',usage: '.autorecording on/off', cooldown: 3, handler: autorecordingHandler },
  { command: 'autoreply',      alias: [],                 name: 'autoreply',     category: 'Settings', description: 'Auto reply busy message', usage: '.autoreply on/off',     cooldown: 3, handler: autoreplyHandler     },
  { command: 'antidelete',     alias: [],                 name: 'antidelete',    category: 'Settings', description: 'Anti delete messages',    usage: '.antidelete on/off',    cooldown: 3, handler: antideleteHandler    },
  { command: 'antivv',         alias: ['antiviewonce'],   name: 'antivv',        category: 'Settings', description: 'Anti view once',          usage: '.antivv on/off',        cooldown: 3, handler: antivvHandler        },
  { command: 'antiviewonce',   alias: [],                 name: 'antivv',        category: 'Settings', description: 'Anti view once',          usage: '.antiviewonce on/off',  cooldown: 3, handler: antivvHandler        },
  { command: 'antilink',       alias: [],                 name: 'antilink',      category: 'Settings', description: 'Anti link in groups',     usage: '.antilink on/off',      cooldown: 3, handler: antilinkHandler      },
  { command: 'antibad',        alias: [],                 name: 'antibad',       category: 'Settings', description: 'Anti bad words',          usage: '.antibad on/off',       cooldown: 3, handler: antibadHandler       },
  { command: 'anticall',       alias: [],                 name: 'anticall',      category: 'Settings', description: 'Anti call reject',        usage: '.anticall on/off',      cooldown: 3, handler: anticallHandler      },
  { command: 'welcome',        alias: [],                 name: 'welcome',       category: 'Settings', description: 'Welcome new members',     usage: '.welcome on/off',       cooldown: 3, handler: welcomeHandler       },
  { command: 'goodbye',        alias: [],                 name: 'goodbye',       category: 'Settings', description: 'Goodbye leaving members', usage: '.goodbye on/off',       cooldown: 3, handler: goodbyeHandler       },
  { command: 'cmdmode',        alias: [],                 name: 'cmdmode',       category: 'Settings', description: 'Set command access mode', usage: '.cmdmode owner/admin/all', cooldown: 3, handler: cmdmodeHandler },
  { command: 'settings',       alias: ['setting'],        name: 'settings',      category: 'Settings', description: 'Show all bot settings',   usage: '.settings',
