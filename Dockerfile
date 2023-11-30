FROM node:20-alpine

ARG TELEGRAM_API_KEY=./env.dev
ENV TELEGRAM_API_KEY $TELEGRAM_API_KEY

WORKDIR /usr/src/telegram-bot

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8000

RUN npm run build

CMD npm run start:dev
