<template>
  <view class="order-detail-page">
    <view class="nav-bar">
      <view class="nav-bar__back" @click="onBack">
        <wd-icon name="arrow-left" size="22" color="#333" />
      </view>
      <text class="nav-bar__title">订单详情</text>
    </view>

    <scroll-view v-if="order" scroll-y class="scroll-content" :show-scrollbar="false">
      <view class="detail-card">
        <view class="detail-status" :class="'detail-status--' + (order.status || '').toLowerCase()">
          {{ statusText(order.status) }}
        </view>
        <view class="detail-row">
          <text class="detail-label">订单号</text>
          <text class="detail-value">{{ order.order_no || order.order_id }}</text>
        </view>
        <view class="detail-row">
          <text class="detail-label">产品名称</text>
          <text class="detail-value">{{ order.product_name || "碳期权产品" }}</text>
        </view>
        <view class="detail-row">
          <text class="detail-label">投资金额</text>
          <text class="detail-value detail-value--amount">¥{{ order.amount ?? 0 }}</text>
        </view>
        <view v-if="order.profit != null" class="detail-row">
          <text class="detail-label">预期收益</text>
          <text class="detail-value detail-value--profit">¥{{ order.profit }}</text>
        </view>
        <view class="detail-row">
          <text class="detail-label">创建时间</text>
          <text class="detail-value">{{ formatTime(order.created_at) }}</text>
        </view>
        <view v-if="order.paid_at" class="detail-row">
          <text class="detail-label">支付时间</text>
          <text class="detail-value">{{ formatTime(order.paid_at) }}</text>
        </view>
        <view v-if="order.end_date" class="detail-row">
          <text class="detail-label">到期时间</text>
          <text class="detail-value">{{ formatTime(order.end_date) }}</text>
        </view>
      </view>

      <view class="action-bar">
        <wd-button
          v-if="order.status === 'PENDING'"
          type="primary"
          block
          :loading="actionLoading"
          custom-class="action-btn"
          @click="onPay"
        >
          余额支付
        </wd-button>
        <wd-button
          v-if="order.status === 'PENDING'"
          type="info"
          block
          plain
          :loading="actionLoading"
          custom-class="action-btn"
          @click="onCancel"
        >
          取消订单
        </wd-button>
        <wd-button
          v-else-if="order.status === 'ACTIVE'"
          type="error"
          block
          :loading="actionLoading"
          custom-class="action-btn"
          @click="onRefund"
        >
          申请退款
        </wd-button>
      </view>
    </scroll-view>

    <view v-else-if="loading" class="loading-wrap">
      <wd-loading type="circular" />
      <text class="loading-text">加载中...</text>
    </view>
    <view v-else class="empty-wrap">
      <text class="empty-text">订单不存在</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { fetchOrderDetail, cancelOrder, refundOrder, payOrder } from "@/api/order";
import type { OrderItem } from "@/api/order";
import { orderStatusText } from "@/utils/order-status";

const order = ref<OrderItem | null>(null);
const loading = ref(true);
const actionLoading = ref(false);

function statusText(s?: string) {
  return orderStatusText(s);
}

function formatTime(str?: string) {
  if (!str) return "";
  return new Date(str).toLocaleString("zh-CN");
}

onLoad((options) => {
  const id = options?.id;
  if (id) loadDetail(String(id));
  else loading.value = false;
});

async function loadDetail(id: string) {
  try {
    const res = await fetchOrderDetail(id);
    order.value = (res as any)?.data ?? res ?? null;
  } catch (e) {
    console.error("loadOrderDetail error:", e);
  } finally {
    loading.value = false;
  }
}

function onBack() {
  uni.navigateBack();
}

async function onPay() {
  if (!order.value) return;
  const id = order.value.order_id ?? order.value.id;
  const amount = Number(order.value.amount ?? 0);
  if (!id || !amount) return;
  actionLoading.value = true;
  try {
    await payOrder(id, { payment_method: "BALANCE", payment_amount: amount });
    uni.showToast({ title: "支付成功", icon: "success" });
    await loadDetail(String(id));
  } catch (e) {
    console.error("payOrder error:", e);
  } finally {
    actionLoading.value = false;
  }
}

async function onCancel() {
  if (!order.value) return;
  const id = order.value.order_id ?? order.value.id;
  if (!id) return;
  uni.showModal({
    title: "提示",
    content: "确定要取消订单吗？",
    success: async (res) => {
      if (res.confirm) {
        actionLoading.value = true;
        try {
          await cancelOrder(id);
          uni.showToast({ title: "已取消", icon: "success" });
          order.value = { ...order.value!, status: "CANCELLED" };
        } catch (e) {
          console.error("cancelOrder error:", e);
        } finally {
          actionLoading.value = false;
        }
      }
    },
  });
}

async function onRefund() {
  if (!order.value) return;
  const id = order.value.order_id ?? order.value.id;
  if (!id) return;
  uni.showModal({
    title: "提示",
    content: "确定要申请退款吗？",
    success: async (res) => {
      if (res.confirm) {
        actionLoading.value = true;
        try {
          await refundOrder(id);
          uni.showToast({ title: "已提交退款申请", icon: "success" });
          order.value = { ...order.value!, status: "REFUNDED" };
        } catch (e) {
          console.error("refundOrder error:", e);
        } finally {
          actionLoading.value = false;
        }
      }
    },
  });
}
</script>

<style lang="scss" scoped>
.order-detail-page {
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

.detail-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 40rpx 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
}

.detail-status {
  font-size: 36rpx;
  font-weight: 600;
  margin-bottom: 32rpx;
  padding-bottom: 24rpx;
  border-bottom: 1rpx solid #f0f0f0;

  &--pending {
    color: #fa8c16;
  }

  &--paid,
  &--active {
    color: #52c41a;
  }

  &--settled {
    color: #1890ff;
  }

  &--cancelled,
  &--refunded {
    color: #999;
  }
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24rpx;
}

.detail-label {
  font-size: 28rpx;
  color: #666;
  flex-shrink: 0;
  margin-right: 24rpx;
}

.detail-value {
  font-size: 28rpx;
  color: #333;
  text-align: right;

  &--amount {
    font-size: 34rpx;
    font-weight: 600;
    color: #ee0a24;
  }

  &--profit {
    color: #07c160;
    font-weight: 600;
  }
}

.action-bar {
  padding: 0 0 48rpx;
}

.action-btn {
  height: 88rpx !important;
  font-size: 32rpx !important;
  border-radius: 44rpx !important;
}

.loading-wrap,
.empty-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx;
}

.loading-text,
.empty-text {
  margin-top: 24rpx;
  font-size: 28rpx;
  color: #999;
}
</style>
