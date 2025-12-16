<script setup lang="ts">
import { ref, onMounted, reactive, nextTick } from 'vue'
import KnowledgeGraph from '@/components/KnowledgeGraph.vue'
import YunnanMap from '@/components/YunnanMap.vue'
import * as echarts from 'echarts'
import { MagicStick, ChatDotRound, Picture, Location, User, ArrowRight, Share, MapLocation, Download, Printer, TrendCharts, List } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// === 1. 引入 5 张核心演示图片 ===
// 确保这些图片真实存在于 src/common/assets/images/ 下
import fundusOriginal from '@/common/assets/images/fundus-original.jpg'
import fundusMask from '@/common/assets/images/fundus-mask.jpg'
import tearImg from '@/common/assets/images/tear.jpg'
import meiboImg from '@/common/assets/images/meibo.jpg'
import corneaImg from '@/common/assets/images/cornea.jpg'

// 状态管理
const activeRightTab = ref('graph')
const activeLeftTab = ref('vision')
const imageMode = ref('split') // 影像模式：split(并列), overlay(叠加)
const maskOpacity = ref(80) // 叠加透明度
const aiAnalysisLoading = ref(false)
const aiReport = ref('')
const showReportDialog = ref(false)
const patient = ref<any>(null)
const trendChartRef = ref<HTMLElement | null>(null)
let trendChartInstance: echarts.ECharts | null = null

// 医嘱清单
const treatments = reactive([
  { name: 'IPL 强脉冲光治疗 (3次/疗程)', checked: true },
  { name: '视网膜激光光凝术', checked: false },
  { name: '玻璃酸钠滴眼液 (4次/日)', checked: true },
  { name: '佩戴湿房镜 (高海拔防护)', checked: true }
])

// 模拟患者数据
const mockPatientData = {
  name: '石丽琴',
  age: 53,
  gender: '女',
  region: '昆明市',
  id: '20250416688010',
  image: fundusOriginal,     // 主图-原图
  maskImage: fundusMask,     // 主图-分割结果
  examImages: {              // 其他检查影像
    tear: tearImg,
    meibo: meiboImg,
    cornea: corneaImg
  }
}

// 初始化趋势图 (增加防错逻辑)
const initTrendChart = async () => {
  await nextTick() // 等待 DOM 更新
  if (!trendChartRef.value) return

  // 如果容器高度为0，不初始化，防止报错
  if (trendChartRef.value.clientHeight === 0) {
    // 尝试延时再次初始化
    setTimeout(initTrendChart, 500)
    return
  }

  if (trendChartInstance) {
    trendChartInstance.dispose()
  }

  trendChartInstance = echarts.init(trendChartRef.value)
  trendChartInstance.setOption({
    title: { text: '病情风险趋势', left: 'center', textStyle: { fontSize: 14 } },
    tooltip: { trigger: 'axis' },
    legend: { data: ['血管密度', '风险指数'], bottom: 0 },
    grid: { top: 40, bottom: 30, left: 40, right: 40 },
    xAxis: { type: 'category', data: ['2024-10', '2025-01', '2025-04'] },
    yAxis: [
      { type: 'value', name: '密度' },
      { type: 'value', name: '指数', min: 0, max: 100 }
    ],
    series: [
      { name: '血管密度', type: 'line', data: [0.45, 0.42, 0.38], smooth: true, itemStyle: { color: '#409EFF' } },
      { name: '风险指数', type: 'line', yAxisIndex: 1, data: [40, 55, 78], smooth: true, itemStyle: { color: '#F56C6C' } }
    ]
  })
}

// 生成 AI 报告
const generateAIReport = () => {
  if (aiAnalysisLoading.value) return
  aiAnalysisLoading.value = true
  aiReport.value = ''

  const mockText = `**【AI 多模态智能诊断报告】**

**1. U-KAN 眼底影像分析**：
   - **血管分割**: 成功提取视网膜血管网络，血管密度 (VD) 降低至 0.38。
   - **微循环评估**: 末梢血管迂曲，提示高血压性视网膜病变 I 期风险。

**2. 眼表综合检查所见**:
   - **睑板腺**: 红外成像显示下睑腺体缺失率约 30%，腺管扭曲。
   - **泪河高度**: 中央 TMH 约 0.21mm，泪液分泌量不足。
   - **角膜情况**: 荧光染色可见下方点状着色 (Grade 1)。

**3. 环境与病因归因**:
   - 患者常驻昆明 (海拔1890m)，低气压环境加剧缺氧。
   - 知识图谱推理：[高海拔缺氧] + [年龄>50] -> [微循环障碍] + [泪液蒸发] -> [混合型干眼]。

**4. 风险预警**:
   - 综合风险指数：**78/100 (高风险)**。`

  let i = 0
  const timer = setInterval(() => {
    aiReport.value += mockText[i]
    i++
    if (i >= mockText.length) {
      clearInterval(timer)
      aiAnalysisLoading.value = false
      ElMessage.success('AI 分析报告生成完毕')
    }
  }, 15)
}

