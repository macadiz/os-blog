import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SetupService {
  constructor(private prisma: PrismaService) {}

  async isSetupRequired(): Promise<boolean> {
    const adminCount = await this.prisma.user.count({
      where: { role: 'ADMIN' },
    });
    return adminCount === 0;
  }

  async createInitialAdmin(createAdminDto: CreateAdminDto) {
    const setupRequired = await this.isSetupRequired();

    if (!setupRequired) {
      throw new ConflictException(
        'Admin user already exists. Setup is not required.',
      );
    }

    // Check if username or email already exists
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: createAdminDto.email },
          { username: createAdminDto.username },
        ],
      },
    });

    if (existingUser) {
      throw new ConflictException(
        'User with this email or username already exists',
      );
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(
      createAdminDto.password,
      saltRounds,
    );

    // Create admin user and blog settings in a transaction
    const result = await this.prisma.$transaction(async (prisma) => {
      // Create admin user
      const admin = await prisma.user.create({
        data: {
          email: createAdminDto.email,
          username: createAdminDto.username,
          password: hashedPassword,
          firstName: createAdminDto.firstName,
          lastName: createAdminDto.lastName,
          role: 'ADMIN',
        },
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          role: true,
          createdAt: true,
        },
      });

      // Create blog settings
      await prisma.blogSettings.upsert({
        where: { id: 'default' },
        create: {
          id: 'default',
          blogTitle: createAdminDto.blogTitle,
          blogDescription: createAdminDto.blogDescription,
        },
        update: {
          blogTitle: createAdminDto.blogTitle,
          blogDescription: createAdminDto.blogDescription,
        },
      });

      return admin;
    });

    return result;
  }

  async getBlogSettings() {
    return await this.prisma.blogSettings.findUnique({
      where: { id: 'default' },
    });
  }
}
