<script lang="ts" setup>
import { ref, onMounted, onUnmounted, nextTick } from "vue"
import * as echarts from "echarts"
import YunnanMap from "@/components/YunnanMap.vue"
import KnowledgeGraph from "@/components/KnowledgeGraph.vue"
import {
  DataLine, Trophy, UserFilled, LocationInformation,
  Aim, Monitor, TrendCharts, PieChart,
  Connection, View
} from "@element-plus/icons-vue"
import { useRouter } from "vue-router"

const router = useRouter()

// 顶部统计数据 - 背景色调整为适配浅色模式的淡色背景
const statistics = [
  { title: "累计筛查患者", value: 12843, icon: UserFilled, color: "#14b8a6", bg: "#f0fdfa" }, // Teal-50
  { title: "全身疾病检出率", value: 24.5, suffix: "%", icon: Aim, color: "#f43f5e", bg: "#fff1f2" }, // Rose-50
  { title: "AI 诊断一致性", value: 96.8, suffix: "%", icon: Trophy, color: "#0ea5e9", bg: "#f0f9ff" }, // Sky-50
  { title: "覆盖云南州市", value: 16, icon: LocationInformation, color: "#10b981", bg: "#ecfdf5" }, // Emerald-50
]

// 实时日志数据
const liveLogs = ref([
  { time: "10:42:01", msg: "昆明: 检出睑板腺萎缩 III 级，提示 MGD", type: "warning" },
  { time: "10:41:55", msg: "大理: 泪液分泌量极低 (2mm)，AI 疑似干燥综合征", type: "danger" },
  { time: "10:41:30", msg: "预警: 角膜知觉减退，关联 糖尿病视网膜病变 风险", type: "danger" },
  { time: "10:40:12", msg: "丽江: OSDI 45分，生活质量显著受损", type: "info" },
  { time: "10:39:48", msg: "香格里拉: 结膜松弛 II 度", type: "warning" },
  { time: "10:37:10", msg: "系统: 完成第 12843 次多模态推理", type: "success" },
])

const diseaseChartRef = ref<HTMLElement | null>(null)
const monitorChartRef = ref<HTMLElement | null>(null)
const etiologyChartRef = ref<HTMLElement | null>(null)
const trendChartRef = ref<HTMLElement | null>(null)
const referralChartRef = ref<HTMLElement | null>(null)

let diseaseChart: echarts.ECharts | null = null
let monitorChart: echarts.ECharts | null = null
let etiologyChart: echarts.ECharts | null = null
let trendChart: echarts.ECharts | null = null
let referralChart: echarts.ECharts | null = null

// 通用图表配置：浅色模式文字颜色
const chartTextColor = '#64748b' // Slate-500
const chartTitleColor = '#334155' // Slate-700
const axisLineColor = '#e2e8f0'   // Slate-200

