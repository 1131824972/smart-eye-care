<script lang="ts" setup>
import { ref, onMounted, reactive } from "vue"
import KnowledgeGraph from "@/components/KnowledgeGraph.vue"
import AiAssistant from "./components/AiAssistant.vue"
import { ElLoading, ElMessage } from "element-plus"
import {
  CircleCheckFilled, VideoPlay, DataAnalysis, Warning, Cpu,
  Document, Download, Printer
} from "@element-plus/icons-vue"

// 状态控制
const showAiDrawer = ref(false)
const showReportModal = ref(false)
const loading = ref(true)
const loadingText = ref("初始化分析引擎...")

// 模拟数据
const result = reactive({
  diagnosis: "混合型干眼症 (MGD + 泪液缺乏)",
  severity: "中度",
  confidence: 94.2,
  osdiScore: 0,
  patientName: "张三",
  patientId: "P2023001",
  date: new Date().toLocaleDateString()
})

const startAnalysis = () => {
  const steps = [
    "正在加载 KAN 神经网络...",
    "加载 UNET 分割权重...",
    "处理眼底与睑板腺影像...",
    "关联云南地理知识图谱...",
    "生成多模态诊断结论..."
  ]
  let i = 0
  const interval = setInterval(() => {
    loadingText.value = steps[i]
    i++
    if (i >= steps.length) {
      clearInterval(interval)
      setTimeout(() => { loading.value = false }, 800)
    }
  }, 800)
}

const handlePreviewReport = () => {
  const loadingInstance = ElLoading.service({ text: '正在生成详细医学报告...', target: '.console-container' })
  setTimeout(() => {
    loadingInstance.close()
    showReportModal.value = true
  }, 1000)
}

const handleDownload = () => {
  ElMessage.success("PDF 报告下载任务已加入队列")
}

onMounted(() => {
  const data = localStorage.getItem('currentPatientData')
  if (data) {
    const p = JSON.parse(data)
    result.patientName = p.base.name
    result.patientId = p.base.id
    result.osdiScore = p.osdiScore
  }
  startAnalysis()
})
</script>

