import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequireActiveUser } from '../auth/decorators/require-active-user.decorator';
import { RequireAuthentication } from '../auth/decorators/require-authentication.decorator';

@Controller('users')
@RequireActiveUser(['ADMIN'])
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return {
      statusCode: HttpStatus.CREATED,
      message: 'User created successfully',
      data: await this.usersService.create(createUserDto),
    };
  }

  @Get()
  async findAll(@Query() query: UserQueryDto) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Users retrieved successfully',
      data: await this.usersService.findAll(query),
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return {
      statusCode: HttpStatus.OK,
      message: 'User retrieved successfully',
      data: await this.usersService.findById(id),
    };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: any,
  ) {
    return {
      statusCode: HttpStatus.OK,
      message: 'User updated successfully',
      data: await this.usersService.update(id, updateUserDto, currentUser.id),
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser() currentUser: any) {
    await this.usersService.remove(id, currentUser.id);
    return {
      statusCode: HttpStatus.OK,
      message: 'User deleted successfully',
    };
  }

  @Patch(':id/toggle-status')
  async toggleStatus(@Param('id') id: string, @CurrentUser() currentUser: any) {
    return {
      statusCode: HttpStatus.OK,
      message: 'User status updated successfully',
      data: await this.usersService.toggleStatus(id, currentUser.id),
    };
  }

  @Get('stats/overview')
  async getUserStats() {
    return {
      statusCode: HttpStatus.OK,
      message: 'User statistics retrieved successfully',
      data: await this.usersService.getUserStats(),
    };
  }

  @Patch(':id/reset-password')
  async resetPassword(@Param('id') id: string) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Password reset successfully',
      data: await this.usersService.resetPassword(id),
    };
  }
}

// Separate controller for user self-service endpoints (all authenticated users)
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
