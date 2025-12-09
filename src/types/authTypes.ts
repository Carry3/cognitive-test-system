// 用户角色枚举
export type UserRole = 'USER' | 'ADMIN'

// 完整用户信息
export interface User {
    id: number
    username: string
    email: string
    role: UserRole
    createdAt: string
    lastLoginAt?: string
    isActive: boolean
    emailVerified: boolean
}

// 登录请求
export interface LoginRequest {
    usernameOrEmail: string
    password: string
}

// 登录响应
export interface LoginResponse {
    token: string
    type: string
    id: number
    username: string
    email: string
    role: UserRole
}

// 注册请求
export interface RegisterRequest {
    username: string
    email: string
    password: string
}

// 注册响应
export interface RegisterResponse {
    message: string
}

// API错误响应
export interface ApiErrorResponse {
    message: string
}

// 修改密码请求
export interface ChangePasswordRequest {
    oldPassword: string
    newPassword: string
    confirmPassword: string
}

// 重置密码请求
export interface ResetPasswordRequest {
    token: string
    newPassword: string
    confirmPassword: string
}

// 忘记密码请求
export interface ForgotPasswordRequest {
    email: string
}

// 重新发送验证邮件请求
export interface ResendVerificationRequest {
    email: string
}
