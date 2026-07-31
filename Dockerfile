FROM node:20-bullseye

RUN apt-get update && apt-get install -y \
    ffmpeg imagemagick python3 python3-pip \
    build-essential g++ git curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps --omit=dev || npm install --legacy-peer-deps

COPY . .

EXPOSE 7860
EXPOSE 5000

CMD ["node", "index.js"]
