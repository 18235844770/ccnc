<template>
  <div class="container" style="padding: 20px;">
    <a-card class="general-card" title="订单管理">
      <a-form :model="form" layout="inline" style="margin-bottom: 20px">
        <a-form-item field="order_id" label="订单号">
          <a-input v-model="form.order_id" placeholder="请输入订单号" allow-clear />
        </a-form-item>
        <a-form-item field="user_id" label="用户ID">
          <a-input-number v-model="form.user_id" placeholder="ID" allow-clear />
        </a-form-item>
        <a-form-item field="status" label="状态">
          <a-select v-model="form.status" placeholder="全部" allow-clear style="width: 150px">
            <a-option value="PENDING">待支付</a-option>
            <a-option value="PAID">已支付</a-option>
            <a-option value="ACTIVE">计息中</a-option>
            <a-option value="SETTLED">已结算</a-option>
            <a-option value="CANCELLED">已取消</a-option>
            <a-option value="REFUNDED">已退款</a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="dateRange" label="下单时间">
            <a-range-picker v-model="form.dateRange" style="width: 250px;" />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="handleSearch">查询</a-button>
          <a-button @click="handleReset" style="margin-left: 10px">重置</a-button>
        </a-form-item>
      </a-form>

      <a-table
        :data="renderData"
        :loading="loading"
        :pagination="pagination"
        @page-change="onPageChange"
        row-key="id"
      >
        <template #columns>
          <a-table-column title="订单号" data-index="order_no" :width="180">
            <template #cell="{ record }">
              {{ record.order_no || record.id }}
            </template>
          </a-table-column>
          <a-table-column title="用户" data-index="username">
              <template #cell="{ record }">
                  {{ record.username }} (ID: {{ record.user_id }})
              </template>
          </a-table-column>
          <a-table-column title="产品ID" data-index="product_id" :width="80" />
          <a-table-column title="本金" data-index="amount">
             <template #cell="{ record }">{{ Number(record.amount || 0).toFixed(2) }}</template>
          </a-table-column>
          <a-table-column title="预计收益" data-index="profit">
             <template #cell="{ record }">{{ Number(record.profit || 0).toFixed(2) }}</template>
          </a-table-column>
          <a-table-column title="状态" data-index="status">
            <template #cell="{ record }">
              <a-tag :color="OrderStatusColorMap[record.status] || 'gray'">
                {{ OrderStatusMap[record.status] || record.status }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="下单时间" data-index="created_at" :width="170" />
          <a-table-column title="操作">
            <template #cell="{ record }">
              <a-button type="text" size="small" @click="handleDetail(record)">详情</a-button>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <!-- Detail Drawer -->
    <a-drawer :width="600" :visible="detailVisible" @ok="detailVisible = false" @cancel="detailVisible = false" :footer="false">
        <template #title>订单详情 ({{ currentDetail?.id }})</template>
        <div v-if="currentDetail">
            <a-descriptions title="基础信息" :column="2" bordered>
                <a-descriptions-item label="订单号">{{ currentDetail.id }}</a-descriptions-item>
                <a-descriptions-item label="用户">{{ currentDetail.username }} (ID: {{ currentDetail.user_id }})</a-descriptions-item>
                <a-descriptions-item label="产品名称">{{ currentDetail.product_name || `Product #${currentDetail.product_id}` }}</a-descriptions-item>
                <a-descriptions-item label="当前状态">
                    <a-tag :color="OrderStatusColorMap[currentDetail.status]">
                        {{ OrderStatusMap[currentDetail.status] }}
                    </a-tag>
                </a-descriptions-item>
                <a-descriptions-item label="下单时间">{{ currentDetail.created_at }}</a-descriptions-item>
            </a-descriptions>
            
            <a-divider />
            
            <a-descriptions title="资金信息" :column="2" bordered>
                <a-descriptions-item label="投资本金">{{ Number(currentDetail.amount || 0).toFixed(2) }}</a-descriptions-item>
                <a-descriptions-item label="预计收益">{{ Number(currentDetail.profit || 0).toFixed(2) }}</a-descriptions-item>
                <a-descriptions-item label="起息日">{{ currentDetail.start_time || currentDetail.start_date || '-' }}</a-descriptions-item>
                <a-descriptions-item label="到期日">{{ currentDetail.end_time || currentDetail.end_date || '-' }}</a-descriptions-item>
            </a-descriptions>

            <a-divider v-if="currentDetail.payment_info" />

            <a-descriptions title="支付流水" :column="1" bordered v-if="currentDetail.payment_info">
                <a-descriptions-item label="支付时间">{{ currentDetail.payment_info.paid_at }}</a-descriptions-item>
                <a-descriptions-item label="TX Hash">{{ currentDetail.payment_info.tx_hash }}</a-descriptions-item>
            </a-descriptions>

            <a-divider v-if="canRefund" />
            <div v-if="canRefund" style="text-align: right;">
              <a-popconfirm content="确认退款？将退回本金并冲正分润" @ok="handleRefund">
                <a-button status="danger">管理员退款</a-button>
              </a-popconfirm>
            </div>
        </div>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { getOrderList, getOrderDetail, refundOrder } from '@/api/order';
import { OrderStatusMap, OrderStatusColorMap } from '@/types/order';
import type { OrderListItem, OrderDetail } from '@/types/order';
import { Message } from '@arco-design/web-vue';

const loading = ref(false);
const renderData = ref<OrderListItem[]>([]);
const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0,
});

const form = reactive({
  order_id: '',
  user_id: undefined,
  status: undefined,
  dateRange: [] as string[],
});

// Detail
const detailVisible = ref(false);
const currentDetail = ref<OrderDetail | null>(null);

const canRefund = computed(() => {
  const s = currentDetail.value?.status;
  return s === 'ACTIVE' || s === 'PAID';
});

const fetchData = async () => {
  loading.value = true;
  try {
    const { data } = await getOrderList({
      page: pagination.current,
      page_size: pagination.pageSize,
      user_id: form.user_id,
      order_id: form.order_id || undefined,
      status: form.status,
      start_time: form.dateRange?.[0],
      end_time: form.dateRange?.[1]
    });
    renderData.value = data.records ?? data.list ?? [];
    pagination.total = data.total;
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  pagination.current = 1;
  fetchData();
};

const handleReset = () => {
  form.order_id = '';
  form.user_id = undefined;
  form.status = undefined;
  form.dateRange = [];
  handleSearch();
};

const onPageChange = (current: number) => {
  pagination.current = current;
  fetchData();
};

const handleDetail = async (record: OrderListItem) => {
    loading.value = true;
    try {
        const { data } = await getOrderDetail(record.id);
        currentDetail.value = data;
        detailVisible.value = true;
    } finally {
        loading.value = false;
    }
};

const handleRefund = async () => {
  if (!currentDetail.value?.id) return;
  try {
    await refundOrder(currentDetail.value.id, '管理员发起退款');
    Message.success('退款成功');
    detailVisible.value = false;
    fetchData();
  } catch (e) {
    console.error(e);
  }
};

onMounted(() => {
  fetchData();
});
</script>
