<template>
  <view class="realname-page">
    <view class="nav-bar">
      <view class="nav-bar__back" @click="onBack">
        <wd-icon name="arrow-left" size="22" color="#333" />
      </view>
      <text class="nav-bar__title">实名认证</text>
    </view>

    <scroll-view scroll-y class="scroll-content">
      <view v-if="authStatus === 'APPROVED'" class="status-card status-card--success">
        <wd-icon name="check-circle" size="48" color="#07c160" />
        <text class="status-card__title">已完成实名认证</text>
        <text class="status-card__desc">姓名：{{ maskedName }}</text>
      </view>

      <view v-else class="form-card">
        <text class="form-tip">请填写真实身份信息，认证通过后可进行提现等操作</text>
        <text class="form-label">真实姓名</text>
        <wd-input v-model="realName" placeholder="请输入身份证姓名" :border="true" />
        <text class="form-label form-label--mt">身份证号</text>
        <wd-input v-model="idCard" placeholder="请输入18位身份证号" :border="true" maxlength="18" />
        <wd-button
          type="primary"
          block
          :loading="submitting"
          custom-class="submit-btn"
          @click="onSubmit"
        >
          提交认证
        </wd-button>
      </view>

      <view class="notice-card">
        <text class="notice-card__title">温馨提示</text>
        <text class="notice-card__item">1. 请确保姓名与身份证号一致</text>
        <text class="notice-card__item">2. 认证信息提交后即时生效</text>
        <text class="notice-card__item">3. 您的身份信息将严格保密</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { onShow } from "@dcloudio/uni-app";
import { fetchRealnameStatus, submitRealnameAuth } from "@/api/user";

const realName = ref("");
const idCard = ref("");
const authStatus = ref("NONE");
const approvedName = ref("");
const submitting = ref(false);

const maskedName = computed(() => {
  const name = approvedName.value;
  if (!name) return "";
  if (name.length <= 1) return name;
  return name[0] + "*".repeat(name.length - 1);
});

onShow(() => {
  loadStatus();
});

async function loadStatus() {
  try {
    const res = await fetchRealnameStatus();
    const data = (res as any)?.data ?? res;
    authStatus.value = data?.auth_status ?? "NONE";
    approvedName.value = data?.real_name ?? "";
    if (data?.auth_status === "APPROVED" && data?.real_name) {
      realName.value = data.real_name;
    }
  } catch (e) {
    console.warn("loadStatus error:", e);
  }
}

async function onSubmit() {
  const name = realName.value.trim();
  const card = idCard.value.trim().toUpperCase();
  if (!name) {
    uni.showToast({ title: "请输入真实姓名", icon: "none" });
    return;
  }
  if (!/^(\d{15}|\d{17}[\dX])$/.test(card)) {
    uni.showToast({ title: "请输入正确的身份证号", icon: "none" });
    return;
  }
  submitting.value = true;
  try {
    await submitRealnameAuth({ real_name: name, id_card: card });
    uni.showToast({ title: "认证成功", icon: "success" });
    authStatus.value = "APPROVED";
    approvedName.value = name;
  } catch (e) {
    console.error(e);
  } finally {
    submitting.value = false;
  }
}

function onBack() {
  uni.navigateBack();
}
</script>

<style lang="scss" scoped>
.realname-page {
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
}

.nav-bar__back {
  position: absolute;
  left: $ccnc-page-padding;
  padding: 16rpx;
}

.nav-bar__title {
  font-size: 34rpx;
  font-weight: 600;
}

.scroll-content {
  height: calc(100vh - 88rpx - env(safe-area-inset-top));
  padding: $ccnc-page-padding;
}

.status-card {
  background: $ccnc-bg-card;
  border-radius: $ccnc-radius-lg;
  padding: 48rpx 32rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: $ccnc-shadow-card;
  margin-bottom: 24rpx;

  &--success {
    border: 2rpx solid rgba(7, 193, 96, 0.2);
  }
}

.status-card__title {
  font-size: 32rpx;
  font-weight: 600;
  color: $ccnc-text-primary;
  margin-top: 24rpx;
}

.status-card__desc {
  font-size: 28rpx;
  color: $ccnc-text-secondary;
  margin-top: 12rpx;
}

.form-card {
  background: $ccnc-bg-card;
  border-radius: $ccnc-radius-lg;
  padding: 32rpx;
  box-shadow: $ccnc-shadow-card;
  margin-bottom: 24rpx;
}

.form-tip {
  display: block;
  font-size: 26rpx;
  color: $ccnc-text-secondary;
  margin-bottom: 32rpx;
  line-height: 1.5;
}

.form-label {
  display: block;
  font-size: 28rpx;
  color: $ccnc-text-primary;
  margin-bottom: 16rpx;

  &--mt {
    margin-top: 24rpx;
  }
}

.submit-btn {
  margin-top: 40rpx !important;
  height: 88rpx !important;
  border-radius: 44rpx !important;
}

.notice-card {
  background: $ccnc-bg-card;
  border-radius: $ccnc-radius-lg;
  padding: 28rpx 32rpx;
}

.notice-card__title {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: $ccnc-text-primary;
  margin-bottom: 16rpx;
}

.notice-card__item {
  display: block;
  font-size: 24rpx;
  color: $ccnc-text-secondary;
  line-height: 1.8;
}
</style>
