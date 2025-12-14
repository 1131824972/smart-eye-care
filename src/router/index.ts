import { type RouteRecordRaw, createRouter } from "vue-router"
import { flatMultiLevelRoutes } from "./helper"
import { routerConfig } from "./config"
import { registerNavigationGuard } from "./guard"

const Layout = () => import("@/layouts/index.vue")

/** 常驻路由 (所有用户可见) */
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
          svgIcon: "dashboard",
          affix: true
        }
      }
    ]
  },
  // === 核心业务菜单 ===
  {
    path: "/patient",
    component: Layout,
    redirect: "/patient/index",
    // 添加 alwaysShow: true 确保即使只有一个子路由也能作为父级显示（可选）
    meta: {
      title: "信息采集",
      svgIcon: "search", // 确保你在 icons 目录有这个svg，或者换成 elIcon: 'Edit'
      elIcon: "Edit"
    },
    children: [
      {
        path: "index",
        component: () => import("@/pages/patient/index.vue"),
        name: "PatientCollect",
        meta: { title: "患者录入" }
      }
    ]
  },
  {
    path: "/diagnosis",
    component: Layout,
    redirect: "/diagnosis/index",
    meta: {
      title: "辅助诊断",
      svgIcon: "dashboard",
      elIcon: "Monitor"
    },
    children: [
      {
        path: "index",
        component: () => import("@/pages/diagnosis/index.vue"),
        name: "DiagnosisWorkplace",
        meta: { title: "AI 诊断台" }
      }
    ]
  },
  {
    path: "/history",
    component: Layout,
    redirect: "/history/index",
    meta: {
      title: "病历档案",
      elIcon: "Document"
    },
    children: [
      {
        path: "index",
        component: () => import("@/pages/history/index.vue"),
        name: "HistoryArchive",
        meta: { title: "档案查询" }
      }
    ]
  }
]

export const dynamicRoutes: RouteRecordRaw[] = []

export const router = createRouter({
  history: routerConfig.history,
  routes: routerConfig.thirdLevelRouteCache ? flatMultiLevelRoutes(constantRoutes) : constantRoutes
})

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
