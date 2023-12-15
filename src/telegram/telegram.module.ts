import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';

@Module({
  imports: [TelegramModule],
  providers: [TelegramService],
})
export class TelegramModule {}
