FROM node:20-alpine

WORKDIR /usr/src/telegram-bot

COPY package*.json ./

RUN npm install

COPY . .

COPY env.dev .

EXPOSE 8000

RUN npm run build

CMD npm run start:dev
