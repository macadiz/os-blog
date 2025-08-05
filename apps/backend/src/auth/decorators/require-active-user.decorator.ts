import { applyDecorators, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { ActiveUserGuard } from '../guards/active-user.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from './roles.decorator';

/**
 * Decorator that combines JWT authentication with active user validation.
 * Ensures the user is authenticated, active, and doesn't have a temporary password.
 * @param roles Optional roles to check for authorization
 */
export function RequireActiveUser(roles?: ('ADMIN' | 'AUTHOR')[]) {
  const decorators = [UseGuards(JwtAuthGuard, ActiveUserGuard)];

  if (roles && roles.length > 0) {
    decorators.push(UseGuards(RolesGuard), Roles(...roles));
  }

  return applyDecorators(...decorators);
}
