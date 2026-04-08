import axios, { type AxiosInstance, type InternalAxiosRequestConfig, type AxiosResponse } from 'axios';
import { ElMessage } from 'element-plus'; // 你的项目引入了 Element Plus

// 创建 Axios 实例 (饿汉式单例)
const service: AxiosInstance = axios.create({
  // 这里的 baseURL 会读取环境变量中的 VITE_APP_BASE_API
  baseURL: import.meta.env.VITE_APP_BASE_API || '/api',
  // 对于 AI 影像分析或大文件上传，15秒是比较合理的超时时间
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json;charset=utf-8'
  }
});

// 1. 请求拦截器 (Request Interceptor)
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 获取本地存储的 Token，注入到请求头中
    // 注意：如果你的 Token 存在 Pinia 中，也可以改为从 useUserStore() 获取
    const token = localStorage.getItem('token');
    if (token) {
      // Bearer 是一种常见的 Auth 规范，视你后端的要求而定
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error: any) => {
    console.error('请求拦截器报错:', error);
    return Promise.reject(error);
  }
);

// 2. 响应拦截器 (Response Interceptor)
service.interceptors.response.use(
  (response: AxiosResponse) => {
    // 假设后端返回的数据结构规范为: { code: 200, data: {...}, message: "success" }
    const { code, data, message } = response.data;

    // 状态码为 200（或 0，看后端定义）时视为成功，直接剥离并返回 data 核心数据
    if (code === 200 || code === 0) {
      return data;
    } else {
      // 业务逻辑报错，例如账号密码错误，统一在这里弹窗提示
      ElMessage.error(message || '系统内部错误');
      return Promise.reject(new Error(message || '业务异常 Error'));
    }
  },
  (error: any) => {
    // 处理 HTTP 网络层面的错误（如 401, 404, 500）
    let message = error.message;
    if (message === 'Network Error') {
      message = '后端接口连接异常，请检查后端服务是否启动';
    } else if (message.includes('timeout')) {
      message = '系统接口请求超时，请稍后重试';
    } else if (error.response?.status === 401) {
      message = '登录状态已过期，请重新登录';
      // 此处可追加清理 token 和跳转到 /login 的路由逻辑
      localStorage.removeItem('token');
      window.location.href = '/login';
    } else {
      message = '系统接口异常: ' + (error.response?.data?.message || error.response?.statusText);
    }

    ElMessage.error({ message, duration: 5 * 1000 });
    return Promise.reject(error);
  }
);

// 导出单例对象供 API 层调用
export default service;
