<script lang="ts" setup>
import { ref, onMounted, onUnmounted, nextTick } from "vue"
import * as echarts from "echarts"

const chartRef = ref<HTMLElement | null>(null)
let myChart: echarts.ECharts | null = null

// --- 1. 定义节点数据 (Nodes) ---
// category: 0=核心, 1=眼部体征, 2=环境/生活, 3=全身疾病(预测目标)
const nodes = [
  // 核心
  { id: "0", name: "干眼症 (DED)", category: 0, symbolSize: 80, value: 100 },

  // 眼部体征 (Signs) - 作为预测的中介桥梁
  { id: "1", name: "泪膜破裂时间(BUT)短", category: 1, symbolSize: 40, value: 80 },
  { id: "2", name: "泪液分泌量(Schirmer)低", category: 1, symbolSize: 40, value: 80 },
  { id: "3", name: "睑板腺萎缩", category: 1, symbolSize: 45, value: 85 },
  { id: "4", name: "角膜上皮缺损", category: 1, symbolSize: 35, value: 70 },
  { id: "5", name: "角膜知觉减退", category: 1, symbolSize: 35, value: 75 }, // 糖尿病特异性体征
  { id: "6", name: "眼睑闭合不全", category: 1, symbolSize: 30, value: 60 },

  // 环境/生活因素 (Triggers)
  { id: "7", name: "高海拔/强紫外线", category: 2, symbolSize: 30, value: 50 },
  { id: "8", name: "视频终端综合征", category: 2, symbolSize: 35, value: 60 },
  { id: "9", name: "长期佩戴隐形眼镜", category: 2, symbolSize: 25, value: 40 },
  { id: "10", name: "空气湿度低", category: 2, symbolSize: 25, value: 40 },

  // 全身重大疾病 (Systemic Diseases) - 预测目标
  // 这些节点会做特殊的光效处理
  { id: "11", name: "2型糖尿病", category: 3, symbolSize: 60, value: 95 },
  { id: "12", name: "干燥综合征 (SS)", category: 3, symbolSize: 65, value: 98 },
  { id: "13", name: "类风湿性关节炎", category: 3, symbolSize: 55, value: 90 },
  { id: "14", name: "甲状腺相关眼病", category: 3, symbolSize: 50, value: 85 },
  { id: "15", name: "系统性红斑狼疮", category: 3, symbolSize: 50, value: 85 },
  { id: "16", name: "焦虑/抑郁症", category: 3, symbolSize: 45, value: 80 }
]

// --- 2. 定义关系数据 (Links) ---
const links = [
  // 核心 -> 体征
  { source: "0", target: "1", label: { show: false } },
  { source: "0", target: "2", label: { show: false } },
  { source: "0", target: "3", label: { show: false } },
  { source: "0", target: "4", label: { show: false } },
  { source: "0", target: "5", label: { show: false } },

  // 环境 -> 核心/体征
  { source: "7", target: "0", label: { formatter: "诱发" } },
  { source: "8", target: "1", label: { formatter: "加重" } },
  { source: "10", target: "0", label: { formatter: "环境关联" } },

  // *** 关键路径：眼部特征 -> 全身疾病预测 ***
  { source: "5", target: "11", label: { formatter: "高风险指征", show: true, fontSize: 10, color: '#ff4d4f' }, lineStyle: { color: '#ff4d4f', width: 2 } }, // 角膜知觉 -> 糖尿病
  { source: "1", target: "11", label: { formatter: "关联" } },

  { source: "2", target: "12", label: { formatter: "强特异性", show: true, fontSize: 10, color: '#ff4d4f' }, lineStyle: { color: '#ff4d4f', width: 2 } }, // Schirmer低 -> 干燥综合征
  { source: "4", target: "12", label: { formatter: "常见并发" } },

  { source: "2", target: "13", label: { formatter: "自身免疫关联" } }, // Schirmer -> 类风湿

  { source: "6", target: "14", label: { formatter: "眼球突出导致" } }, // 眼睑闭合不全 -> 甲状腺眼病
  { source: "1", target: "14", label: { formatter: "泪液蒸发过快" } },

  { source: "2", target: "15", label: { formatter: "免疫损伤" } },
  { source: "0", target: "16", label: { formatter: "身心交互影响" } }
]

