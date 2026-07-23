<template>
  <div class="container" style="padding: 20px;">
    <a-card class="general-card" title="资金流水">
      <a-row style="margin-bottom: 16px">
        <a-col :span="12">
           <a-form :model="form" layout="inline">
            <a-form-item field="user_id" label="用户ID">
              <a-input-number v-model="form.user_id" placeholder="ID" allow-clear />
            </a-form-item>
            <a-form-item field="biz_type" label="类型">
              <a-select v-model="form.biz_type" placeholder="全部" allow-clear style="width: 150px">
                <a-option v-for="(label, key) in BizTypeMap" :key="key" :value="key">{{ label }}</a-option>
              </a-select>
            </a-form-item>
            <a-form-item>
              <a-button type="primary" @click="handleSearch">查询</a-button>
            </a-form-item>
          </a-form>
        </a-col>
        <a-col :span="12" style="text-align: right;">
            <a-button status="warning" @click="adjustVisible = true">
                <template #icon><icon-edit /></template>
                人工调账
            </a-button>
        </a-col>
      </a-row>

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
          <a-table-column title="业务类型" data-index="type">
               <template #cell="{ record }">
                   <a-tag>{{ BizTypeMap[record.type] || record.type }}</a-tag>
               </template>
          </a-table-column>
          <a-table-column title="变动金额" data-index="amount">
              <template #cell="{ record }">
                  <span :style="{ color: record.amount >= 0 ? 'green' : 'red' }">
                      {{ record.amount >= 0 ? '+' : '' }}{{ record.amount.toFixed(2) }}
                  </span>
              </template>
          </a-table-column>
          <a-table-column title="变动后余额" data-index="balance_after">
               <template #cell="{ record }">{{ record.balance_after.toFixed(2) }}</template>
          </a-table-column>
          <a-table-column title="描述" data-index="description" />
          <a-table-column title="时间" data-index="created_at" />
        </template>
      </a-table>
    </a-card>

    <!-- Adjustment Modal -->
    <a-modal v-model:visible="adjustVisible" @ok="handleAdjust" @cancel="adjustVisible = false">
        <template #title>人工调账</template>
        <a-alert type="warning" style="margin-bottom: 10px">此操作将直接修改用户余额，请谨慎操作！正数增加余额，负数扣除余额。</a-alert>
        <a-form :model="adjustForm">
            <a-form-item field="user_id" label="用户ID" :rules="[{required:true}]">
                <a-input-number v-model="adjustForm.user_id" placeholder="目标用户ID" />
            </a-form-item>
            <a-form-item field="amount" label="金额" :rules="[{required:true}]">
                <a-input-number v-model="adjustForm.amount" placeholder="例如: 100 或 -50" :precision="2" />
            </a-form-item>
             <a-form-item field="description" label="备注" :rules="[{required:true}]">
                <a-textarea v-model="adjustForm.description" placeholder="必须填写调账原因" />
            </a-form-item>
        </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { getLedgerList, adjustBalance } from '@/api/fund';
import { BizTypeMap } from '@/types/fund';
import type { LedgerRecord } from '@/types/fund';
import { Message } from '@arco-design/web-vue';
import { IconEdit } from '@arco-design/web-vue/es/icon';

const loading = ref(false);
const renderData = ref<LedgerRecord[]>([]);
const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0,
});

const form = reactive({
  user_id: undefined,
  biz_type: '',
});

const adjustVisible = ref(false);
const adjustForm = reactive({
    user_id: undefined,
    amount: 0,
    description: ''
});

const fetchData = async () => {
  loading.value = true;
  try {
    const { data } = await getLedgerList({
      page: pagination.current,
      page_size: pagination.pageSize,
      user_id: form.user_id,
      biz_type: form.biz_type || undefined,
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

const onPageChange = (current: number) => {
  pagination.current = current;
  fetchData();
};

const handleAdjust = async () => {
    if (!adjustForm.user_id || !adjustForm.amount || !adjustForm.description) {
        Message.warning('请填写完整调账信息');
        return;
    }
    await adjustBalance({
        user_id: adjustForm.user_id,
        amount: adjustForm.amount,
        description: adjustForm.description
    });
    Message.success('调账成功');
    adjustVisible.value = false;
    // Reset form
    adjustForm.user_id = undefined;
    adjustForm.amount = 0;
    adjustForm.description = '';
    // Refresh list
    fetchData();
};

onMounted(() => {
  fetchData();
});
</script>
