<template>
  <view class="page-nav-bar" :style="barStyle">
    <view class="page-nav-bar__back" @tap.stop="handleBack">
      <wd-icon name="arrow-left" size="22" :color="iconColor" />
    </view>
    <text class="page-nav-bar__title" :style="{ color: titleColor }">{{ title }}</text>
  </view>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { safeNavigateBack } from "@/utils/navigate";

const props = defineProps({
  title: {
    type: String,
    default: "",
  },
  /** 无上一页时的兜底路径 */
  fallback: {
    type: String,
    default: "/pages/index/index",
  },
  background: {
    type: String,
    default: "#ffffff",
  },
  titleColor: {
    type: String,
    default: "#333333",
  },
  iconColor: {
    type: String,
    default: "#333333",
  },
  /** 是否显示底部分隔阴影 */
  shadow: {
    type: Boolean,
    default: true,
  },
});

const barStyle = computed(() => ({
  background: props.background,
  boxShadow: props.shadow ? "0 2rpx 8rpx rgba(0, 0, 0, 0.04)" : "none",
}));

function handleBack() {
  safeNavigateBack(props.fallback);
}
</script>

<style lang="scss" scoped>
.page-nav-bar {
  position: relative;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  min-height: 88rpx;
  padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top);
}

.page-nav-bar__back {
  position: absolute;
  left: $ccnc-page-padding;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 64rpx;
  min-height: 64rpx;
  padding: 16rpx;
}

.page-nav-bar__title {
  position: relative;
  z-index: 1;
  max-width: 60%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 34rpx;
  font-weight: 600;
  color: $ccnc-text-primary;
  pointer-events: none;
}
</style>
