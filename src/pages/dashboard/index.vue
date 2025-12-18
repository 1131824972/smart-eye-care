<script lang="ts" setup>
import { ref, onMounted, onUnmounted, nextTick } from "vue"
import * as echarts from "echarts"
import YunnanMap from "@/components/YunnanMap.vue"
import KnowledgeGraph from "@/components/KnowledgeGraph.vue"
import {
  DataLine, Trophy, UserFilled, LocationInformation,
  Aim, Monitor, TrendCharts, PieChart,
  Connection, View // 移除了 Warning, CircleCheck, Timer
} from "@element-plus/icons-vue"
import { useRouter } from "vue-router"

const router = useRouter()

// ... (保持之前的 statistics, liveLogs, charts ref 和 initCharts 代码不变) ...
const statistics = [
  { title: "累计筛查患者", value: 12843, icon: UserFilled, color: "#40c9c6" },
  { title: "全身疾病检出率", value: 24.5, suffix: "%", icon: Aim, color: "#f4516c" },
  { title: "AI 诊断一致性", value: 96.8, suffix: "%", icon: Trophy, color: "#36a3f7" },
  { title: "覆盖云南州市", value: 16, icon: LocationInformation, color: "#34bfa3" },
]

// ... (省略了中间未变的代码，如 initCharts，确保你使用的是上一轮我最后发的版本) ...
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

