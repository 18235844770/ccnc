<template>
  <div class="container" style="padding: 20px;">
    <a-card class="general-card" title="用户列表">
      <a-form :model="form" layout="inline" style="margin-bottom: 20px">
        <a-form-item field="user_id" label="用户ID">
          <a-input-number v-model="form.user_id" placeholder="ID" />
        </a-form-item>
        <a-form-item field="keyword" label="搜索">
          <a-input v-model="form.keyword" placeholder="用户名/手机/邮箱" />
        </a-form-item>
        <a-form-item field="status" label="状态">
          <a-select v-model="form.status" placeholder="全部" allow-clear>
            <a-option value="NORMAL">正常</a-option>
            <a-option value="BANNED">封禁</a-option>
            <a-option value="FROZEN">冻结</a-option>
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
          <a-table-column title="ID" data-index="user_id" :width="80" />
          <a-table-column title="用户名" data-index="username" />
          <a-table-column title="手机号" data-index="phone_number" />
          <a-table-column title="状态" data-index="status">
            <template #cell="{ record }">
              <a-tag v-if="record.status === 'NORMAL'" color="green">正常</a-tag>
              <a-tag v-else-if="record.status === 'BANNED'" color="red">封禁</a-tag>
              <a-tag v-else color="orange">冻结</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="直推" data-index="promo_summary.l1_count" />
          <a-table-column title="注册时间" data-index="created_at" />
          <a-table-column title="操作">
            <template #cell="{ record }">
              <a-button type="text" size="small" @click="handleDetail(record)">详情</a-button>
              <a-button type="text" size="small" @click="handleManage(record)">管控</a-button>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <!-- Detail Drawer -->
    <a-drawer :width="600" :visible="detailVisible" @ok="detailVisible = false" @cancel="detailVisible = false" :footer="false">
        <template #title>用户详情 (ID: {{ currentDetail?.user.user_id }})</template>
        <div v-if="currentDetail">
            <a-descriptions title="基础信息" :column="2">
                <a-descriptions-item label="用户名">{{ currentDetail.user.username }}</a-descriptions-item>
                <a-descriptions-item label="手机">{{ currentDetail.user.phone_number }}</a-descriptions-item>
                <a-descriptions-item label="状态">{{ currentDetail.user.status }}</a-descriptions-item>
                <a-descriptions-item label="注册时间">{{ currentDetail.user.created_at }}</a-descriptions-item>
            </a-descriptions>
            
            <a-divider />
            
            <a-descriptions title="上级关系 (最近3级)" :column="1">
                <a-descriptions-item v-for="(up, index) in currentDetail.uplines" :key="up.user_id" :label="`Level ${index+1}`">
                    ID: {{ up.user_id }} / Name: {{ up.username }}
                </a-descriptions-item>
                <a-descriptions-item v-if="currentDetail.uplines.length === 0">无上级</a-descriptions-item>
            </a-descriptions>

            <a-divider />

            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <h3 style="margin: 0;">下线概览</h3>
                <a-button size="mini" @click="viewAllDownlines(currentDetail.user.user_id)">查看更多</a-button>
            </div>
            <a-tabs>
                <a-tab-pane key="1" title="一级下线">
                    <a-list size="small">
                         <a-list-item v-for="item in currentDetail.downlines.level_1" :key="item.user_id">{{ item.username }} (ID: {{ item.user_id }})</a-list-item>
                    </a-list>
                </a-tab-pane>
                 <a-tab-pane key="2" title="二级下线">
                    <a-list size="small">
                         <a-list-item v-for="item in currentDetail.downlines.level_2" :key="item.user_id">{{ item.username }} (ID: {{ item.user_id }})</a-list-item>
                    </a-list>
                </a-tab-pane>
                 <a-tab-pane key="3" title="三级下线">
                    <a-list size="small">
                         <a-list-item v-for="item in currentDetail.downlines.level_3" :key="item.user_id">{{ item.username }} (ID: {{ item.user_id }})</a-list-item>
                    </a-list>
                </a-tab-pane>
            </a-tabs>
             <a-divider />
            <h3 style="margin-bottom: 10px;">关系调整</h3>
             <a-form layout="inline" @submit="handleAdjustSubmit">
                <a-form-item label="新上级ID">
                    <a-input-number v-model="adjustForm.new_parent_user_id" placeholder="ID" />
                </a-form-item>
                <a-form-item label="原因">
                     <a-input v-model="adjustForm.reason" placeholder="原因" />
                </a-form-item>
                <a-form-item>
                     <a-button type="primary" html-type="submit" status="warning" v-permission="'user:adjust'">确认迁移</a-button>
                </a-form-item>
             </a-form>
        </div>
    </a-drawer>

    <!-- Ban/Unban Modal -->
    <a-modal v-model:visible="manageVisible" @ok="handleManageOk" @cancel="manageVisible = false">
      <template #title>账号管控 - {{ currentItem?.username }}</template>
      <a-radio-group v-model="manageForm.type" type="button" style="margin-bottom: 20px">
         <a-radio value="ban">封禁/冻结</a-radio>
         <a-radio value="unban">解封</a-radio>
      </a-radio-group>
      
      <a-form :model="manageForm" v-if="manageForm.type === 'ban'">
        <a-form-item field="mode" label="类型">
           <a-radio-group v-model="manageForm.mode">
              <a-radio value="BANNED">封禁 (禁止登录)</a-radio>
              <a-radio value="FROZEN">冻结 (禁止资金)</a-radio>
           </a-radio-group>
        </a-form-item>
        <a-form-item field="reason" label="原因">
          <a-textarea v-model="manageForm.reason" />
        </a-form-item>
      </a-form>
      
      <a-form :model="manageForm" v-else>
         <a-alert type="success" style="margin-bottom: 10px">将恢复用户为正常状态 (NORMAL)</a-alert>
         <a-form-item field="reason" label="原因">
          <a-textarea v-model="manageForm.reason" />
        </a-form-item>
      </a-form>
    </a-modal>
    
    <!-- Downlines Drawer (More) -->
    <a-drawer :width="600" :visible="downlinesVisible" @ok="downlinesVisible = false" @cancel="downlinesVisible = false" :footer="false">
        <template #title>下线查询 (ID: {{ currentDownlineUserId }})</template>
        <a-tabs v-model:active-key="downlineLevel" @change="fetchDownlines">
            <a-tab-pane key="1" title="一级下线"></a-tab-pane>
            <a-tab-pane key="2" title="二级下线"></a-tab-pane>
            <a-tab-pane key="3" title="三级下线"></a-tab-pane>
        </a-tabs>
        <a-table :data="downlineData" :loading="downlineLoading" :pagination="downlinePagination" @page-change="onDownlinePageChange">
             <template #columns>
                 <a-table-column title="ID" data-index="user_id" :width="80"/>
                 <a-table-column title="用户名" data-index="username" />
                 <a-table-column title="注册时间" data-index="created_at" />
             </template>
        </a-table>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { getUserList, getUserDetail, banUser, unbanUser, adjustUserUpline, getUserDownlines } from '@/api/user';
