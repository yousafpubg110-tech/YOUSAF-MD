FROM quay.io/yousafpubg110-tech/yousaf-md:latest

WORKDIR /root/yousaf-md

COPY package.json package-lock.json ./

RUN npm install

COPY . .

EXPOSE 5000

CMD ["npm", "run", "start:optimized"]
