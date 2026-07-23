<template>
  <view class="user-page">
    <scroll-view scroll-y class="scroll-content" :show-scrollbar="false">
      <!-- 头部区域 - 浅蓝背景 -->
      <view class="user-header">
        <view class="user-profile">
          <image
            class="user-avatar"
            :src="userStore.userInfo?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + (userStore.userInfo?.id || 'user')"
            mode="aspectFill"
          />
          <view class="user-info">
            <text class="user-name">{{ displayName }}</text>
            <view class="user-tag">
              <wd-icon name="notification" size="12" color="#1989fa" />
              <text>{{ realnameTag }}</text>
            </view>
          </view>
          <wd-icon
            class="user-notice"
            name="notification"
            size="22"
            color="#333"
            @click="onNoticeClick"
          />
        </view>

        <!-- 总资产卡片 -->
        <view class="assets-card">
          <view class="assets-card__top">
            <view class="assets-card__title-wrap">
              <text class="assets-card__title">总资产 (元)</text>
              <wd-icon name="browse" size="16" color="#666" />
              <wd-icon name="chart" size="16" color="#666" />
            </view>
            <view class="assets-card__record" @click="onAccountRecord">
              <wd-icon name="file" size="14" color="#1989fa" />
              <text>账变记录</text>
            </view>
          </view>
          <text class="assets-card__value">{{ totalAssets }}</text>
          <view class="assets-card__earnings">
            <view class="earnings-item">
              <text class="earnings-label">可用余额(元)</text>
              <text class="earnings-value">{{ balanceAvailable }}</text>
            </view>
            <view class="earnings-item">
              <text class="earnings-label">冻结(元)</text>
              <text class="earnings-value">{{ balanceFrozen }}</text>
            </view>
            <view class="earnings-item">
              <text class="earnings-label">推广收益(元)</text>
              <text class="earnings-value">{{ commissionTotal }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 快捷操作 -->
      <view class="quick-actions">
        <view
          v-for="item in quickActions"
          :key="item.name"
          class="quick-action-item"
          @click="onQuickAction(item)"
        >
          <view class="quick-action-icon" :style="{ background: item.bgColor }">
            <wd-icon :name="item.icon" size="22" color="#fff" />
          </view>
          <text class="quick-action-text">{{ item.name }}</text>
        </view>
      </view>

      <!-- 功能卡片：余额宝 & 客服 -->
      <view class="feature-cards">
        <view class="feature-card feature-card--balance" @click="onYuebao">
          <view class="feature-card__content">
            <text class="feature-card__title">余额宝</text>
            <wd-button size="small" type="primary" custom-style="font-size: 22rpx"
              >立即查看</wd-button
            >
          </view>
          <view class="feature-card__icon feature-card__icon--money">
            <wd-icon name="money-circle" size="48" color="#1989fa" />
          </view>
        </view>
        <view class="feature-card feature-card--service" @click="onCustomerService">
          <view class="feature-card__content">
            <text class="feature-card__title">客服</text>
            <wd-button size="small" type="success" custom-style="font-size: 22rpx"
              >前往咨询</wd-button
            >
          </view>
          <view class="feature-card__icon feature-card__icon--chat">
            <wd-icon name="chat" size="48" color="#07c160" />
          </view>
        </view>
      </view>

      <!-- 更多功能 -->
      <view class="more-features">
        <text class="more-features__title">更多功能</text>
        <view class="more-features__grid">
          <wd-grid :column="4" :border="false" :gutter="0" clickable>
            <wd-grid-item
              v-for="item in moreFeatures"
              :key="item.name"
              :icon="item.icon"
              :text="item.name"
              :icon-color="item.color"
              @itemclick="onMoreFeature(item)"
            />
          </wd-grid>
        </view>
      </view>

      <!-- 退出登录 -->
      <view class="logout-wrap">
        <wd-button
          type="primary"
          block
          custom-class="logout-btn"
          @click="onLogout"
        >
          退出登录
        </wd-button>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { onShow } from "@dcloudio/uni-app";
import { useUserStore } from "@/store/user";
import { fetchUserInfo } from "@/api/user";
import { fetchWallets } from "@/api/wallet";
import { fetchCommissionSummary } from "@/api/commission";
import { formatAmount } from "@/utils/format";

const userStore = useUserStore();
const balanceAvailable = ref("0.00");
const balanceFrozen = ref("0.00");
const commissionTotal = ref("0.00");
const realnameStatus = ref("");

const realnameTag = computed(() => {
  if (realnameStatus.value === "APPROVED") return "已实名";
  return "未实名";
});

const totalAssets = computed(() => {
  const a = parseFloat(balanceAvailable.value) || 0;
  const f = parseFloat(balanceFrozen.value) || 0;
  return formatAmount(a + f);
});
const displayName = computed(
  () =>
    userStore.userInfo?.name ||
    userStore.userInfo?.username ||
    userStore.userInfo?.phone ||
    userStore.userInfo?.phone_number ||
    "用户"
);

onShow(() => {
  if (userStore.checkLogin()) {
    loadUserInfo();
    loadAssets();
  }
});

async function loadAssets() {
  try {
    const [walletRes, commissionRes] = await Promise.all([
      fetchWallets(),
      fetchCommissionSummary().catch(() => null),
    ]);
    const wallets = (walletRes as any)?.data ?? [];
    const balance = wallets.find((w: any) => w.type === "BALANCE");
    balanceAvailable.value = formatAmount(balance?.balance_available);
    balanceFrozen.value = formatAmount(balance?.balance_frozen);
    const summary = (commissionRes as any)?.data;
    commissionTotal.value = formatAmount(summary?.total ?? summary?.paid ?? 0);
  } catch (e) {
    console.warn("loadAssets error:", e);
  }
}

async function loadUserInfo() {
  if (!userStore.token) return;
  try {
    const res = await fetchUserInfo();
    const u = (res as any)?.data ?? (res as any)?.user ?? res;
    if (u) {
      userStore.userInfo = {
        ...userStore.userInfo,
        id: String(u.id ?? userStore.userInfo?.id),
        username: u.username ?? userStore.userInfo?.username,
        name: u.username ?? userStore.userInfo?.name,
        email: u.email ?? userStore.userInfo?.email,
        phone: u.phone_number ?? userStore.userInfo?.phone,
        phone_number: u.phone_number ?? userStore.userInfo?.phone_number,
        status: u.status ?? userStore.userInfo?.status,
      };
      realnameStatus.value = u.realname_status ?? "";
    }
  } catch (e) {
    console.warn("loadUserInfo error:", e);
  }
}

const quickActions = [
  { name: "充值", icon: "add-circle", bgColor: "#1989fa" },
  { name: "提现", icon: "download", bgColor: "#1989fa" },
  { name: "在线划转", icon: "swap", bgColor: "#1989fa" },
  { name: "交易记录", icon: "file", bgColor: "#1989fa" },
  { name: "收益明细", icon: "chart-bar", bgColor: "#1989fa" },
];

const moreFeatures = [
  { name: "我的订单", icon: "list", color: "#1989fa" },
  { name: "绑定银行卡", icon: "creditcard", color: "#ee0a24" },
  { name: "实名认证", icon: "user-circle", color: "#1989fa" },
  { name: "提现密码设置", icon: "lock-on", color: "#07c160" },
  { name: "登录密码设置", icon: "setting", color: "#1989fa" },
  { name: "帮助中心", icon: "help-circle", color: "#ee0a24" },
  { name: "我的团队", icon: "usergroup", color: "#07c160" },
  { name: "邀请好友", icon: "usergroup-add", color: "#1989fa" },
  { name: "收货地址", icon: "location", color: "#ee0a24" },
];

function onNoticeClick() {
  uni.showToast({ title: "消息通知", icon: "none" });
}

function onAccountRecord() {
  uni.navigateTo({ url: "/pages/wallet/ledger" });
}

function onQuickAction(item: { name: string }) {
  if (!userStore.checkLogin()) {
    uni.navigateTo({ url: "/pages/login/index" });
    return;
  }
  if (item.name === "充值") {
    uni.navigateTo({ url: "/pages/wallet/recharge" });
  } else if (item.name === "提现") {
    uni.navigateTo({ url: "/pages/wallet/withdraw" });
  } else if (item.name === "交易记录") {
    uni.navigateTo({ url: "/pages/wallet/ledger" });
  } else if (item.name === "收益明细") {
    uni.navigateTo({ url: "/pages/promo/commission" });
  } else {
    uni.showToast({ title: `${item.name}功能开发中`, icon: "none" });
  }
}

function onYuebao() {
  uni.navigateTo({ url: "/pages/wallet/index" });
}

function onCustomerService() {
  uni.navigateTo({ url: "/pages/content/service" });
}

function onMoreFeature(item: { name: string }) {
  if (!userStore.checkLogin() && (item.name === "邀请好友" || item.name === "我的团队" || item.name === "实名认证")) {
    uni.navigateTo({ url: "/pages/login/index" });
    return;
  }
  if (item.name === "邀请好友" || item.name === "我的团队") {
    uni.navigateTo({ url: "/pages/promo/index" });
    return;
  }
  if (item.name === "我的订单") {
    uni.navigateTo({ url: "/pages/order/list" });
    return;
  }
  if (item.name === "实名认证") {
    uni.navigateTo({ url: "/pages/user/realname" });
    return;
  }
  uni.showToast({ title: `${item.name}功能开发中`, icon: "none" });
}

function onLogout() {
  uni.showModal({
    title: "提示",
    content: "确定要退出登录吗？",
    success: (res) => {
      if (res.confirm) {
        const userStore = useUserStore();
        userStore.logout();
        uni.showToast({ title: "已退出登录", icon: "none" });
        uni.reLaunch({ url: "/pages/login/index" });
      }
    },
  });
}
</script>

<style lang="scss" scoped>
.user-page {
  height: 100vh;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #f6f6f7;
  padding-bottom: calc(100rpx + env(safe-area-inset-bottom));
}

.scroll-content {
  flex: 1;
  height: 0;
  min-height: 0;
}

/* 头部 */
.user-header {
  background: linear-gradient(180deg, #e8f4ff 0%, #f0f8ff 60%, #fff 100%);
  padding: 32rpx 24rpx 0;
  padding-top: calc(44rpx + 32rpx);
}

.user-profile {
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
}

.user-avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background: #e0e0e0;
  flex-shrink: 0;
}

.user-info {
  flex: 1;
  margin-left: 24rpx;
}

.user-name {
  display: block;
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 12rpx;
}

.user-tag {
  display: inline-flex;
  align-items: center;
  gap: 6rpx;
  padding: 6rpx 16rpx;
  background: rgba(25, 137, 250, 0.15);
  border-radius: 24rpx;
  font-size: 22rpx;
  color: #1989fa;

  text {
    margin-left: 4rpx;
  }
}

.user-notice {
  padding: 16rpx;
}

/* 总资产卡片 */
.assets-card {
  background: linear-gradient(135deg, #b8dfff 0%, #e0f0ff 50%, #f0f8ff 100%);
  border-radius: 16rpx;
  padding: 28rpx 32rpx 32rpx;
  margin-bottom: -40rpx;
  position: relative;
  z-index: 1;
  box-shadow: 0 4rpx 20rpx rgba(25, 137, 250, 0.15);
}

.assets-card__top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16rpx;
}

.assets-card__title-wrap {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.assets-card__title {
  font-size: 26rpx;
  color: #666;
  margin-right: 8rpx;
}

.assets-card__record {
  display: flex;
  align-items: center;
  gap: 6rpx;
  font-size: 24rpx;
  color: #1989fa;

  text {
    margin-left: 4rpx;
  }
}

.assets-card__value {
  display: block;
  font-size: 48rpx;
  font-weight: 700;
  color: #333;
  margin-bottom: 24rpx;
}

.assets-card__earnings {
  display: flex;
  justify-content: space-between;
  padding-top: 20rpx;
  border-top: 1rpx solid rgba(25, 137, 250, 0.2);
}

.earnings-item {
  flex: 1;
  text-align: center;

  .earnings-label {
    display: block;
    font-size: 22rpx;
    color: #666;
    margin-bottom: 8rpx;
  }

  .earnings-value {
    font-size: 26rpx;
    font-weight: 600;
    color: #333;
  }
}

/* 快捷操作 */
.quick-actions {
  display: flex;
  justify-content: space-around;
  padding: 60rpx 24rpx 32rpx;
  background: #fff;
  margin: 0 24rpx;
  border-radius: 16rpx;
  margin-top: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.quick-action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.quick-action-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16rpx;
}

.quick-action-text {
  font-size: 24rpx;
  color: #333;
}

/* 功能卡片 */
.feature-cards {
  display: flex;
  gap: 24rpx;
  margin: 24rpx;
}

.feature-card {
  flex: 1;
  background: #fff;
  border-radius: 16rpx;
  padding: 28rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
  position: relative;
  overflow: hidden;
}

.feature-card__content {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.feature-card__title {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
}

.feature-card__icon {
  position: absolute;
  right: 24rpx;
  opacity: 0.9;
}

/* 更多功能 */
.more-features {
  margin: 24rpx;
  padding: 32rpx;
  background: #fff;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.more-features__title {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 24rpx;
}

.more-features__grid {
  :deep(.wd-grid-item__content) {
    padding: 20rpx 0;
  }

  :deep(.wd-grid-item__wrapper) {
    width: 72rpx !important;
    height: 72rpx !important;
    margin: 0 auto 12rpx;
    background: #f7f8fa;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  :deep(.wd-grid-item__text) {
    font-size: 22rpx;
    color: #333;
  }
}

/* 退出登录 */
.logout-wrap {
  margin: 40rpx 24rpx 24rpx;
}

.logout-btn {
  height: 88rpx !important;
  font-size: 32rpx !important;
  font-weight: 600 !important;
  border-radius: 44rpx !important;
}
</style>
