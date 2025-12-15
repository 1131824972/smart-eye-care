<script setup lang="ts">
import { ref, onMounted } from 'vue'
import KnowledgeGraph from '@/components/KnowledgeGraph.vue'
import YunnanMap from '@/components/YunnanMap.vue'
import { MagicStick, ChatDotRound, Picture, Location, User, ArrowRight, Share, MapLocation, Download, Printer, Warning } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// 引入你准备好的演示图片
// 请确保你把那张分割对比图重命名为 demo-segmentation.jpg 并放在 src/common/assets/images/ 下
import demoImg from '@/common/assets/images/demo-segmentation.jpg'
// 如果报错找不到图片，可以暂时注释掉上面这行，用下面的占位符代替
// const demoImg = 'https://via.placeholder.com/400x200?text=Segmentation+Demo'

const activeTab = ref('graph')
const aiAnalysisLoading = ref(false)
const aiReport = ref('')
const patient = ref<any>(null)
const showReportDialog = ref(false)

// 模拟真实病例数据 (来自你的报告单图片)
const mockPatientData = {
  name: '石丽琴',
  age: 53,
  gender: '女',
  region: '昆明市', // 假设
  id: '20250416688010',
  image: demoImg // 使用本地演示图片
}

const generateAIReport = () => {
  if (aiAnalysisLoading.value) return
  aiAnalysisLoading.value = true
  aiReport.value = ''

  // 提取自真实报告单的数据
  const mockText = `**【AI 多模态眼表综合分析报告】**

**1. 泪膜与泪河分析 (Tear Film & Meniscus):**
   - **泪膜破裂时间 (BUT)**: 首次 **2.00s** (正常值>10s)，平均 5.29s。
   - **分析**: 泪膜稳定性极差，属 **严重不稳定** (Level 3)。
   - **泪河高度**: 中央 0.21mm (OD) / 0.28mm (OS)。
   - **提示**: 泪液分泌量处于临界值，伴随蒸发过强。

**2. 睑板腺形态学分析 (Meibography):**
   - **腺体开口**: 评分 2.0 (OD) / 3.0 (OS)，可见脂帽堵塞。
   - **腺体缺失率**:
     - 上睑：**41%** (OD) / 19% (OS)
     - 下睑：30% (OD) / 20% (OS)
   - **AI 分割结论**: 睑板腺呈现中重度萎缩 (Grade 2-3)，符合 **混合型干眼症** 特征。

**3. 环境风险评估 (Geo-Risk):**
   - 患者生活在 **昆明市** (海拔 1890m)，环境干燥。
   - **知识图谱推断**: 高原低气压环境显著加速了泪膜破裂 (从预计的 7s 降至 2s)，是病情加重的外部核心诱因。

**💡 诊疗建议:**
   1. 建议进行 **IPL 强脉冲光** 治疗以疏通睑板腺。
   2. 使用人工泪液（如玻璃酸钠）配合 **湿房镜**，减少高原环境下的泪液蒸发。
   3. 定期进行睑板腺按摩。`

  let i = 0
  const timer = setInterval(() => {
    aiReport.value += mockText[i]
    i++
    if (i >= mockText.length) {
      clearInterval(timer)
      aiAnalysisLoading.value = false
      ElMessage.success('AI 分析报告生成完毕')
    }
  }, 10)
}

const openReport = () => {
  if (!aiReport.value) {
    ElMessage.warning('请先生成 AI 分析报告后再导出')
    return
  }
  showReportDialog.value = true
}

const handleExportPDF = () => {
  ElMessage.success('电子报告 PDF 已下载到本地')
  showReportDialog.value = false
}

onMounted(() => {
  // 强制使用演示数据
  patient.value = mockPatientData
  // 自动开始生成报告演示效果
  // setTimeout(generateAIReport, 800)
})
</script>

