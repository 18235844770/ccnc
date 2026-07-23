<template>
  <view class="order-create-page">
    <view class="nav-bar">
      <view class="nav-bar__back" @click="onBack">
        <wd-icon name="arrow-left" size="22" color="#333" />
      </view>
      <text class="nav-bar__title">确认投资</text>
    </view>

    <scroll-view v-if="product" scroll-y class="scroll-content" :show-scrollbar="false">
      <view v-if="realnameStatus && realnameStatus !== 'APPROVED'" class="section-card section-card--warn">
        <text class="warn-text">请先完成实名认证后再投资</text>
        <wd-button size="small" type="primary" @click="goRealname">去实名</wd-button>
      </view>

      <view class="section-card">
        <text class="section-card__title">{{ product.name }}</text>
        <view class="summary-row">
          <text class="summary-label">年化收益率</text>
          <text class="summary-value summary-value--green">{{ formatYieldRate(product.yield_rate) }}%</text>
        </view>
        <view class="summary-row">
          <text class="summary-label">投资周期</text>
          <text class="summary-value">{{ product.cycle_days ?? 0 }} 天</text>
        </view>
        <view class="summary-row">
          <text class="summary-label">起投金额</text>
          <text class="summary-value">{{ formatAmount(product.min_amount) }} 元</text>
        </view>
      </view>

      <view class="section-card">
        <text class="section-card__subtitle">投资金额</text>
        <wd-input
          v-model="investAmount"
          type="digit"
          placeholder="请输入投资金额"
          :border="true"
          custom-class="amount-input"
        />
        <view class="amount-tip">最低 {{ formatAmount(product.min_amount) }} 元</view>
        <view class="expected-row">
          <text class="expected-label">预期收益（参考）</text>
          <text class="expected-value">¥ {{ expectedProfit }}</text>
        </view>
      </view>

      <view class="section-card">
        <text class="section-card__subtitle">支付方式</text>
        <view class="pay-option" :class="{ 'pay-option--active': paymentMethod === 'BALANCE' }" @click="paymentMethod = 'BALANCE'">
          <view class="pay-option__main">
            <text class="pay-option__title">余额支付</text>
            <text class="pay-option__desc">可用余额 ¥ {{ formatAmount(balanceAvailable) }}</text>
          </view>
          <wd-icon v-if="paymentMethod === 'BALANCE'" name="check" size="18" color="#07c160" />
        </view>
        <view class="pay-option" :class="{ 'pay-option--active': paymentMethod === 'ALIPAY' }" @click="paymentMethod = 'ALIPAY'">
          <view class="pay-option__main">
            <text class="pay-option__title">支付宝（模拟）</text>
            <text class="pay-option__desc">跳转支付页完成付款</text>
          </view>
          <wd-icon v-if="paymentMethod === 'ALIPAY'" name="check" size="18" color="#07c160" />
        </view>
      </view>

      <view class="section-card section-card--risk">
        <text class="section-card__subtitle">风险提示</text>
        <text class="risk-text">
          1. 本产品不承诺保本保收益，投资有风险，请根据自身风险承受能力谨慎决策。
        </text>
        <text class="risk-text">
          2. 展示收益率为历史或预期参考值，实际收益以订单结算结果为准。
        </text>
        <text class="risk-text">
          3. 请确认已阅读产品说明，并了解碳期权相关规则。
        </text>
      </view>
    </scroll-view>

    <view v-if="product" class="bottom-bar">
      <view class="bottom-bar__amount">
        <text class="bottom-bar__label">支付金额</text>
        <text class="bottom-bar__value">¥ {{ displayAmount }}</text>
      </view>
      <wd-button
        type="primary"
        :loading="submitting"
        custom-class="bottom-bar__btn"
        @click="onSubmit"
      >
        确认支付
      </wd-button>
    </view>

    <view v-else-if="loading" class="state-wrap">
      <wd-loading type="circular" />
      <text class="state-text">加载中...</text>
    </view>
    <view v-else class="state-wrap">
      <text class="state-text">产品不存在</text>
      <wd-button type="primary" size="small" custom-class="state-btn" @click="onBack">返回</wd-button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { fetchProductDetail } from "@/api/product";
