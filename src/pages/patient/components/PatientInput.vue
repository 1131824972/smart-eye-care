<script lang="ts" setup>
import { ref, reactive, computed } from "vue"
import { ElMessage, ElLoading, ElNotification } from "element-plus"
import { useRouter } from "vue-router"
import {
  User, Monitor, FirstAidKit, DocumentChecked, UploadFilled,
  ArrowLeft, ArrowRight, Check, View, InfoFilled, Warning
} from "@element-plus/icons-vue"

const router = useRouter()
const activeStep = ref(0)

// --- 类型定义 ---
interface AsthenopiaItem {
  freq: number; // 频度: 0-3
  sev: number;  // 程度: 0 (不适用), 1-3
}

type QuestionKey = 'p1' | 'p2' | 'p3' | 'p4' | 'p5' | 'p6' | 'p7' | 'p8' | 'p9' | 'p10' | 'p11' | 'p12' | 'p13' | 'p14';
type AsthenopiaData = Record<QuestionKey, AsthenopiaItem>;

// --- 数据模型 ---
const formData = reactive({
  base: {
    id: "P" + new Date().getTime().toString().slice(-6),
    name: "", location: "昆明", date: new Date().toISOString().split("T")[0],
    gender: "男", age: 25, ethnicity: "汉族", job: "", education: ""
  },
  lifestyle: {
    smoking: "无", drinking: "无", diet: [] as string[],
    outdoorTime: 1, screenTime: 8, sleepTime: 7, environment: [] as string[]
  },
  history: {
    systemic: [] as string[], medication: [] as string[],
    eyeDisease: "", eyeSurgery: "无", eyeDrops: "无", contactLens: "否", infection: "无"
  },
  // 视疲劳量表数据 (P1-P14)
  asthenopia: {
    p1: { freq: 0, sev: 0 }, p2: { freq: 0, sev: 0 }, p3: { freq: 0, sev: 0 }, p4: { freq: 0, sev: 0 },
    p5: { freq: 0, sev: 0 }, p6: { freq: 0, sev: 0 }, p7: { freq: 0, sev: 0 }, p8: { freq: 0, sev: 0 },
    p9: { freq: 0, sev: 0 }, p10: { freq: 0, sev: 0 }, p11: { freq: 0, sev: 0 }, p12: { freq: 0, sev: 0 },
    p13: { freq: 0, sev: 0 }, p14: { freq: 0, sev: 0 }
  } as AsthenopiaData,
  clinical: {
    height: 170, weight: 65, sbp: 120, dbp: 80,
    vod: 1.0, vos: 1.0, butOD: 0, butOS: 0, schirmerOD: 0, schirmerOS: 0
  }
})

// --- 选项常量 ---
const jobOptions = ["学生", "IT/互联网", "办公室职员", "驾驶员", "教师", "医务人员", "农民", "退休", "其他"]
const systemicOptions = ["高血压", "糖尿病", "心脏病", "肾病", "风湿免疫病", "甲状腺疾病", "面神经麻痹"]
const medOptions = ["降压药", "降脂药", "降糖药", "激素类", "免疫抑制剂", "安眠药", "避孕药"]

// --- 问卷配置 ---
const questionnaire = [
  {
    title: "Part A. 眼部症状", desc: "主要涉及眼部的感觉异常",
    items: [
      { key: 'p1', label: 'P1. 你是否感觉眼周不适？' },
      { key: 'p2', label: 'P2. 你是否有眼干？' },
      { key: 'p3', label: 'P3. 你是否有眼部疼痛（如刺痛、胀痛等）？' },
      { key: 'p4', label: 'P4. 你是否有眼睑（眼皮）沉重感？' },
      { key: 'p5', label: 'P5. 你是否有眼酸？' },
      { key: 'p6', label: 'P6. 你是否有眼部紧绷感？' },
      { key: 'p7', label: 'P7. 你是否有对光线敏感（如怕光、怕暗）？' },
    ] as {key: QuestionKey, label: string}[]
  },
  {
    title: "Part B. 视觉症状", desc: "主要涉及视物功能的异常",
    items: [
      { key: 'p8', label: 'P8. 当使用手机/电脑时，屏幕亮度是否让你不适？' },
      { key: 'p9', label: 'P9. 你是否有眯眼视物的现象？' },
      { key: 'p10', label: 'P10. 近距用眼时，你是否觉得阅读费力？' },
      { key: 'p11', label: 'P11. 看远或看近时，是否有视物模糊？' },
      { key: 'p12', label: 'P12. 看远或看近时，是否有视物重影？' },
      { key: 'p13', label: 'P13. 由于眼部症状，你是否感觉阅读速度减慢？' },
      { key: 'p14', label: 'P14. 你是否看运动物体时有眼部不适？' },
    ] as {key: QuestionKey, label: string}[]
  }
]

