<template>
  <view class="register-page">
    <view class="register-header">
      <view class="register-header__bg"></view>
      <view class="register-header__content">
        <text class="register-title">用户注册</text>
        <text class="register-subtitle">碳中和服务平台</text>
      </view>
    </view>

    <view class="register-form">
      <view class="register-form__card">
        <view v-if="inviteCode" class="invite-tip">
          <text class="invite-tip__label">邀请码</text>
          <text class="invite-tip__code">{{ inviteCode }}</text>
        </view>
        <wd-input
          v-model="form.username"
          label="用户名"
          placeholder="请输入用户名"
          prefix-icon="user"
          clearable
          :border="true"
        />
        <wd-input
          v-model="form.password"
          label="密码"
          placeholder="请输入密码（至少6位）"
          :password="true"
          prefix-icon="lock-on"
          clearable
          show-password
          :border="true"
          custom-class="form-input"
        />
        <wd-input
          v-model="form.phone_number"
          label="手机号"
          placeholder="选填"
          type="number"
          maxlength="11"
          prefix-icon="mobile"
          clearable
          :border="true"
          custom-class="form-input"
        />
        <wd-input
          v-model="form.email"
          label="邮箱"
          placeholder="选填"
          prefix-icon="mail"
          clearable
          :border="true"
          custom-class="form-input"
        />
        <view class="agreement" @click="agreed = !agreed">
          <view class="agreement__check" :class="{ 'agreement__check--on': agreed }">
            <wd-icon v-if="agreed" name="check" size="12" color="#fff" />
          </view>
          <text class="agreement__text">
            我已阅读并同意
            <text class="agreement__link" @click.stop="onAgreement('user')">《用户协议》</text>
            和
            <text class="agreement__link" @click.stop="onAgreement('privacy')">《隐私政策》</text>
          </text>
        </view>
        <wd-button
          type="primary"
          block
          :loading="loading"
          custom-class="register-btn"
          @click="onRegister"
        >
          注册
        </wd-button>
        <view class="register-login">
          <text class="register-login__text">已有账号？</text>
          <text class="register-login__link" @click="onGoLogin">去登录</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { useRoute } from "uniapp-router-next";
import { register } from "@/api/auth";

const route = useRoute();
const loading = ref(false);
const agreed = ref(false);
const inviteCode = ref("");

const form = reactive({
  username: "",
  password: "",
  phone_number: "",
  email: "",
});

onLoad((options) => {
  inviteCode.value =
    (options?.ref as string) ||
    (options?.invite_code as string) ||
    (route.query?.ref as string) ||
    (route.query?.invite_code as string) ||
    "";
});

async function onRegister() {
  const { username, password } = form;
  if (!username?.trim()) {
    uni.showToast({ title: "请输入用户名", icon: "none" });
    return;
  }
  if (!password) {
    uni.showToast({ title: "请输入密码", icon: "none" });
    return;
  }
  if (password.length < 6) {
    uni.showToast({ title: "密码至少6位", icon: "none" });
    return;
  }
  if (form.phone_number && !/^1\d{10}$/.test(form.phone_number)) {
    uni.showToast({ title: "手机号格式不正确", icon: "none" });
    return;
  }
  if (!agreed.value) {
    uni.showToast({ title: "请先阅读并同意用户协议", icon: "none" });
    return;
  }

  loading.value = true;
  try {
    await register({
      username: username.trim(),
      password,
      invite_code: inviteCode.value || undefined,
      phone_number: form.phone_number || undefined,
      email: form.email || undefined,
    });
    uni.showToast({ title: "注册成功，请登录", icon: "success" });
    setTimeout(() => {
      uni.redirectTo({ url: "/pages/login/index" });
    }, 1500);
  } catch (e) {
    console.error("register error:", e);
  } finally {
    loading.value = false;
  }
}

function onGoLogin() {
  uni.navigateBack({ fail: () => uni.redirectTo({ url: "/pages/login/index" }) });
}

function onAgreement(type: string) {
  const contentType = type === "privacy" ? "privacy" : "agreement";
  uni.navigateTo({ url: `/pages/content/index?type=${contentType}` });
}
</script>

<style lang="scss" scoped>
.register-page {
  min-height: 100vh;
  background: $ccnc-bg-page;
  padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top);
}

.register-header {
  position: relative;
  height: 240rpx;
  overflow: hidden;
}

.register-header__bg {
  position: absolute;
  inset: 0;
  background: $ccnc-gradient-header;
}

.register-header__content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.register-title {
  font-size: 40rpx;
  font-weight: 700;
  color: #fff;
  margin-bottom: 12rpx;
}

.register-subtitle {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.9);
}

.register-form {
  margin-top: -40rpx;
  padding: 0 $ccnc-page-padding;
  position: relative;
  z-index: 2;
}

.register-form__card {
  background: $ccnc-bg-card;
  border-radius: $ccnc-radius-lg;
  padding: 40rpx 32rpx;
  box-shadow: $ccnc-shadow-card;
}

.invite-tip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 24rpx;
  margin-bottom: 24rpx;
  background: rgba(25, 137, 250, 0.08);
  border-radius: $ccnc-radius-md;
}

.invite-tip__label {
  font-size: 26rpx;
  color: $ccnc-text-secondary;
}

.invite-tip__code {
  font-size: 28rpx;
  font-weight: 600;
  color: $ccnc-primary;
}

.form-input {
  margin-top: 24rpx;
}

.agreement {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
  margin-top: 32rpx;
}

.agreement__check {
  width: 32rpx;
  height: 32rpx;
  border: 2rpx solid #ccc;
  border-radius: 6rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 4rpx;

  &--on {
    background: $ccnc-primary;
    border-color: $ccnc-primary;
  }
}

.agreement__text {
  font-size: 24rpx;
  color: $ccnc-text-placeholder;
  line-height: 1.6;
}

.agreement__link {
  color: $ccnc-primary;
}

.register-btn {
  height: 88rpx !important;
  font-size: 32rpx !important;
  font-weight: 600 !important;
  border-radius: 44rpx !important;
  margin-top: 32rpx;
}

.register-login {
  margin-top: 32rpx;
  text-align: center;
}

.register-login__text {
  font-size: 28rpx;
  color: $ccnc-text-secondary;
}

.register-login__link {
  font-size: 28rpx;
  color: $ccnc-primary;
  margin-left: 8rpx;
}
</style>
