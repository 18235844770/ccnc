import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserJwtGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const auth = request.headers.authorization as string | undefined;
    if (!auth?.startsWith('Bearer ')) {
      throw new UnauthorizedException({ status: 'error', message: 'Unauthorized', code: 'UNAUTHORIZED' });
    }
    try {
      const payload = this.jwt.verify(auth.slice(7), {
        secret: this.config.get<string>('JWT_SECRET'),
      });
      if (payload.type !== 'user') {
        throw new UnauthorizedException();
      }
      request.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException({ status: 'error', message: 'Invalid token', code: 'INVALID_TOKEN' });
    }
  }
}

@Injectable()
export class AdminJwtGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const auth = request.headers.authorization as string | undefined;
    if (!auth?.startsWith('Bearer ')) {
      throw new UnauthorizedException({ status: 'error', message: 'Unauthorized', code: 'UNAUTHORIZED' });
    }
    try {
      const secret = this.config.get<string>('JWT_ADMIN_SECRET') || this.config.get<string>('JWT_SECRET');
      const payload = this.jwt.verify(auth.slice(7), { secret });
      if (payload.type !== 'admin') {
        throw new UnauthorizedException();
      }
      request.admin = payload;
      return true;
    } catch {
      throw new UnauthorizedException({ status: 'error', message: 'Invalid token', code: 'INVALID_TOKEN' });
    }
  }
}
