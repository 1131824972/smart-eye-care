import { type RouteRecordRaw, createRouter } from "vue-router"
import { flatMultiLevelRoutes } from "./helper"
import { routerConfig } from "./config"
import { registerNavigationGuard } from "./guard" // 引入刚才写的守卫

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
          title: "首页",
          svgIcon: "dashboard",
          affix: true
        }
      }
    ]
  },
  // === 你的业务菜单 ===
  {
    path: "/patient",
    component: Layout,
    redirect: "/patient/index",
    meta: {
      title: "患者信息管理",
      svgIcon: "search"
    },
    children: [
      {
        path: "index",
        component: () => import("@/pages/patient/index.vue"),
        name: "PatientManagement",
        meta: { title: "患者信息录入" }
      }
    ]
  },
  {
    path: "/diagnosis",
    component: Layout,
    redirect: "/diagnosis/index",
    meta: {
      title: "AI 辅助诊断",
      svgIcon: "dashboard"
    },
    children: [
      {
        path: "index",
        component: () => import("@/pages/diagnosis/index.vue"),
        name: "AIDiagnosis",
        meta: { title: "智能诊断工作台" }
      }
    ]
  },
  {
    path: "/history",
    component: Layout,
    redirect: "/history/index",
    meta: {
      title: "病历档案管理",
      svgIcon: "search"
    },
    children: [
      {
        path: "index",
        component: () => import("@/pages/history/index.vue"),
        name: "HistoryRecord",
        meta: { title: "历史病例查询" }
      }
    ]
  }
]

export const dynamicRoutes: RouteRecordRaw[] = []

/** 创建路由实例 (注意这里用了 export const，解决了 main.ts 的报错) */
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
  }
  catch {
    window.location.reload()
  }
}

// 注册路由守卫 (这一步至关重要，否则登录后跳不转)
registerNavigationGuard(router)
