import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { BusinessException } from '../../common/exceptions/business.exception';
import { mapBanner, pageResult } from '../../common/utils/mapper';

@Injectable()
export class BannerService {
  constructor(private readonly prisma: PrismaService) {}

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
    return records.map(mapBanner);
  }

  async listAdmin(params: { page?: number; page_size?: number; status?: string }) {
    const page = Math.max(1, Number(params.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(params.page_size) || 20));
    const where: Prisma.BannerWhereInput = {
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
    return pageResult(records.map(mapBanner), total);
  }

  async getAdmin(id: number) {
    const banner = await this.prisma.banner.findFirst({ where: { id, deleted_at: null } });
    if (!banner) {
      throw new BusinessException('BANNER_NOT_FOUND', 'Banner not found', HttpStatus.NOT_FOUND);
    }
    return mapBanner(banner);
  }

  async createAdmin(dto: {
    title: string;
    image_url: string;
    link_url?: string;
    status?: string;
    sort_order?: number;
    start_time?: string;
    end_time?: string;
  }) {
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
    return mapBanner(banner);
  }

  async updateAdmin(
    id: number,
    dto: {
      title?: string;
      image_url?: string;
      link_url?: string;
      status?: string;
      sort_order?: number;
      start_time?: string;
      end_time?: string;
    },
  ) {
    const existing = await this.prisma.banner.findFirst({ where: { id, deleted_at: null } });
    if (!existing) {
      throw new BusinessException('BANNER_NOT_FOUND', 'Banner not found', HttpStatus.NOT_FOUND);
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
    return mapBanner(banner);
  }

  async deleteAdmin(id: number) {
    const existing = await this.prisma.banner.findFirst({ where: { id, deleted_at: null } });
    if (!existing) {
      throw new BusinessException('BANNER_NOT_FOUND', 'Banner not found', HttpStatus.NOT_FOUND);
    }
    await this.prisma.banner.update({ where: { id }, data: { deleted_at: new Date() } });
    return { status: 'success' };
  }
}
