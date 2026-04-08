import { defineStore, setActivePinia } from "pinia"
import { ref } from "vue"
import { pinia } from "@/pinia"
import { setToken as _setToken, getToken, removeToken } from "@@/utils/cache/cookies"
import { resetRouter } from "@/router"

export const useUserStore = defineStore("user", () => {
  const token = ref<string>(getToken() || "")
  const roles = ref<string[]>([])
  const username = ref<string>("")

  // 设置 Token
  const setToken = (value: string) => {
    _setToken(value)
    token.value = value
  }

  // 1. 模拟登录 (不调 API)
  const login = async ({ username, password, code }: any) => {
    await new Promise(resolve => setTimeout(resolve, 500))
    const mockToken = "mock-token-admin-123456"
    setToken(mockToken)
    console.log("✅ 模拟登录成功，Token 已保存")
  }

  // 2. 模拟获取用户信息 (不调 API)
  const getInfo = async () => {
    await new Promise(resolve => setTimeout(resolve, 200))
    username.value = "Admin"
    roles.value = ["admin"]
    return { username: "Admin", roles: ["admin"] }
  }

  // 登出
  const logout = () => {
    removeToken()
    token.value = ""
    roles.value = []
    resetRouter()
    location.reload()
  }

  // 重置 Token
  const resetToken = () => {
    removeToken()
    token.value = ""
    roles.value = []
  }

  return { token, roles, username, setToken, getInfo, login, logout, resetToken }
})

/**
 * 在组件外使用 Store (例如在路由守卫中)
 * 必须先 setActivePinia，否则会报 "getActivePinia()" 错误
 */
export function useUserStoreOutside() {
  setActivePinia(pinia) // <--- 关键修复：手动激活 Pinia
  return useUserStore(pinia)
}
