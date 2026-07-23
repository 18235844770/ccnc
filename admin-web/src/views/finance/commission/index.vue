<template>
  <div class="container" style="padding: 20px;">
    <a-card class="general-card" title="佣金管理">
      <a-row style="margin-bottom: 16px">
        <a-col :span="16">
          <a-form :model="form" layout="inline">
            <a-form-item field="user_id" label="用户ID">
              <a-input-number v-model="form.user_id" placeholder="收款用户ID" allow-clear />
            </a-form-item>
            <a-form-item field="status" label="状态">
              <a-select v-model="form.status" placeholder="全部" allow-clear style="width: 120px">
                <a-option v-for="(label, key) in CommissionStatusMap" :key="key" :value="key">{{ label }}</a-option>
              </a-select>
            </a-form-item>
            <a-form-item field="type" label="类型">
                <a-select v-model="form.type" placeholder="全部" allow-clear style="width: 120px">
                    <a-option value="DIRECT">直推</a-option>
                    <a-option value="TEAM">团队</a-option>
                    <a-option value="SAME_LEVEL">平级</a-option>
                </a-select>
            </a-form-item>
            <a-form-item>
              <a-button type="primary" @click="handleSearch">查询</a-button>
            </a-form-item>
          </a-form>
        </a-col>
        <a-col :span="8" style="text-align: right;">
           <a-space>
             <a-button @click="openManual('CREDIT')">人工补发</a-button>
             <a-button status="warning" @click="openManual('REVERSE')">人工扣除</a-button>
             <a-button @click="ruleVisible = true">分佣配置</a-button>
           </a-space>
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
          <a-table-column title="收款用户" data-index="user_id" :width="100" />
          <a-table-column title="金额" data-index="amount">
               <template #cell="{ record }">{{ record.amount.toFixed(2) }}</template>
          </a-table-column>
          <a-table-column title="来源订单" data-index="source_order_id" />
          <a-table-column title="贡献者" data-index="from_user_id" :width="100" />
          <a-table-column title="状态" data-index="status">
            <template #cell="{ record }">
              <a-tag :color="CommissionStatusColorMap[record.status]">
                {{ CommissionStatusMap[record.status] }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="时间" data-index="created_at" />
          <a-table-column title="操作">
            <template #cell="{ record }">
              <a-button type="text" size="small" @click="handleDetail(record)">详情</a-button>
              <a-dropdown @select="(v) => handleAction(v, record)">
                  <a-button type="text" size="small">更多 <icon-down /></a-button>
                  <template #content>
                      <a-doption value="freeze" v-if="['PENDING', 'SETTLED'].includes(record.status)">冻结</a-doption>
                      <a-doption value="unfreeze" v-if="record.status === 'FROZEN'">解冻</a-doption>
                      <a-doption value="void" v-if="record.status !== 'VOID'">作废</a-doption>
                  </template>
              </a-dropdown>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <!-- Detail Drawer -->
    <a-drawer :width="500" :visible="detailVisible" @ok="detailVisible = false" @cancel="detailVisible = false" :footer="false">
        <template #title>佣金详情 (ID: {{ currentDetail?.id }})</template>
        <div v-if="currentDetail">
             <a-descriptions :column="1" bordered>
                <a-descriptions-item label="ID">{{ currentDetail.id }}</a-descriptions-item>
                <a-descriptions-item label="收款用户ID">{{ currentDetail.user_id }}</a-descriptions-item>
                <a-descriptions-item label="金额">{{ currentDetail.amount }}</a-descriptions-item>
                <a-descriptions-item label="状态">{{ currentDetail.status }}</a-descriptions-item>
                <a-descriptions-item label="人工干预">{{ currentDetail.manual_flag ? '是' : '否' }}</a-descriptions-item>
                <a-descriptions-item label="来源订单">{{ currentDetail.source_order_id || '-' }}</a-descriptions-item>
                <a-descriptions-item label="规则快照" v-if="currentDetail.rule_snapshot">
                    <pre style="background: #f5f5f5; padding: 5px; border-radius: 4px; overflow: auto; max-height: 200px;">{{ currentDetail.rule_snapshot }}</pre>
                </a-descriptions-item>
             </a-descriptions>
        </div>
    </a-drawer>

    <!-- Action Modal (Freeze/Void/Unfreeze) -->
    <a-modal v-model:visible="actionVisible" @ok="submitAction" @cancel="actionVisible = false">
        <template #title>{{ actionTitle }} (ID: {{ currentId }})</template>
        <a-form :model="actionForm">
            <a-form-item field="reason" label="原因" :rules="[{required:true}]">
                <a-textarea v-model="actionForm.reason" placeholder="请输入操作原因" />
            </a-form-item>
        </a-form>
    </a-modal>

    <!-- Manual Modal -->
    <a-modal v-model:visible="manualVisible" @ok="submitManual" @cancel="manualVisible = false">
        <template #title>{{ manualType === 'CREDIT' ? '人工补发' : '人工扣除' }}</template>
        <a-form :model="manualForm">
            <a-form-item field="user_id" label="用户ID" :rules="[{required:true}]">
                <a-input-number v-model="manualForm.user_id" placeholder="用户ID" />
            </a-form-item>
            <a-form-item field="amount" label="金额" :rules="[{required:true}]">
                <a-input-number v-model="manualForm.amount" :min="0.01" :precision="2" />
            </a-form-item>
            <a-form-item field="reason" label="原因" :rules="[{required:true}]">
                <a-textarea v-model="manualForm.reason" />
            </a-form-item>
        </a-form>
    </a-modal>

    <!-- Rule Config Modal -->
    <a-modal v-model:visible="ruleVisible" @ok="submitRule" @cancel="ruleVisible = false">
        <template #title>分佣规则配置</template>
        <a-form :model="ruleForm">
            <a-form-item field="name" label="配置名称" :rules="[{required:true}]">
                <a-input v-model="ruleForm.name" placeholder="例如: 2023 Q1 Ver" />
            </a-form-item>
            <a-form-item field="config" label="JSON配置" :rules="[{required:true}]">
                <a-textarea v-model="ruleForm.config" :auto-size="{minRows:5}" placeholder="{ 'level_1': 0.10 ... }" />
            </a-form-item>
        </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue';
import { 
    getCommissionList, 
    getCommissionDetail, 
    freezeCommission, 
    unfreezeCommission, 
    voidCommission,
    manualCreditCommission,
    manualReverseCommission,
    publishCommissionRule,
    getActiveCommissionRule,
} from '@/api/commission';
import { CommissionStatusMap, CommissionStatusColorMap } from '@/types/commission';
import type { CommissionListItem, CommissionDetail, CommissionStatus, CommissionType } from '@/types/commission';
import { Message } from '@arco-design/web-vue';
import { IconDown } from '@arco-design/web-vue/es/icon';

const loading = ref(false);
const renderData = ref<CommissionListItem[]>([]);
const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0,
});

