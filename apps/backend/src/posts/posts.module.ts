import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { RssService } from '../rss/rss.service';
import { SetupModule } from '../setup/setup.module';

@Module({
  imports: [PrismaModule, SetupModule],
  controllers: [PostsController],
  providers: [PostsService, RssService],
  exports: [PostsService],
})
export class PostsModule {}
