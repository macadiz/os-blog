import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    // Check if email or username already exists
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: createUserDto.email },
          { username: createUserDto.username },
        ],
      },
    });

    if (existingUser) {
      if (existingUser.email === createUserDto.email) {
        throw new ConflictException('Email already exists');
      }
      if (existingUser.username === createUserDto.username) {
        throw new ConflictException('Username already exists');
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(
      createUserDto.password ?? createUserDto.username,
      10,
    );

    const user = await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
        isTemporaryPassword: true, // New users get a temporary password
        mustChangePassword: true, // Force password change on first login
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        isTemporaryPassword: true,
        mustChangePassword: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async findAll(query: UserQueryDto) {
    const {
      search,
      role,
      isActive,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const where: any = {};

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) {
      where.role = role;
    }

    if (isActive !== undefined) {
      // Convert string to boolean if needed
      const activeFilter =
        typeof isActive === 'string' ? isActive === 'true' : isActive;
      where.isActive = activeFilter;
    }

    const users = await this.prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        isTemporaryPassword: true,
        mustChangePassword: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            posts: true,
            categories: true,
          },
        },
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
    });

    const total = await this.prisma.user.count({ where });

    return {
      users,
      total,
      meta: {
        search,
        role,
        isActive,
        sortBy,
        sortOrder,
      },
    };
  }

  async findByEmail(email: string) {
    return await this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        isTemporaryPassword: true,
        mustChangePassword: true,
        lastLoginAt: true,
        passwordResetAt: true,
        passwordChangedAt: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            posts: true,
            categories: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    currentUserId: string,
  ) {
    // Prevent self-deletion/deactivation through role change
    if (
      id === currentUserId &&
      updateUserDto.role &&
      updateUserDto.role !== 'ADMIN'
    ) {
      throw new BadRequestException('Cannot change your own admin role');
    }

    if (
      id === currentUserId &&
      typeof updateUserDto.isActive === 'boolean' &&
      !updateUserDto.isActive
    ) {
      throw new BadRequestException('Cannot deactivate your own account');
    }

    // Verify user exists
    await this.findById(id);

    // Check for email/username conflicts (excluding current user)
    if (updateUserDto.email || updateUserDto.username) {
      const conflictUser = await this.prisma.user.findFirst({
        where: {
          AND: [
            { id: { not: id } },
            {
              OR: [
                ...(updateUserDto.email
                  ? [{ email: updateUserDto.email }]
                  : []),
                ...(updateUserDto.username
                  ? [{ username: updateUserDto.username }]
                  : []),
              ],
            },
          ],
        },
      });

      if (conflictUser) {
        if (conflictUser.email === updateUserDto.email) {
          throw new ConflictException('Email already exists');
        }
        if (conflictUser.username === updateUserDto.username) {
          throw new ConflictException('Username already exists');
        }
      }
    }

    const updateData: any = { ...updateUserDto };

    // Hash password if provided
    if (updateUserDto.password) {
      updateData.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async remove(id: string, currentUserId: string) {
    // Prevent self-deletion
    if (id === currentUserId) {
      throw new BadRequestException('Cannot delete your own account');
    }

    // Verify user exists
    await this.findById(id);

    // Check if user has associated content
    const userContent = await this.prisma.user.findUnique({
      where: { id },
      select: {
        _count: {
          select: {
            posts: true,
            categories: true,
          },
        },
      },
    });

    if (
      userContent &&
      (userContent._count.posts > 0 || userContent._count.categories > 0)
    ) {
      throw new BadRequestException(
        'Cannot delete user with associated posts or categories. Please reassign or delete their content first.',
      );
    }

    await this.prisma.user.delete({
      where: { id },
    });

    return { deleted: true };
  }

  async toggleStatus(id: string, currentUserId: string) {
    // Prevent self-deactivation
    if (id === currentUserId) {
      throw new BadRequestException('Cannot change your own account status');
    }

    const user = await this.findById(id);

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        isActive: !user.isActive,
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }

  async getUserStats() {
    const [totalUsers, activeUsers, adminUsers, authorUsers] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.user.count({ where: { isActive: true } }),
        this.prisma.user.count({ where: { role: 'ADMIN' } }),
        this.prisma.user.count({ where: { role: 'AUTHOR' } }),
      ]);

    const recentUsers = await this.prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return {
      total: totalUsers,
      active: activeUsers,
      inactive: totalUsers - activeUsers,
      admins: adminUsers,
      authors: authorUsers,
      recent: recentUsers,
    };
  }

  async resetPassword(id: string) {
    // Verify user exists
    await this.findById(id);

    // Generate a temporary password
    const tempPassword = Math.random().toString(36).slice(-12);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    await this.prisma.user.update({
      where: { id },
      data: {
        password: hashedPassword,
        isTemporaryPassword: true,
        mustChangePassword: true,
        passwordResetAt: new Date(),
      },
    });

    // In a real application, you would send this via email
    // For now, we return it (this is not secure for production)
    return {
      message: 'Password reset successfully',
      temporaryPassword: tempPassword,
      note: 'Please provide this temporary password to the user and ask them to change it immediately.',
    };
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, password: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.password,
    );

    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(
      changePasswordDto.newPassword,
      10,
    );

    // Update password and clear temporary flags
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedNewPassword,
        isTemporaryPassword: false,
        mustChangePassword: false,
        passwordChangedAt: new Date(),
      },
    });

    return {
      message: 'Password changed successfully',
    };
  }

  async updateLastLogin(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        lastLoginAt: new Date(),
      },
    });
  }
}
