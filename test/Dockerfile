FROM node:12-slim

RUN  apt update \
   && apt install -y wget gnupg ca-certificates \
   && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
   && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
   && apt update \
   && apt install -y google-chrome-stable \
   && rm -rf /var/lib/apt/lists/*
