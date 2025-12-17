<script lang="ts" setup>
import PatientInput from "./components/PatientInput.vue"
</script>

<template>
  <div class="patient-page">
    <div class="header-banner">
      <div class="content">
        <h1>Smart Eye Care <span class="badge">V3.0</span></h1>
        <p>多模态干眼症辅助诊断与个性化诊疗系统 | 基于 KAN+UNET 深度学习与知识图谱技术</p>
      </div>
    </div>

    <div class="main-body">
      <PatientInput />
    </div>
  </div>
</template>

<style scoped>
.patient-page {
  background-color: var(--el-bg-color-page);
  min-height: 100vh;
}

.header-banner {
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
  color: white;
  padding: 40px 20px;
  text-align: center;
  margin-bottom: -40px; /* 让下面的卡片浮上来 */
}

.header-banner h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 10px;
  letter-spacing: 1px;
}

.header-banner .badge {
  font-size: 1rem;
  background: rgba(255,255,255,0.2);
  padding: 2px 8px;
  border-radius: 4px;
  vertical-align: middle;
}

.header-banner p {
  opacity: 0.9;
  font-size: 1.1rem;
}

.main-body {
  padding: 20px;
  position: relative;
  z-index: 10;
}
</style>
