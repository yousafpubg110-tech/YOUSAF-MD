// ============================================================
//   YOUSAF-MD — WEB PAIRING SERVER
//   Live dashboard with Socket.io real-time feedback
//   Supports 100+ concurrent pairing slots
//   Developer: Muhammad Yousaf Baloch
// ============================================================

'use strict';

const express    = require('express');
const http       = require('http');
const { Server } = require('socket.io');
const rateLimit  = require('express-rate-limit');
const path       = require('path');
const config     = require('./config');
const { generatePairingCode } = require('./lib/SessionManager');
const Database   = require('./lib/Database');

const app    = express();
const server = http.createServer(app);
const io     = new Server(server, { cors: { origin: '*' } });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'assets')));

// ── RATE LIMITING ─────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max:      5,
  message:  { error: 'Too many pairing requests. Please wait 1 minute.' },
});

// ── HTML DASHBOARD ────────────────────────────────────────
const DASHBOARD_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>YOUSAF-MD | Pairing Dashboard</title>
  <script src="https://cdn.socket.io/4.7.5/socket.io.min.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
    }
    .card {
      background: rgba(255,255,255,0.07);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 24px;
      padding: 48px 40px;
      max-width: 480px;
      width: 100%;
      box-shadow: 0 32px 64px rgba(0,0,0,0.4);
      text-align: center;
    }
    .logo {
      font-size: 2.4rem;
      font-weight: 900;
      background: linear-gradient(90deg, #00f2fe, #4facfe, #a18cd1);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 6px;
      letter-spacing: 2px;
    }
    .tagline {
      color: rgba(255,255,255,0.5);
      font-size: 0.85rem;
      margin-bottom: 36px;
    }
    .step {
      background: rgba(255,255,255,0.05);
      border-radius: 12px;
      padding: 10px 16px;
      margin-bottom: 20px;
      font-size: 0.82rem;
      color: rgba(255,255,255,0.65);
      text-align: left;
      line-height: 1.6;
    }
    .step b { color: #4facfe; }
    .input-group {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
    }
    input[type="text"] {
      flex: 1;
      padding: 14px 18px;
      border-radius: 12px;
      border: 1px solid rgba(255,255,255,0.2);
      background: rgba(255,255,255,0.08);
      color: #fff;
      font-size: 1rem;
      outline: none;
      transition: border 0.2s;
    }
    input[type="text"]::placeholder { color: rgba(255,255,255,0.35); }
    input[type="text"]:focus { border-color: #4facfe; }
    button {
      padding: 14px 22px;
      background: linear-gradient(90deg, #4facfe, #00f2fe);
      border: none;
      border-radius: 12px;
      color: #000;
      font-weight: 700;
      font-size: 0.95rem;
      cursor: pointer;
      transition: opacity 0.2s, transform 0.1s;
      white-space: nowrap;
    }
    button:hover { opacity: 0.88; transform: translateY(-1px); }
    button:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
    .code-display {
      display: none;
      background: rgba(79,172,254,0.1);
      border: 1px solid #4facfe;
      border-radius: 14px;
      padding: 22px;
      margin: 20px 0;
    }
    .code-display.show { display: block; }
    .code-label { font-size: 0.75rem; color: rgba(255,255,255,0.5); margin-bottom: 8px; }
    .code-value {
      font-size: 2rem;
      font-weight: 900;
      letter-spacing: 8px;
      color: #00f2fe;
      font-family: monospace;
    }
    .status-msg {
      font-size: 0.85rem;
      padding: 10px;
      border-radius: 8px;
      margin-top: 14px;
      display: none;
    }
    .status-msg.show { display: block; }
    .status-msg.info    { background: rgba(79,172,254,0.15); color: #4facfe; }
    .status-msg.success { background: rgba(0,255,140,0.12); color: #00ff8c; }
    .status-msg.error   { background: rgba(255,80,80,0.12);  color: #ff5050; }
    .links {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid rgba(255,255,255,0.1);
      font-size: 0.78rem;
      color: rgba(255,255,255,0.4);
    }
    .links a { color: #4facfe; text-decoration: none; margin: 0 6px; }
    .links a:hover { text-decoration: underline; }
    .owner { font-size: 0.8rem; color: rgba(255,255,255,0.5); margin-top: 10px; }
    .spinner {
      display: inline-block;
      width: 14px; height: 14px;
      border: 2px solid rgba(0,0,0,0.3);
      border-top-color: #000;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
      margin-right: 6px;
      vertical-align: middle;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
</head>
<body>
<div class="card">
  <div class="logo">YOUSAF-MD</div>
  <div class="tagline">Zero-Config WhatsApp Bot Platform v${config.BOT_VERSION}</div>

  <div class="step">
    <b>Step 1:</b> Enter your WhatsApp number with country code (no + or spaces)<br>
    <b>Example:</b> 923001234567
  </div>
  <div class="step">
    <b>Step 2:</b> Open WhatsApp → Linked Devices → Link a Device → Enter the code shown below
  </div>

  <div class="input-group">
    <input type="text" id="phoneInput" placeholder="923001234567" maxlength="15" />
    <button id="pairBtn" onclick="requestCode()">Get Code</button>
  </div>

  <div class="code-display" id="codeBox">
    <div class="code-label">Enter this code in WhatsApp ↓</div>
    <div class="code-value" id="codeValue">----</div>
    <div style="font-size:0.72rem;color:rgba(255,255,255,0.4);margin-top:8px;">Code expires in 60 seconds</div>
  </div>

  <div class="status-msg" id="statusMsg"></div>

  <div class="links">
    <a href="${config.LINKS.GITHUB}" target="_blank">📦 GitHub</a>
    <a href="${config.LINKS.TIKTOK}" target="_blank">🎵 TikTok</a>
    <a href="${config.LINKS.YOUTUBE}" target="_blank">📺 YouTube</a>
    <a href="${config.LINKS.WHATSAPP}" target="_blank">📢 Channel</a>
  </div>
  <div class="owner">👑 Developer: ${config.OWNER_NAME} | +${config.OWNER_NUMBER}</div>
</div>

<script>
  const socket = io();

  function showStatus(msg, type = 'info') {
    const el = document.getElementById('statusMsg');
    el.textContent = msg;
    el.className = 'status-msg show ' + type;
  }

  async function requestCode() {
    const phone = document.getElementById('phoneInput').value.trim().replace(/\\D/g, '');
    if (phone.length < 10) return showStatus('❌ Enter a valid phone number.', 'error');

    const btn = document.getElementById('pairBtn');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span>Generating...';
    showStatus('⏳ Connecting to WhatsApp servers...', 'info');

    try {
      const res  = await fetch('/api/pair', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ phone }),
      });
      const data = await res.json();

      if (data.error) {
        showStatus('❌ ' + data.error, 'error');
        btn.disabled = false;
        btn.textContent = 'Get Code';
        return;
      }

      document.getElementById('codeValue').textContent = data.code;
      document.getElementById('codeBox').classList.add('show');
      showStatus('✅ Code generated! Enter it in WhatsApp → Linked Devices → Link a Device', 'success');
      btn.textContent = 'Regenerate';
      btn.disabled = false;

      socket.emit('watch', { instanceId: data.instanceId });
    } catch (e) {
      showStatus('❌ Server error. Please try again.', 'error');
      btn.disabled = false;
      btn.textContent = 'Get Code';
    }
  }

  socket.on('bot_connected', (data) => {
    showStatus('🟢 Bot is LIVE! Check your WhatsApp for the welcome message.', 'success');
  });

  document.getElementById('phoneInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') requestCode();
  });
</script>
</body>
</html>`;

// ── ROUTES ────────────────────────────────────────────────

app.get('/', (req, res) => {
  res.send(DASHBOARD_HTML);
});

app.post('/api/pair', limiter, async (req, res) => {
  const { phone } = req.body;

  if (!phone || !/^\d{10,15}$/.test(phone)) {
    return res.status(400).json({ error: 'Invalid phone number format.' });
  }

  try {
    const { code, instanceId } = await generatePairingCode(phone);
    return res.json({ code, instanceId });
  } catch (e) {
    console.error('[SERVER] Pair error:', e.message);
    return res.status(500).json({ error: 'Failed to generate pairing code. Please try again.' });
  }
});

app.get('/api/stats', (req, res) => {
  res.json(Database.stats());
});

// ── SOCKET.IO ─────────────────────────────────────────────
io.on('connection', (socket) => {
  socket.on('watch', ({ instanceId }) => {
    if (instanceId) socket.join(`instance_${instanceId}`);
  });
});

// Export notifier so SessionManager can emit events
function notifyConnected(instanceId) {
  io.to(`instance_${instanceId}`).emit('bot_connected', { instanceId });
}

// ── START ─────────────────────────────────────────────────
server.listen(config.PORT, () => {
  console.log(`[SERVER] ✅ Pairing dashboard running at http://localhost:${config.PORT}`);
});

module.exports = { app, notifyConnected };

