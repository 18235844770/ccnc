import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserJwtPayload } from '../../modules/auth/auth-token.service';

export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext): UserJwtPayload => {
  return ctx.switchToHttp().getRequest().user;
});

export const CurrentAdmin = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
  return ctx.switchToHttp().getRequest().admin;
});
