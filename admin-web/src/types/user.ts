/** 统一类型 — 来自 @ccnc/shared，字段与后端 API 一致（snake_case） */
export type {
  UserStatus,
  OrderStatus,
  CommissionStatus,
  ProductStatus,
  BannerStatus,
  ArticleStatus,
  WithdrawStatus,
  User,
  AdminUserListItem,
  PromoSummary,
  Product,
  Order,
  Commission,
  Wallet,
  WalletLog,
  Withdraw,
  Banner,
  Article,
  ArticleDetail,
  Administrator,
  Role,
  Menu,
  AuditLog,
  ApiResponse,
  PageResult,
  PageQuery,
  UserQueryParams,
  ProductQueryParams,
  CreateProductRequest,
  UpdateProductRequest,
  AdminLoginRequest,
  AdminLoginResult,
} from '@ccnc/shared';

export type { AdminUserListItem as UserListItem } from '@ccnc/shared';

export type ProductListResult = import('@ccnc/shared').PageResult<import('@ccnc/shared').Product>;
export type CreateProductData = import('@ccnc/shared').CreateProductRequest;
export type UpdateProductData = import('@ccnc/shared').UpdateProductRequest;

export type DownlineListResult = import('@ccnc/shared').PageResult<import('@ccnc/shared').AdminUserListItem>;

export interface UserDetailData {
  user: import('@ccnc/shared').AdminUserListItem;
  uplines: { user_id: number; username: string }[];
  downlines: {
    level_1: import('@ccnc/shared').AdminUserListItem[];
    level_2: import('@ccnc/shared').AdminUserListItem[];
    level_3: import('@ccnc/shared').AdminUserListItem[];
  };
}
