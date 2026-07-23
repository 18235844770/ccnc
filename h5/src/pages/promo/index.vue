<template>
  <view class="promo-page">
    <page-nav-bar title="推广中心" fallback="/pages/user/index" />

    <scroll-view scroll-y class="scroll-content" :show-scrollbar="false">
      <view v-if="summary" class="hero-card" :class="{ 'hero-card--disabled': summary.link_status === 'DISABLED' }">
        <text class="hero-card__label">我的邀请码</text>
        <text class="hero-card__code">{{ summary.invite_code }}</text>
        <text v-if="summary.link_status === 'DISABLED'" class="hero-card__warn">已达最大推广层级，链接已停用</text>
        <view v-else class="hero-card__actions">
          <wd-button size="small" type="primary" @click="onCopyCode">复制邀请码</wd-button>
          <wd-button size="small" plain @click="onCopyLink">复制推广链接</wd-button>
        </view>
      </view>

      <view v-if="summary?.share_url && summary.link_status !== 'DISABLED'" class="qr-card">
        <text class="qr-card__title">扫码注册</text>
        <image v-if="qrDataUrl" class="qr-card__img" :src="qrDataUrl" mode="aspectFit" />
        <view v-else class="qr-card__loading"><wd-loading type="circular" size="24" /></view>
        <text class="qr-card__tip">好友扫码打开注册页，自动绑定您的推广关系</text>
        <wd-button size="small" plain :disabled="!qrDataUrl" @click="onSaveQr">保存二维码</wd-button>
      </view>

      <view v-if="summary?.invite_unlock" class="unlock-card">
        <view class="unlock-card__head">
          <text class="unlock-card__title">邀请奖励解锁</text>
          <text class="unlock-card__percent">{{ summary.invite_unlock.unlock_percent }}%</text>
        </view>
        <view class="unlock-bar">
          <view class="unlock-bar__fill" :style="{ width: summary.invite_unlock.unlock_percent + '%' }" />
        </view>
        <text class="unlock-card__tip">
          有效邀请 {{ summary.invite_unlock.valid_count }} 人（首投计为有效邀请，3人解锁100%直推奖励）
        </text>
      </view>

      <view v-if="summary" class="stats-grid">
        <view class="stats-item">
          <text class="stats-item__value">{{ summary.direct_count }}</text>
          <text class="stats-item__label">直推人数</text>
        </view>
        <view class="stats-item">
          <text class="stats-item__value">{{ summary.team_count }}</text>
          <text class="stats-item__label">团队人数</text>
        </view>
        <view class="stats-item">
          <text class="stats-item__value">{{ summary.promo_level }}</text>
          <text class="stats-item__label">推广层级</text>
        </view>
        <view class="stats-item">
          <text class="stats-item__value">{{ formatAmount(summary.commission_total) }}</text>
          <text class="stats-item__label">累计收益(元)</text>
        </view>
      </view>

      <view class="section-card">
        <view class="section-card__head">
          <text class="section-card__title">我的团队</text>
          <view class="level-tabs">
            <text
              v-for="lv in levelTabs"
              :key="lv"
              class="level-tab"
              :class="{ 'level-tab--active': activeLevel === lv }"
              @click="switchLevel(lv)"
            >{{ lv }}级</text>
          </view>
        </view>
        <view v-for="item in downlines" :key="item.user_id" class="downline-item">
          <view>
            <text class="downline-item__name">{{ item.username }}</text>
            <text class="downline-item__meta">加入 {{ formatDate(item.joined_at) }}</text>
          </view>
          <view class="downline-item__right">
            <text class="downline-item__amount">投资 ¥{{ formatAmount(item.invest_amount) }}</text>
            <text class="downline-item__meta">{{ item.order_count }} 笔订单</text>
          </view>
        </view>
        <view v-if="!downlines.length && !downlineLoading" class="empty-tip">该层级暂无下线</view>
        <view v-if="downlineLoading" class="state-wrap"><wd-loading type="circular" /></view>
      </view>

      <view class="tips-card">
        <view class="tips-card__head">
          <text class="tips-card__title">推广说明</text>
          <text class="tips-card__link" @click="goCommission">收益明细</text>
        </view>
        <text class="tips-card__text">1. 分享推广链接，好友注册后自动绑定推广关系</text>
        <text class="tips-card__text">2. 下线首次投资后计入有效邀请，解锁直推奖励比例</text>
        <text class="tips-card__text">3. 请勿进行虚假推广或误导性宣传</text>
      </view>

      <view v-if="loading" class="state-wrap">
        <wd-loading type="circular" />
      </view>
      <view v-else-if="loadError" class="state-wrap">
        <text class="state-text">加载失败</text>
        <wd-button size="small" type="primary" @click="loadSummary">重试</wd-button>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { fetchPromoSummary, fetchPromoDownlines } from "@/api/promo";
