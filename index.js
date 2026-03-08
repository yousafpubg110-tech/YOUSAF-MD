// ============================================================
//   YOUSAF-MD — MASTER PROCESS MANAGER
//   Fixed: restoreAllSessions() call added on boot
//   Developer: Muhammad Yousaf Baloch
// ============================================================

'use strict';

const config = require('./config');
const fs     = require('fs-extra');
const { restoreAllSessions } = require('./lib/SessionManager');

// ── ASCII BANNER ───────────────────────────────────────────
const banner = `
██╗   ██╗ ██████╗ ██╗   ██╗███████╗ █████╗ ███████╗      ███╗   ███╗██████╗
╚██╗ ██╔╝██╔═══██╗██║   ██║██╔════╝██╔══██╗██╔════╝      ████╗ ████║██╔══██╗
 ╚████╔╝ ██║   ██║██║   ██║███████╗███████║█████╗  █████╗██╔████╔██║██║  ██║
  ╚██╔╝  ██║   ██║██║   ██║╚════██║██╔══██║██╔══╝  ╚════╝██║╚██╔╝██║██║  ██║
   ██║   ╚██████╔╝╚██████╔╝███████║██║  ██║██║           ██║ ╚═╝ ██║██████╔╝
   ╚═╝    ╚═════╝  ╚═════╝ ╚══════╝╚═╝  ╚═╝╚═╝           ╚═╝     ╚═╝╚═════╝

  v${config.BOT_VERSION} | Personal WhatsApp Bot Instance
  Developer: ${config.OWNER_NAME} | +${config.OWNER_NUMBER}
  GitHub: ${config.LINKS.GITHUB}
${'─'.repeat(75)}
`;

// ── ANTI-CRASH ────────────────────────────────────────────
process.on('uncaughtException', (err) => {
  console.error('[CRASH GUARD] Uncaught Exception:', err.message);
  console.error('[CRASH GUARD] Stack:', err.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[CRASH GUARD] Unhandled Rejection:', reason?.message || reason);
  console.error('[CRASH GUARD] Stack:', reason?.stack);
});

// ── STARTUP ───────────────────────────────────────────────
async function main() {
  console.log(banner);

  await fs.ensureDir('./sessions');
  await fs.ensureDir('./database');
  await fs.ensureDir('./temp');
  await fs.ensureDir('./assets');

  console.log('[BOOT] Starting personal bot instance...');

  // Start the web pairing server
  require('./server');

  // ✅ CRITICAL FIX: پرانی sessions restore کریں
  console.log('[BOOT] Restoring existing sessions...');
  await restoreAllSessions();

  console.log('[BOOT] Waiting for user to pair via dashboard...');
  console.log(`[BOOT] Open dashboard to pair your WhatsApp`);
  console.log(`[BOOT] Developer: ${config.OWNER_NAME}`);
}

main().catch((err) => {
  console.error('[FATAL] Startup failed:', err.message);
  console.error('[FATAL] Stack:', err.stack);
  process.exit(1);
});
