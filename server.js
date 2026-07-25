// ============================================================
//   YOUSAF-MD — WEB PAIRING SERVER
//   Personal Instance - No central DB dependency
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

const app = express();
app.set('trust proxy', 1);

const server = http.createServer(app);
const io     = new Server(server, { cors: { origin: '*' } });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'assets')));

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max:      5,
  message:  { error: 'Too many requests. Please wait 1 minute.' },
});

const DASHBOARD_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>YOUSAF-MD | Pairing Dashboard</title>
  <script src="https://cdn.socket.io/4.7.5/socket.io.min.js"></script>
  <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Rajdhani:wght@500;700&display=swap" rel="stylesheet">
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body {
      font-family: 'Rajdhani', sans-serif;
      background: #08080f;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #fff;
      padding: 20px;
    }
    body::before {
      content: '';
      position: fixed;
      inset: 0;
      background:
        radial-gradient(ellipse at 15% 50%, rgba(0,242,254,0.06) 0%, transparent 55%),
        radial-gradient(ellipse at 85% 20%, rgba(161,140,209,0.06) 0%, transparent 55%),
        radial-gradient(ellipse at 50% 85%, rgba(79,172,254,0.04) 0%, transparent 55%);
      pointer-events: none;
      z-index: 0;
    }
    .card {
      position: relative;
      z-index: 1;
      background: rgba(255,255,255,0.04);
      backdrop-filter: blur(30px);
      border: 1px solid rgba(0,242,254,0.18);
      border-radius: 28px;
      padding: 38px 34px;
      max-width: 450px;
      width: 100%;
      box-shadow: 0 0 80px rgba(0,242,254,0.07), 0 32px 64px rgba(0,0,0,0.5);
    }
    .clock {
      font-family: 'Orbitron', monospace;
      font-size: 1.6rem;
      font-weight: 700;
      color: #00f2fe;
      text-align: center;
      letter-spacing: 5px;
      text-shadow: 0 0 25px rgba(0,242,254,0.6);
      margin-bottom: 4px;
    }
    .clock-date {
      text-align: center;
      font-size: 0.72rem;
      color: rgba(255,255,255,0.3);
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-bottom: 22px;
    }
    .logo {
      font-family: 'Orbitron', monospace;
      font-size: 2rem;
      font-weight: 900;
      background: linear-gradient(90deg, #00f2fe, #4facfe, #a18cd1, #00f2fe);
      background-size: 250%;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      text-align: center;
      letter-spacing: 5px;
      animation: shimmer 3s linear infinite;
      margin-bottom: 4px;
    }
    @keyframes shimmer { 0%{background-position:0%} 100%{background-position:250%} }
    .tagline {
      text-align: center;
      color: rgba(255,255,255,0.38);
      font-size: 0.8rem;
      letter-spacing: 1px;
      margin-bottom: 26px;
    }
    .step {
      background: rgba(0,242,254,0.04);
      border-left: 3px solid rgba(0,242,254,0.5);
      border-radius: 0 10px 10px 0;
      padding: 9px 13px;
      margin-bottom: 12px;
      font-size: 0.82rem;
      color: rgba(255,255,255,0.58);
      line-height: 1.6;
    }
    .step b { color: #4facfe; }
    .input-group { display:flex; gap:9px; margin-bottom:14px; }
    input[type="text"] {
      flex: 1;
      padding: 13px 15px;
      border-radius: 11px;
      border: 1px solid rgba(0,242,254,0.22);
      background: rgba(0,242,254,0.05);
      color: #fff;
      font-size: 0.95rem;
      font-family: 'Rajdhani', sans-serif;
      outline: none;
      transition: border 0.2s, box-shadow 0.2s;
    }
    input[type="text"]::placeholder { color: rgba(255,255,255,0.28); }
    input[type="text"]:focus {
      border-color: #00f2fe;
      box-shadow: 0 0 18px rgba(0,242,254,0.18);
    }
    .btn-generate {
      padding: 13px 18px;
      background: linear-gradient(90deg, #00f2fe, #4facfe);
      border: none;
      border-radius: 11px;
      color: #000;
      font-weight: 700;
      font-size: 0.88rem;
      font-family: 'Rajdhani', sans-serif;
      cursor: pointer;
      transition: opacity 0.2s, transform 0.1s, box-shadow 0.2s;
      white-space: nowrap;
      letter-spacing: 1px;
    }
    .btn-generate:hover {
      opacity: 0.88;
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0,242,254,0.3);
    }
    .btn-generate:disabled { opacity:0.4; cursor:not-allowed; transform:none; box-shadow:none; }
    .code-display {
      display: none;
      background: rgba(0,242,254,0.05);
      border: 1px solid rgba(0,242,254,0.28);
      border-radius: 16px;
      padding: 20px;
      margin: 14px 0;
      text-align: center;
    }
    .code-display.show { display: block; }
    .code-label {
      font-size: 0.72rem;
      color: rgba(255,255,255,0.4);
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-bottom: 10px;
    }
    .code-value {
      font-family: 'Orbitron', monospace;
      font-size: 1.9rem;
      font-weight: 900;
      letter-spacing: 10px;
      color: #00f2fe;
      text-shadow: 0 0 35px rgba(0,242,254,0.7);
      margin-bottom: 6px;
    }
    .code-expire {
      font-size: 0.68rem;
      color: rgba(255,255,255,0.28);
      margin-bottom: 14px;
    }
    .btn-copy {
      padding: 9px 26px;
      background: transparent;
      border: 1px solid rgba(0,242,254,0.35);
      border-radius: 9px;
      color: #00f2fe;
      font-size: 0.83rem;
      font-family: 'Rajdhani', sans-serif;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
      letter-spacing: 1px;
    }
    .btn-copy:hover { background: rgba(0,242,254,0.08); box-shadow: 0 0 15px rgba(0,242,254,0.18); }
    .btn-copy.copied { background: rgba(0,255,140,0.08); border-color: #00ff8c; color: #00ff8c; }
    .status-msg {
      font-size: 0.83rem;
      padding: 10px 13px;
      border-radius: 10px;
      margin-top: 12px;
      display: none;
      text-align: center;
    }
    .status-msg.show    { display: block; }
    .status-msg.info    { background: rgba(79,172,254,0.08);  color: #4facfe; border:1px solid rgba(79,172,254,0.2); }
    .status-msg.success { background: rgba(0,255,140,0.07);   color: #00ff8c; border:1px solid rgba(0,255,140,0.2); }
    .status-msg.error   { background: rgba(255,80,80,0.07);   color: #ff5050; border:1px solid rgba(255,80,80,0.2); }
    .divider { border:none; border-top:1px solid rgba(255,255,255,0.07); margin:22px 0 18px; }
    .social-title {
      text-align: center;
      font-size: 0.72rem;
      color: rgba(255,255,255,0.3);
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-bottom: 14px;
    }
    .social-links {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 9px;
      margin-bottom: 18px;
    }
    .social-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 7px;
      padding: 10px 12px;
      border-radius: 10px;
      text-decoration: none;
      font-size: 0.82rem;
      font-weight: 700;
      font-family: 'Rajdhani', sans-serif;
      letter-spacing: 0.5px;
      transition: transform 0.2s, box-shadow 0.2s;
      border: 1px solid transparent;
    }
    .social-btn:hover { transform: translateY(-2px); }
    .btn-whatsapp { background: rgba(37,211,102,0.1); border-color: rgba(37,211,102,0.3); color: #25D366; }
    .btn-whatsapp:hover { box-shadow: 0 6px 20px rgba(37,211,102,0.2); }
    .btn-youtube  { background: rgba(255,0,0,0.1);    border-color: rgba(255,0,0,0.3);    color: #ff4444; }
    .btn-youtube:hover  { box-shadow: 0 6px 20px rgba(255,0,0,0.2); }
    .btn-tiktok   { background: rgba(255,0,80,0.1);   border-color: rgba(255,0,80,0.3);   color: #ff0050; }
    .btn-tiktok:hover   { box-shadow: 0 6px 20px rgba(255,0,80,0.2); }
    .btn-github   { background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.15); color: rgba(255,255,255,0.7); }
    .btn-github:hover   { box-shadow: 0 6px 20px rgba(255,255,255,0.08); }
    .owner {
      text-align: center;
      font-size: 0.72rem;
      color: rgba(255,255,255,0.22);
      letter-spacing: 1px;
    }
    .spinner {
      display: inline-block;
      width: 12px; height: 12px;
      border: 2px solid rgba(0,0,0,0.2);
      border-top-color: #000;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
      margin-right: 5px;
      vertical-align: middle;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
</head>
<body>
<div class="card">

  <div class="clock" id="clock">00:00:00</div>
  <div class="clock-date" id="clockDate">Loading...</div>

  <div class="logo">YOUSAF-MD</div>
  <div class="tagline">⚡ Personal WhatsApp Bot v3.0.0</div>

  <div class="step">
    <b>Step 1:</b> Enter your WhatsApp number with country code (no + or spaces)<br>
    <b>Example:</b> 923001234567
  </div>
  <div class="step">
    <b>Step 2:</b> Open WhatsApp → <b>Linked Devices</b> → <b>Link a Device</b> → Enter the code below
  </div>
  <div class="step">
    <b>Step 3:</b> Bot will auto-start after you enter the code in WhatsApp ✅
  </div>

  <div class="input-group">
    <input type="text" id="phoneInput" placeholder="923001234567" maxlength="15"/>
    <button class="btn-generate" id="pairBtn" onclick="requestCode()">⚡ Get Code</button>
  </div>

  <div class="code-display" id="codeBox">
    <div class="code-label">🔑 Enter this code in WhatsApp</div>
    <div class="code-value" id="codeValue">----</div>
    <div class="code-expire">Code expires in 60 seconds — Enter it in WhatsApp quickly!</div>
    <button class="btn-copy" id="copyBtn" onclick="copyCode()">📋 Copy Code</button>
  </div>

  <div class="status-msg" id="statusMsg"></div>

  <hr class="divider"/>

  <div class="social-title">👑 Mr Yousaf Baloch — Follow & Connect</div>

  <div class="social-links">
    <a class="social-btn btn-whatsapp" href="https://whatsapp.com/channel/0029Vb3Uzps6buMH2RvGef0j" target="_blank">
      📢 WhatsApp Channel
    </a>
    <a class="social-btn btn-youtube" href="https://www.youtube.com/@Yousaf_Baloch_Tech" target="_blank">
      📺 YouTube
    </a>
    <a class="social-btn btn-tiktok" href="https://tiktok.com/@loser_boy.110" target="_blank">
      🎵 TikTok
    </a>
    <a class="social-btn btn-github" href="https://github.com/yousafpubg110-tech/YOUSAF-MD" target="_blank">
      💻 GitHub
    </a>
  </div>

  <div class="owner">© 2026 Muhammad Yousaf Baloch | +923710636110</div>

</div>
<script>
  const socket = io();

  function updateClock() {
    const now    = new Date();
    const h      = String(now.getHours()).padStart(2,'0');
    const m      = String(now.getMinutes()).padStart(2,'0');
    const s      = String(now.getSeconds()).padStart(2,'0');
    const days   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    document.getElementById('clock').textContent     = h+':'+m+':'+s;
    document.getElementById('clockDate').textContent =
      days[now.getDay()]+' • '+now.getDate()+' '+months[now.getMonth()]+' '+now.getFullYear();
  }
  updateClock();
  setInterval(updateClock, 1000);

  function showStatus(msg, type='info') {
    const el = document.getElementById('statusMsg');
    el.textContent = msg;
    el.className = 'status-msg show ' + type;
  }

  async function requestCode() {
    const phone = document.getElementById('phoneInput').value.trim().replace(/\D/g,'');
    if (phone.length < 10) return showStatus('❌ Enter a valid phone number.','error');

    const btn = document.getElementById('pairBtn');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span>Generating...';
    showStatus('⏳ Connecting to WhatsApp servers...','info');

    try {
      const res  = await fetch('/api/pair', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ phone }),
      });
      const data = await res.json();

      if (data.error) {
        showStatus('❌ ' + data.error, 'error');
        btn.disabled  = false;
        btn.innerHTML = '⚡ Get Code';
        return;
      }

      document.getElementById('codeValue').textContent = data.code;
      document.getElementById('codeBox').classList.add('show');
      document.getElementById('copyBtn').className    = 'btn-copy';
      document.getElementById('copyBtn').textContent  = '📋 Copy Code';
      showStatus('✅ Code ready! Now open WhatsApp → Linked Devices → Link a Device → Enter this code', 'success');
      btn.innerHTML = '🔄 Regenerate';
      btn.disabled  = false;

      socket.emit('watch', { instanceId: data.instanceId });
    } catch (e) {
      showStatus('❌ Server error. Please try again.', 'error');
      btn.disabled  = false;
      btn.innerHTML = '⚡ Get Code';
    }
  }

  function copyCode() {
    const code = document.getElementById('codeValue').textContent;
    if (code === '----') return;
    navigator.clipboard.writeText(code).then(() => {
      const btn = document.getElementById('copyBtn');
      btn.textContent = '✅ Copied!';
      btn.className   = 'btn-copy copied';
      setTimeout(() => { btn.textContent = '📋 Copy Code'; btn.className = 'btn-copy'; }, 2000);
    });
  }

  socket.on('bot_connected', () => {
    showStatus('🟢 Bot is LIVE! Check your WhatsApp for welcome message.', 'success');
  });

  document.getElementById('phoneInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') requestCode();
  });
</script>
</body>
</html>`;

app.get('/', (req, res) => res.send(DASHBOARD_HTML));

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

io.on('connection', (socket) => {
  socket.on('watch', ({ instanceId }) => {
    if (instanceId) socket.join('instance_' + instanceId);
  });
});

function notifyConnected(instanceId) {
  io.to('instance_' + instanceId).emit('bot_connected', { instanceId });
}

const PORT = process.env.PORT || config.PORT || 3000;
server.listen(PORT, () => {
  console.log('[SERVER] Pairing dashboard running at port: ' + PORT);
});

module.exports = { app, notifyConnected };
