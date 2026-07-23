<template>
  <div class="container" style="padding: 20px;">
    <a-card class="general-card" title="操作日志">
      <a-form layout="inline" :model="form" style="margin-bottom: 20px;">
        <a-form-item field="admin_id" label="管理员ID">
            <a-input-number v-model="form.admin_id" placeholder="请输入ID" />
        </a-form-item>
        <a-form-item field="action" label="动作">
            <a-input v-model="form.action" placeholder="请输入动作类型" />
        </a-form-item>
        <a-form-item>
            <a-button type="primary" @click="handleSearch">查询</a-button>
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
          <a-table-column title="管理员" data-index="admin_name" />
          <a-table-column title="动作" data-index="action" />
          <a-table-column title="目标类型" data-index="target_type" />
          <a-table-column title="目标ID" data-index="target_id" />
          <a-table-column title="原因" data-index="reason" />
          <a-table-column title="时间" data-index="created_at" />
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { getAuditLogs } from '@/api/system';
import type { AuditLog } from '@/types/system';

const loading = ref(false);
const renderData = ref<AuditLog[]>([]);
const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0,
});

const form = reactive({
    admin_id: undefined,
    action: ''
});

const fetchData = async () => {
  loading.value = true;
  try {
    const { data } = await getAuditLogs({ 
        page: pagination.current, 
        page_size: pagination.pageSize,
        admin_id: form.admin_id,
        action: form.action || undefined
    });
    renderData.value = data.list;
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

onMounted(() => {
  fetchData();
});
</script>
