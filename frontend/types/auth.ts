export interface User {
  _id: string
  email: string
  firstName: string
  lastName: string
  name?: string
  role: 'admin' | 'pilot'
  avatar?: string
  isActive: boolean
  lastLogin?: Date
  phone?: string
  pilotLicense?: string
  experience?: number
  specializations?: string[]
  createdAt: Date
  updatedAt: Date
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  role: 'admin' | 'pilot'
  phone?: string
  pilotLicense?: string
  experience?: number
  specializations?: string[]
}

export interface AuthResponse {
  success: boolean
  message: string
  token: string
  user: User
}

export interface ProfileResponse {
  success: boolean
  user: User
}

export interface AuthError {
  message: string
  errors?: Record<string, string>
}