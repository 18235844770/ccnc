<template>
  <view class="service-page">
    <page-nav-bar title="客服" fallback="/pages/index/index" />

    <scroll-view scroll-y class="scroll-content" :show-scrollbar="false">
      <view class="hero">
        <wd-icon name="service" size="56" color="#1989fa" />
        <text class="hero__title">您好，有什么可以帮您？</text>
        <text class="hero__desc">工作时间 09:00 - 21:00，节假日正常值班</text>
      </view>

      <view class="contact-list">
        <view class="contact-item" @click="onCopy(phone, '客服电话')">
          <view class="contact-item__icon">
            <wd-icon name="call" size="28" color="#1989fa" />
          </view>
          <view class="contact-item__body">
            <text class="contact-item__label">客服电话</text>
            <text class="contact-item__value">{{ phone }}</text>
          </view>
          <wd-icon name="copy" size="18" color="#999" />
        </view>

        <view class="contact-item" @click="onCopy(wechat, '客服微信')">
          <view class="contact-item__icon contact-item__icon--green">
            <wd-icon name="chat" size="28" color="#07c160" />
          </view>
          <view class="contact-item__body">
            <text class="contact-item__label">客服微信</text>
            <text class="contact-item__value">{{ wechat }}</text>
          </view>
          <wd-icon name="copy" size="18" color="#999" />
        </view>

        <view class="contact-item" @click="onCopy(email, '客服邮箱')">
          <view class="contact-item__icon contact-item__icon--cyan">
            <wd-icon name="mail" size="28" color="#00d4ff" />
          </view>
          <view class="contact-item__body">
            <text class="contact-item__label">客服邮箱</text>
            <text class="contact-item__value">{{ email }}</text>
          </view>
          <wd-icon name="copy" size="18" color="#999" />
        </view>
      </view>

      <view class="tips-card">
        <text class="tips-card__title">常见问题可先自助查阅</text>
        <view class="tips-card__links">
          <text class="tips-link" @click="goContent('guide')">新手攻略</text>
          <text class="tips-link" @click="goContent('agreement')">用户协议</text>
          <text class="tips-link" @click="goContent('intro')">碳中和简介</text>
        </view>
      </view>

      <wd-button type="primary" block custom-class="call-btn" @click="onCall">
        拨打客服电话
      </wd-button>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
const phone = "400-800-2026";
const wechat = "ccnc_service";
const email = "support@ccnc.example.com";

function onCopy(text: string, label: string) {
  uni.setClipboardData({
    data: text,
    success: () => uni.showToast({ title: `${label}已复制`, icon: "none" }),
  });
}

function onCall() {
  uni.makePhoneCall({
    phoneNumber: phone.replace(/-/g, ""),
    fail: () => {
      onCopy(phone, "客服电话");
    },
  });
}

function goContent(type: string) {
  uni.navigateTo({ url: `/pages/content/index?type=${type}` });
}
</script>

<style lang="scss" scoped>
.service-page {
  min-height: 100vh;
  background: $ccnc-bg-page;
  padding-bottom: env(safe-area-inset-bottom);
}

.scroll-content {
  height: calc(100vh - 88rpx - env(safe-area-inset-top) - env(safe-area-inset-bottom));
  padding: $ccnc-page-padding;
}

.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48rpx 32rpx;
  margin-bottom: $ccnc-section-gap;
  background: $ccnc-bg-card;
  border-radius: $ccnc-radius-lg;
  box-shadow: $ccnc-shadow-card;

  &__title {
    margin-top: 20rpx;
    font-size: 34rpx;
    font-weight: 600;
    color: $ccnc-text-primary;
  }

  &__desc {
    margin-top: 12rpx;
    font-size: 24rpx;
    color: $ccnc-text-placeholder;
  }
}

.contact-list {
  background: $ccnc-bg-card;
  border-radius: $ccnc-radius-lg;
  box-shadow: $ccnc-shadow-card;
  margin-bottom: $ccnc-section-gap;
  overflow: hidden;
}

.contact-item {
  display: flex;
  align-items: center;
  padding: 28rpx 32rpx;
  border-bottom: 1rpx solid rgba(0, 0, 0, 0.06);

  &:last-child {
    border-bottom: none;
  }

  &__icon {
    width: 72rpx;
    height: 72rpx;
    border-radius: 50%;
    background: rgba(25, 137, 250, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 24rpx;
    flex-shrink: 0;

    &--green {
      background: rgba(7, 193, 96, 0.1);
    }

    &--cyan {
      background: rgba(0, 212, 255, 0.12);
    }
  }

  &__body {
    flex: 1;
    min-width: 0;
  }

  &__label {
    display: block;
    font-size: 24rpx;
    color: $ccnc-text-placeholder;
    margin-bottom: 6rpx;
  }

  &__value {
    display: block;
    font-size: 30rpx;
    color: $ccnc-text-primary;
    font-weight: 500;
  }
}

.tips-card {
  background: $ccnc-bg-card;
  border-radius: $ccnc-radius-lg;
  padding: 32rpx;
  box-shadow: $ccnc-shadow-card;
  margin-bottom: 40rpx;

  &__title {
    display: block;
    font-size: 28rpx;
    font-weight: 600;
    color: $ccnc-text-primary;
    margin-bottom: 20rpx;
  }

  &__links {
    display: flex;
    flex-wrap: wrap;
    gap: 20rpx;
  }
}

.tips-link {
  font-size: 26rpx;
  color: $ccnc-primary;
}

.call-btn {
  margin-bottom: 24rpx;
}
</style>
