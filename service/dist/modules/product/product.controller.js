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
exports.AdminProductController = exports.ProductController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const product_service_1 = require("./product.service");
const dto_1 = require("../../common/dto");
let ProductController = class ProductController {
    productService;
    constructor(productService) {
        this.productService = productService;
    }
    async list() {
        const data = await this.productService.listPublic();
        return { status: 'success', data };
    }
    async detail(id) {
        const data = await this.productService.getPublic(id);
        return { status: 'success', data };
    }
};
exports.ProductController = ProductController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "detail", null);
exports.ProductController = ProductController = __decorate([
    (0, swagger_1.ApiTags)('Products'),
    (0, common_1.Controller)('api/v1/products'),
    __metadata("design:paramtypes", [product_service_1.ProductService])
], ProductController);
let AdminProductController = class AdminProductController {
    productService;
    constructor(productService) {
        this.productService = productService;
    }
    async list(query) {
        const data = await this.productService.listAdmin(query);
        return { status: 'success', data };
    }
    async create(dto) {
        const data = await this.productService.create(dto);
        return { status: 'success', data };
    }
    async update(id, dto) {
        const data = await this.productService.update(id, dto);
        return { status: 'success', data };
    }
    async remove(id) {
        return this.productService.remove(id);
    }
};
exports.AdminProductController = AdminProductController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminProductController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateProductDto]),
    __metadata("design:returntype", Promise)
], AdminProductController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, dto_1.UpdateProductDto]),
    __metadata("design:returntype", Promise)
], AdminProductController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AdminProductController.prototype, "remove", null);
exports.AdminProductController = AdminProductController = __decorate([
    (0, swagger_1.ApiTags)('Admin Products'),
    (0, common_1.Controller)('api/v1/admin/products'),
    __metadata("design:paramtypes", [product_service_1.ProductService])
], AdminProductController);
//# sourceMappingURL=product.controller.js.map