import { Controller, Patch, Body, UseGuards, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserSelfController {
  constructor(private readonly usersService: UsersService) {}

  @Patch('change-password')
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @CurrentUser() currentUser: any,
  ) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Password changed successfully',
      data: await this.usersService.changePassword(
        currentUser.id,
        changePasswordDto,
      ),
    };
  }
}
