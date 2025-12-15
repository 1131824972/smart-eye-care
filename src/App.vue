<script lang="ts" setup>
import { useGreyAndColorWeakness } from "@@/composables/useGreyAndColorWeakness"
import { useTheme } from "@@/composables/useTheme"
import zhCn from "element-plus/es/locale/lang/zh-cn"

const { initTheme } = useTheme()
const { initGreyAndColorWeakness } = useGreyAndColorWeakness()

// 初始化主题
initTheme()

// 初始化灰色模式和色弱模式
initGreyAndColorWeakness()

// --- 已删除：移除所有原有模版的推广弹窗 (usePany) ---
</script>

<template>
  <el-config-provider :locale="zhCn">
    <router-view />
  </el-config-provider>
</template>
