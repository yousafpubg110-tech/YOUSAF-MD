import fs from 'fs';
import path from 'path';
import { dataFile } from '../lib/paths.js';
import store from '../lib/lightweight_store.js';

const MONGO_URL = process.env.MONGO_URL;
const POSTGRES_URL = process.env.POSTGRES_URL;
const MYSQL_URL = process.env.MYSQL_URL;
const SQLITE_URL = process.env.DB_URL;
const HAS_DB = !!(MONGO_URL || POSTGRES_URL || MYSQL_URL || SQLITE_URL);

const configPath = dataFile('away.json');

const DEFAULT_MESSAGE =
    `👋 Hi! I'm currently offline and not able to reply right now.\n\n` +
    `I usually check my messages within a couple of hours — I'll get back to you as soon as I'm online. ` +
    `Thanks for your patience! 🙏`;

const DEFAULT_CONFIG = {
    enabled: false,
    message: DEFAULT_MESSAGE,
    cooldownMinutes: 90, // how often the same person can receive the away message again (default: 1.5 hours)
    lastSent: {}, // { senderId: timestampMs }
};

async function initConfig() {
    if (HAS_DB) {
        const config = await store.getSetting('global', 'away');
        return config || { ...DEFAULT_CONFIG };
    } else {
        if (!fs.existsSync(configPath)) {
            const dataDir = path.dirname(configPath);
            if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
            fs.writeFileSync(configPath, JSON.stringify(DEFAULT_CONFIG, null, 2));
        }
        return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    }
}

async function saveConfig(config) {
    if (HAS_DB) {
        await store.saveSetting('global', 'away', config);
    } else {
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    }
}

/**
 * Called from messageHandler for every incoming private-chat message that
 * isn't from the owner. Sends the away message at most once per sender per
 * cooldown window. Returns true if it sent (so the caller can decide
 * whether to still process the message as a command, etc).
 */
export async function handleAwayMessage(sock, chatId, message, senderId) {
    try {
        // Only for private chats — never auto-reply into groups.
        if (chatId.endsWith('@g.us')) return false;

        const config = await initConfig();
        if (!config.enabled) return false;

        const now = Date.now();
        const cooldownMs = (config.cooldownMinutes || 120) * 60 * 1000;
        const last = config.lastSent?.[senderId] || 0;

        if (now - last < cooldownMs) return false; // already sent recently, stay quiet

        await sock.sendMessage(chatId, { text: config.message }, { quoted: message });

        config.lastSent = config.lastSent || {};
        config.lastSent[senderId] = now;
        await saveConfig(config);
        return true;
    } catch (e) {
        console.error('[AWAY] Error:', e.message);
        return false;
    }
}

export default {
    command: 'away',
    aliases: ['setaway', 'awaymsg', 'vacation'],
    category: 'owner',
    description: 'Configure an automatic away message sent to new private chats while you are offline',
    usage: '.away on | .away off | .away set <message> | .away cooldown <minutes>',
    ownerOnly: true,
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        try {
            const config = await initConfig();
            const action = args[0]?.toLowerCase();

            if (!action) {
                return await sock.sendMessage(chatId, {
                    text: `*🌙 AWAY MODE STATUS*\n\n` +
                        `*Status:* ${config.enabled ? '✅ Enabled' : '❌ Disabled'}\n` +
                        `*Cooldown:* ${config.cooldownMinutes} minutes (always applies to every first-time message, regardless of your real online/offline status)\n` +
                        `*Current Message:*\n${config.message}\n\n` +
                        `*Commands:*\n` +
                        `• \`.away on\` - Turn on away mode\n` +
                        `• \`.away off\` - Turn off away mode\n` +
                        `• \`.away set <message>\` - Set your custom away message\n` +
                        `• \`.away cooldown <minutes>\` - How often it re-sends to the same person (default 90 = 1.5 hours)`,
                }, { quoted: message });
            }

            if (action === 'on' || action === 'enable') {
                config.enabled = true;
                await saveConfig(config);
                return await sock.sendMessage(chatId, {
                    text: '✅ *Away mode enabled!*\n\nNew private messages will get your away message automatically.',
                }, { quoted: message });
            }

            if (action === 'off' || action === 'disable') {
                config.enabled = false;
                await saveConfig(config);
                return await sock.sendMessage(chatId, {
                    text: '❌ *Away mode disabled!*',
                }, { quoted: message });
            }

            if (action === 'set') {
                const newMessage = args.slice(1).join(' ').trim();
                if (!newMessage) {
                    return await sock.sendMessage(chatId, {
                        text: '❌ Please provide the message text.\n\nExample:\n.away set Hi! I\'m offline right now, will reply within 2 hours 🙏',
                    }, { quoted: message });
                }
                config.message = newMessage;
                await saveConfig(config);
                return await sock.sendMessage(chatId, {
                    text: `✅ *Away message updated!*\n\n${newMessage}`,
                }, { quoted: message });
            }

            if (action === 'cooldown') {
                const minutes = parseInt(args[1], 10);
                if (!minutes || minutes < 1) {
                    return await sock.sendMessage(chatId, {
                        text: '❌ Please provide a valid number of minutes.\n\nExample:\n.away cooldown 120',
                    }, { quoted: message });
                }
                config.cooldownMinutes = minutes;
                await saveConfig(config);
                return await sock.sendMessage(chatId, {
                    text: `✅ *Cooldown set to ${minutes} minutes.*`,
                }, { quoted: message });
            }

            return await sock.sendMessage(chatId, {
                text: '❌ *Invalid option!*\n\nUse `.away` alone to see all options.',
            }, { quoted: message });

        } catch (e) {
            console.error('Error in away command:', e);
            await sock.sendMessage(chatId, { text: '❌ *Error processing command!*' }, { quoted: message });
        }
    },
    handleAwayMessage,
    initConfig,
    saveConfig,
};
