import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ArticleService } from './article.service';
import { CreateArticleDto, PageQueryDto, UpdateArticleDto } from '../../common/dto';
import { AdminJwtGuard } from '../../common/guards/jwt.guard';

@ApiTags('Articles')
@Controller('api/v1/articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Get()
  async list(@Query() query: PageQueryDto) {
    const data = await this.articleService.listPublic(query);
    return { status: 'success', data };
  }

  @Get(':id')
  async detail(@Param('id', ParseIntPipe) id: number) {
    const data = await this.articleService.getPublic(id);
    return { status: 'success', data };
  }
}

@ApiTags('Admin Articles')
@Controller('api/v1/admin/articles')
@UseGuards(AdminJwtGuard)
@ApiBearerAuth()
export class AdminArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Get()
  async list(@Query() query: PageQueryDto & { status?: string }) {
    const data = await this.articleService.listAdmin(query);
    return { status: 'success', data };
  }

  @Get(':id')
  async detail(@Param('id', ParseIntPipe) id: number) {
    const data = await this.articleService.getAdmin(id);
    return { status: 'success', data };
  }

  @Post()
  async create(@Body() dto: CreateArticleDto) {
    const data = await this.articleService.createAdmin(dto);
    return { status: 'success', data };
  }

  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateArticleDto) {
    const data = await this.articleService.updateAdmin(id, dto);
    return { status: 'success', data };
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    const data = await this.articleService.deleteAdmin(id);
    return { status: 'success', data };
  }
}
