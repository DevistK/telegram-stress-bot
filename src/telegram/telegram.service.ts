import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import OpenAI from 'openai';
import { linkRegex, wordRegex } from '../common/regex/filter.regex';
import {
  chatCommend,
  helpCommend,
  slaveCommend,
  smileCommend,
  smokeCommend,
  startCommend,
  unbanCommend,
} from '../common/regex/commend.regex';
import { Cron, CronExpression } from '@nestjs/schedule';
import { generatorRandomMsg } from '../util/generator';
import {
  filterWordMessageList,
  filterWordStickerList,
} from '../common/chat/randomMessageList';

const Token = process.env.TELEGRAM_API_KEY;
const TelegramBot = require('node-telegram-bot-api');

@Injectable()
export class TelegramService {
  private readonly bot: any;
  private logger = new Logger(TelegramService.name);
  private openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  constructor() {
    this.bot = new TelegramBot(Token, { polling: true });

    this.bot.on('message', async (msg: any) => {
      await this.onReceiveMessage(msg);

      await this.bot.setMyCommands([
        {
          command: 'help',
          description: '지원하는 명령어들을 보여줍니다.',
        },
      ]);

      if (linkRegex.test(msg.text)) {
        await this.filterSpamMessage(msg);
      } else if (wordRegex.test(msg.text)) {
        await this.filterWordMessage(msg);
      }
    });

    this.bot.on('new_chat_members', async (msg: any) => {
      const chatId = msg.chat.id;

      await this.bot.sendMessage(
        chatId,
        'Hello, Solo Leveling: Unlimited. We hope this helps our foundation grow. \n' +
          'Solo Leveling: Unlimited \n' +
          'Bank account: 1104312345567',
      );
    });

    this.bot.onText(chatCommend, async (msg) => {
      const chatId = msg.chat.id;

      const matchText = msg.text.match(/\/chat(.*)/);

      if (matchText[1]) {
        const content = await this.callGPT(matchText[1]);
        await this.bot.sendMessage(chatId, content);
      } else {
        await this.bot.sendMessage(
          chatId,
          '두번째 키워드가 입력되지 않았습니다.',
        );
      }
    });

    this.bot.onText(startCommend, async (msg) => {
      const chatId = msg.chat.id;

      const member = await this.bot.getMe();

      if (member.is_bot) {
        const botUser = await this.bot.getChatMember(chatId, member.id);
        console.log(botUser);
        await this.bot.sendMessage(
          chatId,
          `Hello I am bot. my name is ${botUser.user.first_name}`,
        );
      }
    });

    this.bot.onText(slaveCommend, async (msg) => {
      const chatId = msg.chat.id;
      await this.bot.sendMessage(
        chatId,
        'This person is your slave.\n' +
          'His name is @Hank.\n' +
          'Please take good care of him. \n' +
          'To move him, select the command below. ex) /smoke\n' +
          "/smoke  : Let's go smoke on the first floor \n" +
          '/smile : . Make me laugh',
      );
    });

    this.bot.onText(smokeCommend, async (msg) => {
      const chatId = msg.chat.id;

      await this.bot.sendMessage(chatId, 'Yes Master , ㄱㅅㄴㅇ @Pete @Emile');
    });

    this.bot.onText(smileCommend, async (msg) => {
      const chatId = msg.chat.id;

      await this.bot.sendMessage(chatId, "I am my master's clown 🤡.");
    });

    this.bot.onText(unbanCommend, async (msg) => {
      const chatId = msg.chat.id;
      const superGroup = this.bot.getChat(chatId);

      if (superGroup.type === 'supergroup') {
        await this.bot.unbanChatMember(chatId, 5353197008);
        await this.bot.sendMessage(
          chatId,
          '다시 밴 당하지 않도록 욕설에 주의해주세요.',
        );
      }
    });

    this.bot.onText(helpCommend, async (msg) => {
      const chatId = msg.chat.id;
      await this.bot.sendMessage(
        chatId,
        '/start : 봇의 정보를 확인하는 개발자용 커맨드 \n' +
          '/slave : 누가 노예인지 확인합니다. \n' +
          '/unban : 강퇴 당한 유저를 초대할 수 있게 합니다.',
      );
    });
  }

  onReceiveMessage = async (msg: any) => {
    this.logger.debug(msg);
  };

  filterSpamMessage = async (msg: any) => {
    await this.bot.sendMessage(msg.chat.id, '링크를 포함시킬 수 없습니다.');
    await this.bot.deleteMessage(msg.chat.id, msg.message_id);
  };

  filterWordMessage = async (msg: any) => {
    const chatId = msg.chat.id;
    const randomMessage = generatorRandomMsg(filterWordMessageList);
    const randomSticker = generatorRandomMsg(filterWordStickerList);
    await this.bot.sendMessage(chatId, randomMessage);
    await this.bot.sendSticker(chatId, randomSticker);
    await this.bot.deleteMessage(chatId, msg.message_id);
    // await this.bot.banChatMember(msg.chat.id, 5353197008);
  };

  callGPT = async (prompt: string) => {
    const param: OpenAI.Chat.ChatCompletionCreateParams = {
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
    };

    const completion = await this.openai.chat.completions.create(param);
    return completion.choices[0]?.message?.content;
  };

  @Cron(CronExpression.EVERY_DAY_AT_1PM)
  async cronMessage() {
    const chatIds = JSON.parse(
      fs.readFileSync('./src/common/chat/chatIds.json', 'utf-8'),
    );

    const member = await this.bot.getMe();

    for (const chatIdObj of chatIds) {
      try {
        console.debug(`Success sending message to chat :: ${chatIdObj.chatId}`);

        if (member.is_bot) {
          const hasChat = await this.bot.getChat(chatIdObj.chatId);
          if (hasChat.id === Number(chatIdObj.chatId)) {
            await this.bot.sendPhoto(
              chatIdObj.chatId,
              'https://img.insight.co.kr/static/2022/07/05/700/img_20220705152003_84l45870.webp',
            );
            await this.bot.sendMessage(chatIdObj.chatId, '🍚ㄱㅅㄴㅇ', {
              reply_markup: {
                inline_keyboard: [
                  [
                    {
                      text: 'Solo Leveling : Unlimited',
                      url: 'https://beta.sololeveling.otherworld.network/',
                    },
                  ],
                ],
              },
            });
          }
        }
      } catch (error) {
        console.error(
          `Error sending message to chat ${chatIdObj.chatId}:`,
          error,
        );

        const index = chatIds.indexOf(chatIdObj);
        if (index !== -1) {
          chatIds.splice(index, 1);

          fs.writeFileSync(
            './src/common/chat/chatIds.json',
            JSON.stringify(chatIds),
          );
        }
      }
    }
  }
}
