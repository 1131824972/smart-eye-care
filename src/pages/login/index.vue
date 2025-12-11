<script lang="ts" setup>
import { useUserStore } from "@/pinia/stores/user"
import { Lock, User } from "@element-plus/icons-vue"
import { type FormInstance, type FormRules, ElMessage } from "element-plus"
import { onMounted, reactive, ref } from "vue"
import { useRouter } from "vue-router"
import logoImg from "@/common/assets/images/layouts/logo.png"

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)
const loginFormRef = ref<FormInstance | null>(null)
const loginForm = reactive({ username: "admin", password: "123", code: "" })

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
    ElMessage.error("验证码错误，请重新输入")
    drawCaptcha()
    return
  }
  if (!loginFormRef.value) return

  // 修复：删除了回调中的 return false，解决 TS 报错
  loginFormRef.value.validate((valid) => {
    if (valid) {
  loading.value = true
  const { username, password, code } = loginForm
  if (username !== "admin" && username !== "editor") {
    ElMessage.error("用户名只能是 admin 或 editor")
    loading.value = false
    return
  }
  userStore.login({ username, password, code })
    .then(() => {
      router.push({ path: "/" })
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
        <img :src="logoImg" class="logo-img" alt="logo">
        <h1 class="project-title">干眼症智慧诊疗</h1>
        <p class="project-desc">Multimodal Smart Dry Eye Care System<br>基于 KAN 神经网络与多模态知识图谱</p>
        <div class="glass-card">
          <div class="feature-item">🧬 基因与环境多模态融合</div>
          <div class="feature-item">🗺️ 云南地域性关联分析</div>
          <div class="feature-item">🤖 KAN+UNet 精准分割</div>
        </div>
      </div>
      <div class="bg-decoration" />
    </div>
    <div class="login-right">
      <div class="login-form-box">
        <h2 class="welcome-title">欢迎登录系统 👋</h2>
        <p class="welcome-sub">请使用管理员账号登录</p>
        <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" size="large">
          <el-form-item prop="username">
            <el-input v-model="loginForm.username" placeholder="用户名: admin" :prefix-icon="User" />
          </el-form-item>
          <el-form-item prop="password">
            <el-input v-model="loginForm.password" type="password" placeholder="密码: 123456" :prefix-icon="Lock" show-password @keyup.enter="handleLogin" />
          </el-form-item>
          <el-form-item prop="code">
            <div class="captcha-box">
              <el-input v-model="loginForm.code" placeholder="验证码" style="flex: 1; margin-right: 10px;" @keyup.enter="handleLogin" />
              <img :src="verifyCodeUrl" class="captcha-img" title="点击刷新" @click="drawCaptcha">
            </div>
          </el-form-item>
          <el-button :loading="loading" type="primary" class="login-btn" @click="handleLogin">立即登录</el-button>
        </el-form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-container { display: flex; width: 100%; height: 100vh; overflow: hidden; }
.login-left { flex: 1; background: linear-gradient(135deg, #10284d 0%, #0d47a1 100%); position: relative; display: flex; align-items: center; justify-content: center; color: #fff; }
.left-content { z-index: 2; text-align: center; padding: 40px; }
.logo-img { width: 80px; margin-bottom: 20px; }
.project-title { font-size: 36px; font-weight: bold; margin-bottom: 10px; letter-spacing: 2px; }
.project-desc { font-size: 16px; opacity: 0.8; line-height: 1.6; margin-bottom: 40px; }
.glass-card { background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(10px); padding: 20px; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.2); text-align: left; }
.feature-item { margin: 10px 0; font-size: 14px; display: flex; align-items: center; }
.login-right { width: 500px; background: #fff; display: flex; align-items: center; justify-content: center; }
.login-form-box { width: 360px; padding: 20px; }
.welcome-title { font-size: 28px; color: #333; margin-bottom: 10px; font-weight: bold; }
.welcome-sub { color: #999; margin-bottom: 40px; }
.captcha-box { display: flex; width: 100%; align-items: center; }
.captcha-img { cursor: pointer; border-radius: 4px; height: 40px; border: 1px solid #dcdfe6; }
.login-btn { width: 100%; font-weight: bold; letter-spacing: 1px; }
@media (max-width: 900px) { .login-left { display: none; } .login-right { width: 100%; } }
</style>