<template>
  <div class="diag-container">
    <!-- 顶部状态栏 -->
    <div class="status-header">
      <div class="patient-card" v-if="patient">
        <el-avatar :size="56" class="avatar-box">
          {{ patient.name?.[0] }}
        </el-avatar>
        <div class="info">
          <div class="name-row">
            <span class="name">{{ patient.name }}</span>
            <el-tag type="danger" effect="dark" round class="risk-tag">重度风险</el-tag>
            <el-tag type="info" effect="plain" round class="id-tag">ID: {{ patient.id }}</el-tag>
          </div>
          <div class="meta">
            <span class="meta-item"><el-icon><User /></el-icon> {{ patient.gender }} · {{ patient.age }}岁</span>
            <el-divider direction="vertical" />
            <span class="meta-item"><el-icon><Location /></el-icon> {{ patient.region }}</span>
          </div>
        </div>
      </div>

      <div class="header-actions">
        <el-button
          type="primary"
          size="large"
          :icon="ChatDotRound"
          @click="generateAIReport"
          :loading="aiAnalysisLoading"
          class="ai-btn"
        >
          {{ aiAnalysisLoading ? 'AI 正在推理中...' : '生成多模态诊断报告' }}
        </el-button>

        <el-button
          type="success"
          size="large"
          :icon="Download"
          @click="openReport"
          :disabled="!aiReport"
          plain
        >
          导出电子报告
        </el-button>
      </div>
    </div>

    <el-row :gutter="20" class="main-content">
      <!-- 左侧：微观病理分析 -->
      <el-col :span="10" class="left-col">
        <!-- 影像卡片 -->
        <el-card shadow="hover" class="panel-card vision-card">
          <template #header>
            <div class="card-head">
              <div class="title">
                <el-icon class="icon-visual"><MagicStick /></el-icon>
                <span>AI 视觉分割 (U-KAN Model)</span>
              </div>
              <el-tag size="small" type="success">运行正常</el-tag>
            </div>
          </template>

          <div class="vision-box">
            <!-- 直接展示那张对比图，因为那张图本身就包含了 Label 和 Output -->
             <div class="img-full-wrapper">
               <span class="badge ai">AI 分割结果对比</span>
               <img :src="patient?.image" class="full-img" />
             </div>
          </div>

          <!-- 关键指标展示区 (来自报告单) -->
          <div class="metrics-grid">
            <div class="metric-item danger">
              <div class="label">缺失率 (Loss)</div>
              <div class="value">41%</div>
            </div>
             <div class="metric-item warning">
              <div class="label">BUT (首)</div>
              <div class="value">2.00s</div>
            </div>
             <div class="metric-item">
              <div class="label">泪河高度</div>
              <div class="value">0.21mm</div>
            </div>
          </div>
        </el-card>

        <!-- 报告卡片 -->
        <el-card shadow="hover" class="panel-card ai-report-card">
          <template #header>
            <div class="card-head ai-header">
              <div class="title">
                <el-icon class="icon-ai"><ChatDotRound /></el-icon>
                <span>智能诊断结论</span>
              </div>
              <div class="model-badge">EyePCR-v2</div>
            </div>
          </template>
          <div class="ai-content-wrapper" v-loading="aiAnalysisLoading">
            <div v-if="aiReport" class="report-content">
              <div style="white-space: pre-wrap;">{{ aiReport }}</div>
            </div>
            <div v-else class="empty-state">
              <div class="ai-icon-bg"><el-icon><ChatDotRound /></el-icon></div>
              <p>点击上方按钮生成报告</p>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧：宏观归因分析 -->
      <el-col :span="14" class="right-col">
        <el-card shadow="hover" class="panel-card fit-height">
          <el-tabs v-model="activeTab" class="custom-tabs">
            <el-tab-pane name="graph">
              <template #label>
                <span class="tab-label"><el-icon><Share /></el-icon> 病因知识图谱</span>
              </template>
              <div class="chart-wrapper">
                 <KnowledgeGraph />
              </div>
            </el-tab-pane>
            <el-tab-pane name="map">
              <template #label>
                <span class="tab-label"><el-icon><MapLocation /></el-icon> 云南区域态势</span>
              </template>
              <div class="chart-wrapper">
                <YunnanMap />
              </div>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>

    <!-- 电子报告预览弹窗 -->
    <el-dialog v-model="showReportDialog" title="电子诊断报告预览" width="800px" align-center>
      <div class="report-paper">
        <div class="report-header">
          <h2>云南大学附属医院眼表综合检查报告</h2>
          <div class="report-meta">
            <span>检查号: {{ patient?.id }}</span>
            <span>日期: 2025-04-16</span>
            <span>医生: 范李元</span>
          </div>
        </div>

        <el-divider border-style="solid" />

        <div class="report-patient-info">
          <span>姓名：{{ patient?.name }}</span>
          <span>性别：{{ patient?.gender }}</span>
          <span>年龄：{{ patient?.age }}</span>
          <span>视力R：_ _ _  L：_ _ _</span>
        </div>

        <el-divider border-style="dashed" />

        <div class="report-section">
          <h4>【AI 影像分析】</h4>
          <div class="report-images-full">
             <img :src="patient?.image" />
             <p class="img-caption">左图：原图 &nbsp;&nbsp;&nbsp; 右图：U-KAN 模型预测结果</p>
          </div>
        </div>

        <div class="report-section">
          <h4>【综合诊断意见】</h4>
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
.diag-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 84px);
  display: flex;
  flex-direction: column;
}

