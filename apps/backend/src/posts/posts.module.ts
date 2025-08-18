import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { RssService } from './rss.service';

@Module({
  imports: [PrismaModule],
  controllers: [PostsController],
  providers: [PostsService, RssService],
  exports: [PostsService],
})
export class PostsModule {}
