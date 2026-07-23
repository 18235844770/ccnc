import { Injectable, HttpStatus } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { BusinessException, AdminErrors } from '../../common/exceptions/business.exception';
import { mapAdministrator } from '../../common/utils/mapper';
import { CreateAdminDto, CreateMenuDto, CreateRoleDto, UpdateMenuDto, UpdateRoleDto } from '../../common/dto';

function mapRoleStatus(status: string) {
  return status === 'ACTIVE' ? 1 : 0;
}

function toRoleStatus(status?: number) {
  return status === 0 ? 'DISABLED' : 'ACTIVE';
}

@Injectable()
export class SystemService {
  constructor(private readonly prisma: PrismaService) {}

  async listAdmins(params: { page?: number; page_size?: number }) {
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

  async createAdmin(dto: CreateAdminDto) {
    const existing = await this.prisma.adminUser.findUnique({ where: { username: dto.username } });
    if (existing) {
      throw new BusinessException(AdminErrors.USERNAME_EXISTS, 'Username exists', HttpStatus.CONFLICT);
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

  async resetAdminPassword(id: number, password: string) {
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

  async createRole(dto: CreateRoleDto) {
    const role = await this.prisma.sysRole.create({
      data: {
        name: dto.name,
        key: dto.key,
        status: toRoleStatus(dto.status),
      },
    });
    return { id: role.id };
  }

  async updateRole(id: number, dto: UpdateRoleDto) {
    const existing = await this.prisma.sysRole.findUnique({ where: { id } });
    if (!existing) {
      throw new BusinessException('ROLE_NOT_FOUND', 'Role not found', HttpStatus.NOT_FOUND);
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

  async assignRoleMenus(roleId: number, menuIds: number[]) {
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

  async getRoleMenuIds(roleId: number) {
    const rows = await this.prisma.sysRoleMenu.findMany({ where: { role_id: roleId } });
    return rows.map((r) => r.menu_id);
  }

  async listMenus() {
    const menus = await this.prisma.sysMenu.findMany({ orderBy: [{ sort: 'asc' }, { id: 'asc' }] });
    return menus.map((m) => ({
      id: m.id,
      parent_id: m.parent_id,
      name: m.name,
      type: m.type as 1 | 2 | 3,
      path: m.path ?? undefined,
      component: m.component ?? undefined,
      permission: m.permission ?? undefined,
      sort: m.sort,
      visible: m.visible,
    }));
  }

  async createMenu(dto: CreateMenuDto) {
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

  async updateMenu(id: number, dto: UpdateMenuDto) {
    const existing = await this.prisma.sysMenu.findUnique({ where: { id } });
    if (!existing) {
      throw new BusinessException('MENU_NOT_FOUND', 'Menu not found', HttpStatus.NOT_FOUND);
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

  async listAuditLogs(params: {
    page?: number;
    page_size?: number;
    admin_id?: number;
    action?: string;
    start_time?: string;
    end_time?: string;
  }) {
    const page = Math.max(1, Number(params.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(params.page_size) || 20));
    const where: Prisma.AuditLogWhereInput = {
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
}
