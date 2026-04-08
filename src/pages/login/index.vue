<script lang="ts" setup>
import { useUserStore } from "@/pinia/stores/user"
import { Lock, User, Bell, ChatDotRound, Clock } from "@element-plus/icons-vue"
import { type FormInstance, type FormRules, ElMessage } from "element-plus"
import { onMounted, reactive, ref } from "vue"
import { useRouter } from "vue-router"
import logoImg from "@/common/assets/images/layouts/logo.png"

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)
const loginFormRef = ref<FormInstance | null>(null)
const loginForm = reactive({ username: "admin", password: "123", code: "" })

// 资讯列表配色调整：使用 Teal/Green/Amber
const newsList = [
  {
    type: '公告',
    title: '系统维护通知：KAN 模型引擎将于今晚 02:00 进行升级',
    icon: Bell,
    color: '#f59e0b' // Amber
  },
  {
    type: '排班',
    title: '今日专家：张伟主任 (眼表疾病科) 09:00-17:00 坐诊',
    icon: User,
    color: '#14b8a6' // Teal
  },
  {
    type: '知识',
    title: '干眼症小贴士：高海拔地区紫外线强，建议患者户外佩戴护目镜',
    icon: ChatDotRound,
    color: '#10b981' // Emerald
  }
]

const loginRules: FormRules = {
  username: [{ required: true, trigger: "blur", message: "请输入用户名" }],
  password: [{ required: true, trigger: "blur", message: "请输入密码" }],
  code: [{ required: true, trigger: "blur", message: "请输入验证码" }]
}

const verifyCodeUrl = ref("")
const generatedCode = ref("")

function drawCaptcha() {
  const canvas = document.createElement("canvas")
  const width = 120
  const height = 40
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext("2d")
  if (!ctx) return
  ctx.fillStyle = "#f0fdfa" // 浅 Teal 背景
  ctx.fillRect(0, 0, width, height)
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let code = ""
  for (let i = 0; i < 4; i++) {
    const char = chars.charAt(Math.floor(Math.random() * chars.length))
    code += char
    ctx.font = "bold 24px Arial"
    // 随机色改为深色系，确保对比度
    ctx.fillStyle = `#${Math.floor(Math.random() * 0x555555).toString(16)}`
    ctx.save()
    ctx.translate(20 + i * 25, 28)
    ctx.rotate((Math.random() - 0.5) * 0.4)
    ctx.fillText(char, 0, 0)
    ctx.restore()
  }
  generatedCode.value = code
  verifyCodeUrl.value = canvas.toDataURL("image/png")
}

onMounted(() => {
  drawCaptcha()
})

function handleLogin() {
  if (loginForm.code.toUpperCase() !== generatedCode.value) {
    ElMessage.error("验证码错误")
    drawCaptcha()
    return
  }
  loginFormRef.value?.validate((valid) => {
    if (valid) {
      loading.value = true
      userStore.login(loginForm)
        .then(() => {
          router.push("/")
          ElMessage.success("登录成功")
        })
        .catch(() => {
          loading.value = false
          drawCaptcha()
        })
    }
  })
}
</script>