const openReport = () => {
  if (!aiReport.value) {
    ElMessage.warning('请先生成 AI 分析报告')
    return
  }
  showReportDialog.value = true
}

const handleExportPDF = () => {
  ElMessage.success('电子报告 PDF 下载任务已提交')
  showReportDialog.value = false
}

// 监听 Tab 切换，重新渲染图表
const handleTabChange = (name: string) => {
  if (name === 'trend') {
    setTimeout(initTrendChart, 200)
  }
}

onMounted(() => {
  patient.value = mockPatientData
  // 确保 DOM 渲染后再初始化图表
  setTimeout(initTrendChart, 1000)
  window.addEventListener('resize', () => trendChartInstance?.resize())
})
</script>

<template>
  <div class="diag-container">
    <!-- 顶部状态栏 -->
    <div class="status-header">
      <div class="patient-card" v-if="patient">
        <el-avatar :size="56" class="avatar-box">{{ patient.name?.[0] }}</el-avatar>
        <div class="info">
          <div class="name-row">
            <span class="name">{{ patient.name }}</span>
            <el-tag type="danger" effect="dark" round class="risk-tag">高风险 (High Risk)</el-tag>
            <span class="id-text">ID: {{ patient.id }}</span>
          </div>
          <div class="meta">
            <span><el-icon><User /></el-icon> {{ patient.gender }} · {{ patient.age }}岁</span>
            <el-divider direction="vertical" />
            <span><el-icon><Location /></el-icon> {{ patient.region }}</span>
          </div>
        </div>
      </div>

      <div class="header-actions">
        <el-button type="primary" size="large" :icon="ChatDotRound" @click="generateAIReport" :loading="aiAnalysisLoading" class="ai-btn">
          {{ aiAnalysisLoading ? 'AI 正在推理...' : '生成智能诊断' }}
        </el-button>
        <el-button type="success" size="large" :icon="Download" @click="openReport" :disabled="!aiReport" plain>
          导出报告
        </el-button>
      </div>
    </div>

    <el-row :gutter="20" class="main-content">
      <!-- 左侧：微观诊疗 -->
      <el-col :span="10" class="left-col">
        <el-card shadow="hover" class="panel-card fit-top">
          <el-tabs v-model="activeLeftTab" class="left-tabs" @tab-change="handleTabChange">

            <!-- Tab 1: 视觉分析 -->
            <el-tab-pane name="vision">
              <template #label><span class="tab-txt"><el-icon><MagicStick /></el-icon> U-KAN 视觉分析</span></template>

              <div class="tool-bar">
                <el-radio-group v-model="imageMode" size="small">
                  <el-radio-button label="split">并列对比</el-radio-button>
                  <el-radio-button label="overlay">智能叠加</el-radio-button>
                </el-radio-group>
                <div class="slider-box" v-if="imageMode === 'overlay'">
                  <span class="label">Mask透明度</span>
                  <el-slider v-model="maskOpacity" :min="0" :max="100" size="small" style="width: 100px" />
                </div>
              </div>

              <div class="vision-viewport">
                <!-- 模式A：并列显示 -->
                <div v-if="imageMode === 'split'" class="split-view">
                  <div class="img-box">
                    <img :src="patient?.image" />
                    <span class="badge">眼底原图</span>
                  </div>
                  <div class="img-box">
                    <img :src="patient?.maskImage" class="mask-display" />
                    <span class="badge ai">血管分割</span>
                  </div>
                </div>

                <!-- 模式B：叠加显示 -->
                <div v-else class="overlay-view">
                  <div class="img-stack">
                    <img :src="patient?.image" class="base-img" />
                    <img
                      :src="patient?.maskImage"
                      class="mask-img"
                      :style="{
                        opacity: maskOpacity / 100,
                        mixBlendMode: 'screen',
                        filter: 'sepia(1) saturate(5) hue-rotate(90deg)'
                      }"
                    />
                    <span class="badge ai">AI Overlay Mode</span>
                  </div>
                </div>
              </div>

              <!-- 核心指标 -->
              <div class="metrics-row">
                <div class="m-item">
                  <div class="k">血管密度</div>
                  <div class="v danger">0.38</div>
                </div>
                <div class="m-item">
                  <div class="k">分形维数</div>
                  <div class="v">1.42</div>
                </div>
                <div class="m-item">
                  <div class="k">模型置信度</div>
                  <div class="v success">98.2%</div>
                </div>
              </div>
            </el-tab-pane>

            <!-- Tab 2: 历史趋势 -->
            <el-tab-pane name="trend">
              <template #label><span class="tab-txt"><el-icon><TrendCharts /></el-icon> 历史趋势</span></template>
              <div class="chart-box" ref="trendChartRef" style="height: 300px; width: 100%;"></div>
            </el-tab-pane>
          </el-tabs>
        </el-card>

        <!-- 下方：AI 结论 -->
        <el-card shadow="hover" class="panel-card fit-bottom">
          <template #header>
            <div class="card-head ai-header">
              <div class="title"><el-icon class="icon-ai"><ChatDotRound /></el-icon> <span>智能诊疗建议</span></div>
              <div class="model-tag">EyePCR-v2</div>
            </div>
          </template>
          <div class="ai-body" v-loading="aiAnalysisLoading">
            <div v-if="aiReport">
              <div class="report-text">{{ aiReport.replace(/\*\*/g, '') }}</div>
              <el-divider style="margin: 15px 0" />
              <div class="treatment-list">
                <div class="list-title"><el-icon><List /></el-icon> 推荐方案 (可编辑)</div>
                <el-checkbox v-for="(t, i) in treatments" :key="i" v-model="t.checked" class="t-item">
                  {{ t.name }}
                </el-checkbox>
              </div>
            </div>
            <div v-else class="empty-ai">
              <el-icon size="40" color="#E4E7ED"><MagicStick /></el-icon>
              <p>请点击顶部按钮开始分析</p>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧：宏观分析 -->
      <el-col :span="14" class="right-col">
        <el-card shadow="hover" class="panel-card fit-height">
          <el-tabs v-model="activeRightTab" class="custom-tabs">
            <el-tab-pane name="graph">
              <template #label><span class="tab-label"><el-icon><Share /></el-icon> 病因图谱</span></template>
              <div class="chart-wrapper"><KnowledgeGraph /></div>
            </el-tab-pane>
            <el-tab-pane name="map">
              <template #label><span class="tab-label"><el-icon><MapLocation /></el-icon> 区域态势</span></template>
              <div class="chart-wrapper"><YunnanMap /></div>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>

    <!-- 电子报告预览弹窗 (完整展示5张图) -->
    <el-dialog v-model="showReportDialog" title="电子诊断报告预览" width="960px" top="5vh">
      <div class="report-paper">
        <div class="report-header">
          <h2>云南大学附属医院眼表综合检查报告</h2>
          <div class="report-meta"><span>ID: {{ patient?.id }}</span><span>日期: 2025-04-16</span></div>
        </div>
        <el-divider />

        <!-- 第一部分：眼底 AI 分析 -->
        <div class="report-section">
          <h4>【U-KAN 眼底影像分析】</h4>
          <div class="report-images-full">
             <div class="img-row">
               <div class="col">
                 <img :src="patient?.image" />
                 <span class="cap">原始眼底影像</span>
               </div>
               <div class="col">
                 <img :src="patient?.maskImage" class="mask-print" />
                 <span class="cap">AI 血管分割结果</span>
               </div>
             </div>
          </div>
        </div>

        <!-- 第二部分：眼表三联检查 -->
        <div class="report-section">
          <h4>【眼表综合检查影像】</h4>
          <div class="report-images-grid">
             <div class="grid-item">
                <img :src="patient?.examImages?.meibo" />
                <span>1. 睑板腺成像 (Meibo)</span>
             </div>
             <div class="grid-item">
                <img :src="patient?.examImages?.tear" />
                <span>2. 泪河高度 (Tear)</span>
             </div>
             <div class="grid-item">
                <img :src="patient?.examImages?.cornea" />
                <span>3. 角膜染色 (Cornea)</span>
             </div>
          </div>
        </div>

        <!-- 第三部分：结论 -->
        <div class="report-section">
          <h4>【AI 综合诊断意见】</h4>
          <div class="report-text">{{ aiReport.replace(/\*\*/g, '') }}</div>
        </div>
      </div>
      <template #footer>
        <el-button @click="showReportDialog = false">关闭</el-button>
        <el-button type="primary" :icon="Printer" @click="handleExportPDF">打印报告</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
