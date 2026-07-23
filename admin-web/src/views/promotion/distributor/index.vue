<template>
  <div class="container" style="padding: 20px;">
    <a-card class="general-card" title="分销员管理">
      <a-form :model="form" layout="inline" style="margin-bottom: 20px">
        <a-form-item field="level_id" label="等级">
          <a-select v-model="form.level_id" placeholder="全部" allow-clear style="width: 150px">
              <!-- Mock levels, ideally fetch from backend config -->
            <a-option :value="1">Level 1</a-option>
            <a-option :value="2">Level 2</a-option>
            <a-option :value="3">Level 3</a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="audit_status" label="审核状态">
          <a-select v-model="form.audit_status" placeholder="全部" allow-clear style="width: 150px">
            <a-option :value="0">待审核</a-option>
            <a-option :value="1">已通过</a-option>
            <a-option :value="2">已驳回</a-option>
          </a-select>
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
        row-key="user_id"
      >
        <template #columns>
          <a-table-column title="用户ID" data-index="user_id" :width="100" />
          <!-- Ideally username should be here if list API returns it -->
          <a-table-column title="等级" data-index="level_id">
              <template #cell="{ record }">Level {{ record.level_id }}</template>
          </a-table-column>
          <a-table-column title="累计佣金" data-index="total_commission">
              <template #cell="{ record }">{{ record.total_commission.toFixed(2) }}</template>
          </a-table-column>
          <a-table-column title="累计销量" data-index="total_sales">
              <template #cell="{ record }">{{ record.total_sales.toFixed(2) }}</template>
          </a-table-column>
          <a-table-column title="状态" data-index="audit_status">
            <template #cell="{ record }">
              <a-tag :color="AuditStatusColorMap[record.audit_status]">
                {{ AuditStatusMap[record.audit_status] }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="申请时间" data-index="join_time" />
          <a-table-column title="操作">
            <template #cell="{ record }">
              <a-button type="text" size="small" @click="handleDetail(record)">详情</a-button>
              <a-button type="text" size="small" v-if="record.audit_status === 0" @click="openAudit(record)">审核</a-button>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <!-- Detail Drawer -->
    <a-drawer :width="700" :visible="detailVisible" @ok="detailVisible = false" @cancel="detailVisible = false" :footer="false">
        <template #title>分销员档案 (User ID: {{ currentDetail?.user.user_id }})</template>
        <div v-if="currentDetail">
            <a-tabs>
                <a-tab-pane key="1" title="基础档案">
                    <a-descriptions :column="2" bordered>
                        <a-descriptions-item label="用户名">{{ currentDetail.user.username }}</a-descriptions-item>
                        <a-descriptions-item label="手机号">{{ currentDetail.user.phone || '-' }}</a-descriptions-item>
                        <a-descriptions-item label="等级">Level {{ currentDetail.profile.level_id }}</a-descriptions-item>
                        <a-descriptions-item label="状态">
                            <a-tag :color="AuditStatusColorMap[currentDetail.profile.audit_status]">
                                {{ AuditStatusMap[currentDetail.profile.audit_status] }}
                            </a-tag>
                        </a-descriptions-item>
                        <a-descriptions-item label="累计佣金">{{ currentDetail.profile.total_commission.toFixed(2) }}</a-descriptions-item>
                        <a-descriptions-item label="累计销量">{{ currentDetail.profile.total_sales.toFixed(2) }}</a-descriptions-item>
                    </a-descriptions>
                    
                    <a-divider />
                    
                    <h3>团队概况</h3>
                    <a-descriptions :column="3" bordered>
                        <a-descriptions-item label="一级下线">{{ currentDetail.team.l1_count }}</a-descriptions-item>
                        <a-descriptions-item label="二级下线">{{ currentDetail.team.l2_count }}</a-descriptions-item>
                        <a-descriptions-item label="三级下线">{{ currentDetail.team.l3_count }}</a-descriptions-item>
                    </a-descriptions>
                    
                    <a-divider />

                    <h3>等级调整</h3>
                     <a-form layout="inline" @submit="handleLevelUpdate">
                        <a-form-item label="新等级">
                             <a-select v-model="levelForm.level_id" style="width: 120px">
                                <a-option :value="1">Level 1</a-option>
                                <a-option :value="2">Level 2</a-option>
                                <a-option :value="3">Level 3</a-option>
                             </a-select>
                        </a-form-item>
                        <a-form-item label="原因">
                             <a-input v-model="levelForm.reason" placeholder="调整原因" />
                        </a-form-item>
                        <a-form-item>
                             <a-button type="primary" html-type="submit" status="warning">调整</a-button>
                        </a-form-item>
                     </a-form>
                     
                     <a-divider />
                     
                     <h3>推广链接</h3>
                     <a-spin :loading="linkLoading">
                         <div v-if="linkInfo" style="display: flex; align-items: center; justify-content: space-between; background: #f5f5f5; padding: 10px; border-radius: 4px;">
                             <div>
                                 <div><strong>Code:</strong> {{ linkInfo.invite_code }}</div>
                                 <div style="color: gray; font-size: 12px;">{{ linkInfo.link }}</div>
                             </div>
                             <a-button size="small" status="danger" @click="resetLink(currentDetail.user.user_id)">重置链接</a-button>
                         </div>
                         <a-button v-else @click="fetchLink(currentDetail.user.user_id)">加载推广链接</a-button>
                     </a-spin>
                </a-tab-pane>
                <a-tab-pane key="2" title="业绩订单">
                    <a-table :data="orderData" :loading="orderLoading" :pagination="orderPagination" @page-change="onOrderPageChange">
                        <template #columns>
                             <a-table-column title="订单号" data-index="id" />
                             <a-table-column title="下线用户" data-index="username">
                                 <template #cell="{ record }">{{ record.username }} (ID: {{ record.user_id }})</template>
                             </a-table-column>
                             <a-table-column title="金额" data-index="amount" />
                             <a-table-column title="时间" data-index="created_at" />
                        </template>
                    </a-table>
                </a-tab-pane>
            </a-tabs>
        </div>
    </a-drawer>

    <!-- Audit Modal -->
    <a-modal v-model:visible="auditVisible" @ok="handleAudit" @cancel="auditVisible = false">
        <template #title>分销资格审核</template>
        <a-form :model="auditForm">
            <a-form-item field="status" label="结果" :rules="[{required:true}]">
                <a-radio-group v-model="auditForm.status">
                    <a-radio :value="1">通过</a-radio>
                    <a-radio :value="2">驳回</a-radio>
                </a-radio-group>
            </a-form-item>
            <a-form-item field="reason" label="意见" :rules="[{required:true}]">
                <a-textarea v-model="auditForm.reason" placeholder="审核意见" />
            </a-form-item>
        </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue';
import { 
    getDistributorList, 
    getDistributorDetail, 
    auditDistributor, 
    updateDistributorLevel, 
    getUserPromoLink, 
    resetUserPromoLink,
    getDistributorOrders
} from '@/api/promotion';
import { AuditStatusMap, AuditStatusColorMap } from '@/types/promotion';
import type { DistributorListItem, DistributorDetail, AuditStatus, PromoLinkInfo, DistributorOrder } from '@/types/promotion';
import { Message } from '@arco-design/web-vue';

const loading = ref(false);
const renderData = ref<DistributorListItem[]>([]);
const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0,
});

