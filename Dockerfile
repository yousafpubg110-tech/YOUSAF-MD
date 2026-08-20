FROM node:20-bullseye

# System dependencies needed by various plugins:
# ffmpeg (stickers/audio/video), imagemagick (image tools),
# python3 (siminfo/speedtest/sudoku/wordcloud plugins),
# build-essential + g++ (analyze/cipher/dna/rle C++ plugins),
# git (gitclone/update-related plugins)
RUN apt-get update && apt-get install -y \
    ffmpeg \
    imagemagick \
    python3 \
    python3-pip \
    build-essential \
    g++ \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install dependencies first (better Docker layer caching)
COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps --omit=dev || npm install --legacy-peer-deps

# Copy the actual project files (this repo's own code — NOT a clone of
# anything else)
COPY . .

# Hugging Face Spaces (Docker SDK) expects the app to listen on the
# port given via the PORT env var (commonly 7860). Other platforms
# (Render/Railway/Heroku) also inject their own PORT — config.js
# already reads process.env.PORT with a sensible fallback.
EXPOSE 7860
EXPOSE 5000

CMD ["node", "index.js"]