const initCharts = () => {
  // Chart 1: 全身共病风险预测 (左上)
  if (diseaseChartRef.value) {
    diseaseChart = echarts.init(diseaseChartRef.value)
    diseaseChart.setOption({
      backgroundColor: 'transparent',
      title: { text: '干眼并发全身疾病风险 Top5', left: 0, textStyle: { color: chartTitleColor, fontSize: 14, fontWeight: 600 } },
      tooltip: { trigger: 'axis', formatter: '{b}: {c}% 关联度', backgroundColor: 'rgba(255,255,255,0.9)', textStyle: { color: '#333' } },
      grid: { top: 40, left: 0, right: 40, bottom: 0, containLabel: true },
      xAxis: { type: 'value', show: false },
      yAxis: {
        type: 'category',
        data: ['睡眠障碍', '甲状腺眼病', '类风湿关节炎', '2型糖尿病', '干燥综合征'],
        axisLabel: { color: chartTextColor, fontSize: 12, width: 100, overflow: 'truncate' },
        axisLine: { show: false }, axisTick: { show: false }
      },
      series: [{
        type: 'bar',
        data: [45, 52, 60, 78, 92],
        barWidth: 12,
        itemStyle: {
          borderRadius: 6,
          // 渐变调整：Rose -> Teal
          color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [{offset: 0, color: '#f43f5e'}, {offset: 1, color: '#14b8a6'}])
        },
        label: { show: true, position: 'right', color: chartTextColor, fontSize: 12, formatter: '{c}%' }
      }]
    })
  }

  // Chart 2: 健康监测走势图 (右上)
  if (monitorChartRef.value) {
    monitorChart = echarts.init(monitorChartRef.value)
    monitorChart.setOption({
      backgroundColor: 'transparent',
      title: { text: '近7日健康监测趋势', left: 'center', top: 0, textStyle: { color: chartTitleColor, fontSize: 14, fontWeight: 600 } },
      tooltip: { trigger: 'axis', backgroundColor: 'rgba(255,255,255,0.9)', textStyle: { color: '#333' } },
      legend: { bottom: 0, textStyle: { color: chartTextColor }, itemWidth: 10, itemHeight: 10 },
      grid: { top: 35, left: '3%', right: '4%', bottom: '15%', containLabel: true },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
        axisLabel: { color: chartTextColor, fontSize: 12 },
        axisLine: { lineStyle: { color: axisLineColor } }
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: axisLineColor, type: 'dashed' } },
        axisLabel: { color: chartTextColor, fontSize: 12 }
      },
      series: [
        {
          name: '监测人数',
          type: 'line',
          smooth: true,
          symbol: 'none',
          data: [820, 932, 901, 934, 1290, 1330, 1320],
          lineStyle: { width: 3, color: '#14b8a6' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(20, 184, 166, 0.2)' },
              { offset: 1, color: 'rgba(20, 184, 166, 0.0)' }
            ])
          }
        },
        {
          name: '异常预警',
          type: 'line',
          smooth: true,
          symbol: 'none',
          data: [120, 132, 101, 134, 90, 230, 210],
          lineStyle: { width: 3, color: '#f43f5e' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(244, 63, 94, 0.2)' },
              { offset: 1, color: 'rgba(244, 63, 94, 0.0)' }
            ])
          }
        }
      ]
    })
  }

  // Chart 3: 病因学分类 (左中)
  if (etiologyChartRef.value) {
    etiologyChart = echarts.init(etiologyChartRef.value)
    etiologyChart.setOption({
      backgroundColor: 'transparent',
      tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)', backgroundColor: 'rgba(255,255,255,0.9)', textStyle: { color: '#333' } },
      legend: { bottom: 0, left: 'center', textStyle: { color: chartTextColor, fontSize: 11 }, itemWidth: 10, itemHeight: 10 },
      series: [{
        name: 'Etiology',
        type: 'pie',
        radius: ['45%', '65%'],
        center: ['50%', '40%'],
        label: { show: false },
        data: [
          { value: 450, name: 'MGD (脂质异常)', itemStyle: { color: '#14b8a6' } },
          { value: 320, name: '干燥综合征关联', itemStyle: { color: '#f43f5e' } },
          { value: 280, name: '视频终端综合征', itemStyle: { color: '#f59e0b' } },
          { value: 150, name: '其他混合型', itemStyle: { color: '#6366f1' } }
        ],
        itemStyle: { borderRadius: 5, borderColor: '#fff', borderWidth: 2 }
      }]
    })
  }

  // Chart 4: 治疗干预响应 (左下)
  if (trendChartRef.value) {
    trendChart = echarts.init(trendChartRef.value)
    trendChart.setOption({
      backgroundColor: 'transparent',
      title: { text: '干预后 OSDI 改善', left: 0, textStyle: { color: chartTitleColor, fontSize: 14, fontWeight: 600 } },
      tooltip: { trigger: 'axis', backgroundColor: 'rgba(255,255,255,0.9)', textStyle: { color: '#333' } },
      grid: { top: 35, left: '2%', right: '5%', bottom: '5%', containLabel: true },
      xAxis: { type: 'category', boundaryGap: false, data: ['初诊', '2周', '4周', '8周', '12周'], axisLabel: { color: chartTextColor, fontSize: 11 }, axisLine: {lineStyle: {color: axisLineColor}} },
      yAxis: { type: 'value', splitLine: { lineStyle: { color: axisLineColor, type: 'dashed' } }, axisLabel: { color: chartTextColor, fontSize: 11 } },
      series: [
        { name: '综合治疗', type: 'line', smooth: true, data: [65, 45, 32, 22, 15], itemStyle: { color: '#10b981' }, lineStyle: { width: 3 }, symbolSize: 6 },
        { name: '常规治疗', type: 'line', smooth: true, data: [62, 55, 48, 42, 38], itemStyle: { color: '#94a3b8' }, lineStyle: { width: 3, type: 'dashed' }, symbolSize: 6 }
      ]
    })
  }

  // Chart 5: 综合干预方案推荐 (右下)
  if (referralChartRef.value) {
    referralChart = echarts.init(referralChartRef.value)
    referralChart.setOption({
      backgroundColor: 'transparent',
      title: { text: 'AI 干预推荐', left: 0, textStyle: { color: chartTitleColor, fontSize: 14, fontWeight: 600 } },
      tooltip: { trigger: 'item', formatter: '{b}: {c}%', backgroundColor: 'rgba(255,255,255,0.9)', textStyle: { color: '#333' } },
      series: [{
        type: 'pie',
        radius: [15, 70],
        center: ['50%', '55%'],
        roseType: 'area',
        itemStyle: { borderRadius: 5 },
        label: { show: true, fontSize: 11, color: chartTextColor },
        labelLine: { show: true, length: 5, length2: 5, lineStyle: { color: axisLineColor } },
        data: [
          { value: 40, name: '代谢控制', itemStyle: { color: '#0ea5e9' } }, // Sky
          { value: 30, name: '物理治疗', itemStyle: { color: '#14b8a6' } }, // Teal
          { value: 20, name: '免疫调节', itemStyle: { color: '#f43f5e' } }, // Rose
          { value: 15, name: '环境干预', itemStyle: { color: '#f59e0b' } }, // Amber
          { value: 10, name: '心理疏导', itemStyle: { color: '#8b5cf6' } }  // Violet
        ]
      }]
    })
  }
}

