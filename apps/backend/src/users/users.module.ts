import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UserSelfController } from './user-self.controller';

@Module({
  controllers: [UsersController, UserSelfController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
