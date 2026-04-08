/* eslint-disable perfectionist/sort-imports */

// core
import { createApp } from "vue"
import { pinia } from "@/pinia"
import { router } from "@/router"
import { installPlugins } from "@/plugins"
import App from "@/App.vue"

// css
import "normalize.css"
import "nprogress/nprogress.css"
import "element-plus/theme-chalk/dark/css-vars.css"
import "vxe-table/lib/style.css"
import "@@/assets/styles/index.scss"
import "virtual:uno.css"

// 创建应用实例
const app = createApp(App)

// 1. 最先安装 Pinia (确保 Store 可以被其他插件使用)
app.use(pinia)

// 2. 安装 Router
app.use(router)

// 3. 安装其他插件（全局组件、自定义指令等）
installPlugins(app)

// router 准备就绪后挂载应用
router.isReady().then(() => {
  app.mount("#app")
})
