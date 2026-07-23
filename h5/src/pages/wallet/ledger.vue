<template>
  <view class="ledger-page">
    <page-nav-bar title="资金明细" fallback="/pages/wallet/index" />
    <scroll-view scroll-y class="scroll-content" @scrolltolower="loadMore">
      <view v-for="item in logs" :key="item.id" class="log-card">
        <view class="log-card__main">
          <text class="log-card__title">{{ item.description || item.reference_type || "资金变动" }}</text>
          <text class="log-card__time">{{ formatTime(item.created_at) }}</text>
        </view>
        <view class="log-card__right">
          <text class="log-card__amount" :class="{ 'log-card__amount--plus': item.amount > 0 }">
            {{ item.amount > 0 ? "+" : "" }}{{ formatAmount(item.amount) }}
          </text>
          <text class="log-card__balance">余额 {{ formatAmount(item.balance_after) }}</text>
        </view>
      </view>
      <view v-if="loading" class="load-tip"><wd-loading type="circular" size="24" /></view>
      <view v-else-if="!hasMore && logs.length" class="load-tip">没有更多了</view>
      <view v-else-if="!loading && !logs.length" class="load-tip">暂无流水</view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { fetchWalletLedger } from "@/api/wallet";
import type { WalletLogItem } from "@/api/wallet";
import { formatAmount } from "@/utils/format";

const logs = ref<WalletLogItem[]>([]);
const loading = ref(false);
const page = ref(1);
const hasMore = ref(true);

onLoad(() => loadList());

async function loadList() {
  if (loading.value) return;
  loading.value = true;
  try {
    const res = await fetchWalletLedger({ page: page.value, page_size: 20 });
    const data = (res as any)?.data;
    const list = data?.records ?? [];
    if (page.value === 1) logs.value = list;
    else logs.value = [...logs.value, ...list];
    hasMore.value = logs.value.length < (data?.total ?? 0);
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
}

function loadMore() {
  if (!hasMore.value || loading.value) return;
  page.value++;
  loadList();
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
.ledger-page { min-height: 100vh; background: $ccnc-bg-page; }
.nav-bar { display: flex; align-items: center; justify-content: center; min-height: 88rpx; padding-top: env(safe-area-inset-top); background: $ccnc-bg-card; position: relative; }
.nav-bar__back { position: absolute; left: $ccnc-page-padding; padding: 16rpx; }
.nav-bar__title { font-size: 34rpx; font-weight: 600; }
.scroll-content { height: calc(100vh - 88rpx - env(safe-area-inset-top)); padding: $ccnc-page-padding; }
.log-card { display: flex; justify-content: space-between; background: $ccnc-bg-card; border-radius: $ccnc-radius-lg; padding: 28rpx; margin-bottom: 20rpx; box-shadow: $ccnc-shadow-card; }
.log-card__title { display: block; font-size: 28rpx; color: $ccnc-text-primary; }
.log-card__time { display: block; font-size: 24rpx; color: $ccnc-text-placeholder; margin-top: 8rpx; }
.log-card__right { text-align: right; }
.log-card__amount { display: block; font-size: 32rpx; font-weight: 600; color: $ccnc-danger; &--plus { color: $ccnc-success; } }
.log-card__balance { display: block; font-size: 24rpx; color: $ccnc-text-placeholder; margin-top: 8rpx; }
.load-tip { padding: 32rpx; text-align: center; color: $ccnc-text-placeholder; font-size: 26rpx; }
</style>
