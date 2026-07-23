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
exports.AdminOrderController = exports.OrderController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const order_service_1 = require("./order.service");
const dto_1 = require("../../common/dto");
const jwt_guard_1 = require("../../common/guards/jwt.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let OrderController = class OrderController {
    orderService;
    constructor(orderService) {
        this.orderService = orderService;
    }
    async create(user, dto) {
        const data = await this.orderService.create(user.sub, dto);
        return { status: 'success', data };
    }
    async list(user, query) {
        const data = await this.orderService.list(user.sub, query);
        return { status: 'success', data };
    }
    async detail(user, id) {
        const data = await this.orderService.get(user.sub, id);
        return { status: 'success', data };
    }
    async pay(user, id, dto) {
        const data = await this.orderService.pay(user.sub, id, dto);
        return { status: 'success', data };
    }
    async cancel(user, id) {
        await this.orderService.cancel(user.sub, id);
        return { status: 'success', message: 'Order cancelled' };
    }
    async refund(user, id) {
        await this.orderService.refund(user.sub, id);
        return { status: 'success', message: 'Refund submitted' };
    }
};
exports.OrderController = OrderController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.CreateOrderDto]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "detail", null);
__decorate([
    (0, common_1.Post)(':id/pay'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, dto_1.PayOrderDto]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "pay", null);
__decorate([
    (0, common_1.Post)(':id/cancel'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "cancel", null);
__decorate([
    (0, common_1.Post)(':id/refund'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "refund", null);
exports.OrderController = OrderController = __decorate([
    (0, swagger_1.ApiTags)('Orders'),
    (0, common_1.Controller)('api/v1/orders'),
    (0, common_1.UseGuards)(jwt_guard_1.UserJwtGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [order_service_1.OrderService])
], OrderController);
let AdminOrderController = class AdminOrderController {
    orderService;
    constructor(orderService) {
        this.orderService = orderService;
    }
    async list(query) {
        const data = await this.orderService.listAdmin({
            ...query,
            order_no: query.order_id || query.order_no,
        });
        return { status: 'success', data };
    }
    async detail(id) {
        const data = await this.orderService.getAdmin(id);
        return { status: 'success', data };
    }
    async refund(admin, id, body) {
        await this.orderService.refundAdmin(admin.sub, id, body.reason || 'Admin refund');
        return { status: 'success', message: 'Refund completed' };
    }
};
exports.AdminOrderController = AdminOrderController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminOrderController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AdminOrderController.prototype, "detail", null);
__decorate([
    (0, common_1.Post)(':id/refund'),
    __param(0, (0, current_user_decorator_1.CurrentAdmin)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Object]),
    __metadata("design:returntype", Promise)
], AdminOrderController.prototype, "refund", null);
exports.AdminOrderController = AdminOrderController = __decorate([
    (0, swagger_1.ApiTags)('Admin Orders'),
    (0, common_1.Controller)('api/v1/admin/orders'),
    (0, common_1.UseGuards)(jwt_guard_1.AdminJwtGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [order_service_1.OrderService])
], AdminOrderController);
//# sourceMappingURL=order.controller.js.map