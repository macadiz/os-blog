import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    ThrottlerModule.forRoot([
      {
        name: 'comments',
        ttl: 900000, // 15 minutes
        limit: 2, // 2 requests per 15 minutes per IP
      },
    ]),
  ],
  controllers: [CommentsController],
  providers: [CommentsService],
  exports: [CommentsService],
})
export class CommentsModule {}