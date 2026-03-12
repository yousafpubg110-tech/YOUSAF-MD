/*
╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃   YOUSAF-BALOCH-MD  •  Utils Library   ┃
┃        Created by MR YOUSAF BALOCH     ┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
*/

/**
 * Sanitize URL to prevent XSS and injection attacks
 * @param {string} url - URL to sanitize
 * @returns {string|null} - Sanitized URL or null if invalid
 */
export function sanitizeUrl(url) {
  try {
    if (!url || typeof url !== 'string') return null;
    const parsed = new URL(url);
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) return null;
    return parsed.href;
  } catch {
    return null;
  }
}

/**
 * Format number to readable format (K, M, B)
 * @param {number} num - Number to format
 * @returns {string} - Formatted number
 */
export function formatNumber(num) {
  if (!num || isNaN(num)) return '0';
  if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

/**
 * Format bytes to readable format (KB, MB, GB)
 * @param {number} bytes - Bytes to format
 * @returns {string} - Formatted bytes
 */
export function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Format time duration
 * @param {number} seconds - Seconds to format
 * @returns {string} - Formatted time
 */
export function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

/**
 * Generate random string
 * @param {number} length - Length of string
 * @returns {string} - Random string
 */
export function randomString(length = 10) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Sleep/delay function
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check if string contains bad words
 * @param {string} text - Text to check
 * @param {string[]} badWords - Array of bad words
 * @returns {boolean} - True if contains bad words
 */
export function containsBadWords(text, badWords = []) {
  if (!text || !badWords.length) return false;
  const lowerText = text.toLowerCase();
  return badWords.some(word => lowerText.includes(word.toLowerCase()));
}

/**
 * Extract mentioned JIDs from message
 * @param {object} msg - Message object
 * @returns {string[]} - Array of mentioned JIDs
 */
export function extractMentions(msg) {
  return msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
}

/**
 * Get quoted message info
 * @param {object} msg - Message object
 * @returns {object|null} - Quoted message info
 */
export function getQuotedMessage(msg) {
  const context = msg.message?.extendedTextMessage?.contextInfo;
  if (!context?.quotedMessage) return null;
  return {
    message: context.quotedMessage,
    sender: context.participant,
    id: context.stanzaId,
  };
}

/**
 * Validate phone number
 * @param {string} number - Phone number
 * @returns {boolean} - True if valid
 */
export function isValidPhoneNumber(number) {
  const cleaned = number.replace(/[^0-9]/g, '');
  return cleaned.length >= 10 && cleaned.length <= 15;
}

/**
 * Clean phone number
 * @param {string} number - Phone number
 * @returns {string} - Cleaned number
 */
export function cleanPhoneNumber(number) {
  return number.replace(/[^0-9]/g, '');
}

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} - Truncated text
 */
export function truncate(text, maxLength = 100) {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Capitalize first letter
 * @param {string} text - Text to capitalize
 * @returns {string} - Capitalized text
 */
export function capitalize(text) {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * Parse command arguments
 * @param {string} text - Command text
 * @returns {object} - Parsed arguments
 */
export function parseArgs(text) {
  if (!text) return { command: '', args: [] };
  const parts = text.trim().split(/\s+/);
  return {
    command: parts[0]?.toLowerCase() || '',
    args: parts.slice(1),
  };
}

export default {
  sanitizeUrl,
  formatNumber,
  formatBytes,
  formatDuration,
  randomString,
  sleep,
  containsBadWords,
  extractMentions,
  getQuotedMessage,
  isValidPhoneNumber,
  cleanPhoneNumber,
  truncate,
  capitalize,
  parseArgs,
};

