import { User, Product, Order, Banner, Article, Wallet, WalletLog, Withdraw, Commission, AdminUser, RechargeOrder } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

/** Prisma Decimal → number（API 输出） */
export function decimalToNumber(value: Decimal | number | null | undefined): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  return value.toNumber();
}

/** Date → ISO string */
export function toIsoString(value: Date | null | undefined): string | undefined {
  if (!value) return undefined;
  return value.toISOString();
}

export function mapUser(user: User) {
  return {
    id: user.id,
    username: user.username,
    email: user.email ?? undefined,
    phone_number: user.phone_number ?? undefined,
    avatar_url: user.avatar_url ?? undefined,
    status: user.status,
    created_at: user.created_at.toISOString(),
    updated_at: user.updated_at.toISOString(),
  };
}

export function mapAdminUserListItem(user: User) {
  return {
    user_id: user.id,
    username: user.username,
    phone_number: user.phone_number ?? undefined,
    email: user.email ?? undefined,
    status: user.status,
    created_at: user.created_at.toISOString(),
  };
}

export function mapProduct(product: Product) {
  return {
    id: product.id,
    name: product.name,
    description: product.description ?? undefined,
    yield_rate: decimalToNumber(product.yield_rate),
    cycle_days: product.cycle_days,
    min_amount: decimalToNumber(product.min_amount),
    max_amount: product.max_amount ? decimalToNumber(product.max_amount) : undefined,
    status: product.status,
    rule_version: product.rule_version ?? undefined,
    created_at: product.created_at.toISOString(),
    updated_at: product.updated_at.toISOString(),
  };
}

export function mapOrder(order: Order & { product?: Product | null }) {
  return {
    id: order.id,
    order_id: order.id,
    order_no: order.order_no,
    user_id: order.user_id,
    product_id: order.product_id,
    product_name: order.product?.name,
    amount: decimalToNumber(order.amount),
    profit: order.profit ? decimalToNumber(order.profit) : undefined,
    reward_amount: order.reward_amount ? decimalToNumber(order.reward_amount) : undefined,
    status: order.status,
    start_date: toIsoString(order.start_date),
    end_date: toIsoString(order.end_date),
    created_at: order.created_at.toISOString(),
    updated_at: order.updated_at.toISOString(),
    paid_at: order.status === 'PAID' || order.status === 'ACTIVE' || order.status === 'SETTLED'
      ? order.updated_at.toISOString()
      : undefined,
  };
}

export function mapBanner(banner: Banner) {
  return {
    id: banner.id,
    title: banner.title,
    image_url: banner.image_url,
    link_url: banner.link_url ?? undefined,
    status: banner.status,
    sort_order: banner.sort_order,
    start_time: toIsoString(banner.start_time),
    end_time: toIsoString(banner.end_time),
    created_at: banner.created_at.toISOString(),
    updated_at: banner.updated_at.toISOString(),
  };
}

export function mapArticle(article: Article, includeContent = false) {
  const base = {
    id: article.id,
    title: article.title,
    tags: article.tags ?? undefined,
    description: article.description ?? undefined,
    cover_image: article.cover_image ?? undefined,
    status: article.status,
    sort_order: article.sort_order,
    view_count: article.view_count,
    publish_time: toIsoString(article.publish_time),
    created_at: article.created_at.toISOString(),
    updated_at: article.updated_at.toISOString(),
  };
  if (includeContent) {
    return { ...base, content: article.content };
  }
  return base;
}

export function mapWallet(wallet: Wallet) {
  return {
    id: wallet.id,
    user_id: wallet.user_id,
    type: wallet.type,
    balance_available: decimalToNumber(wallet.balance_available),
    balance_frozen: decimalToNumber(wallet.balance_frozen),
    created_at: wallet.created_at.toISOString(),
    updated_at: wallet.updated_at.toISOString(),
  };
}

export function mapWalletLog(log: WalletLog) {
  return {
    id: log.id,
    wallet_id: log.wallet_id,
    user_id: log.user_id,
    type: log.type,
    wallet_type: log.wallet_type,
    reference_id: log.reference_id,
    reference_type: log.reference_type,
    amount: decimalToNumber(log.amount),
    balance_before: decimalToNumber(log.balance_before),
    balance_after: decimalToNumber(log.balance_after),
    description: log.description ?? undefined,
    created_at: log.created_at.toISOString(),
  };
}

export function mapWithdraw(w: Withdraw) {
  const reason = w.reason ?? '';
  const address = reason.startsWith('address:') ? reason.slice(8) : reason || '';
  const status = w.status === 'PAID' ? 'SUCCESS' : w.status;
  return {
    id: w.id,
    withdraw_id: w.id,
    user_id: w.user_id,
    amount: decimalToNumber(w.amount),
    fee: decimalToNumber(w.fee),
    status,
    address,
    network: address ? 'BANK' : '',
    reason: w.reason ?? undefined,
    created_at: w.created_at.toISOString(),
    updated_at: w.updated_at.toISOString(),
  };
}

export function mapCommission(c: Commission) {
  return {
    id: c.id,
    biz_type: c.biz_type,
    biz_id: c.biz_id,
    event_id: c.event_id ?? undefined,
    from_user_id: c.from_user_id,
    to_user_id: c.to_user_id,
    relation_level: c.relation_level,
    amount: decimalToNumber(c.amount),
    status: c.status,
    rule_snapshot: c.rule_snapshot ?? undefined,
    settled_at: toIsoString(c.settled_at),
    paid_at: toIsoString(c.paid_at),
    manual_flag: c.manual_flag,
    reverse_of: c.reverse_of ?? undefined,
    created_at: c.created_at.toISOString(),
    updated_at: c.updated_at.toISOString(),
  };
}

export function mapAdministrator(admin: AdminUser) {
  return {
    id: admin.id,
    username: admin.username,
    avatar: admin.avatar ?? undefined,
    status: admin.status,
    last_login_ip: admin.last_login_ip ?? undefined,
    last_login_time: toIsoString(admin.last_login_time),
    created_at: admin.created_at.toISOString(),
    updated_at: admin.updated_at.toISOString(),
  };
}

export function mapRecharge(order: RechargeOrder) {
  return {
    id: order.id,
    recharge_id: order.id,
    user_id: order.user_id,
    biz_id: order.biz_id,
    amount: decimalToNumber(order.amount),
    status: order.status,
    channel: order.channel ?? undefined,
    created_at: order.created_at.toISOString(),
    updated_at: order.updated_at.toISOString(),
  };
}

export function pageResult<T>(records: T[], total: number) {
  return { total, records };
}
