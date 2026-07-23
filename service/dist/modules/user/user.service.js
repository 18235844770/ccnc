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
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = require("bcrypt");
const crypto_1 = require("crypto");
const prisma_service_1 = require("../../prisma/prisma.service");
const business_exception_1 = require("../../common/exceptions/business.exception");
const mapper_1 = require("../../common/utils/mapper");
const MAX_PROMO_LEVEL = 5;
let UserService = class UserService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async register(dto) {
        const existing = await this.prisma.user.findUnique({ where: { username: dto.username } });
        if (existing) {
            throw new business_exception_1.BusinessException(business_exception_1.UserErrors.USERNAME_EXISTS, 'Username already exists', common_1.HttpStatus.CONFLICT);
        }
        const password_hash = await bcrypt.hash(dto.password, 10);
        return this.prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    username: dto.username,
                    password_hash,
                    status: 'NORMAL',
                },
            });
            await tx.wallet.create({
                data: { user_id: user.id, type: 'BALANCE' },
            });
            const inviteCode = this.generateInviteCode();
            await tx.promotionLink.create({
                data: { user_id: user.id, invite_code: inviteCode, status: 'ACTIVE' },
            });
            if (dto.invite_code) {
                await this.bindPromotion(tx, user.id, dto.invite_code);
            }
            return (0, mapper_1.mapUser)(user);
        });
    }
    async bindPromotion(tx, userId, inviteCode) {
        const link = await tx.promotionLink.findUnique({ where: { invite_code: inviteCode } });
        if (!link || link.status !== 'ACTIVE') {
            throw new business_exception_1.BusinessException(business_exception_1.UserErrors.INVALID_INVITE_CODE, 'Invalid invite code');
        }
        const parentRelation = await tx.userRelation.findUnique({ where: { user_id: link.user_id } });
        const parentLevel = parentRelation?.level ?? 0;
        if (parentLevel >= MAX_PROMO_LEVEL) {
            await tx.userRelation.create({
                data: {
                    user_id: userId,
                    parent_user_id: link.user_id,
                    level: MAX_PROMO_LEVEL,
                    path: parentRelation?.path ?? String(link.user_id),
                },
            });
            return;
        }
        const newLevel = parentLevel + 1;
        const path = parentRelation ? `${parentRelation.path}/${link.user_id}` : String(link.user_id);
        await tx.userRelation.create({
            data: {
                user_id: userId,
                parent_user_id: link.user_id,
                level: newLevel,
                path,
            },
        });
    }
    async login(username, password) {
        const user = await this.prisma.user.findUnique({ where: { username } });
        if (!user) {
            throw new business_exception_1.BusinessException(business_exception_1.UserErrors.INVALID_CREDENTIALS, 'Invalid username or password', common_1.HttpStatus.UNAUTHORIZED);
        }
        if (user.status !== 'NORMAL') {
            throw new business_exception_1.BusinessException(business_exception_1.UserErrors.USER_DISABLED, 'User is disabled', common_1.HttpStatus.FORBIDDEN);
        }
        const ok = await bcrypt.compare(password, user.password_hash);
        if (!ok) {
            throw new business_exception_1.BusinessException(business_exception_1.UserErrors.INVALID_CREDENTIALS, 'Invalid username or password', common_1.HttpStatus.UNAUTHORIZED);
        }
        return user;
    }
    async getById(id) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user) {
            throw new business_exception_1.BusinessException(business_exception_1.UserErrors.USER_NOT_FOUND, 'User not found', common_1.HttpStatus.NOT_FOUND);
        }
        const realname = await this.prisma.realnameAuth.findUnique({ where: { user_id: id } });
        return {
            ...(0, mapper_1.mapUser)(user),
            realname_status: realname?.auth_status,
            real_name: realname?.auth_status === 'APPROVED' ? realname.real_name : undefined,
        };
    }
    async submitRealname(userId, dto) {
        const idCard = dto.id_card.trim().toUpperCase();
        if (!/^(\d{15}|\d{17}[\dX])$/.test(idCard)) {
            throw new business_exception_1.BusinessException('INVALID_ID_CARD', 'Invalid ID card number', common_1.HttpStatus.BAD_REQUEST);
        }
        const existing = await this.prisma.realnameAuth.findUnique({ where: { user_id: userId } });
        if (existing?.auth_status === 'APPROVED') {
            throw new business_exception_1.BusinessException('REALNAME_ALREADY_APPROVED', 'Already verified', common_1.HttpStatus.CONFLICT);
        }
        const record = await this.prisma.realnameAuth.upsert({
            where: { user_id: userId },
            update: {
                real_name: dto.real_name.trim(),
                id_card: idCard,
                auth_status: 'APPROVED',
            },
            create: {
                user_id: userId,
                real_name: dto.real_name.trim(),
                id_card: idCard,
                auth_status: 'APPROVED',
            },
        });
        return {
            auth_status: record.auth_status,
            real_name: record.real_name,
        };
    }
    async getRealname(userId) {
        const record = await this.prisma.realnameAuth.findUnique({ where: { user_id: userId } });
        if (!record) {
            return { auth_status: 'NONE' };
        }
        return {
            auth_status: record.auth_status,
            real_name: record.auth_status === 'APPROVED' ? record.real_name : undefined,
            created_at: record.created_at.toISOString(),
        };
    }
    async updateProfile(userId, dto) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new business_exception_1.BusinessException(business_exception_1.UserErrors.USER_NOT_FOUND, 'User not found', common_1.HttpStatus.NOT_FOUND);
        }
        const updated = await this.prisma.user.update({
            where: { id: userId },
            data: {
                ...(dto.email !== undefined ? { email: dto.email || null } : {}),
                ...(dto.phone_number !== undefined ? { phone_number: dto.phone_number || null } : {}),
                ...(dto.avatar_url !== undefined ? { avatar_url: dto.avatar_url || null } : {}),
            },
        });
        return (0, mapper_1.mapUser)(updated);
    }
    async listAdmin(params) {
        const page = Math.max(1, Number(params.page) || 1);
        const pageSize = Math.min(100, Math.max(1, Number(params.page_size) || 20));
        const keyword = params.keyword?.trim() || params.username?.trim();
        const where = {
            ...(params.user_id ? { id: Number(params.user_id) } : {}),
            ...(params.status ? { status: params.status } : {}),
            ...(keyword
                ? {
                    OR: [
                        { username: { contains: keyword } },
                        { phone_number: { contains: keyword } },
                        { email: { contains: keyword } },
                    ],
                }
                : {}),
        };
        const [total, records] = await Promise.all([
            this.prisma.user.count({ where }),
            this.prisma.user.findMany({
                where,
                skip: (page - 1) * pageSize,
                take: pageSize,
                orderBy: { id: 'desc' },
            }),
        ]);
        const userIds = records.map((u) => u.id);
        const l1Groups = userIds.length
            ? await this.prisma.userRelation.groupBy({
                by: ['parent_user_id'],
                where: { parent_user_id: { in: userIds } },
                _count: { id: true },
            })
            : [];
        const l1Map = new Map(l1Groups.map((g) => [g.parent_user_id, g._count.id]));
        return {
            total,
            records: records.map((u) => ({
                user_id: u.id,
                username: u.username,
                phone_number: u.phone_number ?? undefined,
                email: u.email ?? undefined,
                status: u.status,
                created_at: u.created_at.toISOString(),
                promo_summary: { l1_count: l1Map.get(u.id) ?? 0 },
            })),
        };
    }
    async banUser(adminId, userId, dto) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new business_exception_1.BusinessException(business_exception_1.UserErrors.USER_NOT_FOUND, 'User not found', common_1.HttpStatus.NOT_FOUND);
        }
        const beforeStatus = user.status;
        await this.prisma.$transaction(async (tx) => {
            await tx.user.update({
                where: { id: userId },
                data: { status: dto.mode },
            });
            await tx.auditLog.create({
                data: {
                    admin_id: adminId,
                    action: 'USER_BAN',
                    target_type: 'USER',
                    target_id: userId,
                    reason: dto.reason,
                    before_data: JSON.stringify({ status: beforeStatus }),
                    after_data: JSON.stringify({ status: dto.mode }),
                },
            });
        });
        return { status: 'success' };
    }
    async unbanUser(adminId, userId, dto) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new business_exception_1.BusinessException(business_exception_1.UserErrors.USER_NOT_FOUND, 'User not found', common_1.HttpStatus.NOT_FOUND);
        }
        const beforeStatus = user.status;
        await this.prisma.$transaction(async (tx) => {
            await tx.user.update({
                where: { id: userId },
                data: { status: 'NORMAL' },
            });
            await tx.auditLog.create({
                data: {
                    admin_id: adminId,
                    action: 'USER_UNBAN',
                    target_type: 'USER',
                    target_id: userId,
                    reason: dto.reason,
                    before_data: JSON.stringify({ status: beforeStatus }),
                    after_data: JSON.stringify({ status: 'NORMAL' }),
                },
            });
        });
        return { status: 'success' };
    }
    generateInviteCode() {
        return (0, crypto_1.randomBytes)(4).toString('hex').toUpperCase();
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UserService);
//# sourceMappingURL=user.service.js.map