<script lang="ts" setup>
import { ref, reactive, nextTick, onMounted } from "vue"
import {
  Plus, Promotion, Microphone, Paperclip,
  ChatDotRound, UserFilled, MoreFilled,
  VideoPlay, Document, DataLine, Sunny, Moon,
  Cpu, ArrowDown, Close
} from "@element-plus/icons-vue"
import { ElMessage } from "element-plus"

// --- 状态定义 ---
const input = ref("")
const loading = ref(false)
const showContext = ref(true) // 是否显示右侧上下文面板
const scrollbarRef = ref()

// 模拟的会话历史
const sessions = ref([
  { id: 1, title: "患者张伟 - 干眼症初诊分析", time: "10:30", active: true },
  { id: 2, title: "关于 MGD 治疗方案的咨询", time: "昨天", active: false },
  { id: 3, title: "OSDI 评分趋势解读", time: "前天", active: false },
])

// 模拟的消息列表
const messages = ref([
  {
    id: 1,
    role: "ai",
    content: "你好，我是 **Smart Eye Care** 智能诊疗助手。我已经读取了患者 **[张伟, 男, 45岁]** 的最新多模态数据。\n\n检测到 **OSDI 评分 45 (重度)**，且睑板腺缺失率较高。请问需要我为您做什么？",
    time: "10:30",
    refs: []
  }
])

// 快捷指令
const suggestions = [
  { icon: Document, text: "生成初步诊断报告" },
  { icon: DataLine, text: "分析 OSDI 评分趋势" },
  { icon: VideoPlay, text: "解读睑板腺影像" },
  { icon: Cpu, text: "推荐治疗方案" }
]

// --- 方法 ---

const scrollToBottom = () => {
  nextTick(() => {
    const wrap = document.querySelector('.chat-scroll .el-scrollbar__wrap')
    if (wrap) wrap.scrollTop = wrap.scrollHeight
  })
}

const handleSend = () => {
  if (!input.value.trim()) return

  // 1. 添加用户消息
  messages.value.push({ id: Date.now(), role: "user", content: input.value, time: "Now", refs: [] })
  const query = input.value
  input.value = ""
  scrollToBottom()

  // 2. 模拟 AI 思考与流式输出
  loading.value = true
  setTimeout(() => {
    loading.value = false
    const responseId = Date.now() + 1
    // 模拟一段较长的医学回复
    const responseText = `根据患者的主诉 "${query}" 以及目前的临床数据，分析如下：

1. **症状关联**：患者报告的异物感与 **BUT (3.2s)** 缩短高度相关，提示泪膜极不稳定。
2. **风险预警**：结合职业（IT从业者）和屏幕使用时间（>8h），**VDT 综合征** 是主要诱因。
3. **治疗建议**：
   - 建议进行 **IPL 强脉冲光** 治疗以疏通睑板腺。
   - 配合 **0.1% 玻璃酸钠** 滴眼液。
   - 建议使用湿房镜改善局部湿度。

我已经为您生成了相应的治疗处方草案，请审核。`

    // 添加 AI 消息占位
    messages.value.push({
      id: responseId,
      role: "ai",
      content: "",
      time: "Now",
      refs: [{ title: "中华眼科学会干眼诊疗指南 (2023)", link: "#" }]
    })

    // 模拟打字机效果
    let i = 0
    const interval = setInterval(() => {
      if (i < responseText.length) {
        messages.value[messages.value.length - 1].content += responseText[i]
        i++
        scrollToBottom()
      } else {
        clearInterval(interval)
      }
    }, 30) // 打字速度
  }, 1500)
}

const handleQuickAction = (text: string) => {
  input.value = text
  handleSend()
}

onMounted(() => {
  scrollToBottom()
})
</script>

