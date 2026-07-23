<template>
  <div class="container" style="padding: 20px;">
    <a-card class="general-card" title="提现审核">
      <a-form :model="form" layout="inline" style="margin-bottom: 20px">
        <a-form-item field="user_id" label="用户ID">
          <a-input-number v-model="form.user_id" placeholder="ID" allow-clear />
        </a-form-item>
        <a-form-item field="status" label="状态">
          <a-select v-model="form.status" placeholder="全部" allow-clear style="width: 150px">
            <a-option value="PENDING">待审核</a-option>
            <a-option value="SUCCESS">已成功</a-option>
            <a-option value="REJECTED">已驳回</a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="dateRange" label="申请时间">
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
          <a-table-column title="ID" data-index="id" :width="80" />
          <a-table-column title="用户ID" data-index="user_id" :width="100" />
          <a-table-column title="提现金额" data-index="amount">
               <template #cell="{ record }">{{ record.amount.toFixed(2) }}</template>
          </a-table-column>
          <a-table-column title="收款信息" :width="250">
               <template #cell="{ record }">
                   <div>{{ record.network }}</div>
                   <div style="font-size: 12px; color: gray;">{{ record.address }}</div>
               </template>
          </a-table-column>
          <a-table-column title="状态" data-index="status">
            <template #cell="{ record }">
              <a-tag :color="WithdrawStatusColorMap[record.status]">
                {{ WithdrawStatusMap[record.status] }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="申请时间" data-index="created_at" />
          <a-table-column title="操作">
            <template #cell="{ record }">
              <a-space v-if="record.status === 'PENDING'">
                  <a-popconfirm content="确认通过该提现申请？系统将扣除用户冻结金额。" @ok="handleApprove(record)">
                      <a-button type="text" status="success" size="small">通过</a-button>
                  </a-popconfirm>
                  <a-button type="text" status="danger" size="small" @click="openReject(record)">驳回</a-button>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>
    
    <!-- Reject Modal -->
    <a-modal v-model:visible="rejectVisible" @ok="handleReject" @cancel="rejectVisible = false">
        <template #title>驳回提现 (ID: {{ currentId }})</template>
        <a-form :model="rejectForm">
            <a-form-item field="reason" label="驳回原因" :rules="[{required:true}]">
                <a-textarea v-model="rejectForm.reason" placeholder="请输入驳回原因，如地址错误等" />
            </a-form-item>
        </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { getWithdrawList, approveWithdraw, rejectWithdraw } from '@/api/fund';
import { WithdrawStatusMap, WithdrawStatusColorMap } from '@/types/fund';
import type { WithdrawRecord, WithdrawStatus } from '@/types/fund';
import { Message } from '@arco-design/web-vue';

const loading = ref(false);
const renderData = ref<WithdrawRecord[]>([]);
const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0,
});

const form = reactive({
  user_id: undefined,
  status: 'PENDING' as WithdrawStatus | undefined, // Default to pending usually convenient
  dateRange: [] as string[],
});

const rejectVisible = ref(false);
const currentId = ref(0);
const rejectForm = reactive({ reason: '' });

const fetchData = async () => {
  loading.value = true;
  try {
    const { data } = await getWithdrawList({
      page: pagination.current,
      page_size: pagination.pageSize,
      user_id: form.user_id,
      status: form.status,
      time_from: form.dateRange?.[0],
      time_to: form.dateRange?.[1]
    });
    renderData.value = data.records;
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
  form.user_id = undefined;
  form.status = undefined;
  form.dateRange = [];
  handleSearch();
};

const onPageChange = (current: number) => {
  pagination.current = current;
  fetchData();
};

const handleApprove = async (record: WithdrawRecord) => {
    await approveWithdraw(record.id);
    Message.success('审核通过');
    fetchData();
};

const openReject = (record: WithdrawRecord) => {
    currentId.value = record.id;
    rejectForm.reason = '';
    rejectVisible.value = true;
};

const handleReject = async () => {
    if (!rejectForm.reason) {
        Message.warning('请输入驳回原因');
        return;
    }
    await rejectWithdraw(currentId.value, rejectForm.reason);
    Message.success('已驳回');
    rejectVisible.value = false;
    fetchData();
};

onMounted(() => {
  fetchData();
});
</script>
