<template>
  <div class="container" style="padding: 20px;">
    <a-card class="general-card" title="文章咨询管理">
      <a-row style="margin-bottom: 16px">
        <a-col :span="12">
          <a-space>
            <a-button type="primary" @click="handleAdd">
              <template #icon><icon-plus /></template>
              新建文章
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
              <a-option value="DRAFT">草稿</a-option>
              <a-option value="PUBLISHED">已发布</a-option>
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
          <a-table-column title="标题" data-index="title" :ellipsis="true" />
          <a-table-column title="标签" data-index="tags" :width="150" :ellipsis="true" />
          <a-table-column title="封面" :width="100">
            <template #cell="{ record }">
              <a-image
                v-if="record.cover_image"
                :src="record.cover_image"
                width="60"
                height="40"
                fit="cover"
              />
              <span v-else>-</span>
            </template>
          </a-table-column>
          <a-table-column title="状态" data-index="status" :width="100">
            <template #cell="{ record }">
              <a-tag v-if="record.status === 'PUBLISHED'" color="green">已发布</a-tag>
              <a-tag v-else color="gray">草稿</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="浏览量" data-index="view_count" :width="90" />
          <a-table-column title="发布时间" data-index="publish_time" :width="180">
            <template #cell="{ record }">
              {{ record.publish_time ? formatTime(record.publish_time) : '-' }}
            </template>
          </a-table-column>
          <a-table-column title="创建时间" data-index="created_at" :width="180" />
          <a-table-column title="操作" :width="150">
            <template #cell="{ record }">
              <a-button type="text" size="small" @click="handleEdit(record)">编辑</a-button>
              <a-popconfirm content="确定要删除该文章吗？" @ok="handleDelete(record.id)">
                <a-button type="text" status="danger" size="small">删除</a-button>
              </a-popconfirm>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <!-- Article Form Modal -->
    <a-modal
      v-model:visible="visible"
      @ok="handleOk"
      @cancel="handleCancel"
      :width="800"
      unmount-on-close
    >
      <template #title>{{ form.id ? '编辑文章' : '新建文章' }}</template>
      <a-form :model="form" layout="vertical">
        <a-form-item field="title" label="标题" :rules="[{ required: true, message: '请输入标题' }]">
          <a-input v-model="form.title" placeholder="文章标题" />
        </a-form-item>
        <a-form-item field="tags" label="标签">
          <a-input v-model="form.tags" placeholder="多个标签用逗号分隔，如：理财,投资,入门" />
        </a-form-item>
        <a-form-item field="description" label="描述/摘要">
          <a-textarea v-model="form.description" placeholder="文章摘要，用于列表展示" :auto-size="{ minRows: 2, maxRows: 4 }" />
        </a-form-item>
        <a-form-item field="cover_image" label="封面图">
          <a-input v-model="form.cover_image" placeholder="封面图 URL" />
          <template #extra>
            <a-image
              v-if="form.cover_image"
              :src="form.cover_image"
              width="120"
              height="80"
              fit="cover"
              style="margin-top: 8px;"
            />
          </template>
        </a-form-item>
        <a-form-item field="content" label="正文内容">
          <a-textarea
            v-model="form.content"
            placeholder="正文内容，支持 HTML 格式"
            :auto-size="{ minRows: 8, maxRows: 20 }"
          />
        </a-form-item>
        <a-form-item field="status" label="状态">
          <a-radio-group v-model="form.status">
            <a-radio value="DRAFT">草稿</a-radio>
            <a-radio value="PUBLISHED">已发布</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item field="sort_order" label="排序值">
          <a-input-number v-model="form.sort_order" :min="0" placeholder="默认 0" />
        </a-form-item>
        <a-form-item field="publish_time" label="发布时间">
          <a-date-picker
            v-model="form.publish_time"
            show-time
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
            placeholder="可选，为空表示立即发布"
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
  getArticleList,
  createArticle,
  updateArticle,
  deleteArticle,
  getArticleDetail,
} from '@/api/article';
import type { Article, ArticleStatus } from '@/types/article';
import { Message } from '@arco-design/web-vue';
import { IconPlus } from '@arco-design/web-vue/es/icon';

const loading = ref(false);
const renderData = ref<Article[]>([]);
const visible = ref(false);
const filterStatus = ref<ArticleStatus | undefined>(undefined);

const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0,
});

const form = reactive({
  id: 0,
  title: '',
  tags: '',
  description: '',
  cover_image: '',
  content: '',
  status: 'DRAFT' as ArticleStatus,
  sort_order: 0,
  publish_time: undefined as string | undefined,
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

const fetchData = async () => {
  loading.value = true;
  try {
    const { data } = await getArticleList({
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
  form.tags = '';
  form.description = '';
  form.cover_image = '';
  form.content = '';
  form.status = 'DRAFT';
  form.sort_order = 0;
  form.publish_time = undefined;
  visible.value = true;
};

const handleEdit = async (record: Article) => {
  try {
    const { data } = await getArticleDetail(record.id);
    form.id = data.id;
    form.title = data.title;
    form.tags = data.tags || '';
    form.description = data.description || '';
    form.cover_image = data.cover_image || '';
    form.content = data.content || '';
    form.status = data.status;
    form.sort_order = data.sort_order;
    form.publish_time = isoToDateTime(data.publish_time);
    visible.value = true;
  } catch {
    Message.error('获取详情失败');
  }
};

const handleOk = async () => {
  if (form.id) {
    await updateArticle(form.id, {
      title: form.title,
      tags: form.tags || undefined,
      description: form.description || undefined,
      cover_image: form.cover_image || undefined,
      content: form.content || undefined,
      status: form.status,
      sort_order: form.sort_order,
      publish_time: form.publish_time ?? '',
    });
    Message.success('更新成功');
  } else {
    await createArticle({
      title: form.title,
      tags: form.tags || undefined,
      description: form.description || undefined,
      cover_image: form.cover_image || undefined,
      content: form.content || undefined,
      status: form.status,
      sort_order: form.sort_order,
      publish_time: form.publish_time || undefined,
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
  await deleteArticle(id);
  Message.success('删除成功');
  fetchData();
};

onMounted(() => {
  fetchData();
});
</script>
