// Centralized WhatsApp Channel "View Channel" button config.
// IMPORTANT: newsletterJid must be YOUR channel's real internal JID
// (looks like "1203xxxxxxxxxxxxx@newsletter"), NOT the invite-link code.
// Run `.channelid <your invite link>` once your bot is connected (owner-only
// utility plugin included in plugins/get-channel-id.js) to fetch it, then
// put the result in your .env as CHANNEL_JID=xxxxxxxxxxxxx@newsletter
//
// newsletterName is intentionally NOT read from process.env — a stray/old
// BOT_NAME value in a local .env file must never be able to make the bot
// show anything other than the permanent brand name.
import config from '../config.js';
const channelInfo = {
    contextInfo: {
        forwardingScore: 1,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: process.env.CHANNEL_JID || 'YOUR_CHANNEL_JID_HERE@newsletter',
            newsletterName: `${config.botName} Official`,
            serverMessageId: -1
        }
    }
};
export { channelInfo };
