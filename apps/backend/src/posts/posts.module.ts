import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { RssService } from '../rss/rss.service';
import { SetupModule } from '../setup/setup.module';
import { StaticGeneratorService } from './static-generator.service';

@Module({
  imports: [PrismaModule, SetupModule, HttpModule],
  controllers: [PostsController],
  providers: [PostsService, RssService, StaticGeneratorService],
  exports: [PostsService],
})
export class PostsModule {}
