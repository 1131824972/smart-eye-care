<script lang="ts" setup>
import { ref, reactive } from "vue"
import { useRouter } from "vue-router"
import {
  UserFilled,
  TrendCharts,
  List,
  Bell,
  Calendar,
  Search,
  ArrowRight,
  FirstAidKit,
  WarningFilled,
  CircleCheckFilled,
  Clock
} from "@element-plus/icons-vue"
import { ElMessage } from "element-plus"

const router = useRouter()

// --- 1. 顶部统计数据 ---
const stats = [
  { title: "今日待诊", value: 12, icon: UserFilled, color: "#409eff", bg: "rgba(64, 158, 255, 0.1)" },
  { title: "已完成诊断", value: 34, icon: CircleCheckFilled, color: "#67c23a", bg: "rgba(103, 194, 58, 0.1)" },
  { title: "高危预警", value: 3, icon: WarningFilled, color: "#f56c6c", bg: "rgba(245, 108, 108, 0.1)" },
  { title: "平均诊时", value: "8.5m", icon: Clock, color: "#e6a23c", bg: "rgba(230, 162, 60, 0.1)" },
]

// --- 2. 患者队列数据 (Mock) ---
const searchQuery = ref("")
const patientQueue = ref([
  {
    id: "P20230521", name: "张伟", age: 45, gender: "男", time: "09:30",
    symptom: "眼干、畏光",
    risk: "糖尿病视网膜病变", // 全身病关联
    riskLevel: "High",
    status: "waiting"
  },
  {
    id: "P20230522", name: "李秀英", age: 62, gender: "女", time: "09:45",
    symptom: "异物感强",
    risk: "干燥综合征 (SS)",
    riskLevel: "High",
    status: "waiting"
  },
  {
    id: "P20230523", name: "王强", age: 28, gender: "男", time: "10:00",
    symptom: "视力波动",
    risk: "无明显全身风险",
    riskLevel: "Low",
    status: "waiting"
  },
  {
    id: "P20230524", name: "陈静", age: 35, gender: "女", time: "10:15",
    symptom: "长期隐形眼镜",
    risk: "甲状腺相关眼病",
    riskLevel: "Medium",
    status: "processing"
  },
  {
    id: "P20230525", name: "刘洋", age: 55, gender: "男", time: "10:30",
    symptom: "睑板腺堵塞",
    risk: "高血脂",
    riskLevel: "Medium",
    status: "waiting"
  },
])

// --- 3. 日历 ---
const date = ref(new Date())

// --- 4. 交互逻辑 ---
const handleDiagnose = (row: any) => {
  ElMessage.success(`正在调取患者 [${row.name}] 的多模态数据...`)
  // 模拟将数据存入 LocalStorage，以便诊断页读取
  localStorage.setItem('currentPatientData', JSON.stringify({
    base: { name: row.name, id: row.id, age: row.age, gender: row.gender },
    osdiScore: row.riskLevel === 'High' ? 45 : 20 // 模拟分数
  }))

  setTimeout(() => {
    router.push('/diagnosis/index')
  }, 800)
}

const handleInput = () => {
  router.push('/patient/index')
}

// 颜色映射
const getRiskTagType = (level: string) => {
  if (level === 'High') return 'danger'
  if (level === 'Medium') return 'warning'
  return 'success'
}
</script>