const resizeCharts = () => {
  diseaseChart?.resize();
  monitorChart?.resize();
  etiologyChart?.resize();
  trendChart?.resize();
  referralChart?.resize()
}

onMounted(() => {
  nextTick(() => { initCharts(); window.addEventListener('resize', resizeCharts) })
})
onUnmounted(() => {
  window.removeEventListener('resize', resizeCharts)
  diseaseChart?.dispose();
  monitorChart?.dispose();
  etiologyChart?.dispose();
  trendChart?.dispose();
  referralChart?.dispose()
})
</script>

<template>
  <div class="dashboard-page">
    <!-- Header: 简洁的白底标题栏 -->
    <div class="header-bar">
      <div class="header-content">
        <div class="title">Smart Eye Care 医疗大数据指挥舱</div>
        <div class="sub-title">Multimodal Medical AI & Geographical Knowledge Graph Platform</div>
      </div>
      <div class="header-decoration"></div>
    </div>

    <!-- Stats Bar -->
    <div class="stats-bar">
      <div class="stat-item" v-for="(item, i) in statistics" :key="i">
        <div class="icon-box" :style="{ color: item.color, backgroundColor: item.bg }">
          <component :is="item.icon" />
        </div>
        <div class="info">
          <div class="label">{{ item.title }}</div>
          <div class="num" :style="{ color: '#1e293b' }">{{ item.value }}<small>{{ item.suffix }}</small></div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <div class="row-top">
        <div class="col-side">
          <div class="panel flex-1 mb-3">
            <div class="panel-header text-rose-500">
              <el-icon class="mr-2"><Connection /></el-icon> 全身共病关联预测
            </div>
            <div ref="diseaseChartRef" class="chart-box"></div>
          </div>
          <div class="panel h-[180px]">
            <div class="panel-header text-amber-500">
              <el-icon class="mr-2"><View /></el-icon> 病因学分类
            </div>
            <div ref="etiologyChartRef" class="chart-box"></div>
          </div>
        </div>

        <div class="col-center">
          <div class="map-container">
            <div class="map-title">云南省干眼症与环境因素监测</div>
            <div class="map-wrapper">
              <!-- 地图组件通常自带暗色，这里如果组件内部没改，可能需要微调组件本身，或者保留暗色地图作为视觉重心 -->
              <!-- 建议：如果 YunnanMap 支持 theme="light" 最好，暂且假设它能自适应或保留深色作为对比 -->
              <YunnanMap />
            </div>
            <div class="map-legend">
              <span><i class="dot bg-red-500"></i> 高风险</span>
              <span><i class="dot bg-amber-500"></i> 预警</span>
              <span><i class="dot bg-emerald-500"></i> 正常</span>
            </div>
          </div>
        </div>

        <div class="col-side">
          <div class="panel flex-1 mb-3 flex flex-col overflow-hidden">
            <div class="panel-header text-emerald-600">
              <el-icon class="mr-2"><Monitor /></el-icon> 实时诊疗动态
            </div>
            <div class="log-list flex-1 overflow-y-auto custom-scrollbar">
              <div v-for="(log, idx) in liveLogs" :key="idx" class="log-item">
                <span class="time">{{ log.time }}</span>
                <span class="msg" :class="`text-${log.type}`">{{ log.msg }}</span>
              </div>
            </div>
          </div>
          <div class="panel h-[200px] flex flex-col">
            <div class="panel-header text-sky-500">
              <el-icon class="mr-2"><Aim /></el-icon> 健康监测动态
            </div>
            <div ref="monitorChartRef" class="chart-box"></div>
          </div>
        </div>
      </div>

      <div class="row-bottom">
        <div class="panel w-1/4">
          <div class="panel-header text-teal-600">
            <el-icon class="mr-2"><TrendCharts /></el-icon> 治疗趋势
          </div>
          <div ref="trendChartRef" class="chart-box"></div>
        </div>

        <div class="kg-panel w-2/4 mx-3">
          <div class="panel-header border-b border-slate-200 mb-0">
            <el-icon class="mr-2 text-violet-500"><DataLine /></el-icon>
            <span class="text-slate-700">多模态因果知识图谱</span>
          </div>
          <div class="kg-wrapper">
            <!-- 知识图谱使用 Light 主题 -->
            <KnowledgeGraph theme="light" />
          </div>
        </div>

        <div class="panel w-1/4">
          <div class="panel-header text-blue-500">
            <el-icon class="mr-2"><PieChart /></el-icon> 综合干预方案
          </div>
          <div ref="referralChartRef" class="chart-box"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
