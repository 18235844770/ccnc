import { Body, Controller, Get, Param, ParseIntPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { PromotionService } from '../promotion/promotion.service';
import { RegisterDto, LoginDto, PageQueryDto, RealnameAuthDto, BanUserDto, UnbanUserDto, AdjustPromoDto, UpdateProfileDto } from '../../common/dto';
import { AuthTokenService } from '../auth/auth-token.service';
import { UserJwtGuard, AdminJwtGuard } from '../../common/guards/jwt.guard';
import { CurrentUser, CurrentAdmin } from '../../common/decorators/current-user.decorator';
import { UserJwtPayload, AdminJwtPayload } from '../auth/auth-token.service';

@ApiTags('Auth')
@Controller('api/v1/auth')
export class AuthController {
  constructor(
    private readonly userService: UserService,
    private readonly authToken: AuthTokenService,
  ) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    await this.userService.register(dto);
    return { status: 'success', message: 'User registered successfully' };
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    const user = await this.userService.login(dto.username, dto.password);
    const token = this.authToken.signUser({ sub: user.id, username: user.username });
    return { status: 'success', token };
  }
}

@ApiTags('Users')
@Controller('api/v1/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @UseGuards(UserJwtGuard)
  @ApiBearerAuth()
  async me(@CurrentUser() user: UserJwtPayload) {
    const data = await this.userService.getById(user.sub);
    return { status: 'success', data };
  }

  @Put('me')
  @UseGuards(UserJwtGuard)
  @ApiBearerAuth()
  async updateMe(@CurrentUser() user: UserJwtPayload, @Body() dto: UpdateProfileDto) {
    const data = await this.userService.updateProfile(user.sub, dto);
    return { status: 'success', data };
  }

  @Post('me/realname-auth')
  @UseGuards(UserJwtGuard)
  @ApiBearerAuth()
  async realnameAuth(@CurrentUser() user: UserJwtPayload, @Body() dto: RealnameAuthDto) {
    const data = await this.userService.submitRealname(user.sub, dto);
    return { status: 'success', data };
  }

  @Get('me/realname-auth')
  @UseGuards(UserJwtGuard)
  @ApiBearerAuth()
  async getRealname(@CurrentUser() user: UserJwtPayload) {
    const data = await this.userService.getRealname(user.sub);
    return { status: 'success', data };
  }
}

@ApiTags('Admin Users')
@Controller('api/v1/admin/users')
export class AdminUserController {
  constructor(
    private readonly userService: UserService,
    private readonly promotionService: PromotionService,
  ) {}

  @Get()
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth()
  async list(
    @Query()
    query: PageQueryDto & { username?: string; keyword?: string; user_id?: number; status?: string },
  ) {
    const data = await this.userService.listAdmin(query);
    return { status: 'success', data };
  }

  @Get(':id')
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth()
  async detail(@Param('id', ParseIntPipe) id: number) {
    const data = await this.promotionService.getAdminUserDetail(id);
    return { status: 'success', data };
  }

  @Get(':id/downlines')
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth()
  async downlines(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: PageQueryDto & { level?: number },
  ) {
    const data = await this.promotionService.listDownlines(id, query);
    return { status: 'success', data };
  }

  @Post(':id/ban')
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth()
  async ban(
    @CurrentAdmin() admin: AdminJwtPayload,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: BanUserDto,
  ) {
    await this.userService.banUser(admin.sub, id, dto);
    return { status: 'success', message: 'User banned' };
  }

  @Post(':id/unban')
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth()
  async unban(
    @CurrentAdmin() admin: AdminJwtPayload,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UnbanUserDto,
  ) {
    await this.userService.unbanUser(admin.sub, id, dto);
    return { status: 'success', message: 'User unbanned' };
  }

  @Post(':id/promo/adjust')
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth()
  async adjustPromo(
    @CurrentAdmin() admin: AdminJwtPayload,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AdjustPromoDto,
  ) {
    await this.promotionService.adjustPromoRelation(admin.sub, id, dto.new_parent_user_id, dto.reason);
    return { status: 'success', message: 'Promotion relation adjusted' };
  }
}
