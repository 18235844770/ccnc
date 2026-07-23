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
exports.AdminAuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const admin_service_1 = require("./admin.service");
const dto_1 = require("../../common/dto");
const auth_token_service_1 = require("../auth/auth-token.service");
const jwt_guard_1 = require("../../common/guards/jwt.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let AdminAuthController = class AdminAuthController {
    adminService;
    authToken;
    constructor(adminService, authToken) {
        this.adminService = adminService;
        this.authToken = authToken;
    }
    async login(dto) {
        const result = await this.adminService.login(dto.username, dto.password);
        const token = this.authToken.signAdmin({ sub: result.admin.id, username: result.admin.username });
        return {
            status: 'success',
            token,
            data: {
                admin: result.admin,
                permissions: result.permissions,
                menus: result.menus,
            },
        };
    }
    async info(admin) {
        const data = await this.adminService.getProfile(admin.sub);
        return { status: 'success', data };
    }
    async menusTree(admin) {
        const data = await this.adminService.getProfile(admin.sub);
        return { status: 'success', data: data.menus };
    }
};
exports.AdminAuthController = AdminAuthController;
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.AdminLoginDto]),
    __metadata("design:returntype", Promise)
], AdminAuthController.prototype, "login", null);
__decorate([
    (0, common_1.Get)('info'),
    (0, common_1.UseGuards)(jwt_guard_1.AdminJwtGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, current_user_decorator_1.CurrentAdmin)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminAuthController.prototype, "info", null);
__decorate([
    (0, common_1.Get)('menus/tree'),
    (0, common_1.UseGuards)(jwt_guard_1.AdminJwtGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, current_user_decorator_1.CurrentAdmin)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminAuthController.prototype, "menusTree", null);
exports.AdminAuthController = AdminAuthController = __decorate([
    (0, swagger_1.ApiTags)('Admin Auth'),
    (0, common_1.Controller)('api/v1/admin/auth'),
    __metadata("design:paramtypes", [admin_service_1.AdminService,
        auth_token_service_1.AuthTokenService])
], AdminAuthController);
//# sourceMappingURL=admin.controller.js.map