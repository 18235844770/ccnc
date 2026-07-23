import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { BannerService } from './banner.service';
import { CreateBannerDto, PageQueryDto, UpdateBannerDto } from '../../common/dto';
import { AdminJwtGuard } from '../../common/guards/jwt.guard';

@ApiTags('Banners')
@Controller('api/v1/banners')
export class BannerController {
  constructor(private readonly bannerService: BannerService) {}

  @Get()
  async list() {
    const data = await this.bannerService.listForDisplay();
    return { status: 'success', data };
  }
}

@ApiTags('Admin Banners')
@Controller('api/v1/admin/banners')
@UseGuards(AdminJwtGuard)
@ApiBearerAuth()
export class AdminBannerController {
  constructor(private readonly bannerService: BannerService) {}

  @Get()
  async list(@Query() query: PageQueryDto & { status?: string }) {
    const data = await this.bannerService.listAdmin(query);
    return { status: 'success', data };
  }

  @Get(':id')
  async detail(@Param('id', ParseIntPipe) id: number) {
    const data = await this.bannerService.getAdmin(id);
    return { status: 'success', data };
  }

  @Post()
  async create(@Body() dto: CreateBannerDto) {
    const data = await this.bannerService.createAdmin(dto);
    return { status: 'success', data };
  }

  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBannerDto) {
    const data = await this.bannerService.updateAdmin(id, dto);
    return { status: 'success', data };
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    const data = await this.bannerService.deleteAdmin(id);
    return { status: 'success', data };
  }
}
