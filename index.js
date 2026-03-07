// ============================================================
//   YOUSAF-MD — MASTER PROCESS MANAGER
//   Personal Instance Bot - No central session management
//   Developer: Muhammad Yousaf Baloch
// ============================================================

'use strict';

const config = require('./config');
const fs     = require('fs-extra');

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
});

process.on('unhandledRejection', (reason) => {
  console.error('[CRASH GUARD] Unhandled Rejection:', reason?.message || reason);
});

// ── STARTUP ───────────────────────────────────────────────
async function main() {
  console.log(banner);

  // Ensure required directories exist
  await fs.ensureDir('./sessions');
  await fs.ensureDir('./database');
  await fs.ensureDir('./temp');
  await fs.ensureDir('./assets');

  console.log('[BOOT] Starting personal bot instance...');

  // Start the web pairing server
  require('./server');

  console.log('[BOOT] Waiting for user to pair via dashboard...');
  console.log(`[BOOT] Open dashboard to pair your WhatsApp`);
  console.log(`[BOOT] Developer: ${config.OWNER_NAME}`);
}

main().catch((err) => {
  console.error('[FATAL] Startup failed:', err.message);
  process.exit(1);
});
