import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { AdminLoginDto } from '../../common/dto';
import { AuthTokenService } from '../auth/auth-token.service';
import { AdminJwtGuard } from '../../common/guards/jwt.guard';
import { CurrentAdmin } from '../../common/decorators/current-user.decorator';

@ApiTags('Admin Auth')
@Controller('api/v1/admin/auth')
export class AdminAuthController {
  constructor(
    private readonly adminService: AdminService,
    private readonly authToken: AuthTokenService,
  ) {}

  @Post('login')
  async login(@Body() dto: AdminLoginDto) {
    const result = await this.adminService.login(dto.username, dto.password);
    const token = this.authToken.signAdmin({ sub: result.admin.id, username: result.admin.username });
    return {
      status: 'success',
      token,
      data: {
        admin: result.admin,
        permissions: result.permissions,
        menus: result.menus,
      },
    };
  }

  @Get('info')
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth()
  async info(@CurrentAdmin() admin: { sub: number }) {
    const data = await this.adminService.getProfile(admin.sub);
    return { status: 'success', data };
  }

  @Get('menus/tree')
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth()
  async menusTree(@CurrentAdmin() admin: { sub: number }) {
    const data = await this.adminService.getProfile(admin.sub);
    return { status: 'success', data: data.menus };
  }
}
