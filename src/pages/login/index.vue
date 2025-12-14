<script lang="ts" setup>
import { useUserStore } from "@/pinia/stores/user"
import { Lock, User, ChatDotRound, Timer, Bell } from "@element-plus/icons-vue"
import { type FormInstance, type FormRules, ElMessage } from "element-plus"
import { onMounted, reactive, ref } from "vue"
import { useRouter } from "vue-router"
import logoImg from "@/common/assets/images/layouts/logo.png"

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)
const loginFormRef = ref<FormInstance | null>(null)
const loginForm = reactive({ username: "admin", password: "123", code: "" })

// 模拟资讯数据
const newsList = [
  {
    title: "系统公告：V5.0 模型上线",
    desc: "集成了最新的 KAN 神经网络，对复杂地形下的干眼症预测准确率提升 15%。",
    icon: Bell,
    color: "#E6A23C"
  },
  {
    title: "今日值班专家",
    desc: "眼科主任医师：张伟 (09:00 - 17:00)\n主治医师：李娜 (14:00 - 22:00)",
    icon: User,
    color: "#409EFF"
  },
  {
    title: "医学前沿",
    desc: "《自然》期刊发布最新研究：云南高原强紫外线与泪膜破裂时间的量化关系。",
    icon: ChatDotRound,
    color: "#67C23A"
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
  ctx.fillStyle = "#f0f2f5"
  ctx.fillRect(0, 0, width, height)
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let code = ""
  for (let i = 0; i < 4; i++) {
    const char = chars.charAt(Math.floor(Math.random() * chars.length))
    code += char
    ctx.font = "bold 24px Arial"
    ctx.fillStyle = `#${Math.random().toString(16).slice(2, 8)}`
    const x = 20 + i * 25
    const y = 28
    ctx.save()
    ctx.translate(x, y)
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
  if (!loginFormRef.value) return
  loginFormRef.value.validate((valid) => {
    if (valid) {
      loading.value = true
      userStore.login(loginForm)
        .then(() => {
          router.push({ path: "/" })
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
    <!-- 左侧：功能与资讯展示 -->
    <div class="login-left">
      <div class="glass-content">
        <div class="brand">
          <img :src="logoImg" class="logo" />
          <h1>智慧眼科诊疗系统</h1>
        </div>

        <p class="subtitle">Multimodal Smart Dry Eye Care System</p>

        <!-- 资讯轮播 -->
        <div class="info-carousel">
          <el-carousel height="200px" direction="vertical" :autoplay="true" indicator-position="none">
            <el-carousel-item v-for="(item, index) in newsList" :key="index">
              <div class="info-card">
                <div class="icon-box" :style="{ background: item.color }">
                  <el-icon><component :is="item.icon" /></el-icon>
                </div>
                <div class="info-text">
                  <h3>{{ item.title }}</h3>
                  <p>{{ item.desc }}</p>
                </div>
              </div>
            </el-carousel-item>
          </el-carousel>
        </div>

        <div class="system-status">
          <span><el-icon><Timer /></el-icon> 系统运行正常</span>
          <span>当前在线医生: 12 人</span>
        </div>
      </div>
      <!-- 动态背景装饰 -->
      <div class="bg-circle c1"></div>
      <div class="bg-circle c2"></div>
    </div>

    <!-- 右侧：登录表单 -->
    <div class="login-right">
      <div class="form-wrapper">
        <h2>用户登录</h2>
        <p class="tip">请使用医院内网账号登录</p>
        <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" size="large">
          <el-form-item prop="username">
            <el-input v-model="loginForm.username" placeholder="账号" :prefix-icon="User" />
          </el-form-item>
          <el-form-item prop="password">
            <el-input v-model="loginForm.password" type="password" placeholder="密码" :prefix-icon="Lock" show-password @keyup.enter="handleLogin" />
          </el-form-item>
          <el-form-item prop="code">
            <div class="code-box">
              <el-input v-model="loginForm.code" placeholder="验证码" style="flex:1" @keyup.enter="handleLogin" />
              <img :src="verifyCodeUrl" @click="drawCaptcha" class="code-img" title="刷新验证码" />
            </div>
          </el-form-item>
          <el-button type="primary" :loading="loading" class="submit-btn" @click="handleLogin">登 录</el-button>
        </el-form>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.login-container {
  width: 100%;
  height: 100vh;
  display: flex;
  overflow: hidden;
}

// 左侧样式
.login-left {
  flex: 1.2;
  background: linear-gradient(135deg, #001529 0%, #003a70 100%);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;

  .glass-content {
    position: relative;
    z-index: 10;
    width: 70%;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 20px;
    padding: 40px;
    border: 1px solid rgba(255,255,255,0.2);
    box-shadow: 0 8px 32px rgba(0,0,0,0.3);

    .brand {
      display: flex;
      align-items: center;
      margin-bottom: 10px;
      .logo { width: 48px; margin-right: 15px; }
      h1 { font-size: 28px; margin: 0; font-weight: 600; letter-spacing: 1px; }
    }

    .subtitle {
      font-size: 14px;
      opacity: 0.7;
      margin-bottom: 30px;
      padding-left: 63px;
    }

    .info-carousel {
      .info-card {
        background: rgba(0,0,0,0.2);
        padding: 20px;
        border-radius: 12px;
        display: flex;
        align-items: flex-start;
        height: 100%;
        .icon-box {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          margin-right: 15px;
          flex-shrink: 0;
        }
        .info-text {
          h3 { margin: 0 0 5px 0; font-size: 16px; }
          p { margin: 0; font-size: 13px; line-height: 1.5; opacity: 0.8; }
        }
      }
    }

    .system-status {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid rgba(255,255,255,0.1);
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      opacity: 0.6;
      span { display: flex; align-items: center; gap: 5px; }
    }
  }

  // 装饰圆球
  .bg-circle {
    position: absolute;
    border-radius: 50%;
    filter: blur(60px);
  }
  .c1 { width: 300px; height: 300px; background: #00eaff; opacity: 0.2; top: -50px; left: -50px; }
  .c2 { width: 400px; height: 400px; background: #409eff; opacity: 0.2; bottom: -100px; right: -100px; }
}

// 右侧样式
.login-right {
  flex: 1;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;

  .form-wrapper {
    width: 380px;
    padding: 40px;
    h2 { font-size: 26px; color: #333; margin-bottom: 5px; font-weight: bold; }
    .tip { color: #999; margin-bottom: 30px; font-size: 14px; }

    .code-box {
      display: flex;
      gap: 12px;
      width: 100%;
      .code-img { height: 40px; cursor: pointer; border: 1px solid #dcdfe6; border-radius: 4px; }
    }

    .submit-btn {
      width: 100%;
      height: 44px;
      font-size: 16px;
      margin-top: 10px;
      letter-spacing: 2px;
    }
  }
}

@media (max-width: 900px) {
  .login-left { display: none; }
  .login-right { flex: 1; }
}
</style>
