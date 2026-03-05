# 🤖 YOUSAF-MD v3.0
### Zero-Config WhatsApp Bot Platform

> **Developer:** Muhammad Yousaf Baloch  
> **Contact:** +92 371 0636110  
> **GitHub:** https://github.com/yousafpubg110-tech/YOUSAF-MD

---

## 🔗 Official Links
| Platform | Link |
|---|---|
| 📦 GitHub | https://github.com/yousafpubg110-tech/YOUSAF-MD |
| 🎵 TikTok | https://tiktok.com/@loser_boy.110 |
| 📺 YouTube | https://www.youtube.com/@Yousaf_Baloch_Tech |
| 📢 WhatsApp Channel | https://whatsapp.com/channel/0029Vb3Uzps6buMH2RvGef0j |

---

## ⚡ Quick Start (3 Steps)

### Step 1 — Install Dependencies
```bash
npm install
```

### Step 2 — Start the System
```bash
npm start
```

### Step 3 — Pair Your Bot
1. Open your browser → `http://localhost:3000`
2. Enter your WhatsApp number (with country code, no + or spaces)
3. Open WhatsApp → **Linked Devices** → **Link a Device**
4. Enter the code shown on screen
5. ✅ Done! Check your WhatsApp for the welcome message.

---

## 📁 File Structure

```
YOUSAF-MD/
├── index.js              ← Master process manager
├── server.js             ← Web pairing dashboard
├── config.js             ← Branding & defaults
├── package.json
│
├── lib/
│   ├── Database.js       ← Internal JSON storage (No MongoDB!)
│   ├── SessionManager.js ← Dual-action pairing engine
│   ├── PermissionHandler.js ← Admin detection
│   └── SettingsHandler.js   ← Feature toggle system
│
├── plugins/
│   ├── loader.js         ← Master plugin injector
│   ├── info.js           ← .menu .ping .info .owner
│   ├── settings.js       ← .settings .set (Admin only)
│   ├── downloader.js     ← .play .song .video .yt .tiktok .fb .ig .gdrive
│   ├── safety.js         ← Anti-Delete, Auto-Status, Anti-Call, Anti-Link
│   ├── group.js          ← .tagall .hidetag .kick .add .promote .demote
│   ├── media.js          ← .sticker .ttp .attp .enhance .toimg
│   └── tools.js          ← .google .wiki .tts .playstore .weather .calc
│
├── sessions/             ← Auto-created session storage
├── database/             ← Auto-created internal DB
└── temp/                 ← Auto-created temp files
```

---

## 🎮 Commands

### 📥 Downloaders
| Command | Description |
|---|---|
| `.play [name]` | Download audio (YouTube) |
| `.song [name]` | Download song |
| `.audio [name/URL]` | Download audio |
| `.video [name/URL]` | Download video |
| `.yt [URL]` | YouTube download |
| `.tiktok [URL]` | TikTok (No Watermark) |
| `.fb [URL]` | Facebook video |
| `.ig [URL]` | Instagram video |
| `.gdrive [URL]` | Google Drive file |

### 🎨 Media & Stickers
| Command | Description |
|---|---|
| `.sticker` | Image/Video → Sticker |
| `.toimg` | Sticker → Image |
| `.ttp [text]` | Text to Picture Sticker |
| `.attp [text]` | Animated Text Sticker |
| `.enhance` | Upscale Image 2× |

### 👥 Group Tools
| Command | Description |
|---|---|
| `.tagall` | Tag all members |
| `.hidetag` | Hidden tag all |
| `.kick` | Remove member (reply) |
| `.add [number]` | Add member |
| `.promote` | Make admin (reply) |
| `.demote` | Remove admin (reply) |
| `.groupinfo` | Group details |

### 🔧 Tools
| Command | Description |
|---|---|
| `.google [query]` | Google search |
| `.wiki [topic]` | Wikipedia |
| `.tts [text]` | Text to Speech |
| `.playstore [app]` | Search Play Store |
| `.weather [city]` | Weather report |
| `.calc [expr]` | Calculator |
| `.time [zone]` | Current time |

### ⚙️ Settings (Bot Admin Only)
| Command | Description |
|---|---|
| `.settings` | Full control panel |
| `.set [feature] on/off` | Toggle any feature |
| `.antidel` | Toggle Anti-Delete |
| `.antical` | Toggle Anti-Call |
| `.antilink` | Toggle Anti-Link |

### ℹ️ Info
| Command | Description |
|---|---|
| `.menu` | Show all commands |
| `.ping` | Check bot speed |
| `.info` | Bot info & stats |
| `.owner` | Developer contact |

---

## 🛡️ Safety Features (Auto-Active)

| Feature | Default | Description |
|---|---|---|
| Anti-Delete | ✅ ON | Resends deleted messages |
| Auto-Status View | ✅ ON | Views all contact statuses |
| Auto-Like Status | ✅ ON | Reacts ❤️ to statuses |
| Anti-Call | ✅ ON | Auto-rejects incoming calls |
| Anti-Link | ❌ OFF | Removes links from groups |

---

## 🔒 Permission System

- **Bot Admin** (Paired Number) → Full access to `.settings`, all admin commands
- **Public Users** → Downloaders, Stickers, Group tools (if group admin)
- **Access Denied** → Any public user trying `.settings` gets a professional refusal

---

## 🚀 Deploy Options

### Local (Development)
```bash
npm start
```

### PM2 (Production — Recommended)
```bash
npm install -g pm2
pm2 start index.js --name "yousaf-md"
pm2 save
pm2 startup
```

### Koyeb / Railway / Render
- Set start command: `node index.js`
- Port: `3000`
- No environment variables needed — truly zero-config!

---

## ⚠️ Requirements

- Node.js v20+
- `ffmpeg` installed on system (`apt install ffmpeg` or `brew install ffmpeg`)
- `yt-dlp` installed (`pip install yt-dlp`)
- `ImageMagick` for TTP (`apt install imagemagick`)

---

*YOUSAF-MD — Built with ❤️ by Muhammad Yousaf Baloch*

