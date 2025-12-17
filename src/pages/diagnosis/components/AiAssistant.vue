<script lang="ts" setup>
import { ref, nextTick } from 'vue'
import { UserFilled, Service, Promotion } from '@element-plus/icons-vue'

const props = defineProps({
  patientName: { type: String, default: '患者' },
  diagnosis: { type: String, default: '干眼症' }
})

// 初始消息
const messages = ref([
  {
    role: 'ai',
    content: `你好，我是您的专属 AI 医疗助手。系统已完成对 **${props.patientName}** 的多模态诊断，结果提示为 **${props.diagnosis}**。`
  },
  {
    role: 'ai',
    content: '我可以为您提供用药指导、生活方式建议或复诊提醒。请问有什么可以帮您？'
  }
])

const inputContent = ref('')
const isThinking = ref(false)
const chatContainer = ref<HTMLElement | null>(null)

// 模拟知识库回答
const knowledgeBase: Record<string, string> = {
  '药': '根据病情，建议使用 **0.1% 玻璃酸钠滴眼液**，每日4次。若症状严重，睡前可加用 **卡波姆眼用凝胶**。请注意：滴眼药水时瓶口勿接触睫毛，以免污染。',
  '复诊': '建议在 **2周后** 回院复查。届时我们将重新评估 OSDI 评分及泪膜破裂时间 (BUT)，以调整治疗方案。',
  '吃': '饮食上建议多摄入富含 **Omega-3** 的食物（如深海鱼、核桃），以及富含 **维生素A** 的蔬果（胡萝卜、蓝莓）。避免过量食用辛辣刺激性食物。',
  '生活': '建议遵循 **"20-20-20"** 护眼法则：每看屏幕20分钟，向20英尺（约6米）外远眺20秒。同时建议在室内使用加湿器，保持湿度在 40%-60%。',
  'default': '这是一个非常好的问题。基于当前的诊断结果，保持眼表湿润和规律作息是最重要的。您还需要了解具体的治疗方案吗？'
}

const scrollToBottom = () => {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  })
}

const sendMessage = (text?: string) => {
  const msg = text || inputContent.value
  if (!msg.trim()) return

  // 1. 用户发消息
  messages.value.push({ role: 'user', content: msg })
  inputContent.value = ''
  scrollToBottom()
  isThinking.value = true

  // 2. AI 思考模拟
  setTimeout(() => {
    let reply = knowledgeBase['default']
    // 简单关键词匹配
    for (const key in knowledgeBase) {
      if (msg.includes(key)) {
        reply = knowledgeBase[key]
        break
      }
    }

    messages.value.push({ role: 'ai', content: reply })
    isThinking.value = false
    scrollToBottom()
  }, 1200) // 延迟1.2秒模拟生成
}
</script>

<template>
  <div class="chat-wrapper">
    <!-- 消息列表 -->
    <div class="messages" ref="chatContainer">
      <div v-for="(msg, i) in messages" :key="i" class="msg-row" :class="msg.role">
        <el-avatar :icon="msg.role === 'ai' ? Service : UserFilled" :size="36"
          :class="msg.role === 'ai' ? 'ai-avatar' : 'user-avatar'" />
        <div class="bubble">
          <div v-html="msg.content.replace(/\*\*(.*?)\*\*/g, '<span class=\'highlight\'>$1</span>')"></div>
        </div>
      </div>

      <!-- 思考动画 -->
      <div v-if="isThinking" class="msg-row ai">
        <el-avatar :icon="Service" :size="36" class="ai-avatar" />
        <div class="bubble thinking">
          <span></span><span></span><span></span>
        </div>
      </div>
    </div>

    <!-- 底部输入区 -->
    <div class="input-area">
      <!-- 快捷标签 -->
      <div class="tags">
        <el-tag type="info" effect="plain" round @click="sendMessage('药该怎么用？')">💊 用药指导</el-tag>
        <el-tag type="info" effect="plain" round @click="sendMessage('平时饮食注意什么？')">🥦 饮食建议</el-tag>
        <el-tag type="info" effect="plain" round @click="sendMessage('什么时候复诊？')">📅 复诊提醒</el-tag>
      </div>

      <div class="input-box">
        <el-input
          v-model="inputContent"
          placeholder="请输入您的问题..."
          @keyup.enter="sendMessage()"
        >
          <template #suffix>
             <el-button type="primary" link @click="sendMessage()">
               <el-icon class="text-xl"><Promotion /></el-icon>
             </el-button>
          </template>
        </el-input>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.chat-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #f9fafb;

  .messages {
    flex: 1;
    overflow-y: auto;
    padding: 20px;

    .msg-row {
      display: flex;
      margin-bottom: 20px;
      gap: 12px;

      &.user {
        flex-direction: row-reverse;
        .bubble {
          background-color: var(--el-color-primary);
          color: white;
          border-top-right-radius: 2px;
        }
      }

      &.ai {
        .bubble {
          background-color: white;
          color: #333;
          border-top-left-radius: 2px;
          border: 1px solid #eee;
          box-shadow: 0 2px 8px rgba(0,0,0,0.03);
        }
      }

      .bubble {
        padding: 12px 16px;
        border-radius: 12px;
        max-width: 80%;
        font-size: 14px;
        line-height: 1.6;

        :deep(.highlight) {
          font-weight: bold;
          color: #e6a23c; /* AI 回复里的高亮色 */
        }
      }
    }
  }

  .input-area {
    padding: 16px;
    background: white;
    border-top: 1px solid #eee;

    .tags {
      margin-bottom: 12px;
      display: flex;
      gap: 8px;
      overflow-x: auto;

      .el-tag { cursor: pointer; transition: all 0.2s; }
      .el-tag:hover { transform: translateY(-2px); }
    }
  }

  .ai-avatar { background: var(--el-color-primary); }
  .user-avatar { background: var(--el-color-success); }

  /* 思考动画圆点 */
  .thinking {
    display: flex; gap: 4px; padding: 16px !important;
    span {
      width: 6px; height: 6px; background: #ccc; border-radius: 50%;
      animation: bounce 1.4s infinite ease-in-out both;
    }
    span:nth-child(1) { animation-delay: -0.32s; }
    span:nth-child(2) { animation-delay: -0.16s; }
  }
}

@keyframes bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }
</style>
