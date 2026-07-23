<template>
  <view class="detail-page">
    <page-nav-bar title="资讯详情" fallback="/pages/consultation/index" />

    <scroll-view v-if="article" scroll-y class="scroll-content" :show-scrollbar="false">
      <view class="article-header">
        <text class="article-title">{{ article.title }}</text>
        <view class="article-meta">
          <text class="article-time">{{ formatTime(article.publish_time) }}</text>
          <text v-if="article.view_count" class="article-views">阅读 {{ article.view_count }}</text>
        </view>
      </view>
      <view v-if="article.cover_image" class="article-cover">
        <image :src="article.cover_image" mode="widthFix" />
      </view>
      <view class="article-body">
        <rich-text :nodes="article.content || ''" />
      </view>
    </scroll-view>

    <view v-else-if="loading" class="loading-wrap">
      <wd-loading type="circular" />
      <text class="loading-text">加载中...</text>
    </view>
    <view v-else-if="loadError" class="empty-wrap">
      <text class="empty-text">加载失败</text>
      <wd-button type="primary" size="small" custom-class="retry-btn" @click="onRetry">重试</wd-button>
    </view>
    <view v-else class="empty-wrap">
      <text class="empty-text">内容不存在</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { fetchArticleDetail } from "@/api/content";
import type { ArticleDetail } from "@/api/content";

const article = ref<ArticleDetail | null>(null);
const loading = ref(true);
const loadError = ref(false);

function formatTime(str?: string) {
  if (!str) return "";
  const d = new Date(str);
  return d.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const articleId = ref("");

onLoad((options) => {
  articleId.value = String(options?.id || "");
  if (articleId.value) loadDetail(articleId.value);
  else loading.value = false;
});

async function loadDetail(id: string) {
  loading.value = true;
  loadError.value = false;
  try {
    const res = await fetchArticleDetail(id);
    article.value = (res as any)?.data ?? res ?? null;
    if (!article.value) loadError.value = true;
  } catch (e) {
    console.error("loadArticleDetail error:", e);
    article.value = null;
    loadError.value = true;
  } finally {
    loading.value = false;
  }
}

function onRetry() {
  if (articleId.value) loadDetail(articleId.value);
}

function onBack() {
  uni.navigateBack();
}
</script>

<style lang="scss" scoped>
.detail-page {
  min-height: 100vh;
  background: #f6f6f7;
  padding-bottom: env(safe-area-inset-bottom);
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 88rpx;
  padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top);
  background: #fff;
  position: relative;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
}

.nav-bar__back {
  position: absolute;
  left: 24rpx;
  padding: 16rpx;
}

.nav-bar__title {
  font-size: 34rpx;
  font-weight: 600;
  color: #333;
}

.scroll-content {
  height: calc(100vh - 88rpx - env(safe-area-inset-top) - env(safe-area-inset-bottom));
  padding: 24rpx;
}

.article-header {
  background: #fff;
  padding: 32rpx;
  border-radius: 16rpx;
  margin-bottom: 24rpx;
}

.article-title {
  display: block;
  font-size: 36rpx;
  font-weight: 700;
  color: #333;
  line-height: 1.5;
  margin-bottom: 20rpx;
}

.article-meta {
  display: flex;
  gap: 24rpx;
  font-size: 24rpx;
  color: #999;
}

.article-cover {
  border-radius: 12rpx;
  overflow: hidden;
  margin-bottom: 24rpx;
}

.article-cover image {
  width: 100%;
  display: block;
}

.article-body {
  background: #fff;
  padding: 32rpx;
  border-radius: 16rpx;
  font-size: 30rpx;
  line-height: 1.8;
  color: #333;
}

.loading-wrap,
.empty-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx;
}

.loading-text,
.empty-text {
  margin-top: 24rpx;
  font-size: 28rpx;
  color: #999;
}

.retry-btn {
  margin-top: 24rpx;
}
</style>
