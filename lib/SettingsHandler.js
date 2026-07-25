// ============================================================
//   YOUSAF-MD — SETTINGS HANDLER
//   Added: BOT_MODE (public/private), isPublic() method
//   Developer: Muhammad Yousaf Baloch
// ============================================================

'use strict';

const Database = require('./Database');

const SETTING_LABELS = {
  BOT_MODE:         '🌐 Bot Mode',
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

  get(jid) {
    return Database.getSettings(jid);
  },

  save(jid, settings) {
    return Database.saveSettings(jid, settings);
  },

  toggle(jid, key) {
    return Database.toggleSetting(jid, key.toUpperCase());
  },

  isEnabled(jid, key) {
    const settings = this.get(jid);
    return !!settings[key.toUpperCase()];
  },

  // ── BOT MODE ─────────────────────────────────────────
  // true = public (سب use کر سکتے ہیں)
  // false = private (صرف admin)
  isPublic(jid) {
    const settings = this.get(jid);
    return settings.BOT_MODE === true;
  },

  buildMenu(jid) {
    const settings = this.get(jid);
    const mode     = settings.BOT_MODE ? '🌐 *PUBLIC*' : '🔒 *PRIVATE*';

    let text  = `╔══════════════════════════════╗\n`;
    text     += `║  ⚙️  *YOUSAF-MD SETTINGS PANEL* ║\n`;
    text     += `╚══════════════════════════════╝\n\n`;
    text     += `🌐 *Bot Mode:* ${mode}\n`;
    text     += `  *.public*  → سب use کر سکتے ہیں\n`;
    text     += `  *.private* → صرف Admin\n\n`;
    text     += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;

    for (const [key, label] of Object.entries(SETTING_LABELS)) {
      if (key === 'BOT_MODE') continue;
      const status = settings[key] ? '🟢 *ON*' : '🔴 *OFF*';
      text += `${label}: ${status}\n`;
    }

    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `\n*Commands:*\n`;
    text += `  .public / .private\n`;
    text += `  .set antidelete on/off\n`;
    text += `  .set antilink on/off\n`;
    text += `  .set welcome on/off\n\n`;
    text += `👑 *Bot Admin Controls Only*`;

    return text;
  },

  applyCommand(jid, args) {
    if (args.length < 2) {
      return { success: false, message: 'Usage: .set [feature] [on/off]' };
    }

    const featureRaw = args[0].toUpperCase().replace(/-/g, '_');
    const valueRaw   = args[1].toLowerCase();

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
      'MODE':          'BOT_MODE',
      'BOTMODE':       'BOT_MODE',
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
