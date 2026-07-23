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
exports.StatsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const stats_service_1 = require("./stats.service");
const jwt_guard_1 = require("../../common/guards/jwt.guard");
const dto_1 = require("../../common/dto");
let StatsController = class StatsController {
    statsService;
    constructor(statsService) {
        this.statsService = statsService;
    }
    async overview(query) {
        const data = await this.statsService.overview(query);
        return { status: 'success', data };
    }
    async userGrowth(query) {
        const data = await this.statsService.userGrowth(query);
        return { status: 'success', data };
    }
    async userConversion(query) {
        const data = await this.statsService.userConversion(query);
        return { status: 'success', data };
    }
    async promoSummary(query) {
        const data = await this.statsService.promoSummary(query);
        return { status: 'success', data };
    }
    async promoTop(query) {
        const data = await this.statsService.promoTop(query);
        return { status: 'success', data };
    }
    async investSummary(query) {
        const data = await this.statsService.investSummary(query);
        return { status: 'success', data };
    }
    async investByProduct(query) {
        const data = await this.statsService.investByProduct(query);
        return { status: 'success', data };
    }
    async commissionSummary(query) {
        const data = await this.statsService.commissionSummary(query);
        return { status: 'success', data };
    }
    async commissionCostRate(query) {
        const data = await this.statsService.commissionCostRate(query);
        return { status: 'success', data };
    }
    async export(dto) {
        const data = await this.statsService.createExport(dto.type, dto);
        return { status: 'success', data };
    }
    async downloadExport(taskId, res) {
        const file = this.statsService.getExportFile(taskId);
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${file.filename}"`);
        res.send(file.content);
    }
};
exports.StatsController = StatsController;
__decorate([
    (0, common_1.Get)('overview'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StatsController.prototype, "overview", null);
__decorate([
    (0, common_1.Get)('users/growth'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StatsController.prototype, "userGrowth", null);
__decorate([
    (0, common_1.Get)('users/conversion'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StatsController.prototype, "userConversion", null);
__decorate([
    (0, common_1.Get)('promo/summary'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StatsController.prototype, "promoSummary", null);
__decorate([
    (0, common_1.Get)('promo/top'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StatsController.prototype, "promoTop", null);
__decorate([
    (0, common_1.Get)('invest/summary'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StatsController.prototype, "investSummary", null);
__decorate([
    (0, common_1.Get)('invest/by-product'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StatsController.prototype, "investByProduct", null);
__decorate([
    (0, common_1.Get)('commission/summary'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StatsController.prototype, "commissionSummary", null);
__decorate([
    (0, common_1.Get)('commission/cost-rate'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StatsController.prototype, "commissionCostRate", null);
__decorate([
    (0, common_1.Post)('export'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.ExportStatsDto]),
    __metadata("design:returntype", Promise)
], StatsController.prototype, "export", null);
__decorate([
    (0, common_1.Get)('export/:taskId/download'),
    __param(0, (0, common_1.Param)('taskId')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], StatsController.prototype, "downloadExport", null);
exports.StatsController = StatsController = __decorate([
    (0, swagger_1.ApiTags)('Admin Stats'),
    (0, common_1.Controller)('api/v1/admin/stats'),
    (0, common_1.UseGuards)(jwt_guard_1.AdminJwtGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [stats_service_1.StatsService])
], StatsController);
//# sourceMappingURL=stats.controller.js.map