/* 核心修改：改为浅灰背景 */
.dashboard-page {
  width: 100%;
  min-height: calc(100vh - 84px);
  background-color: #f8fafc; /* Slate-50 */
  color: #1e293b; /* Slate-800 */
  padding: 15px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Header */
.header-bar {
  text-align: center;
  margin-bottom: 15px;
  position: relative;

  .title {
    font-size: 24px; font-weight: 800; letter-spacing: 1px;
    background: linear-gradient(to right, #0f172a, #14b8a6);
    -webkit-background-clip: text; color: transparent;
  }
  .sub-title { font-size: 11px; color: #64748b; text-transform: uppercase; margin-top: 4px; letter-spacing: 1px; }
}

/* 统计卡片：白底 + 阴影 */
.stats-bar {
  display: flex; gap: 15px; margin-bottom: 15px;
  .stat-item {
    flex: 1;
    background: #ffffff;
    border: 1px solid #f1f5f9;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    border-radius: 12px; padding: 15px; display: flex; align-items: center;
    transition: all 0.3s;
    &:hover { transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }

    .icon-box { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 22px; margin-right: 15px; }
    .info {
      .label { font-size: 12px; color: #64748b; font-weight: 500; }
      .num { font-size: 22px; font-weight: 800; font-family: 'Arial'; }
      small { font-size: 12px; margin-left: 4px; color: #94a3b8; font-weight: normal; }
    }
  }
}

.main-content {
  flex: 1; display: flex; flex-direction: column; gap: 15px; min-height: 0;
}

.row-top {
  flex: 3; display: flex; gap: 15px; min-height: 0;
  .col-side { flex: 1.2; display: flex; flex-direction: column; }
  .col-center { flex: 2; }
}

.row-bottom {
  flex: 2; display: flex; min-height: 0;
}

/* 通用面板：白底 + 边框 */
.panel {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px; padding: 12px; display: flex; flex-direction: column;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);

  .panel-header {
    font-size: 14px; font-weight: 700; margin-bottom: 10px; display: flex; align-items: center;
  }
  .chart-box { flex: 1; width: 100%; min-height: 0; }
}

/* 地图容器：保持深色或改为浅色？这里为了对比度，地图背景改为极淡的 Teal 色 */
.map-container {
  height: 100%;
  background: #f0fdfa; /* Teal-50 */
  border: 1px solid #ccfbf1;
  border-radius: 12px; position: relative; display: flex; flex-direction: column; overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(20, 184, 166, 0.1);

  .map-title { position: absolute; top: 15px; left: 20px; font-size: 16px; font-weight: bold; color: #0f766e; z-index: 5; }
  .map-wrapper { flex: 1; width: 100%; }

  .map-legend {
    height: 36px; display: flex; justify-content: center; gap: 20px; align-items: center;
    font-size: 12px; color: #475569; background: rgba(255,255,255,0.6); backdrop-filter: blur(4px);
    .dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; margin-right: 6px; }
  }
}

/* 知识图谱面板 */
.kg-panel {
  background: #ffffff; border: 1px solid #e2e8f0;
  border-radius: 12px; display: flex; flex-direction: column;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);

  .panel-header { padding: 10px 15px; font-size: 14px; font-weight: bold; display: flex; align-items: center; background: #f8fafc; border-top-left-radius: 12px; border-top-right-radius: 12px; }
  .kg-wrapper { flex: 1; position: relative; background: #fff; border-bottom-left-radius: 12px; border-bottom-right-radius: 12px; overflow: hidden; }
}

/* 日志列表 */
.log-list {
  .log-item {
    font-size: 12px; padding: 6px 0; border-bottom: 1px solid #f1f5f9;
    display: flex; justify-content: space-between;
    &:last-child { border-bottom: none; }
    .time { color: #94a3b8; font-family: monospace; font-weight: 500; }
    .text-warning { color: #d97706; }
    .text-danger { color: #e11d48; }
    .text-success { color: #059669; }
    .text-info { color: #0284c7; }
  }
}

.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 2px; }
</style>
