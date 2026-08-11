// Pure-JS sticker EXIF writer using node-webpmux — NO sharp / stickers-formatter
// dependency, so this works reliably on every platform including Termux/Android,
// unlike the old sharp-based implementation.
import webp from 'node-webpmux';
import crypto from 'crypto';
import path from 'path';
import { tmpdir } from 'os';
import fs from 'fs';

function randomFileName() {
    return path.join(tmpdir(), `${crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`);
}

/**
 * Writes WhatsApp sticker-pack EXIF metadata (pack name + author) into a
 * raw webp buffer and returns the finished buffer. The input MUST already
 * be a valid .webp buffer (image or animated) — this function does not do
 * any format conversion, only metadata tagging.
 */
async function tagWebpBuffer(webpBuffer, metadata) {
    const img = new webp.Image();
    await img.load(webpBuffer);
    const json = {
        'sticker-pack-id': crypto.randomBytes(32).toString('hex'),
        'sticker-pack-name': metadata.packname || 'YOUSAF-MD',
        'sticker-pack-publisher': metadata.author || 'MR YOUSAF BALOCH | 923710636110 | Bot Deploy Free | Contact Me',
        'emojis': metadata.categories?.length ? metadata.categories : ['🤖'],
    };
    const exifAttr = Buffer.from([
        0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00,
        0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00,
    ]);
    const jsonBuffer = Buffer.from(JSON.stringify(json), 'utf8');
    const exif = Buffer.concat([exifAttr, jsonBuffer]);
    exif.writeUIntLE(jsonBuffer.length, 14, 4);
    img.exif = exif;
    return await img.save(null);
}

// `media` here is expected to already be webp-encoded bytes (e.g. produced
// by ffmpeg). These helpers just attach the pack/author metadata.
export async function imageToWebp(media) {
    return await tagWebpBuffer(media, {});
}

export async function videoToWebp(media) {
    return await tagWebpBuffer(media, {});
}

export async function writeExifImg(media, metadata) {
    const buff = await tagWebpBuffer(media, metadata);
    const tmpFileOut = randomFileName();
    fs.writeFileSync(tmpFileOut, buff);
    return tmpFileOut;
}

export async function writeExifVid(media, metadata) {
    const buff = await tagWebpBuffer(media, metadata);
    const tmpFileOut = randomFileName();
    fs.writeFileSync(tmpFileOut, buff);
    return tmpFileOut;
}

export async function writeExif(media, metadata) {
    const input = /webp|image|video/.test(media.mimetype) ? media.data : null;
    if (!input) return null;
    const buff = await tagWebpBuffer(input, metadata);
    const tmpFileOut = randomFileName();
    fs.writeFileSync(tmpFileOut, buff);
    return tmpFileOut;
}
