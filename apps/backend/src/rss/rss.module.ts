import { Module } from '@nestjs/common';
import { RssController } from './rss.controller';
import { RssService } from './rss.service';
import { PrismaModule } from '../prisma/prisma.module';
import { SetupModule } from '../setup/setup.module';

@Module({
  imports: [PrismaModule, SetupModule],
  controllers: [RssController],
  providers: [RssService],
  exports: [RssService],
})
export class RssModule {}
