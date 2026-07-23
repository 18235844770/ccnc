<template>
  <div class="container" style="padding: 20px;">
    <a-row :gutter="16" style="margin-bottom: 20px">
      <a-col :span="6">
        <a-card title="待处理事件" :bordered="false">
          <div class="stat-value">{{ dashboard?.open_events ?? 0 }}</div>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card title="高危事件" :bordered="false">
          <div class="stat-value danger">{{ dashboard?.high_severity ?? 0 }}</div>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card title="今日新增" :bordered="false">
          <div class="stat-value">{{ dashboard?.today_events ?? 0 }}</div>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card title="启用规则" :bordered="false">
          <div class="stat-value">{{ dashboard?.enabled_rules ?? 0 }}</div>
        </a-card>
      </a-col>
    </a-row>

    <a-card title="风控事件">
      <a-row style="margin-bottom: 16px">
        <a-col :span="18">
          <a-form :model="form" layout="inline">
            <a-form-item field="status" label="状态">
              <a-select v-model="form.status" allow-clear style="width: 120px">
                <a-option value="OPEN">待处理</a-option>
                <a-option value="RESOLVED">已处理</a-option>
              </a-select>
            </a-form-item>
            <a-form-item field="rule_code" label="规则">
              <a-select v-model="form.rule_code" allow-clear style="width: 180px">
                <a-option v-for="r in rules" :key="r.code" :value="r.code">{{ r.name }}</a-option>
              </a-select>
            </a-form-item>
            <a-form-item>
              <a-button type="primary" @click="handleSearch">查询</a-button>
            </a-form-item>
          </a-form>
        </a-col>
        <a-col :span="6" style="text-align: right;">
          <a-button @click="handleScan" :loading="scanning">立即扫描</a-button>
        </a-col>
      </a-row>

      <a-table :data="events" :loading="loading" :pagination="pagination" @page-change="onPageChange" row-key="id">
        <template #columns>
          <a-table-column title="ID" data-index="id" :width="70" />
          <a-table-column title="规则" data-index="rule_code" :width="160" />
          <a-table-column title="用户ID" data-index="user_id" :width="90" />
          <a-table-column title="级别" data-index="severity">
            <template #cell="{ record }">
              <a-tag :color="record.severity === 'HIGH' ? 'red' : 'orange'">{{ record.severity }}</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="状态" data-index="status" :width="100" />
          <a-table-column title="详情" data-index="detail" />
          <a-table-column title="时间" data-index="created_at" :width="180" />
          <a-table-column title="操作" :width="180">
            <template #cell="{ record }">
              <a-space v-if="record.status === 'OPEN'">
                <a-button type="text" size="small" @click="resolve(record, 'DISMISS')">忽略</a-button>
                <a-button type="text" status="warning" size="small" @click="resolve(record, 'FREEZE_USER')">冻结用户</a-button>
                <a-button type="text" status="danger" size="small" @click="resolve(record, 'BAN_USER')">封禁用户</a-button>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { Message } from '@arco-design/web-vue';
import { getRiskDashboard, getRiskEvents, getRiskRules, resolveRiskEvent, triggerRiskScan } from '@/api/risk';
import type { RiskDashboard, RiskEvent } from '@/api/risk';

const dashboard = ref<RiskDashboard | null>(null);
const events = ref<RiskEvent[]>([]);
const rules = ref<any[]>([]);
const loading = ref(false);
const scanning = ref(false);
const pagination = reactive({ current: 1, pageSize: 20, total: 0 });
const form = reactive({ status: 'OPEN' as string | undefined, rule_code: undefined as string | undefined });

async function loadDashboard() {
  const { data } = await getRiskDashboard();
  dashboard.value = data;
}

async function loadRules() {
  const { data } = await getRiskRules();
  rules.value = data;
}

async function fetchEvents() {
  loading.value = true;
  try {
    const { data } = await getRiskEvents({
      page: pagination.current,
      page_size: pagination.pageSize,
      status: form.status,
      rule_code: form.rule_code,
    });
    events.value = data.list;
    pagination.total = data.total;
  } finally {
    loading.value = false;
  }
}

function handleSearch() {
  pagination.current = 1;
  fetchEvents();
}

function onPageChange(current: number) {
  pagination.current = current;
  fetchEvents();
}

async function handleScan() {
  scanning.value = true;
  try {
    const { data } = await triggerRiskScan();
    Message.success(`扫描完成，新增 ${data.created} 条事件`);
    loadDashboard();
    fetchEvents();
  } finally {
    scanning.value = false;
  }
}

async function resolve(record: RiskEvent, action: string) {
  await resolveRiskEvent(record.id, { action, reason: `Admin action: ${action}` });
  Message.success('处置成功');
  loadDashboard();
  fetchEvents();
}

onMounted(() => {
  loadDashboard();
  loadRules();
  fetchEvents();
});
</script>

<style scoped>
.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #1d2129;
}
.stat-value.danger {
  color: #f53f3f;
}
</style>