import type { UserListItem, UserDetailData } from '@/types/user';
import { Message } from '@arco-design/web-vue';

const loading = ref(false);
const renderData = ref<UserListItem[]>([]);
const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0,
});

const form = reactive({
  user_id: undefined,
  keyword: '',
  status: '',
});

// Detail
const detailVisible = ref(false);
const currentDetail = ref<UserDetailData | null>(null);
const adjustForm = reactive({
    new_parent_user_id: undefined,
    reason: ''
});

// Manage
const manageVisible = ref(false);
const currentItem = ref<UserListItem | null>(null);
const manageForm = reactive({
    type: 'ban', // ban or unban
    mode: 'BANNED' as 'BANNED' | 'FROZEN',
    reason: ''
});

// Downlines
const downlinesVisible = ref(false);
const currentDownlineUserId = ref(0);
const downlineLevel = ref('1');
const downlineLoading = ref(false);
const downlineData = ref<UserListItem[]>([]);
const downlinePagination = reactive({
    current: 1,
    pageSize: 20,
    total: 0
});


const fetchData = async () => {
  loading.value = true;
  try {
    const { data } = await getUserList({
      page: pagination.current,
      page_size: pagination.pageSize,
      user_id: form.user_id,
      keyword: form.keyword || undefined,
      status: form.status || undefined,
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
  form.keyword = '';
  form.status = '';
  handleSearch();
};

const onPageChange = (current: number) => {
  pagination.current = current;
  fetchData();
};

const handleDetail = async (record: UserListItem) => {
    loading.value = true; // Use global loading or local? Local better but simple global OK
    try {
        const { data } = await getUserDetail(record.user_id);
        currentDetail.value = data;
        adjustForm.new_parent_user_id = undefined;
        adjustForm.reason = '';
        detailVisible.value = true;
    } finally {
        loading.value = false;
    }
};

const handleAdjustSubmit = async () => {
    if (!currentDetail.value || !adjustForm.new_parent_user_id || !adjustForm.reason) {
        Message.warning('请填写完整信息');
        return;
    }
    await adjustUserUpline(currentDetail.value.user.user_id, {
        new_parent_user_id: Number(adjustForm.new_parent_user_id),
        reason: adjustForm.reason
    });
    Message.success('调整成功');
    // Refresh detail
    const { data } = await getUserDetail(currentDetail.value.user.user_id);
    currentDetail.value = data;
};

const handleManage = (record: UserListItem) => {
    currentItem.value = record;
    manageForm.type = 'ban';
    manageForm.mode = 'BANNED';
    manageForm.reason = '';
    manageVisible.value = true;
};

const handleManageOk = async () => {
    if (!currentItem.value) return;
    if (manageForm.type === 'ban') {
        await banUser(currentItem.value.user_id, {
            mode: manageForm.mode,
            reason: manageForm.reason
        });
        Message.success('已执行管控');
    } else {
        await unbanUser(currentItem.value.user_id, {
            reason: manageForm.reason
        });
        Message.success('已解除管控');
    }
    manageVisible.value = false;
    fetchData();
};

const viewAllDownlines = (userId: number) => {
    currentDownlineUserId.value = userId;
    downlinesVisible.value = true;
    downlineLevel.value = '1';
    downlinePagination.current = 1;
    fetchDownlines();
};

const fetchDownlines = async () => {
    downlineLoading.value = true;
    try {
        const { data } = await getUserDownlines(currentDownlineUserId.value, {
            level: Number(downlineLevel.value),
            page: downlinePagination.current,
            page_size: downlinePagination.pageSize
        });
        downlineData.value = data.records;
        downlinePagination.total = data.total;
    } finally {
        downlineLoading.value = false;
    }
};

const onDownlinePageChange = (current: number) => {
    downlinePagination.current = current;
    fetchDownlines();
};

onMounted(() => {
  fetchData();
});
</script>
