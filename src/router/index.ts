import { type RouteRecordRaw, createRouter } from "vue-router"
import { flatMultiLevelRoutes } from "./helper"
import { routerConfig } from "./config"
import { registerNavigationGuard } from "./guard"

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
  {
    path: "/",
    component: Layout,
    redirect: "/dashboard",
    children: [
      {
        path: "dashboard",
        component: () => import("@/pages/dashboard/index.vue"),
        name: "Dashboard",
        meta: {
          title: "数据大屏",
          // 尝试多种字段以匹配你的侧边栏组件逻辑
          icon: "DataBoard",
          elIcon: "DataBoard",
          svgIcon: "dashboard",
          affix: true
        }
      }
    ]
  },
  // === 核心业务功能路由 ===
  {
    path: "/patient",
    component: Layout,
    redirect: "/patient/index",
    meta: {
      title: "患者采集",
      icon: "Edit",
      elIcon: "Edit",
      svgIcon: "form"
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
  {
    path: "/diagnosis",
    component: Layout,
    redirect: "/diagnosis/index",
    meta: {
      title: "辅助诊断",
      icon: "Monitor",
      elIcon: "Monitor",
      svgIcon: "example"
    },
    children: [
      {
        path: "index",
        component: () => import("@/pages/diagnosis/index.vue"),
        name: "AIDiagnosis",
        meta: {
          title: "AI 诊断台",
          icon: "MagicStick",
          elIcon: "MagicStick"
        }
      }
    ]
  },
  {
    path: "/history",
    component: Layout,
    redirect: "/history/index",
    meta: {
      title: "病历档案",
      icon: "Document",
      elIcon: "Document",
      svgIcon: "documentation"
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
        router.hasRoute(name) && router.removeRoute(name)
      }
    })
  } catch {
    window.location.reload()
  }
}

registerNavigationGuard(router)
