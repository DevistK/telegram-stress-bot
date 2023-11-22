import { Ctx, Hears, Start, Update } from 'nestjs-telegraf';

@Update()
export class AppUpdate {
  @Start()
  async start(@Ctx() ctx) {
    const keyboard = [
      [
        { text: 'Button 1', callback_data: 'Btn 1' },
        { text: 'Button 2', callback_data: 'Btn 2' },
      ],
    ];

    const replyMarkup = {
      keyboard,
      resize_keyboard: true,
      one_time_keyboard: true,
      bot_is_member: true,
    };

    return await ctx.reply('Choose an option:', { reply_markup: replyMarkup });
  }

  @Hears(/(.+)/gm)
  async hears(@Ctx() ctx) {
    console.log(ctx.update.message.text);
  }
}
