import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  username!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsOptional()
  @IsString()
  invite_code?: string;
}

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  username!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}

export class AdminLoginDto {
  @IsString()
  @IsNotEmpty()
  username!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  yield_rate!: number;

  cycle_days!: number;

  min_amount!: number;

  @IsOptional()
  max_amount?: number;

  @IsOptional()
  @IsString()
  rule_version?: string;
}

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  yield_rate?: number;

  @IsOptional()
  cycle_days?: number;

  @IsOptional()
  min_amount?: number;

  @IsOptional()
  max_amount?: number;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  rule_version?: string;
}

export class PageQueryDto {
  @IsOptional()
  page?: number;

  @IsOptional()
  page_size?: number;
}

export class CreateOrderDto {
  @IsNumber()
  product_id!: number;

  @IsNumber()
  amount!: number;

  /** 兼容旧客户端，服务端以 JWT 用户为准 */
  @IsOptional()
  @IsNumber()
  user_id?: number;
}

export class PayOrderDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['ALIPAY', 'BALANCE'])
  payment_method!: 'ALIPAY' | 'BALANCE';

  @IsNumber()
  payment_amount!: number;
}

export class WithdrawDto {
  @IsNumber()
  amount!: number;

  @IsOptional()
  @IsString()
  wallet_type?: string;

  @IsOptional()
  @IsString()
  address?: string;

  /** 兼容旧客户端 */
  @IsOptional()
  @IsNumber()
  user_id?: number;
}

export class RealnameAuthDto {
  @IsString()
  @IsNotEmpty()
  real_name!: string;

  @IsString()
  @IsNotEmpty()
  id_card!: string;
}

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  phone_number?: string;

  @IsOptional()
  @IsString()
  avatar_url?: string;
}

export class RejectWithdrawDto {
  @IsString()
  @IsNotEmpty()
  reason!: string;
}

export class AdjustBalanceDto {
  @IsNumber()
  user_id!: number;

  @IsNumber()
  amount!: number;

  @IsString()
  @IsNotEmpty()
  description!: string;
}

export class CreateAdminDto {
  @IsString()
  @IsNotEmpty()
  username!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  role_ids!: number[];
}

export class ResetAdminPwdDto {
  @IsString()
  @MinLength(6)
  password!: string;
}

export class CreateRoleDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  key!: string;

  @IsOptional()
  status?: number;
}

export class UpdateRoleDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  key?: string;

  @IsOptional()
  status?: number;
}

export class AssignRoleMenusDto {
  menu_ids!: number[];
}

export class CreateMenuDto {
  @IsNumber()
  parent_id!: number;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsNumber()
  type!: number;

  @IsOptional()
  @IsString()
  path?: string;

  @IsOptional()
  @IsString()
  component?: string;

  @IsOptional()
  @IsString()
  permission?: string;

  @IsOptional()
  sort?: number;

  @IsOptional()
  visible?: boolean;
}

export class UpdateMenuDto {
  @IsOptional()
  @IsNumber()
  parent_id?: number;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  type?: number;

  @IsOptional()
  @IsString()
  path?: string;

  @IsOptional()
  @IsString()
  component?: string;

  @IsOptional()
  @IsString()
  permission?: string;

  @IsOptional()
  sort?: number;

  @IsOptional()
  visible?: boolean;
}

export class CreateBannerDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  image_url!: string;

  @IsOptional()
  @IsString()
  link_url?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  sort_order?: number;

  @IsOptional()
  @IsString()
  start_time?: string;

  @IsOptional()
  @IsString()
  end_time?: string;
}

export class UpdateBannerDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  image_url?: string;

  @IsOptional()
  @IsString()
  link_url?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  sort_order?: number;

  @IsOptional()
  @IsString()
  start_time?: string;

  @IsOptional()
  @IsString()
  end_time?: string;
}

export class CreateArticleDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsOptional()
  @IsString()
  tags?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  publish_time?: string;

  @IsOptional()
  @IsString()
  cover_image?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  sort_order?: number;
}

export class UpdateArticleDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  tags?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  publish_time?: string;

  @IsOptional()
  @IsString()
  cover_image?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  sort_order?: number;
}

export class BanUserDto {
  @IsString()
  @IsIn(['BANNED', 'FROZEN'])
  mode!: 'BANNED' | 'FROZEN';

  @IsString()
  @IsNotEmpty()
  reason!: string;
}

export class UnbanUserDto {
  @IsString()
  @IsNotEmpty()
  reason!: string;
}

export class AdjustPromoDto {
  @IsNumber()
  new_parent_user_id!: number;

  @IsString()
  @IsNotEmpty()
  reason!: string;
}

export class ExportStatsDto {
  @IsString()
  @IsIn(['overview', 'users', 'orders', 'products'])
  type!: 'overview' | 'users' | 'orders' | 'products';

  @IsOptional()
  @IsString()
  from?: string;

  @IsOptional()
  @IsString()
  to?: string;
}

export class CreateRechargeDto {
  @IsNumber()
  amount!: number;

  @IsOptional()
  @IsString()
  @IsIn(['ALIPAY', 'WECHAT', 'MOCK'])
  channel?: string;
}

export class RechargeNotifyDto {
  @IsString()
  @IsNotEmpty()
  biz_id!: string;

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsString()
  @IsIn(['SUCCESS', 'FAILED'])
  status?: string;

  /** 支付网关回调密钥（可选） */
  @IsOptional()
  @IsString()
  secret?: string;
}
