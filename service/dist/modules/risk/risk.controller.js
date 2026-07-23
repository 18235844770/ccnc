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
exports.RiskController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const risk_service_1 = require("./risk.service");
const jwt_guard_1 = require("../../common/guards/jwt.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let RiskController = class RiskController {
    riskService;
    constructor(riskService) {
        this.riskService = riskService;
    }
    async dashboard() {
        const data = await this.riskService.getDashboard();
        return { status: 'success', data };
    }
    async events(query) {
        const data = await this.riskService.listEvents(query);
        return { status: 'success', data };
    }
    async rules() {
        const data = await this.riskService.listRules();
        return { status: 'success', data };
    }
    async resolve(admin, id, body) {
        await this.riskService.resolveEvent(admin.sub, id, body.action, body.reason);
        return { status: 'success', message: 'Event resolved' };
    }
    async manualScan() {
        const data = await this.riskService.runScan();
        return { status: 'success', data };
    }
};
exports.RiskController = RiskController;
__decorate([
    (0, common_1.Get)('dashboard'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RiskController.prototype, "dashboard", null);
__decorate([
    (0, common_1.Get)('events'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RiskController.prototype, "events", null);
__decorate([
    (0, common_1.Get)('rules'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RiskController.prototype, "rules", null);
__decorate([
    (0, common_1.Post)('events/:id/resolve'),
    __param(0, (0, current_user_decorator_1.CurrentAdmin)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Object]),
    __metadata("design:returntype", Promise)
], RiskController.prototype, "resolve", null);
__decorate([
    (0, common_1.Post)('scan'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RiskController.prototype, "manualScan", null);
exports.RiskController = RiskController = __decorate([
    (0, swagger_1.ApiTags)('Admin Risk'),
    (0, common_1.Controller)('api/v1/admin/risk'),
    (0, common_1.UseGuards)(jwt_guard_1.AdminJwtGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [risk_service_1.RiskService])
], RiskController);
//# sourceMappingURL=risk.controller.js.map