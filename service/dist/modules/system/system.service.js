"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = require("bcrypt");
const prisma_service_1 = require("../../prisma/prisma.service");
const business_exception_1 = require("../../common/exceptions/business.exception");
function mapRoleStatus(status) {
    return status === 'ACTIVE' ? 1 : 0;
}
function toRoleStatus(status) {
    return status === 0 ? 'DISABLED' : 'ACTIVE';
}
let SystemService = class SystemService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async listAdmins(params) {
        const page = Math.max(1, Number(params.page) || 1);
        const pageSize = Math.min(100, Math.max(1, Number(params.page_size) || 20));
        const [total, records] = await Promise.all([
            this.prisma.adminUser.count(),
            this.prisma.adminUser.findMany({
                include: { roles: { include: { role: true } } },
                skip: (page - 1) * pageSize,
                take: pageSize,
                orderBy: { id: 'desc' },
            }),
        ]);
        return {
            total,
            list: records.map((a) => ({
                id: a.id,
                username: a.username,
                status: mapRoleStatus(a.status),
                roles: a.roles.map((ur) => ({
                    id: ur.role.id,
                    name: ur.role.name,
                    key: ur.role.key,
                    status: mapRoleStatus(ur.role.status),
                    created_at: ur.role.created_at.toISOString(),
                })),
                created_at: a.created_at.toISOString(),
            })),
        };
    }
    async createAdmin(dto) {
        const existing = await this.prisma.adminUser.findUnique({ where: { username: dto.username } });
        if (existing) {
            throw new business_exception_1.BusinessException(business_exception_1.AdminErrors.USERNAME_EXISTS, 'Username exists', common_1.HttpStatus.CONFLICT);
        }
        const password_hash = await bcrypt.hash(dto.password, 10);
        const admin = await this.prisma.adminUser.create({
            data: {
                username: dto.username,
                password_hash,
                status: 'ACTIVE',
                roles: {
                    create: dto.role_ids.map((role_id) => ({ role_id })),
                },
            },
        });
        return { id: admin.id };
    }
    async resetAdminPassword(id, password) {
        const password_hash = await bcrypt.hash(password, 10);
        await this.prisma.adminUser.update({
            where: { id },
            data: { password_hash },
        });
        return { status: 'success' };
    }
    async listRoles() {
        const roles = await this.prisma.sysRole.findMany({ orderBy: { id: 'asc' } });
        return roles.map((r) => ({
            id: r.id,
            name: r.name,
            key: r.key,
            status: mapRoleStatus(r.status),
            created_at: r.created_at.toISOString(),
        }));
    }
    async createRole(dto) {
        const role = await this.prisma.sysRole.create({
            data: {
                name: dto.name,
                key: dto.key,
                status: toRoleStatus(dto.status),
            },
        });
        return { id: role.id };
    }
    async updateRole(id, dto) {
        const existing = await this.prisma.sysRole.findUnique({ where: { id } });
        if (!existing) {
            throw new business_exception_1.BusinessException('ROLE_NOT_FOUND', 'Role not found', common_1.HttpStatus.NOT_FOUND);
        }
        await this.prisma.sysRole.update({
            where: { id },
            data: {
                ...(dto.name !== undefined ? { name: dto.name } : {}),
                ...(dto.key !== undefined ? { key: dto.key } : {}),
                ...(dto.status !== undefined ? { status: toRoleStatus(dto.status) } : {}),
            },
        });
        return { status: 'success' };
    }
    async assignRoleMenus(roleId, menuIds) {
        await this.prisma.$transaction(async (tx) => {
            await tx.sysRoleMenu.deleteMany({ where: { role_id: roleId } });
            if (menuIds.length) {
                await tx.sysRoleMenu.createMany({
                    data: menuIds.map((menu_id) => ({ role_id: roleId, menu_id })),
                    skipDuplicates: true,
                });
            }
        });
        return { status: 'success' };
    }
    async getRoleMenuIds(roleId) {
        const rows = await this.prisma.sysRoleMenu.findMany({ where: { role_id: roleId } });
        return rows.map((r) => r.menu_id);
    }
    async listMenus() {
        const menus = await this.prisma.sysMenu.findMany({ orderBy: [{ sort: 'asc' }, { id: 'asc' }] });
        return menus.map((m) => ({
            id: m.id,
            parent_id: m.parent_id,
            name: m.name,
            type: m.type,
            path: m.path ?? undefined,
            component: m.component ?? undefined,
            permission: m.permission ?? undefined,
            sort: m.sort,
            visible: m.visible,
        }));
    }
    async createMenu(dto) {
        const menu = await this.prisma.sysMenu.create({
            data: {
                parent_id: dto.parent_id,
                name: dto.name,
                type: dto.type,
                path: dto.path,
                component: dto.component,
                permission: dto.permission,
                sort: dto.sort ?? 0,
                visible: dto.visible ?? true,
            },
        });
        return { id: menu.id };
    }
    async updateMenu(id, dto) {
        const existing = await this.prisma.sysMenu.findUnique({ where: { id } });
        if (!existing) {
            throw new business_exception_1.BusinessException('MENU_NOT_FOUND', 'Menu not found', common_1.HttpStatus.NOT_FOUND);
        }
        await this.prisma.sysMenu.update({
            where: { id },
            data: {
                ...(dto.parent_id !== undefined ? { parent_id: dto.parent_id } : {}),
                ...(dto.name !== undefined ? { name: dto.name } : {}),
                ...(dto.type !== undefined ? { type: dto.type } : {}),
                ...(dto.path !== undefined ? { path: dto.path } : {}),
                ...(dto.component !== undefined ? { component: dto.component } : {}),
                ...(dto.permission !== undefined ? { permission: dto.permission } : {}),
                ...(dto.sort !== undefined ? { sort: dto.sort } : {}),
                ...(dto.visible !== undefined ? { visible: dto.visible } : {}),
            },
        });
        return { status: 'success' };
    }
    async listAuditLogs(params) {
        const page = Math.max(1, Number(params.page) || 1);
        const pageSize = Math.min(100, Math.max(1, Number(params.page_size) || 20));
        const where = {
            ...(params.admin_id ? { admin_id: params.admin_id } : {}),
            ...(params.action ? { action: { contains: params.action } } : {}),
            ...(params.start_time || params.end_time
                ? {
                    created_at: {
                        ...(params.start_time ? { gte: new Date(params.start_time) } : {}),
                        ...(params.end_time ? { lte: new Date(params.end_time) } : {}),
                    },
                }
                : {}),
        };
        const [total, records] = await Promise.all([
            this.prisma.auditLog.count({ where }),
            this.prisma.auditLog.findMany({
                where,
                skip: (page - 1) * pageSize,
                take: pageSize,
                orderBy: { id: 'desc' },
            }),
        ]);
        const adminIds = [...new Set(records.map((r) => r.admin_id))];
        const admins = await this.prisma.adminUser.findMany({ where: { id: { in: adminIds } } });
        const adminMap = new Map(admins.map((a) => [a.id, a.username]));
        return {
            total,
            list: records.map((r) => ({
                id: r.id,
                admin_id: r.admin_id,
                admin_name: adminMap.get(r.admin_id) || `admin#${r.admin_id}`,
                action: r.action,
                target_type: r.target_type,
                target_id: r.target_id,
                reason: r.reason ?? '',
                created_at: r.created_at.toISOString(),
            })),
        };
    }
};
exports.SystemService = SystemService;
exports.SystemService = SystemService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SystemService);
//# sourceMappingURL=system.service.js.map