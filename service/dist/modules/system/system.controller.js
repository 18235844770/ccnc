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
exports.SystemController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const system_service_1 = require("./system.service");
const dto_1 = require("../../common/dto");
const jwt_guard_1 = require("../../common/guards/jwt.guard");
let SystemController = class SystemController {
    systemService;
    constructor(systemService) {
        this.systemService = systemService;
    }
    async admins(query) {
        const data = await this.systemService.listAdmins(query);
        return { status: 'success', data };
    }
    async createAdmin(dto) {
        const data = await this.systemService.createAdmin(dto);
        return { status: 'success', data };
    }
    async resetPwd(id, dto) {
        await this.systemService.resetAdminPassword(id, dto.password);
        return { status: 'success', message: 'Password reset' };
    }
    async roles() {
        const data = await this.systemService.listRoles();
        return { status: 'success', data };
    }
    async createRole(dto) {
        const data = await this.systemService.createRole(dto);
        return { status: 'success', data };
    }
    async updateRole(id, dto) {
        await this.systemService.updateRole(id, dto);
        return { status: 'success', message: 'Role updated' };
    }
    async roleMenus(id) {
        const data = await this.systemService.getRoleMenuIds(id);
        return { status: 'success', data };
    }
    async assignMenus(id, dto) {
        await this.systemService.assignRoleMenus(id, dto.menu_ids || []);
        return { status: 'success', message: 'Menus assigned' };
    }
    async menus() {
        const data = await this.systemService.listMenus();
        return { status: 'success', data };
    }
    async createMenu(dto) {
        const data = await this.systemService.createMenu(dto);
        return { status: 'success', data };
    }
    async updateMenu(id, dto) {
        await this.systemService.updateMenu(id, dto);
        return { status: 'success', message: 'Menu updated' };
    }
    async auditLogs(query) {
        const data = await this.systemService.listAuditLogs(query);
        return { status: 'success', data };
    }
};
exports.SystemController = SystemController;
__decorate([
    (0, common_1.Get)('admins'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.PageQueryDto]),
    __metadata("design:returntype", Promise)
], SystemController.prototype, "admins", null);
__decorate([
    (0, common_1.Post)('admins'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateAdminDto]),
    __metadata("design:returntype", Promise)
], SystemController.prototype, "createAdmin", null);
__decorate([
    (0, common_1.Post)('admins/:id/reset-pwd'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, dto_1.ResetAdminPwdDto]),
    __metadata("design:returntype", Promise)
], SystemController.prototype, "resetPwd", null);
__decorate([
    (0, common_1.Get)('roles'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SystemController.prototype, "roles", null);
__decorate([
    (0, common_1.Post)('roles'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateRoleDto]),
    __metadata("design:returntype", Promise)
], SystemController.prototype, "createRole", null);
__decorate([
    (0, common_1.Put)('roles/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, dto_1.UpdateRoleDto]),
    __metadata("design:returntype", Promise)
], SystemController.prototype, "updateRole", null);
__decorate([
    (0, common_1.Get)('roles/:id/menus'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], SystemController.prototype, "roleMenus", null);
__decorate([
    (0, common_1.Post)('roles/:id/menus'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, dto_1.AssignRoleMenusDto]),
    __metadata("design:returntype", Promise)
], SystemController.prototype, "assignMenus", null);
__decorate([
    (0, common_1.Get)('menus'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SystemController.prototype, "menus", null);
__decorate([
    (0, common_1.Post)('menus'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateMenuDto]),
    __metadata("design:returntype", Promise)
], SystemController.prototype, "createMenu", null);
__decorate([
    (0, common_1.Put)('menus/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, dto_1.UpdateMenuDto]),
    __metadata("design:returntype", Promise)
], SystemController.prototype, "updateMenu", null);
__decorate([
    (0, common_1.Get)('audit-logs'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SystemController.prototype, "auditLogs", null);
exports.SystemController = SystemController = __decorate([
    (0, swagger_1.ApiTags)('Admin System'),
    (0, common_1.Controller)('api/v1/admin/system'),
    (0, common_1.UseGuards)(jwt_guard_1.AdminJwtGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [system_service_1.SystemService])
], SystemController);
//# sourceMappingURL=system.controller.js.map