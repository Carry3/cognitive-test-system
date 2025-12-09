import axios, { type AxiosInstance, type InternalAxiosRequestConfig, type AxiosResponse } from 'axios'

// API basic configuration
const API_BASE_URL = 'http://localhost:8080'
const TOKEN_KEY = 'cognitive_token'

// Create axios instance
const apiClient: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 100000,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Request interceptor - automatically add JWT Token
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

// Response interceptor - handle errors uniformly
apiClient.interceptors.response.use(
    (response: AxiosResponse) => {
        return response
    },
    (error) => {
        // Handle 401 unauthorized error - auto logout
        if (error.response && error.response.status === 401) {
            // Clear local storage
            localStorage.removeItem(TOKEN_KEY)
            localStorage.removeItem('cognitive_user')

            // If not on login page, redirect to login
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login'
            }
        }

        return Promise.reject(error)
    }
)

export default apiClient
export { API_BASE_URL, TOKEN_KEY }
