<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import KnowledgeGraph from '@/components/KnowledgeGraph.vue'
import YunnanMap from '@/components/YunnanMap.vue'
import { Picture, MagicStick, DataAnalysis } from '@element-plus/icons-vue'

const router = useRouter()
const patient = ref<any>(null)
const activeName = ref('graph') // 默认显示知识图谱

// 模拟诊断结果
const diagnosis = ref({
  level: '',
  score: 0,
  text: ''
})

onMounted(() => {
  const data = localStorage.getItem('currentPatient')
  if (data) {
    patient.value = JSON.parse(data)
    // 模拟分析耗时
    setTimeout(() => {
      diagnosis.value = {
        level: '中度干眼',
        score: 72,
        text: '左眼睑板腺可见明显缺失（约30%），结合患者居住于高海拔（丽江）地区，强紫外线是加重病情的关键因素。建议配合物理治疗。'
      }
    }, 800)
  } else {
    // router.push('/patient') // 开发时注释掉，方便调试
  }
})
</script>

<template>
  <div class="diag-container">
    <!-- 顶部状态栏 -->
    <div class="status-bar">
      <div class="patient-info" v-if="patient">
        <span class="label">当前患者：</span>
        <span class="name">{{ patient.name }}</span>
        <el-tag size="small" type="info">{{ patient.gender }}</el-tag>
        <el-tag size="small" type="info">{{ patient.age }}岁</el-tag>
        <el-tag size="small" type="warning" effect="dark">{{ patient.region }}</el-tag>
      </div>
      <div class="diag-result" v-if="diagnosis.level">
        <span class="label">智能诊断结果：</span>
        <el-tag type="danger" effect="dark" size="large">{{ diagnosis.level }}</el-tag>
        <span class="score">风险评分: {{ diagnosis.score }}</span>
      </div>
    </div>

    <el-row :gutter="20" class="main-content">
      <!-- 左侧：影像分析 (KAN + UNET) -->
      <el-col :span="8" class="left-panel">
        <el-card shadow="always" class="panel-card">
          <template #header>
            <div class="card-head">
              <el-icon><MagicStick /></el-icon> <span>AI 模型分析 (KAN + UNET)</span>
            </div>
          </template>

          <div class="img-analysis">
            <div class="img-wrapper">
              <div class="tag">原始图像 (Input)</div>
              <img v-if="patient?.image" :src="patient.image" />
              <div v-else class="placeholder">无影像</div>
            </div>
            <div class="arrow">⬇️ UNET 分割推理</div>
            <div class="img-wrapper">
              <div class="tag">腺体分割 (Output)</div>
              <!-- 模拟分割图：用CSS反转颜色模拟mask -->
              <img v-if="patient?.image" :src="patient.image" style="filter: invert(1) contrast(200%);" />
              <div v-else class="placeholder">等待处理...</div>
            </div>
          </div>

          <div class="conclusion">
            <h4><el-icon><DataAnalysis /></el-icon> 分析结论：</h4>
            <p>{{ diagnosis.text || '正在运行模型...' }}</p>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧：图谱与地理可视化 -->
      <el-col :span="16" class="right-panel">
        <el-card shadow="always" class="panel-card fit-height">
          <el-tabs v-model="activeName">
            <el-tab-pane label="病因知识图谱" name="graph">
              <KnowledgeGraph />
            </el-tab-pane>
            <el-tab-pane label="云南地理环境态势 (3D)" name="map">
              <YunnanMap />
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped lang="scss">
.diag-container {
  padding: 15px;
  background: #f0f2f5;
  min-height: 100vh;
}
.status-bar {
  background: #fff;
  padding: 15px 20px;
  border-radius: 8px;
  margin-bottom: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);

  .label { font-weight: bold; color: #606266; margin-right: 10px; }
  .name { font-size: 18px; font-weight: bold; margin-right: 10px; }
  .score { margin-left: 15px; color: #F56C6C; font-weight: bold; }
  .el-tag { margin-right: 8px; }
}

.panel-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  :deep(.el-card__body) {
    flex: 1;
    overflow: auto;
  }
}

.fit-height {
  min-height: 700px;
}

.card-head {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: bold;
  color: #409EFF;
}

.img-analysis {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;

  .img-wrapper {
    width: 100%;
    position: relative;
    border-radius: 6px;
    overflow: hidden;
    border: 1px solid #dcdfe6;

    img { width: 100%; height: 200px; object-fit: cover; display: block; }
    .placeholder { height: 200px; background: #f5f7fa; display: flex; align-items: center; justify-content: center; color: #909399; }

    .tag {
      position: absolute;
      top: 5px;
      left: 5px;
      background: rgba(0,0,0,0.6);
      color: #fff;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 12px;
    }
  }
  .arrow { font-size: 12px; color: #909399; }
}

.conclusion {
  margin-top: 20px;
  padding: 15px;
  background: #ecf5ff;
  border-radius: 4px;
  h4 { margin: 0 0 8px 0; color: #409EFF; display: flex; align-items: center; gap: 5px; }
  p { margin: 0; font-size: 14px; color: #606266; line-height: 1.6; }
}
</style>
