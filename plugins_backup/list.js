import config from '../config.js';
/*****************************************************************************
 *                                                                           *
 *                     Developed By Muhammad Yousaf Baloch                                *
 *                                                                           *
 *  🌐  GitHub   : https://github.com/yousafpubg110-tech                         *
 *  ▶️  YouTube  : https://www.youtube.com/@Yousaf_Baloch_Tech                       *
 *  💬  WhatsApp : https://whatsapp.com/channel/0029Vb3Uzps6buMH2RvGef0j     *
 *                                                                           *
 *    © 2026 MR YOUSAF BALOCH. All rights reserved.                            *
 *                                                                           *
 *    Description: This file is part of the YOUSAF-MD Project.                 *
 *                 Unauthorized copying or distribution is prohibited.       *
 *                                                                           *
 *****************************************************************************/
import commandHandler from '../lib/commandHandler.js';
import path from 'path';
import fs from 'fs';
function formatTime() {
    const now = new Date();
    const options = {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: config.timeZone || 'UTC'
    };
    return now.toLocaleTimeString('en-US', options);
}
function formatDate() {
    const now = new Date();
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: config.timeZone || 'UTC'
    };
    return now.toLocaleDateString('en-US', options);
}
const menuStyles = [
    {
        render({ _title, info, categories, prefix }) {
            let t = `╭━━『 *YOUSAF-MD MENU* 』━⬣\n`;
            t += `┃ ✨ *Bot: ${info.bot}*\n`;
            t += `┃ 🔧 *Prefix: ${info.prefix}*\n`;
            t += `┃ 📦 *Plugin: ${info.total}*\n`;
            t += `┃ 💎 *Version: ${info.version}*\n`;
            t += `┃ ⏰ *Time: ${info.time}*\n`;
            t += `┃ 👤 *Owner: ${info.owner}*\n`;
            t += `┃ 📅 *Date: ${info.date}*\n`;
            for (const [cat, cmds] of categories) {
                t += `┃━━━ *${cat.toUpperCase()}* ━✦\n`;
                for (const c of cmds)
                    t += `┃ ➤ ${prefix}${c}\n`;
            }
            t += `╰━━━━━━━━━━━━━⬣`;
            return t;
        }
    },
    {
        render({ _title, info, categories, prefix }) {
            let t = `◈╭─❍「 *YOUSAF-MD MENU* 」❍\n`;
            t += `◈├• 🌟 *Bot: ${info.bot}*\n`;
            t += `◈├• ⚙️ *Prefix: ${info.prefix}*\n`;
            t += `◈├• 🍫 *Plugins: ${info.total}*\n`;
            t += `◈├• 💎 *Version: ${info.version}*\n`;
            t += `◈├• ⏰ *Time: ${info.time}*\n`;
            t += `◈├• 👤 *Owner: ${info.owner}*\n`;
            t += `◈├• 📅 *Date: ${info.date}*\n`;
            for (const [cat, cmds] of categories) {
                t += `◈├─❍「 *${cat.toUpperCase()}* 」❍\n`;
                for (const c of cmds)
                    t += `◈├• ${prefix}${c}\n`;
            }
            t += `◈╰──★─☆──♪♪─❍`;
            return t;
        }
    },
    {
        render({ _title, info, categories, prefix }) {
            let t = `┏━━━━ *YOUSAF-MD MENU* ━━━┓\n`;
            t += `┃• *Bot : ${info.bot}*\n`;
            t += `┃• *Prefixes : ${info.prefix}*\n`;
            t += `┃• *Plugins : ${info.total}*\n`;
            t += `┃• *Version : ${info.version}*\n`;
            t += `┃• *Time : ${info.time}*\n`;
            t += `┃• 👤 *Owner: ${info.owner}*\n`;
            t += `┃• 📅 *Date: ${info.date}*\n`;
            for (const [cat, cmds] of categories) {
                t += `┃━━━━ *${cat.toUpperCase()}* ━━◆\n`;
                for (const c of cmds)
                    t += `┃ ▸ ${prefix}${c}\n`;
            }
            t += `┗━━━━━━━━━━━━━━━┛`;
            return t;
        }
    },
    {
        render({ _title, info, categories, prefix }) {
            let t = `✦═══ *YOUSAF-MD MENU* ═══✦\n`;
            t += `║➩ *Bot: ${info.bot}*\n`;
            t += `║➩ *Prefixes: ${info.prefix}*\n`;
            t += `║➩ *Plugins: ${info.total}*\n`;
            t += `║➩ *Version: ${info.version}*\n`;
            t += `║➩ *Time: ${info.time}*\n`;
            t += `║➩ 👤 *Owner: ${info.owner}*\n`;
            t += `║➩ 📅 *Date: ${info.date}*\n`;
            for (const [cat, cmds] of categories) {
                t += `║══ *${cat.toUpperCase()}* ══✧\n`;
                for (const c of cmds)
                    t += `║ ✦ ${prefix}${c}\n`;
            }
            t += `✦══════════════✦`;
            return t;
        }
    },
    {
        render({ _title, info, categories, prefix }) {
            let t = `❀━━━ *YOUSAF-MD MENU* ━━━❀\n`;
            t += `┃☞ *Bot: ${info.bot}*\n`;
            t += `┃☞ *Prefixes: ${info.prefix}*\n`;
            t += `┃☞ *Plugins: ${info.total}*\n`;
            t += `┃☞ *Version: ${info.version}*\n`;
            t += `┃☞ *Time: ${info.time}*\n`;
            t += `┃☞ 👤 *Owner: ${info.owner}*\n`;
            t += `┃☞ 📅 *Date: ${info.date}*\n`;
            for (const [cat, cmds] of categories) {
                t += `┃━━━〔 *${cat.toUpperCase()}* 〕━❀\n`;
                for (const c of cmds)
                    t += `┃☞ ${prefix}${c}\n`;
            }
            t += `❀━━━━━━━━━━━━━━❀`;
            return t;
        }
    },
    {
        render({ _title, info, categories, prefix }) {
            let t = `◆━━━ *YOUSAF-MD MENU* ━━━◆\n`;
            t += `┃ ¤ *Bot: ${info.bot}*\n`;
            t += `┃ ¤ *Prefixes: ${info.prefix}*\n`;
            t += `┃ ¤ *Plugins: ${info.total}*\n`;
            t += `┃ ¤ *Version: ${info.version}*\n`;
            t += `┃ ¤ *Time: ${info.time}*\n`;
            t += `┃ ¤ 👤 *Owner: ${info.owner}*\n`;
            t += `┃ ¤ 📅 *Date: ${info.date}*\n`;
            for (const [cat, cmds] of categories) {
                t += `┃━━ *${cat.toUpperCase()}* ━━◆◆\n`;
                for (const c of cmds)
                    t += `┃ ¤ ${prefix}${c}\n`;
            }
            t += `◆━━━━━━━━━━━━━━━━◆`;
            return t;
        }
    },
    {
        render({ _title, info, categories, prefix }) {
            let t = `╭───⬣ *YOUSAF-MD MENU* ──⬣\n`;
            t += ` | ● *Bot: ${info.bot}*\n`;
            t += ` | ● *Prefixes: ${info.prefix}*\n`;
            t += ` | ● *Plugins: ${info.total}*\n`;
            t += ` | ● *Version: ${info.version}*\n`;
            t += ` | ● *Time: ${info.time}*\n`;
            t += ` | ● 👤 *Owner: ${info.owner}*\n`;
            t += ` | ● 📅 *Date: ${info.date}*\n`;
            for (const [cat, cmds] of categories) {
                t += ` |───⬣ *${cat.toUpperCase()}* ──⬣\n`;
                for (const c of cmds)
                    t += ` | ● ${prefix}${c}\n`;
            }
            t += `╰──────────⬣`;
            return t;
        }
    }
];
function renderPremiumMenu({ info, categories, prefix }) {
    let t = `╔═══════════════════════╗\n`;
    t += `║   ⚡ *${info.bot.toUpperCase()}* ⚡\n`;
    t += `╚═══════════════════════╝\n\n`;
    t += `┌─「 📋 *BOT INFO* 」\n`;
    t += `│ 👑 *Owner:* ${info.owner}\n`;
    t += `│ 📅 *Date:* ${info.date}\n`;
    t += `│ ⏰ *Time:* ${info.time}\n`;
    t += `│ 🔖 *Version:* ${info.version}\n`;
    t += `│ 🔧 *Prefix:* ${info.prefix}\n`;
    t += `│ 📦 *Plugins:* ${info.total}\n`;
    t += `└──────────────────\n`;
    t += `✧───────────────────✧\n\n`;
    for (const [cat, cmds] of categories) {
        t += `┌─「 ${cat.toUpperCase()} 」\n`;
        for (const c of cmds)
            t += `│ ➤ ${prefix}${c}\n`;
        t += `└──────────────────\n`;
    }
    return t;
}
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
export default {
    command: 'menu',
    aliases: ['help', 'commands', 'h', 'list'],
    category: 'general',
    description: 'Show all commands',
    usage: '.menu [command]',
    async handler(sock, message, args, context) {
        const { chatId, channelInfo } = context;
        const prefix = config.prefixes[0];
        const imagePath = path.join(process.cwd(), 'assets/thumb.png');
        if (args.length) {
            const searchTerm = args[0].toLowerCase();
            let cmd = commandHandler.commands.get(searchTerm);
            if (!cmd && commandHandler.aliases.has(searchTerm)) {
                const mainCommand = commandHandler.aliases.get(searchTerm);
                cmd = commandHandler.commands.get(mainCommand);
            }
            if (!cmd) {
                return sock.sendMessage(chatId, {
                    text: `❌ Command "${args[0]}" not found.\n\nUse ${prefix}menu to see all commands.`,
                    ...channelInfo
                }, { quoted: message });
            }
            const text = `╭━━━━━━━━━━━━━━⬣
┃ 📌 *COMMAND INFO*
┃
┃ ⚡ *Command:* ${prefix}${cmd.command}
┃ 📝 *Desc:* ${cmd.description || 'No description'}
┃ 📖 *Usage:* ${cmd.usage || `${prefix}${cmd.command}`}
┃ 🏷️ *Category:* ${cmd.category || 'misc'}
┃ 🔖 *Aliases:* ${cmd.aliases?.length ? cmd.aliases.map((a) => prefix + a).join(', ') : 'None'}
┃
╰━━━━━━━━━━━━━━⬣`;
            if (fs.existsSync(imagePath)) {
                return sock.sendMessage(chatId, {
                    image: { url: imagePath },
                    caption: text,
                    ...channelInfo
                }, { quoted: message });
            }
            return sock.sendMessage(chatId, { text, ...channelInfo }, { quoted: message });
        }
        const text = renderPremiumMenu({
            info: {
                bot: config.botName,
                prefix: config.prefixes.join(', '),
                total: commandHandler.commands.size,
                version: config.version || "6.0.0",
                time: formatTime(),
                owner: config.botOwner,
                date: formatDate()
            },
            categories: commandHandler.categories,
            prefix
        });
        const socials =
            `\n✧───────────────────✧\n` +
            `┌─「 🔗 *CONNECT WITH US* 」\n` +
            `│ 📢 *Channel:*\n` +
            `│ ${config.channelLink}\n` +
            `│\n` +
            `│ 🎥 *YouTube:*\n` +
            `│ ${config.youtubeLink}\n` +
            `│\n` +
            `│ 🎵 *TikTok:*\n` +
            `│ ${config.tiktokLink}\n` +
            `│\n` +
            `│ 💻 *GitHub:*\n` +
            `│ ${config.githubLink}\n` +
            `│\n` +
            `│ 📱 *WhatsApp:*\n` +
            `│ ${config.whatsappLink}\n` +
            `└──────────────────\n` +
            `✧───────────────────✧`;
        const fullText = text + socials;
        if (fs.existsSync(imagePath)) {
            await sock.sendMessage(chatId, {
                image: { url: imagePath },
                caption: fullText,
                ...channelInfo
            }, { quoted: message });
        }
        else {
            await sock.sendMessage(chatId, { text: fullText, ...channelInfo }, { quoted: message });
        }
        const voicePath = path.join(process.cwd(), 'assets/menu-voice.m4a');
        if (fs.existsSync(voicePath)) {
            try {
                await sock.sendMessage(chatId, {
                    audio: { url: voicePath },
                    mimetype: 'audio/mp4',
                    ptt: true
                }, { quoted: message });
            } catch (_) {}
        }
    }
};
/*****************************************************************************
 *                                                                           *
 *                     Developed By Muhammad Yousaf Baloch                                *
 *                                                                           *
 *  🌐  GitHub   : https://github.com/yousafpubg110-tech                         *
 *  ▶️  YouTube  : https://www.youtube.com/@Yousaf_Baloch_Tech                       *
 *  💬  WhatsApp : https://whatsapp.com/channel/0029Vb3Uzps6buMH2RvGef0j     *
 *                                                                           *
 *    © 2026 MR YOUSAF BALOCH. All rights reserved.                            *
 *                                                                           *
 *    Description: This file is part of the YOUSAF-MD Project.                 *
 *                 Unauthorized copying or distribution is prohibited.       *
 *                                                                           *
 *****************************************************************************/
