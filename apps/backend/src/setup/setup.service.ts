import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateBlogSettingsDto } from './dto/update-blog-settings.dto';
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

  async updateBlogSettings(updateBlogSettingsDto: UpdateBlogSettingsDto) {
    return await this.prisma.blogSettings.upsert({
      where: { id: 'default' },
      create: {
        id: 'default',
        blogTitle: updateBlogSettingsDto.blogTitle,
        blogDescription: updateBlogSettingsDto.blogDescription || '',
        logoUrl: updateBlogSettingsDto.logoUrl,
        faviconUrl: updateBlogSettingsDto.faviconUrl,
        theme: updateBlogSettingsDto.theme || 'default',
        emailSettings: updateBlogSettingsDto.emailSettings,
        socialLinks: updateBlogSettingsDto.socialLinks,
        seoSettings: updateBlogSettingsDto.seoSettings,
      },
      update: {
        blogTitle: updateBlogSettingsDto.blogTitle,
        blogDescription: updateBlogSettingsDto.blogDescription,
        logoUrl: updateBlogSettingsDto.logoUrl,
        faviconUrl: updateBlogSettingsDto.faviconUrl,
        theme: updateBlogSettingsDto.theme,
        emailSettings: updateBlogSettingsDto.emailSettings,
        socialLinks: updateBlogSettingsDto.socialLinks,
        seoSettings: updateBlogSettingsDto.seoSettings,
      },
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
    } catch {
      // Return error state if unable to determine setup status
      return {
        isSetup: false,
        adminExists: false,
        hasBasicSettings: false,
        currentUserValid: false,
      };
    }
  }

  async getBlogInsights(currentUser?: any) {
    try {
      // Base queries - these depend on user role
      let postsWhere = {};
      let publishedPostsWhere = { published: true };
      let recentPostsWhere = {};

      // If user is not ADMIN, filter to only their posts
      if (currentUser && currentUser.role !== 'ADMIN') {
        const authorFilter = { authorId: currentUser.id };
        postsWhere = authorFilter;
        publishedPostsWhere = { ...publishedPostsWhere, ...authorFilter };

        // Recent posts (last 7 days) with author filter
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        recentPostsWhere = {
          ...authorFilter,
          createdAt: { gte: sevenDaysAgo },
        };
      } else {
        // Admin sees all posts - set up recent posts filter for all posts
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        recentPostsWhere = {
          createdAt: { gte: sevenDaysAgo },
        };
      }

      // Get counts for dashboard insights
      const [postsCount, categoriesCount, tagsCount, usersCount] =
        await Promise.all([
          this.prisma.post.count({ where: postsWhere }),
          // Categories and tags are always global for now
          this.prisma.category.count(),
          this.prisma.tag.count(),
          // Users count is always global
          this.prisma.user.count({
            where: { isActive: true },
          }),
        ]);

      // Get published posts count
      const publishedPostsCount = await this.prisma.post.count({
        where: publishedPostsWhere,
      });

      // Get recent posts count
      const recentPostsCount = await this.prisma.post.count({
        where: recentPostsWhere,
      });

      return {
        totalPosts: postsCount,
        publishedPosts: publishedPostsCount,
        draftPosts: postsCount - publishedPostsCount,
        totalCategories: categoriesCount,
        totalTags: tagsCount,
        totalUsers: usersCount,
        recentPosts: recentPostsCount,
        // Add context about what data is shown
        scope: currentUser?.role === 'ADMIN' ? 'global' : 'user',
      };
    } catch {
      return {
        totalPosts: 0,
        publishedPosts: 0,
        draftPosts: 0,
        totalCategories: 0,
        totalTags: 0,
        totalUsers: 0,
        recentPosts: 0,
        scope: 'error',
      };
    }
  }
}
