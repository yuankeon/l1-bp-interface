import axios from 'axios';
import type { AxiosRequestHeaders } from 'axios';

// 从本地缓存读取 API URL，如果没有则使用环境变量
export const API_URL: string = localStorage.getItem('api_url') || import.meta.env.VITE_API_URL;

// 创建axios实例
const api = axios.create({
  baseURL: API_URL,
  timeout: 600000,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 从 localStorage 中获取 Token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`, // 添加 Bearer Token
      } as AxiosRequestHeaders
    }
    return config
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api; 