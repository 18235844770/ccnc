import { Injectable, HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { mapArticle, pageResult } from '../../common/utils/mapper';
import { BusinessException } from '../../common/exceptions/business.exception';

@Injectable()
export class ArticleService {
  constructor(private readonly prisma: PrismaService) {}

  async listPublic(params: { page?: number; page_size?: number }) {
    const page = Math.max(1, Number(params.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(params.page_size) || 20));
    const where: Prisma.ArticleWhereInput = { status: 'PUBLISHED', deleted_at: null };
    const [total, records] = await Promise.all([
      this.prisma.article.count({ where }),
      this.prisma.article.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: [{ sort_order: 'asc' }, { publish_time: 'desc' }],
      }),
    ]);
    return pageResult(records.map((a) => mapArticle(a, false)), total);
  }

  async getPublic(id: number) {
    const article = await this.prisma.article.findFirst({
      where: { id, status: 'PUBLISHED', deleted_at: null },
    });
    if (!article) {
      throw new BusinessException('ARTICLE_NOT_FOUND', 'Article not found', HttpStatus.NOT_FOUND);
    }
    await this.prisma.article.update({
      where: { id },
      data: { view_count: { increment: 1 } },
    });
    return mapArticle({ ...article, view_count: article.view_count + 1 }, true);
  }

  async listAdmin(params: { page?: number; page_size?: number; status?: string }) {
    const page = Math.max(1, Number(params.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(params.page_size) || 20));
    const where: Prisma.ArticleWhereInput = {
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
    return pageResult(records.map((a) => mapArticle(a, false)), total);
  }

  async getAdmin(id: number) {
    const article = await this.prisma.article.findFirst({ where: { id, deleted_at: null } });
    if (!article) {
      throw new BusinessException('ARTICLE_NOT_FOUND', 'Article not found', HttpStatus.NOT_FOUND);
    }
    return mapArticle(article, true);
  }

  async createAdmin(dto: {
    title: string;
    tags?: string;
    description?: string;
    publish_time?: string;
    cover_image?: string;
    content?: string;
    status?: string;
    sort_order?: number;
  }) {
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
    return mapArticle(article, true);
  }

  async updateAdmin(
    id: number,
    dto: {
      title?: string;
      tags?: string;
      description?: string;
      publish_time?: string;
      cover_image?: string;
      content?: string;
      status?: string;
      sort_order?: number;
    },
  ) {
    const existing = await this.prisma.article.findFirst({ where: { id, deleted_at: null } });
    if (!existing) {
      throw new BusinessException('ARTICLE_NOT_FOUND', 'Article not found', HttpStatus.NOT_FOUND);
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
    return mapArticle(article, true);
  }

  async deleteAdmin(id: number) {
    const existing = await this.prisma.article.findFirst({ where: { id, deleted_at: null } });
    if (!existing) {
      throw new BusinessException('ARTICLE_NOT_FOUND', 'Article not found', HttpStatus.NOT_FOUND);
    }
    await this.prisma.article.update({ where: { id }, data: { deleted_at: new Date() } });
    return { status: 'success' };
  }
}
