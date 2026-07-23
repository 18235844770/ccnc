import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AdminService } from '../../modules/admin/admin.service';
export declare class PermissionsGuard implements CanActivate {
    private readonly reflector;
    private readonly adminService;
    constructor(reflector: Reflector, adminService: AdminService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
