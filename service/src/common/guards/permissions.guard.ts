import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AdminService } from '../../modules/admin/admin.service';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly adminService: AdminService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required?.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const admin = request.admin as { sub: number } | undefined;
    if (!admin?.sub) {
      throw new ForbiddenException({ status: 'error', message: 'Forbidden', code: 'FORBIDDEN' });
    }

    const profile = await this.adminService.getProfile(admin.sub);
    if (profile.roles.includes('admin') || profile.permissions.includes('*:*:*')) {
      return true;
    }

    const ok = required.some((p) => profile.permissions.includes(p));
    if (!ok) {
      throw new ForbiddenException({ status: 'error', message: 'Permission denied', code: 'FORBIDDEN' });
    }
    return true;
  }
}