import { createOrder, payOrder } from "@/api/order";
import { fetchWallets } from "@/api/wallet";
import { fetchUserInfo } from "@/api/user";
import { useUserStore } from "@/store/user";
import type { ProductItem } from "@/api/product";
import { formatYieldRate, formatAmount } from "@/utils/format";

const userStore = useUserStore();
const product = ref<ProductItem | null>(null);
const loading = ref(true);
const submitting = ref(false);
const investAmount = ref("");
const productId = ref("");
const paymentMethod = ref<"BALANCE" | "ALIPAY">("BALANCE");
const balanceAvailable = ref(0);
const realnameStatus = ref("");

const minAmount = computed(() => product.value?.min_amount ?? 0);

const displayAmount = computed(() => {
  const n = parseFloat(investAmount.value);
  return isNaN(n) ? "0.00" : formatAmount(n);
});

const expectedProfit = computed(() => {
  const amount = parseFloat(investAmount.value);
  const rate = product.value?.yield_rate ?? 0;
  const days = product.value?.cycle_days ?? 0;
  if (isNaN(amount) || amount <= 0 || !rate || !days) return "0.00";
  const profit = amount * rate * (days / 365);
  return formatAmount(profit);
});

onLoad((options) => {
  productId.value = String(options?.product_id || options?.id || "");
  if (productId.value) {
    loadProduct(productId.value);
  } else {
    loading.value = false;
  }
  if (userStore.checkLogin()) {
    loadUserContext();
  }
});

async function loadProduct(id: string) {
  loading.value = true;
  try {
    const res = await fetchProductDetail(id);
    product.value = (res as any)?.data ?? res ?? null;
    investAmount.value = String(product.value?.min_amount ?? "");
  } catch (e) {
    console.error("loadProduct error:", e);
    product.value = null;
  } finally {
    loading.value = false;
  }
}

async function loadUserContext() {
  try {
    const [profileRes, walletRes] = await Promise.all([fetchUserInfo(), fetchWallets()]);
    const profile = (profileRes as any)?.data ?? profileRes;
    realnameStatus.value = profile?.realname_status ?? "";
    const wallets = (walletRes as any)?.data ?? walletRes;
    const list = Array.isArray(wallets) ? wallets : [];
    const balanceWallet = list.find((w: any) => w.type === "BALANCE") ?? list[0];
    balanceAvailable.value = Number(balanceWallet?.balance_available ?? 0);
  } catch (e) {
    console.error("loadUserContext error:", e);
  }
}

function onBack() {
  uni.navigateBack({ fail: () => uni.switchTab({ url: "/pages/carbon/index" }) });
}

function goRealname() {
  uni.navigateTo({ url: "/pages/user/realname" });
}

async function onSubmit() {
  if (!product.value) return;

  const amount = parseFloat(investAmount.value);
  if (isNaN(amount) || amount < minAmount.value) {
    uni.showToast({ title: `投资金额不能低于 ${minAmount.value} 元`, icon: "none" });
    return;
  }

  if (!userStore.checkLogin()) {
    uni.showToast({ title: "请先登录", icon: "none" });
    setTimeout(() => {
      uni.navigateTo({
        url: `/pages/login/index?redirect=${encodeURIComponent("/pages/order/create?product_id=" + productId.value)}`,
      });
    }, 500);
    return;
  }

  if (realnameStatus.value !== "APPROVED") {
    uni.showModal({
      title: "需要实名认证",
      content: "投资前请先完成实名认证",
      confirmText: "去实名",
      success: (res) => {
        if (res.confirm) goRealname();
      },
    });
    return;
  }

  if (paymentMethod.value === "BALANCE" && amount > balanceAvailable.value) {
    uni.showToast({ title: "余额不足，请充值或更换支付方式", icon: "none" });
    return;
  }

  submitting.value = true;
  try {
    const createRes = await createOrder({
      product_id: product.value.id,
      amount,
    });
    const orderId =
      (createRes as any)?.data?.order_id ??
      (createRes as any)?.order_id;

    if (!orderId) {
      uni.showToast({ title: "创建订单失败", icon: "none" });
      return;
    }

    const payRes = await payOrder(orderId, {
      payment_method: paymentMethod.value,
      payment_amount: amount,
    });

    if (paymentMethod.value === "BALANCE") {
      uni.redirectTo({
        url: `/pages/order/pay-callback?pay_success=1&order_id=${orderId}`,
      });
      return;
    }

    const payUrl =
      (payRes as any)?.data?.pay_url ??
      (payRes as any)?.data?.redirect_url ??
      (payRes as any)?.pay_url ??
      (payRes as any)?.redirect_url;

    if (payUrl) {
      // #ifdef H5
      window.location.href = payUrl;
      // #endif
      // #ifndef H5
      plus.runtime.openURL(payUrl);
      // #endif
      return;
    }

    uni.showToast({ title: (payRes as any)?.message || "获取支付链接失败", icon: "none" });
  } catch (e) {
    console.error("submit order error:", e);
  } finally {
    submitting.value = false;
  }
}
</script>

