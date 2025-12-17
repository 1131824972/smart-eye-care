<script lang="ts" setup>
import { ref, reactive, computed } from "vue"
import { ElMessage, ElLoading, ElNotification } from "element-plus"
import { useRouter } from "vue-router"
import {
  User,
  Monitor,
  FirstAidKit,
  DocumentChecked,
  UploadFilled,
  ArrowLeft,
  ArrowRight,
  Check
} from "@element-plus/icons-vue"

const router = useRouter()
const activeStep = ref(0)

// --- 数据模型 ---
const formData = reactive({
  base: {
    id: "P" + new Date().getTime().toString().slice(-6),
    name: "",
    location: "昆明",
    date: new Date().toISOString().split("T")[0],
    gender: "男",
    age: 25,
    ethnicity: "汉族",
    job: "",
    education: ""
  },
  lifestyle: {
    smoking: "无",
    drinking: "无",
    diet: [] as string[],
    outdoorTime: 1,
    screenTime: 8,
    sleepTime: 7,
    environment: [] as string[]
  },
  history: {
    systemic: [] as string[],
    medication: [] as string[],
    eyeDisease: "",
    eyeSurgery: "无",
    eyeDrops: "无",
    contactLens: "否",
    infection: "无"
  },
  osdi: {
    // Part A
    light: 0, gritty: 0, pain: 0, blurred: 0, poorVision: 0,
    // Part B
    reading: 0, driving: 0, computer: 0, tv: 0,
    // Part C
    wind: 0, dryAir: 0, ac: 0
  },
  clinical: {
    height: 170, weight: 65, sbp: 120, dbp: 80,
    vod: 1.0, vos: 1.0,
    butOD: 0, butOS: 0,
    schirmerOD: 0, schirmerOS: 0
  }
})

// --- 选项常量 ---
const jobOptions = ["学生", "IT/互联网", "办公室职员", "驾驶员", "教师", "医务人员", "农民", "退休", "其他"]
const systemicOptions = ["高血压", "糖尿病", "心脏病", "肾病", "风湿免疫病", "甲状腺疾病", "面神经麻痹"]
const medOptions = ["降压药", "降脂药", "降糖药", "激素类", "免疫抑制剂", "安眠药", "避孕药"]

// --- OSDI 问题映射 ---
const osdiQuestions = {
  partA: [
    { key: 'light', label: '1. 您是否对光线敏感（怕光）？' },
    { key: 'gritty', label: '2. 您是否感到眼睛有异物感（像进了沙子）？' },
    { key: 'pain', label: '3. 您是否感到眼睛疼痛或酸痛？' },
    { key: 'blurred', label: '4. 您是否视力模糊？' },
    { key: 'poorVision', label: '5. 您是否感到视力差？' }
  ],
  partB: [
    { key: 'reading', label: '6. 读书或看报' },
    { key: 'driving', label: '7. 夜间驾驶' },
    { key: 'computer', label: '8. 操作电脑/手机/ATM机' },
    { key: 'tv', label: '9. 看电视' }
  ],
  partC: [
    { key: 'wind', label: '10. 刮风天气' },
    { key: 'dryAir', label: '11. 干燥环境（低湿度）' },
    { key: 'ac', label: '12. 空调房间内' }
  ]
}

// --- OSDI 计算 ---
const osdiScore = computed(() => {
  const values = Object.values(formData.osdi)
  const total = values.reduce((sum, val) => sum + Number(val), 0)
  return ((total * 25) / 12).toFixed(1)
})

const osdiLevel = computed(() => {
  const s = Number(osdiScore.value)
  if (s <= 12) return { label: "正常", type: "success" }
  if (s <= 22) return { label: "轻度干眼", type: "warning" }
  if (s <= 32) return { label: "中度干眼", type: "warning" }
  return { label: "重度干眼", type: "danger" }
})

const nextStep = () => { if (activeStep.value < 4) activeStep.value++; window.scrollTo({ top: 0, behavior: 'smooth' }) }
const prevStep = () => { if (activeStep.value > 0) activeStep.value-- }

