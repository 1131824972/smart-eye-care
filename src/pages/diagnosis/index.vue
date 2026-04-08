<script lang="ts" setup>
import { ref, onMounted, reactive } from "vue"
import KnowledgeGraph from "@/components/KnowledgeGraph.vue"
import { useRouter } from "vue-router"
import { ElLoading, ElMessage } from "element-plus"
import {
  CircleCheckFilled, ChatDotRound, DataAnalysis, Warning,
  Cpu, Document
} from "@element-plus/icons-vue"

const router = useRouter()
const showReportModal = ref(false)
const loading = ref(true)
const loadingText = ref("初始化分析引擎...")

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
  const steps = ["正在加载 KAN 神经网络...", "加载 UNET 分割权重...", "处理眼底与睑板腺影像...", "关联云南地理知识图谱...", "生成多模态诊断结论..."]
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
  const l = ElLoading.service({ text: '正在生成详细医学报告...', target: '.console-container' })
  setTimeout(() => { l.close(); showReportModal.value = true }, 1000)
}

// 新增：跳转到 AI 问答页面
const handleEnterChat = () => {
  router.push('/ai-chat/index')
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
    <div v-if="loading" class="loading-mask">
      <div class="loader-content">
        <div class="scan-circle"></div>
        <h2 class="mt-4 text-white font-mono text-xl">{{ loadingText }}</h2>
      </div>
    </div>

    <div v-else class="dashboard animate-in">
      <div class="flex justify-between items-center mb-6">
        <div>
           <h1 class="text-2xl font-bold text-slate-800 dark:text-white flex items-center">
             <el-icon class="mr-2 text-teal-500"><Cpu /></el-icon> AI 智能诊断控制台
           </h1>
           <p class="text-slate-500 mt-1 flex gap-4 text-sm">
             <span>患者: <b>{{ result.patientName }}</b></span>
             <span>ID: {{ result.patientId }}</span>
             <span>OSDI: <b class="text-rose-500">{{ result.osdiScore }}</b></span>
           </p>
        </div>
        <!-- 修改点：按钮改为跳转 AI 诊疗室 -->
        <el-button type="primary" size="large" @click="handleEnterChat" class="shadow-lg hover:scale-105 transition-transform bg-gradient-to-r from-teal-500 to-emerald-500 border-none">
          <el-icon class="mr-2"><ChatDotRound /></el-icon> 进入 AI 诊疗室 (Co-Pilot)
        </el-button>
      </div>

      <el-row :gutter="20">
        <el-col :span="10">
          <el-card class="mb-5 border-none shadow-md" body-style="padding:0">
            <template #header>
              <div class="flex justify-between items-center">
                <span class="font-bold flex items-center text-slate-700"><el-icon class="mr-2"><DataAnalysis /></el-icon> KAN+UNET 影像分割结果</span>
                <el-tag effect="dark" size="small" type="success">Model Output</el-tag>
              </div>
            </template>
            <div class="comparison-grid p-4 bg-slate-900">
               <div class="grid grid-cols-2 gap-3">
                 <div class="relative rounded-lg overflow-hidden border border-slate-700 aspect-[4/3] group cursor-zoom-in">
                   <img src="@/common/assets/images/fundus-original.jpg" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                   <div class="absolute bottom-0 left-0 right-0 p-1 bg-black/60 text-center text-xs text-gray-300">原始影像</div>
                 </div>
                 <div class="relative rounded-lg overflow-hidden border border-slate-700 aspect-[4/3] group cursor-zoom-in">
                   <img src="@/common/assets/images/fundus-mask.jpg" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                   <div class="absolute inset-0 bg-emerald-500/20 mix-blend-overlay"></div>
                   <div class="absolute bottom-0 left-0 right-0 p-1 bg-black/60 text-center text-xs text-emerald-400">模型分割</div>
                 </div>
               </div>
            </div>
            <div class="p-4 bg-white dark:bg-gray-800">
              <div class="flex justify-between text-sm mb-2"><span>病灶分割 IoU (交并比)</span><span class="font-bold text-emerald-500">0.892</span></div>
              <el-progress :percentage="89.2" :show-text="false" status="success" class="mb-4"/>
              <div class="flex justify-between text-sm mb-2"><span>KAN 分类置信度</span><span class="font-bold text-teal-500">94.2%</span></div>
              <el-progress :percentage="94.2" :show-text="false" />
            </div>
          </el-card>

          <el-card class="border-none shadow-md">
            <template #header><span class="font-bold text-slate-700">高风险因子识别</span></template>
            <div class="space-y-3">
              <div class="risk-item bg-rose-50 border-rose-500">
                <el-icon class="text-rose-500"><Warning /></el-icon>
                <div class="ml-3"><div class="font-bold text-slate-700">睑板腺严重缺失</div><div class="text-xs text-slate-500">AI 测算缺失率: 32.5%</div></div>
              </div>
              <div class="risk-item bg-amber-50 border-amber-500">
                <el-icon class="text-amber-500"><Warning /></el-icon>
                <div class="ml-3"><div class="font-bold text-slate-700">泪膜破裂时间短</div><div class="text-xs text-slate-500">BUT: 3.2s (正常 > 10s)</div></div>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="14">
          <el-card class="mb-5 border-none shadow-md" body-style="padding:0">
            <template #header>
              <div class="flex justify-between items-center"><span class="font-bold text-slate-700">干眼症病理知识图谱</span><span class="text-xs text-gray-400">Pathology Ontology</span></div>
            </template>
            <div class="h-[500px] min-h-[500px] bg-slate-50 relative overflow-hidden">
               <!-- 依然使用我们新改版的图谱 -->
               <KnowledgeGraph theme="light" />
            </div>
          </el-card>

          <el-card class="result-card bg-gradient-to-r from-teal-600 to-cyan-700 text-white border-none shadow-xl">
             <div class="flex flex-col h-full">
               <div class="flex items-start mb-4">
                 <el-icon class="text-4xl mr-3 mt-1"><CircleCheckFilled /></el-icon>
                 <div><div class="opacity-80 text-xs uppercase tracking-wider">AI Conclusion</div><h2 class="text-2xl font-bold">{{ result.diagnosis }}</h2></div>
               </div>
               <p class="text-sm opacity-90 leading-relaxed mb-6 flex-1">建议进行睑板腺物理治疗，配合人工泪液。请结合右侧详细报告中的各项指标进行最终确诊。</p>
               <el-button class="w-full font-bold bg-white text-teal-700 border-none hover:bg-gray-100" :icon="Document" @click="handlePreviewReport">生成并预览详细诊断报告</el-button>
             </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 删除了原有的 Drawer，只保留报告弹窗 -->
    <el-dialog v-model="showReportModal" title="详细诊断报告预览" width="900px" top="5vh">
      <div class="text-center p-10 text-gray-500">报告预览内容... (此处可后续扩展为 PDF 预览)</div>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.console-container { min-height: calc(100vh - 100px); position: relative; }
.loading-mask {
  position: absolute; inset: 0; background: #0f172a; z-index: 50;
  display: flex; align-items: center; justify-content: center;
  .scan-circle {
    width: 80px; height: 80px; border: 3px solid rgba(20, 184, 166, 0.3);
    border-top-color: #14b8a6; border-radius: 50%; animation: spin 1s infinite linear;
  }
}
.risk-item { display: flex; align-items: center; padding: 10px; border-radius: 6px; border-left-width: 4px; }
.animate-in { animation: fadeInUp 0.6s ease-out; }
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
</style>
