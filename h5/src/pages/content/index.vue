<template>
  <view class="content-page">
    <page-nav-bar :title="pageTitle" fallback="/pages/index/index" />
    <scroll-view scroll-y class="scroll-content" :show-scrollbar="false">
      <view class="content-card">
        <view v-for="(sec, idx) in sections" :key="idx" class="section">
          <text v-if="sec.heading" class="section__heading">{{ sec.heading }}</text>
          <text v-for="(p, pIdx) in sec.paragraphs" :key="pIdx" class="section__p">{{ p }}</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { ref } from "vue";
import {
  STATIC_CONTENTS,
  type ContentType,
  type ContentSection,
} from "@/constants/static-content";

const type = ref<ContentType>("intro");

onLoad((options) => {
  const t = String(options?.type || "intro") as ContentType;
  if (t in STATIC_CONTENTS) type.value = t;
});

const pageTitle = computed(() => STATIC_CONTENTS[type.value].title);
const sections = computed<ContentSection[]>(() => STATIC_CONTENTS[type.value].sections);
</script>

<style lang="scss" scoped>
.content-page {
  min-height: 100vh;
  background: $ccnc-bg-page;
  padding-bottom: env(safe-area-inset-bottom);
}

.scroll-content {
  height: calc(100vh - 88rpx - env(safe-area-inset-top) - env(safe-area-inset-bottom));
  padding: $ccnc-page-padding;
}

.content-card {
  background: $ccnc-bg-card;
  border-radius: $ccnc-radius-lg;
  padding: 40rpx 32rpx;
  box-shadow: $ccnc-shadow-card;
}

.section {
  margin-bottom: 36rpx;

  &:last-child {
    margin-bottom: 0;
  }

  &__heading {
    display: block;
    font-size: 32rpx;
    font-weight: 600;
    color: $ccnc-text-primary;
    margin-bottom: 16rpx;
  }

  &__p {
    display: block;
    font-size: 28rpx;
    line-height: 1.8;
    color: $ccnc-text-secondary;
    margin-bottom: 12rpx;

    &:last-child {
      margin-bottom: 0;
    }
  }
}
</style>