const form = reactive({
  user_id: undefined,
  status: undefined as CommissionStatus | undefined,
  type: undefined as CommissionType | undefined,
});

// Detail
const detailVisible = ref(false);
const currentDetail = ref<CommissionDetail | null>(null);

// Action
const actionVisible = ref(false);
const currentId = ref(0);
const actionType = ref(''); // freeze, unfreeze, void
const actionTitle = ref('');
const actionForm = reactive({ reason: '' });

// Manual
const manualVisible = ref(false);
const manualType = ref<'CREDIT' | 'REVERSE'>('CREDIT');
const manualForm = reactive({ user_id: undefined, amount: 0, reason: '' });

// Rule
const ruleVisible = ref(false);
const ruleForm = reactive({ name: '', config: '' });

const fetchData = async () => {
  loading.value = true;
  try {
    const { data } = await getCommissionList({
      page: pagination.current,
      page_size: pagination.pageSize,
      user_id: form.user_id,
      status: form.status,
      type: form.type
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

const handleDetail = async (record: CommissionListItem) => {
    loading.value = true;
    try {
        const { data } = await getCommissionDetail(record.id);
        currentDetail.value = data;
        detailVisible.value = true;
    } finally {
        loading.value = false;
    }
};

const handleAction = (value: any, record: CommissionListItem) => {
    currentId.value = record.id;
    actionType.value = value;
    actionForm.reason = '';
    
    if (value === 'freeze') actionTitle.value = '冻结佣金';
    else if (value === 'unfreeze') actionTitle.value = '解冻佣金';
    else if (value === 'void') actionTitle.value = '作废佣金';
    
    actionVisible.value = true;
};

const submitAction = async () => {
    if (!actionForm.reason) {
        Message.warning('请输入原因');
        return;
    }
    const reason = actionForm.reason;
    if (actionType.value === 'freeze') await freezeCommission(currentId.value, reason);
    else if (actionType.value === 'unfreeze') await unfreezeCommission(currentId.value, reason);
    else if (actionType.value === 'void') await voidCommission(currentId.value, reason);
    
    Message.success('操作成功');
    actionVisible.value = false;
    fetchData();
};

const openManual = (type: 'CREDIT' | 'REVERSE') => {
    manualType.value = type;
    manualForm.user_id = undefined;
    manualForm.amount = 0;
    manualForm.reason = '';
    manualVisible.value = true;
};

const submitManual = async () => {
    if (!manualForm.user_id || !manualForm.amount || !manualForm.reason) {
         Message.warning('请填写完整');
         return;
    }
    const data = { 
        user_id: Number(manualForm.user_id), 
        amount: manualForm.amount, 
        reason: manualForm.reason 
    };
    if (manualType.value === 'CREDIT') await manualCreditCommission(data);
    else await manualReverseCommission(data);
    
    Message.success('操作成功');
    manualVisible.value = false;
    fetchData();
};

const submitRule = async () => {
    if (!ruleForm.name || !ruleForm.config) return;
    try {
        JSON.parse(ruleForm.config); // Validate JSON
    } catch (e) {
        Message.error('JSON格式错误');
        return;
    }
    await publishCommissionRule({ ...ruleForm });
    Message.success('配置已发布');
    ruleVisible.value = false;
};

watch(ruleVisible, async (visible) => {
  if (!visible) return;
  try {
    const { data } = await getActiveCommissionRule();
    ruleForm.name = data.name || '默认分佣规则';
    ruleForm.config = typeof data.config === 'string' ? data.config : JSON.stringify(data.config || {}, null, 2);
  } catch (e) {
    console.error(e);
  }
});

onMounted(() => {
  fetchData();
});
</script>
