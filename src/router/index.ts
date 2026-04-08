import { type RouteRecordRaw, createRouter } from "vue-router"
import { flatMultiLevelRoutes } from "./helper"
import { routerConfig } from "./config"
import { registerNavigationGuard } from "./guard"

/* 1. 保持懒加载，防止 Pinia 报错 */
const Layout = () => import("@/layouts/index.vue")

/** 常驻路由 */
export const constantRoutes: RouteRecordRaw[] = [
  {
    path: "/redirect",
    component: Layout,
    meta: { hidden: true },
    children: [
      {
        path: "/redirect/:path(.*)",
        component: () => import("@/pages/redirect/index.vue")
      }
    ]
  },

  {
    path: "/403",
    component: () => import("@/pages/error/403.vue"),
    meta: { hidden: true }
  },
  {
    path: "/404",
    component: () => import("@/pages/error/404.vue"),
    meta: { hidden: true },
    alias: "/:pathMatch(.*)*"
  },
  {
    path: "/login",
    component: () => import("@/pages/login/index.vue"),
    meta: { hidden: true }
  },

  // --- 1. 医生工作台 (首页) ---
  {
    path: "/",
    component: Layout,
    redirect: "/workbench", // 默认跳到工作台
    children: [
      {
        path: "workbench",
        component: () => import("@/pages/workbench/index.vue"),
        name: "Workbench",
        meta: {
          title: "医生工作台",
          icon: "Monitor",    // 兼容字段
          elIcon: "Monitor",  // Element Plus 图标
          svgIcon: "dashboard", // 你的项目中确实存在 dashboard.svg
          affix: true
        }
      }
    ]
  },

  // --- 2. 核心业务功能路由 ---

  // 患者采集
  {
    path: "/patient",
    component: Layout,
    redirect: "/patient/index",
    meta: {
      title: "患者采集",
      icon: "Edit",
      elIcon: "Edit"
      // 移除不存在的 svgIcon "form" 以解决 TS 报错
    },
    children: [
      {
        path: "index",
        component: () => import("@/pages/patient/index.vue"),
        name: "PatientCollect",
        meta: {
          title: "信息录入",
          icon: "Edit",
          elIcon: "Edit"
        }
      }
    ]
  },

  // 辅助诊断
  {
    path: "/diagnosis",
    component: Layout,
    redirect: "/diagnosis/index",
    meta: {
      title: "辅助诊断",
      icon: "Cpu",
      elIcon: "Cpu"
      // 移除不存在的 svgIcon "example"
    },
    children: [
      {
        path: "index",
        component: () => import("@/pages/diagnosis/index.vue"),
        name: "AIDiagnosis",
        meta: {
          title: "AI 诊断台",
          icon: "Cpu",
          elIcon: "Cpu"
        }
      }
    ]
  },
  {
    path: "/ai-chat",
    component: Layout, // 使用 Layout 包裹，保持左侧菜单栏
    redirect: "/ai-chat/index",
    meta: {
      title: "AI 智能问答",
      elIcon: "ChatDotRound", // 使用 Chat 图标
      alwaysShow: true // 确保在菜单中显示
    },
    children: [
      {
        path: "index",
        component: () => import("@/pages/ai-chat/index.vue"),
        name: "AiChat",
        meta: {
          title: "AI 诊疗副驾驶",
          keepAlive: true // 保持聊天状态
        }
      }
    ]
  },

  // 数据大屏
  {
    path: "/dashboard",
    component: Layout,
    redirect: "/dashboard/index",
    children: [
      {
        path: "index",
        component: () => import("@/pages/dashboard/index.vue"),
        name: "Dashboard",
        meta: {
          title: "数据大屏",
          icon: "DataLine",
          elIcon: "DataLine"
          // 移除不存在的 svgIcon "chart"
        }
      }
    ]
  },

  // 病历档案 (保留你原有的)
  {
    path: "/history",
    component: Layout,
    redirect: "/history/index",
    meta: {
      title: "病历档案",
      icon: "Document",
      elIcon: "Document"
    },
    children: [
      {
        path: "index",
        component: () => import("@/pages/history/index.vue"),
        name: "History",
        meta: {
          title: "历史记录",
          icon: "Collection",
          elIcon: "Collection"
        }
      }
    ]
  }
]

export const dynamicRoutes: RouteRecordRaw[] = []

export const router = createRouter({
  history: routerConfig.history,
  routes: routerConfig.thirdLevelRouteCache ? flatMultiLevelRoutes(constantRoutes) : constantRoutes
})

/** 重置路由 */
export function resetRouter() {
  try {
    router.getRoutes().forEach((route) => {
      const { name, meta } = route
      if (name && meta.roles?.length) {
        router.removeRoute(name)
      }
    })
  } catch {
    window.location.reload()
  }
}

// 关键：注册导航守卫，这是生成侧边栏菜单的核心！
registerNavigationGuard(router)

export default router