.status-header {
  background: #fff;
  padding: 16px 24px;
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);

  .patient-card {
    display: flex;
    align-items: center;
    gap: 16px;
    .avatar-box { background: #E6A23C; font-weight: bold; font-size: 24px; color: #fff; }
    .info {
      .name-row { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
      .name { font-size: 20px; font-weight: 800; color: #1a1a1a; }
      .meta { font-size: 13px; color: #606266; display: flex; align-items: center; gap: 8px; }
    }
  }
  .header-actions { display: flex; gap: 10px; }
}

.panel-card {
  border-radius: 12px; border: none; background: #fff; box-shadow: 0 2px 12px rgba(0,0,0,0.03);
  :deep(.el-card__header) { padding: 15px 20px; border-bottom: 1px solid #f0f2f5; }
  .card-head { display: flex; justify-content: space-between; align-items: center; font-weight: 700; color: #303133; }
}

/* 视觉部分 */
.vision-card { margin-bottom: 20px; }
.vision-box {
  padding: 10px;
  .img-full-wrapper {
    position: relative;
    width: 100%;
    height: 200px;
    border-radius: 8px;
    overflow: hidden;
    background: #000;

    .full-img { width: 100%; height: 100%; object-fit: contain; }
    .badge {
      position: absolute; top: 10px; left: 10px;
      background: rgba(0,0,0,0.7); color: #fff;
      padding: 4px 8px; border-radius: 4px; font-size: 12px;
    }
  }
}

.metrics-grid {
  display: flex; gap: 10px; padding: 0 10px 15px;
  .metric-item {
    flex: 1; background: #f9fafc; padding: 10px; border-radius: 6px; text-align: center;
    .label { font-size: 12px; color: #909399; margin-bottom: 4px; }
    .value { font-size: 18px; font-weight: bold; color: #303133; }
    &.danger .value { color: #F56C6C; }
    &.warning .value { color: #E6A23C; }
  }
}

/* AI 报告 */
.ai-report-card {
  flex: 1; min-height: 350px;
  :deep(.el-card__body) { flex: 1; overflow: hidden; padding: 0; display: flex; }
  .ai-content-wrapper {
    flex: 1; background: #F9FAFB; padding: 20px; overflow-y: auto;
    .report-content { font-size: 14px; color: #333; line-height: 1.8; white-space: pre-wrap; }
    .empty-state {
      height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #909399;
      .ai-icon-bg { width: 50px; height: 50px; background: #EBEEF5; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; color: #fff; margin-bottom: 10px; }
    }
  }
}

/* 右侧布局 */
.fit-height { height: 100%; display: flex; flex-direction: column; :deep(.el-card__body) { flex: 1; display: flex; flex-direction: column; padding: 0; } }
.custom-tabs { flex: 1; display: flex; flex-direction: column; :deep(.el-tabs__content) { flex: 1; padding: 20px; } }
.chart-wrapper { height: 100%; width: 100%; border-radius: 8px; overflow: hidden; background: #fff; }

/* 打印单样式 */
.report-paper {
  background: #fff; padding: 40px; border: 1px solid #dcdfe6;
  font-family: 'SimSun', serif;

  .report-header { text-align: center; margin-bottom: 20px; h2 { margin: 0 0 10px; font-size: 22px; } .report-meta { display: flex; justify-content: space-between; font-size: 14px; color: #333; margin-top: 15px; } }
  .report-patient-info { display: flex; justify-content: space-between; margin: 15px 0; font-size: 15px; font-weight: bold; }
  .report-section {
    margin-top: 20px;
    h4 { background: #eee; padding: 5px 10px; margin: 0 0 10px; font-size: 16px; border-left: 4px solid #333; }
    .report-text { font-size: 14px; line-height: 1.8; white-space: pre-wrap; }
    .report-images-full {
      text-align: center;
      img { max-width: 100%; height: 200px; border: 1px solid #000; }
      .img-caption { font-size: 12px; margin-top: 5px; color: #666; }
    }
  }
}
</style>
