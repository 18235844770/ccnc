<template>
  <div class="container" style="padding: 20px;">
    <div style="display: flex; justify-content: flex-end; margin-bottom: 12px;">
      <a-button v-permission="'stats:export'" type="outline" :loading="exporting" @click="handleExport">
        导出概览报表
      </a-button>
    </div>
    <!-- Top Cards -->
    <a-grid :cols="4" :colGap="12" :rowGap="12" style="margin-bottom: 20px;">
        <a-grid-item>
             <a-card title="今日新增用户" :bordered="false" class="data-card">
                 <div class="card-value">{{ overview?.cards.new_users || 0 }}</div>
             </a-card>
        </a-grid-item>
        <a-grid-item>
             <a-card title="累计投资金额" :bordered="false" class="data-card">
                 <div class="card-value">{{ overview?.cards.invest_amount?.toLocaleString() || 0 }}</div>
             </a-card>
        </a-grid-item>
        <a-grid-item>
             <a-card title="累计佣金发放" :bordered="false" class="data-card">
                 <div class="card-value">{{ overview?.cards.commission_paid?.toLocaleString() || 0 }}</div>
             </a-card>
        </a-grid-item>
        <a-grid-item>
             <a-card title="成功提现" :bordered="false" class="data-card">
                 <div class="card-value">{{ overview?.cards.withdraw_success_amount?.toLocaleString() || 0 }}</div>
             </a-card>
        </a-grid-item>
    </a-grid>

    <!-- Main Charts -->
    <a-row :gutter="20" style="margin-bottom: 20px;">
        <a-col :span="12">
            <a-card title="用户增长趋势" :bordered="false">
                 <Chart :options="userChartOptions" height="300px" />
            </a-card>
        </a-col>
        <a-col :span="12">
            <a-card title="转化漏斗 (注册->首投)" :bordered="false">
                 <Chart :options="funnelChartOptions" height="300px" />
            </a-card>
        </a-col>
    </a-row>

    <a-row :gutter="20">
         <a-col :span="16">
              <a-card title="产品销售排行" :bordered="false">
                  <a-table :data="productStats" :pagination="false" :scroll="{y: 240}">
                      <template #columns>
                          <a-table-column title="产品名称" data-index="product_name" />
                          <a-table-column title="总销售额" data-index="total_invest_amount" />
                          <a-table-column title="订单数" data-index="order_count" />
                      </template>
                  </a-table>
              </a-card>
         </a-col>
         <a-col :span="8">
              <a-card title="推广排行榜 (Top 5 邀请)" :bordered="false">
                   <a-list size="small">
                       <a-list-item v-for="(item, idx) in promoTop" :key="item.user_id">
                           <span style="font-weight: bold; margin-right: 10px;">{{ idx + 1 }}.</span>
                           {{ item.username }} 
                           <span style="float: right;">{{ item.invite_count }} 人</span>
                       </a-list-item>
                   </a-list>
              </a-card>
         </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { Message } from '@arco-design/web-vue';
import { getStatsOverview, getInvestByProduct, getPromoTop, getUserConversion, exportStatsTask, downloadStatsExport } from '@/api/stats';
import type { OverviewData, ProductInvestStats, PromoTopItem, ConversionData } from '@/types/stats';
import Chart from '@/components/Chart/index.vue';

const overview = ref<OverviewData | null>(null);
const productStats = ref<ProductInvestStats[]>([]);
const promoTop = ref<PromoTopItem[]>([]);
const conversionData = ref<ConversionData | null>(null);
const exporting = ref(false);

const fetchData = async () => {
  // 1. Overview
  const { data: ovData } = await getStatsOverview({ granularity: 'day' });
  overview.value = ovData;

  // 2. Product Stats
  const { data: prodData } = await getInvestByProduct({});
  productStats.value = prodData;

  // 3. Promo Top
  const { data: promoData } = await getPromoTop({ by: 'invite_count', limit: 5 });
  promoTop.value = promoData;

  // 4. Conversion
  const { data: convData } = await getUserConversion({});
  conversionData.value = convData;
};

const handleExport = async () => {
  exporting.value = true;
  try {
    const { data } = await exportStatsTask({ type: 'overview' });
    await downloadStatsExport(data.task_id);
    Message.success('导出成功');
  } catch {
    Message.error('导出失败');
  } finally {
    exporting.value = false;
  }
};

// Chart Options Computation
const userChartOptions = computed(() => {
    const series = overview.value?.new_users_series || [];
    return {
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: series.map(i => i.bucket) },
        yAxis: { type: 'value' },
        series: [{ data: series.map(i => i.value), type: 'line', smooth: true, areaStyle: {} }]
    };
});

const funnelChartOptions = computed(() => {
    const d = conversionData.value;
    if (!d) return {};
    return {
        tooltip: { trigger: 'item' },
        series: [
            {
                name: 'Conversion',
                type: 'funnel',
                left: '10%',
                top: 60,
                bottom: 60,
                width: '80%',
                min: 0,
                max: d.new_users || 100,
                minSize: '0%',
                maxSize: '100%',
                sort: 'descending',
                gap: 2,
                label: { show: true, position: 'inside' },
                data: [
                    { value: d.new_users, name: '注册用户' },
                    { value: d.first_invest_users, name: '首投用户' }
                ]
            }
        ]
    };
});

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.data-card {
    background: #f7f8fa;
    border-radius: 4px;
}
.card-value {
    font-size: 24px;
    font-weight: bold;
    color: #1d2129;
}
</style>