const handleSubmit = () => {
  if (!formData.base.name) {
    ElMessage.error("请填写患者姓名")
    activeStep.value = 0
    return
  }

  const loading = ElLoading.service({
    lock: true,
    text: '正在上传多模态数据并请求 KAN+UNET 模型分析...',
    background: 'rgba(0, 0, 0, 0.8)',
  })

  localStorage.setItem('currentPatientData', JSON.stringify({
    ...formData,
    osdiScore: osdiScore.value,
    osdiResult: osdiLevel.value.label
  }))

  setTimeout(() => {
    loading.close()
    ElNotification({
      title: 'AI 分析完成',
      message: '已生成初步诊断报告，请医生复核',
      type: 'success',
      duration: 3000
    })
    router.push('/diagnosis/index')
  }, 2000)
}
</script>

<template>
  <div class="wizard-container">
    <div class="steps-wrapper">
      <el-steps :active="activeStep" finish-status="success" align-center class="custom-steps">
        <el-step title="基本信息" :icon="User" />
        <el-step title="生活习惯" :icon="Monitor" />
        <el-step title="病史采集" :icon="FirstAidKit" />
        <el-step title="OSDI量表" :icon="DocumentChecked" />
        <el-step title="临床影像" :icon="UploadFilled" />
      </el-steps>
    </div>

    <el-card class="form-card" shadow="never">
      <el-form :model="formData" label-position="top" size="large">

        <!-- Step 1: Base -->
        <div v-show="activeStep === 0" class="animate-fade">
          <div class="section-header"><span class="bar"></span><h3>人口学特征与基础信息</h3></div>
          <el-row :gutter="24">
            <el-col :span="8"><el-form-item label="采集编号"><el-input v-model="formData.base.id" disabled /></el-form-item></el-col>
            <el-col :span="8">
              <el-form-item label="采集地点">
                <el-select v-model="formData.base.location" class="w-full">
                  <el-option label="昆明 (海拔1891m)" value="昆明" />
                  <el-option label="大理 (海拔1976m)" value="大理" />
                  <el-option label="丽江 (海拔2418m)" value="丽江" />
                  <el-option label="香格里拉 (海拔3280m)" value="香格里拉" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8"><el-form-item label="日期"><el-date-picker v-model="formData.base.date" class="w-full"/></el-form-item></el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :span="8"><el-form-item label="姓名" required><el-input v-model="formData.base.name" /></el-form-item></el-col>
            <el-col :span="8">
              <el-form-item label="性别">
                <el-radio-group v-model="formData.base.gender" class="w-full">
                  <el-radio-button label="男" class="w-1/2"/><el-radio-button label="女" class="w-1/2"/>
                </el-radio-group>
              </el-form-item>
            </el-col>
            <el-col :span="8"><el-form-item label="年龄"><el-input-number v-model="formData.base.age" :min="1" class="w-full"/></el-form-item></el-col>
          </el-row>
          <el-row :gutter="24">
             <el-col :span="12"><el-form-item label="职业"><el-select v-model="formData.base.job" class="w-full"><el-option v-for="j in jobOptions" :key="j" :label="j" :value="j"/></el-select></el-form-item></el-col>
             <el-col :span="12"><el-form-item label="教育程度"><el-select v-model="formData.base.education" class="w-full"><el-option label="大学" value="大学"/><el-option label="中学" value="中学"/></el-select></el-form-item></el-col>
          </el-row>
        </div>

        <!-- Step 2: Lifestyle -->
        <div v-show="activeStep === 1" class="animate-fade">
          <div class="section-header"><span class="bar"></span><h3>生活方式与环境暴露</h3></div>
          <div class="bg-blue-50 dark:bg-gray-800 p-6 rounded-lg mb-6">
            <h4 class="font-bold mb-4 text-blue-600">电子终端暴露评估</h4>
            <el-form-item label="每日屏幕使用总时长 (小时)">
               <el-slider v-model="formData.lifestyle.screenTime" :max="20" show-input />
            </el-form-item>
          </div>
          <el-row :gutter="40">
            <el-col :span="12">
              <el-form-item label="平均睡眠 (小时)"><el-input-number v-model="formData.lifestyle.sleepTime" :max="24"/></el-form-item>
              <el-form-item label="户外活动 (小时)"><el-input-number v-model="formData.lifestyle.outdoorTime" :max="24"/></el-form-item>
            </el-col>
            <el-col :span="12">
               <el-form-item label="不良嗜好">
                 <div class="flex flex-col gap-4 mt-2">
                   <div class="flex items-center"><span class="w-12">吸烟</span><el-radio-group v-model="formData.lifestyle.smoking"><el-radio label="无"/><el-radio label="偶尔"/><el-radio label="经常"/></el-radio-group></div>
                   <div class="flex items-center"><span class="w-12">饮酒</span><el-radio-group v-model="formData.lifestyle.drinking"><el-radio label="无"/><el-radio label="偶尔"/><el-radio label="经常"/></el-radio-group></div>
                 </div>
               </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- Step 3: History -->
        <div v-show="activeStep === 2" class="animate-fade">
          <div class="section-header"><span class="bar"></span><h3>既往病史</h3></div>
          <el-form-item label="全身疾病史">
            <el-checkbox-group v-model="formData.history.systemic"><el-checkbox v-for="d in systemicOptions" :key="d" :label="d" border class="mb-2"/></el-checkbox-group>
          </el-form-item>
          <el-form-item label="长期用药">
            <el-checkbox-group v-model="formData.history.medication"><el-checkbox v-for="m in medOptions" :key="m" :label="m" border class="mb-2"/></el-checkbox-group>
          </el-form-item>
          <el-divider/>
          <el-row :gutter="24">
             <el-col :span="12"><el-form-item label="眼部手术史"><el-input v-model="formData.history.eyeSurgery" type="textarea"/></el-form-item></el-col>
             <el-col :span="12"><el-form-item label="近3个月眼部感染"><el-input v-model="formData.history.infection" type="textarea"/></el-form-item></el-col>
          </el-row>
          <el-form-item label="长期佩戴隐形眼镜"><el-switch v-model="formData.history.contactLens" active-value="是" inactive-value="否" active-text="是" inactive-text="否"/></el-form-item>
        </div>

        <!-- Step 4: OSDI (Updated Layout) -->
        <div v-show="activeStep === 3" class="animate-fade">
          <div class="flex justify-between items-end mb-6 border-b pb-4">
            <div class="section-header mb-0"><span class="bar"></span><h3>OSDI 眼表疾病指数问卷</h3></div>
            <div class="text-right">
              <div class="text-sm text-gray-500 mb-1">当前评分</div>
              <div class="flex items-baseline gap-2 justify-end">
                <span class="text-3xl font-bold" :class="`text-${osdiLevel.type}`">{{ osdiScore }}</span>
                <el-tag :type="osdiLevel.type" effect="dark">{{ osdiLevel.label }}</el-tag>
              </div>
            </div>
          </div>

          <div class="osdi-content space-y-8 pb-4">
            <!-- Part A -->
            <div class="category-block">
              <h4 class="font-bold text-lg mb-4 text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-gray-800 p-3 rounded">
                A. 您过去一周是否有以下症状？
              </h4>
              <div v-for="q in osdiQuestions.partA" :key="q.key" class="question-row flex items-center justify-between py-3 border-b border-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 px-2 rounded transition">
                <span class="text-base text-gray-700 dark:text-gray-300 w-1/2">{{ q.label }}</span>
                <el-rate
                  v-model="formData.osdi[q.key]"
                  :max="4"
                  show-text
                  :texts="['从未 (0)', '偶尔 (1)', '半数 (2)', '多数 (3)', '一直 (4)']"
                  class="ml-4"
                />
              </div>
            </div>

            <!-- Part B -->
            <div class="category-block">
              <h4 class="font-bold text-lg mb-4 text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-gray-800 p-3 rounded">
                B. 您的眼睛是否导致以下活动受限？
              </h4>
              <div v-for="q in osdiQuestions.partB" :key="q.key" class="question-row flex items-center justify-between py-3 border-b border-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 px-2 rounded transition">
                <span class="text-base text-gray-700 dark:text-gray-300 w-1/2">{{ q.label }}</span>
                <el-rate
                  v-model="formData.osdi[q.key]"
                  :max="4"
                  show-text
                  :texts="['无困难 (0)', '偶尔 (1)', '半数 (2)', '经常 (3)', '不能 (4)']"
                  class="ml-4"
                />
              </div>
            </div>

            <!-- Part C -->
             <div class="category-block">
              <h4 class="font-bold text-lg mb-4 text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-gray-800 p-3 rounded">
                C. 您在以下环境中是否感到不适？
              </h4>
              <div v-for="q in osdiQuestions.partC" :key="q.key" class="question-row flex items-center justify-between py-3 border-b border-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 px-2 rounded transition">
                <span class="text-base text-gray-700 dark:text-gray-300 w-1/2">{{ q.label }}</span>
                <el-rate
                  v-model="formData.osdi[q.key]"
                  :max="4"
                  show-text
                  :texts="['从未 (0)', '偶尔 (1)', '半数 (2)', '多数 (3)', '一直 (4)']"
                  class="ml-4"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Step 5: Clinical -->
        <div v-show="activeStep === 4" class="animate-fade">
          <div class="section-header"><span class="bar"></span><h3>临床体征与影像上传</h3></div>
          <div class="grid grid-cols-2 gap-8 mb-8">
            <div class="bg-gray-50 dark:bg-gray-800 p-5 rounded-lg">
               <h4 class="font-bold mb-4">眼科专科检查</h4>
               <table class="w-full text-sm text-left">
                 <thead><tr class="text-gray-500 border-b"><th class="pb-2">项目</th><th>OD (右)</th><th>OS (左)</th></tr></thead>
                 <tbody>
                   <tr><td class="py-2">视力</td><td><el-input-number v-model="formData.clinical.vod" :step="0.1" size="small"/></td><td><el-input-number v-model="formData.clinical.vos" :step="0.1" size="small"/></td></tr>
                   <tr><td class="py-2">BUT (秒)</td><td><el-input-number v-model="formData.clinical.butOD" size="small"/></td><td><el-input-number v-model="formData.clinical.butOS" size="small"/></td></tr>
                   <tr><td class="py-2">Schirmer (mm)</td><td><el-input-number v-model="formData.clinical.schirmerOD" size="small"/></td><td><el-input-number v-model="formData.clinical.schirmerOS" size="small"/></td></tr>
                 </tbody>
               </table>
            </div>
             <div class="upload-section border-2 border-dashed border-primary rounded-xl p-8 bg-blue-50/30 text-center flex flex-col justify-center items-center">
                <el-icon class="text-5xl text-primary mb-2"><UploadFilled /></el-icon>
                <h3 class="font-bold">上传眼表/睑板腺/泪河影像</h3>
                <p class="text-xs text-gray-500 mb-4">支持 JPG/PNG/DICOM，用于 KAN+UNET 模型分割</p>
                <el-upload action="#" :auto-upload="false" multiple :show-file-list="true">
                   <el-button type="primary">点击上传图片</el-button>
                </el-upload>
             </div>
          </div>
        </div>
      </el-form>
    </el-card>

    <div class="footer-actions">
      <el-button v-if="activeStep > 0" @click="prevStep" :icon="ArrowLeft" size="large">上一步</el-button>
      <div class="flex-1"></div>
      <el-button v-if="activeStep < 4" type="primary" @click="nextStep" size="large">下一步 <el-icon class="el-icon--right"><ArrowRight /></el-icon></el-button>
      <el-button v-if="activeStep === 4" type="success" @click="handleSubmit" size="large">提交并诊断 <el-icon class="ml-2"><Check /></el-icon></el-button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.wizard-container { max-width: 1200px; margin: 0 auto; padding-bottom: 80px; }
.steps-wrapper { margin-bottom: 30px; padding: 20px; background: var(--el-bg-color); border-radius: 12px; box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05); }
.form-card { min-height: 600px; border-radius: 16px;
  .section-header { display: flex; align-items: center; margin-bottom: 25px;
    .bar { width: 4px; height: 24px; background: var(--el-color-primary); border-radius: 2px; margin-right: 12px; }
    h3 { font-size: 20px; font-weight: 700; margin: 0; }
  }
}
.footer-actions { position: fixed; bottom: 0; right: 0; left: var(--el-aside-width, 220px); background: var(--el-bg-color); padding: 15px 40px; box-shadow: 0 -2px 10px rgba(0,0,0,0.05); display: flex; z-index: 99; transition: left 0.3s; }
.animate-fade { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

/* OSDI Rate Text Style */
:deep(.el-rate__text) { font-size: 13px; color: #666 !important; margin-left: 8px; font-weight: 500;}
</style>
