# Security Policy — YOUSAF-MD

## Supported Versions

| Version | Supported |
|---------|-----------|
| 3.0.x   | Yes       |
| 2.x.x   | No        |
| 1.x.x   | No        |

---

## Reporting a Vulnerability

If you discover a security vulnerability in YOUSAF-MD, please report it responsibly.

**Contact:**
- WhatsApp: +923710636110
- GitHub: https://github.com/yousafpubg110-tech/YOUSAF-MD

**Please do NOT open a public GitHub issue for security vulnerabilities.**

We will respond within 48 hours and release a patch as quickly as possible.

---

## Security Best Practices for Users

### 1. Protect Your Session Files
- Never share your `sessions/` folder with anyone
- Never upload `sessions/` to GitHub
- Add `sessions/` to your `.gitignore`

### 2. Protect Your API Keys
- Never share your `ANTHROPIC_API_KEY`
- Set all secrets as Heroku Config Vars — never hardcode them
- Rotate your API key immediately if compromised

### 3. Heroku Security
- Keep your Heroku app private
- Do not share your Heroku dashboard URL publicly
- Use a strong Heroku account password

### 4. WhatsApp Account Safety
- Only link your bot to a dedicated number — not your personal number
- If you suspect unauthorized access, immediately go to WhatsApp → Linked Devices → Remove all devices
- Do not share your pairing code with anyone

### 5. Rate Limiting
- YOUSAF-MD has built-in rate limiting on `/api/pair` — 5 requests per minute
- Do not try to bypass this limit

---

## What We Protect

- **No central storage** — your session credentials are stored only on YOUR Heroku instance
- **No session ID sharing** — your session ID is never sent to anyone
- **Per-instance isolation** — each deployment is completely independent
- **Anti-crash protection** — uncaughtException and unhandledRejection handlers prevent crashes

---

## Environment Variables (Required)

| Variable | Description | Required |
|----------|-------------|----------|
| `ANTHROPIC_API_KEY` | Claude AI API key for auto-reply | Optional |

Set these in Heroku Dashboard → Settings → Config Vars.

---

## .gitignore Recommendations

Make sure your `.gitignore` contains:
sessions/
database/
temp/
.env
*.log
node_modules/
---

*© 2026 Muhammad Yousaf Baloch — YOUSAF-MD Security Policy*