<template>
  <div class="ai-chat-layout">
    <!-- 左侧：会话列表 (Sidebar) -->
    <div class="chat-sidebar">
      <div class="sidebar-header">
        <el-button class="new-chat-btn" :icon="Plus">新对话</el-button>
      </div>
      <div class="session-list custom-scrollbar">
        <div class="session-group-title">Today</div>
        <div
          v-for="s in sessions" :key="s.id"
          class="session-item" :class="{ active: s.active }"
        >
          <el-icon class="msg-icon"><ChatDotRound /></el-icon>
          <span class="title">{{ s.title }}</span>
        </div>
      </div>
      <div class="sidebar-footer">
        <div class="user-info">
          <el-avatar :size="32" class="bg-teal-500">Dr</el-avatar>
          <div class="text">
            <div class="name">Dr. Admin</div>
            <div class="status">Online</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 中间：主聊天区域 (Main) -->
    <div class="chat-main">
      <!-- 顶部导航 -->
      <div class="chat-header">
        <div class="model-info">
          <span class="model-name">Medical LLM v4.0</span>
          <span class="model-tag">Enhanced with KAN+UNET</span>
        </div>
        <div class="actions">
          <el-tooltip content="查看患者上下文"><el-button circle text @click="showContext = !showContext"><el-icon><DataLine /></el-icon></el-button></el-tooltip>
          <el-button circle text><el-icon><MoreFilled /></el-icon></el-button>
        </div>
      </div>

      <!-- 消息流 -->
      <div class="chat-container">
        <el-scrollbar ref="scrollbarRef" class="chat-scroll">
          <div class="messages-wrapper">
            <div v-for="msg in messages" :key="msg.id" class="message-row" :class="msg.role">

              <!-- 头像 -->
              <div class="avatar">
                <div v-if="msg.role === 'ai'" class="ai-avatar">
                  <el-icon><Cpu /></el-icon>
                </div>
                <div v-else class="user-avatar">
                  <el-icon><UserFilled /></el-icon>
                </div>
              </div>

              <!-- 内容气泡 -->
              <div class="content-col">
                <div class="sender-name">{{ msg.role === 'ai' ? 'Smart Eye AI' : 'Doctor' }} <span class="time">{{ msg.time }}</span></div>
                <div class="bubble">
                  <!-- 模拟 Markdown 渲染 (此处简单处理换行) -->
                  <div class="text" v-html="msg.content.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')"></div>
                  <span v-if="msg.role === 'ai' && loading && msg.content === ''" class="typing-cursor"></span>
                </div>

                <!-- 引用来源 (仅 AI) -->
                <div v-if="msg.role === 'ai' && msg.refs && msg.refs.length > 0" class="references">
                  <div class="ref-title">参考依据:</div>
                  <div v-for="(ref, idx) in msg.refs" :key="idx" class="ref-item">
                    <span class="idx">{{ idx + 1 }}</span> {{ ref.title }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-scrollbar>

        <!-- 快捷指令浮层 (当没有输入时显示在底部) -->
        <div v-if="messages.length < 2" class="suggestions-overlay">
          <div v-for="(s, i) in suggestions" :key="i" class="chip" @click="handleQuickAction(s.text)">
            <el-icon><component :is="s.icon" /></el-icon> {{ s.text }}
          </div>
        </div>
      </div>

      <!-- 底部输入框 -->
      <div class="input-area">
        <div class="input-wrapper">
          <el-button class="attach-btn" :icon="Paperclip" text circle />
          <textarea
            v-model="input"
            class="chat-input"
            placeholder="输入医学问题或描述患者症状... (Enter 发送)"
            @keydown.enter.prevent="handleSend"
          ></textarea>
          <div class="right-actions">
            <el-button class="mic-btn" :icon="Microphone" text circle />
            <el-button class="send-btn" type="primary" :icon="Promotion" :disabled="!input" @click="handleSend" circle />
          </div>
        </div>
        <div class="disclaimer">AI 生成内容仅供临床参考，请以医生最终诊断为准。</div>
      </div>
    </div>

    <!-- 右侧：上下文面板 (Context) -->
    <transition name="slide-right">
      <div v-if="showContext" class="context-panel">
        <div class="panel-header">
          <span>当前患者上下文</span>
          <el-icon class="close-icon" @click="showContext = false"><Close /></el-icon>
        </div>
        <div class="patient-card">
          <div class="p-header">
            <div class="avatar">张</div>
            <div class="info">
              <div class="name">张伟 <el-tag size="small" type="danger">高风险</el-tag></div>
              <div class="detail">男 / 45岁 / IT工程师</div>
            </div>
          </div>
          <div class="p-metrics">
            <div class="metric">
              <div class="label">OSDI</div>
              <div class="val text-rose-500">45</div>
            </div>
            <div class="metric">
              <div class="label">BUT(OD)</div>
              <div class="val text-amber-500">3.2s</div>
            </div>
            <div class="metric">
              <div class="label">视力</div>
              <div class="val text-teal-500">0.8</div>
            </div>
          </div>
        </div>

        <div class="kg-snippet">
          <div class="title">关联知识图谱路径</div>
          <div class="graph-box">
            <!-- 简单的 CSS 绘制示意图 -->
            <div class="node active">VDT综合征</div>
            <div class="line"></div>
            <div class="node active">瞬目减少</div>
            <div class="line"></div>
            <div class="node warning">泪膜不稳定</div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped lang="scss">
/* 布局容器 */
.ai-chat-layout {
  display: flex;
  height: calc(100vh - 100px); /* 减去顶部导航栏高度 */
  background-color: #0f172a; /* Slate 900 */
  color: #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

/* 左侧侧边栏 */
.chat-sidebar {
  width: 260px;
  background-color: #1e293b; /* Slate 800 */
  border-right: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;

  .sidebar-header { padding: 20px; }
  .new-chat-btn {
    width: 100%;
    background: linear-gradient(90deg, #14b8a6, #0d9488);
    border: none; color: white; justify-content: flex-start;
    &:hover { opacity: 0.9; }
  }

  .session-list {
    flex: 1; overflow-y: auto; padding: 0 10px;
    .session-group-title { font-size: 12px; color: #64748b; margin: 10px 10px 5px; font-weight: bold; }
    .session-item {
      display: flex; align-items: center; padding: 10px 12px; border-radius: 8px;
      cursor: pointer; transition: background 0.2s; color: #cbd5e1;
      margin-bottom: 2px;
      .msg-icon { margin-right: 10px; font-size: 16px; color: #64748b; }
      .title { font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      &:hover { background-color: rgba(255,255,255,0.05); }
      &.active { background-color: rgba(20, 184, 166, 0.15); color: #14b8a6; .msg-icon { color: #14b8a6; } }
    }
  }

  .sidebar-footer {
    padding: 15px; border-top: 1px solid rgba(255, 255, 255, 0.05);
    .user-info {
      display: flex; align-items: center;
      .text { margin-left: 10px; .name { font-size: 14px; font-weight: bold; } .status { font-size: 11px; color: #10b981; } }
    }
  }
}

/* 中间主区域 */
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-image: radial-gradient(at 50% 0%, rgba(20, 184, 166, 0.05) 0px, transparent 50%);
  position: relative;
  min-width: 0; /* 防止 flex 子项溢出 */

  .chat-header {
    height: 60px; padding: 0 20px; display: flex; align-items: center; justify-content: space-between;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    .model-info {
      display: flex; flex-direction: column;
      .model-name { font-weight: bold; font-size: 15px; color: #f1f5f9; }
      .model-tag { font-size: 11px; color: #14b8a6; }
    }
  }

  .chat-container {
    flex: 1; position: relative; overflow: hidden;
    .messages-wrapper { padding: 20px; max-width: 800px; margin: 0 auto; }
  }

  .message-row {
    display: flex; margin-bottom: 25px;
    &.user { flex-direction: row-reverse; }

    .avatar {
      width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      .ai-avatar { width: 100%; height: 100%; background: #14b8a6; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; }
      .user-avatar { width: 100%; height: 100%; background: #3b82f6; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; }
    }

    .content-col {
      max-width: 80%; margin: 0 12px; display: flex; flex-direction: column;
      &.user { align-items: flex-end; }

      .sender-name { font-size: 12px; color: #64748b; margin-bottom: 4px; .time { margin-left: 5px; opacity: 0.7; } }

      .bubble {
        padding: 12px 16px; border-radius: 12px; font-size: 14px; line-height: 1.6; position: relative;
        /* AI 气泡 */
        background: #334155; color: #f1f5f9; border-top-left-radius: 2px;
      }
    }

    /* 用户气泡特定样式 */
    &.user .bubble {
      background: #14b8a6; color: white; border-top-left-radius: 12px; border-top-right-radius: 2px;
    }

    .references {
      margin-top: 8px; font-size: 12px; background: rgba(0,0,0,0.2); padding: 8px; border-radius: 6px;
      .ref-title { color: #94a3b8; margin-bottom: 4px; }
      .ref-item { color: #14b8a6; cursor: pointer; &:hover { text-decoration: underline; } .idx { background: rgba(20, 184, 166, 0.2); padding: 0 4px; border-radius: 3px; margin-right: 4px; font-size: 10px; } }
    }
  }

  .typing-cursor::after { content: '▋'; animation: blink 1s infinite; color: #14b8a6; margin-left: 2px; }
  @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }

  .suggestions-overlay {
    position: absolute; bottom: 20px; left: 0; right: 0; display: flex; justify-content: center; gap: 10px;
    .chip {
      background: rgba(30, 41, 59, 0.8); border: 1px solid rgba(255,255,255,0.1); padding: 8px 16px; border-radius: 20px;
      font-size: 13px; cursor: pointer; display: flex; align-items: center; gap: 6px; color: #cbd5e1;
      backdrop-filter: blur(4px); transition: all 0.2s;
      &:hover { background: rgba(20, 184, 166, 0.2); border-color: #14b8a6; color: white; transform: translateY(-2px); }
    }
  }

  .input-area {
    padding: 20px; max-width: 840px; width: 100%; margin: 0 auto;
    .input-wrapper {
      background: #1e293b; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); padding: 10px; display: flex; align-items: flex-end;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      &:focus-within { border-color: #14b8a6; box-shadow: 0 0 0 2px rgba(20, 184, 166, 0.2); }

      .chat-input {
        flex: 1; background: transparent; border: none; color: white; resize: none; height: 50px; padding: 12px; font-family: inherit; font-size: 14px;
        &:focus { outline: none; }
      }
      .attach-btn, .mic-btn { color: #94a3b8; font-size: 18px; &:hover { color: white; } }
      .send-btn { margin-left: 8px; }
    }
    .disclaimer { text-align: center; font-size: 11px; color: #64748b; margin-top: 8px; }
  }
}

/* 右侧上下文面板 */
.context-panel {
  width: 280px; background: #1e293b; border-left: 1px solid rgba(255,255,255,0.05); padding: 20px;
  display: flex; flex-direction: column; gap: 20px;

  .panel-header { display: flex; justify-content: space-between; align-items: center; font-weight: bold; font-size: 14px; margin-bottom: 10px; .close-icon { cursor: pointer; } }

  .patient-card {
    background: #0f172a; padding: 15px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.05);
    .p-header {
      display: flex; align-items: center; margin-bottom: 15px;
      .avatar { width: 40px; height: 40px; background: #334155; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 12px; }
      .info { .name { font-size: 14px; font-weight: bold; margin-bottom: 2px; } .detail { font-size: 11px; color: #94a3b8; } }
    }
    .p-metrics {
      display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 5px;
      .metric {
        background: rgba(255,255,255,0.03); padding: 8px 5px; border-radius: 6px; text-align: center;
        .label { font-size: 10px; color: #64748b; margin-bottom: 2px; }
        .val { font-size: 14px; font-weight: bold; }
      }
    }
  }

  .kg-snippet {
    .title { font-size: 12px; color: #94a3b8; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 1px; }
    .graph-box {
      display: flex; flex-direction: column; align-items: center; gap: 5px;
      .node { padding: 6px 12px; border-radius: 20px; font-size: 12px; background: #334155; border: 1px solid #475569; width: 100%; text-align: center; }
      .node.active { border-color: #14b8a6; color: #14b8a6; background: rgba(20, 184, 166, 0.1); }
      .node.warning { border-color: #f59e0b; color: #f59e0b; background: rgba(245, 158, 11, 0.1); }
      .line { width: 1px; height: 15px; background: #475569; }
    }
  }
}

.slide-right-enter-active, .slide-right-leave-active { transition: all 0.3s ease; }
.slide-right-enter-from, .slide-right-leave-to { transform: translateX(100%); opacity: 0; }
</style>
