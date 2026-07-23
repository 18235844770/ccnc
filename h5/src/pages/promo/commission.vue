<template>
  <view class="commission-page">
    <page-nav-bar title="推广收益" fallback="/pages/promo/index" />

    <scroll-view scroll-y class="scroll-content" @scrolltolower="loadMore">
      <view v-if="summary" class="summary-grid">
        <view class="summary-item"><text class="summary-item__val">{{ formatAmount(summary.pending) }}</text><text class="summary-item__lbl">待结算</text></view>
        <view class="summary-item"><text class="summary-item__val">{{ formatAmount(summary.settled) }}</text><text class="summary-item__lbl">已结算</text></view>
        <view class="summary-item"><text class="summary-item__val">{{ formatAmount(summary.paid) }}</text><text class="summary-item__lbl">已发放</text></view>
        <view class="summary-item"><text class="summary-item__val">{{ formatAmount(summary.total) }}</text><text class="summary-item__lbl">累计</text></view>
      </view>

      <view v-for="item in list" :key="item.id" class="item-card">
        <view>
          <text class="item-card__title">L{{ item.relation_level }} 级推广收益</text>
          <text class="item-card__sub">来源用户 ID {{ item.from_user_id }}</text>
          <text class="item-card__time">{{ formatTime(item.created_at) }}</text>
        </view>
        <view class="item-card__right">
          <text class="item-card__amount">+{{ formatAmount(item.amount) }}</text>
          <text class="item-card__status">{{ statusText(item.status) }}</text>
        </view>
      </view>

      <view v-if="loading" class="load-tip"><wd-loading type="circular" size="24" /></view>
      <view v-else-if="!list.length" class="load-tip">暂无收益记录</view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { fetchCommissionSummary, fetchCommissions } from "@/api/commission";
import type { CommissionItem, CommissionSummary } from "@/api/commission";
import { formatAmount } from "@/utils/format";

const summary = ref<CommissionSummary | null>(null);
const list = ref<CommissionItem[]>([]);
const loading = ref(false);
const page = ref(1);
const hasMore = ref(true);

onLoad(() => {
  loadSummary();
  loadList();
});

async function loadSummary() {
  try {
    const res = await fetchCommissionSummary();
    summary.value = (res as any)?.data ?? null;
  } catch (e) {
    console.error(e);
  }
}

async function loadList() {
  if (loading.value) return;
  loading.value = true;
  try {
    const res = await fetchCommissions({ page: page.value, page_size: 20 });
    const data = (res as any)?.data;
    const records = data?.records ?? [];
    if (page.value === 1) list.value = records;
    else list.value = [...list.value, ...records];
    hasMore.value = list.value.length < (data?.total ?? 0);
  } finally {
    loading.value = false;
  }
}

function loadMore() {
  if (!hasMore.value || loading.value) return;
  page.value++;
  loadList();
}

function statusText(s?: string) {
  const map: Record<string, string> = {
    PENDING: "待结算",
    SETTLED: "已结算",
    PAID: "已发放",
    FROZEN: "已冻结",
    VOID: "已作废",
  };
  return map[s || ""] || s || "";
}

function formatTime(str?: string) {
  if (!str) return "";
  return new Date(str).toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function onBack() {
  uni.navigateBack();
}
</script>

<style lang="scss" scoped>
.commission-page { min-height: 100vh; background: $ccnc-bg-page; }
.nav-bar { display: flex; align-items: center; justify-content: center; min-height: 88rpx; padding-top: env(safe-area-inset-top); background: $ccnc-bg-card; position: relative; }
.nav-bar__back { position: absolute; left: $ccnc-page-padding; padding: 16rpx; }
.nav-bar__title { font-size: 34rpx; font-weight: 600; }
.scroll-content { height: calc(100vh - 88rpx - env(safe-area-inset-top)); padding: $ccnc-page-padding; }
.summary-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20rpx; margin-bottom: 24rpx; }
.summary-item { background: $ccnc-bg-card; border-radius: $ccnc-radius-lg; padding: 28rpx; text-align: center; box-shadow: $ccnc-shadow-card; }
.summary-item__val { display: block; font-size: 34rpx; font-weight: 700; color: $ccnc-success; }
.summary-item__lbl { font-size: 24rpx; color: $ccnc-text-secondary; }
.item-card { display: flex; justify-content: space-between; background: $ccnc-bg-card; border-radius: $ccnc-radius-lg; padding: 28rpx; margin-bottom: 16rpx; box-shadow: $ccnc-shadow-card; }
.item-card__title { display: block; font-size: 28rpx; font-weight: 600; }
.item-card__sub, .item-card__time { display: block; font-size: 24rpx; color: $ccnc-text-placeholder; margin-top: 8rpx; }
.item-card__right { text-align: right; }
.item-card__amount { display: block; font-size: 32rpx; font-weight: 600; color: $ccnc-success; }
.item-card__status { display: block; font-size: 24rpx; color: $ccnc-text-placeholder; margin-top: 8rpx; }
.load-tip { padding: 32rpx; text-align: center; color: $ccnc-text-placeholder; }
</style>
