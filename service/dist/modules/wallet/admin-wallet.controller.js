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
exports.AdminWalletController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const wallet_service_1 = require("./wallet.service");
const dto_1 = require("../../common/dto");
const jwt_guard_1 = require("../../common/guards/jwt.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let AdminWalletController = class AdminWalletController {
    walletService;
    constructor(walletService) {
        this.walletService = walletService;
    }
    async withdraws(query) {
        const data = await this.walletService.listAdminWithdraws(query);
        return { status: 'success', data };
    }
    async approve(admin, id) {
        await this.walletService.approveWithdraw(admin.sub, id);
        return { status: 'success', message: 'Withdraw approved' };
    }
    async reject(admin, id, dto) {
        await this.walletService.rejectWithdraw(admin.sub, id, dto.reason);
        return { status: 'success', message: 'Withdraw rejected' };
    }
    async ledger(query) {
        const data = await this.walletService.listAdminLedger(query);
        return { status: 'success', data };
    }
    async adjustment(admin, dto) {
        await this.walletService.adjustBalance(admin.sub, dto);
        return { status: 'success', message: 'Balance adjusted' };
    }
};
exports.AdminWalletController = AdminWalletController;
__decorate([
    (0, common_1.Get)('withdraws'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminWalletController.prototype, "withdraws", null);
__decorate([
    (0, common_1.Post)('withdraws/:id/approve'),
    __param(0, (0, current_user_decorator_1.CurrentAdmin)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], AdminWalletController.prototype, "approve", null);
__decorate([
    (0, common_1.Post)('withdraws/:id/reject'),
    __param(0, (0, current_user_decorator_1.CurrentAdmin)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, dto_1.RejectWithdrawDto]),
    __metadata("design:returntype", Promise)
], AdminWalletController.prototype, "reject", null);
__decorate([
    (0, common_1.Get)('wallets/ledger'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminWalletController.prototype, "ledger", null);
__decorate([
    (0, common_1.Post)('wallets/adjustment'),
    __param(0, (0, current_user_decorator_1.CurrentAdmin)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.AdjustBalanceDto]),
    __metadata("design:returntype", Promise)
], AdminWalletController.prototype, "adjustment", null);
exports.AdminWalletController = AdminWalletController = __decorate([
    (0, swagger_1.ApiTags)('Admin Wallets'),
    (0, common_1.Controller)('api/v1/admin'),
    (0, common_1.UseGuards)(jwt_guard_1.AdminJwtGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [wallet_service_1.WalletService])
], AdminWalletController);
//# sourceMappingURL=admin-wallet.controller.js.map