import { Module } from '@nestjs/common';
import { TagsController } from './tags.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TagsController],
  providers: [],
})
export class TagsModule {}
