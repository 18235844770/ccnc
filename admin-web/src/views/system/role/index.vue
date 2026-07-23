<template>
  <div class="container" style="padding: 20px;">
    <a-card class="general-card" title="角色管理">
      <a-row style="margin-bottom: 16px">
        <a-col :span="12">
          <a-space>
            <a-button type="primary" @click="handleAdd">
              <template #icon><icon-plus /></template>
              新建角色
            </a-button>
          </a-space>
        </a-col>
      </a-row>
      <a-table :data="renderData" :loading="loading" row-key="id">
        <template #columns>
          <a-table-column title="ID" data-index="id" />
          <a-table-column title="角色名称" data-index="name" />
          <a-table-column title="权限字符" data-index="key" />
          <a-table-column title="状态" data-index="status">
            <template #cell="{ record }">
              <a-tag :color="record.status === 1 ? 'green' : 'red'">
                {{ record.status === 1 ? '启用' : '禁用' }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="创建时间" data-index="created_at" />
          <a-table-column title="操作">
            <template #cell="{ record }">
              <a-button type="text" size="small" @click="handleEdit(record)">编辑</a-button>
              <a-button type="text" size="small" @click="handleAssignMenu(record)">分配权限</a-button>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <!-- Role Form Modal -->
    <a-modal v-model:visible="visible" @ok="handleOk" @cancel="handleCancel">
      <template #title>{{ form.id ? '编辑角色' : '新建角色' }}</template>
      <a-form :model="form">
        <a-form-item field="name" label="角色名称">
          <a-input v-model="form.name" />
        </a-form-item>
        <a-form-item field="key" label="权限字符">
          <a-input v-model="form.key" />
        </a-form-item>
        <a-form-item field="status" label="状态">
          <a-select v-model="form.status">
            <a-option :value="1">启用</a-option>
            <a-option :value="0">禁用</a-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- Menu Assign Modal -->
    <a-modal v-model:visible="menuVisible" @ok="handleMenuOk" @cancel="handleMenuCancel">
      <template #title>分配菜单权限</template>
      <a-tree
        v-if="menuVisible"
        v-model:checked-keys="checkedKeys"
        :checkable="true"
        :data="menuTree"
        :fieldNames="{ key: 'id', title: 'name', children: 'children' }"
        style="max-height: 400px; overflow: auto;"
      />
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { getRoles, createRole, updateRole, assignRoleMenus, getMenus, getRoleMenus } from '@/api/system';
import type { Role, Menu } from '@/types/system';
import { Message } from '@arco-design/web-vue';
import { IconPlus } from '@arco-design/web-vue/es/icon';

const loading = ref(false);
const renderData = ref<Role[]>([]);
const visible = ref(false);
const menuVisible = ref(false);
const currentRoleId = ref<number>(0);
const menuTree = ref<Menu[]>([]);
const checkedKeys = ref<number[]>([]);

const form = reactive({
  id: 0,
  name: '',
  key: '',
  status: 1,
});

const fetchData = async () => {
  loading.value = true;
  try {
    const { data } = await getRoles();
    renderData.value = data;
  } finally {
    loading.value = false;
  }
};

const handleAdd = () => {
  form.id = 0;
  form.name = '';
  form.key = '';
  form.status = 1;
  visible.value = true;
};

const handleEdit = (record: Role) => {
  Object.assign(form, record);
  visible.value = true;
};

const handleOk = async () => {
  if (form.id === 0) {
    await createRole({ name: form.name, key: form.key, status: form.status });
    Message.success('创建成功');
  } else {
    await updateRole(form.id, { name: form.name, key: form.key, status: form.status });
    Message.success('更新成功');
  }
  visible.value = false;
  fetchData();
};

const handleCancel = () => {
  visible.value = false;
};

const handleAssignMenu = async (record: Role) => {
  currentRoleId.value = record.id;
  const [{ data: menus }, { data: roleMenus }] = await Promise.all([
    getMenus(),
    getRoleMenus(record.id),
  ]);
  menuTree.value = buildTree(menus);
  checkedKeys.value = roleMenus;
  menuVisible.value = true;
};

const handleMenuOk = async () => {
  await assignRoleMenus(currentRoleId.value, checkedKeys.value);
  Message.success('分配成功');
  menuVisible.value = false;
};

const handleMenuCancel = () => {
  menuVisible.value = false;
};

function buildTree(items: unknown) {
  if (!Array.isArray(items)) {
    return [];
  }

  if (items.some((item: any) => Array.isArray(item?.children))) {
    return items as Menu[];
  }

  const map: Record<number, Menu> = {};
  const roots: Menu[] = [];
  const list = JSON.parse(JSON.stringify(items)) as Menu[];

  list.forEach((item: Menu) => {
    map[item.id] = { ...item, children: [] };
  });
  list.forEach((item: Menu) => {
    if (item.parent_id && map[item.parent_id]) {
      map[item.parent_id].children?.push(map[item.id]);
    } else {
      roots.push(map[item.id]);
    }
  });
  return roots;
}

onMounted(() => {
  fetchData();
});
</script>