const initCharts = () => {
  // Chart 1: 全身共病风险预测 (左上)
  if (diseaseChartRef.value) {
    diseaseChart = echarts.init(diseaseChartRef.value)
    diseaseChart.setOption({
      backgroundColor: 'transparent',
      title: { text: '干眼并发全身疾病风险 Top5', left: 0, textStyle: { color: '#fff', fontSize: 16, fontWeight: 600 } },
      tooltip: { trigger: 'axis', formatter: '{b}: {c}% 关联度' },
      grid: { top: 40, left: 0, right: 40, bottom: 0, containLabel: true },
      xAxis: { type: 'value', show: false },
      yAxis: {
        type: 'category',
        data: ['睡眠障碍', '甲状腺眼病', '类风湿关节炎', '2型糖尿病', '干燥综合征'],
        axisLabel: { color: '#ddd', fontSize: 13, width: 100, overflow: 'truncate' },
        axisLine: { show: false }, axisTick: { show: false }
      },
      series: [{
        type: 'bar',
        data: [45, 52, 60, 78, 92],
        barWidth: 14,
        itemStyle: {
          borderRadius: 7,
          color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [{offset: 0, color: '#f43f5e'}, {offset: 1, color: '#3b82f6'}])
        },
        label: { show: true, position: 'right', color: '#fff', fontSize: 13, formatter: '{c}%' }
      }]
    })
  }

  // Chart 2: 健康监测走势图 (右上)
  if (monitorChartRef.value) {
    monitorChart = echarts.init(monitorChartRef.value)
    monitorChart.setOption({
      backgroundColor: 'transparent',
      title: { text: '近7日健康监测趋势', left: 'center', top: 5, textStyle: { color: '#fff', fontSize: 16, fontWeight: 600 } },
      tooltip: { trigger: 'axis' },
      legend: { bottom: 0, textStyle: { color: '#ccc' }, itemWidth: 10, itemHeight: 10 },
      grid: { top: 40, left: '3%', right: '4%', bottom: '15%', containLabel: true },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
        axisLabel: { color: '#94a3b8', fontSize: 12 },
        axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } }
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
        axisLabel: { color: '#94a3b8', fontSize: 12 }
      },
      series: [
        {
          name: '监测人数',
          type: 'line',
          smooth: true,
          symbol: 'none',
          data: [820, 932, 901, 934, 1290, 1330, 1320],
          lineStyle: { width: 3, color: '#3b82f6' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
              { offset: 1, color: 'rgba(59, 130, 246, 0.05)' }
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
              { offset: 0, color: 'rgba(244, 63, 94, 0.3)' },
              { offset: 1, color: 'rgba(244, 63, 94, 0.05)' }
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
      tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
      legend: { bottom: 0, left: 'center', textStyle: { color: '#ccc', fontSize: 12 }, itemWidth: 10, itemHeight: 10 },
      series: [{
        name: 'Etiology',
        type: 'pie',
        radius: ['45%', '70%'],
        center: ['50%', '45%'],
        label: { show: false },
        data: [
          { value: 450, name: 'MGD (脂质异常)', itemStyle: { color: '#3b82f6' } },
          { value: 320, name: '干燥综合征关联', itemStyle: { color: '#f43f5e' } },
          { value: 280, name: '视频终端综合征', itemStyle: { color: '#fbbf24' } },
          { value: 150, name: '其他混合型', itemStyle: { color: '#34d399' } }
        ],
        itemStyle: { borderRadius: 5, borderColor: '#1e293b', borderWidth: 2 }
      }]
    })
  }

  // Chart 4: 治疗干预响应 (左下)
  if (trendChartRef.value) {
    trendChart = echarts.init(trendChartRef.value)
    trendChart.setOption({
      backgroundColor: 'transparent',
      title: { text: '干预后 OSDI 评分改善趋势', left: 0, textStyle: { color: '#eee', fontSize: 15, fontWeight: 600 } },
      tooltip: { trigger: 'axis' },
      grid: { top: 40, left: '2%', right: '5%', bottom: '5%', containLabel: true },
      xAxis: { type: 'category', boundaryGap: false, data: ['初诊', '2周', '4周', '8周', '12周'], axisLabel: { color: '#94a3b8', fontSize: 12 } },
      yAxis: { type: 'value', name: '评分', splitLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } }, axisLabel: { color: '#94a3b8', fontSize: 12 } },
      series: [
        { name: '综合治疗组', type: 'line', smooth: true, data: [65, 45, 32, 22, 15], itemStyle: { color: '#34d399' }, lineStyle: { width: 3 }, symbolSize: 6 },
        { name: '常规治疗组', type: 'line', smooth: true, data: [62, 55, 48, 42, 38], itemStyle: { color: '#60a5fa' }, lineStyle: { width: 3, type: 'dashed' }, symbolSize: 6 }
      ]
    })
  }

  // Chart 5: 综合干预方案推荐 (右下)
  if (referralChartRef.value) {
    referralChart = echarts.init(referralChartRef.value)
    referralChart.setOption({
      backgroundColor: 'transparent',
      title: { text: 'AI 综合干预方案推荐', left: 0, textStyle: { color: '#eee', fontSize: 15, fontWeight: 600 } },
      tooltip: { trigger: 'item', formatter: '{b}: {c}% 权重' },
      series: [{
        type: 'pie',
        radius: [20, 80],
        center: ['50%', '55%'],
        roseType: 'area', // 玫瑰图
        itemStyle: { borderRadius: 5 },
        label: { show: true, fontSize: 11, color: '#ccc' },
        labelLine: { show: true, length: 5, length2: 5 },
        data: [
          { value: 40, name: '代谢控制(血糖/血脂)', itemStyle: { color: '#3b82f6' } },
          { value: 30, name: '眼表物理治疗', itemStyle: { color: '#34d399' } },
          { value: 20, name: '全身免疫调节', itemStyle: { color: '#f43f5e' } },
          { value: 15, name: '生活方式(环境)', itemStyle: { color: '#fbbf24' } },
          { value: 10, name: '心理干预', itemStyle: { color: '#a78bfa' } }
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
    <!-- 动态背景粒子 (在暗黑背景上) -->
    <div class="bg-particles"></div>

    <!-- 1. 顶部 Header -->
    <div class="header-bar">
      <div class="header-content">
        <div class="glow-title">Smart Eye Care 医疗大数据指挥舱</div>
        <div class="sub-title">Multimodal Medical AI & Geographical Knowledge Graph Platform</div>
      </div>
      <!-- 移除退出按钮 -->
    </div>

    <!-- 2. 统计指标栏 -->
    <div class="stats-bar">
      <div class="stat-item" v-for="(item, i) in statistics" :key="i">
        <div class="icon-box" :style="{ color: item.color, backgroundColor: item.color + '15' }">
          <component :is="item.icon" />
        </div>
        <div class="info">
          <div class="label">{{ item.title }}</div>
          <div class="num">{{ item.value }}<small>{{ item.suffix }}</small></div>
        </div>
      </div>
    </div>

    <!-- 3. 主内容区域 (Grid 布局) -->
    <div class="main-content">

      <!-- 第一行：地图核心 + 左右侧分析 -->
      <div class="row-top">

        <!-- 左侧：人群与共病 -->
        <div class="col-side">
          <!-- 共病风险 -->
          <div class="panel flex-1 mb-3">
            <div class="panel-header text-red-400">
              <el-icon class="mr-2"><Connection /></el-icon> 全身共病关联预测
            </div>
            <div ref="diseaseChartRef" class="chart-box"></div>
          </div>
          <!-- 病因分布 -->
          <div class="panel h-[180px]">
            <div class="panel-header text-yellow-400">
              <el-icon class="mr-2"><View /></el-icon> 病因学分类
            </div>
            <div ref="etiologyChartRef" class="chart-box"></div>
          </div>
        </div>

        <!-- 中间：地图 -->
        <div class="col-center">
          <div class="map-container">
            <div class="map-title">云南省干眼症与环境因素监测</div>
            <div class="map-wrapper">
              <YunnanMap />
            </div>
            <div class="map-legend">
              <span><i class="dot bg-red-500"></i> 高风险 (强紫外线)</span>
              <span><i class="dot bg-yellow-500"></i> 预警 (干燥)</span>
              <span><i class="dot bg-green-500"></i> 正常</span>
            </div>
          </div>
        </div>

        <!-- 右侧：AI诊断 + 健康监测趋势 -->
        <div class="col-side">
          <!-- 实时动态 -->
          <div class="panel flex-1 mb-3 flex flex-col overflow-hidden">
            <div class="panel-header text-green-400">
              <el-icon class="mr-2"><Monitor /></el-icon> 实时诊疗动态
            </div>
            <div class="log-list flex-1 overflow-y-auto custom-scrollbar">
              <div v-for="(log, idx) in liveLogs" :key="idx" class="log-item">
                <span class="time">{{ log.time }}</span>
                <span class="msg" :class="`text-${log.type}`">{{ log.msg }}</span>
              </div>
            </div>
          </div>
          <!-- 健康监测趋势 (替代原雷达图) -->
          <div class="panel h-[200px] flex flex-col">
            <div class="panel-header text-blue-400">
              <el-icon class="mr-2"><Aim /></el-icon> 健康监测动态
            </div>
            <div ref="monitorChartRef" class="chart-box"></div>
          </div>
        </div>
      </div>

      <!-- 第二行：知识图谱 + 趋势分析 -->
      <div class="row-bottom">

        <!-- 左下：治疗趋势 -->
        <div class="panel w-1/4">
          <div class="panel-header text-emerald-400">
            <el-icon class="mr-2"><TrendCharts /></el-icon> 治疗趋势
          </div>
          <div ref="trendChartRef" class="chart-box"></div>
        </div>

        <!-- 中下：知识图谱 (C位宽幅) -->
        <div class="kg-panel w-2/4 mx-3">
          <div class="panel-header border-b border-gray-700/50 mb-0">
            <el-icon class="mr-2 text-purple-400"><DataLine /></el-icon>
            多模态因果知识图谱 (Interactive Graph)
          </div>
          <div class="kg-wrapper">
            <!-- 调用 dark 主题 -->
            <KnowledgeGraph theme="dark" />
          </div>
        </div>

        <!-- 右下：综合干预方案 -->
        <div class="panel w-1/4">
          <div class="panel-header text-sky-400">
            <el-icon class="mr-2"><PieChart /></el-icon> 综合干预方案
          </div>
          <div ref="referralChartRef" class="chart-box"></div>
        </div>

      </div>

    </div>
  </div>
</template>

<style scoped lang="scss">
/* 页面容器：嵌入式，不覆盖侧边栏 */
.dashboard-page {
  width: 100%;
  /* 减去顶部导航栏高度，确保填满剩余区域且不出现双滚动条 */
  min-height: calc(100vh - 84px);
  background-color: #0b1121;
  background-image:
    radial-gradient(at 50% 0%, rgba(29, 78, 216, 0.15) 0px, transparent 50%),
    radial-gradient(at 0% 100%, rgba(139, 92, 246, 0.1) 0px, transparent 50%);
  color: #fff;
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
  display: flex;
  justify-content: center;
  align-items: center;

  .glow-title {
    font-size: 26px; font-weight: 700; letter-spacing: 2px;
    background: linear-gradient(to bottom, #fff, #93c5fd); -webkit-background-clip: text; color: transparent;
    text-shadow: 0 0 15px rgba(59, 130, 246, 0.4);
  }
  .sub-title { font-size: 12px; color: #64748b; text-transform: uppercase; margin-top: 4px; letter-spacing: 1px; }
}

/* Stats */
.stats-bar {
  display: flex; gap: 15px; margin-bottom: 15px;
  .stat-item {
    flex: 1; background: rgba(30, 41, 59, 0.4); border: 1px solid rgba(255,255,255,0.05);
    border-radius: 8px; padding: 12px 15px; display: flex; align-items: center;
    transition: all 0.3s;
    &:hover { background: rgba(30, 41, 59, 0.6); transform: translateY(-2px); }
    .icon-box { width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 20px; margin-right: 12px; }
    .info {
      .label { font-size: 11px; color: #94a3b8; }
      .num { font-size: 20px; font-weight: bold; font-family: 'Arial'; color: #f1f5f9; }
      small { font-size: 11px; margin-left: 4px; color: #64748b; font-weight: normal; }
    }
  }
}

/* Main Content Layout */
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

/* Panels */
.panel {
  background: rgba(30, 41, 59, 0.4); border: 1px solid rgba(255,255,255,0.05);
  border-radius: 10px; padding: 10px; display: flex; flex-direction: column;
  .panel-header {
    font-size: 14px; font-weight: bold; margin-bottom: 8px; display: flex; align-items: center;
  }
  .chart-box { flex: 1; width: 100%; min-height: 0; }
}

/* Map specific */
.map-container {
  height: 100%; background: rgba(15, 23, 42, 0.3); border: 1px solid rgba(59, 130, 246, 0.15);
  border-radius: 10px; position: relative; display: flex; flex-direction: column;
  .map-title { position: absolute; top: 12px; left: 15px; font-size: 15px; font-weight: bold; color: #bae6fd; z-index: 5; }
  .map-wrapper { flex: 1; width: 100%; }
  .map-legend {
    height: 30px; display: flex; justify-content: center; gap: 15px; align-items: center;
    font-size: 11px; color: #94a3b8; background: rgba(0,0,0,0.2);
    .dot { width: 6px; height: 6px; border-radius: 50%; display: inline-block; margin-right: 4px; }
  }
}

/* Knowledge Graph Panel */
.kg-panel {
  background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(139, 92, 246, 0.2);
  border-radius: 10px; display: flex; flex-direction: column;
  .panel-header { padding: 8px 12px; font-size: 14px; font-weight: bold; color: #e2e8f0; display: flex; align-items: center; }
  .kg-wrapper { flex: 1; position: relative; background: rgba(0,0,0,0.1); border-bottom-left-radius: 10px; border-bottom-right-radius: 10px; overflow: hidden; }
}

/* Logs */
.log-list {
  .log-item {
    font-size: 12px; padding: 4px 0; border-bottom: 1px dashed rgba(255,255,255,0.05);
    display: flex; justify-content: space-between;
    .time { color: #64748b; font-family: monospace; }
    .text-warning { color: #fbbf24; }
    .text-danger { color: #f87171; }
    .text-success { color: #34d399; }
    .text-info { color: #60a5fa; }
  }
}

/* Custom Scrollbar */
.custom-scrollbar::-webkit-scrollbar { width: 3px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
</style>
