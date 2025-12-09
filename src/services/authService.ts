import apiClient from './apiClient'
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  User,
  ChangePasswordRequest,
  ResetPasswordRequest,
  ForgotPasswordRequest,
  ResendVerificationRequest,
} from '../types/authTypes'

interface AuthResponse {
  success: boolean
  user?: {
    id: string
    username: string
    email?: string
    role?: string
  }
  token?: string
  message?: string
}

/**
 * 登录API
 */
export const login = async (
  usernameOrEmail: string,
  password: string,
): Promise<AuthResponse> => {
  try {
    const response = await apiClient.post<LoginResponse>('/api/auth/login', {
      usernameOrEmail,
      password,
    } as LoginRequest)

    const data = response.data

    return {
      success: true,
      user: {
        id: data.id.toString(),
        username: data.username,
        email: data.email,
        role: data.role,
      },
      token: data.token,
    }
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || 'Login failed. Please try again.'
    return {
      success: false,
      message: errorMessage,
    }
  }
}

/**
 * 注册API
 */
export const register = async (
  username: string,
  email: string,
  password: string,
): Promise<AuthResponse> => {
  try {
    const response = await apiClient.post<RegisterResponse>(
      '/api/auth/register',
      {
        username,
        email,
        password,
      } as RegisterRequest
    )

    // 注册成功，但需要验证邮箱，不返回token
    return {
      success: true,
      message: response.data.message,
    }
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || 'Registration failed. Please try again.'
    return {
      success: false,
      message: errorMessage,
    }
  }
}

/**
 * 登出API
 */
export const logout = async (): Promise<void> => {
  // 清理本地存储，服务器端JWT是无状态的，不需要调用API
  // 如果将来有需要，可以在这里调用注销端点
}

/**
 * 验证邮箱
 */
export const verifyEmail = async (
  token: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await apiClient.get<{ message: string }>(
      `/api/auth/verify-email?token=${token}`
    )
    return {
      success: true,
      message: response.data.message,
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || 'Email verification failed.',
    }
  }
}

/**
 * 获取当前用户信息
 */
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const response = await apiClient.get<User>('/api/auth/me')
    return response.data
  } catch (error) {
    return null
  }
}

/**
 * 重新发送验证邮件
 */
export const resendVerificationEmail = async (
  email: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await apiClient.post<{ message: string }>(
      '/api/auth/resend-verification',
      { email } as ResendVerificationRequest
    )
    return {
      success: true,
      message: response.data.message,
    }
  } catch (error: any) {
    return {
      success: false,
      message:
        error.response?.data?.message ||
        'Failed to resend verification email.',
    }
  }
}

/**
 * 忘记密码
 */
export const forgotPassword = async (
  email: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await apiClient.post<{ message: string }>(
      '/api/auth/forgot-password',
      { email } as ForgotPasswordRequest
    )
    return {
      success: true,
      message: response.data.message,
    }
  } catch (error: any) {
    return {
      success: false,
      message:
        error.response?.data?.message ||
        'Failed to send password reset email.',
    }
  }
}

/**
 * 验证重置令牌
 */
export const validateResetToken = async (
  token: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await apiClient.get<{ message: string }>(
      `/api/auth/validate-reset-token?token=${token}`
    )
    return {
      success: true,
      message: response.data.message,
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || 'Token is invalid or expired.',
    }
  }
}

/**
 * 重置密码
 */
export const resetPassword = async (
  token: string,
  newPassword: string,
  confirmPassword: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await apiClient.post<{ message: string }>(
      '/api/auth/reset-password',
      {
        token,
        newPassword,
        confirmPassword,
      } as ResetPasswordRequest
    )
    return {
      success: true,
      message: response.data.message,
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to reset password.',
    }
  }
}

/**
 * 修改密码
 */
export const changePassword = async (
  oldPassword: string,
  newPassword: string,
  confirmPassword: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await apiClient.post<{ message: string }>(
      '/api/auth/change-password',
      {
        oldPassword,
        newPassword,
        confirmPassword,
      } as ChangePasswordRequest
    )
    return {
      success: true,
      message: response.data.message,
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to change password.',
    }
  }
}

/**
 * Verify token (检查token是否有效)
 */
export const verifyToken = async (_token: string): Promise<boolean> => {
  try {
    // 尝试获取当前用户信息来验证token
    const user = await getCurrentUser()
    return user !== null
  } catch {
    return false
  }
}
