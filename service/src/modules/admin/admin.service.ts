import { Injectable, HttpStatus } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { BusinessException, AdminErrors } from '../../common/exceptions/business.exception';
import { mapAdministrator } from '../../common/utils/mapper';

export interface MenuNode {
  id: number;
  parent_id: number;
  name: string;
  type: 1 | 2 | 3;
  path?: string;
  component?: string;
  permission?: string;
  sort: number;
  visible: boolean;
  children: MenuNode[];
}

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async login(username: string, password: string) {
    const admin = await this.prisma.adminUser.findUnique({
      where: { username },
      include: {
        roles: {
          include: {
            role: {
              include: {
                menus: { include: { menu: true } },
              },
            },
          },
        },
      },
    });

    if (!admin) {
      throw new BusinessException(AdminErrors.INVALID_CREDENTIALS, 'Invalid username or password', HttpStatus.UNAUTHORIZED);
    }
    if (admin.status !== 'ACTIVE') {
      throw new BusinessException(AdminErrors.ADMIN_DISABLED, 'Admin is disabled', HttpStatus.FORBIDDEN);
    }

    const ok = await bcrypt.compare(password, admin.password_hash);
    if (!ok) {
      throw new BusinessException(AdminErrors.INVALID_CREDENTIALS, 'Invalid username or password', HttpStatus.UNAUTHORIZED);
    }

    const permissions = new Set<string>();
    const menuMap = new Map<number, ReturnType<typeof this.mapMenu>>();

    for (const ur of admin.roles) {
      for (const rm of ur.role.menus) {
        const m = rm.menu;
        if (m.permission) permissions.add(m.permission);
        menuMap.set(m.id, this.mapMenu(m));
      }
    }

    const menus = this.buildMenuTree([...menuMap.values()]);

    return {
      admin: mapAdministrator(admin),
      permissions: [...permissions],
      menus,
    };
  }

  async getProfile(adminId: number) {
    const admin = await this.prisma.adminUser.findUnique({
      where: { id: adminId },
      include: {
        roles: {
          include: {
            role: {
              include: {
                menus: { include: { menu: true } },
              },
            },
          },
        },
      },
    });
    if (!admin) {
      throw new BusinessException(AdminErrors.INVALID_CREDENTIALS, 'Admin not found', HttpStatus.NOT_FOUND);
    }

    const permissions = new Set<string>();
    const menuMap = new Map<number, ReturnType<typeof this.mapMenu>>();
    const roles: string[] = [];

    for (const ur of admin.roles) {
      roles.push(ur.role.key);
      for (const rm of ur.role.menus) {
        const m = rm.menu;
        if (m.permission) permissions.add(m.permission);
        menuMap.set(m.id, this.mapMenu(m));
      }
    }

    return {
      user: mapAdministrator(admin),
      roles,
      permissions: [...permissions],
      menus: this.buildMenuTree([...menuMap.values()]),
    };
  }

  private mapMenu(m: {
    id: number;
    parent_id: number;
    name: string;
    type: number;
    path: string | null;
    component: string | null;
    permission: string | null;
    sort: number;
    visible: boolean;
  }): MenuNode {
    return {
      id: m.id,
      parent_id: m.parent_id,
      name: m.name,
      type: m.type as 1 | 2 | 3,
      path: m.path ?? undefined,
      component: m.component ?? undefined,
      permission: m.permission ?? undefined,
      sort: m.sort,
      visible: m.visible,
      children: [],
    };
  }

  private buildMenuTree(flat: MenuNode[]) {
    const map = new Map(flat.map((m) => [m.id, m]));
    const roots: MenuNode[] = [];
    for (const item of flat) {
      if (item.parent_id === 0) {
        roots.push(item);
      } else {
        const parent = map.get(item.parent_id);
        if (parent) parent.children!.push(item);
      }
    }
    const sortRec = (items: MenuNode[]) => {
      items.sort((a, b) => a.sort - b.sort);
      items.forEach((i) => i.children?.length && sortRec(i.children));
    };
    sortRec(roots);
    return roots;
  }
}
