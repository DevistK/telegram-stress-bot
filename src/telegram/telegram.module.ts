import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { TweetModule } from '../tweet/tweet.module';

@Module({
  imports: [TweetModule],
  providers: [TelegramService],
})
export class TelegramModule {}
