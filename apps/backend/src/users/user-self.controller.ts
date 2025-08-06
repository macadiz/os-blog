import { Controller, Get, Patch, Body, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequireAuthentication } from 'src/auth/decorators/require-authentication.decorator';

@Controller('users/profile')
@RequireAuthentication()
export class UserSelfController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getProfile(@CurrentUser() currentUser: any) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Profile retrieved successfully',
      data: await this.usersService.getCurrentProfile(currentUser.id),
    };
  }

  @Patch()
  async updateProfile(
    @Body() updateProfileDto: UpdateProfileDto,
    @CurrentUser() currentUser: any,
  ) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Profile updated successfully',
      data: await this.usersService.updateProfile(
        currentUser.id,
        updateProfileDto,
      ),
    };
  }

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
