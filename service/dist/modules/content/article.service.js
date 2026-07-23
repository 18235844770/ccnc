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
exports.ArticleService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const mapper_1 = require("../../common/utils/mapper");
const business_exception_1 = require("../../common/exceptions/business.exception");
let ArticleService = class ArticleService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async listPublic(params) {
        const page = Math.max(1, Number(params.page) || 1);
        const pageSize = Math.min(100, Math.max(1, Number(params.page_size) || 20));
        const where = { status: 'PUBLISHED', deleted_at: null };
        const [total, records] = await Promise.all([
            this.prisma.article.count({ where }),
            this.prisma.article.findMany({
                where,
                skip: (page - 1) * pageSize,
                take: pageSize,
                orderBy: [{ sort_order: 'asc' }, { publish_time: 'desc' }],
            }),
        ]);
        return (0, mapper_1.pageResult)(records.map((a) => (0, mapper_1.mapArticle)(a, false)), total);
    }
    async getPublic(id) {
        const article = await this.prisma.article.findFirst({
            where: { id, status: 'PUBLISHED', deleted_at: null },
        });
        if (!article) {
            throw new business_exception_1.BusinessException('ARTICLE_NOT_FOUND', 'Article not found', common_1.HttpStatus.NOT_FOUND);
        }
        await this.prisma.article.update({
            where: { id },
            data: { view_count: { increment: 1 } },
        });
        return (0, mapper_1.mapArticle)({ ...article, view_count: article.view_count + 1 }, true);
    }
    async listAdmin(params) {
        const page = Math.max(1, Number(params.page) || 1);
        const pageSize = Math.min(100, Math.max(1, Number(params.page_size) || 20));
        const where = {
            deleted_at: null,
            ...(params.status ? { status: params.status } : {}),
        };
        const [total, records] = await Promise.all([
            this.prisma.article.count({ where }),
            this.prisma.article.findMany({
                where,
                skip: (page - 1) * pageSize,
                take: pageSize,
                orderBy: { id: 'desc' },
            }),
        ]);
        return (0, mapper_1.pageResult)(records.map((a) => (0, mapper_1.mapArticle)(a, false)), total);
    }
    async getAdmin(id) {
        const article = await this.prisma.article.findFirst({ where: { id, deleted_at: null } });
        if (!article) {
            throw new business_exception_1.BusinessException('ARTICLE_NOT_FOUND', 'Article not found', common_1.HttpStatus.NOT_FOUND);
        }
        return (0, mapper_1.mapArticle)(article, true);
    }
    async createAdmin(dto) {
        const article = await this.prisma.article.create({
            data: {
                title: dto.title,
                tags: dto.tags,
                description: dto.description,
                cover_image: dto.cover_image,
                content: dto.content || '',
                status: dto.status || 'DRAFT',
                sort_order: dto.sort_order ?? 0,
                publish_time: dto.publish_time ? new Date(dto.publish_time) : null,
            },
        });
        return (0, mapper_1.mapArticle)(article, true);
    }
    async updateAdmin(id, dto) {
        const existing = await this.prisma.article.findFirst({ where: { id, deleted_at: null } });
        if (!existing) {
            throw new business_exception_1.BusinessException('ARTICLE_NOT_FOUND', 'Article not found', common_1.HttpStatus.NOT_FOUND);
        }
        const article = await this.prisma.article.update({
            where: { id },
            data: {
                ...(dto.title !== undefined ? { title: dto.title } : {}),
                ...(dto.tags !== undefined ? { tags: dto.tags } : {}),
                ...(dto.description !== undefined ? { description: dto.description } : {}),
                ...(dto.cover_image !== undefined ? { cover_image: dto.cover_image } : {}),
                ...(dto.content !== undefined ? { content: dto.content } : {}),
                ...(dto.status !== undefined ? { status: dto.status } : {}),
                ...(dto.sort_order !== undefined ? { sort_order: dto.sort_order } : {}),
                ...(dto.publish_time !== undefined
                    ? { publish_time: dto.publish_time ? new Date(dto.publish_time) : null }
                    : {}),
            },
        });
        return (0, mapper_1.mapArticle)(article, true);
    }
    async deleteAdmin(id) {
        const existing = await this.prisma.article.findFirst({ where: { id, deleted_at: null } });
        if (!existing) {
            throw new business_exception_1.BusinessException('ARTICLE_NOT_FOUND', 'Article not found', common_1.HttpStatus.NOT_FOUND);
        }
        await this.prisma.article.update({ where: { id }, data: { deleted_at: new Date() } });
        return { status: 'success' };
    }
};
exports.ArticleService = ArticleService;
exports.ArticleService = ArticleService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ArticleService);
//# sourceMappingURL=article.service.js.map