/*
╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃   YOUSAF-BALOCH-MD  •  Utils Library   ┃
┃        Created by MR YOUSAF BALOCH     ┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
*/

export function sanitizeUrl(url) {
  try {
    if (!url || typeof url !== 'string') return null;
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) return null;
    return parsed.href;
  } catch { return null; }
}

export function formatNumber(num) {
  if (!num || isNaN(num)) return '0';
  if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
  if (num >= 1000000)    return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000)       return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

export function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k     = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i     = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function formatDuration(seconds) {
  if (!seconds) return '0s';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export function formatUptime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${h}h ${m}m ${s}s`;
}

export function randomString(length = 10) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result  = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function randomItem(arr) {
  if (!arr || !arr.length) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}

export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function isUrl(str) {
  try { new URL(str); return true; } catch { return false; }
}

export function containsBadWords(text, badWords = []) {
  if (!text || !badWords.length) return false;
  const lower = text.toLowerCase();
  return badWords.some(word => lower.includes(word.toLowerCase()));
}

export function extractMentions(msg) {
  return msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
}

export function getQuotedMessage(msg) {
  const context = msg.message?.extendedTextMessage?.contextInfo;
  if (!context?.quotedMessage) return null;
  return {
    message: context.quotedMessage,
    sender:  context.participant,
    id:      context.stanzaId,
  };
}

export function isValidPhoneNumber(number) {
  const cleaned = number.replace(/[^0-9]/g, '');
  return cleaned.length >= 10 && cleaned.length <= 15;
}

export function cleanPhoneNumber(number) {
  return number.replace(/[^0-9]/g, '');
}

export function cleanPhone(num) {
  return num?.replace(/[^0-9]/g, '') || '';
}

export function truncate(text, maxLength = 100) {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function capitalize(text) {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

export function parseArgs(text) {
  if (!text) return { command: '', args: [] };
  const parts = text.trim().split(/\s+/);
  return {
    command: parts[0]?.toLowerCase() || '',
    args:    parts.slice(1),
  };
}

export async function getBuffer(url) {
  const axios = (await import('axios')).default;
  const res   = await axios.get(url, { responseType: 'arraybuffer', timeout: 30000 });
  return Buffer.from(res.data);
}

export default {
  sanitizeUrl,
  formatNumber,
  formatBytes,
  formatDuration,
  formatUptime,
  randomString,
  randomItem,
  sleep,
  isUrl,
  containsBadWords,
  extractMentions,
  getQuotedMessage,
  isValidPhoneNumber,
  cleanPhoneNumber,
  cleanPhone,
  truncate,
  capitalize,
  parseArgs,
  getBuffer,
};
