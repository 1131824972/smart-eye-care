<script lang="ts" setup>
import { useLayoutMode } from "@@/composables/useLayoutMode"
import { View } from "@element-plus/icons-vue" // 引入一个像眼睛的图标

interface Props {
  collapse?: boolean
}

const { collapse = true } = defineProps<Props>()
const { isLeft, isTop } = useLayoutMode()

const title = "智慧眼科"
</script>

<template>
  <div class="layout-logo-container" :class="{ 'collapse': collapse, 'layout-mode-top': isTop }">
    <transition name="layout-logo-fade">
      <router-link v-if="collapse" key="collapse" to="/">
        <el-icon color="#409eff" size="24" class="logo-icon"><View /></el-icon>
      </router-link>
      <router-link v-else key="expand" to="/" class="expand-link">
        <el-icon color="#409eff" size="24" class="logo-icon"><View /></el-icon>
        <span class="logo-text">{{ title }}</span>
      </router-link>
    </transition>
  </div>
</template>

<style lang="scss" scoped>
.layout-logo-container {
  position: relative;
  width: 100%;
  height: var(--v3-header-height);
  line-height: var(--v3-header-height);
  text-align: center;
  overflow: hidden;
  background-color: transparent;
}

.layout-mode-top {
  height: var(--v3-navigationbar-height);
  line-height: var(--v3-navigationbar-height);
}

.logo-icon {
  vertical-align: middle;
  margin-right: 0;
}

.expand-link {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-decoration: none;
}

.logo-text {
  margin-left: 10px;
  font-size: 18px;
  font-weight: bold;
  color: var(--v3-sidebar-menu-text-color); // 跟随侧边栏文字颜色
  white-space: nowrap;
}

.collapse {
  .logo-text {
    display: none;
  }
}
</style>
