import { downloadContentFromMessage } from '@whiskeysockets/baileys';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import webp from 'node-webpmux';
import crypto from 'crypto';

export default {
    command: 'sticker',
    aliases: ['stik', 's'],
    category: 'stickers',
    description: 'Convert an image or video into a branded sticker',
    usage: '.sticker (reply to image/video)',
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const config = context.config;
        try {
            const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            if (!quotedMsg) {
                await sock.sendMessage(chatId, { text: '⚠️ Please reply to an image or video!' }, { quoted: message });
                return;
            }
            const type = Object.keys(quotedMsg)[0];
            if (!['imageMessage', 'videoMessage'].includes(type)) {
                await sock.sendMessage(chatId, { text: '⚠️ Please reply to an image or video!' }, { quoted: message });
                return;
            }
            const stream = await downloadContentFromMessage(quotedMsg[type], type.split('Message')[0]);
            let buffer = Buffer.from([]);
            for await (const chunk of stream)
                buffer = Buffer.concat([buffer, chunk]);
            const tempDir = path.join('./temp');
            if (!fs.existsSync(tempDir))
                fs.mkdirSync(tempDir, { recursive: true });
            const tempInput = path.join(tempDir, `temp_${Date.now()}.${type === 'imageMessage' ? 'jpg' : 'mp4'}`);
            const tempOutput = path.join(tempDir, `sticker_${Date.now()}.webp`);
            fs.writeFileSync(tempInput, buffer);
            await new Promise((resolve, reject) => {
                const cmd = type === 'imageMessage'
                    ? `ffmpeg -i "${tempInput}" -vf "scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease" "${tempOutput}"`
                    : `ffmpeg -i "${tempInput}" -vf "scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease" -c:v libwebp -preset default -loop 0 -vsync 0 -t 6 "${tempOutput}"`;
                exec(cmd, (error) => {
                    if (error)
                        reject(error);
                    else
                        resolve(undefined);
                });
            });

            // Tag the sticker with pack name + owner info (pure JS, no sharp —
            // works on every platform including Termux).
            let finalBuffer = fs.readFileSync(tempOutput);
            try {
                const img = new webp.Image();
                await img.load(finalBuffer);
                const json = {
                    'sticker-pack-id': crypto.randomBytes(32).toString('hex'),
                    'sticker-pack-name': config?.packname || 'YOUSAF-MD',
                    'sticker-pack-publisher': 'MR YOUSAF BALOCH | 923710636110 | Bot Deploy Free | Contact Me',
                    'emojis': ['🤖'],
                };
                const exifAttr = Buffer.from([
                    0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00,
                    0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00,
                ]);
                const jsonBuffer = Buffer.from(JSON.stringify(json), 'utf8');
                const exif = Buffer.concat([exifAttr, jsonBuffer]);
                exif.writeUIntLE(jsonBuffer.length, 14, 4);
                img.exif = exif;
                finalBuffer = await img.save(null);
            } catch (exifErr) {
                console.error('[STICKER EXIF WARN]:', exifErr.message);
                // If tagging fails for any reason, still send the plain sticker
                // rather than blocking the whole command.
            }

            await sock.sendMessage(chatId, { sticker: finalBuffer }, { quoted: message });
            fs.unlinkSync(tempInput);
            fs.unlinkSync(tempOutput);
        }
        catch (error) {
            console.error('Sticker Command Error:', error);
            await sock.sendMessage(chatId, { text: '❌ Failed to create sticker!' }, { quoted: message });
        }
    }
};
