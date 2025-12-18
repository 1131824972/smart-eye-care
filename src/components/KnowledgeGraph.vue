<script lang="ts" setup>
import { ref, onMounted, onUnmounted, nextTick, watch } from "vue"
import * as echarts from "echarts"

// 接收父组件传递的主题参数
const props = defineProps({
  theme: {
    type: String,
    default: 'dark', // 默认深色模式
    validator: (value: string) => ['dark', 'light'].includes(value)
  }
})

const chartRef = ref<HTMLElement | null>(null)
let myChart: echarts.ECharts | null = null

// --- 1. 节点数据 ---
const nodes = [
  { id: "0", name: "干眼症 (DED)", category: 0, symbolSize: 80, value: 100 },
  { id: "1", name: "TBUT缩短", category: 1, symbolSize: 40, value: 80 },
  { id: "2", name: "Schirmer值低", category: 1, symbolSize: 40, value: 80 },
  { id: "3", name: "睑板腺萎缩", category: 1, symbolSize: 45, value: 85 },
  { id: "4", name: "角膜上皮缺损", category: 1, symbolSize: 35, value: 70 },
  { id: "5", name: "角膜知觉减退", category: 1, symbolSize: 35, value: 75 },
  { id: "6", name: "眼睑闭合不全", category: 1, symbolSize: 30, value: 60 },
  { id: "7", name: "高海拔/紫外线", category: 2, symbolSize: 30, value: 50 },
  { id: "8", name: "视屏终端综合征", category: 2, symbolSize: 35, value: 60 },
  { id: "9", name: "隐形眼镜佩戴", category: 2, symbolSize: 25, value: 40 },
  { id: "10", name: "低湿度环境", category: 2, symbolSize: 25, value: 40 },
  { id: "11", name: "2型糖尿病", category: 3, symbolSize: 60, value: 95 },
  { id: "12", name: "干燥综合征", category: 3, symbolSize: 65, value: 98 },
  { id: "13", name: "类风湿关节炎", category: 3, symbolSize: 55, value: 90 },
  { id: "14", name: "甲状腺眼病", category: 3, symbolSize: 50, value: 85 },
  { id: "15", name: "红斑狼疮", category: 3, symbolSize: 50, value: 85 },
  { id: "16", name: "焦虑/抑郁", category: 3, symbolSize: 45, value: 80 }
]

// --- 2. 关系数据 ---
const links = [
  { source: "0", target: "1", label: { show: false } },
  { source: "0", target: "2", label: { show: false } },
  { source: "0", target: "3", label: { show: false } },
  { source: "0", target: "4", label: { show: false } },
  { source: "0", target: "5", label: { show: false } },
  { source: "7", target: "0", label: { formatter: "诱发" } },
  { source: "8", target: "1", label: { formatter: "加重" } },
  { source: "10", target: "0", label: { formatter: "环境关联" } },
  { source: "5", target: "11", label: { formatter: "高风险", show: true, color: '#ff4d4f' }, lineStyle: { color: '#ff4d4f', width: 2 } },
  { source: "1", target: "11", label: { formatter: "关联" } },
  { source: "2", target: "12", label: { formatter: "特异性", show: true, color: '#ff4d4f' }, lineStyle: { color: '#ff4d4f', width: 2 } },
  { source: "4", target: "12", label: { formatter: "并发" } },
  { source: "2", target: "13", label: { formatter: "免疫关联" } },
  { source: "6", target: "14", label: { formatter: "眼球突出" } },
  { source: "1", target: "14", label: { formatter: "泪液蒸发" } },
  { source: "2", target: "15", label: { formatter: "免疫损伤" } },
  { source: "0", target: "16", label: { formatter: "身心影响" } }
]

const categories = [
  { name: "核心病灶", itemStyle: { color: "#3b82f6" } },
  { name: "眼部体征", itemStyle: { color: "#10b981" } },
  { name: "环境因素", itemStyle: { color: "#f59e0b" } },
  { name: "全身疾病 (Target)", itemStyle: { color: "#f43f5e" } }
]

const initChart = () => {
  if (!chartRef.value) return
  if (myChart) myChart.dispose() // 重新初始化前销毁旧实例

  myChart = echarts.init(chartRef.value)

  // 根据主题定义颜色配置
  const isLight = props.theme === 'light'
  const textColor = isLight ? '#333333' : '#ffffff'
  const subTextColor = isLight ? '#666666' : '#cccccc'
  const borderColor = isLight ? '#fff' : '#fff' // 节点描边

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(50,50,50,0.9)',
      borderColor: '#777',
      textStyle: { color: '#fff' }
    },
    legend: {
      data: categories.map(a => a.name),
      textStyle: { color: subTextColor }, // 动态图例颜色
      bottom: 5,
      itemGap: 15,
      itemWidth: 10,
      itemHeight: 10
    },
    animationDuration: 1500,
    animationEasingUpdate: 'quinticInOut',
    series: [
      {
        type: 'graph',
        layout: 'force',
        data: nodes,
        links: links,
        categories: categories,
        roam: true,
        label: {
          show: true,
          position: 'right',
          formatter: '{b}',
          color: textColor, // 动态文字颜色 (关键修改)
          fontSize: 12,
          fontWeight: isLight ? 'bold' : 'normal'
        },
        lineStyle: {
          color: 'source',
          curveness: 0.3,
          opacity: 0.6
        },
        force: {
          repulsion: 300,
          gravity: 0.1,
          edgeLength: [40, 100]
        },
        emphasis: {
          focus: 'adjacency',
          lineStyle: { width: 3 }
        },
        itemStyle: {
          borderColor: borderColor,
          borderWidth: 1,
          shadowBlur: 5,
          shadowColor: 'rgba(0, 0, 0, 0.2)'
        }
      }
    ]
  }

  myChart.setOption(option)

  myChart.on('click', (params: any) => {
    if (params.dataType === 'node' && params.data.category === 3) {
      myChart?.dispatchAction({
        type: 'highlight',
        seriesIndex: 0,
        name: params.name
      })
    }
  })
}

const resize = () => myChart?.resize()

// 监听主题变化，动态重绘
watch(() => props.theme, () => {
  initChart()
})

onMounted(() => {
  nextTick(() => {
    initChart()
    window.addEventListener("resize", resize)
  })
})

onUnmounted(() => {
  window.removeEventListener("resize", resize)
  myChart?.dispose()
})
</script>

<template>
  <div class="kg-wrapper">
    <div ref="chartRef" class="chart-container"></div>
    <div class="kg-title-overlay" :class="theme">
      <div class="glow-text">Disease Prediction Model</div>
      <div class="sub-text">点击红色节点查看推理路径</div>
    </div>
  </div>
</template>

<style scoped>
.kg-wrapper { width: 100%; height: 100%; position: relative; overflow: hidden; }
.chart-container { width: 100%; height: 100%; }
.kg-title-overlay { position: absolute; top: 10px; left: 15px; pointer-events: none; }

/* 深色模式文字 */
.kg-title-overlay.dark .glow-text {
  font-size: 14px; font-weight: bold; color: #fff;
  text-shadow: 0 0 10px rgba(59, 130, 246, 0.8);
}
.kg-title-overlay.dark .sub-text { font-size: 11px; color: #94a3b8; }

/* 浅色模式文字 */
.kg-title-overlay.light .glow-text {
  font-size: 14px; font-weight: bold; color: #1e3a8a; /* 深蓝 */
  text-shadow: none;
}
.kg-title-overlay.light .sub-text { font-size: 11px; color: #64748b; }
</style>
