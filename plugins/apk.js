import gplay from 'google-play-scraper';

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
            // package id (e.g. "com.whatsapp"). This uses google-play-scraper,
            // which is reliable and confirmed working.
            const results = await gplay.search({ term: query, num: 1 });
            if (!results || !results.length) {
                return sock.sendMessage(chatId, {
                    text: `❌ No app found for "${query}" on the Play Store. Try a more specific name.`,
                }, { quoted: message });
            }
            const app = results[0];

            await sock.sendMessage(chatId, { react: { text: '⬇️', key: message.key } });

            // Step 2: build the direct APKPure download link ourselves —
            // this is APKPure's own public download-button URL pattern
            // (https://d.apkpure.com/b/XAPK/<packageId>?version=latest),
            // so no fragile third-party scraping library is needed at all.
            const downloadLink = `https://d.apkpure.com/b/XAPK/${app.appId}?version=latest`;

            const caption =
                `📱 *APK DOWNLOADER*\n\n` +
                `▢ *App:* ${app.title}\n` +
                `▢ *Developer:* ${app.developer || 'Unknown'}\n` +
                `▢ *Package:* ${app.appId}\n\n` +
                `⬇️ Sending the file now...`;

            await sock.sendMessage(chatId, { text: caption }, { quoted: message });

            await sock.sendMessage(chatId, {
                document: { url: downloadLink },
                fileName: `${app.title.replace(/[^a-zA-Z0-9 ]/g, '')}.xapk`,
                mimetype: 'application/octet-stream',
                caption: `✅ ${app.title}\n\n📦 This is an XAPK file. If your phone can't install it directly, use the free "APKPure" app (search it on Play Store) to install XAPK files, or ask me for a regular APK-only app instead.`,
            }, { quoted: message });

        } catch (err) {
            console.error('[APK ERROR]:', err.message);
            await sock.sendMessage(chatId, {
                text: `❌ *APK Download Failed!*\n_Reason: ${err.message}_\n\nThe app store or download source may be temporarily unavailable.`,
            }, { quoted: message });
        }
    }
};
