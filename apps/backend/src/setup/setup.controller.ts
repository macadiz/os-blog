import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
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
}