// --- UI 升级：颜色逻辑 (Traffic Light System) ---
// 频度选项：增加 colorClass
const freqOptions = [
  { val: 0, label: "没有", desc: "Never", activeClass: "bg-slate-500 border-slate-500 text-white" },
  { val: 1, label: "偶尔", desc: "Rarely", activeClass: "bg-emerald-500 border-emerald-500 text-white" },  // Green
  { val: 2, label: "经常", desc: "Often", activeClass: "bg-amber-500 border-amber-500 text-white" },      // Orange
  { val: 3, label: "总是", desc: "Always", activeClass: "bg-rose-500 border-rose-500 text-white" }         // Red
]

// 程度选项
const sevOptions = [
  { val: 1, label: "轻度", activeClass: "bg-emerald-100 text-emerald-700 border-emerald-500 ring-emerald-200" },
  { val: 2, label: "中度", activeClass: "bg-amber-100 text-amber-700 border-amber-500 ring-amber-200" },
  { val: 3, label: "重度", activeClass: "bg-rose-100 text-rose-700 border-rose-500 ring-rose-200" }
]

const totalScore = computed(() => {
  let score = 0
  const keys = Object.keys(formData.asthenopia) as QuestionKey[]
  keys.forEach(key => {
    const item = formData.asthenopia[key]
    score += item.freq
    if (item.freq > 0) score += item.sev
  })
  return score
})

const diagnosisResult = computed(() => {
  const s = totalScore.value
  if (s <= 5) return { label: "无干眼", type: "success" as const }
  if (s <= 15) return { label: "轻度干眼", type: "warning" as const }
  if (s <= 25) return { label: "中度干眼", type: "warning" as const }
  return { label: "重度干眼", type: "danger" as const }
})

const nextStep = () => { if (activeStep.value < 4) activeStep.value++; window.scrollTo({ top: 0, behavior: 'smooth' }) }
const prevStep = () => { if (activeStep.value > 0) activeStep.value-- }

