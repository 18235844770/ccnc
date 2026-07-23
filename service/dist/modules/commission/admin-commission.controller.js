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
exports.AdminCommissionController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const commission_service_1 = require("./commission.service");
const jwt_guard_1 = require("../../common/guards/jwt.guard");
class ReasonDto {
    reason;
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ReasonDto.prototype, "reason", void 0);
class ManualCommissionDto {
    user_id;
    amount;
    reason;
}
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ManualCommissionDto.prototype, "user_id", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ManualCommissionDto.prototype, "amount", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ManualCommissionDto.prototype, "reason", void 0);
class PublishRuleDto {
    name;
    config;
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], PublishRuleDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], PublishRuleDto.prototype, "config", void 0);
let AdminCommissionController = class AdminCommissionController {
    commissionService;
    constructor(commissionService) {
        this.commissionService = commissionService;
    }
    async list(query) {
        const data = await this.commissionService.listAdmin(query);
        return { status: 'success', data };
    }
    async detail(id) {
        const data = await this.commissionService.getAdmin(id);
        return { status: 'success', data };
    }
    async freeze(id, dto) {
        await this.commissionService.freeze(id, dto.reason);
        return { status: 'success', message: 'Commission frozen' };
    }
    async unfreeze(id, dto) {
        await this.commissionService.unfreeze(id, dto.reason);
        return { status: 'success', message: 'Commission unfrozen' };
    }
    async voidOne(id, dto) {
        await this.commissionService.void(id, dto.reason);
        return { status: 'success', message: 'Commission voided' };
    }
    async manualCredit(dto) {
        await this.commissionService.manualCredit(dto);
        return { status: 'success', message: 'Manual credit done' };
    }
    async manualReverse(dto) {
        await this.commissionService.manualReverse(dto);
        return { status: 'success', message: 'Manual reverse done' };
    }
    async publishRule(dto) {
        const data = await this.commissionService.publishRule(dto);
        return { status: 'success', data };
    }
    async listRules() {
        const data = await this.commissionService.listRules();
        return { status: 'success', data };
    }
    async activeRule() {
        const data = await this.commissionService.getActiveRuleDetail();
        return { status: 'success', data };
    }
    async runSettlement() {
        const data = await this.commissionService.runSettlementCycle();
        return { status: 'success', data };
    }
};
exports.AdminCommissionController = AdminCommissionController;
__decorate([
    (0, common_1.Get)('commissions'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminCommissionController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('commissions/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AdminCommissionController.prototype, "detail", null);
__decorate([
    (0, common_1.Post)('commissions/:id/freeze'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, ReasonDto]),
    __metadata("design:returntype", Promise)
], AdminCommissionController.prototype, "freeze", null);
__decorate([
    (0, common_1.Post)('commissions/:id/unfreeze'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, ReasonDto]),
    __metadata("design:returntype", Promise)
], AdminCommissionController.prototype, "unfreeze", null);
__decorate([
    (0, common_1.Post)('commissions/:id/void'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, ReasonDto]),
    __metadata("design:returntype", Promise)
], AdminCommissionController.prototype, "voidOne", null);
__decorate([
    (0, common_1.Post)('commissions/manual-credit'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ManualCommissionDto]),
    __metadata("design:returntype", Promise)
], AdminCommissionController.prototype, "manualCredit", null);
__decorate([
    (0, common_1.Post)('commissions/manual-reverse'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ManualCommissionDto]),
    __metadata("design:returntype", Promise)
], AdminCommissionController.prototype, "manualReverse", null);
__decorate([
    (0, common_1.Post)('commission-rules/publish'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [PublishRuleDto]),
    __metadata("design:returntype", Promise)
], AdminCommissionController.prototype, "publishRule", null);
__decorate([
    (0, common_1.Get)('commission-rules'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminCommissionController.prototype, "listRules", null);
__decorate([
    (0, common_1.Get)('commission-rules/active'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminCommissionController.prototype, "activeRule", null);
__decorate([
    (0, common_1.Post)('commissions/run-settlement'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminCommissionController.prototype, "runSettlement", null);
exports.AdminCommissionController = AdminCommissionController = __decorate([
    (0, swagger_1.ApiTags)('Admin Commissions'),
    (0, common_1.Controller)('api/v1/admin'),
    (0, common_1.UseGuards)(jwt_guard_1.AdminJwtGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [commission_service_1.CommissionService])
], AdminCommissionController);
//# sourceMappingURL=admin-commission.controller.js.map