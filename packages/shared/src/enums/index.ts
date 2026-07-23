/** 用户状态 */
export type UserStatus = 'NORMAL' | 'BANNED' | 'FROZEN';

/** 订单状态 */
export type OrderStatus =
  | 'PENDING'
  | 'PAID'
  | 'ACTIVE'
  | 'EXPIRED'
  | 'SETTLED'
  | 'REFUNDED';

/** 分润状态 */
export type CommissionStatus =
  | 'PENDING'
  | 'SETTLED'
  | 'PAID'
  | 'FROZEN'
  | 'VOID';

/** 产品状态 */
export type ProductStatus = 'DRAFT' | 'ON_SALE' | 'OFF_SALE';

/** Banner 状态 */
export type BannerStatus = 'ACTIVE' | 'INACTIVE';

/** 文章状态 */
export type ArticleStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

/** 提现状态 */
export type WithdrawStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID';

/** 实名认证状态 */
export type RealnameAuthStatus = 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED';

/** 推广链接状态 */
export type PromotionLinkStatus = 'ACTIVE' | 'DISABLED';

/** 钱包类型 */
export type WalletType = 'BALANCE' | 'COMMISSION';

/** 充值单状态 */
export type RechargeStatus = 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED';

/** 风控等级 */
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

/** 管理员状态 */
export type AdminStatus = 'ACTIVE' | 'DISABLED';

/** 菜单类型 */
export type MenuType = 1 | 2 | 3; // 1=目录 2=菜单 3=按钮

export const MAX_PROMO_LEVEL = 5;
