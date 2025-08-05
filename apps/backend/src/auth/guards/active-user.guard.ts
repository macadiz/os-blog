import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ActiveUserGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.id) {
      throw new UnauthorizedException('User not authenticated');
    }

    // Fetch fresh user data from database to prevent stale token data
    const currentUser = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        isActive: true,
        mustChangePassword: true,
        isTemporaryPassword: true,
      },
    });

    if (!currentUser) {
      throw new UnauthorizedException('User not found');
    }

    if (!currentUser.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    if (currentUser.mustChangePassword) {
      throw new UnauthorizedException(
        'Password change required. Please change your password before accessing this resource.',
      );
    }

    return true;
  }
}
