import axios, { type AxiosInstance, type InternalAxiosRequestConfig, type AxiosResponse } from 'axios'

// API基础配置
const API_BASE_URL = 'http://localhost:8080'
const TOKEN_KEY = 'cognitive_token'

// 创建axios实例
const apiClient: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
})

// 请求拦截器 - 自动添加JWT Token
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem(TOKEN_KEY)
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// 响应拦截器 - 统一处理错误
apiClient.interceptors.response.use(
    (response: AxiosResponse) => {
        return response
    },
    (error) => {
        // 处理401未授权错误 - 自动登出
        if (error.response && error.response.status === 401) {
            // 清除本地存储
            localStorage.removeItem(TOKEN_KEY)
            localStorage.removeItem('cognitive_user')

            // 如果不在登录页面，跳转到登录页
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login'
            }
        }

        return Promise.reject(error)
    }
)

export default apiClient
export { API_BASE_URL, TOKEN_KEY }
