export declare class RegisterDto {
    username: string;
    password: string;
    invite_code?: string;
}
export declare class LoginDto {
    username: string;
    password: string;
}
export declare class AdminLoginDto {
    username: string;
    password: string;
}
export declare class CreateProductDto {
    name: string;
    description?: string;
    yield_rate: number;
    cycle_days: number;
    min_amount: number;
    max_amount?: number;
    rule_version?: string;
}
export declare class UpdateProductDto {
    name?: string;
    description?: string;
    yield_rate?: number;
    cycle_days?: number;
    min_amount?: number;
    max_amount?: number;
    status?: string;
    rule_version?: string;
}
export declare class PageQueryDto {
    page?: number;
    page_size?: number;
}
export declare class CreateOrderDto {
    product_id: number;
    amount: number;
    user_id?: number;
}
export declare class PayOrderDto {
    payment_method: 'ALIPAY' | 'BALANCE';
    payment_amount: number;
}
export declare class WithdrawDto {
    amount: number;
    wallet_type?: string;
    address?: string;
    user_id?: number;
}
export declare class RealnameAuthDto {
    real_name: string;
    id_card: string;
}
export declare class UpdateProfileDto {
    email?: string;
    phone_number?: string;
    avatar_url?: string;
}
export declare class RejectWithdrawDto {
    reason: string;
}
export declare class AdjustBalanceDto {
    user_id: number;
    amount: number;
    description: string;
}
export declare class CreateAdminDto {
    username: string;
    password: string;
    role_ids: number[];
}
export declare class ResetAdminPwdDto {
    password: string;
}
export declare class CreateRoleDto {
    name: string;
    key: string;
    status?: number;
}
export declare class UpdateRoleDto {
    name?: string;
    key?: string;
    status?: number;
}
export declare class AssignRoleMenusDto {
    menu_ids: number[];
}
export declare class CreateMenuDto {
    parent_id: number;
    name: string;
    type: number;
    path?: string;
    component?: string;
    permission?: string;
    sort?: number;
    visible?: boolean;
}
export declare class UpdateMenuDto {
    parent_id?: number;
    name?: string;
    type?: number;
    path?: string;
    component?: string;
    permission?: string;
    sort?: number;
    visible?: boolean;
}
export declare class CreateBannerDto {
    title: string;
    image_url: string;
    link_url?: string;
    status?: string;
    sort_order?: number;
    start_time?: string;
    end_time?: string;
}
export declare class UpdateBannerDto {
    title?: string;
    image_url?: string;
    link_url?: string;
    status?: string;
    sort_order?: number;
    start_time?: string;
    end_time?: string;
}
export declare class CreateArticleDto {
    title: string;
    tags?: string;
    description?: string;
    publish_time?: string;
    cover_image?: string;
    content?: string;
    status?: string;
    sort_order?: number;
}
export declare class UpdateArticleDto {
    title?: string;
    tags?: string;
    description?: string;
    publish_time?: string;
    cover_image?: string;
    content?: string;
    status?: string;
    sort_order?: number;
}
export declare class BanUserDto {
    mode: 'BANNED' | 'FROZEN';
    reason: string;
}
export declare class UnbanUserDto {
    reason: string;
}
export declare class AdjustPromoDto {
    new_parent_user_id: number;
    reason: string;
}
export declare class ExportStatsDto {
    type: 'overview' | 'users' | 'orders' | 'products';
    from?: string;
    to?: string;
}
export declare class CreateRechargeDto {
    amount: number;
    channel?: string;
}
export declare class RechargeNotifyDto {
    biz_id: string;
    amount?: number;
    status?: string;
    secret?: string;
}
