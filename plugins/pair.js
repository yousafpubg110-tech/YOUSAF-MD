export default {
    command: 'pair',
    aliases: ['paircode', 'session', 'getsession', 'sessionid'],
    category: 'general',
    description: 'Get session id for YOUSAF-MD',
    usage: '.pair 92305395XXXX',
    async handler(sock, message, args, context) {
        const { chatId, channelInfo } = context;
        const text =
            "⚠️ *Feature Unavailable*\n\n" +
            "Remote session generation is not available here.\n\n" +
            "To deploy your own free YOUSAF-MD bot, please contact:\n\n" +
            "╭──「 👑 *OWNER INFO* 」\n" +
            "│\n" +
            "│ *Name:* MUHAMMAD YOUSAF BALOCH\n" +
            "│ *Number:* wa.me/923710636110\n" +
            "│ *Bot:* YOUSAF-MD\n" +
            "│\n" +
            "├──「 🔗 *CONNECT WITH US* 」\n" +
            "│ 📢 Channel: https://whatsapp.com/channel/0029Vb3Uzps6buMH2RvGef0j\n" +
            "│ ▶️ YouTube: https://www.youtube.com/@Yousaf_Baloch_Tech\n" +
            "│ 🎵 TikTok: https://tiktok.com/@loser_boy.110\n" +
            "│ 💻 GitHub: https://github.com/yousafpubg110-tech\n" +
            "│ 💬 WhatsApp: https://wa.me/923710636110\n" +
            "╰────────────────✧";
        await sock.sendMessage(chatId, {
            text,
            ...channelInfo
        }, { quoted: message });
    }
};