const form = reactive({
  level_id: undefined,
  audit_status: undefined as AuditStatus | undefined,
});

// Detail
const detailVisible = ref(false);
const currentDetail = ref<DistributorDetail | null>(null);
const levelForm = reactive({ level_id: 1, reason: '' });
const linkLoading = ref(false);
const linkInfo = ref<PromoLinkInfo | null>(null);

// Orders in detail
const orderLoading = ref(false);
const orderData = ref<DistributorOrder[]>([]);
const orderPagination = reactive({
    current: 1,
    pageSize: 10,
    total: 0
});

// Audit
const auditVisible = ref(false);
const currentAuditUserId = ref(0);
const auditForm = reactive({ status: 1 as 1|2, reason: '' });


const fetchData = async () => {
  loading.value = true;
  try {
    const { data } = await getDistributorList({
      page: pagination.current,
      page_size: pagination.pageSize,
      level_id: form.level_id,
      audit_status: form.audit_status
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

const handleReset = () => {
  form.level_id = undefined;
  form.audit_status = undefined;
  handleSearch();
};

const onPageChange = (current: number) => {
  pagination.current = current;
  fetchData();
};

const handleDetail = async (record: DistributorListItem) => {
    loading.value = true;
    try {
        const { data } = await getDistributorDetail(record.user_id);
        currentDetail.value = data;
        levelForm.level_id = data.profile.level_id;
        levelForm.reason = '';
        linkInfo.value = null; // Reset link info
        detailVisible.value = true;
        
        // Fetch orders initially
        orderPagination.current = 1;
        fetchOrders(data.user.user_id);
    } finally {
        loading.value = false;
    }
};

const openAudit = (record: DistributorListItem) => {
    currentAuditUserId.value = record.user_id;
    auditForm.status = 1;
    auditForm.reason = '符合要求';
    auditVisible.value = true;
};

const handleAudit = async () => {
    await auditDistributor(currentAuditUserId.value, auditForm);
    Message.success('审核完成');
    auditVisible.value = false;
    fetchData();
};

const handleLevelUpdate = async () => {
    if (!currentDetail.value || !levelForm.reason) {
        Message.warning('请填写原因');
        return;
    }
    await updateDistributorLevel(currentDetail.value.user.user_id, {
        level_id: levelForm.level_id,
        reason: levelForm.reason
    });
    Message.success('等级已调整');
    // Refresh detail
    const { data } = await getDistributorDetail(currentDetail.value.user.user_id);
    currentDetail.value = data;
};

const fetchLink = async (userId: number) => {
    linkLoading.value = true;
    try {
        const { data } = await getUserPromoLink(userId);
        linkInfo.value = data;
    } finally {
        linkLoading.value = false;
    }
};

const resetLink = async (userId: number) => {
    linkLoading.value = true;
    try {
        await resetUserPromoLink(userId, '管理员手动重置');
        Message.success('链接已重置');
        await fetchLink(userId);
    } finally {
        linkLoading.value = false;
    }
};

const fetchOrders = async (userId: number) => {
    orderLoading.value = true;
    try {
        const { data } = await getDistributorOrders(userId, {
            page: orderPagination.current,
            page_size: orderPagination.pageSize
        });
        orderData.value = data.list;
        orderPagination.total = data.total;
    } finally {
        orderLoading.value = false;
    }
};

const onOrderPageChange = (current: number) => {
    if (currentDetail.value) {
        orderPagination.current = current;
        fetchOrders(currentDetail.value.user.user_id);
    }
};

onMounted(() => {
  fetchData();
});
</script>
