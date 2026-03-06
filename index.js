// ============================================================
//   YOUSAF-MD — MASTER PROCESS MANAGER
//   Boots server + restores all saved sessions on startup
//   Developer: Muhammad Yousaf Baloch
// ============================================================

'use strict';

const { restoreAllSessions } = require('./lib/SessionManager');
const Database               = require('./lib/Database');
const config                 = require('./config');
const fs                     = require('fs-extra');

// ── ASCII BANNER ───────────────────────────────────────────
const banner = `
██╗   ██╗ ██████╗ ██╗   ██╗███████╗ █████╗ ███████╗      ███╗   ███╗██████╗
╚██╗ ██╔╝██╔═══██╗██║   ██║██╔════╝██╔══██╗██╔════╝      ████╗ ████║██╔══██╗
 ╚████╔╝ ██║   ██║██║   ██║███████╗███████║█████╗  █████╗██╔████╔██║██║  ██║
  ╚██╔╝  ██║   ██║██║   ██║╚════██║██╔══██║██╔══╝  ╚════╝██║╚██╔╝██║██║  ██║
   ██║   ╚██████╔╝╚██████╔╝███████║██║  ██║██║           ██║ ╚═╝ ██║██████╔╝
   ╚═╝    ╚═════╝  ╚═════╝ ╚══════╝╚═╝  ╚═╝╚═╝           ╚═╝     ╚═╝╚═════╝

  v${config.BOT_VERSION} | Zero-Config WhatsApp Bot Platform
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

  const stats = Database.stats();
  console.log(`[BOOT] Database loaded — ${stats.instances} instance(s), ${stats.admins} admin(s)`);

  // Start the web pairing server in background
  const server = require('./server');

  // Restore all existing sessions
  console.log('[BOOT] Restoring active bot sessions...');
  await restoreAllSessions();

  console.log(`\n[BOOT] ✅ YOUSAF-MD is fully operational!`);
  console.log(`[BOOT] 🌐 Pairing dashboard: http://localhost:${config.PORT}`);
  console.log(`[BOOT] 👑 Developer: ${config.OWNER_NAME}`);
}

main().catch((err) => {
  console.error('[FATAL] Startup failed:', err.message);
  process.exit(1);
});

