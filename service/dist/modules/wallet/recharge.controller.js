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
exports.RechargeController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const recharge_service_1 = require("./recharge.service");
const dto_1 = require("../../common/dto");
const jwt_guard_1 = require("../../common/guards/jwt.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let RechargeController = class RechargeController {
    rechargeService;
    constructor(rechargeService) {
        this.rechargeService = rechargeService;
    }
    async create(user, dto) {
        const data = await this.rechargeService.create(user.sub, dto);
        return { status: 'success', data };
    }
    async notify(dto) {
        const data = await this.rechargeService.handleNotify(dto);
        return data;
    }
    async list(user, query) {
        const data = await this.rechargeService.list(user.sub, query);
        return { status: 'success', data };
    }
};
exports.RechargeController = RechargeController;
__decorate([
    (0, common_1.Post)('recharge'),
    (0, common_1.UseGuards)(jwt_guard_1.UserJwtGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.CreateRechargeDto]),
    __metadata("design:returntype", Promise)
], RechargeController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('recharge/notify'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.RechargeNotifyDto]),
    __metadata("design:returntype", Promise)
], RechargeController.prototype, "notify", null);
__decorate([
    (0, common_1.Get)('recharges'),
    (0, common_1.UseGuards)(jwt_guard_1.UserJwtGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], RechargeController.prototype, "list", null);
exports.RechargeController = RechargeController = __decorate([
    (0, swagger_1.ApiTags)('Recharge'),
    (0, common_1.Controller)('api/v1'),
    __metadata("design:paramtypes", [recharge_service_1.RechargeService])
], RechargeController);
//# sourceMappingURL=recharge.controller.js.map