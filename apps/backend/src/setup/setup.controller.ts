import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  HttpCode,
  HttpStatus,
  Request,
  UseGuards,
} from '@nestjs/common';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RequireActiveUser } from '../auth/decorators/require-active-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { SetupService } from './setup.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateBlogSettingsDto } from './dto/update-blog-settings.dto';

@Controller()
export class SetupController {
  constructor(private readonly setupService: SetupService) {}

  @Get('setup/required')
  async getSetupStatus() {
    const isRequired = await this.setupService.isSetupRequired();
    return {
      required: isRequired,
    };
  }

  @Post('setup/admin')
  @HttpCode(HttpStatus.CREATED)
  async createAdmin(@Body() createAdminDto: CreateAdminDto) {
    const admin = await this.setupService.createInitialAdmin(createAdminDto);
    return {
      message: 'Admin user created successfully',
      admin,
    };
  }

  @Get('setup/blog-settings')
  async getBlogSettings() {
    return await this.setupService.getBlogSettings();
  }

  @Put('setup/blog-settings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @RequireActiveUser()
  async updateBlogSettings(
    @Body() updateBlogSettingsDto: UpdateBlogSettingsDto,
  ) {
    const updatedSettings = await this.setupService.updateBlogSettings(
      updateBlogSettingsDto,
    );
    return {
      message: 'Blog settings updated successfully',
      settings: updatedSettings,
    };
  }

  @Get('setup/blog-status')
  @UseGuards(OptionalJwtAuthGuard)
  async getBlogSetupStatus(@Request() req?: any) {
    // Check if there was an authentication error
    if (req.authError) {
      // Invalid token was provided
      return await this.setupService.getBlogSetupStatus(undefined, true);
    }

    // Get current user ID from request (if authenticated)
    const currentUserId = req?.user?.id;
    return await this.setupService.getBlogSetupStatus(currentUserId);
  }

  @Get('insights')
  @RequireActiveUser()
  async getBlogInsights(@CurrentUser() currentUser: any) {
    return await this.setupService.getBlogInsights(currentUser);
  }
}
