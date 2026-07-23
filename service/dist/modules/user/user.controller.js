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
exports.AdminUserController = exports.UserController = exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const user_service_1 = require("./user.service");
const promotion_service_1 = require("../promotion/promotion.service");
const dto_1 = require("../../common/dto");
const auth_token_service_1 = require("../auth/auth-token.service");
const jwt_guard_1 = require("../../common/guards/jwt.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let AuthController = class AuthController {
    userService;
    authToken;
    constructor(userService, authToken) {
        this.userService = userService;
        this.authToken = authToken;
    }
    async register(dto) {
        await this.userService.register(dto);
        return { status: 'success', message: 'User registered successfully' };
    }
    async login(dto) {
        const user = await this.userService.login(dto.username, dto.password);
        const token = this.authToken.signUser({ sub: user.id, username: user.username });
        return { status: 'success', token };
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('register'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.RegisterDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.LoginDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('Auth'),
    (0, common_1.Controller)('api/v1/auth'),
    __metadata("design:paramtypes", [user_service_1.UserService,
        auth_token_service_1.AuthTokenService])
], AuthController);
let UserController = class UserController {
    userService;
    constructor(userService) {
        this.userService = userService;
    }
    async me(user) {
        const data = await this.userService.getById(user.sub);
        return { status: 'success', data };
    }
    async updateMe(user, dto) {
        const data = await this.userService.updateProfile(user.sub, dto);
        return { status: 'success', data };
    }
    async realnameAuth(user, dto) {
        const data = await this.userService.submitRealname(user.sub, dto);
        return { status: 'success', data };
    }
    async getRealname(user) {
        const data = await this.userService.getRealname(user.sub);
        return { status: 'success', data };
    }
};
exports.UserController = UserController;
__decorate([
    (0, common_1.Get)('me'),
    (0, common_1.UseGuards)(jwt_guard_1.UserJwtGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "me", null);
__decorate([
    (0, common_1.Put)('me'),
    (0, common_1.UseGuards)(jwt_guard_1.UserJwtGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.UpdateProfileDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "updateMe", null);
__decorate([
    (0, common_1.Post)('me/realname-auth'),
    (0, common_1.UseGuards)(jwt_guard_1.UserJwtGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.RealnameAuthDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "realnameAuth", null);
__decorate([
    (0, common_1.Get)('me/realname-auth'),
    (0, common_1.UseGuards)(jwt_guard_1.UserJwtGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getRealname", null);
exports.UserController = UserController = __decorate([
    (0, swagger_1.ApiTags)('Users'),
    (0, common_1.Controller)('api/v1/users'),
    __metadata("design:paramtypes", [user_service_1.UserService])
], UserController);
let AdminUserController = class AdminUserController {
    userService;
    promotionService;
    constructor(userService, promotionService) {
        this.userService = userService;
        this.promotionService = promotionService;
    }
    async list(query) {
        const data = await this.userService.listAdmin(query);
        return { status: 'success', data };
    }
    async detail(id) {
        const data = await this.promotionService.getAdminUserDetail(id);
        return { status: 'success', data };
    }
    async downlines(id, query) {
        const data = await this.promotionService.listDownlines(id, query);
        return { status: 'success', data };
    }
    async ban(admin, id, dto) {
        await this.userService.banUser(admin.sub, id, dto);
        return { status: 'success', message: 'User banned' };
    }
    async unban(admin, id, dto) {
        await this.userService.unbanUser(admin.sub, id, dto);
        return { status: 'success', message: 'User unbanned' };
    }
    async adjustPromo(admin, id, dto) {
        await this.promotionService.adjustPromoRelation(admin.sub, id, dto.new_parent_user_id, dto.reason);
        return { status: 'success', message: 'Promotion relation adjusted' };
    }
};
exports.AdminUserController = AdminUserController;
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_guard_1.AdminJwtGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminUserController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(jwt_guard_1.AdminJwtGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AdminUserController.prototype, "detail", null);
__decorate([
    (0, common_1.Get)(':id/downlines'),
    (0, common_1.UseGuards)(jwt_guard_1.AdminJwtGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], AdminUserController.prototype, "downlines", null);
__decorate([
    (0, common_1.Post)(':id/ban'),
    (0, common_1.UseGuards)(jwt_guard_1.AdminJwtGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, current_user_decorator_1.CurrentAdmin)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, dto_1.BanUserDto]),
    __metadata("design:returntype", Promise)
], AdminUserController.prototype, "ban", null);
__decorate([
    (0, common_1.Post)(':id/unban'),
    (0, common_1.UseGuards)(jwt_guard_1.AdminJwtGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, current_user_decorator_1.CurrentAdmin)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, dto_1.UnbanUserDto]),
    __metadata("design:returntype", Promise)
], AdminUserController.prototype, "unban", null);
__decorate([
    (0, common_1.Post)(':id/promo/adjust'),
    (0, common_1.UseGuards)(jwt_guard_1.AdminJwtGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, current_user_decorator_1.CurrentAdmin)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, dto_1.AdjustPromoDto]),
    __metadata("design:returntype", Promise)
], AdminUserController.prototype, "adjustPromo", null);
exports.AdminUserController = AdminUserController = __decorate([
    (0, swagger_1.ApiTags)('Admin Users'),
    (0, common_1.Controller)('api/v1/admin/users'),
    __metadata("design:paramtypes", [user_service_1.UserService,
        promotion_service_1.PromotionService])
], AdminUserController);
//# sourceMappingURL=user.controller.js.map