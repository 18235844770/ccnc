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
exports.BannerService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const business_exception_1 = require("../../common/exceptions/business.exception");
const mapper_1 = require("../../common/utils/mapper");
let BannerService = class BannerService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async listForDisplay() {
        const now = new Date();
        const records = await this.prisma.banner.findMany({
            where: {
                status: 'ACTIVE',
                deleted_at: null,
                OR: [
                    { start_time: null, end_time: null },
                    { start_time: { lte: now }, end_time: null },
                    { start_time: null, end_time: { gte: now } },
                    { start_time: { lte: now }, end_time: { gte: now } },
                ],
            },
            orderBy: { sort_order: 'asc' },
            take: 10,
        });
        return records.map(mapper_1.mapBanner);
    }
    async listAdmin(params) {
        const page = Math.max(1, Number(params.page) || 1);
        const pageSize = Math.min(100, Math.max(1, Number(params.page_size) || 20));
        const where = {
            deleted_at: null,
            ...(params.status ? { status: params.status } : {}),
        };
        const [total, records] = await Promise.all([
            this.prisma.banner.count({ where }),
            this.prisma.banner.findMany({
                where,
                skip: (page - 1) * pageSize,
                take: pageSize,
                orderBy: [{ sort_order: 'asc' }, { id: 'desc' }],
            }),
        ]);
        return (0, mapper_1.pageResult)(records.map(mapper_1.mapBanner), total);
    }
    async getAdmin(id) {
        const banner = await this.prisma.banner.findFirst({ where: { id, deleted_at: null } });
        if (!banner) {
            throw new business_exception_1.BusinessException('BANNER_NOT_FOUND', 'Banner not found', common_1.HttpStatus.NOT_FOUND);
        }
        return (0, mapper_1.mapBanner)(banner);
    }
    async createAdmin(dto) {
        const banner = await this.prisma.banner.create({
            data: {
                title: dto.title,
                image_url: dto.image_url,
                link_url: dto.link_url,
                status: dto.status || 'INACTIVE',
                sort_order: dto.sort_order ?? 0,
                start_time: dto.start_time ? new Date(dto.start_time) : null,
                end_time: dto.end_time ? new Date(dto.end_time) : null,
            },
        });
        return (0, mapper_1.mapBanner)(banner);
    }
    async updateAdmin(id, dto) {
        const existing = await this.prisma.banner.findFirst({ where: { id, deleted_at: null } });
        if (!existing) {
            throw new business_exception_1.BusinessException('BANNER_NOT_FOUND', 'Banner not found', common_1.HttpStatus.NOT_FOUND);
        }
        const banner = await this.prisma.banner.update({
            where: { id },
            data: {
                ...(dto.title !== undefined ? { title: dto.title } : {}),
                ...(dto.image_url !== undefined ? { image_url: dto.image_url } : {}),
                ...(dto.link_url !== undefined ? { link_url: dto.link_url } : {}),
                ...(dto.status !== undefined ? { status: dto.status } : {}),
                ...(dto.sort_order !== undefined ? { sort_order: dto.sort_order } : {}),
                ...(dto.start_time !== undefined
                    ? { start_time: dto.start_time ? new Date(dto.start_time) : null }
                    : {}),
                ...(dto.end_time !== undefined
                    ? { end_time: dto.end_time ? new Date(dto.end_time) : null }
                    : {}),
            },
        });
        return (0, mapper_1.mapBanner)(banner);
    }
    async deleteAdmin(id) {
        const existing = await this.prisma.banner.findFirst({ where: { id, deleted_at: null } });
        if (!existing) {
            throw new business_exception_1.BusinessException('BANNER_NOT_FOUND', 'Banner not found', common_1.HttpStatus.NOT_FOUND);
        }
        await this.prisma.banner.update({ where: { id }, data: { deleted_at: new Date() } });
        return { status: 'success' };
    }
};
exports.BannerService = BannerService;
exports.BannerService = BannerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BannerService);
//# sourceMappingURL=banner.service.js.map