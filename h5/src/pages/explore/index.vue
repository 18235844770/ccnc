<template>
  <view class="explore-page">
    <!-- 导航栏 -->
    <view class="nav-header">
      <text class="nav-header__title">九大碳交易所</text>
    </view>

    <!-- 交易所入口列表 -->
    <scroll-view scroll-y class="scroll-content" :show-scrollbar="false">
      <view
        v-for="item in exchangeList"
        :key="item.id"
        class="content-card"
        @click="onCardClick(item)"
      >
        <image class="content-card__cover" :src="item.cover" mode="aspectFill" />
        <view class="content-card__mask"></view>
        <view class="content-card__content">
          <text class="content-card__title">{{ item.title }}</text>
          <view class="content-card__meta">
            <text class="content-card__region">{{ item.region }}</text>
            <text class="content-card__action">访问官网 ›</text>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
interface ExchangeItem {
  id: string;
  title: string;
  region: string;
  url: string;
  cover: string;
}

const exchangeList: ExchangeItem[] = [
  {
    id: "beijing",
    title: "北京绿色交易所",
    region: "北京",
    url: "https://www.cbeex.com.cn",
    cover: "/static/explore/beijing.jpg",
  },
  {
    id: "tianjin",
    title: "天津排放权交易所",
    region: "天津",
    url: "http://www.chinatcx.com.cn",
    cover: "/static/explore/tianjin.jpg",
  },
  {
    id: "shanghai",
    title: "上海环境能源交易所",
    region: "上海 · 全国碳市场",
    url: "https://www.cneeex.com",
    cover: "/static/explore/shanghai.jpg",
  },
  {
    id: "chongqing",
    title: "重庆碳排放权交易中心",
    region: "重庆",
    url: "https://tpf.cqggzy.com",
    cover: "/static/explore/chongqing.jpg",
  },
  {
    id: "hubei",
    title: "湖北碳排放权交易中心",
    region: "湖北",
    url: "https://www.hbets.cn",
    cover: "/static/explore/hubei.jpg",
  },
  {
    id: "guangzhou",
    title: "广州碳排放权交易所",
    region: "广东",
    url: "https://www.cnemission.com",
    cover: "/static/explore/guangzhou.jpg",
  },
  {
    id: "shenzhen",
    title: "深圳排放权交易所",
    region: "深圳",
    url: "https://www.szets.com",
    cover: "/static/explore/shenzhen.jpg",
  },
  {
    id: "fujian",
    title: "海峡股权交易中心",
    region: "福建",
    url: "https://www.hxee.com.cn",
    cover: "/static/explore/fujian.jpg",
  },
  {
    id: "sichuan",
    title: "四川联合环境交易所",
    region: "四川",
    url: "https://www.sceex.com.cn",
    cover: "/static/explore/sichuan.jpg",
  },
];

function onCardClick(item: ExchangeItem) {
  // #ifdef H5
  window.open(item.url, "_blank");
  // #endif
  // #ifndef H5
  uni.setClipboardData({
    data: item.url,
    success: () => {
      uni.showToast({ title: "官网链接已复制", icon: "none" });
    },
  });
  // #endif
}
</script>

<style lang="scss" scoped>
.explore-page {
  height: 100vh;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #e8f4ff;
  padding-bottom: calc(100rpx + env(safe-area-inset-bottom));
}

/* 导航栏 */
.nav-header {
  flex-shrink: 0;
  padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top);
  padding-bottom: 24rpx;
  background: #e8f4ff;
}

.nav-header__title {
  display: block;
  text-align: center;
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
}

/* 内容区 */
.scroll-content {
  flex: 1;
  height: 0;
  min-height: 0;
  padding: 0 24rpx 24rpx;
}

/* 内容卡片 */
.content-card {
  position: relative;
  border-radius: 16rpx;
  overflow: hidden;
  margin-bottom: 24rpx;
  height: 280rpx;
}

.content-card__cover {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.content-card__mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    180deg,
    rgba(15, 35, 60, 0.25) 0%,
    rgba(15, 35, 60, 0.55) 55%,
    rgba(15, 35, 60, 0.82) 100%
  );
}

.content-card__content {
  position: relative;
  z-index: 1;
  height: 100%;
  padding: 36rpx 32rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.content-card__title {
  font-size: 34rpx;
  font-weight: 600;
  color: #fff;
  line-height: 1.4;
  margin-bottom: 12rpx;
}

.content-card__meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.content-card__region,
.content-card__action {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.88);
}

.content-card__action {
  font-weight: 500;
}
</style>
