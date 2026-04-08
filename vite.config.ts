import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  // 加载当前运行模式（如 development）对应的环境变量
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src')
      }
    },
    server: {
      host: '0.0.0.0', // 监听所有网卡，允许局域网内其他设备通过 IP 访问
      port: 5173,
      open: true, // 启动后自动打开浏览器
      proxy: {
        // 配置反向代理：当本地请求路径以 VITE_APP_BASE_API (例如 '/api') 开头时触发
        [env.VITE_APP_BASE_API]: {
          // target 指向真实的后端服务地址
          target: env.VITE_APP_TARGET_URL || 'http://localhost:8080',
          changeOrigin: true, // 开启跨域
          // rewrite 路径重写：
          // 如果后端接口本身没有 /api 前缀，则在此处去掉 /api 前缀再发送给后端
          rewrite: (path) => path.replace(new RegExp(`^${env.VITE_APP_BASE_API}`), '')
        }
      }
    }
  };
});
