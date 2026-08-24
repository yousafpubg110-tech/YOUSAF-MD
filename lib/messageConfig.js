// Centralized WhatsApp Channel "View Channel" button config.
import config from '../config.js';
const channelInfo = {
    contextInfo: {
        forwardingScore: 1,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: process.env.CHANNEL_JID || '120363391372789917@newsletter',
            newsletterName: `${config.botName} Official`,
            serverMessageId: -1
        }
    }
};
export { channelInfo };