import type { PromoSummary, DownlineItem } from "@/api/promo";
import { useUserStore } from "@/store/user";
import { formatAmount } from "@/utils/format";
import { buildQrDataUrl, downloadQrDataUrl } from "@/utils/qrcode";

const userStore = useUserStore();

const summary = ref<PromoSummary | null>(null);
const qrDataUrl = ref("");
const downlines = ref<DownlineItem[]>([]);
const loading = ref(false);
const loadError = ref(false);
const downlineLoading = ref(false);
const activeLevel = ref(1);
const levelTabs = [1, 2, 3];

onLoad(() => {
  if (!userStore.checkLogin()) {
    uni.showToast({ title: "请先登录", icon: "none" });
    setTimeout(() => {
      uni.navigateTo({ url: "/pages/login/index?redirect=" + encodeURIComponent("/pages/promo/index") });
    }, 500);
    return;
  }
  loadSummary();
  loadDownlines(1);
});

async function loadSummary() {
  loading.value = true;
  loadError.value = false;
  try {
    const res = await fetchPromoSummary();
    summary.value = (res as any)?.data ?? null;
    if (!summary.value) loadError.value = true;
    else refreshQr();
  } catch (e) {
    console.error("loadPromoSummary error:", e);
    loadError.value = true;
  } finally {
    loading.value = false;
  }
}

async function loadDownlines(level: number) {
  downlineLoading.value = true;
  try {
    const res = await fetchPromoDownlines({ level, page: 1, page_size: 20 });
    downlines.value = (res as any)?.data?.records ?? [];
  } catch (e) {
    console.error("loadDownlines error:", e);
    downlines.value = [];
  } finally {
    downlineLoading.value = false;
  }
}

function switchLevel(level: number) {
  activeLevel.value = level;
  loadDownlines(level);
}

function formatDate(str?: string) {
  if (!str) return "";
  return new Date(str).toLocaleDateString("zh-CN");
}

function onBack() {
  uni.navigateBack({ fail: () => uni.switchTab({ url: "/pages/user/index" }) });
}

function onCopyCode() {
  if (!summary.value?.invite_code) return;
  uni.setClipboardData({
    data: summary.value.invite_code,
    success: () => uni.showToast({ title: "邀请码已复制", icon: "success" }),
  });
}

function onCopyLink() {
  if (!summary.value?.share_url) return;
  uni.setClipboardData({
    data: summary.value.share_url,
    success: () => uni.showToast({ title: "链接已复制", icon: "success" }),
  });
}

function goCommission() {
  uni.navigateTo({ url: "/pages/promo/commission" });
}

function refreshQr() {
  qrDataUrl.value = "";
  const url = summary.value?.share_url;
  if (!url || summary.value?.link_status === "DISABLED") return;
  try {
    qrDataUrl.value = buildQrDataUrl(url);
  } catch (e) {
    console.warn("buildQr error:", e);
  }
}

function onSaveQr() {
  if (!qrDataUrl.value) return;
  downloadQrDataUrl(qrDataUrl.value);
  uni.showToast({ title: "二维码已保存", icon: "success" });
}
</script>

<style lang="scss" scoped>
.promo-page {
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
  height: calc(100vh - 88rpx - env(safe-area-inset-top));
  padding: $ccnc-page-padding;
}

