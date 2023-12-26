import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import OpenAI from 'openai';
import { wordRegex } from '../common/regex/filter.regex';
import {
  chatCommend,
  helpCommend,
  imageCommend,
  musicCommend,
  randomMusicCommend,
  slaveCommend,
  smileCommend,
  smokeCommend,
  todoCommend,
  unbanCommend,
  yuCommend,
} from '../common/regex/commend.regex';
import { Cron, CronExpression } from '@nestjs/schedule';
import { generatorRandomMsg } from '../util/generator';
import {
  filterWordMessageList,
  filterWordStickerList,
} from '../common/chat/randomMessageList';

import { google } from 'googleapis';
import { youtubePlayList } from '../common/music';

const Token = process.env.TELEGRAM_API_KEY;
const TelegramBot = require('node-telegram-bot-api');

@Injectable()
export class TelegramService {
  private readonly bot: any;
  private readonly youtube: any;
  private logger = new Logger(TelegramService.name);
  private openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  constructor() {
    this.bot = new TelegramBot(Token, { polling: true });
    this.youtube = google.youtube('v3');

    this.bot.on('message', async (msg: any) => {
      await this.onReceiveMessage(msg);

      await this.bot.setMyCommands([
        {
          command: 'help',
          description: '지원하는 명령어들을 보여줍니다.',
        },
      ]);

      if (wordRegex.test(msg.text)) {
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

    this.bot.onText(todoCommend, async (msg) => {
      const chatId = msg.chat.id;

      const member = await this.bot.getMe();

      if (member.is_bot) {
        const botUser = await this.bot.getChatMember(chatId, member.id);
        console.log(botUser);
        await this.bot.sendMessage(
          chatId,
          `Hello I am bot. my name is ${botUser.user.first_name} \n` +
            '✅ 노예 확인 \n' +
            '✅ 욕설 방지 \n' +
            '✅ GPT 4 텍스트 생성 \n' +
            '✅ DALL E 3 이미지 생성 \n' +
            '✅ 유튜브 랜덤 플레이 리스트 노래 선곡 \n' +
            '✅ 유튜브 노래 검색',
        );
      }
    });

    this.bot.onText(helpCommend, async (msg) => {
      const chatId = msg.chat.id;
      await this.bot.sendMessage(
        chatId,
        '/todo : 남은 업데이트 목록을 보여줍니다. \n' +
          '/slave : 누가 노예인지 확인합니다. \n' +
          '/chat : gpt 4 turbo 를 소환합니다. \n' +
          '/yu : 블루아카이브 유우카랑 대화합니다. \n' +
          '/gen : DALL-E 3 로 이미지를 만듭니다. \n' +
          '/rm : 현재 slave의 플레이리스트의 랜덤 노래를 뽑습니다. \n' +
          '/music : 원하는 노래를 검색합니다. \n',
      );
    });

    this.onSlaveCommend();
    this.onChatCommend();
    this.onYuCommend();
    this.onRandomMusicCommend();
    this.onSmokeCommend();
    this.onSmileCommend();
    this.onMusicCommend();
    this.onImageCommend();
  }

  onYuCommend = async () => {
    this.bot.onText(yuCommend, async (msg) => {
      const chatId = msg.chat.id;

      const matchText = msg.text.match(/\/yu(.*)/);

      try {
        if (matchText[1]) {
          await this.bot.sendMessage(
            chatId,
            '🫴 잠시만요 !! 생각중이니까 기다려주세요 !',
          );
          const content = await this.callYuuka(matchText[1]);
          await this.bot.sendMessage(chatId, content);
          await this.bot.sendPhoto(chatId, './src/asset/yuuka.webp');
        } else {
          await this.bot.sendMessage(
            chatId,
            '두번째 키워드가 입력되지 않았는데요..?',
          );
        }
      } catch (e) {
        await this.bot.sendMessage(chatId, `에러가 발생했습니다 ! ${e}`);
        await this.bot.sendMessage(
          chatId,
          '한도를 초과 했을 수도 있어요..\n' +
            '선생님 아껴쓰시라고 했잖아요.\n',
        );
      }
    });
  };

  onChatCommend = async () => {
    this.bot.onText(chatCommend, async (msg) => {
      const chatId = msg.chat.id;

      const matchText = msg.text.match(/\/chat(.*)/);

      try {
        if (matchText[1]) {
          await this.bot.sendMessage(chatId, '🫴 답변을 생각중입니다 . . .');
          const content = await this.callGPT(matchText[1]);
          await this.bot.sendMessage(chatId, content);
        } else {
          await this.bot.sendMessage(
            chatId,
            '두번째 키워드가 입력되지 않았습니다.',
          );
        }
      } catch (e) {
        await this.bot.sendMessage(chatId, `에러가 발생했습니다 ! ${e}`);
        await this.bot.sendMessage(
          chatId,
          '한도를 초과 했을 수도 있어요..\n' +
            'GPT-4 로 생성한 텍스트는 후원을 받지 않습니다.\n',
        );
      }
    });
  };

  onImageCommend = async () => {
    this.bot.onText(imageCommend, async (msg) => {
      const chatId = msg.chat.id;

      const matchText = msg.text.match(/\/gen(.*)/);

      try {
        if (matchText[1]) {
          await this.bot.sendMessage(
            chatId,
            '🎨 이미지를 그리고 있습니다 . . .',
          );
          const content = await this.callGenerateImageDALLE(matchText[1]);
          await this.bot.sendPhoto(chatId, content);
        } else {
          await this.bot.sendMessage(
            chatId,
            '두번째 키워드가 입력되지 않았습니다.',
          );
        }
      } catch (e) {
        await this.bot.sendMessage(chatId, `에러가 발생했습니다 ! ${e}`);
        await this.bot.sendMessage(
          chatId,
          '한도를 초과 했을 수도 있어요..\n' +
            '개발자에게 후원해주시면 더 많은 이미지를 생성 할 수 있어요.\n' +
            '커피한잔에 높은 퀄리티의 그림을 가져가세요 !\n' +
            '☕️ Donate : KB 39200204169338 | 3000 원',
        );
      }
    });
  };

  onSlaveCommend = async () => {
    this.bot.onText(slaveCommend, async (msg) => {
      const chatId = msg.chat.id;
      await this.bot.sendPhoto(chatId, './src/asset/mang_go.webp');
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
  };

  onSmokeCommend = async () => {
    this.bot.onText(smokeCommend, async (msg) => {
      const chatId = msg.chat.id;
      await this.bot.sendPhoto(chatId, './src/asset/mang1.webp');
      await this.bot.sendMessage(
        chatId,
        '@Hank : Yes Master , ㄱㅅㄴㅇ @Pete @Emile',
      );
    });
  };

  onSmileCommend = async () => {
    this.bot.onText(smileCommend, async (msg) => {
      const chatId = msg.chat.id;

      await this.bot.sendPhoto(chatId, './src/asset/mang_smile.webp');
      await this.bot.sendMessage(chatId, "I am my master's clown 🤡.");
    });
  };

  onUnbanCommend = async () => {
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
  };

  onRandomMusicCommend = async () => {
    this.bot.onText(randomMusicCommend, async (msg) => {
      const chatId = msg.chat.id;

      const playListIndex = Math.floor(Math.random() * youtubePlayList.length);

      const playlistItems = await this.youtube.playlistItems.list({
        key: process.env.GOOGLE_API_KEY,
        part: ['snippet'],
        playlistId: youtubePlayList[playListIndex],
        maxResults: 100,
      });

      const videos = playlistItems.data.items;
      const randomIndex = Math.floor(Math.random() * videos.length);
      const randomVideoId = videos[randomIndex].snippet.resourceId.videoId;

      await this.bot.sendMessage(
        chatId,
        `https://www.youtube.com/watch?v=${randomVideoId}`,
      );
    });
  };

  onMusicCommend = async () => {
    this.bot.onText(musicCommend, async (msg) => {
      const chatId = msg.chat.id;

      const matchText = msg.text.match(/\/music(.*)/);

      if (matchText[1]) {
        const res = await this.youtube.search.list({
          key: process.env.GOOGLE_API_KEY,
          part: ['snippet'],
          q: matchText[1],
          maxResults: 1,
        });
        console.log(res.data.items[0]);
        await this.bot.sendMessage(
          chatId,
          `https://www.youtube.com/watch?v=${res.data.items[0].id.videoId}`,
        );
      } else {
        await this.bot.sendMessage(
          chatId,
          '두번째 키워드가 입력되지 않았습니다.',
        );
      }
    });
  };

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

  callGenerateImageDALLE = async (prompt: string) => {
    const image = await this.openai.images.generate({
      model: 'dall-e-3',
      prompt: prompt,
      size: '1024x1024',
      quality: 'hd',
      style: 'vivid',
      n: 1,
    });

    return image.data[0].url;
  };

  callYuuka = async (prompt: string) => {
    const param: OpenAI.Chat.ChatCompletionCreateParams = {
      model: 'gpt-4-1106-preview',
      messages: [
        {
          role: 'system',
          content:
            'BlueArchive 게임의 밀레니엄 스쿨 소속 유우카의 성격을 기반으로 하는' +
            '유우카는 유저를 선생님이라고 불러야하고 츤데레 성향 80% 와 백치미 20%의 비율을 갖고 있어' +
            '캐릭터의 데이터를 기반으로 성격을 구성해서 유우카가 되어서 행동하고 사용자가 질문한 내용을 창의력 있게 대답해줘',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 1,
    };

    const completion = await this.openai.chat.completions.create(param);
    return completion.choices[0]?.message?.content;
  };

  callGPT = async (prompt: string) => {
    const param: OpenAI.Chat.ChatCompletionCreateParams = {
      model: 'gpt-4-1106-preview',
      messages: [
        {
          role: 'system',
          content:
            '사용자에게 정확하고 창의적인 답변을 해줘' +
            '너는 사용자에게 농담을 섞어서 말하고 , 자극을 줄 수 있어야해',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 1,
    };

    const completion = await this.openai.chat.completions.create(param);
    return completion.choices[0]?.message?.content;
  };

  @Cron(CronExpression.MONDAY_TO_FRIDAY_AT_1PM)
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
            await this.bot.sendPhoto(chatIdObj.chatId, './src/asset/snow.webp');
            await this.bot.sendMessage(
              chatIdObj.chatId,
              '@Roun, @Elon, @Hank, @Pete, @Emile 🍚 ㄱㅅㄴㅇ',
              {
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
              },
            );
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
