import gplay from 'google-play-scraper';
import apkpureScrape from 'apkpure-scraper';

export default {
    command: 'apk',
    aliases: ['apkdl', 'appdownload'],
    category: 'download',
    description: 'Search and download an Android APK by app name',
    usage: '.apk <app name>',
    async handler(sock, message, args, context) {
        const { chatId } = context;
        const query = args.join(' ').trim();

        if (!query) {
            return sock.sendMessage(chatId, {
                text: '❌ Please provide an app name.\n\nExample:\n.apk WhatsApp',
            }, { quoted: message });
        }

        try {
            await sock.sendMessage(chatId, { react: { text: '🔎', key: message.key } });

            // Step 1: search Google Play for the app to get its real
            // package id (e.g. "com.whatsapp") — this is far more
            // reliable than guessing a name-based URL on a download site.
            const results = await gplay.search({ term: query, num: 1 });
            if (!results || !results.length) {
                return sock.sendMessage(chatId, {
                    text: `❌ No app found for "${query}" on the Play Store. Try a more specific name.`,
                }, { quoted: message });
            }
            const app = results[0];

            await sock.sendMessage(chatId, { react: { text: '⬇️', key: message.key } });

            // Step 2: fetch the actual APK download link for that package id.
            const apk = await apkpureScrape(app.appId);
            if (!apk || !apk.downloadLink) {
                return sock.sendMessage(chatId, {
                    text: `❌ Found "${app.title}" but couldn't get a download link right now. The source may be temporarily unavailable.`,
                }, { quoted: message });
            }

            const caption =
                `📱 *APK DOWNLOADER*\n\n` +
                `▢ *App:* ${app.title}\n` +
                `▢ *Developer:* ${app.developer || 'Unknown'}\n` +
                `▢ *Version:* ${apk.version || 'Latest'}\n` +
                `▢ *Package:* ${app.appId}\n\n` +
                `⬇️ Sending the APK now...`;

            await sock.sendMessage(chatId, { text: caption }, { quoted: message });

            await sock.sendMessage(chatId, {
                document: { url: apk.downloadLink },
                fileName: `${app.title.replace(/[^a-zA-Z0-9 ]/g, '')}.apk`,
                mimetype: 'application/vnd.android.package-archive',
                caption: `✅ ${app.title} (${apk.version || 'Latest'})`,
            }, { quoted: message });

        } catch (err) {
            console.error('[APK ERROR]:', err.message);
            await sock.sendMessage(chatId, {
                text: `❌ *APK Download Failed!*\n_Reason: ${err.message}_\n\nThe app store or download source may be temporarily unavailable.`,
            }, { quoted: message });
        }
    }
};
