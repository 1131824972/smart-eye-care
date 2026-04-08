<script lang="ts" setup>
import { ref, onMounted, onUnmounted, nextTick, watch } from "vue"
import * as echarts from "echarts"
import { useResizeObserver } from "@vueuse/core"

const props = defineProps<{
  theme?: "dark" | "light"
}>()

const chartRef = ref<HTMLElement | null>(null)
let chartInstance: echarts.ECharts | null = null

// --- 高级配色方案 (Teal Theme) ---
const colors = {
  core: "#2dd4bf",      // 核心节点 (Teal-400)
  mechanism: "#0ea5e9", // 病理机制 (Sky-500)
  etiology: "#f59e0b",  // 病因 (Amber-500)
  symptom: "#f43f5e",   // 症状 (Rose-500)
  treatment: "#10b981", // 治疗 (Emerald-500)
  exam: "#8b5cf6"       // 检查 (Violet-500)
}

// --- 专业眼科数据构建 ---
const categories = [
  { name: "核心疾病" },
  { name: "病理机制" },
  { name: "致病因素" },
  { name: "典型症状" },
  { name: "诊疗手段" },
  { name: "临床检查" }
]

const nodes = [
  // Level 0: Core
  { id: "0", name: "干眼症 (DED)", symbolSize: 80, category: 0, value: 100, itemStyle: { color: colors.core, shadowBlur: 20, shadowColor: colors.core } },

  // Level 1: Mechanisms (病机)
  { id: "1", name: "泪膜不稳定", symbolSize: 50, category: 1, itemStyle: { color: colors.mechanism } },
  { id: "2", name: "泪液高渗", symbolSize: 50, category: 1, itemStyle: { color: colors.mechanism } },
  { id: "3", name: "眼表炎症", symbolSize: 45, category: 1, itemStyle: { color: colors.mechanism } },
  { id: "4", name: "神经感觉异常", symbolSize: 40, category: 1, itemStyle: { color: colors.mechanism } },

  // Level 2: Etiology (病因)
  { id: "5", name: "MGD (睑板腺功能障碍)", symbolSize: 60, category: 2, itemStyle: { color: colors.etiology } },
  { id: "6", name: "蠕形螨感染", symbolSize: 35, category: 2, itemStyle: { color: colors.etiology } },
  { id: "7", name: "VDT (视频终端)", symbolSize: 45, category: 2, itemStyle: { color: colors.etiology } },
  { id: "8", name: "隐形眼镜佩戴", symbolSize: 35, category: 2, itemStyle: { color: colors.etiology } },
  { id: "9", name: "干燥环境", symbolSize: 30, category: 2, itemStyle: { color: colors.etiology } },
  { id: "10", name: "睡眠障碍", symbolSize: 30, category: 2, itemStyle: { color: colors.etiology } },

  // Level 3: Symptoms (症状)
  { id: "11", name: "眼干涩", symbolSize: 30, category: 3, itemStyle: { color: colors.symptom } },
  { id: "12", name: "异物感", symbolSize: 30, category: 3, itemStyle: { color: colors.symptom } },
  { id: "13", name: "视力波动", symbolSize: 35, category: 3, itemStyle: { color: colors.symptom } },
  { id: "14", name: "畏光流泪", symbolSize: 30, category: 3, itemStyle: { color: colors.symptom } },

  // Level 4: Treatment (治疗)
  { id: "15", name: "人工泪液", symbolSize: 40, category: 4, itemStyle: { color: colors.treatment } },
  { id: "16", name: "IPL 强脉冲光", symbolSize: 50, category: 4, itemStyle: { color: colors.treatment } },
  { id: "17", name: "睑板腺按摩", symbolSize: 40, category: 4, itemStyle: { color: colors.treatment } },
  { id: "18", name: "湿房镜", symbolSize: 35, category: 4, itemStyle: { color: colors.treatment } },
  { id: "19", name: "抗炎药物", symbolSize: 35, category: 4, itemStyle: { color: colors.treatment } },

  // Level 5: Exam (检查)
  { id: "20", name: "BUT (泪膜破裂)", symbolSize: 45, category: 5, itemStyle: { color: colors.exam } },
  { id: "21", name: "泪河高度", symbolSize: 40, category: 5, itemStyle: { color: colors.exam } },
  { id: "22", name: "睑板腺照相", symbolSize: 45, category: 5, itemStyle: { color: colors.exam } },
  { id: "23", name: "OSDI 评分", symbolSize: 40, category: 5, itemStyle: { color: colors.exam } },
]

