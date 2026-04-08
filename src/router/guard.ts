import type { Router } from "vue-router"
import { usePermissionStoreOutside } from "@/pinia/stores/permission"
import { useUserStoreOutside } from "@/pinia/stores/user"
import NProgress from "nprogress"
import "nprogress/nprogress.css"

NProgress.configure({ showSpinner: false })

export function registerNavigationGuard(router: Router) {
  router.beforeEach(async (to, _from, next) => {
    NProgress.start()

    const userStore = useUserStoreOutside()
    const permissionStore = usePermissionStoreOutside()

    // 1. 白名单直接放行
    if (to.path === "/login") {
      next()
      return
    }

    // 2. 检查 Token
    if (!userStore.token) {
      next("/login")
      NProgress.done()
      return
    }

    // 3. 关键修复：判断是否已经生成过动态路由
    // 如果 permissionStore.routes 长度为 0，说明还没生成过
    if (permissionStore.routes.length === 0) {
      try {
        // 3.1 获取用户信息（包含角色）
        const { roles } = await userStore.getInfo()

        // 3.2 关键步骤：根据角色生成路由表
        permissionStore.setRoutes(roles)

        // 3.3 动态添加路由到 router 实例
        permissionStore.addRoutes.forEach((route) => {
          router.addRoute(route)
        })

        // 3.4 确保路由添加完成后再跳转
        // replace: true 确保导航不会留下历史记录
        next({ ...to, replace: true })
      } catch (error) {
        console.error("路由守卫出错", error)
        userStore.resetToken()
        next("/login")
        NProgress.done()
      }
    } else {
      next()
    }
  })

  router.afterEach(() => {
    NProgress.done()
  })
}
