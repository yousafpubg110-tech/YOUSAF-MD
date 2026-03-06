// ============================================================
//   YOUSAF-MD — SETTINGS HANDLER
//   Persists and retrieves per-instance bot settings
//   Developer: Muhammad Yousaf Baloch
// ============================================================

'use strict';

const Database = require('./Database');

const SETTING_LABELS = {
  ANTI_DELETE:      '🗑️  Anti-Delete',
  AUTO_STATUS_VIEW: '👁️  Auto-Status View',
  AUTO_LIKE_STATUS: '❤️  Auto-Like Status',
  ANTI_CALL:        '📵 Anti-Call',
  ANTI_LINK:        '🔗 Anti-Link',
  WELCOME_MSG:      '👋 Welcome Message',
  GOODBYE_MSG:      '👋 Goodbye Message',
  AUTO_REACT:       '⚡ Auto-React',
};

const SettingsHandler = {

  /** Get all settings for a JID */
  get(jid) {
    return Database.getSettings(jid);
  },

  /** Save full settings object */
  save(jid, settings) {
    return Database.saveSettings(jid, settings);
  },

  /** Toggle a single setting and return new value */
  toggle(jid, key) {
    return Database.toggleSetting(jid, key.toUpperCase());
  },

  /** Check if a feature is enabled */
  isEnabled(jid, key) {
    const settings = this.get(jid);
    return !!settings[key.toUpperCase()];
  },

  /** Build the .settings menu text */
  buildMenu(jid) {
    const settings = this.get(jid);
    let text = `╔══════════════════════════════╗\n`;
    text    += `║  ⚙️  *YOUSAF-MD SETTINGS PANEL* ║\n`;
    text    += `╚══════════════════════════════╝\n\n`;
    text    += `Use *.set [feature] on/off* to toggle.\n\n`;
    text    += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;

    for (const [key, label] of Object.entries(SETTING_LABELS)) {
      const status = settings[key]
        ? '🟢 *ON*'
        : '🔴 *OFF*';
      text += `${label}: ${status}\n`;
    }

    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `\n*Examples:*\n`;
    text += `  .set antidelete on\n`;
    text += `  .set antilink off\n`;
    text += `  .set welcome on\n\n`;
    text += `👑 *Bot Admin Controls Only*`;

    return text;
  },

  /** Parse a .set command and apply it */
  applyCommand(jid, args) {
    if (args.length < 2) {
      return { success: false, message: 'Usage: .set [feature] [on/off]' };
    }

    const featureRaw = args[0].toUpperCase().replace(/-/g, '_');
    const valueRaw   = args[1].toLowerCase();

    // Fuzzy match aliases
    const aliases = {
      'ANTIDELETE':    'ANTI_DELETE',
      'STATUSVIEW':    'AUTO_STATUS_VIEW',
      'AUTOSTATUS':    'AUTO_STATUS_VIEW',
      'AUTOLIKE':      'AUTO_LIKE_STATUS',
      'ANTICALL':      'ANTI_CALL',
      'ANTILINK':      'ANTI_LINK',
      'WELCOME':       'WELCOME_MSG',
      'GOODBYE':       'GOODBYE_MSG',
      'AUTOREACT':     'AUTO_REACT',
    };

    const key = aliases[featureRaw] || featureRaw;

    if (!SETTING_LABELS[key]) {
      return {
        success: false,
        message: `❌ Unknown feature: *${args[0]}*\nUse *.settings* to see all options.`,
      };
    }

    if (!['on', 'off', '1', '0', 'true', 'false'].includes(valueRaw)) {
      return { success: false, message: 'Value must be *on* or *off*.' };
    }

    const newValue = ['on', '1', 'true'].includes(valueRaw);
    const settings = this.get(jid);
    settings[key]  = newValue;
    this.save(jid, settings);

    const label = SETTING_LABELS[key];
    const emoji = newValue ? '🟢 *ENABLED*' : '🔴 *DISABLED*';

    return {
      success: true,
      message: `✅ *Setting Updated*\n\n${label} → ${emoji}`,
    };
  },
};

module.exports = SettingsHandler;