<style lang="scss" scoped>
.order-create-page {
  min-height: 100vh;
  background: $ccnc-bg-page;
  padding-bottom: calc(140rpx + env(safe-area-inset-bottom));
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 88rpx;
  padding-top: env(safe-area-inset-top);
  background: $ccnc-bg-card;
  position: relative;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
}

.nav-bar__back {
  position: absolute;
  left: $ccnc-page-padding;
  padding: 16rpx;
}

.nav-bar__title {
  font-size: 34rpx;
  font-weight: 600;
  color: $ccnc-text-primary;
}

.scroll-content {
  height: calc(100vh - 88rpx - 140rpx - env(safe-area-inset-top) - env(safe-area-inset-bottom));
  padding: $ccnc-page-padding;
}

.section-card {
  @include ccnc-card;
  margin: 0 0 $ccnc-section-gap;
  padding: $ccnc-card-padding;

  &--risk {
    margin-bottom: 40rpx;
  }

  &--warn {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #fff7e6;
    border: 1rpx solid #ffd591;
  }
}

.warn-text {
  font-size: 26rpx;
  color: #d48806;
}

.section-card__title {
  display: block;
  font-size: 34rpx;
  font-weight: 700;
  color: $ccnc-text-primary;
  margin-bottom: 24rpx;
}

.section-card__subtitle {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: $ccnc-text-primary;
  margin-bottom: 24rpx;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12rpx 0;
}

.summary-label {
  font-size: 28rpx;
  color: $ccnc-text-secondary;
}

.summary-value {
  font-size: 28rpx;
  color: $ccnc-text-primary;

  &--green {
    @include ccnc-value-green;
    font-size: 32rpx;
  }
}

.amount-input {
  margin-bottom: 12rpx;
}

.amount-tip {
  font-size: 24rpx;
  color: $ccnc-text-placeholder;
  margin-bottom: 24rpx;
}

.expected-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16rpx;
  border-top: 1rpx solid #f0f0f0;
}

.expected-label {
  font-size: 26rpx;
  color: $ccnc-text-secondary;
}

.expected-value {
  font-size: 30rpx;
  font-weight: 600;
  color: $ccnc-success;
}

.pay-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx;
  margin-bottom: 16rpx;
  border-radius: 12rpx;
  border: 1rpx solid #eee;
  background: #fafafa;

  &--active {
    border-color: #07c160;
    background: #f6ffed;
  }
}

.pay-option__main {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.pay-option__title {
  font-size: 28rpx;
  font-weight: 600;
  color: $ccnc-text-primary;
}

.pay-option__desc {
  font-size: 24rpx;
  color: $ccnc-text-secondary;
}

.risk-text {
  display: block;
  font-size: 24rpx;
  color: $ccnc-text-secondary;
  line-height: 1.7;
  margin-bottom: 12rpx;
}

.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  gap: 24rpx;
  padding: 24rpx $ccnc-page-padding;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  background: $ccnc-bg-card;
  box-shadow: 0 -2rpx 12rpx rgba(0, 0, 0, 0.06);
}

.bottom-bar__amount {
  flex: 1;
}

.bottom-bar__label {
  display: block;
  font-size: 24rpx;
  color: $ccnc-text-placeholder;
}

.bottom-bar__value {
  font-size: 36rpx;
  font-weight: 700;
  color: $ccnc-danger;
}

.bottom-bar__btn {
  min-width: 240rpx !important;
  height: 88rpx !important;
  border-radius: 44rpx !important;
}

.state-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx;
}

.state-text {
  margin-top: 24rpx;
  font-size: 28rpx;
  color: $ccnc-text-placeholder;
}

.state-btn {
  margin-top: 32rpx;
}
</style>
