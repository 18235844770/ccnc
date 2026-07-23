<template>
  <div class="container" style="padding: 20px;">
    <a-card class="general-card" title="Banner 管理">
      <a-row style="margin-bottom: 16px">
        <a-col :span="12">
          <a-space>
            <a-button type="primary" @click="handleAdd">
              <template #icon><icon-plus /></template>
              新建 Banner
            </a-button>
          </a-space>
        </a-col>
        <a-col :span="12" style="text-align: right;">
          <a-space>
            <a-select
              v-model="filterStatus"
              placeholder="状态筛选"
              style="width: 150px"
              allow-clear
              @change="handleSearch"
            >
              <a-option value="ACTIVE">启用</a-option>
              <a-option value="INACTIVE">停用</a-option>
            </a-select>
            <a-button @click="handleSearch">刷新</a-button>
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
          <a-table-column title="标题" data-index="title" />
          <a-table-column title="图片" :width="120">
            <template #cell="{ record }">
              <a-image
                v-if="record.image_url"
                :src="record.image_url"
                width="80"
                height="45"
                fit="cover"
              />
              <span v-else>-</span>
            </template>
          </a-table-column>
          <a-table-column title="跳转链接" data-index="link_url" :ellipsis="true" />
          <a-table-column title="排序" data-index="sort_order" :width="80" />
          <a-table-column title="状态" data-index="status" :width="100">
            <template #cell="{ record }">
              <a-tag v-if="record.status === 'ACTIVE'" color="green">启用</a-tag>
              <a-tag v-else color="gray">停用</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="生效时间" :width="200">
            <template #cell="{ record }">
              <div v-if="record.start_time || record.end_time">
                <div v-if="record.start_time">{{ formatTime(record.start_time) }}</div>
                <div v-else>-</div>
                <div v-if="record.end_time">至 {{ formatTime(record.end_time) }}</div>
                <div v-else>至 -</div>
              </div>
              <span v-else>不限制</span>
            </template>
          </a-table-column>
          <a-table-column title="创建时间" data-index="created_at" :width="180" />
          <a-table-column title="操作" :width="150">
            <template #cell="{ record }">
              <a-button type="text" size="small" @click="handleEdit(record)">编辑</a-button>
              <a-popconfirm content="确定要删除该 Banner 吗？" @ok="handleDelete(record.id)">
                <a-button type="text" status="danger" size="small">删除</a-button>
              </a-popconfirm>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <!-- Banner Form Modal -->
    <a-modal v-model:visible="visible" @ok="handleOk" @cancel="handleCancel" :width="600">
      <template #title>{{ form.id ? '编辑 Banner' : '新建 Banner' }}</template>
      <a-form :model="form" layout="vertical">
        <a-form-item field="title" label="标题" :rules="[{ required: true, message: '请输入标题' }]">
          <a-input v-model="form.title" placeholder="Banner 标题" />
        </a-form-item>
        <a-form-item field="image_url" label="图片地址" :rules="[{ required: true, message: '请输入图片地址' }]">
          <a-input v-model="form.image_url" placeholder="https://example.com/banner.jpg" />
          <template #extra>
            <a-image v-if="form.image_url" :src="form.image_url" width="200" height="100" fit="cover" style="margin-top: 8px;" />
          </template>
        </a-form-item>
        <a-form-item field="link_url" label="跳转链接">
          <a-input v-model="form.link_url" placeholder="点击 Banner 跳转的链接（可选）" />
        </a-form-item>
        <a-form-item field="status" label="状态">
          <a-radio-group v-model="form.status">
            <a-radio value="ACTIVE">启用</a-radio>
            <a-radio value="INACTIVE">停用</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item field="sort_order" label="排序值">
          <a-input-number v-model="form.sort_order" :min="0" placeholder="越小越靠前" />
        </a-form-item>
        <a-form-item field="start_time" label="生效开始时间">
          <a-date-picker
            v-model="form.start_time"
            show-time
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
            placeholder="可选，为空表示不限制"
            allow-clear
          />
        </a-form-item>
        <a-form-item field="end_time" label="生效结束时间">
          <a-date-picker
            v-model="form.end_time"
            show-time
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
            placeholder="可选，为空表示不限制"
            allow-clear
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import {
  getBannerList,
  createBanner,
  updateBanner,
  deleteBanner,
  getBannerDetail,
} from '@/api/banner';
import type { Banner, BannerStatus } from '@/types/banner';
import { Message } from '@arco-design/web-vue';
import { IconPlus } from '@arco-design/web-vue/es/icon';

const loading = ref(false);
const renderData = ref<Banner[]>([]);
const visible = ref(false);
const filterStatus = ref<BannerStatus | undefined>(undefined);

const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0,
});

const form = reactive({
  id: 0,
  title: '',
  image_url: '',
  link_url: '',
  status: 'INACTIVE' as BannerStatus,
  sort_order: 0,
  start_time: undefined as string | undefined,
  end_time: undefined as string | undefined,
});

function formatTime(iso: string) {
  if (!iso) return '-';
  try {
    const d = new Date(iso);
    return d.toLocaleString('zh-CN');
  } catch {
    return iso;
  }
}

const fetchData = async () => {
  loading.value = true;
  try {
    const { data } = await getBannerList({
      page: pagination.current,
      page_size: pagination.pageSize,
      status: filterStatus.value,
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

const handleAdd = () => {
  form.id = 0;
  form.title = '';
  form.image_url = '';
  form.link_url = '';
  form.status = 'INACTIVE';
  form.sort_order = 0;
  form.start_time = undefined;
  form.end_time = undefined;
  visible.value = true;
};

function isoToDateTime(iso: string | null | undefined): string | undefined {
  if (!iso) return undefined;
  try {
    const d = new Date(iso);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const h = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    const s = String(d.getSeconds()).padStart(2, '0');
    return `${y}-${m}-${day} ${h}:${min}:${s}`;
  } catch {
    return undefined;
  }
}

const handleEdit = async (record: Banner) => {
  try {
    const { data } = await getBannerDetail(record.id);
    form.id = data.id;
    form.title = data.title;
    form.image_url = data.image_url;
    form.link_url = data.link_url || '';
    form.status = data.status;
    form.sort_order = data.sort_order;
    form.start_time = isoToDateTime(data.start_time);
    form.end_time = isoToDateTime(data.end_time);
    visible.value = true;
  } catch {
    Message.error('获取详情失败');
  }
};

const handleOk = async () => {
  if (form.id) {
    await updateBanner(form.id, {
      title: form.title,
      image_url: form.image_url,
      link_url: form.link_url || undefined,
      status: form.status,
      sort_order: form.sort_order,
      start_time: form.start_time ?? '',
      end_time: form.end_time ?? '',
    });
    Message.success('更新成功');
  } else {
    await createBanner({
      title: form.title,
      image_url: form.image_url,
      link_url: form.link_url || undefined,
      status: form.status,
      sort_order: form.sort_order,
      start_time: form.start_time || undefined,
      end_time: form.end_time || undefined,
    });
    Message.success('创建成功');
  }
  visible.value = false;
  fetchData();
};

const handleCancel = () => {
  visible.value = false;
};

const handleDelete = async (id: number) => {
  await deleteBanner(id);
  Message.success('删除成功');
  fetchData();
};

onMounted(() => {
  fetchData();
});
</script>
