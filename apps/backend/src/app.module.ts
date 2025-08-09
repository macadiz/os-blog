import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PostsModule } from './posts/posts.module';
import { CategoriesModule } from './categories/categories.module';
import { TagsModule } from './tags/tags.module';
import { SetupModule } from './setup/setup.module';
import { FilesModule } from './files/files.module';
import { HttpsRedirectMiddleware } from './common/middleware/https-redirect.middleware';
import { ProductionConfig } from './common/config/production.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    PostsModule,
    CategoriesModule,
    TagsModule,
    SetupModule,
    FilesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply HTTPS redirect middleware only if FORCE_HTTPS is enabled
    if (ProductionConfig.shouldForceHttps()) {
      consumer.apply(HttpsRedirectMiddleware).forRoutes('*');
    }
  }
}
