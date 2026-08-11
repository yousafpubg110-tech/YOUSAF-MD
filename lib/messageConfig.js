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
        // Primary "View Channel" style button. This is an unofficial
        // WhatsApp trick, so it can occasionally fail client-side with
        // "Something went wrong" even when the JID is 100% correct —
        // that failure is on WhatsApp's own app, not this code.
        forwardedNewsletterMessageInfo: {
            newsletterJid: process.env.CHANNEL_JID || 'YOUR_CHANNEL_JID_HERE@newsletter',
            newsletterName: `${config.botName} Official`,
            serverMessageId: -1
        },
        // Reliable fallback: a small clickable link-preview card (like the
        // card WhatsApp shows when you share a link) — no raw URL text
        // needs to appear in the message body, but it always works.
        externalAdReply: {
            title: `${config.botName} Official Channel`,
            body: 'Tap to join',
            mediaType: 1,
            sourceUrl: config.channelLink,
            renderLargerThumbnail: false,
            showAdAttribution: false
        }
    }
};
export { channelInfo };
