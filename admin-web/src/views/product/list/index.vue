<template>
  <div class="container" style="padding: 20px;">
    <a-card class="general-card" title="理财产品管理">
      <a-row style="margin-bottom: 16px">
        <a-col :span="12">
          <a-space>
            <a-button type="primary" v-permission="'product:add'" @click="handleAdd">
              <template #icon><icon-plus /></template>
              发布产品
            </a-button>
          </a-space>
        </a-col>
        <a-col :span="12" style="text-align: right;">
           <a-space>
              <a-select v-model="filterStatus" placeholder="状态筛选" style="width: 150px" allow-clear @change="handleSearch">
                  <a-option value="ON_SALE">上架</a-option>
                  <a-option value="OFF_SALE">下架</a-option>
                  <a-option value="DRAFT">草稿</a-option>
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
          <a-table-column title="产品名称" data-index="name" />
          <a-table-column title="年化收益率" data-index="yield_rate">
             <template #cell="{ record }">{{ (record.yield_rate * 100).toFixed(2) }}%</template>
          </a-table-column>
          <a-table-column title="周期" data-index="cycle_days">
              <template #cell="{ record }">{{ record.cycle_days }} 天</template>
          </a-table-column>
          <a-table-column title="起投金额" data-index="min_amount" />
          <a-table-column title="状态" data-index="status">
            <template #cell="{ record }">
              <a-tag v-if="record.status === 'ON_SALE'" color="green">上架</a-tag>
              <a-tag v-else-if="record.status === 'DRAFT'" color="blue">草稿</a-tag>
              <a-tag v-else color="gray">下架</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="创建时间" data-index="created_at" />
          <a-table-column title="操作" :width="200">
            <template #cell="{ record }">
              <a-button type="text" size="small" v-permission="'product:edit'" @click="handleEdit(record)">编辑</a-button>
              <a-popconfirm content="确定要删除该产品吗?" @ok="handleDelete(record.id)">
                 <a-button type="text" status="danger" size="small" v-permission="'product:delete'">删除</a-button>
              </a-popconfirm>
              <a-button 
                type="text" 
                size="small" 
                v-permission="'product:status'"
                :status="record.status === 'ON_SALE' ? 'warning' : 'success'"
                @click="handleToggleStatus(record)"
              >
                {{ record.status === 'ON_SALE' ? '下架' : '上架' }}
              </a-button>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <a-modal v-model:visible="visible" :title="form.id ? '编辑产品' : '发布产品'" @ok="handleOk" @cancel="handleCancel" width="600px">
      <a-form :model="form" layout="vertical">
        <a-form-item field="name" label="产品名称" :rules="[{required:true}]">
          <a-input v-model="form.name" />
        </a-form-item>
        <a-row :gutter="16">
            <a-col :span="12">
                <a-form-item field="yield_rate" label="年化收益率 (小数，如 0.08 = 8%)" :rules="[{required:true}]">
                  <a-input-number v-model="form.yield_rate" :precision="4" :min="0" :max="1" style="width:100%" />
                </a-form-item>
            </a-col>
            <a-col :span="12">
                <a-form-item field="cycle_days" label="周期 (天)" :rules="[{required:true}]">
                  <a-input-number v-model="form.cycle_days" :min="1" style="width:100%" />
                </a-form-item>
            </a-col>
        </a-row>
        <a-row :gutter="16">
            <a-col :span="12">
                <a-form-item field="min_amount" label="起投金额" :rules="[{required:true}]">
                  <a-input-number v-model="form.min_amount" :min="0" style="width:100%" />
                </a-form-item>
            </a-col>
            <a-col :span="12">
                <a-form-item field="max_amount" label="限投金额 (0=不限)">
                  <a-input-number v-model="form.max_amount" :min="0" style="width:100%" />
                </a-form-item>
            </a-col>
        </a-row>
        <a-form-item field="description" label="产品描述">
            <a-textarea v-model="form.description" />
        </a-form-item>
        <a-form-item field="status" label="状态" :rules="[{required:true}]">
             <a-radio-group v-model="form.status">
                <a-radio value="ON_SALE">立即上架</a-radio>
                <a-radio value="DRAFT">草稿</a-radio>
                <a-radio value="OFF_SALE">下架</a-radio>
             </a-radio-group>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { getProductList, createProduct, updateProduct, deleteProduct } from '@/api/product';
import type { Product, ProductStatus } from '@/types/product';
import { Message } from '@arco-design/web-vue';
import { IconPlus } from '@arco-design/web-vue/es/icon';

const loading = ref(false);
const renderData = ref<Product[]>([]);
const visible = ref(false);
const filterStatus = ref<ProductStatus | undefined>(undefined);

const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0,
});

const form = reactive({
  id: 0,
  name: '',
  yield_rate: 0.08,
  cycle_days: 30,
  min_amount: 1000,
  max_amount: 0,
  description: '',
  status: 'ON_SALE' as ProductStatus,
});

const fetchData = async () => {
  loading.value = true;
  try {
    const { data } = await getProductList({ 
        page: pagination.current, 
        page_size: pagination.pageSize,
        status: filterStatus.value 
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
  form.name = '';
  form.yield_rate = 0.08;
  form.cycle_days = 30;
  form.min_amount = 1000;
  form.max_amount = 0;
  form.description = '';
  form.status = 'ON_SALE';
  visible.value = true;
};

const handleEdit = (record: Product) => {
  Object.assign(form, { ...record, id: record.id });
  visible.value = true;
};

const handleOk = async () => {
  const payload = {
    name: form.name,
    yield_rate: form.yield_rate,
    cycle_days: form.cycle_days,
    min_amount: form.min_amount,
    max_amount: form.max_amount || undefined,
    description: form.description,
    status: form.status,
  };
  if (form.id) {
    await updateProduct(form.id, payload);
    Message.success('更新成功');
  } else {
    await createProduct(payload);
    Message.success('发布成功');
  }
  visible.value = false;
  fetchData();
};

const handleCancel = () => {
  visible.value = false;
};

const handleDelete = async (id: number) => {
    await deleteProduct(id);
    Message.success('删除成功');
    fetchData();
};

const handleToggleStatus = async (record: Product) => {
    const newStatus = record.status === 'ON_SALE' ? 'OFF_SALE' : 'ON_SALE';
    await updateProduct(record.id, { status: newStatus });
    Message.success(newStatus === 'ON_SALE' ? '已上架' : '已下架');
    fetchData();
};

onMounted(() => {
  fetchData();
});
</script>
