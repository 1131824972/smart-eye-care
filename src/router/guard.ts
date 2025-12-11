import type { Router } from "vue-router"
import { useUserStoreOutside } from "@/pinia/stores/user"
import NProgress from "nprogress"
import "nprogress/nprogress.css"

NProgress.configure({ showSpinner: false })

export function registerNavigationGuard(router: Router) {
  // 全局前置守卫
  router.beforeEach(async (to, _from, next) => {
    NProgress.start()

    const userStore = useUserStoreOutside()

    // 1. 如果去登录页，直接过
    if (to.path === "/login") {
      next()
      return
    }

    // 2. 检查 Token (如果没有 Token，强制去登录页)
    if (!userStore.token) {
      next("/login")
      NProgress.done()
      return
    }

    // 3. 防止用户信息丢失 (如果已登录但没角色信息，假装获取一下)
    if (userStore.roles.length === 0) {
      await userStore.getInfo()
    }

    // 4. 放行
    next()
  })

  // 全局后置钩子
  router.afterEach(() => {
    NProgress.done()
  })
}