const links = [
  // Core -> Mechanism
  { source: "0", target: "1" }, { source: "0", target: "2" }, { source: "0", target: "3" }, { source: "0", target: "4" },

  // Mechanism -> Etiology (Causality)
  { source: "5", target: "1" }, // MGD -> 泪膜不稳定
  { source: "5", target: "2" }, // MGD -> 蒸发过强 -> 高渗
  { source: "6", target: "5" }, // 螨虫 -> MGD
  { source: "7", target: "1" }, // VDT -> 瞬目减少 -> 泪膜不稳定
  { source: "8", target: "3" }, // 隐形眼镜 -> 炎症
  { source: "9", target: "2" }, // 干燥 -> 高渗
  { source: "10", target: "4"}, // 睡眠 -> 神经痛

  // Symptom Links
  { source: "1", target: "13" }, // 不稳定 -> 视力波动
  { source: "3", target: "11" }, // 炎症 -> 干涩
  { source: "3", target: "12" }, // 炎症 -> 异物感
  { source: "4", target: "14" }, // 神经 -> 畏光

  // Diagnosis Links
  { source: "20", target: "1" }, // BUT 诊断 不稳定
  { source: "21", target: "2" }, // 泪河 诊断 缺水
  { source: "22", target: "5" }, // 照相 诊断 MGD
  { source: "23", target: "0" }, // OSDI 诊断 DED

  // Treatment Links (Therapeutic targets)
  { source: "15", target: "2" }, // 人工泪液 -> 降高渗
  { source: "16", target: "5" }, // IPL -> MGD
  { source: "16", target: "3" }, // IPL -> 抗炎
  { source: "17", target: "5" }, // 按摩 -> MGD
  { source: "18", target: "9" }, // 湿房镜 -> 环境
  { source: "19", target: "3" }, // 药物 -> 炎症
]

const initChart = () => {
  if (!chartRef.value) return
  chartInstance = echarts.init(chartRef.value)

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(15, 23, 42, 0.9)',
      borderColor: '#14b8a6',
      textStyle: { color: '#fff' },
      formatter: (params: any) => {
        if (params.dataType === 'node') {
          return `<div style="font-weight:bold">${params.name}</div><div style="font-size:12px;color:#94a3b8">${params.data.category < 6 ? categories[params.data.category].name : ''}</div>`
        }
        return `${params.data.source} <span style="color:#94a3b8">→</span> ${params.data.target}`
      }
    },
    legend: {
      show: true,
      bottom: 20,
      textStyle: { color: props.theme === 'light' ? '#64748b' : '#cbd5e1' },
      data: categories.map(c => c.name),
      selectedMode: 'multiple'
    },
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
          color: props.theme === 'light' ? '#334155' : '#e2e8f0',
          fontSize: 12
        },
        force: {
          repulsion: 400,
          edgeLength: [50, 150],
          gravity: 0.1
        },
        lineStyle: {
          color: props.theme === 'light' ? '#cbd5e1' : '#475569',
          curveness: 0.3,
          width: 1.5,
          opacity: 0.6
        },
        itemStyle: {
          borderColor: '#fff',
          borderWidth: 1,
          shadowBlur: 10
        },
        emphasis: {
          focus: 'adjacency',
          scale: true,
          lineStyle: {
            width: 3,
            color: '#14b8a6',
            opacity: 1
          },
          label: {
            fontWeight: 'bold',
            fontSize: 14
          }
        }
      }
    ]
  }

  chartInstance.setOption(option)
}

watch(() => props.theme, () => {
  if (chartInstance) {
    chartInstance.dispose()
    initChart()
  }
})

useResizeObserver(chartRef, () => {
  chartInstance?.resize()
})

onMounted(() => {
  nextTick(() => initChart())
})

onUnmounted(() => {
  chartInstance?.dispose()
})
</script>

<template>
  <div class="graph-wrapper">
    <!-- 图谱容器 -->
    <div ref="chartRef" class="chart-container"></div>

    <!-- 装饰性 UI：模拟高级数据面板 -->
    <div class="overlay-panel top-left">
      <div class="panel-title">PATHOLOGY NET</div>
      <div class="panel-val">Nodes: {{ nodes.length }}</div>
    </div>

    <div class="overlay-panel bottom-right">
      <div class="flex items-center gap-2 mb-1">
        <span class="dot bg-teal-400"></span>
        <span class="text-xs text-slate-400">Core Disease</span>
      </div>
      <div class="flex items-center gap-2 mb-1">
        <span class="dot bg-amber-400"></span>
        <span class="text-xs text-slate-400">Risk Factor</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="dot bg-emerald-400"></span>
        <span class="text-xs text-slate-400">Treatment</span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.graph-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  /* 极淡的网格背景，增加科技感 */
  background-image:
    linear-gradient(rgba(20, 184, 166, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(20, 184, 166, 0.03) 1px, transparent 1px);
  background-size: 40px 40px;
}

.chart-container {
  width: 100%;
  height: 100%;
}

.overlay-panel {
  position: absolute;
  pointer-events: none;
  z-index: 10;

  &.top-left {
    top: 20px;
    left: 20px;
    border-left: 2px solid #14b8a6;
    padding-left: 10px;

    .panel-title {
      font-size: 10px;
      color: #94a3b8;
      letter-spacing: 2px;
      font-weight: bold;
    }
    .panel-val {
      font-family: monospace;
      font-size: 16px;
      color: #14b8a6;
    }
  }

  &.bottom-right {
    bottom: 60px; /* 避开 ECharts Legend */
    right: 20px;
    background: rgba(15, 23, 42, 0.6);
    backdrop-filter: blur(4px);
    padding: 10px;
    border-radius: 8px;
    border: 1px solid rgba(255,255,255,0.05);

    .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      box-shadow: 0 0 5px currentColor;
    }
  }
}
</style>
