import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    // If no authorization header, allow request to proceed without authentication
    if (!authHeader) {
      return true;
    }

    // If authorization header exists, try to validate it
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (err || info) {
      // If there was an error validating the token or token info indicates an issue
      // Mark this as an authentication failure
      request.authError = { error: err, info };
      return null;
    }

    // If no auth header, treat as unauthenticated (valid)
    if (!authHeader) {
      return null;
    }

    // Return user if validation was successful
    return user;
  }
}
