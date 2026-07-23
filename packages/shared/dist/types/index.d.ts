import type { BannerStatus, CommissionStatus, OrderStatus, ProductStatus, RealnameAuthStatus, UserStatus, WithdrawStatus, ArticleStatus, PromotionLinkStatus, WalletType, RechargeStatus, AdminStatus, MenuType } from '../enums/index.js';
/** 统一 API 响应 */
export interface ApiResponse<T = unknown> {
    status: 'success' | 'error';
    message: string;
    data?: T;
    token?: string;
    code?: string;
}
/** 统一分页结果 — 字段名 records，与后端一致 */
export interface PageResult<T> {
    total: number;
    records: T[];
}
/** 统一分页请求参数 */
export interface PageQuery {
    page?: number;
    page_size?: number;
}
/** 用户（C 端） */
export interface User {
    id: number;
    username: string;
    email?: string;
    phone_number?: string;
    avatar_url?: string;
    status: UserStatus;
    created_at: string;
    updated_at: string;
}
/** 管理端用户列表项（id 映射为 user_id） */
export interface AdminUserListItem {
    user_id: number;
    username: string;
    phone_number?: string;
    email?: string;
    status: UserStatus;
    created_at: string;
    promo_summary?: PromoSummary;
}
export interface PromoSummary {
    l1_count: number;
    l2_count: number;
    l3_count: number;
    l4_count?: number;
    l5_count?: number;
}
/** 推广关系 */
export interface UserRelation {
    id: number;
    user_id: number;
    parent_user_id: number;
    level: number;
    path: string;
    created_at: string;
    updated_at: string;
}
/** 推广链接 */
export interface PromotionLink {
    id: number;
    user_id: number;
    invite_code: string;
    status: PromotionLinkStatus;
    link_url?: string;
    reset_at?: string;
    created_at: string;
    updated_at: string;
}
/** 实名认证 */
export interface RealnameAuth {
    id: number;
    user_id: number;
    real_name: string;
    id_card: string;
    auth_status: RealnameAuthStatus;
    created_at: string;
}
/** 理财产品 */
export interface Product {
    id: number;
    name: string;
    description?: string;
    yield_rate: number;
    cycle_days: number;
    min_amount: number;
    max_amount?: number;
    status: ProductStatus;
    rule_version?: string;
    created_at: string;
    updated_at: string;
}
/** 投资订单 */
export interface Order {
    id: number;
    order_no?: string;
    user_id: number;
    product_id: number;
    product_name?: string;
    amount: number;
    profit?: number;
    reward_amount?: number;
    status: OrderStatus;
    start_date?: string;
    end_date?: string;
    created_at: string;
    updated_at: string;
}
/** 分润记录 */
export interface Commission {
    id: number;
    biz_type: string;
    biz_id: string;
    event_id?: string;
    from_user_id: number;
    to_user_id: number;
    relation_level: number;
    amount: number;
    status: CommissionStatus;
    rule_snapshot?: string;
    settled_at?: string;
    paid_at?: string;
    manual_flag?: boolean;
    reverse_of?: number;
    created_at: string;
    updated_at: string;
}
/** 钱包 */
export interface Wallet {
    id: number;
    user_id: number;
    type: WalletType;
    balance_available: number;
    balance_frozen: number;
    created_at: string;
    updated_at: string;
}
/** 资金流水 */
export interface WalletLog {
    id: number;
    wallet_id: number;
    user_id: number;
    type: string;
    wallet_type: WalletType;
    reference_id: string;
    reference_type: string;
    amount: number;
    balance_before: number;
    balance_after: number;
    description?: string;
    created_at: string;
}
/** 提现 */
export interface Withdraw {
    id: number;
    user_id: number;
    wallet_id: number;
    amount: number;
    fee?: number;
    status: WithdrawStatus;
    reason?: string;
    audit_admin_id?: number;
    created_at: string;
    updated_at: string;
}
/** 充值单 */
export interface RechargeOrder {
    id: number;
    user_id: number;
    biz_id: string;
    amount: number;
    status: RechargeStatus;
    channel?: string;
    created_at: string;
    updated_at: string;
}
/** Banner */
export interface Banner {
    id: number;
    title: string;
    image_url: string;
    link_url?: string;
    status: BannerStatus;
    sort_order: number;
    start_time?: string;
    end_time?: string;
    created_at: string;
    updated_at: string;
}
/** 文章（列表，不含正文） */
export interface Article {
    id: number;
    title: string;
    tags?: string;
    description?: string;
    cover_image?: string;
    status: ArticleStatus;
    sort_order?: number;
    view_count?: number;
    publish_time?: string;
    created_at: string;
    updated_at: string;
}
/** 文章详情（含正文） */
export interface ArticleDetail extends Article {
    content: string;
}
/** 管理员 */
export interface Administrator {
    id: number;
    username: string;
    avatar?: string;
    status: AdminStatus;
    last_login_ip?: string;
    last_login_time?: string;
    created_at: string;
    updated_at: string;
}
/** 角色 */
export interface Role {
    id: number;
    name: string;
    key: string;
    status: AdminStatus;
    created_at: string;
    updated_at: string;
}
/** 菜单 */
export interface Menu {
    id: number;
    parent_id: number;
    name: string;
    type: MenuType;
    path?: string;
    component?: string;
    permission?: string;
    sort: number;
    visible: boolean;
    children?: Menu[];
    created_at?: string;
    updated_at?: string;
}
/** 审计日志 */
export interface AuditLog {
    id: number;
    admin_id: number;
    action: string;
    target_type: string;
    target_id: number;
    reason?: string;
    before_data?: string;
    after_data?: string;
    created_at: string;
}
/** ---------- 请求 DTO（snake_case，与 API 一致） ---------- */
export interface RegisterRequest {
    username: string;
    password: string;
    invite_code?: string;
}
export interface LoginRequest {
    username: string;
    password: string;
}
export interface CreateProductRequest {
    name: string;
    description?: string;
    yield_rate: number;
    cycle_days: number;
    min_amount: number;
    max_amount?: number;
    rule_version?: string;
}
export interface UpdateProductRequest extends Partial<CreateProductRequest> {
    status?: ProductStatus;
}
export interface CreateOrderRequest {
    product_id: number;
    amount: number;
}
export interface UserQueryParams extends PageQuery {
    user_id?: number;
    username?: string;
    keyword?: string;
    status?: UserStatus;
    created_from?: string;
    created_to?: string;
}
export interface ProductQueryParams extends PageQuery {
    status?: ProductStatus;
}
export interface OrderQueryParams extends PageQuery {
    user_id?: number;
    status?: OrderStatus;
}
export interface ArticleQueryParams extends PageQuery {
    status?: ArticleStatus;
    keyword?: string;
}
export interface BannerQueryParams extends PageQuery {
    status?: BannerStatus;
}
export interface AdminLoginRequest {
    username: string;
    password: string;
}
export interface AdminLoginResult {
    token: string;
    admin: Administrator;
    permissions: string[];
    menus: Menu[];
}
//# sourceMappingURL=index.d.ts.map