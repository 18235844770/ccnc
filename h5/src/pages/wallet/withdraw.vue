<template>
  <view class="withdraw-page">
    <page-nav-bar title="提现" fallback="/pages/wallet/index" />

    <scroll-view scroll-y class="scroll-content">
      <view class="balance-tip">可用余额 ¥{{ formatAmount(available) }}</view>
      <view class="form-card">
        <text class="form-label">提现金额</text>
        <wd-input v-model="amount" type="digit" placeholder="最低 100 元" :border="true" />
        <text class="form-label form-label--mt">收款地址（选填）</text>
        <wd-input v-model="address" placeholder="银行卡 / 钱包地址" :border="true" />
        <wd-button type="primary" block :loading="submitting" custom-class="submit-btn" @click="onSubmit">
          提交提现申请
        </wd-button>
      </view>

      <view class="section-title">提现记录</view>
      <view v-for="item in records" :key="item.id" class="record-card">
        <view>
          <text class="record-card__amount">¥{{ formatAmount(item.amount) }}</text>
          <text class="record-card__time">{{ formatTime(item.created_at) }}</text>
        </view>
        <text class="record-card__status">{{ statusText(item.status) }}</text>
      </view>
      <view v-if="!records.length && !loading" class="empty-tip">暂无提现记录</view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { onShow } from "@dcloudio/uni-app";
import { fetchWallets, applyWithdraw, fetchWithdraws } from "@/api/wallet";
import { fetchUserInfo } from "@/api/user";
import type { WithdrawItem } from "@/api/wallet";
import { formatAmount } from "@/utils/format";

const available = ref(0);
const amount = ref("");
const address = ref("");
const submitting = ref(false);
const loading = ref(false);
const records = ref<WithdrawItem[]>([]);
const realnameStatus = ref("");

onShow(() => {
  loadWallet();
  loadRecords();
  loadRealname();
});

async function loadRealname() {
  try {
    const res = await fetchUserInfo();
    realnameStatus.value = (res as any)?.data?.realname_status ?? "";
  } catch (e) {
    console.error(e);
  }
}

async function loadWallet() {
  try {
    const res = await fetchWallets();
    const list = (res as any)?.data ?? [];
    available.value = list.find((w: any) => w.type === "BALANCE")?.balance_available ?? 0;
  } catch (e) {
    console.error(e);
  }
}

async function loadRecords() {
  loading.value = true;
  try {
    const res = await fetchWithdraws({ page: 1, page_size: 20 });
    records.value = (res as any)?.data?.records ?? [];
  } finally {
    loading.value = false;
  }
}

async function onSubmit() {
  if (realnameStatus.value !== "APPROVED") {
    uni.showModal({
      title: "需要实名认证",
      content: "提现前请先完成实名认证",
      confirmText: "去实名",
      success: (res) => {
        if (res.confirm) uni.navigateTo({ url: "/pages/user/realname" });
      },
    });
    return;
  }
  const n = parseFloat(amount.value);
  if (isNaN(n) || n < 100) {
    uni.showToast({ title: "提现金额不能低于 100 元", icon: "none" });
    return;
  }
  if (n > available.value) {
    uni.showToast({ title: "余额不足", icon: "none" });
    return;
  }
  submitting.value = true;
  try {
    await applyWithdraw({ amount: n, wallet_type: "BALANCE", address: address.value || undefined });
    uni.showToast({ title: "提现申请已提交", icon: "success" });
    amount.value = "";
    loadWallet();
    loadRecords();
  } catch (e) {
    console.error(e);
  } finally {
    submitting.value = false;
  }
}

function statusText(s?: string) {
  const map: Record<string, string> = {
    PENDING: "审核中",
    SUCCESS: "已到账",
    PAID: "已到账",
    REJECTED: "已拒绝",
  };
  return map[s || ""] || s || "";
}

function formatTime(str?: string) {
  if (!str) return "";
  return new Date(str).toLocaleString("zh-CN");
}

function onBack() {
  uni.navigateBack();
}
</script>

<style lang="scss" scoped>
.withdraw-page { min-height: 100vh; background: $ccnc-bg-page; }
.nav-bar { display: flex; align-items: center; justify-content: center; min-height: 88rpx; padding-top: env(safe-area-inset-top); background: $ccnc-bg-card; position: relative; }
.nav-bar__back { position: absolute; left: $ccnc-page-padding; padding: 16rpx; }
.nav-bar__title { font-size: 34rpx; font-weight: 600; }
.scroll-content { height: calc(100vh - 88rpx - env(safe-area-inset-top)); padding: $ccnc-page-padding; }
.balance-tip { font-size: 28rpx; color: $ccnc-text-secondary; margin-bottom: 24rpx; }
.form-card { background: $ccnc-bg-card; border-radius: $ccnc-radius-lg; padding: 32rpx; box-shadow: $ccnc-shadow-card; margin-bottom: 32rpx; }
.form-label { display: block; font-size: 28rpx; color: $ccnc-text-primary; margin-bottom: 16rpx; &--mt { margin-top: 24rpx; } }
.submit-btn { margin-top: 40rpx !important; height: 88rpx !important; border-radius: 44rpx !important; }
.section-title { font-size: 30rpx; font-weight: 600; margin-bottom: 20rpx; }
.record-card { display: flex; justify-content: space-between; align-items: center; background: $ccnc-bg-card; border-radius: $ccnc-radius-lg; padding: 28rpx; margin-bottom: 16rpx; }
.record-card__amount { display: block; font-size: 32rpx; font-weight: 600; }
.record-card__time { display: block; font-size: 24rpx; color: $ccnc-text-placeholder; margin-top: 8rpx; }
.record-card__status { font-size: 26rpx; color: $ccnc-primary; }
.empty-tip { text-align: center; color: $ccnc-text-placeholder; padding: 48rpx; }
</style>
