<script lang="ts" setup>
import { ref, onMounted, onUnmounted, nextTick } from "vue"
import * as echarts from "echarts"
import YunnanMap from "@/components/YunnanMap.vue"
import KnowledgeGraph from "@/components/KnowledgeGraph.vue"
import {
  DataLine,
  FirstAidKit,
  Trophy,
  UserFilled,
  LocationInformation,
  Aim,
  Monitor,
  Male,
  Female
} from "@element-plus/icons-vue"

// --- 1. 统计数据 (Mock) ---
const statistics = [
  { title: "累计筛查人次", value: 12843, icon: UserFilled, color: "#40c9c6" },
  { title: "AI 诊断准确率", value: 96.8, suffix: "%", icon: Trophy, color: "#36a3f7" },
  { title: "全身疾病预警", value: 342, icon: FirstAidKit, color: "#f4516c" },
  { title: "覆盖云南州市", value: 16, icon: LocationInformation, color: "#34bfa3" },
]

// --- 2. 实时诊断动态 (Mock) ---
const liveLogs = ref([
  { time: "10:42:01", msg: "患者 [昆明] 检出 睑板腺萎缩 III 级", type: "warning" },
  { time: "10:41:55", msg: "患者 [大理] AI 确诊 混合型干眼", type: "success" },
  { time: "10:41:30", msg: "系统预警：关联 干燥综合征 风险", type: "danger" },
  { time: "10:40:12", msg: "患者 [丽江] OSDI 评分录入：45分", type: "info" },
  { time: "10:39:48", msg: "患者 [香格里拉] 泪河高度 0.15mm", type: "warning" },
  { time: "10:38:22", msg: "患者 [曲靖] 检出 角膜上皮缺损", type: "danger" },
  { time: "10:37:10", msg: "模型完成第 12843 次推理", type: "success" },
])

// --- 3. ECharts 实例 ---
const diseaseChartRef = ref<HTMLElement | null>(null)
const featureChartRef = ref<HTMLElement | null>(null)
const ageChartRef = ref<HTMLElement | null>(null)

let diseaseChart: echarts.ECharts | null = null
let featureChart: echarts.ECharts | null = null
let ageChart: echarts.ECharts | null = null

// --- 初始化图表 ---
const initCharts = () => {
  // Chart 1: 全身疾病风险 (左侧)
  if (diseaseChartRef.value) {
    diseaseChart = echarts.init(diseaseChartRef.value)
    diseaseChart.setOption({
      backgroundColor: 'transparent',
      title: { text: '干眼共病风险预测 Top5', left: 'left', textStyle: { color: '#fff', fontSize: 14 } },
      grid: { top: 40, left: 0, right: 20, bottom: 0, containLabel: true },
      xAxis: { type: 'value', splitLine: { show: false }, axisLabel: { show: false } },
      yAxis: {
        type: 'category',
        data: ['睡眠障碍', '甲状腺病', '类风湿', '糖尿病', '干燥综合征'],
        axisLabel: { color: '#fff' }, axisLine: { show: false }, axisTick: { show: false }
      },
      series: [{
        type: 'bar',
        data: [45, 52, 60, 78, 92],
        barWidth: 10,
        itemStyle: { borderRadius: 5, color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [{offset: 0, color: '#f43f5e'}, {offset: 1, color: '#3b82f6'}]) },
        label: { show: true, position: 'right', color: '#fff', formatter: '{c}%' }
      }]
    })
  }

  // Chart 2: 诊断特征雷达 (右侧)
  if (featureChartRef.value) {
    featureChart = echarts.init(featureChartRef.value)
    featureChart.setOption({
      backgroundColor: 'transparent',
      title: { text: 'AI 诊断权重因子', left: 'center', textStyle: { color: '#fff', fontSize: 14 } },
      radar: {
        indicator: [
          { name: '睑板腺', max: 100 }, { name: '泪河', max: 100 },
          { name: 'OSDI', max: 100 }, { name: '环境', max: 100 }, { name: '屏幕', max: 100 }
        ],
        radius: '65%', center: ['50%', '55%'],
        axisName: { color: '#9ca3af' },
        splitArea: { areaStyle: { color: ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.1)'] } },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.2)' } }
      },
      series: [{
        type: 'radar',
        data: [{
          value: [85, 70, 60, 40, 50], name: 'Weight',
          areaStyle: { color: 'rgba(59, 130, 246, 0.4)' },
          itemStyle: { color: '#3b82f6' }, lineStyle: { color: '#60a5fa' }
        }]
      }]
    })
  }

  // Chart 3: 年龄分布 (左侧下方)
  if (ageChartRef.value) {
    ageChart = echarts.init(ageChartRef.value)
    ageChart.setOption({
      backgroundColor: 'transparent',
      title: { text: '患者年龄分布', left: 'left', textStyle: { color: '#fff', fontSize: 14 } },
      tooltip: { trigger: 'item' },
      legend: { top: 'bottom', textStyle: { color: '#ccc' }, itemWidth: 10, itemHeight: 10 },
      series: [{
        name: '年龄段',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 5, borderColor: '#1e293b', borderWidth: 2 },
        label: { show: false },
        data: [
          { value: 1048, name: '60岁以上' },
          { value: 735, name: '40-60岁' },
          { value: 580, name: '20-40岁' },
          { value: 300, name: '20岁以下' }
        ]
      }]
    })
  }
}

