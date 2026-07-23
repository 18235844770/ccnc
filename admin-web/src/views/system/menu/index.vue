<template>
  <div class="container" style="padding: 20px;">
    <a-card class="general-card" title="菜单管理">
      <a-row style="margin-bottom: 16px">
        <a-col :span="12">
          <a-space>
            <a-button type="primary" @click="handleAdd(0)">
              <template #icon><icon-plus /></template>
              新建菜单
            </a-button>
          </a-space>
        </a-col>
      </a-row>
      <a-table :data="renderData" :loading="loading" row-key="id" :default-expand-all-rows="true">
        <template #columns>
          <a-table-column title="菜单名称" data-index="name" />
          <a-table-column title="ID" data-index="id" :width="80" />
          <a-table-column title="类型" data-index="type">
            <template #cell="{ record }">
              <a-tag v-if="record.type === 1" color="arcoblue">目录</a-tag>
              <a-tag v-else-if="record.type === 2" color="green">菜单</a-tag>
              <a-tag v-else color="gray">按钮</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="路由路径" data-index="path" />
          <a-table-column title="组件路径" data-index="component" />
          <a-table-column title="权限标识" data-index="permission" />
          <a-table-column title="排序" data-index="sort" />
          <a-table-column title="操作" :width="160">
            <template #cell="{ record }">
              <a-button type="text" size="small" @click="handleEdit(record)">编辑</a-button>
              <a-button type="text" size="small" @click="handleAdd(record.id)">新增子项</a-button>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <!-- Menu Form Modal -->
    <a-modal v-model:visible="visible" @ok="handleOk" @cancel="handleCancel">
      <template #title>{{ form.id ? '编辑菜单' : '新建菜单' }}</template>
      <a-form :model="form">
        <a-form-item field="type" label="类型">
          <a-radio-group v-model="form.type">
            <a-radio :value="1">目录</a-radio>
            <a-radio :value="2">菜单</a-radio>
            <a-radio :value="3">按钮</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item field="parent_id" label="上级ID">
          <a-input-number v-model="form.parent_id" />
        </a-form-item>
        <a-form-item field="name" label="名称">
          <a-input v-model="form.name" />
        </a-form-item>
        <a-form-item field="path" label="路由路径" v-if="form.type !== 3">
          <a-input v-model="form.path" />
        </a-form-item>
        <a-form-item field="component" label="组件路径" v-if="form.type === 2">
          <a-input v-model="form.component" />
        </a-form-item>
        <a-form-item field="permission" label="权限标识" v-if="form.type !== 1">
          <a-input v-model="form.permission" />
        </a-form-item>
        <a-form-item field="sort" label="排序">
          <a-input-number v-model="form.sort" />
        </a-form-item>
        <a-form-item field="visible" label="可见">
          <a-switch v-model="form.visible" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { getMenus, createMenu, updateMenu } from '@/api/system';
import type { Menu } from '@/types/system';
import { Message } from '@arco-design/web-vue';
import { IconPlus } from '@arco-design/web-vue/es/icon';

const loading = ref(false);
const renderData = ref<Menu[]>([]);
const visible = ref(false);

const form = reactive({
  id: 0,
  parent_id: 0,
  name: '',
  type: 1 as 1 | 2 | 3,
  path: '',
  component: '',
  permission: '',
  sort: 1,
  visible: true,
});

const fetchData = async () => {
  loading.value = true;
  try {
    const { data } = await getMenus();
    renderData.value = buildTree(data);
  } finally {
    loading.value = false;
  }
};

const handleAdd = (parentId: number) => {
  form.id = 0;
  form.parent_id = parentId;
  form.name = '';
  form.type = 1;
  form.path = '';
  form.component = '';
  form.permission = '';
  form.sort = 1;
  form.visible = true;
  visible.value = true;
};

const handleEdit = (record: Menu) => {
  form.id = record.id;
  form.parent_id = record.parent_id;
  form.name = record.name;
  form.type = record.type;
  form.path = record.path || '';
  form.component = record.component || '';
  form.permission = record.permission || '';
  form.sort = record.sort;
  form.visible = record.visible;
  visible.value = true;
};

const handleOk = async () => {
  if (form.id === 0) {
    const { id, ...data } = form;
    await createMenu(data);
    Message.success('创建成功');
  } else {
    const { id, ...data } = form;
    await updateMenu(id, data);
    Message.success('更新成功');
  }
  visible.value = false;
  fetchData();
};

const handleCancel = () => {
  visible.value = false;
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
