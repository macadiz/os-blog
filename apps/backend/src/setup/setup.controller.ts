import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Request,
  UseGuards,
} from '@nestjs/common';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SetupService } from './setup.service';
import { CreateAdminDto } from './dto/create-admin.dto';

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
  @UseGuards(JwtAuthGuard)
  async getBlogInsights() {
    return await this.setupService.getBlogInsights();
  }
}
