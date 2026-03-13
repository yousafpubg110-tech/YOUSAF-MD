# ╔══════════════════════════════════════════════════════════════════╗
# ║         YOUSAF-MD — Dockerfile                                   ║
# ║         Created by: Muhammad Yousaf Baloch                      ║
# ║         Version: 2.0.0  |  500+ Commands                        ║
# ╚══════════════════════════════════════════════════════════════════╝

FROM node:20-alpine

# ── System dependencies ──────────────────────────────────────────
RUN apk add --no-cache \
    ffmpeg \
    imagemagick \
    python3 \
    make \
    g++ \
    git \
    curl \
    bash \
    wget \
    ca-certificates \
    libc6-compat \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ttf-freefont

# ── Environment for Puppeteer/Chromium ───────────────────────────
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV NODE_ENV=production

# ── Working directory ────────────────────────────────────────────
WORKDIR /app

# ── Copy package files first (for Docker cache) ──────────────────
COPY package*.json ./

# ── Install ALL dependencies ─────────────────────────────────────
RUN npm install

# ── Copy all project files ───────────────────────────────────────
COPY . .

# ── Create all required directories ─────────────────────────────
RUN mkdir -p \
    session \
    temp \
    database \
    logs \
    plugins \
    lib \
    assets

# ── Set permissions ──────────────────────────────────────────────
RUN chmod -R 755 /app

# ── Expose port ──────────────────────────────────────────────────
EXPOSE 3000

# ── Health check ─────────────────────────────────────────────────
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

# ── Start bot ────────────────────────────────────────────────────
CMD ["node", "index.js"]
