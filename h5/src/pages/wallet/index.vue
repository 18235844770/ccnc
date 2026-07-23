<template>
  <view class="wallet-page">
    <page-nav-bar title="我的钱包" fallback="/pages/user/index" />

    <scroll-view scroll-y class="scroll-content" :show-scrollbar="false">
      <view class="balance-card">
        <text class="balance-card__label">可用余额 (元)</text>
        <text class="balance-card__value">{{ formatAmount(balanceAvailable) }}</text>
        <view class="balance-card__sub">
          <text>冻结中 {{ formatAmount(balanceFrozen) }} 元</text>
        </view>
      </view>

      <view class="action-grid">
        <view class="action-item" @click="goRecharge">
          <wd-icon name="add-circle" size="28" color="#1989fa" />
          <text>充值</text>
        </view>
        <view class="action-item" @click="goLedger">
          <wd-icon name="file" size="28" color="#1989fa" />
          <text>资金明细</text>
        </view>
        <view class="action-item" @click="goWithdraw">
          <wd-icon name="download" size="28" color="#1989fa" />
          <text>提现</text>
        </view>
        <view class="action-item" @click="goOrders">
          <wd-icon name="list" size="28" color="#1989fa" />
          <text>投资订单</text>
        </view>
        <view class="action-item" @click="goCommission">
          <wd-icon name="chart-bar" size="28" color="#1989fa" />
          <text>推广收益</text>
        </view>
      </view>

      <view class="section">
        <view class="section__header">
          <text class="section__title">最近提现</text>
          <text class="section__link" @click="goWithdraw">全部</text>
        </view>
        <view v-for="item in recentWithdraws" :key="item.id" class="record-row">
          <view>
            <text class="record-row__title">提现申请</text>
            <text class="record-row__time">{{ formatTime(item.created_at) }}</text>
          </view>
          <view class="record-row__right">
            <text class="record-row__amount">-{{ formatAmount(item.amount) }}</text>
            <text class="record-row__status">{{ withdrawStatusText(item.status) }}</text>
          </view>
        </view>
        <view v-if="!loading && recentWithdraws.length === 0" class="empty-tip">暂无提现记录</view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { onShow } from "@dcloudio/uni-app";
import { fetchWallets, fetchWithdraws } from "@/api/wallet";
import type { WalletItem, WithdrawItem } from "@/api/wallet";
import { formatAmount } from "@/utils/format";

const wallets = ref<WalletItem[]>([]);
const recentWithdraws = ref<WithdrawItem[]>([]);
const loading = ref(false);

const balanceAvailable = computed(
  () => wallets.value.find((w) => w.type === "BALANCE")?.balance_available ?? 0,
);
const balanceFrozen = computed(
  () => wallets.value.find((w) => w.type === "BALANCE")?.balance_frozen ?? 0,
);

onShow(() => {
  loadData();
});

async function loadData() {
  loading.value = true;
  try {
    const [walletRes, withdrawRes] = await Promise.all([
      fetchWallets(),
      fetchWithdraws({ page: 1, page_size: 5 }),
    ]);
    wallets.value = (walletRes as any)?.data ?? [];
    recentWithdraws.value = (withdrawRes as any)?.data?.records ?? [];
  } catch (e) {
    console.error("load wallet error:", e);
  } finally {
    loading.value = false;
  }
}

function formatTime(str?: string) {
  if (!str) return "";
  return new Date(str).toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function withdrawStatusText(s?: string) {
  const map: Record<string, string> = {
    PENDING: "审核中",
    APPROVED: "已通过",
    REJECTED: "已拒绝",
    PAID: "已到账",
  };
  return map[s || ""] || s || "";
}

function onBack() {
  uni.navigateBack({ fail: () => uni.switchTab({ url: "/pages/user/index" }) });
}

function goLedger() {
  uni.navigateTo({ url: "/pages/wallet/ledger" });
}

function goRecharge() {
  uni.navigateTo({ url: "/pages/wallet/recharge" });
}

function goWithdraw() {
  uni.navigateTo({ url: "/pages/wallet/withdraw" });
}

function goOrders() {
  uni.navigateTo({ url: "/pages/order/list" });
}

function goCommission() {
  uni.navigateTo({ url: "/pages/promo/commission" });
}
</script>

<style lang="scss" scoped>
.wallet-page {
  min-height: 100vh;
  background: $ccnc-bg-page;
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 88rpx;
  padding-top: env(safe-area-inset-top);
  background: $ccnc-bg-card;
  position: relative;
}

.nav-bar__back {
  position: absolute;
  left: $ccnc-page-padding;
  padding: 16rpx;
}

.nav-bar__title {
  font-size: 34rpx;
  font-weight: 600;
}

.scroll-content {
  height: calc(100vh - 88rpx - env(safe-area-inset-top));
  padding: $ccnc-page-padding;
}

.balance-card {
  background: linear-gradient(135deg, #4a90d9, #7eb8e8);
  border-radius: $ccnc-radius-lg;
  padding: 48rpx 32rpx;
  color: #fff;
  margin-bottom: $ccnc-section-gap;
}

.balance-card__label {
  font-size: 26rpx;
  opacity: 0.9;
}

.balance-card__value {
  display: block;
  font-size: 56rpx;
  font-weight: 700;
  margin: 16rpx 0;
}

.balance-card__sub {
  font-size: 24rpx;
  opacity: 0.85;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16rpx;
  background: $ccnc-bg-card;
  border-radius: $ccnc-radius-lg;
  padding: 32rpx 16rpx;
  margin-bottom: $ccnc-section-gap;
  box-shadow: $ccnc-shadow-card;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  font-size: 24rpx;
  color: $ccnc-text-secondary;
}

.section {
  background: $ccnc-bg-card;
  border-radius: $ccnc-radius-lg;
  padding: 32rpx;
  box-shadow: $ccnc-shadow-card;
}

.section__header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 24rpx;
}

.section__title {
  font-size: 30rpx;
  font-weight: 600;
}

.section__link {
  font-size: 26rpx;
  color: $ccnc-primary;
}

.record-row {
  display: flex;
  justify-content: space-between;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
}

.record-row__title {
  display: block;
  font-size: 28rpx;
  color: $ccnc-text-primary;
}

.record-row__time {
  display: block;
  font-size: 24rpx;
  color: $ccnc-text-placeholder;
  margin-top: 8rpx;
}

.record-row__right {
  text-align: right;
}

.record-row__amount {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: $ccnc-text-primary;
}

.record-row__status {
  display: block;
  font-size: 24rpx;
  color: $ccnc-text-placeholder;
  margin-top: 8rpx;
}

.empty-tip {
  text-align: center;
  font-size: 26rpx;
  color: $ccnc-text-placeholder;
  padding: 32rpx 0;
}
</style>