/* 基础布局 */
.diag-container { padding: 20px; background-color: #f5f7fa; min-height: calc(100vh - 84px); display: flex; flex-direction: column; }
.status-header { background: #fff; padding: 15px 25px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; box-shadow: 0 2px 12px rgba(0,0,0,0.05); }

/* 患者卡片 */
.patient-card {
  display: flex; align-items: center; gap: 16px;
  .avatar-box { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; font-size: 20px; font-weight: bold; }
  .info {
    .name-row { display: flex; align-items: center; gap: 10px; margin-bottom: 5px; .name { font-size: 20px; font-weight: 800; color: #333; } .id-text { font-size: 12px; color: #999; } }
    .meta { font-size: 13px; color: #666; display: flex; align-items: center; gap: 10px; }
  }
}
.header-actions { display: flex; gap: 10px; }

/* 左右分栏 */
.main-content { flex: 1; display: flex; }
.left-col { display: flex; flex-direction: column; gap: 15px; height: 100%; }
.right-col { height: 100%; }

/* 卡片通用 */
.panel-card { border-radius: 12px; border: none; display: flex; flex-direction: column; background: #fff; box-shadow: 0 2px 12px rgba(0,0,0,0.03); }
.fit-top { min-height: 420px; margin-bottom: 15px; }
.fit-bottom { flex: 1; min-height: 200px; }
.fit-height { height: 100%; }

/* Tab样式 */
:deep(.el-tabs__header) { margin: 0; padding: 0 15px; border-bottom: 1px solid #f0f0f0; }
:deep(.el-tabs__content) { padding: 15px; }
.tab-txt { display: flex; align-items: center; gap: 5px; font-weight: 600; }

/* 视觉分析区域 */
.tool-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
.slider-box { display: flex; align-items: center; gap: 10px; .label { font-size: 12px; color: #666; } }

.vision-viewport {
  height: 240px; background: #000; border-radius: 8px; overflow: hidden; position: relative;

  /* 并列模式 */
  .split-view { display: flex; height: 100%; gap: 2px; }
  .img-box { flex: 1; position: relative; overflow: hidden; img { width: 100%; height: 100%; object-fit: contain; } }

  /* 叠加模式 */
  .overlay-view { width: 100%; height: 100%; position: relative; display: flex; justify-content: center; }
  .img-stack { position: relative; height: 100%; width: 100%; max-width: 400px; }
  .base-img { width: 100%; height: 100%; object-fit: contain; display: block; }
  .mask-img {
    position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: contain;
    transition: opacity 0.1s;
  }

  .badge { position: absolute; top: 10px; left: 10px; background: rgba(0,0,0,0.6); color: #fff; padding: 2px 6px; border-radius: 4px; font-size: 12px; z-index: 10; }
  .badge.ai { background: #409EFF; }
}

/* 指标行 */
.metrics-row {
  display: flex; margin-top: 15px; gap: 10px;
  .m-item {
    flex: 1; background: #f8f9fa; padding: 8px; text-align: center; border-radius: 6px;
    .k { font-size: 12px; color: #999; margin-bottom: 4px; }
    .v { font-size: 18px; font-weight: bold; color: #333; }
    .v.danger { color: #f56c6c; }
    .v.success { color: #67c23a; }
  }
}

/* AI 报告区 */
.card-head { display: flex; justify-content: space-between; align-items: center; font-weight: bold; padding: 15px 20px; border-bottom: 1px solid #f0f2f5; }
.ai-header { color: #722ED1; .model-tag { font-size: 12px; background: #f9f0ff; color: #722ed1; padding: 2px 6px; border-radius: 4px; } }
.ai-body {
  overflow-y: auto; height: 100%; font-size: 14px; line-height: 1.6; color: #333; padding: 15px;
  .empty-ai { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: #ccc; gap: 10px; }
}
.treatment-list {
  .list-title { font-weight: bold; margin-bottom: 8px; display: flex; align-items: center; gap: 5px; color: #606266; }
  .t-item { display: block; margin-bottom: 5px; margin-left: 0; }
}

/* 报告单 */
.report-paper {
  font-family: 'SimSun', serif; padding: 20px;
  .report-header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 15px; margin-bottom: 20px; }
  .report-images-full {
    .img-row { display: flex; gap: 20px; justify-content: center; img { width: 220px; height: 220px; object-fit: contain; border: 1px solid #000; background: #000; } .cap { display: block; text-align: center; font-size: 12px; margin-top: 5px; } }
  }
  .report-images-grid { display: flex; gap: 15px; margin-top: 10px; .grid-item { flex: 1; text-align: center; img { width: 100%; height: 150px; object-fit: cover; border: 1px solid #ccc; } span { font-size: 12px; font-weight: bold; display: block; margin-top: 5px; } } }
  .report-text { white-space: pre-wrap; font-size: 14px; line-height: 1.8; }
  .section-title { background: #eee; padding: 5px 10px; font-weight: bold; border-left: 4px solid #333; margin: 15px 0 10px; }
}

/* 趋势图 */
.chart-box {
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>