const categories = [
  { name: "核心病灶", itemStyle: { color: "#3b82f6" } },
  { name: "眼部临床体征", itemStyle: { color: "#10b981" } },
  { name: "环境/生活因素", itemStyle: { color: "#f59e0b" } },
  { name: "全身关联疾病 (预测目标)", itemStyle: { color: "#f43f5e", shadowBlur: 10, shadowColor: "#f43f5e" } }
]

const initChart = () => {
  if (!chartRef.value) return
  myChart = echarts.init(chartRef.value)

  const option = {
    backgroundColor: 'transparent', // 适应深色背景
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        if (params.dataType === 'node') {
          const cat = categories[params.data.category].name
          return `<div style="padding:5px">
                    <div style="font-weight:bold">${params.name}</div>
                    <div style="font-size:12px;color:#ccc">${cat}</div>
                    <div style="margin-top:5px;font-size:12px">关联强度: ${params.value}%</div>
                  </div>`
        }
        // 连线提示
        return `${params.data.source} > ${params.data.target} : ${params.data.label?.formatter || '关联'}`
      },
      backgroundColor: 'rgba(50,50,50,0.9)',
      borderColor: '#777',
      textStyle: { color: '#fff' }
    },
    legend: {
      data: categories.map(a => a.name),
      textStyle: { color: '#ccc' },
      bottom: 10,
      itemGap: 20
    },
    animationDuration: 1500,
    animationEasingUpdate: 'quinticInOut',
    series: [
      {
        name: 'Knowledge Graph',
        type: 'graph',
        layout: 'force', // 力导向布局
        data: nodes,
        links: links,
        categories: categories,
        roam: true, // 允许缩放和平移
        label: {
          show: true,
          position: 'right',
          formatter: '{b}',
          color: '#fff',
          fontSize: 12
        },
        lineStyle: {
          color: 'source',
          curveness: 0.3,
          opacity: 0.6
        },
        force: {
          repulsion: 400, // 节点斥力
          gravity: 0.1,   // 向心力
          edgeLength: [50, 150] // 边长范围
        },
        emphasis: {
          focus: 'adjacency', // 聚焦相邻节点
          lineStyle: {
            width: 4
          }
        },
        // 节点样式
        itemStyle: {
          borderColor: '#fff',
          borderWidth: 1,
          shadowBlur: 5,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    ]
  }

  myChart.setOption(option)

  // --- 交互特效：点击全身疾病节点，高亮推理路径 ---
  myChart.on('click', (params: any) => {
    if (params.dataType === 'node' && params.data.category === 3) {
      // 如果点击的是全身疾病
      myChart?.dispatchAction({
        type: 'highlight',
        seriesIndex: 0,
        name: params.name
      })
    }
  })
}

const resize = () => myChart?.resize()

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

    <!-- 装饰性标题或图例说明 -->
    <div class="kg-title-overlay">
      <div class="glow-text">Systemic Disease Prediction Model</div>
      <div class="sub-text">点击红色节点查看疾病推演路径</div>
    </div>
  </div>
</template>

<style scoped>
.kg-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.chart-container {
  width: 100%;
  height: 100%;
}

.kg-title-overlay {
  position: absolute;
  top: 15px;
  left: 20px;
  pointer-events: none; /* 让鼠标事件穿透到图表 */
}

.glow-text {
  font-size: 16px;
  font-weight: bold;
  color: #fff;
  text-shadow: 0 0 10px rgba(59, 130, 246, 0.8);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  letter-spacing: 1px;
}

.sub-text {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 4px;
}
</style>
