import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthenticationOnlyGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.id) {
      throw new UnauthorizedException('User not authenticated');
    }

    // Fetch fresh user data from database
    const currentUser = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        isActive: true,
      },
    });

    if (!currentUser) {
      throw new UnauthorizedException('User not found');
    }

    if (!currentUser.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Allow access even if mustChangePassword is true (for password change endpoints)
    return true;
  }
}