<template>
  <div class="login-container">
    <div class="login-left">
      <div class="left-content">
        <div class="brand">
          <img :src="logoImg" class="logo" alt="logo" />
          <div class="text">
            <h1>多模态干眼症智慧诊疗平台</h1>
            <p>Multimodal Smart Dry Eye Care System</p>
          </div>
        </div>

        <div class="news-panel">
          <div class="panel-header">
            <span><el-icon><Clock /></el-icon> 实时动态</span>
            <el-tag size="small" effect="plain" type="success">Live</el-tag>
          </div>
          <div class="news-list">
            <div v-for="(item, i) in newsList" :key="i" class="news-item">
              <div class="icon-box" :style="{ backgroundColor: item.color + '20', color: item.color }">
                <el-icon><component :is="item.icon" /></el-icon>
              </div>
              <div class="content">
                <span class="tag" :style="{ color: item.color }">{{ item.type }}</span>
                <span class="desc">{{ item.title }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="system-stats">
          <div class="stat-item">
            <h2>128</h2>
            <p>今日诊断</p>
          </div>
          <div class="stat-item">
            <h2>98%</h2>
            <p>模型准确率</p>
          </div>
          <div class="stat-item">
            <h2>16</h2>
            <p>覆盖州市</p>
          </div>
        </div>
      </div>
      <!-- 背景光晕装饰 -->
      <div class="circle c1"></div>
      <div class="circle c2"></div>
    </div>

    <div class="login-right">
      <div class="form-wrapper">
        <div class="form-header">
          <h2>用户登录</h2>
          <p>欢迎回来，请使用医院内网账号登录</p>
        </div>

        <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" size="large">
          <el-form-item prop="username">
            <el-input v-model="loginForm.username" placeholder="请输入账号" :prefix-icon="User" />
          </el-form-item>
          <el-form-item prop="password">
            <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" :prefix-icon="Lock" show-password @keyup.enter="handleLogin" />
          </el-form-item>
          <el-form-item prop="code">
            <div class="code-layout">
              <el-input v-model="loginForm.code" placeholder="验证码" @keyup.enter="handleLogin" />
              <img :src="verifyCodeUrl" @click="drawCaptcha" class="code-img" title="点击刷新" />
            </div>
          </el-form-item>
          <el-button type="primary" :loading="loading" class="submit-btn" @click="handleLogin">
            立即登录
          </el-button>
        </el-form>

        <div class="form-footer">
          <span>忘记密码？请联系信息科</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.login-container {
  display: flex;
  width: 100%;
  height: 100vh;
  background-color: #fff;
  overflow: hidden;
}

.login-left {
  flex: 1;
  /* 核心修改：Slate -> Teal 渐变 */
  background: linear-gradient(135deg, #0f172a 0%, #115e59 100%);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  padding: 40px;

  .left-content {
    position: relative;
    z-index: 10;
    width: 100%;
    max-width: 500px;
  }

  .brand {
    display: flex;
    align-items: center;
    margin-bottom: 50px;
    .logo { width: 60px; height: 60px; margin-right: 20px; }
    h1 { font-size: 28px; margin: 0 0 5px 0; font-weight: 600; }
    p { margin: 0; opacity: 0.8; font-size: 14px; letter-spacing: 1px; color: #ccfbf1; }
  }

  .news-panel {
    background: rgba(15, 23, 42, 0.4); /* 深色玻璃 */
    backdrop-filter: blur(12px);
    border-radius: 16px;
    padding: 25px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    margin-bottom: 40px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.1);

    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      font-size: 14px;
      color: #e2e8f0;
    }

    .news-item {
      display: flex;
      align-items: flex-start;
      margin-bottom: 15px;
      &:last-child { margin-bottom: 0; }

      .icon-box {
        width: 36px; height: 36px; border-radius: 8px;
        display: flex; align-items: center; justify-content: center;
        margin-right: 15px; flex-shrink: 0;
      }

      .content {
        font-size: 13px;
        line-height: 1.5;
        .tag { font-weight: bold; margin-right: 5px; }
        .desc { color: #cbd5e1; }
      }
    }
  }

  .system-stats {
    display: flex;
    justify-content: space-between;
    text-align: center;
    .stat-item {
      h2 { font-size: 32px; margin: 0; font-weight: bold; color: #fff; }
      p { margin: 5px 0 0 0; font-size: 12px; color: #94a3b8; }
    }
  }

  .circle {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.4;
  }
  /* 光晕颜色改为 Teal/Cyan */
  .c1 { width: 300px; height: 300px; background: #14b8a6; top: -50px; left: -50px; }
  .c2 { width: 400px; height: 400px; background: #0ea5e9; bottom: -100px; right: -100px; }
}

.login-right {
  width: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fff;

  .form-wrapper { width: 360px; }
  .form-header {
    margin-bottom: 40px;
    h2 { font-size: 28px; color: #0f172a; margin-bottom: 10px; font-weight: bold; }
    p { color: #64748b; font-size: 14px; }
  }
  .code-layout { display: flex; gap: 12px; width: 100%; .code-img { height: 40px; cursor: pointer; border: 1px solid #dcdfe6; border-radius: 4px; } }
  .submit-btn { width: 100%; height: 44px; font-size: 16px; margin-top: 10px; letter-spacing: 2px; font-weight: bold;}
  .form-footer { text-align: center; margin-top: 20px; font-size: 12px; color: #94a3b8; }
}

@media (max-width: 900px) {
  .login-left { display: none; }
  .login-right { width: 100%; }
}
</style>
