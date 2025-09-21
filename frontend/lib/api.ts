import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { ApiResponse, ApiError } from '@/types/api'
import { AuthResponse, ProfileResponse } from '@/types/auth'

class ApiService {
  private api: AxiosInstance
  private authToken: string | null = null

  constructor() {
    this.api = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        if (this.authToken) {
          config.headers.Authorization = `Bearer ${this.authToken}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor
    this.api.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized access
          this.clearAuthToken()
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token')
            window.location.href = '/'
          }
        }
        
        const apiError: ApiError = {
          message: error.response?.data?.message || 'An unexpected error occurred',
          statusCode: error.response?.status || 500,
          errors: error.response?.data?.errors || {},
        }
        
        return Promise.reject(apiError)
      }
    )
  }

  setAuthToken(token: string) {
    this.authToken = token
  }

  clearAuthToken() {
    this.authToken = null
  }

  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.api.get(url, config)
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.api.post(url, data, config)
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.api.put(url, data, config)
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.api.delete(url, config)
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.api.patch(url, data, config)
  }

  // File upload helper
  async uploadFile<T = any>(url: string, file: File, progressCallback?: (progress: number) => void): Promise<AxiosResponse<ApiResponse<T>>> {
    const formData = new FormData()
    formData.append('file', file)

    return this.api.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressCallback && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          progressCallback(progress)
        }
      },
    })
  }

  // Specific API methods
  
  // Auth endpoints
  async login(email: string, password: string): Promise<AxiosResponse<AuthResponse>> {
    return this.api.post('/auth/login', { email, password })
  }

  async register(userData: any): Promise<AxiosResponse<AuthResponse>> {
    return this.api.post('/auth/register', userData)
  }

  async getProfile(): Promise<AxiosResponse<ProfileResponse>> {
    return this.api.get('/auth/me')
  }

  async updateProfile(userData: any): Promise<AxiosResponse<ProfileResponse>> {
    return this.api.put('/auth/profile', userData)
  }

  // User management
  async getUsers(params?: any) {
    return this.get('/users', { params })
  }

  async createUser(userData: any) {
    return this.post('/users', userData)
  }

  async updateUser(id: string, userData: any) {
    return this.put(`/users/${id}`, userData)
  }

  async deleteUser(id: string) {
    return this.delete(`/users/${id}`)
  }

  // Drone management
  async getDrones(params?: any) {
    return this.get('/drones', { params })
  }

  async getDrone(id: string) {
    return this.get(`/drones/${id}`)
  }

  async createDrone(droneData: any) {
    return this.post('/drones', droneData)
  }

  async updateDrone(id: string, droneData: any) {
    return this.put(`/drones/${id}`, droneData)
  }

  async deleteDrone(id: string) {
    return this.delete(`/drones/${id}`)
  }

  async getDroneStats() {
    return this.get('/drones/stats')
  }

  // Mission management
  async getMissions(params?: any) {
    return this.get('/missions', { params })
  }

  async getMission(id: string) {
    return this.get(`/missions/${id}`)
  }

  async createMission(missionData: any) {
    return this.post('/missions', missionData)
  }

  async updateMission(id: string, missionData: any) {
    return this.put(`/missions/${id}`, missionData)
  }

  async deleteMission(id: string) {
    return this.delete(`/missions/${id}`)
  }

  async startMission(id: string) {
    return this.post(`/missions/${id}/start`)
  }

  async pauseMission(id: string) {
    return this.post(`/missions/${id}/pause`)
  }

  async stopMission(id: string) {
    return this.post(`/missions/${id}/stop`)
  }

  async getMissionStats() {
    return this.get('/missions/stats')
  }

  // Reports
  async getReports(params?: any) {
    return this.get('/reports', { params })
  }

  async getReport(id: string) {
    return this.get(`/reports/${id}`)
  }

  async generateReport(reportData: any) {
    return this.post('/reports', reportData)
  }

  // Dashboard
  async getDashboardData() {
    return this.get('/dashboard')
  }

  // Analytics
  async getAnalytics(timeRange?: string) {
    return this.get('/analytics', { params: { timeRange } })
  }

  async getFlightHours(timeRange?: string) {
    return this.get('/analytics/flight-hours', { params: { timeRange } })
  }

  async getMissionTypeStats(timeRange?: string) {
    return this.get('/analytics/mission-types', { params: { timeRange } })
  }

  async getDroneUtilization(timeRange?: string) {
    return this.get('/analytics/drone-utilization', { params: { timeRange } })
  }

  async getBatteryStats(timeRange?: string) {
    return this.get('/analytics/battery-stats', { params: { timeRange } })
  }
}

const apiService = new ApiService()
export default apiService