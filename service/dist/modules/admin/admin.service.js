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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = require("bcrypt");
const prisma_service_1 = require("../../prisma/prisma.service");
const business_exception_1 = require("../../common/exceptions/business.exception");
const mapper_1 = require("../../common/utils/mapper");
let AdminService = class AdminService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async login(username, password) {
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
            throw new business_exception_1.BusinessException(business_exception_1.AdminErrors.INVALID_CREDENTIALS, 'Invalid username or password', common_1.HttpStatus.UNAUTHORIZED);
        }
        if (admin.status !== 'ACTIVE') {
            throw new business_exception_1.BusinessException(business_exception_1.AdminErrors.ADMIN_DISABLED, 'Admin is disabled', common_1.HttpStatus.FORBIDDEN);
        }
        const ok = await bcrypt.compare(password, admin.password_hash);
        if (!ok) {
            throw new business_exception_1.BusinessException(business_exception_1.AdminErrors.INVALID_CREDENTIALS, 'Invalid username or password', common_1.HttpStatus.UNAUTHORIZED);
        }
        const permissions = new Set();
        const menuMap = new Map();
        for (const ur of admin.roles) {
            for (const rm of ur.role.menus) {
                const m = rm.menu;
                if (m.permission)
                    permissions.add(m.permission);
                menuMap.set(m.id, this.mapMenu(m));
            }
        }
        const menus = this.buildMenuTree([...menuMap.values()]);
        return {
            admin: (0, mapper_1.mapAdministrator)(admin),
            permissions: [...permissions],
            menus,
        };
    }
    async getProfile(adminId) {
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
            throw new business_exception_1.BusinessException(business_exception_1.AdminErrors.INVALID_CREDENTIALS, 'Admin not found', common_1.HttpStatus.NOT_FOUND);
        }
        const permissions = new Set();
        const menuMap = new Map();
        const roles = [];
        for (const ur of admin.roles) {
            roles.push(ur.role.key);
            for (const rm of ur.role.menus) {
                const m = rm.menu;
                if (m.permission)
                    permissions.add(m.permission);
                menuMap.set(m.id, this.mapMenu(m));
            }
        }
        return {
            user: (0, mapper_1.mapAdministrator)(admin),
            roles,
            permissions: [...permissions],
            menus: this.buildMenuTree([...menuMap.values()]),
        };
    }
    mapMenu(m) {
        return {
            id: m.id,
            parent_id: m.parent_id,
            name: m.name,
            type: m.type,
            path: m.path ?? undefined,
            component: m.component ?? undefined,
            permission: m.permission ?? undefined,
            sort: m.sort,
            visible: m.visible,
            children: [],
        };
    }
    buildMenuTree(flat) {
        const map = new Map(flat.map((m) => [m.id, m]));
        const roots = [];
        for (const item of flat) {
            if (item.parent_id === 0) {
                roots.push(item);
            }
            else {
                const parent = map.get(item.parent_id);
                if (parent)
                    parent.children.push(item);
            }
        }
        const sortRec = (items) => {
            items.sort((a, b) => a.sort - b.sort);
            items.forEach((i) => i.children?.length && sortRec(i.children));
        };
        sortRec(roots);
        return roots;
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminService);
//# sourceMappingURL=admin.service.js.map