<template>
  <div class="console-container">

    <!-- Loading Mask -->
    <div v-if="loading" class="loading-mask">
      <div class="loader-content">
        <div class="scan-circle"></div>
        <h2 class="mt-4 text-white font-mono text-xl">{{ loadingText }}</h2>
      </div>
    </div>

    <!-- Dashboard Content -->
    <div v-else class="dashboard animate-in">

      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <div>
           <h1 class="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
             <el-icon class="mr-2 text-primary"><Cpu /></el-icon> AI 智能诊断控制台
           </h1>
           <p class="text-gray-500 mt-1 flex gap-4 text-sm">
             <span>患者: <b>{{ result.patientName }}</b></span>
             <span>ID: {{ result.patientId }}</span>
             <span>OSDI: <b class="text-orange-500">{{ result.osdiScore }}</b></span>
           </p>
        </div>
        <el-button type="primary" size="large" @click="showAiDrawer = true" class="shadow-lg hover:scale-105 transition-transform">
          <el-icon class="mr-2"><VideoPlay /></el-icon> 唤起 AI 医患助手
        </el-button>
      </div>

      <el-row :gutter="20">
        <!-- LEFT: AI Model Analysis (Original vs Mask) -->
        <el-col :span="10">
          <el-card class="mb-5 border-none shadow-md" body-style="padding:0">
            <template #header>
              <div class="flex justify-between items-center">
                <span class="font-bold flex items-center"><el-icon class="mr-2"><DataAnalysis /></el-icon> KAN+UNET 影像分割结果</span>
                <el-tag effect="dark" size="small">Model Output</el-tag>
              </div>
            </template>

            <!-- 图像对比区域 -->
            <div class="comparison-grid p-4 bg-gray-900">
               <div class="grid grid-cols-2 gap-3">
                 <!-- 原图 -->
                 <div class="relative rounded-lg overflow-hidden border border-gray-700 aspect-[4/3] group cursor-zoom-in">
                   <img src="@/common/assets/images/fundus-original.jpg" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                   <div class="absolute bottom-0 left-0 right-0 p-1 bg-black/60 text-center text-xs text-gray-300">原始影像</div>
                 </div>
                 <!-- 分割图 -->
                 <div class="relative rounded-lg overflow-hidden border border-gray-700 aspect-[4/3] group cursor-zoom-in">
                   <img src="@/common/assets/images/fundus-mask.jpg" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                   <div class="absolute inset-0 bg-green-500/20 mix-blend-overlay"></div> <!-- 绿色高亮叠加 -->
                   <div class="absolute bottom-0 left-0 right-0 p-1 bg-black/60 text-center text-xs text-green-400">模型分割</div>
                 </div>
               </div>
            </div>

            <div class="p-4 bg-white dark:bg-gray-800">
              <div class="flex justify-between text-sm mb-2">
                <span>病灶分割 IoU (交并比)</span>
                <span class="font-bold text-green-500">0.892</span>
              </div>
              <el-progress :percentage="89.2" :show-text="false" status="success" class="mb-4"/>

              <div class="flex justify-between text-sm mb-2">
                <span>KAN 分类置信度</span>
                <span class="font-bold text-blue-500">94.2%</span>
              </div>
              <el-progress :percentage="94.2" :show-text="false" />
            </div>
          </el-card>

          <!-- Risk Factors -->
          <el-card class="border-none shadow-md">
            <template #header><span class="font-bold">高风险因子识别</span></template>
            <div class="space-y-3">
              <div class="risk-item bg-red-50 border-red-500">
                <el-icon class="text-red-500"><Warning /></el-icon>
                <div class="ml-3">
                  <div class="font-bold text-gray-700">睑板腺严重缺失</div>
                  <div class="text-xs text-gray-500">AI 测算缺失率: 32.5%</div>
                </div>
              </div>
              <div class="risk-item bg-orange-50 border-orange-500">
                <el-icon class="text-orange-500"><Warning /></el-icon>
                <div class="ml-3">
                  <div class="font-bold text-gray-700">泪膜破裂时间短</div>
                  <div class="text-xs text-gray-500">BUT: 3.2s (正常 > 10s)</div>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>

        <!-- RIGHT: KG & Report -->
        <el-col :span="14">
          <!-- Knowledge Graph (使用 light 主题) -->
          <el-card class="mb-5 border-none shadow-md" body-style="padding:0">
            <template #header>
              <div class="flex justify-between items-center">
                 <span class="font-bold">云南干眼症地理知识图谱</span>
                 <span class="text-xs text-gray-400">Geographical Reasoning</span>
              </div>
            </template>
            <!-- 容器背景改为浅色，调用 theme="light" -->
            <div class="h-[500px] min-h-[500px] bg-slate-50 relative overflow-hidden">
               <KnowledgeGraph theme="light" />
               <div class="absolute top-2 right-2 bg-white/90 p-2 rounded shadow text-xs z-10 border">
                 <b>推理路径:</b> 高海拔 -> 紫外线 -> 炎症 -> 干眼
               </div>
            </div>
          </el-card>

          <!-- Diagnosis Conclusion & Report Button -->
          <el-card class="result-card bg-gradient-to-r from-blue-600 to-indigo-700 text-white border-none shadow-xl">
             <div class="flex flex-col h-full">
               <div class="flex items-start mb-4">
                 <el-icon class="text-4xl mr-3 mt-1"><CircleCheckFilled /></el-icon>
                 <div>
                   <div class="opacity-80 text-xs uppercase tracking-wider">AI Conclusion</div>
                   <h2 class="text-2xl font-bold">{{ result.diagnosis }}</h2>
                 </div>
               </div>

               <p class="text-sm opacity-90 leading-relaxed mb-6 flex-1">
                 建议进行睑板腺物理治疗，配合人工泪液。请结合右侧详细报告中的各项指标进行最终确诊。
               </p>

               <el-button type="success" :icon="Document" @click="handlePreviewReport" class="w-full font-bold">
                 生成并预览详细诊断报告
               </el-button>
             </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- AI Assistant Drawer -->
    <el-drawer v-model="showAiDrawer" title="AI 智能医患助手" size="380px" destroy-on-close>
      <AiAssistant :patient-name="result.patientName" :diagnosis="result.diagnosis" />
    </el-drawer>

    <!-- 详细报告预览模态框 -->
    <el-dialog v-model="showReportModal" title="详细诊断报告预览" width="900px" top="5vh" class="report-modal">
      <div class="report-paper bg-white p-8 text-gray-800" id="print-area">
        <!-- 报告头 -->
        <div class="text-center border-b-2 border-gray-800 pb-4 mb-6">
          <h1 class="text-2xl font-bold">Smart Eye Care 智能干眼症诊断报告单</h1>
          <p class="text-sm text-gray-500 mt-1">AI-Assisted Ocular Surface Analysis Report</p>
        </div>

        <!-- 患者信息 -->
        <div class="grid grid-cols-3 gap-4 mb-6 text-sm">
          <div><b>姓名:</b> {{ result.patientName }}</div>
          <div><b>ID:</b> {{ result.patientId }}</div>
          <div><b>诊断日期:</b> {{ result.date }}</div>
          <div><b>性别:</b> 男</div>
          <div><b>年龄:</b> 25岁</div>
          <div><b>检查科室:</b> 眼表疾病科</div>
        </div>

        <!-- 详细影像展示 (6图布局) -->
        <div class="mb-6">
          <h3 class="font-bold border-l-4 border-blue-600 pl-2 mb-3">I. 多模态影像分析 (Multimodal Imaging)</h3>
          <div class="grid grid-cols-3 gap-4">
             <!-- 1. 睑板腺 -->
             <div class="border rounded p-1">
               <div class="aspect-square bg-black overflow-hidden relative">
                  <img src="@/common/assets/images/meibo.jpg" class="w-full h-full object-contain" />
               </div>
               <div class="text-[10px] text-center mt-1 font-bold">睑板腺红外照</div>
               <div class="text-[10px] text-center text-red-500">缺失率: 32%</div>
             </div>
             <!-- 2. 泪河 -->
             <div class="border rounded p-1">
               <div class="aspect-square bg-black overflow-hidden relative">
                  <img src="@/common/assets/images/tear.jpg" class="w-full h-full object-contain" />
               </div>
               <div class="text-[10px] text-center mt-1 font-bold">泪河高度 (TMH)</div>
               <div class="text-[10px] text-center text-orange-500">高度: 0.18mm</div>
             </div>
             <!-- 3. 角膜 -->
             <div class="border rounded p-1">
               <div class="aspect-square bg-black overflow-hidden relative">
                  <img src="@/common/assets/images/cornea.jpg" class="w-full h-full object-contain" />
               </div>
               <div class="text-[10px] text-center mt-1 font-bold">角膜荧光素染色</div>
               <div class="text-[10px] text-center">点状缺损 (+)</div>
             </div>
             <!-- 4. AI Mask -->
             <div class="border rounded p-1">
               <div class="aspect-square bg-black overflow-hidden relative">
                  <img src="@/common/assets/images/fundus-mask.jpg" class="w-full h-full object-contain" />
               </div>
               <div class="text-[10px] text-center mt-1 font-bold">AI 病灶分割 Mask</div>
               <div class="text-[10px] text-center text-green-600">IoU: 0.89</div>
             </div>
             <!-- 5. 无血管层 (新增) -->
             <div class="border rounded p-1">
               <div class="aspect-square bg-black overflow-hidden relative">
                  <img src="@/common/assets/images/1.jpg" class="w-full h-full object-cover" style="filter: hue-rotate(90deg);" />
               </div>
               <div class="text-[10px] text-center mt-1 font-bold">视网膜无血管层切面</div>
               <div class="text-[10px] text-center text-orange-500">FAZ 区域形态分析</div>
             </div>
             <!-- 6. 新生血管 (新增) -->
             <div class="border rounded p-1">
               <div class="aspect-square bg-black overflow-hidden relative">
                  <img src="@/common/assets/images/2.jpg" class="w-full h-full object-cover" />
               </div>
               <div class="text-[10px] text-center mt-1 font-bold">新生血管异常/出血点</div>
               <div class="text-[10px] text-center text-red-500">检测到微血管异常</div>
             </div>
          </div>
        </div>

        <!-- 数据指标 -->
        <div class="mb-6">
          <h3 class="font-bold border-l-4 border-blue-600 pl-2 mb-3">II. 关键定量指标 (Quantitative Metrics)</h3>
          <table class="w-full text-sm text-left border-collapse border border-gray-200">
            <tr class="bg-gray-100"><th class="p-2 border">检查项目</th><th class="p-2 border">结果</th><th class="p-2 border">参考范围</th><th class="p-2 border">判定</th></tr>
            <tr><td class="p-2 border">OSDI 评分</td><td class="p-2 border font-bold">{{ result.osdiScore }}</td><td class="p-2 border"><12</td><td class="p-2 border text-red-500">异常</td></tr>
            <tr><td class="p-2 border">非侵入式 BUT</td><td class="p-2 border">3.5 秒</td><td class="p-2 border">>10 秒</td><td class="p-2 border text-red-500">异常</td></tr>
            <tr><td class="p-2 border">泪河高度 (TMH)</td><td class="p-2 border">0.18 mm</td><td class="p-2 border">>0.20 mm</td><td class="p-2 border text-orange-500">临界</td></tr>
          </table>
        </div>

        <!-- 结论 -->
        <div class="bg-gray-50 p-4 rounded border border-gray-200">
          <div class="font-bold mb-1">诊断结论:</div>
          <div class="text-lg text-blue-800 font-bold mb-2">{{ result.diagnosis }}</div>
          <div class="text-sm"><b>处理意见:</b> 建议进行睑板腺物理治疗（3个疗程），配合使用不含防腐剂的人工泪液。注意改善用眼环境，增加环境湿度。</div>
        </div>

        <!-- 医师签名 -->
        <div class="mt-8 flex justify-end gap-12 text-sm">
          <div>报告医生: <span class="font-script text-xl">Dr. AI</span></div>
          <div>审核医生: ____________</div>
        </div>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showReportModal = false">关闭</el-button>
          <el-button type="primary" :icon="Download" @click="handleDownload">下载 PDF</el-button>
          <el-button type="success" :icon="Printer">打印报告</el-button>
        </span>
      </template>
    </el-dialog>

  </div>
</template>

<style scoped lang="scss">
.console-container { min-height: calc(100vh - 100px); position: relative; }
.loading-mask { position: absolute; inset: 0; background: #0f172a; z-index: 50; display: flex; align-items: center; justify-content: center; .scan-circle { width: 80px; height: 80px; border: 3px solid rgba(59, 130, 246, 0.3); border-top-color: #3b82f6; border-radius: 50%; animation: spin 1s infinite linear; } }
.risk-item { display: flex; align-items: center; padding: 10px; border-radius: 6px; border-left-width: 4px; }
.animate-in { animation: fadeInUp 0.6s ease-out; }
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

/* 报告样式 */
.report-paper { box-shadow: 0 0 15px rgba(0,0,0,0.1); }
.font-script { font-family: 'Brush Script MT', cursive; }
</style>
