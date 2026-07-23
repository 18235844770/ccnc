<template>
  <view class="consultation-page">
    <page-nav-bar title="碳中和资讯" fallback="/pages/index/index" />

    <scroll-view
      scroll-y
      class="scroll-content"
      :show-scrollbar="false"
      @scrolltolower="loadMore"
    >
      <view
        v-for="item in articleList"
        :key="item.id"
        class="article-card"
        @click="onArticleClick(item)"
      >
        <view class="article-card__content">
          <text class="article-card__title">{{ item.title }}</text>
          <text class="article-card__desc">{{ item.description || item.title }}</text>
          <view class="article-card__meta">
            <view v-if="item.tags" class="article-card__tag">{{ item.tags.split(",")[0] }}</view>
            <text class="article-card__time">{{ formatTime(item.publish_time) }}</text>
          </view>
        </view>
        <image
          class="article-card__thumb"
          :src="item.cover_image || 'https://images.unsplash.com/photo-1569163138759-0c6b83d030f4?w=400&h=300&fit=crop'"
          mode="aspectFill"
        />
      </view>
      <view v-if="loading" class="load-more">
        <wd-loading type="circular" size="24" />
      </view>
      <view v-else-if="!hasMore && articleList.length > 0" class="load-more">
        <text class="load-more__text">没有更多了</text>
      </view>
      <view v-else-if="!loading && articleList.length === 0 && !loadError" class="empty-wrap">
        <text class="empty-text">暂无资讯</text>
      </view>
      <view v-else-if="loadError" class="empty-wrap">
        <text class="empty-text">加载失败</text>
        <wd-button type="primary" size="small" custom-class="retry-btn" @click="onRetry">重试</wd-button>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { fetchArticles } from "@/api/content";
import type { ArticleItem } from "@/api/content";
import { getPageData } from "@/utils/api-helper";

const articleList = ref<ArticleItem[]>([]);
const loading = ref(false);
const page = ref(1);
const pageSize = 20;
const total = ref(0);
const hasMore = ref(true);
const loadError = ref(false);

function formatTime(str?: string) {
  if (!str) return "";
  const d = new Date(str);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 60000) return "刚刚";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
  return d.toLocaleDateString("zh-CN", { month: "2-digit", day: "2-digit" });
}

onLoad(() => {
  loadList();
});

async function loadList() {
  if (loading.value) return;
  loading.value = true;
  loadError.value = false;
  try {
    const res = await fetchArticles({ page: page.value, page_size: pageSize });
    const { list, total: t } = getPageData<ArticleItem>(res);
    total.value = t;
    if (page.value === 1) articleList.value = list;
    else articleList.value = [...articleList.value, ...list];
    hasMore.value = articleList.value.length < total.value;
  } catch (e) {
    console.error("loadArticles error:", e);
    loadError.value = page.value === 1;
  } finally {
    loading.value = false;
  }
}

function onRetry() {
  page.value = 1;
  hasMore.value = true;
  loadList();
}

function loadMore() {
  if (!hasMore.value || loading.value) return;
  page.value++;
  loadList();
}

function onBack() {
  uni.navigateBack();
}

function onArticleClick(item: ArticleItem) {
  uni.navigateTo({ url: `/pages/consultation/detail?id=${item.id}` });
}
</script>

<style lang="scss" scoped>
.consultation-page {
  min-height: 100vh;
  background: #f6f6f7;
  padding-bottom: env(safe-area-inset-bottom);
}

/* 导航栏 */
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
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-bar__title {
  font-size: 34rpx;
  font-weight: 600;
  color: #333;
}

/* 内容区 */
.scroll-content {
  height: calc(100vh - 88rpx - env(safe-area-inset-top) - env(safe-area-inset-bottom));
  padding: 24rpx;
}

/* 资讯卡片 */
.article-card {
  display: flex;
  align-items: stretch;
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
}

.article-card__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  margin-right: 24rpx;
}

.article-card__title {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  line-height: 1.5;
  margin-bottom: 12rpx;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-card__desc {
  font-size: 24rpx;
  color: #999;
  line-height: 1.4;
  margin-bottom: 16rpx;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-card__meta {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-top: auto;
}

.article-card__tag {
  padding: 6rpx 16rpx;
  background: #1989fa;
  color: #fff;
  font-size: 22rpx;
  border-radius: 24rpx;
}

.article-card__time {
  font-size: 22rpx;
  color: #999;
}

.article-card__thumb {
  width: 200rpx;
  height: 150rpx;
  border-radius: 12rpx;
  flex-shrink: 0;
  background: #f0f0f0;
}

.load-more {
  padding: 32rpx;
  text-align: center;
}

.load-more__text {
  font-size: 26rpx;
  color: #999;
}

.empty-wrap {
  padding: 120rpx;
  text-align: center;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}

.retry-btn {
  margin-top: 24rpx;
}
</style>
