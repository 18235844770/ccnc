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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const mapper_1 = require("../../common/utils/mapper");
const business_exception_1 = require("../../common/exceptions/business.exception");
const library_1 = require("@prisma/client/runtime/library");
let ProductService = class ProductService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async listPublic() {
        const records = await this.prisma.product.findMany({
            where: { status: 'ON_SALE', deleted_at: null },
            orderBy: { id: 'desc' },
        });
        return records.map(mapper_1.mapProduct);
    }
    async getPublic(id) {
        const product = await this.prisma.product.findFirst({
            where: { id, status: 'ON_SALE', deleted_at: null },
        });
        if (!product) {
            throw new business_exception_1.BusinessException('PRODUCT_NOT_FOUND', 'Product not found', common_1.HttpStatus.NOT_FOUND);
        }
        return (0, mapper_1.mapProduct)(product);
    }
    async listAdmin(params) {
        const page = Math.max(1, Number(params.page) || 1);
        const pageSize = Math.min(100, Math.max(1, Number(params.page_size) || 20));
        const where = {
            deleted_at: null,
            ...(params.status ? { status: params.status } : {}),
        };
        const [total, records] = await Promise.all([
            this.prisma.product.count({ where }),
            this.prisma.product.findMany({
                where,
                skip: (page - 1) * pageSize,
                take: pageSize,
                orderBy: { id: 'desc' },
            }),
        ]);
        return (0, mapper_1.pageResult)(records.map(mapper_1.mapProduct), total);
    }
    async create(dto) {
        const product = await this.prisma.product.create({
            data: {
                name: dto.name,
                description: dto.description,
                yield_rate: new library_1.Decimal(dto.yield_rate),
                cycle_days: dto.cycle_days,
                min_amount: new library_1.Decimal(dto.min_amount),
                max_amount: dto.max_amount != null ? new library_1.Decimal(dto.max_amount) : null,
                rule_version: dto.rule_version,
                status: 'DRAFT',
            },
        });
        return (0, mapper_1.mapProduct)(product);
    }
    async update(id, dto) {
        const product = await this.prisma.product.update({
            where: { id },
            data: {
                ...(dto.name !== undefined ? { name: dto.name } : {}),
                ...(dto.description !== undefined ? { description: dto.description } : {}),
                ...(dto.yield_rate !== undefined ? { yield_rate: new library_1.Decimal(dto.yield_rate) } : {}),
                ...(dto.cycle_days !== undefined ? { cycle_days: dto.cycle_days } : {}),
                ...(dto.min_amount !== undefined ? { min_amount: new library_1.Decimal(dto.min_amount) } : {}),
                ...(dto.max_amount !== undefined ? { max_amount: new library_1.Decimal(dto.max_amount) } : {}),
                ...(dto.status !== undefined ? { status: dto.status } : {}),
                ...(dto.rule_version !== undefined ? { rule_version: dto.rule_version } : {}),
            },
        });
        return (0, mapper_1.mapProduct)(product);
    }
    async remove(id) {
        await this.prisma.product.update({
            where: { id },
            data: { deleted_at: new Date(), status: 'OFF_SALE' },
        });
        return { status: 'success', message: 'Product deleted' };
    }
};
exports.ProductService = ProductService;
exports.ProductService = ProductService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProductService);
//# sourceMappingURL=product.service.js.map