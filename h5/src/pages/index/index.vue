<template>
  <view class="index-page">
    <!-- 主内容区 -->
    <scroll-view scroll-y class="scroll-content" :show-scrollbar="false">
      <!-- Banner 轮播 -->
      <view v-if="bannerList.length > 0" class="banner-swiper">
        <swiper
          class="banner-swiper__inner"
          :indicator-dots="bannerList.length > 1"
          :autoplay="true"
          :interval="4000"
          :circular="true"
          indicator-active-color="#1989fa"
        >
          <swiper-item v-for="b in bannerList" :key="b.id" @click="onBannerClick(b)">
            <image class="banner-swiper__img" :src="b.image_url" mode="aspectFill" />
          </swiper-item>
        </swiper>
      </view>
      <!-- Banner 1: 默认展示（无数据时） -->
      <view v-else class="banner banner-summit">
        <view class="banner-summit__content">
          <text class="banner-summit__title">2022 新能源峰会</text>
          <text class="banner-summit__subtitle">携手为保护地球投资</text>
          <text class="banner-summit__en">INVEST IN OUR PLANET</text>
        </view>
        <view class="banner-summit__decoration">
          <view class="wind-turbines"></view>
          <view class="solar-panels"></view>
        </view>
      </view>

      <!-- 通知公告 / 最新资讯 -->
      <view class="notice-bar" @click="onNoticeClick">
        <view class="notice-bar__label">通知公告</view>
        <view class="notice-bar__content">
          <text class="notice-bar__text">{{ noticeText }}</text>
        </view>
        <wd-icon name="chevron-right" size="14" color="#999" />
      </view>

      <!-- 快捷入口 -->
      <view class="quick-entry">
        <view class="quick-entry__item" @click="goCarbon">
          <wd-icon name="chart-bar" size="32" color="#1989fa" />
          <text>碳期权投资</text>
        </view>
        <view class="quick-entry__item" @click="goPromo">
          <wd-icon name="usergroup-add" size="32" color="#07c160" />
          <text>推广中心</text>
        </view>
        <view class="quick-entry__item" @click="goWallet">
          <wd-icon name="wallet" size="32" color="#ee0a24" />
          <text>我的钱包</text>
        </view>
      </view>

      <!-- 功能网格 -->
      <view class="feature-grid">
        <wd-grid :column="4" :border="false" :gutter="0" clickable>
          <wd-grid-item
            v-for="item in featureList"
            :key="item.name"
            :icon="item.icon"
            :text="item.name"
            :icon-color="item.color"
            @itemclick="onFeatureClick(item)"
          />
        </wd-grid>
      </view>

      <!-- Banner 2: 全民反诈 -->
      <view class="banner banner-antifraud">
        <view class="banner-antifraud__shield"></view>
        <text class="banner-antifraud__title">全民反诈你我同行</text>
        <view class="banner-antifraud__tip">
          <text>畅游网络要小心，诈骗手段在翻新</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { fetchBanners, fetchArticles } from "@/api/content";
import type { BannerItem, ArticleItem } from "@/api/content";
import { getListData } from "@/utils/api-helper";
import { useUserStore } from "@/store/user";

const userStore = useUserStore();

const bannerList = ref<BannerItem[]>([]);
const firstArticle = ref<ArticleItem | null>(null);

const noticeText = computed(
  () => firstArticle.value?.title || "考克利尔竞立助力全球碳中和发展"
);

const featureList = [
  { name: "碳中和简介", icon: "file", color: "#1989fa", path: "/pages/content/index?type=intro" },
  { name: "新手攻略", icon: "books", color: "#1989fa", path: "/pages/content/index?type=guide" },
  { name: "关于我们", icon: "info-circle", color: "#00d4ff", path: "/pages/content/index?type=about" },
  { name: "用户协议", icon: "file", color: "#1989fa", path: "/pages/content/index?type=agreement" },
  { name: "客服", icon: "service", color: "#ee0a24", path: "/pages/content/service" },
];

onLoad(() => {
  loadBanners();
  loadArticles();
});

async function loadBanners() {
  try {
    const res = await fetchBanners();
    bannerList.value = getListData<BannerItem>(res);
  } catch (e) {
    console.warn("loadBanners error:", e);
  }
}

async function loadArticles() {
  try {
    const res = await fetchArticles({ page: 1, page_size: 1 });
    const list = getListData<ArticleItem>(res);
    firstArticle.value = list[0] ?? null;
  } catch (e) {
    console.warn("loadArticles error:", e);
  }
}

function onBannerClick(b: BannerItem) {
  if (!b.link_url) return;
  const link = b.link_url.trim();
  if (link.startsWith("/pages/")) {
    uni.navigateTo({ url: link });
    return;
  }
  if (link.startsWith("http://") || link.startsWith("https://")) {
    // #ifdef H5
    window.open(link);
    // #endif
    // #ifndef H5
    uni.navigateTo({ url: "/pages/consultation/index" });
    // #endif
    return;
  }
  uni.navigateTo({ url: "/pages/consultation/index" });
}

function onNoticeClick() {
  if (firstArticle.value) {
    uni.navigateTo({ url: `/pages/consultation/detail?id=${firstArticle.value.id}` });
  } else {
    uni.navigateTo({ url: "/pages/consultation/index" });
  }
}

