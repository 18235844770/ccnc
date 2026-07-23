import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ProductService } from './product.service';
import { CreateProductDto, UpdateProductDto, PageQueryDto } from '../../common/dto';

@ApiTags('Products')
@Controller('api/v1/products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  async list() {
    const data = await this.productService.listPublic();
    return { status: 'success', data };
  }

  @Get(':id')
  async detail(@Param('id', ParseIntPipe) id: number) {
    const data = await this.productService.getPublic(id);
    return { status: 'success', data };
  }
}

@ApiTags('Admin Products')
@Controller('api/v1/admin/products')
export class AdminProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  async list(@Query() query: PageQueryDto & { status?: string }) {
    const data = await this.productService.listAdmin(query);
    return { status: 'success', data };
  }

  @Post()
  async create(@Body() dto: CreateProductDto) {
    const data = await this.productService.create(dto);
    return { status: 'success', data };
  }

  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProductDto) {
    const data = await this.productService.update(id, dto);
    return { status: 'success', data };
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.productService.remove(id);
  }
}
