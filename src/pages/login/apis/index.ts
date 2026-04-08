import request from '@/http/axios';
import type { LoginData } from './type';

/**
 * 用户登录接口
 * FastAPI 端点: POST /api/v1/login/access-token
 * 注意: 后端依赖 OAuth2PasswordRequestForm，需发送 x-www-form-urlencoded 格式
 */
export function loginApi(data: LoginData) {
  // 使用 URLSearchParams 将 JSON 转换为表单格式
  const formData = new URLSearchParams();
  formData.append('username', data.username);
  formData.append('password', data.password);

  return request({
    url: '/login/access-token',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
}

/**
 * 获取当前登录用户信息
 * FastAPI 端点: GET /api/v1/users/me
 * 注意：只有成功获取 token 并将其设置在请求头之后，此接口才会调用成功
 */
export function getUserInfoApi() {
  return request({
    url: '/users/me', // 这里需要根据你后端获取当前用户的实际路径调整，根据常规 FastAPI 结构通常是 /users/me
    method: 'get'
  });
}