function onFeatureClick(item: { name: string; path?: string }) {
  if (item.path) {
    uni.navigateTo({ url: item.path });
    return;
  }
  uni.showToast({ title: `${item.name}功能开发中`, icon: "none" });
}

function goCarbon() {
  uni.switchTab({ url: "/pages/carbon/index" });
}

function goPromo() {
  if (!userStore.checkLogin()) {
    uni.showToast({ title: "请先登录", icon: "none" });
    setTimeout(() => {
      uni.navigateTo({ url: "/pages/login/index?redirect=" + encodeURIComponent("/pages/promo/index") });
    }, 500);
    return;
  }
  uni.navigateTo({ url: "/pages/promo/index" });
}

function goWallet() {
  if (!userStore.checkLogin()) {
    uni.showToast({ title: "请先登录", icon: "none" });
    setTimeout(() => {
      uni.navigateTo({ url: "/pages/login/index?redirect=" + encodeURIComponent("/pages/wallet/index") });
    }, 500);
    return;
  }
  uni.navigateTo({ url: "/pages/wallet/index" });
}
</script>

<style lang="scss" scoped>
/* tab 页：用 flex 占满视口，避免 100vh 再减 tab 与 padding 双重扣减导致重叠 */
.index-page {
  height: 100vh;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #f6f6f7;
  padding-top: 44rpx;
  padding-bottom: calc(100rpx + env(safe-area-inset-bottom));
}

.scroll-content {
  flex: 1;
  height: 0;
  min-height: 0;
}

/* Banner 轮播 */
.banner-swiper {
  margin: 24rpx;
  border-radius: 16rpx;
  overflow: hidden;
  height: 280rpx;
}

.banner-swiper__inner {
  height: 100%;
}

.banner-swiper__img {
  width: 100%;
  height: 100%;
}

/* Banner 1: 新能源峰会 */
.banner {
  margin: 24rpx;
  border-radius: 16rpx;
  overflow: hidden;
}

.banner-summit {
  height: 280rpx;
  background: linear-gradient(
    135deg,
    #4a90d9 0%,
    #5ba3e8 30%,
    #7eb8e8 60%,
    #a8d4f0 100%
  );
  position: relative;
  padding: 40rpx 32rpx;

  &__content {
    position: relative;
    z-index: 2;
  }

  &__title {
    display: block;
    font-size: 40rpx;
    font-weight: 700;
    color: #fff;
    text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
    margin-bottom: 12rpx;
  }

  &__subtitle {
    display: block;
    font-size: 24rpx;
    color: rgba(255, 255, 255, 0.95);
    margin-bottom: 4rpx;
  }

  &__en {
    display: block;
    font-size: 20rpx;
    color: rgba(255, 255, 255, 0.85);
    letter-spacing: 2rpx;
  }

  &__decoration {
    position: absolute;
    right: 0;
    bottom: 0;
    width: 50%;
    height: 100%;
    z-index: 1;
  }

  .wind-turbines,
  .solar-panels {
    position: absolute;
    right: 20rpx;
    bottom: 20rpx;
    width: 120rpx;
    height: 80rpx;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 8rpx;
  }
}

/* 通知公告 */
.notice-bar {
  display: flex;
  align-items: center;
  margin: 0 24rpx 24rpx;
  padding: 24rpx 28rpx;
  background: #fff;
  border-radius: 12rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);

  &__label {
    padding: 6rpx 16rpx;
    background: #1989fa;
    color: #fff;
    font-size: 24rpx;
    border-radius: 6rpx;
    margin-right: 20rpx;
    flex-shrink: 0;
  }

  &__content {
    flex: 1;
    overflow: hidden;
  }

  &__text {
    font-size: 28rpx;
    color: #333;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

/* 快捷入口 */
.quick-entry {
  display: flex;
  margin: 0 24rpx 24rpx;
  gap: 16rpx;
}

.quick-entry__item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  padding: 28rpx 16rpx;
  background: #fff;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
  font-size: 24rpx;
  color: #333;
}

/* 功能网格 */
.feature-grid {
  margin: 0 24rpx 24rpx;
  padding: 32rpx;
  background: #fff;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);

  :deep(.wd-grid-item__content) {
    padding: 24rpx 0;
  }

  :deep(.wd-grid-item__wrapper) {
    width: 88rpx !important;
    height: 88rpx !important;
    margin: 0 auto 16rpx;
    background: #f7f8fa;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
  }

  :deep(.wd-grid-item__text) {
    font-size: 24rpx;
    color: #333;
  }
}

/* Banner 2: 全民反诈 */
.banner-antifraud {
  height: 260rpx;
  background: linear-gradient(
    180deg,
    #1a3a5c 0%,
    #2a4a6c 50%,
    #1e3d5e 100%
  );
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40rpx;

  &__shield {
    width: 80rpx;
    height: 80rpx;
    margin-bottom: 20rpx;
    border: 4rpx solid rgba(25, 137, 250, 0.6);
    border-radius: 12rpx;
    background: rgba(25, 137, 250, 0.15);
    box-shadow: 0 0 20rpx rgba(25, 137, 250, 0.3);
  }

  &__title {
    font-size: 36rpx;
    font-weight: 700;
    color: #fff;
    margin-bottom: 16rpx;
  }

  &__tip {
    padding: 12rpx 24rpx;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 8rpx;

    text {
      font-size: 22rpx;
      color: rgba(255, 255, 255, 0.9);
    }
  }
}
</style>
