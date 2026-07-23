import { Injectable, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { mapProduct, pageResult } from '../../common/utils/mapper';
import { CreateProductDto, UpdateProductDto } from '../../common/dto';
import { BusinessException } from '../../common/exceptions/business.exception';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  async listPublic() {
    const records = await this.prisma.product.findMany({
      where: { status: 'ON_SALE', deleted_at: null },
      orderBy: { id: 'desc' },
    });
    return records.map(mapProduct);
  }

  async getPublic(id: number) {
    const product = await this.prisma.product.findFirst({
      where: { id, status: 'ON_SALE', deleted_at: null },
    });
    if (!product) {
      throw new BusinessException('PRODUCT_NOT_FOUND', 'Product not found', HttpStatus.NOT_FOUND);
    }
    return mapProduct(product);
  }

  async listAdmin(params: { page?: number; page_size?: number; status?: string }) {
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
    return pageResult(records.map(mapProduct), total);
  }

  async create(dto: CreateProductDto) {
    const product = await this.prisma.product.create({
      data: {
        name: dto.name,
        description: dto.description,
        yield_rate: new Decimal(dto.yield_rate),
        cycle_days: dto.cycle_days,
        min_amount: new Decimal(dto.min_amount),
        max_amount: dto.max_amount != null ? new Decimal(dto.max_amount) : null,
        rule_version: dto.rule_version,
        status: 'DRAFT',
      },
    });
    return mapProduct(product);
  }

  async update(id: number, dto: UpdateProductDto) {
    const product = await this.prisma.product.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.yield_rate !== undefined ? { yield_rate: new Decimal(dto.yield_rate) } : {}),
        ...(dto.cycle_days !== undefined ? { cycle_days: dto.cycle_days } : {}),
        ...(dto.min_amount !== undefined ? { min_amount: new Decimal(dto.min_amount) } : {}),
        ...(dto.max_amount !== undefined ? { max_amount: new Decimal(dto.max_amount) } : {}),
        ...(dto.status !== undefined ? { status: dto.status } : {}),
        ...(dto.rule_version !== undefined ? { rule_version: dto.rule_version } : {}),
      },
    });
    return mapProduct(product);
  }

  async remove(id: number) {
    await this.prisma.product.update({
      where: { id },
      data: { deleted_at: new Date(), status: 'OFF_SALE' },
    });
    return { status: 'success', message: 'Product deleted' };
  }
}