<template>
  <div class="workbench-container">

    <!-- 头部欢迎区 -->
    <div class="header-section">
      <div class="left">
        <h1 class="text-2xl font-bold text-gray-800 dark:text-white">早安，Dr. AI 👋</h1>
        <p class="text-gray-500 mt-1">今天是 {{ new Date().toLocaleDateString() }}，Smart Eye Care 系统运行正常。</p>
      </div>
      <div class="right flex gap-3">
        <el-button type="primary" plain :icon="TrendCharts" @click="router.push('/dashboard/index')">查看数据大屏</el-button>
        <el-button type="primary" :icon="List" @click="handleInput">新患者录入</el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="mb-6">
      <el-col :span="6" v-for="(item, index) in stats" :key="index">
        <el-card shadow="hover" class="stat-card border-none">
          <div class="flex items-center">
            <div class="icon-box" :style="{ color: item.color, backgroundColor: item.bg }">
              <el-icon><component :is="item.icon" /></el-icon>
            </div>
            <div class="ml-4">
              <div class="text-gray-500 text-xs">{{ item.title }}</div>
              <div class="text-2xl font-bold mt-1 text-gray-800 dark:text-gray-100">{{ item.value }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 主要内容区：左侧列表，右侧辅助 -->
    <el-row :gutter="20">

      <!-- 左侧：患者队列 -->
      <el-col :span="16">
        <el-card shadow="never" class="queue-card">
          <template #header>
            <div class="flex justify-between items-center">
              <span class="font-bold text-lg flex items-center">
                <el-icon class="mr-2 text-blue-500"><List /></el-icon> 待诊患者队列
              </span>
              <div class="w-64">
                <el-input v-model="searchQuery" placeholder="搜索姓名或ID..." :prefix-icon="Search" />
              </div>
            </div>
          </template>

          <el-table :data="patientQueue" style="width: 100%" size="large" :header-cell-style="{background:'#f5f7fa', color:'#606266'}">
            <el-table-column prop="id" label="ID" width="100" />
            <el-table-column label="患者信息" width="140">
              <template #default="scope">
                <div class="flex items-center">
                  <el-avatar :size="30" class="mr-2 bg-blue-100 text-blue-500">{{ scope.row.name[0] }}</el-avatar>
                  <div>
                    <div class="font-bold leading-tight">{{ scope.row.name }}</div>
                    <div class="text-xs text-gray-400">{{ scope.row.gender }} {{ scope.row.age }}岁</div>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="symptom" label="主诉症状" />
            <el-table-column label="AI全身病风险预测" width="200">
              <template #default="scope">
                <el-tag :type="getRiskTagType(scope.row.riskLevel)" effect="plain" round>
                  <el-icon class="mr-1" v-if="scope.row.riskLevel!=='Low'"><FirstAidKit /></el-icon>
                  {{ scope.row.risk }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="time" label="预约时间" width="100" />
            <el-table-column label="操作" width="150" fixed="right">
              <template #default="scope">
                <el-button type="primary" size="default" round @click="handleDiagnose(scope.row)">
                  开始接诊 <el-icon class="ml-1"><ArrowRight /></el-icon>
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <!-- 右侧：日程与通知 -->
      <el-col :span="8">
        <!-- 1. 排班日历 -->
        <el-card shadow="never" class="mb-4 calendar-card">
          <template #header>
            <span class="font-bold flex items-center"><el-icon class="mr-2"><Calendar /></el-icon> 医生排班</span>
          </template>
          <el-calendar v-model="date" class="custom-calendar" />
        </el-card>

        <!-- 2. 紧急通知 -->
        <el-card shadow="never" class="notice-card">
          <template #header>
            <div class="flex justify-between items-center">
              <span class="font-bold flex items-center text-red-500"><el-icon class="mr-2"><Bell /></el-icon> 紧急通知</span>
              <el-tag size="small" type="danger" effect="dark">New</el-tag>
            </div>
          </template>
          <div class="notice-list">
            <div class="notice-item">
              <div class="title">系统升级通知</div>
              <div class="desc">AI 模型 (KAN+UNET) 已更新至 v2.3 版本，提升了微小病灶识别率。</div>
              <div class="time">10分钟前</div>
            </div>
            <div class="notice-item">
              <div class="title">会诊提醒</div>
              <div class="desc">患者 [张伟] 的干燥综合征确诊需要风湿免疫科联合会诊。</div>
              <div class="time">30分钟前</div>
            </div>
          </div>
        </el-card>
      </el-col>

    </el-row>
  </div>
</template>

<style scoped lang="scss">
.workbench-container {
  padding: 20px;
  background-color: var(--el-bg-color-page);
  min-height: 100vh;
}

/* Header */
.header-section {
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;
}

/* Stat Cards */
.stat-card {
  transition: transform 0.3s;
  &:hover { transform: translateY(-3px); }
  .icon-box {
    width: 48px; height: 48px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center; font-size: 24px;
  }
}

/* Queue List */
.queue-card {
  border-radius: 8px;
  :deep(.el-card__header) { padding: 15px 20px; border-bottom: 1px solid var(--el-border-color-light); }
}

/* Calendar Styling Override */
.custom-calendar {
  :deep(.el-calendar__header) { padding: 5px 0; border: none; }
  :deep(.el-calendar__body) { padding: 0; }
  :deep(.el-calendar-table td) { border: none; }
  :deep(.el-calendar-table .el-calendar-day) { height: 35px; text-align: center; padding: 0; line-height: 35px; }
  :deep(.el-calendar-table td.is-selected .el-calendar-day) { background-color: var(--el-color-primary-light-9); color: var(--el-color-primary); font-weight: bold; border-radius: 6px;}
}

/* Notice List */
.notice-list {
  .notice-item {
    padding-bottom: 12px; margin-bottom: 12px; border-bottom: 1px dashed var(--el-border-color-lighter);
    &:last-child { border-bottom: none; margin-bottom: 0; }
    .title { font-weight: bold; font-size: 14px; margin-bottom: 4px; color: var(--el-text-color-primary); }
    .desc { font-size: 12px; color: var(--el-text-color-secondary); line-height: 1.4; margin-bottom: 4px; }
    .time { font-size: 11px; color: #999; }
  }
}
</style>
