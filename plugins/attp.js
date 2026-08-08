import { spawn } from 'child_process';
import fs from 'fs';
import { writeExifVid } from '../lib/exif.js';

export default {
    command: 'attp',
    aliases: ['texts', 'textsticker', 'ttp'],
    category: 'stickers',
    description: 'Generate an animated color-cycling sticker from text',
    usage: '.attp <text>',
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const config = context.config;
        const text = args.join(' ');
        if (!text) {
            return await sock.sendMessage(chatId, { text: 'Please provide text after the .attp command.' }, { quoted: message });
        }
        try {
            const webpBuffer = await renderBlinkingWebpWithFfmpeg(text);
            const webpPath = await writeExifVid(webpBuffer, {
                packname: config?.packname || 'YOUSAF-MD',
                author: config?.botOwner || 'Muhammad Yousaf Baloch',
            });
            const finalBuffer = fs.readFileSync(webpPath);
            try { fs.unlinkSync(webpPath); } catch { }
            await sock.sendMessage(chatId, { sticker: finalBuffer }, { quoted: message });
        }
        catch (err) {
            console.error('[ATTP ERROR]:', err.message);
            await sock.sendMessage(chatId, { text: '❌ Failed to generate the sticker locally.' }, { quoted: message });
        }
    }
};

// Renders animated (color-blinking) text directly as an ANIMATED WEBP —
// no intermediate mp4/h264 step, no sharp — so this works on every
// platform ffmpeg itself supports, including Termux.
function renderBlinkingWebpWithFfmpeg(text) {
    return new Promise((resolve, reject) => {
        const fontPath = process.platform === 'win32'
            ? 'C:/Windows/Fonts/arialbd.ttf'
            : '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf';
        const escapeDrawtextText = (s) => s
            .replace(/\\/g, '\\\\')
            .replace(/:/g, '\\:')
            .replace(/,/g, '\\,')
            .replace(/'/g, "\\'")
            .replace(/\[/g, '\\[')
            .replace(/\]/g, '\\]')
            .replace(/%/g, '\\%');
        const safeText = escapeDrawtextText(text);
        const safeFontPath = process.platform === 'win32'
            ? fontPath.replace(/\\/g, '/').replace(':', '\\:')
            : fontPath;

        const cycle = 0.3;
        const dur = 1.8; // 6 cycles
        const drawRed = `drawtext=fontfile='${safeFontPath}':text='${safeText}':fontcolor=red:borderw=2:bordercolor=black@0.6:fontsize=56:x=(w-text_w)/2:y=(h-text_h)/2:enable='lt(mod(t,${cycle}),0.1)'`;
        const drawBlue = `drawtext=fontfile='${safeFontPath}':text='${safeText}':fontcolor=blue:borderw=2:bordercolor=black@0.6:fontsize=56:x=(w-text_w)/2:y=(h-text_h)/2:enable='between(mod(t,${cycle}),0.1,0.2)'`;
        const drawGreen = `drawtext=fontfile='${safeFontPath}':text='${safeText}':fontcolor=green:borderw=2:bordercolor=black@0.6:fontsize=56:x=(w-text_w)/2:y=(h-text_h)/2:enable='gte(mod(t,${cycle}),0.2)'`;
        const filter = `${drawRed},${drawBlue},${drawGreen}`;

        const args = [
            '-y',
            '-f', 'lavfi',
            '-i', `color=c=black@0.0:s=512x512:d=${dur}:r=15`,
            '-vf', filter + ',format=rgba',
            '-c:v', 'libwebp',
            '-loop', '0',
            '-vsync', '0',
            '-pix_fmt', 'yuva420p',
            '-quality', '75',
            '-compression_level', '6',
            '-t', String(dur),
            '-f', 'webp',
            'pipe:1'
        ];
        const ff = spawn('ffmpeg', args);
        const chunks = [];
        const errors = [];
        ff.stdout.on('data', d => chunks.push(d));
        ff.stderr.on('data', e => errors.push(e));
        ff.on('error', reject);
        ff.on('close', code => {
            if (code === 0) return resolve(Buffer.concat(chunks));
            reject(new Error(Buffer.concat(errors).toString() || `ffmpeg exited with code ${code}`));
        });
    });
}
