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

  async getBlogSetupStatus(currentUserId?: string, hasAuthError = false) {
    try {
      // Check if there are active admin users
      const adminUsers = await this.prisma.user.findMany({
        where: {
          role: 'ADMIN',
          isActive: true,
        },
      });

      if (adminUsers.length === 0) {
        return {
          isSetup: false,
          hasAdminUsers: false,
          hasSettings: false,
          hasPosts: false,
          currentUserValid: false,
        };
      }

      // Check if blog settings exist
      const settings = await this.prisma.blogSettings.findFirst();
      const hasSettings = !!settings;

      // Check if there are any posts
      const postCount = await this.prisma.post.count();
      const hasPosts = postCount > 0;

      // Handle authentication status
      let currentUserValid = true;

      if (hasAuthError) {
        // Invalid token was provided
        currentUserValid = false;
      } else if (currentUserId !== undefined) {
        // Valid token was provided, check if user still exists
        const currentUser = await this.prisma.user.findFirst({
          where: {
            id: currentUserId,
            role: { in: ['ADMIN', 'AUTHOR'] },
            isActive: true,
          },
        });
        currentUserValid = !!currentUser;
      }
      // If currentUserId is undefined and no auth error, treat as unauthenticated (valid)

      // Blog is considered "set up" if there are admin users and settings exist
      // Current user validity only affects setup status when there IS an authenticated user
      const isSetup =
        adminUsers.length > 0 &&
        hasSettings &&
        (currentUserId === undefined || currentUserValid);

      return {
        isSetup,
        hasAdminUsers: adminUsers.length > 0,
        hasSettings,
        hasPosts,
        currentUserValid,
      };
    } catch (error) {
      console.error('Error checking blog setup status:', error);
      return {
        isSetup: false,
        hasAdminUsers: false,
        hasSettings: false,
        hasPosts: false,
        currentUserValid: false,
      };
    }
  }

  async getBlogInsights() {
    try {
      // Get counts for dashboard insights
      const [postsCount, categoriesCount, tagsCount, usersCount] =
        await Promise.all([
          this.prisma.post.count(),
          this.prisma.category.count(),
          this.prisma.tag.count(),
          this.prisma.user.count({
            where: { isActive: true },
          }),
        ]);

      // Get published posts count
      const publishedPostsCount = await this.prisma.post.count({
        where: { published: true },
      });

      // Get recent posts (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const recentPostsCount = await this.prisma.post.count({
        where: {
          createdAt: {
            gte: sevenDaysAgo,
          },
        },
      });

      return {
        totalPosts: postsCount,
        publishedPosts: publishedPostsCount,
        draftPosts: postsCount - publishedPostsCount,
        totalCategories: categoriesCount,
        totalTags: tagsCount,
        totalUsers: usersCount,
        recentPosts: recentPostsCount,
      };
    } catch (error) {
      console.error('Error getting blog insights:', error);
      return {
        totalPosts: 0,
        publishedPosts: 0,
        draftPosts: 0,
        totalCategories: 0,
        totalTags: 0,
        totalUsers: 0,
        recentPosts: 0,
      };
    }
  }
}
