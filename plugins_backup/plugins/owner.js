import fs from 'fs';
import path from 'path';

export default {
    command: 'owner',
    aliases: ['creator'],
    category: 'info',
    description: 'Get the full contact & social info of the bot owner',
    usage: '.owner',
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const config = context.config;
        try {
            const vcard = `
BEGIN:VCARD
VERSION:3.0
FN:${config.botOwner}
TEL;waid=${config.ownerNumber}:${config.ownerNumber}
END:VCARD
      `.trim();

            const infoText =
                `╭──「 👑 *OWNER INFO* 」\n` +
                `│\n` +
                `│ *Name:* ${config.botOwner}\n` +
                `│ *Number:* wa.me/${config.ownerNumber}\n` +
                `│ *Bot:* ${config.botName}\n` +
                `│\n` +
                `├──「 🔗 *CONNECT WITH US* 」\n` +
                `│ 📢 Channel: ${config.channelLink}\n` +
                `│ ▶️ YouTube: ${config.youtubeLink}\n` +
                `│ 🎵 TikTok: ${config.tiktokLink}\n` +
                `│ 💻 GitHub: ${config.githubLink}\n` +
                `│ 💬 WhatsApp: ${config.whatsappLink}\n` +
                `╰────────────────✧`;

            const ownerPhotoPath = path.join(process.cwd(), 'assets/owner.jpg');
            if (fs.existsSync(ownerPhotoPath)) {
                await sock.sendMessage(chatId, {
                    image: fs.readFileSync(ownerPhotoPath),
                    caption: infoText,
                }, { quoted: message });
            } else {
                await sock.sendMessage(chatId, { text: infoText }, { quoted: message });
            }

            // Also send the contact card so the number is saveable in one tap
            await sock.sendMessage(chatId, {
                contacts: { displayName: config.botOwner, contacts: [{ vcard }] },
            }, { quoted: message });
        }
        catch (error) {
            console.error('Owner Command Error:', error);
            await sock.sendMessage(chatId, {
                text: '❌ Failed to fetch owner info.'
            }, { quoted: message });
        }
    }
};
