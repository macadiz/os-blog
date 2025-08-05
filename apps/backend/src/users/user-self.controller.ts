import { Controller, Patch, Body, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequireAuthentication } from 'src/auth/decorators/require-authentication.decorator';

@Controller('users/me')
@RequireAuthentication()
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
