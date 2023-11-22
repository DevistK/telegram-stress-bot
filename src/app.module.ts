import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TelegramModule } from './telegram/telegram.module';

@Module({
  imports: [
    // AppUpdate,
    // TelegrafModule.forRoot({
    //   middlewares: [],
    //   botName: 'wyFoodStillBot',
    //   token: process.env.TELEGRAM_API_KEY,
    // }),
  TelegramModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
