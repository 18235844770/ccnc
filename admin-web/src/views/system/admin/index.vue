<template>
  <div class="container" style="padding: 20px;">
    <a-card class="general-card" title="管理员管理">
      <a-row style="margin-bottom: 16px">
        <a-col :span="12">
          <a-space>
            <a-button type="primary" @click="handleAdd">
              <template #icon><icon-plus /></template>
              新建管理员
            </a-button>
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
          <a-table-column title="ID" data-index="id" />
          <a-table-column title="用户名" data-index="username" />
          <a-table-column title="角色" data-index="roles">
            <template #cell="{ record }">
              <!-- Assuming roles is populated if backend returns it, otherwise empty -->
               <span v-if="record.roles && record.roles.length">
                 {{ record.roles.map((r: any) => r.name).join(', ') }}
               </span>
               <span v-else> - </span>
            </template>
          </a-table-column>
          <a-table-column title="创建时间" data-index="created_at" />
          <a-table-column title="操作">
            <template #cell="{ record }">
              <a-button type="text" size="small" @click="handleResetPwd(record)">重置密码</a-button>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <!-- Admin Form Modal -->
    <a-modal v-model:visible="visible" @ok="handleOk" @cancel="handleCancel">
      <template #title>新建管理员</template>
      <a-form :model="form">
        <a-form-item field="username" label="用户名">
          <a-input v-model="form.username" />
        </a-form-item>
        <a-form-item field="password" label="密码">
          <a-input-password v-model="form.password" />
        </a-form-item>
        <a-form-item field="role_ids" label="角色">
          <a-select v-model="form.role_ids" multiple>
            <a-option v-for="role in roleList" :key="role.id" :value="role.id">{{ role.name }}</a-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- Reset Pwd Modal -->
    <a-modal v-model:visible="resetVisible" @ok="handleResetOk" @cancel="handleResetCancel">
        <template #title>重置密码</template>
        <a-form :model="resetForm">
            <a-form-item field="password" label="新密码">
                <a-input-password v-model="resetForm.password" />
            </a-form-item>
        </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { getAdmins, createAdmin, resetAdminPassword, getRoles } from '@/api/system';
import type { AdminUser, Role } from '@/types/system';
import { Message } from '@arco-design/web-vue';
import { IconPlus } from '@arco-design/web-vue/es/icon';

const loading = ref(false);
const renderData = ref<AdminUser[]>([]);
const visible = ref(false);
const resetVisible = ref(false);
const roleList = ref<Role[]>([]);
const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0,
});

const form = reactive({
  username: '',
  password: '',
  role_ids: [] as number[],
});

const resetForm = reactive({
    id: 0,
    password: ''
});

const fetchData = async () => {
  loading.value = true;
  try {
    const { data } = await getAdmins({ 
        page: pagination.current, 
        page_size: pagination.pageSize 
    });
    // Assuming backend returns { list, total }
    renderData.value = data.list;
    pagination.total = data.total;
  } finally {
    loading.value = false;
  }
};

const fetchRoles = async () => {
    const { data } = await getRoles();
    roleList.value = data;
};

const onPageChange = (current: number) => {
  pagination.current = current;
  fetchData();
};

const handleAdd = () => {
  form.username = '';
  form.password = '';
  form.role_ids = [];
  visible.value = true;
};

const handleOk = async () => {
  await createAdmin({ ...form });
  Message.success('创建成功');
  visible.value = false;
  fetchData();
};

const handleCancel = () => {
  visible.value = false;
};

const handleResetPwd = (record: AdminUser) => {
    resetForm.id = record.id;
    resetForm.password = '';
    resetVisible.value = true;
};

const handleResetOk = async () => {
    await resetAdminPassword(resetForm.id, resetForm.password);
    Message.success('密码重置成功');
    resetVisible.value = false;
};

const handleResetCancel = () => {
    resetVisible.value = false;
};

onMounted(() => {
  fetchData();
  fetchRoles();
});
</script>
