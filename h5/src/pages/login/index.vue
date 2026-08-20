<template>
  <view class="login-page">
    <!-- 顶部装饰区 -->
    <view class="login-header">
      <view class="login-header__bg"></view>
      <view class="login-header__content">
        <view class="login-logo">
          <wd-icon name="chart-pie" size="64" color="#fff" />
        </view>
        <text class="login-title">碳中和服务平台</text>
        <text class="login-subtitle">携手为保护地球投资</text>
      </view>
    </view>

    <!-- 登录表单卡片 -->
    <view class="login-form">
      <view class="login-form__card">
        <wd-input
          v-model="form.username"
          label="用户名"
          placeholder="请输入用户名或手机号"
          prefix-icon="user"
          clearable
          :border="true"
        />
        <wd-input
          v-model="form.password"
          label="密码"
          placeholder="请输入密码"
          :password="true"
          prefix-icon="lock-on"
          clearable
          show-password
          :border="true"
          custom-class="login-input--pwd"
        />
        <view class="login-actions">
          <text class="login-forgot" @click="onForgotPwd">忘记密码？</text>
          <text class="login-register" @click="onRegister">立即注册</text>
        </view>
        <wd-button
          type="primary"
          block
          :loading="loading"
          custom-class="login-btn"
          @click="onLogin"
        >
          登录
        </wd-button>
      </view>
    </view>

    <!-- 底部协议 -->
    <view class="login-footer">
      <text class="login-agree">
        登录即表示同意
        <text class="login-link" @click="onAgreement('user')">《用户协议》</text>
        和
        <text class="login-link" @click="onAgreement('privacy')">《隐私政策》</text>
      </text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { useRoute } from "uniapp-router-next";
import { useUserStore } from "@/store/user";
import { login } from "@/api/auth";
import { fetchUserInfo } from "@/api/user";
import { parseTokenUserId } from "@/utils/auth";
import { safeNavigate } from "@/utils/navigate";

const userStore = useUserStore();
const route = useRoute();
const loading = ref(false);

const form = reactive({
  username: "",
  password: "",
});

/** 登录成功后跳转的页面 */
const redirectUrl = ref("");

onLoad((options) => {
  redirectUrl.value =
    (options?.redirect as string) || (route.query?.redirect as string) || "";
});

async function onLogin() {
  const { username, password } = form;
  if (!username?.trim()) {
    uni.showToast({ title: "请输入用户名或手机号", icon: "none" });
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

  loading.value = true;
  try {
    const res = await login({ username: username.trim(), password });
    const token = (res as any)?.token;
    if (!token) {
      uni.showToast({ title: (res as any)?.message || "登录失败", icon: "none" });
      return;
    }
    userStore.setLogin(token, {
      id: String((res as any)?.user?.id ?? parseTokenUserId(token)),
      username: username.trim(),
      name: (res as any)?.user?.username ?? username.trim(),
      phone: (res as any)?.user?.phone_number ?? "",
      email: (res as any)?.user?.email ?? "",
      status: (res as any)?.user?.status ?? "NORMAL",
    });

    try {
      const profile = await fetchUserInfo();
      const u = (profile as any)?.data;
      if (u?.id) {
        userStore.setLogin(token, {
          id: String(u.id),
          username: u.username ?? username.trim(),
          name: u.username ?? username.trim(),
          phone: u.phone_number ?? "",
          email: u.email ?? "",
          status: u.status ?? "NORMAL",
        });
      }
    } catch {
      // 用户信息拉取失败不影响登录跳转
    }

    uni.showToast({ title: "登录成功", icon: "success" });
    const target =
      redirectUrl.value && !redirectUrl.value.includes("login")
        ? redirectUrl.value
        : "/pages/index/index";
    setTimeout(() => {
      safeNavigate(target, "/pages/index/index");
    }, 300);
  } catch (e) {
    console.error("login error:", e);
  } finally {
    loading.value = false;
  }
}

function onForgotPwd() {
  uni.showToast({ title: "忘记密码", icon: "none" });
}

function onRegister() {
  uni.navigateTo({ url: "/pages/register/index" });
}

function onAgreement(type: string) {
  const contentType = type === "privacy" ? "privacy" : "agreement";
  uni.navigateTo({ url: `/pages/content/index?type=${contentType}` });
}
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  background: #f6f6f7;
  padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top);
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}

/* 顶部装饰 */
.login-header {
  position: relative;
  height: 320rpx;
  overflow: hidden;
}

.login-header__bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    #4a90d9 0%,
    #5ba3e8 30%,
    #7eb8e8 60%,
    #a8d4f0 100%
  );
}

.login-header__content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding-top: 40rpx;
}

.login-logo {
  width: 120rpx;
  height: 120rpx;
  border-radius: 24rpx;
  background: rgba(255, 255, 255, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24rpx;
}

.login-title {
  font-size: 40rpx;
  font-weight: 700;
  color: #fff;
  margin-bottom: 12rpx;
}

.login-subtitle {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.9);
}

/* 表单区域 */
.login-form {
  margin-top: -60rpx;
  padding: 0 24rpx;
  position: relative;
  z-index: 2;
}

.login-form__card {
  background: #fff;
  border-radius: 16rpx;
  padding: 40rpx 32rpx;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.08);
}

.login-input--pwd {
  margin-top: 24rpx;
}

.login-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 24rpx 0 40rpx;
}

.login-forgot,
.login-register {
  font-size: 26rpx;
  color: #1989fa;
}

.login-btn {
  height: 88rpx !important;
  font-size: 32rpx !important;
  font-weight: 600 !important;
  border-radius: 44rpx !important;
}

/* 底部协议 */
.login-footer {
  padding: 40rpx 48rpx;
  text-align: center;
}

.login-agree {
  font-size: 24rpx;
  color: #999;
  line-height: 1.6;
}

.login-link {
  color: #1989fa;
}
</style>