const resizeCharts = () => {
  diseaseChart?.resize(); featureChart?.resize(); ageChart?.resize()
}

onMounted(() => {
  nextTick(() => {
    initCharts()
    window.addEventListener('resize', resizeCharts)
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeCharts)
  diseaseChart?.dispose(); featureChart?.dispose(); ageChart?.dispose()
})
</script>

<template>
  <div class="dashboard-page full-screen-mode">
    <!-- 动态背景 -->
    <div class="bg-particles"></div>

    <!-- 1. 顶部 Header -->
    <div class="header-bar">
      <div class="header-content">
        <h1 class="glow-text">Smart Eye Care 医疗大数据指挥舱</h1>
        <div class="sub-text">Multimodal Medical AI & Geographical Knowledge Graph Platform</div>
      </div>
      <div class="header-decoration"></div>
    </div>

    <!-- 2. 统计指标栏 -->
    <div class="stats-bar">
      <div class="stat-item" v-for="(item, i) in statistics" :key="i">
        <div class="icon-box" :style="{ color: item.color, backgroundColor: item.color + '20' }">
          <component :is="item.icon" />
        </div>
        <div class="info">
          <div class="label">{{ item.title }}</div>
          <div class="num">{{ item.value }}<small>{{ item.suffix }}</small></div>
        </div>
      </div>
    </div>

    <!-- 3. 核心内容网格布局 (使用 Grid 严格控制布局) -->
    <div class="main-grid">

      <!-- 左列：人群与疾病 -->
      <div class="col-left">
        <!-- 疾病风险图 -->
        <div class="panel half-h mb-4">
          <div class="panel-title"><el-icon class="mr-2 text-red-400"><Aim /></el-icon> 共病风险预测</div>
          <div ref="diseaseChartRef" class="chart-box"></div>
        </div>
        <!-- 年龄分布图 -->
        <div class="panel half-h">
          <div class="panel-title"><el-icon class="mr-2 text-yellow-400"><UserFilled /></el-icon> 患者画像分析</div>
          <div class="flex h-full">
            <div ref="ageChartRef" class="w-2/3 h-full"></div>
            <div class="w-1/3 flex flex-col justify-center gap-4 text-xs text-gray-400 pr-2">
              <div class="flex items-center"><el-icon class="text-blue-400 text-lg mr-1"><Male /></el-icon> 男性 42%</div>
              <div class="flex items-center"><el-icon class="text-pink-400 text-lg mr-1"><Female /></el-icon> 女性 58%</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 中列：地图 C位 -->
      <div class="col-center">
        <div class="panel map-panel h-full relative">
          <div class="absolute top-4 left-4 z-10">
            <div class="text-lg font-bold text-blue-200">云南省全域监控</div>
            <div class="text-xs text-blue-400">Real-time Data Monitoring</div>
          </div>
          <div class="map-wrapper">
            <YunnanMap />
          </div>
          <!-- 底部装饰条 -->
          <div class="map-footer">
            <div class="item">高发区: 昆明/大理</div>
            <div class="item">预警阈值: OSDI > 30</div>
            <div class="item">当前湿度: 42% (干燥)</div>
          </div>
        </div>
      </div>

      <!-- 右列：AI与动态 -->
      <div class="col-right">
        <!-- 实时日志 -->
        <div class="panel half-h mb-4 overflow-hidden flex flex-col">
          <div class="panel-title"><el-icon class="mr-2 text-green-400"><Monitor /></el-icon> 实时诊疗动态</div>
          <div class="log-list flex-1 overflow-y-auto custom-scrollbar">
            <div v-for="(log, idx) in liveLogs" :key="idx" class="log-item">
              <span class="time">{{ log.time }}</span>
              <span class="msg" :class="`text-${log.type}`">{{ log.msg }}</span>
            </div>
            <!-- 模拟更多数据... -->
            <div class="log-item opacity-50"><span class="time">10:36:05</span><span class="msg">系统自检完成</span></div>
            <div class="log-item opacity-30"><span class="time">10:35:12</span><span class="msg">加载知识图谱节点...</span></div>
          </div>
        </div>
        <!-- 雷达图 -->
        <div class="panel half-h">
          <div class="panel-title"><el-icon class="mr-2 text-purple-400"><DataLine /></el-icon> AI 特征权重</div>
          <div ref="featureChartRef" class="chart-box"></div>
        </div>
      </div>

    </div>

    <!-- 4. 底部：知识图谱 -->
    <div class="bottom-section">
      <div class="panel h-full w-full flex flex-col">
        <div class="panel-title border-b border-gray-700 pb-2 mb-0">
          <el-icon class="mr-2 text-blue-400"><DataLine /></el-icon>
          多模态因果知识图谱 (Interactive Knowledge Graph)
          <span class="float-right text-xs text-gray-500 font-normal mt-1">支持缩放/拖拽/点击交互</span>
        </div>
        <div class="kg-box flex-1 relative bg-slate-900/50">
          <KnowledgeGraph />
          <!-- 悬浮说明 -->
          <div class="absolute top-4 right-4 bg-black/60 p-3 rounded border border-gray-700 text-xs pointer-events-none">
            <div class="flex items-center mb-1"><span class="w-2 h-2 rounded-full bg-blue-500 mr-2"></span> 核心病灶</div>
            <div class="flex items-center mb-1"><span class="w-2 h-2 rounded-full bg-red-500 mr-2"></span> 全身疾病 (Target)</div>
            <div class="flex items-center"><span class="w-2 h-2 rounded-full bg-green-500 mr-2"></span> 临床体征</div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped lang="scss">
/* 强制全屏覆盖样式 (如果这个页面是在 Layout 内部渲染的，这些样式尝试“撑破”容器) */
.dashboard-page {
  position: relative;
  width: 100%;
  min-height: 100vh;
  background-color: #0b1121;
  background-image:
    radial-gradient(at 0% 0%, rgba(29, 78, 216, 0.15) 0px, transparent 50%),
    radial-gradient(at 100% 0%, rgba(139, 92, 246, 0.15) 0px, transparent 50%);
  color: #fff;
  padding: 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  z-index: 1; /* 确保背景在最下 */
}

/* 尝试隐藏父级 Layout 的 header/sidebar (如果有 class 钩子)
   注意：这取决于你的 Layout 结构，如果是 scoped 样式可能无法渗透。
   最好的办法是在路由层级使用全屏 Layout，或者这里使用 position: fixed 覆盖。
*/
:global(.app-main) {
  padding: 0 !important; /* 移除内边距 */
}

/* Header */
.header-bar {
  height: auto; /* Allow auto height for content */
  min-height: 80px; /* Minimum height */
  text-align: center;
  position: relative;
  margin-bottom: 20px;
  flex-shrink: 0;
  display: flex; /* Use flexbox for centering */
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 10; /* Ensure header is above other elements */

  .glow-text {
    font-size: 32px;
    font-weight: 700;
    margin: 0;
    letter-spacing: 4px;
    background: linear-gradient(to bottom, #fff, #93c5fd);
    -webkit-background-clip: text;
    color: transparent;
    text-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
    display: inline-block; /* Ensure block formatting for gradient text */
  }
  .sub-text {
    color: #94a3b8;
    font-size: 14px;
    letter-spacing: 1px;
    margin-top: 5px;
    text-transform: uppercase;
  }
}

/* Stats */
.stats-bar {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  flex-shrink: 0;

  .stat-item {
    flex: 1;
    background: rgba(30, 41, 59, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    border-radius: 8px;
    padding: 15px 20px;
    display: flex;
    align-items: center;
    transition: transform 0.2s;
    &:hover { transform: translateY(-3px); background: rgba(30, 41, 59, 0.8); }

    .icon-box {
      width: 48px; height: 48px;
      border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      font-size: 24px;
      margin-right: 15px;
    }
    .info {
      .label { font-size: 12px; color: #94a3b8; margin-bottom: 2px; }
      .num { font-size: 24px; font-weight: bold; font-family: 'DIN Alternate', sans-serif; color: #fff; }
      small { font-size: 12px; margin-left: 4px; font-weight: normal; color: #64748b; }
    }
  }
}

/* Main Grid Layout */
.main-grid {
  display: grid;
  grid-template-columns: 25% 50% 25%; /* 左中右比例 */
  gap: 20px;
  height: 500px; /* 固定中间层高度 */
  margin-bottom: 20px;
  flex-shrink: 0;

  .col-left, .col-right {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
  }
}

/* Bottom Section */
.bottom-section {
  flex: 1; /* 自动填充剩余空间 */
  min-height: 400px; /* 最小高度 */
  width: 100%;
  /* Removed height property to prevent overlapping */

  .panel {
    height: 100%;
  }
}

/* Common Panel Style */
.panel {
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(59, 130, 246, 0.15);
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  position: relative;
  box-sizing: border-box;

  &.half-h {
    height: calc(50% - 10px); /* 减去 gap 的一半 */
  }

  .panel-title {
    font-size: 15px;
    font-weight: 600;
    color: #e2e8f0;
    margin-bottom: 10px;
    display: flex; align-items: center;
    &::before {
      content: ''; display: inline-block; width: 3px; height: 14px;
      background: #3b82f6; margin-right: 8px; border-radius: 2px;
    }
  }

  .chart-box {
    width: 100%;
    height: calc(100% - 30px);
  }
}

/* Special Panels */
.map-panel {
  background: rgba(15, 23, 42, 0.4);
  padding: 0;
  overflow: hidden;

  .map-wrapper { width: 100%; height: 100%; }

  .map-footer {
    position: absolute; bottom: 0; left: 0; right: 0;
    height: 40px;
    background: rgba(0,0,0,0.6);
    display: flex; justify-content: space-around; align-items: center;
    border-top: 1px solid rgba(255,255,255,0.1);

    .item { font-size: 12px; color: #94a3b8; font-family: monospace; }
  }
}

.log-list {
  .log-item {
    padding: 6px 0;
    border-bottom: 1px solid rgba(255,255,255,0.05);
    font-size: 12px;
    display: flex;
    justify-content: space-between;

    .time { color: #64748b; font-family: monospace; margin-right: 8px; }
    .msg { color: #cbd5e1; }
    .text-warning { color: #fbbf24; }
    .text-danger { color: #f87171; }
    .text-success { color: #34d399; }
    .text-info { color: #60a5fa; }
  }
}

.kg-box {
  border-radius: 8px;
  overflow: hidden;
}

/* Scrollbar */
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 2px; }

/* Responsive */
@media (max-width: 1200px) {
  .main-grid { grid-template-columns: 1fr 1fr; height: auto; }
  .col-center { grid-column: 1 / -1; height: 400px; order: -1; }
  .bottom-section { height: 400px; }
  .panel.half-h { height: 300px; margin-bottom: 20px; }
}
@media (max-width: 768px) {
  .main-grid { grid-template-columns: 1fr; }
  .stats-bar { flex-wrap: wrap; }
  .stat-item { min-width: 45%; }
}
</style>
