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
exports.InviteProgressService = void 0;
exports.calcUnlockRatio = calcUnlockRatio;
const common_1 = require("@nestjs/common");
const library_1 = require("@prisma/client/runtime/library");
const prisma_service_1 = require("../../prisma/prisma.service");
const mapper_1 = require("../../common/utils/mapper");
function calcUnlockRatio(validCount) {
    if (validCount >= 3)
        return 1;
    if (validCount === 2)
        return 2 / 3;
    if (validCount === 1)
        return 1 / 3;
    return 0;
}
let InviteProgressService = class InviteProgressService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getProgress(userId) {
        const progress = await this.prisma.inviteProgress.findUnique({ where: { user_id: userId } });
        if (!progress) {
            return { valid_count: 0, unlock_ratio: 0, unlock_percent: 0 };
        }
        const ratio = (0, mapper_1.decimalToNumber)(progress.unlock_ratio);
        return {
            valid_count: progress.valid_count,
            unlock_ratio: ratio,
            unlock_percent: Math.round(ratio * 100),
        };
    }
    async recordFirstInvestment(buyerUserId, orderId) {
        const relation = await this.prisma.userRelation.findUnique({
            where: { user_id: buyerUserId },
        });
        if (!relation)
            return { recorded: false };
        const existing = await this.prisma.validInvite.findUnique({
            where: { invitee_user_id: buyerUserId },
        });
        if (existing)
            return { recorded: false, skipped: true };
        const priorOrders = await this.prisma.order.count({
            where: {
                user_id: buyerUserId,
                id: { not: orderId },
                status: { in: ['ACTIVE', 'SETTLED', 'PAID'] },
            },
        });
        if (priorOrders > 0)
            return { recorded: false, skipped: true };
        const inviterId = relation.parent_user_id;
        await this.prisma.$transaction(async (tx) => {
            await tx.validInvite.create({
                data: {
                    inviter_user_id: inviterId,
                    invitee_user_id: buyerUserId,
                    order_id: orderId,
                },
            });
            const current = await tx.inviteProgress.findUnique({ where: { user_id: inviterId } });
            const validCount = (current?.valid_count ?? 0) + 1;
            const unlockRatio = calcUnlockRatio(validCount);
            await tx.inviteProgress.upsert({
                where: { user_id: inviterId },
                update: {
                    valid_count: validCount,
                    unlock_ratio: new library_1.Decimal(unlockRatio),
                },
                create: {
                    user_id: inviterId,
                    valid_count: validCount,
                    unlock_ratio: new library_1.Decimal(unlockRatio),
                },
            });
        });
        return { recorded: true, inviter_id: inviterId };
    }
    async getUnlockRatioForUser(userId) {
        const progress = await this.prisma.inviteProgress.findUnique({ where: { user_id: userId } });
        return progress ? (0, mapper_1.decimalToNumber)(progress.unlock_ratio) : 0;
    }
};
exports.InviteProgressService = InviteProgressService;
exports.InviteProgressService = InviteProgressService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], InviteProgressService);
//# sourceMappingURL=invite-progress.service.js.map