.hero-card {
  background: linear-gradient(135deg, #4a90d9 0%, #5ba3e8 50%, #7eb8e8 100%);
  border-radius: $ccnc-radius-lg;
  padding: 40rpx 32rpx;
  margin-bottom: $ccnc-section-gap;
  color: #fff;

  &--disabled {
    opacity: 0.75;
  }
}

.hero-card__label {
  display: block;
  font-size: 26rpx;
  opacity: 0.9;
  margin-bottom: 12rpx;
}

.hero-card__code {
  display: block;
  font-size: 44rpx;
  font-weight: 700;
  letter-spacing: 4rpx;
  margin-bottom: 32rpx;
}

.hero-card__warn {
  font-size: 24rpx;
  opacity: 0.9;
}

.hero-card__actions {
  display: flex;
  gap: 20rpx;
}

.qr-card {
  background: $ccnc-bg-card;
  border-radius: $ccnc-radius-lg;
  padding: 32rpx;
  margin-bottom: $ccnc-section-gap;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: $ccnc-shadow-card;
}

.qr-card__title {
  font-size: 30rpx;
  font-weight: 600;
  margin-bottom: 24rpx;
  color: $ccnc-text-primary;
}

.qr-card__img {
  width: 320rpx;
  height: 320rpx;
  margin-bottom: 16rpx;
}

.qr-card__loading {
  height: 320rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qr-card__tip {
  font-size: 24rpx;
  color: $ccnc-text-secondary;
  text-align: center;
  margin-bottom: 20rpx;
  line-height: 1.5;
}

.unlock-card {
  background: $ccnc-bg-card;
  border-radius: $ccnc-radius-lg;
  padding: 28rpx 32rpx;
  margin-bottom: $ccnc-section-gap;
  box-shadow: $ccnc-shadow-card;
}

.unlock-card__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.unlock-card__title {
  font-size: 28rpx;
  font-weight: 600;
  color: $ccnc-text-primary;
}

.unlock-card__percent {
  font-size: 32rpx;
  font-weight: 700;
  color: $ccnc-primary;
}

.unlock-bar {
  height: 12rpx;
  background: #eef2f6;
  border-radius: 6rpx;
  overflow: hidden;
  margin-bottom: 12rpx;
}

.unlock-bar__fill {
  height: 100%;
  background: linear-gradient(90deg, #4a90d9, #07c160);
  border-radius: 6rpx;
}

.unlock-card__tip {
  font-size: 22rpx;
  color: $ccnc-text-secondary;
  line-height: 1.5;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: $ccnc-section-gap;
  margin-bottom: $ccnc-section-gap;
}

.stats-item {
  background: $ccnc-bg-card;
  border-radius: $ccnc-radius-lg;
  padding: 32rpx 24rpx;
  text-align: center;
  box-shadow: $ccnc-shadow-card;
}

.stats-item__value {
  display: block;
  font-size: 36rpx;
  font-weight: 700;
  color: $ccnc-primary;
  margin-bottom: 8rpx;
}

.stats-item__label {
  font-size: 24rpx;
  color: $ccnc-text-secondary;
}

.section-card {
  background: $ccnc-bg-card;
  border-radius: $ccnc-radius-lg;
  padding: 28rpx 32rpx;
  margin-bottom: $ccnc-section-gap;
  box-shadow: $ccnc-shadow-card;
}

.section-card__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.section-card__title {
  font-size: 30rpx;
  font-weight: 600;
  color: $ccnc-text-primary;
}

.level-tabs {
  display: flex;
  gap: 12rpx;
}

.level-tab {
  font-size: 24rpx;
  color: $ccnc-text-secondary;
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  background: #f5f6f7;

  &--active {
    color: #fff;
    background: $ccnc-primary;
  }
}

.downline-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
}

.downline-item__name {
  display: block;
  font-size: 28rpx;
  color: $ccnc-text-primary;
  margin-bottom: 6rpx;
}

.downline-item__amount {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: $ccnc-primary;
  text-align: right;
  margin-bottom: 6rpx;
}

.downline-item__meta {
  font-size: 22rpx;
  color: $ccnc-text-secondary;
}

.downline-item__right {
  text-align: right;
}

.empty-tip {
  text-align: center;
  font-size: 26rpx;
  color: $ccnc-text-placeholder;
  padding: 32rpx 0;
}

.tips-card {
  background: $ccnc-bg-card;
  border-radius: $ccnc-radius-lg;
  padding: 32rpx;
  box-shadow: $ccnc-shadow-card;
}

.tips-card__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.tips-card__link {
  font-size: 26rpx;
  color: $ccnc-primary;
}

.tips-card__title {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: $ccnc-text-primary;
  margin-bottom: 20rpx;
}

.tips-card__text {
  display: block;
  font-size: 26rpx;
  color: $ccnc-text-secondary;
  line-height: 1.7;
  margin-bottom: 12rpx;
}

.state-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48rpx;
  gap: 24rpx;
}

.state-text {
  font-size: 28rpx;
  color: $ccnc-text-placeholder;
}
</style>
