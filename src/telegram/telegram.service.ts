import { Injectable, Logger } from '@nestjs/common';

const Token = process.env.TELEGRAM_API_KEY;
const TelegramBot = require('node-telegram-bot-api');
@Injectable()
export class TelegramService {
  private readonly bot: any;
  private logger = new Logger(TelegramService.name);
  constructor() {
    this.bot = new TelegramBot(Token, { polling: true });
    this.bot.on('message', (msg: any) => {
      this.onReceiveMessage(msg);

      this.filterSpamMessage(msg);
    });
  }

  onReceiveMessage = (msg: any) => {
    this.logger.debug(msg);
  };

  filterSpamMessage = (msg: any) => {
    const linkRegex = /(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
    if (linkRegex.test(msg.text)) {
      this.bot.sendMessage(
        msg.chat.id,
        "You can't send messages that include links.",
      );
      this.bot.deleteMessage(msg.chat.id, msg.message_id);
    }
  };
}
