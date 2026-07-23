<template>
  <div class="chart" ref="chartRef" :style="{ width: width, height: height }"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import * as echarts from 'echarts';

const props = defineProps({
  options: {
    type: Object,
    required: true,
  },
  width: {
    type: String,
    default: '100%',
  },
  height: {
    type: String,
    default: '300px',
  },
});

const chartRef = ref<HTMLElement | null>(null);
let chartInstance: echarts.ECharts | null = null;

const initChart = () => {
  if (chartRef.value) {
    chartInstance = echarts.init(chartRef.value);
    chartInstance.setOption(props.options);
  }
};

const resizeHandler = () => {
  chartInstance?.resize();
};

watch(
  () => props.options,
  (newOptions) => {
    chartInstance?.setOption(newOptions, true);
  },
  { deep: true }
);

onMounted(() => {
  nextTick(() => {
    initChart();
    window.addEventListener('resize', resizeHandler);
  });
});

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.dispose();
    chartInstance = null;
  }
  window.removeEventListener('resize', resizeHandler);
});
</script>
