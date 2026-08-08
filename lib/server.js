import express from 'express';
import { createServer } from 'http';
import config from '../config.js';
import socketRegistry from './socketRegistry.js';
const packageInfo = {
    name: config.botName || 'YOUSAF-MD',
    version: config.version || '6.0.0',
    description: config.description || 'WhatsApp Bot',
    author: config.author || 'MR YOUSAF BALOCH'
};
const app = express();
const server = createServer(app);
const PORT = config.port || 5000;
app.get('/', (req, res) => {
    const uptimeSeconds = Math.floor(process.uptime());
    const hours = Math.floor(uptimeSeconds / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const seconds = uptimeSeconds % 60;
    const uptimeString = `${hours}h ${minutes}m ${seconds}s`;
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${packageInfo.name.toUpperCase()} Status</title>
        <style>
            :root { --primary: #25d366; --bg: #0f172a; --card-bg: rgba(30, 41, 59, 0.7); }
            body { 
                margin: 0; padding: 0; background: var(--bg); color: white; 
                font-family: 'Inter', system-ui, sans-serif;
                display: flex; justify-content: center; align-items: center; min-height: 100vh;
            }
            .container {
                background: var(--card-bg); backdrop-filter: blur(12px);
                border: 1px solid rgba(255,255,255,0.1); padding: 30px;
                border-radius: 24px; width: 90%; max-width: 400px; text-align: center;
                box-shadow: 0 20px 50px rgba(0,0,0,0.5);
            }
            .status-badge {
                display: inline-flex; align-items: center; background: rgba(37, 211, 102, 0.1);
                color: var(--primary); padding: 5px 15px; border-radius: 50px;
                font-size: 0.8rem; font-weight: bold; margin-bottom: 20px;
            }
            .dot { height: 8px; width: 8px; background: var(--primary); border-radius: 50%; margin-right: 8px; box-shadow: 0 0 10px var(--primary); }
            h1 { margin: 0; font-size: 1.8rem; letter-spacing: 1px; }
            .desc { color: #94a3b8; margin: 10px 0 25px 0; font-size: 0.9rem; }
            .grid { display: grid; gap: 12px; }
            .item { 
                background: rgba(0,0,0,0.2); padding: 12px 18px; border-radius: 12px;
                display: flex; justify-content: space-between; align-items: center;
            }
            .label { color: #64748b; font-size: 0.75rem; text-transform: uppercase; font-weight: 800; }
            .val { font-weight: 600; font-family: monospace; color: #f1f5f9; }
            footer { margin-top: 25px; font-size: 0.7rem; color: #475569; letter-spacing: 1px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="status-badge"><span class="dot"></span> SYSTEM ONLINE</div>
            <h1>${packageInfo.name.toUpperCase()}</h1>
            <p class="desc">${packageInfo.description}</p>
            
            <div class="grid">
                <div class="item"><span class="label">Version</span><span class="val">${packageInfo.version}</span></div>
                <div class="item"><span class="label">Author</span><span class="val">${packageInfo.author}</span></div>
                <div class="item"><span class="label">Uptime</span><span class="val">${uptimeString}</span></div>
            </div>

            <footer>POWERED BY MR YOUSAF BALOCH</footer>
        </div>
    </body>
    </html>
    `);
});
app.get('/pair', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${packageInfo.name.toUpperCase()} — Pair Your WhatsApp</title>
        <style>
            * { box-sizing: border-box; }
            :root {
                --primary: #25d366; --purple: #a855f7; --pink: #ec4899;
                --blue: #3b82f6; --orange: #f97316; --bg: #0a0a1a;
            }
            body {
                margin: 0; padding: 20px; min-height: 100vh; color: white;
                font-family: 'Inter', system-ui, sans-serif;
                display: flex; justify-content: center; align-items: center;
                background: linear-gradient(135deg, #0a0a1a, #1a0a2e, #0a1a2e, #0a0a1a);
                background-size: 400% 400%;
                animation: bgShift 12s ease infinite;
                overflow-x: hidden; position: relative;
            }
            @keyframes bgShift {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
            }
            .blob {
                position: fixed; border-radius: 50%; filter: blur(60px); opacity: 0.45; z-index: 0;
                animation: float 8s ease-in-out infinite;
            }
            .blob1 { width: 300px; height: 300px; background: var(--purple); top: -80px; left: -80px; }
            .blob2 { width: 260px; height: 260px; background: var(--primary); bottom: -60px; right: -60px; animation-delay: 2s; }
            .blob3 { width: 200px; height: 200px; background: var(--pink); top: 40%; right: 10%; animation-delay: 4s; }
            @keyframes float {
                0%, 100% { transform: translateY(0) translateX(0) scale(1); }
                50% { transform: translateY(-30px) translateX(20px) scale(1.1); }
            }
            .container {
                position: relative; z-index: 1;
                background: rgba(255,255,255,0.06); backdrop-filter: blur(20px);
                border: 1px solid rgba(255,255,255,0.15); padding: 32px;
                border-radius: 28px; width: 100%; max-width: 440px; text-align: center;
                box-shadow: 0 25px 60px rgba(0,0,0,0.6), 0 0 40px rgba(168,85,247,0.15);
                transform-style: preserve-3d;
                transition: transform 0.3s ease;
                animation: rise 0.6s ease;
            }
            @keyframes rise { from { opacity: 0; transform: translateY(30px) rotateX(8deg); } to { opacity: 1; transform: translateY(0) rotateX(0); } }
            .logo-badge {
                width: 64px; height: 64px; border-radius: 20px; margin: 0 auto 14px;
                background: linear-gradient(135deg, var(--primary), var(--purple), var(--pink));
                display: flex; align-items: center; justify-content: center; font-size: 1.8rem;
                box-shadow: 0 10px 30px rgba(168,85,247,0.5);
                animation: pulse 2.4s ease-in-out infinite;
            }
            @keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.06); } }
            h1 {
                margin: 0 0 6px 0; font-size: 1.6rem; font-weight: 800;
                background: linear-gradient(90deg, var(--primary), var(--purple), var(--pink));
                -webkit-background-clip: text; background-clip: text; color: transparent;
            }
            .desc { color: #c7d2fe; margin: 0 0 24px 0; font-size: 0.85rem; opacity: 0.85; }
            input {
                width: 100%; padding: 15px 16px; border-radius: 14px;
                border: 1px solid rgba(255,255,255,0.2); background: rgba(0,0,0,0.3);
                color: white; font-size: 1rem; margin-bottom: 14px; text-align: center;
                outline: none; transition: border-color 0.2s;
            }
            input:focus { border-color: var(--primary); }
            button {
                width: 100%; padding: 15px; border-radius: 14px; border: none;
                background: linear-gradient(90deg, var(--primary), #1fb855);
                color: #06210f; font-weight: 800; font-size: 1rem; cursor: pointer;
                box-shadow: 0 8px 20px rgba(37,211,102,0.35);
                transition: transform 0.15s;
            }
            button:active { transform: scale(0.97); }
            button:disabled { opacity: 0.6; cursor: not-allowed; }
            #result { margin-top: 20px; font-size: 0.88rem; min-height: 20px; line-height: 1.5; }
            .code {
                font-size: 2rem; font-weight: 800; letter-spacing: 4px; margin-top: 12px;
                background: linear-gradient(90deg, var(--primary), var(--purple));
                -webkit-background-clip: text; background-clip: text; color: transparent;
                word-break: break-all;
            }
            .next-steps {
                margin-top: 16px; text-align: left; background: rgba(0,0,0,0.25);
                border-radius: 14px; padding: 14px 16px; font-size: 0.8rem; color: #cbd5e1;
                border: 1px solid rgba(255,255,255,0.1); display: none;
            }
            .next-steps.show { display: block; }
            .next-steps b { color: var(--primary); }
            .socials {
                display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; margin-top: 26px;
            }
            .social-btn {
                text-decoration: none; color: white; font-size: 0.72rem; font-weight: 700;
                padding: 8px 14px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.15);
                background: rgba(255,255,255,0.06); transition: transform 0.15s, background 0.2s;
            }
            .social-btn:hover { transform: translateY(-2px); background: rgba(255,255,255,0.15); }
            footer { margin-top: 22px; font-size: 0.65rem; color: #64748b; letter-spacing: 1px; }
        </style>
    </head>
    <body>
        <div class="blob blob1"></div>
        <div class="blob blob2"></div>
        <div class="blob blob3"></div>
        <div class="container">
            <div class="logo-badge">🔗</div>
            <h1>PAIR YOUR WHATSAPP</h1>
            <p class="desc">Enter your number with country code (no + or spaces) to get a pairing code for ${packageInfo.name}.</p>
            <input id="num" type="text" placeholder="923001234567" maxlength="15" />
            <button id="btn" onclick="requestCode()">Get Pairing Code</button>
            <div id="result"></div>
            <div id="nextSteps" class="next-steps">
                <b>What to do next:</b><br>
                1. Open <b>WhatsApp</b> on your phone.<br>
                2. Go to <b>Settings → Linked Devices → Link a Device</b>.<br>
                3. Tap <b>"Link with phone number instead"</b>.<br>
                4. Type in the code shown above.<br>
                5. Wait a few seconds — the bot will connect automatically and start replying to your messages. No further setup needed!
            </div>
            <div class="socials">
                <a class="social-btn" href="${config.channelLink}" target="_blank">📢 Channel</a>
                <a class="social-btn" href="${config.youtubeLink}" target="_blank">🎥 YouTube</a>
                <a class="social-btn" href="${config.tiktokLink}" target="_blank">🎵 TikTok</a>
                <a class="social-btn" href="${config.githubLink}" target="_blank">💻 GitHub</a>
                <a class="social-btn" href="${config.whatsappLink}" target="_blank">💬 Contact</a>
            </div>
            <footer>POWERED BY ${packageInfo.author.toUpperCase()}</footer>
        </div>
        <script>
            const card = document.querySelector('.container');
            document.addEventListener('mousemove', (e) => {
                const x = (e.clientX / window.innerWidth - 0.5) * 6;
                const y = (e.clientY / window.innerHeight - 0.5) * -6;
                card.style.transform = 'rotateY(' + x + 'deg) rotateX(' + y + 'deg)';
            });
            async function requestCode() {
                const num = document.getElementById('num').value.trim();
                const btn = document.getElementById('btn');
                const result = document.getElementById('result');
                const nextSteps = document.getElementById('nextSteps');
                nextSteps.classList.remove('show');
                if (!num || num.length < 8) {
                    result.innerHTML = '❌ Please enter a valid number.';
                    return;
                }
                btn.disabled = true;
                btn.textContent = 'Requesting...';
                result.innerHTML = '';
                try {
                    const res = await fetch('/pair/request?number=' + encodeURIComponent(num));
                    const data = await res.json();
                    if (data.code) {
                        result.innerHTML = '<div class="code">' + data.code + '</div>';
                        nextSteps.classList.add('show');
                    } else {
                        result.innerHTML = '❌ ' + (data.error || 'Failed to get pairing code.');
                    }
                } catch (e) {
                    result.innerHTML = '❌ Request failed. Try again.';
                }
                btn.disabled = false;
                btn.textContent = 'Get Pairing Code';
            }
        </script>
    </body>
    </html>
    `);
});

app.get('/pair/request', async (req, res) => {
    const { number } = req.query;
    if (!number) {
        return res.status(400).json({ error: 'Missing phone number' });
    }
    const cleaned = String(number).replace(/[^0-9]/g, '');
    if (cleaned.length < 8) {
        return res.status(400).json({ error: 'Invalid phone number format' });
    }
    const sock = socketRegistry.sock;
    if (!sock) {
        return res.status(503).json({ error: 'Bot is still starting up, try again in a few seconds.' });
    }
    if (sock.authState?.creds?.registered) {
        return res.status(409).json({ error: 'This bot is already linked to a WhatsApp number. Restart with a fresh session to re-pair.' });
    }
    if (socketRegistry.pairingInProgress) {
        return res.status(429).json({ error: 'A pairing request is already in progress, please wait.' });
    }
    socketRegistry.pairingInProgress = true;
    try {
        let code = await sock.requestPairingCode(cleaned);
        code = code?.match(/.{1,4}/g)?.join('-') || code;
        return res.json({ code });
    } catch (err) {
        return res.status(500).json({ error: err.message || 'Failed to generate pairing code.' });
    } finally {
        socketRegistry.pairingInProgress = false;
    }
});

app.get('/health', (req, res) => {
    const mem = process.memoryUsage();
    res.json({
        status: 'ok',
        uptime: Math.floor(process.uptime()),
        memory: {
            rss: `${Math.round(mem.rss / 1024 / 1024) }MB`,
            heapUsed: `${Math.round(mem.heapUsed / 1024 / 1024) }MB`,
            heapTotal: `${Math.round(mem.heapTotal / 1024 / 1024) }MB`
        },
        version: packageInfo.version,
        bot: packageInfo.name,
        timestamp: new Date().toISOString()
    });
});
app.get('/process', (req, res) => {
    const { send } = req.query;
    if (!send)
        return res.status(400).json({ error: 'Missing send query' });
    res.json({ status: 'Received', data: send });
});
app.get('/chat', (req, res) => {
    const { message, to } = req.query;
    if (!message || !to)
        return res.status(400).json({ error: 'Missing message or to query' });
    res.json({ status: 200, info: 'Message received (integration not implemented)' });
});
export { app, server, PORT };
