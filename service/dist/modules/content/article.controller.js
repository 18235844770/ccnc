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
exports.AdminArticleController = exports.ArticleController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const article_service_1 = require("./article.service");
const dto_1 = require("../../common/dto");
const jwt_guard_1 = require("../../common/guards/jwt.guard");
let ArticleController = class ArticleController {
    articleService;
    constructor(articleService) {
        this.articleService = articleService;
    }
    async list(query) {
        const data = await this.articleService.listPublic(query);
        return { status: 'success', data };
    }
    async detail(id) {
        const data = await this.articleService.getPublic(id);
        return { status: 'success', data };
    }
};
exports.ArticleController = ArticleController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.PageQueryDto]),
    __metadata("design:returntype", Promise)
], ArticleController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ArticleController.prototype, "detail", null);
exports.ArticleController = ArticleController = __decorate([
    (0, swagger_1.ApiTags)('Articles'),
    (0, common_1.Controller)('api/v1/articles'),
    __metadata("design:paramtypes", [article_service_1.ArticleService])
], ArticleController);
let AdminArticleController = class AdminArticleController {
    articleService;
    constructor(articleService) {
        this.articleService = articleService;
    }
    async list(query) {
        const data = await this.articleService.listAdmin(query);
        return { status: 'success', data };
    }
    async detail(id) {
        const data = await this.articleService.getAdmin(id);
        return { status: 'success', data };
    }
    async create(dto) {
        const data = await this.articleService.createAdmin(dto);
        return { status: 'success', data };
    }
    async update(id, dto) {
        const data = await this.articleService.updateAdmin(id, dto);
        return { status: 'success', data };
    }
    async remove(id) {
        const data = await this.articleService.deleteAdmin(id);
        return { status: 'success', data };
    }
};
exports.AdminArticleController = AdminArticleController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminArticleController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AdminArticleController.prototype, "detail", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateArticleDto]),
    __metadata("design:returntype", Promise)
], AdminArticleController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, dto_1.UpdateArticleDto]),
    __metadata("design:returntype", Promise)
], AdminArticleController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AdminArticleController.prototype, "remove", null);
exports.AdminArticleController = AdminArticleController = __decorate([
    (0, swagger_1.ApiTags)('Admin Articles'),
    (0, common_1.Controller)('api/v1/admin/articles'),
    (0, common_1.UseGuards)(jwt_guard_1.AdminJwtGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [article_service_1.ArticleService])
], AdminArticleController);
//# sourceMappingURL=article.controller.js.map