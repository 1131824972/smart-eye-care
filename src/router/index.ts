import { type RouteRecordRaw, createRouter, createWebHashHistory } from "vue-router"

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

  // --- 1. 医生工作台 (作为系统首页) ---
  {
    path: "/",
    component: Layout,
    redirect: "/workbench",
    children: [
      {
        path: "workbench",
        component: () => import("@/pages/workbench/index.vue"),
        name: "Workbench",
        meta: {
          title: "医生工作台",
          svgIcon: "dashboard", // 使用 svgIcon 或 icon
          affix: true      // 固定在 TagsView
        }
      }
    ]
  },

  // --- 2. 病人信息录入 ---
  {
    path: "/patient",
    component: Layout,
    redirect: "/patient/index",
    children: [
      {
        path: "index",
        component: () => import("@/pages/patient/index.vue"),
        name: "PatientInput",
        meta: {
          title: "信息采集",
          elIcon: "Edit" // 明确指定使用 Element Plus 图标
        }
      }
    ]
  },

  // --- 3. AI 诊断控制台 ---
  {
    path: "/diagnosis",
    component: Layout,
    redirect: "/diagnosis/index",
    children: [
      {
        path: "index",
        component: () => import("@/pages/diagnosis/index.vue"),
        name: "Diagnosis",
        meta: {
          title: "AI 诊断台",
          elIcon: "Cpu" // 明确指定使用 Element Plus 图标
        }
      }
    ]
  },

  // --- 4. 数据大屏 (独立展示) ---
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
          elIcon: "DataLine" // 明确指定使用 Element Plus 图标
        }
      }
    ]
  }
]

/**
 * 动态路由
 * 用来放置有权限 (Roles) 限制的路由
 * 这里暂时为空，因为是演示项目
 */
export const asyncRoutes: RouteRecordRaw[] = []

/** * 导出 dynamicRoutes 别名以解决 "doesn't provide an export named: 'dynamicRoutes'" 报错
 */
export const dynamicRoutes = asyncRoutes

// 修改这里：使用 export const 导出 router 实例，以支持 { router } 这种具名导入
export const router = createRouter({
  history: createWebHashHistory(),
  routes: constantRoutes,
  scrollBehavior: () => ({ left: 0, top: 0 })
})

/** 重置路由 */
export function resetRouter() {
  // 注意：所有动态路由路由必须带有 Name 属性，否则 cannot be removed
  try {
    router.getRoutes().forEach((route) => {
      const { name, meta } = route
      if (name && meta.roles?.length) {
        router.removeRoute(name)
      }
    })
  } catch {
    // 强制刷新浏览器
    window.location.reload()
  }
}

// 同时也保留默认导出，以支持 import router from ... 这种导入
export default router
