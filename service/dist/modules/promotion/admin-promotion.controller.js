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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminPromotionController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const promotion_service_1 = require("./promotion.service");
const dto_1 = require("../../common/dto");
const jwt_guard_1 = require("../../common/guards/jwt.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
class AuditDistributorDto {
    status;
    reason;
}
class UpdateLevelDto {
    level_id;
    reason;
}
class ResetLinkDto {
    reason;
}
let AdminPromotionController = class AdminPromotionController {
    promotionService;
    constructor(promotionService) {
        this.promotionService = promotionService;
    }
    async listDistributors(query) {
        const data = await this.promotionService.listDistributors(query);
        return { status: 'success', data };
    }
    async detail(userId) {
        const data = await this.promotionService.getDistributorDetail(userId);
        return { status: 'success', data };
    }
    async audit(admin, userId, dto) {
        await this.promotionService.auditDistributor(admin.sub, userId, dto.status, dto.reason);
        return { status: 'success', message: 'Audit completed' };
    }
    async updateLevel(admin, userId, dto) {
        await this.promotionService.updateDistributorLevel(admin.sub, userId, dto.level_id, dto.reason);
        return { status: 'success', message: 'Level updated' };
    }
    async orders(userId, query) {
        const data = await this.promotionService.listDistributorOrders(userId, query);
        return { status: 'success', data };
    }
    async promoLink(userId) {
        const data = await this.promotionService.getUserPromoLink(userId);
        return { status: 'success', data };
    }
    async resetLink(admin, userId, dto) {
        const data = await this.promotionService.resetUserPromoLink(admin.sub, userId, dto.reason);
        return { status: 'success', data };
    }
};
exports.AdminPromotionController = AdminPromotionController;
__decorate([
    (0, common_1.Get)('distributors'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminPromotionController.prototype, "listDistributors", null);
__decorate([
    (0, common_1.Get)('distributors/:userId'),
    __param(0, (0, common_1.Param)('userId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AdminPromotionController.prototype, "detail", null);
__decorate([
    (0, common_1.Post)('distributors/:userId/audit'),
    __param(0, (0, current_user_decorator_1.CurrentAdmin)()),
    __param(1, (0, common_1.Param)('userId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, AuditDistributorDto]),
    __metadata("design:returntype", Promise)
], AdminPromotionController.prototype, "audit", null);
__decorate([
    (0, common_1.Post)('distributors/:userId/level'),
    __param(0, (0, current_user_decorator_1.CurrentAdmin)()),
    __param(1, (0, common_1.Param)('userId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, UpdateLevelDto]),
    __metadata("design:returntype", Promise)
], AdminPromotionController.prototype, "updateLevel", null);
__decorate([
    (0, common_1.Get)('distributors/:userId/orders'),
    __param(0, (0, common_1.Param)('userId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, dto_1.PageQueryDto]),
    __metadata("design:returntype", Promise)
], AdminPromotionController.prototype, "orders", null);
__decorate([
    (0, common_1.Get)('promo/users/:userId/link'),
    __param(0, (0, common_1.Param)('userId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AdminPromotionController.prototype, "promoLink", null);
__decorate([
    (0, common_1.Post)('promo/users/:userId/link/reset'),
    __param(0, (0, current_user_decorator_1.CurrentAdmin)()),
    __param(1, (0, common_1.Param)('userId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, ResetLinkDto]),
    __metadata("design:returntype", Promise)
], AdminPromotionController.prototype, "resetLink", null);
exports.AdminPromotionController = AdminPromotionController = __decorate([
    (0, swagger_1.ApiTags)('Admin Promotion'),
    (0, common_1.Controller)('api/v1/admin'),
    (0, common_1.UseGuards)(jwt_guard_1.AdminJwtGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [promotion_service_1.PromotionService])
], AdminPromotionController);
//# sourceMappingURL=admin-promotion.controller.js.map