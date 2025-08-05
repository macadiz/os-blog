import { applyDecorators, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { AuthenticationOnlyGuard } from '../guards/authentication-only.guard';

/**
 * Decorator for endpoints that allow users with temporary passwords.
 * Only checks for JWT authentication and active status, but allows mustChangePassword=true.
 */
export function RequireAuthentication() {
  return applyDecorators(UseGuards(JwtAuthGuard, AuthenticationOnlyGuard));
}