const handleSubmit = () => {
  if (!formData.base.name) { ElMessage.error("请填写患者姓名"); activeStep.value = 0; return }
  const loading = ElLoading.service({ lock: true, text: '正在上传多模态数据并请求 AI 模型分析...', background: 'rgba(0, 0, 0, 0.8)' })
  localStorage.setItem('currentPatientData', JSON.stringify({ ...formData, osdiScore: totalScore.value, osdiResult: diagnosisResult.value.label }))
  setTimeout(() => {
    loading.close()
    ElNotification({ title: 'AI 分析完成', message: '干眼症筛查评估已完成，请查看详细报告', type: 'success', duration: 3000 })
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
        <el-step title="干眼症筛查" :icon="DocumentChecked" />
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
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8"><el-form-item label="日期"><el-date-picker v-model="formData.base.date" class="w-full"/></el-form-item></el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :span="8"><el-form-item label="姓名" required><el-input v-model="formData.base.name" /></el-form-item></el-col>
            <el-col :span="8">
              <el-form-item label="性别"><el-radio-group v-model="formData.base.gender" class="w-full"><el-radio-button label="男" class="w-1/2"/><el-radio-button label="女" class="w-1/2"/></el-radio-group></el-form-item>
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
          <div class="bg-teal-50 dark:bg-gray-800 p-6 rounded-lg mb-6 border border-teal-100 dark:border-gray-700">
            <h4 class="font-bold mb-4 text-teal-700 flex items-center"><el-icon class="mr-2"><Monitor /></el-icon> 电子终端暴露评估</h4>
            <el-form-item label="每日屏幕使用总时长 (小时)">
               <el-slider v-model="formData.lifestyle.screenTime" :max="20" show-input :marks="{8:'8h(警戒线)'}" />
            </el-form-item>
          </div>
          <el-row :gutter="40">
            <el-col :span="12">
              <el-form-item label="平均睡眠 (小时)"><el-input-number v-model="formData.lifestyle.sleepTime" :max="24" class="w-full"/></el-form-item>
              <el-form-item label="户外活动 (小时)"><el-input-number v-model="formData.lifestyle.outdoorTime" :max="24" class="w-full"/></el-form-item>
            </el-col>
            <el-col :span="12">
               <el-form-item label="不良嗜好">
                 <div class="flex flex-col gap-4 mt-2 w-full">
                   <div class="flex items-center justify-between p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
                     <span class="w-16 font-bold text-gray-600">吸烟</span>
                     <el-radio-group v-model="formData.lifestyle.smoking" size="small"><el-radio-button label="无"/><el-radio-button label="偶尔"/><el-radio-button label="经常"/></el-radio-group>
                   </div>
                   <div class="flex items-center justify-between p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
                     <span class="w-16 font-bold text-gray-600">饮酒</span>
                     <el-radio-group v-model="formData.lifestyle.drinking" size="small"><el-radio-button label="无"/><el-radio-button label="偶尔"/><el-radio-button label="经常"/></el-radio-group>
                   </div>
                 </div>
               </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- Step 3: History -->
        <div v-show="activeStep === 2" class="animate-fade">
          <div class="section-header"><span class="bar"></span><h3>既往病史</h3></div>
          <el-form-item label="全身疾病史">
            <el-checkbox-group v-model="formData.history.systemic"><el-checkbox v-for="d in systemicOptions" :key="d" :label="d" border class="mb-2 !mr-2" /></el-checkbox-group>
          </el-form-item>
          <el-form-item label="长期用药">
            <el-checkbox-group v-model="formData.history.medication"><el-checkbox v-for="m in medOptions" :key="m" :label="m" border class="mb-2 !mr-2"/></el-checkbox-group>
          </el-form-item>
          <el-divider border-style="dashed" />
          <el-row :gutter="24">
             <el-col :span="12"><el-form-item label="眼部手术史"><el-input v-model="formData.history.eyeSurgery" type="textarea" placeholder="无" /></el-form-item></el-col>
             <el-col :span="12"><el-form-item label="近3个月眼部感染"><el-input v-model="formData.history.infection" type="textarea" placeholder="无" /></el-form-item></el-col>
          </el-row>
          <el-form-item label="长期佩戴隐形眼镜"><el-switch v-model="formData.history.contactLens" active-value="是" inactive-value="否" active-text="是" inactive-text="否" class="ml-2"/></el-form-item>
        </div>

        <!-- Step 4: Asthenopia Questionnaire (Enhanced UI) -->
        <div v-show="activeStep === 3" class="animate-fade">
          <div class="sticky top-0 bg-white/95 backdrop-blur z-20 pb-4 pt-2 border-b border-gray-100 mb-6 flex justify-between items-end shadow-sm">
            <div class="section-header mb-0">
              <span class="bar"></span>
              <div>
                <h3 class="flex items-center gap-2">干眼症筛查问卷 <el-tag size="small" type="primary" effect="plain">自测版</el-tag></h3>
                <p class="text-xs text-gray-400 mt-1 font-normal">点击选项以评估症状，颜色越深表示症状越重</p>
              </div>
            </div>
            <div class="bg-slate-50 px-5 py-2 rounded-lg border border-slate-200 flex flex-col items-end">
              <div class="text-[10px] text-gray-500 uppercase tracking-wide">Total Score</div>
              <div class="flex items-center gap-3">
                <span class="text-3xl font-bold font-mono" :class="`text-${diagnosisResult.type}`">{{ totalScore }}</span>
                <el-tag :type="diagnosisResult.type" effect="dark" round class="font-bold">{{ diagnosisResult.label }}</el-tag>
              </div>
            </div>
          </div>

          <div class="space-y-8 pb-10">
            <div v-for="(part, pIndex) in questionnaire" :key="pIndex" class="part-container">
              <div class="flex items-center gap-3 mb-4 px-2">
                <div class="w-8 h-8 rounded-lg bg-slate-800 text-teal-400 flex items-center justify-center font-bold text-sm shadow-md">{{ pIndex === 0 ? 'A' : 'B' }}</div>
                <div><h4 class="font-bold text-slate-700 text-lg">{{ part.title }}</h4><p class="text-xs text-gray-400">{{ part.desc }}</p></div>
              </div>

              <div class="space-y-3">
                <div v-for="(item, index) in part.items" :key="item.key"
                     class="question-card p-4 rounded-xl border transition-all duration-200 hover:shadow-md relative overflow-hidden"
                     :class="[
                       index % 2 === 0 ? 'bg-slate-50/50' : 'bg-white',
                       formData.asthenopia[item.key].freq > 0 ? 'border-teal-200 ring-1 ring-teal-50' : 'border-gray-100'
                     ]">

                  <!-- 选中后的侧边高亮条 -->
                  <div class="absolute left-0 top-0 bottom-0 w-1 transition-colors duration-300"
                       :class="{
                         'bg-gray-200': formData.asthenopia[item.key].freq === 0,
                         'bg-emerald-400': formData.asthenopia[item.key].freq === 1,
                         'bg-amber-400': formData.asthenopia[item.key].freq === 2,
                         'bg-rose-500': formData.asthenopia[item.key].freq === 3
                       }"></div>

                  <div class="pl-3">
                    <div class="font-medium text-slate-700 mb-3 text-sm">{{ item.label }}</div>
                    <div class="flex flex-wrap items-center gap-x-8 gap-y-3">
                      <!-- 频度 -->
                      <div class="flex-1 min-w-[300px]">
                        <div class="flex gap-2">
                          <div v-for="opt in freqOptions" :key="opt.val"
                               @click="formData.asthenopia[item.key].freq = opt.val; if(opt.val===0) formData.asthenopia[item.key].sev=0"
                               class="flex-1 cursor-pointer rounded border px-0 py-2 text-center transition-all duration-200 relative group"
                               :class="formData.asthenopia[item.key].freq === opt.val ? opt.activeClass + ' shadow-md scale-105 font-bold border-transparent' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'">
                            <div class="text-xs">{{ opt.label }}</div>
                          </div>
                        </div>
                      </div>

                      <!-- 程度 -->
                      <transition name="el-zoom-in-left">
                        <div v-if="formData.asthenopia[item.key].freq > 0" class="w-[240px] flex items-center gap-3 border-l border-gray-200 pl-4 animate-in">
                          <span class="text-xs text-gray-400 shrink-0">程度</span>
                          <div class="flex gap-2 w-full">
                            <div v-for="sOpt in sevOptions" :key="sOpt.val"
                                 @click="formData.asthenopia[item.key].sev = sOpt.val"
                                 class="flex-1 cursor-pointer rounded border px-0 py-1.5 text-center text-xs transition-all"
                                 :class="formData.asthenopia[item.key].sev === sOpt.val ? sOpt.activeClass + ' font-bold shadow-sm ring-1' : 'bg-white text-gray-400 border-gray-200 hover:bg-gray-50'">
                              {{ sOpt.label }}
                            </div>
                          </div>
                        </div>
                      </transition>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 5: Clinical (AI Theme) -->
        <div v-show="activeStep === 4" class="animate-fade">
          <div class="section-header"><span class="bar"></span><h3>临床体征与影像上传</h3></div>
          <div class="grid grid-cols-2 gap-8 mb-8">
            <div class="bg-slate-50 dark:bg-slate-800 p-5 rounded-lg border border-slate-200">
               <h4 class="font-bold mb-4 text-slate-700 flex items-center gap-2"><el-icon><View/></el-icon> 眼科专科检查</h4>
               <table class="w-full text-sm text-left">
                 <thead><tr class="text-gray-500 border-b"><th class="pb-2 font-normal">检查项目</th><th>OD (右眼)</th><th>OS (左眼)</th></tr></thead>
                 <tbody>
                   <tr><td class="py-3">视力 (LogMAR)</td><td><el-input-number v-model="formData.clinical.vod" :step="0.1" size="small" controls-position="right"/></td><td><el-input-number v-model="formData.clinical.vos" :step="0.1" size="small" controls-position="right"/></td></tr>
                   <tr><td class="py-3">BUT (s)</td><td><el-input-number v-model="formData.clinical.butOD" size="small" controls-position="right"/></td><td><el-input-number v-model="formData.clinical.butOS" size="small" controls-position="right"/></td></tr>
                   <tr><td class="py-3">Schirmer (mm)</td><td><el-input-number v-model="formData.clinical.schirmerOD" size="small" controls-position="right"/></td><td><el-input-number v-model="formData.clinical.schirmerOS" size="small" controls-position="right"/></td></tr>
                 </tbody>
               </table>
            </div>
             <!-- AI 上传区 -->
             <div class="upload-section relative overflow-hidden border-2 border-dashed border-teal-300/50 rounded-xl bg-slate-900 text-center flex flex-col justify-center items-center group cursor-pointer transition-all hover:border-teal-400 hover:shadow-lg hover:shadow-teal-900/20">
                <!-- 扫描线动画 -->
                <div class="scan-line"></div>

                <div class="relative z-10 p-8">
                  <div class="w-16 h-16 rounded-full bg-teal-500/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <el-icon class="text-3xl text-teal-400"><UploadFilled /></el-icon>
                  </div>
                  <h3 class="font-bold text-white text-lg tracking-wide">上传多模态影像数据</h3>
                  <p class="text-xs text-slate-400 mb-6 mt-2">支持眼表 / 睑板腺 / 泪河影像 (DICOM/JPG)<br/>系统将自动调用 <span class="text-teal-400 font-mono">KAN+UNET</span> 进行分割</p>
                  <el-upload action="#" :auto-upload="false" multiple :show-file-list="false">
                     <el-button type="primary" round class="px-8 bg-teal-600 border-none hover:bg-teal-500">选择文件</el-button>
                  </el-upload>
                </div>
                <!-- 背景网格 -->
                <div class="absolute inset-0 opacity-10" style="background-image: radial-gradient(#14b8a6 1px, transparent 1px); background-size: 20px 20px;"></div>
             </div>
          </div>
        </div>
      </el-form>
    </el-card>

    <div class="footer-actions">
      <el-button v-if="activeStep > 0" @click="prevStep" :icon="ArrowLeft" size="large" round>上一步</el-button>
      <div class="flex-1"></div>
      <el-button v-if="activeStep < 4" type="primary" @click="nextStep" size="large" round>下一步 <el-icon class="el-icon--right"><ArrowRight /></el-icon></el-button>
      <el-button v-if="activeStep === 4" type="success" @click="handleSubmit" size="large" round class="px-8 font-bold shadow-lg shadow-teal-500/30">提交并开始 AI 诊断 <el-icon class="ml-2"><Check /></el-icon></el-button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.wizard-container { max-width: 1100px; margin: 0 auto; padding-bottom: 100px; }
.steps-wrapper { margin-bottom: 30px; padding: 25px 40px; background: var(--el-bg-color); border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.03); }
.form-card { min-height: 600px; border-radius: 16px; border: none; box-shadow: 0 4px 20px rgba(0,0,0,0.02);
  .section-header { display: flex; align-items: center; margin-bottom: 25px;
    .bar { width: 4px; height: 24px; background: #14b8a6; border-radius: 2px; margin-right: 12px; box-shadow: 0 2px 4px rgba(20, 184, 166, 0.3); }
    h3 { font-size: 20px; font-weight: 700; margin: 0; color: #1e293b; letter-spacing: -0.5px; }
  }
}
.footer-actions {
  position: fixed; bottom: 0; right: 0; left: var(--v3-sidebar-width);
  background: rgba(255,255,255,0.9); backdrop-filter: blur(10px);
  padding: 15px 40px; box-shadow: 0 -4px 20px rgba(0,0,0,0.05); display: flex; z-index: 99; transition: left 0.3s;
  border-top: 1px solid rgba(0,0,0,0.05);
}
.animate-fade { animation: fadeIn 0.4s cubic-bezier(0.2, 0.8, 0.2, 1); }
.animate-in { animation: slideInRight 0.3s ease-out; }

@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
@keyframes slideInRight { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }

/* 扫描线动画 */
.scan-line {
  position: absolute; top: 0; left: 0; width: 100%; height: 2px;
  background: linear-gradient(to right, transparent, #14b8a6, transparent);
  box-shadow: 0 0 10px #14b8a6;
  animation: scan 3s infinite linear;
  opacity: 0.5;
}
@keyframes scan { 0% { top: 0; } 100% { top: 100%; } }

:deep(.el-step__title.is-process) { font-weight: 700; color: #14b8a6 !important; }
:deep(.el-step__head.is-process) { color: #14b8a6; border-color: #14b8a6; }
:deep(.el-step__head.is-success) { color: #14b8a6; border-color: #14b8a6; }
</style>
