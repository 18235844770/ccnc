import { Body, Controller, Get, Param, ParseIntPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SystemService } from './system.service';
import {
  AssignRoleMenusDto,
  CreateAdminDto,
  CreateMenuDto,
  CreateRoleDto,
  PageQueryDto,
  ResetAdminPwdDto,
  UpdateMenuDto,
  UpdateRoleDto,
} from '../../common/dto';
import { AdminJwtGuard } from '../../common/guards/jwt.guard';

@ApiTags('Admin System')
@Controller('api/v1/admin/system')
@UseGuards(AdminJwtGuard)
@ApiBearerAuth()
export class SystemController {
  constructor(private readonly systemService: SystemService) {}

  @Get('admins')
  async admins(@Query() query: PageQueryDto) {
    const data = await this.systemService.listAdmins(query);
    return { status: 'success', data };
  }

  @Post('admins')
  async createAdmin(@Body() dto: CreateAdminDto) {
    const data = await this.systemService.createAdmin(dto);
    return { status: 'success', data };
  }

  @Post('admins/:id/reset-pwd')
  async resetPwd(@Param('id', ParseIntPipe) id: number, @Body() dto: ResetAdminPwdDto) {
    await this.systemService.resetAdminPassword(id, dto.password);
    return { status: 'success', message: 'Password reset' };
  }

  @Get('roles')
  async roles() {
    const data = await this.systemService.listRoles();
    return { status: 'success', data };
  }

  @Post('roles')
  async createRole(@Body() dto: CreateRoleDto) {
    const data = await this.systemService.createRole(dto);
    return { status: 'success', data };
  }

  @Put('roles/:id')
  async updateRole(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRoleDto) {
    await this.systemService.updateRole(id, dto);
    return { status: 'success', message: 'Role updated' };
  }

  @Get('roles/:id/menus')
  async roleMenus(@Param('id', ParseIntPipe) id: number) {
    const data = await this.systemService.getRoleMenuIds(id);
    return { status: 'success', data };
  }

  @Post('roles/:id/menus')
  async assignMenus(@Param('id', ParseIntPipe) id: number, @Body() dto: AssignRoleMenusDto) {
    await this.systemService.assignRoleMenus(id, dto.menu_ids || []);
    return { status: 'success', message: 'Menus assigned' };
  }

  @Get('menus')
  async menus() {
    const data = await this.systemService.listMenus();
    return { status: 'success', data };
  }

  @Post('menus')
  async createMenu(@Body() dto: CreateMenuDto) {
    const data = await this.systemService.createMenu(dto);
    return { status: 'success', data };
  }

  @Put('menus/:id')
  async updateMenu(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateMenuDto) {
    await this.systemService.updateMenu(id, dto);
    return { status: 'success', message: 'Menu updated' };
  }

  @Get('audit-logs')
  async auditLogs(
    @Query()
    query: PageQueryDto & { admin_id?: number; action?: string; start_time?: string; end_time?: string },
  ) {
    const data = await this.systemService.listAuditLogs(query);
    return { status: 'success', data };
  }
}
