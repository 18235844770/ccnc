import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { OrderService } from './order.service';
import { CreateOrderDto, PageQueryDto, PayOrderDto } from '../../common/dto';
import { UserJwtGuard, AdminJwtGuard } from '../../common/guards/jwt.guard';
import { CurrentUser, CurrentAdmin } from '../../common/decorators/current-user.decorator';
import { UserJwtPayload } from '../auth/auth-token.service';

@ApiTags('Orders')
@Controller('api/v1/orders')
@UseGuards(UserJwtGuard)
@ApiBearerAuth()
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async create(@CurrentUser() user: UserJwtPayload, @Body() dto: CreateOrderDto) {
    const data = await this.orderService.create(user.sub, dto);
    return { status: 'success', data };
  }

  @Get()
  async list(
    @CurrentUser() user: UserJwtPayload,
    @Query() query: PageQueryDto & { status?: string; user_id?: number },
  ) {
    const data = await this.orderService.list(user.sub, query);
    return { status: 'success', data };
  }

  @Get(':id')
  async detail(@CurrentUser() user: UserJwtPayload, @Param('id', ParseIntPipe) id: number) {
    const data = await this.orderService.get(user.sub, id);
    return { status: 'success', data };
  }

  @Post(':id/pay')
  async pay(
    @CurrentUser() user: UserJwtPayload,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: PayOrderDto,
  ) {
    const data = await this.orderService.pay(user.sub, id, dto);
    return { status: 'success', data };
  }

  @Post(':id/cancel')
  async cancel(@CurrentUser() user: UserJwtPayload, @Param('id', ParseIntPipe) id: number) {
    await this.orderService.cancel(user.sub, id);
    return { status: 'success', message: 'Order cancelled' };
  }

  @Post(':id/refund')
  async refund(@CurrentUser() user: UserJwtPayload, @Param('id', ParseIntPipe) id: number) {
    await this.orderService.refund(user.sub, id);
    return { status: 'success', message: 'Refund submitted' };
  }
}

@ApiTags('Admin Orders')
@Controller('api/v1/admin/orders')
@UseGuards(AdminJwtGuard)
@ApiBearerAuth()
export class AdminOrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  async list(
    @Query()
    query: PageQueryDto & { status?: string; user_id?: number; order_id?: string; order_no?: string },
  ) {
    const data = await this.orderService.listAdmin({
      ...query,
      order_no: query.order_id || query.order_no,
    });
    return { status: 'success', data };
  }

  @Get(':id')
  async detail(@Param('id', ParseIntPipe) id: number) {
    const data = await this.orderService.getAdmin(id);
    return { status: 'success', data };
  }

  @Post(':id/refund')
  async refund(
    @CurrentAdmin() admin: { sub: number },
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { reason: string },
  ) {
    await this.orderService.refundAdmin(admin.sub, id, body.reason || 'Admin refund');
    return { status: 'success', message: 'Refund completed' };
  }
}
