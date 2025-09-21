export interface ApiResponse<T = any> {
  success: boolean
  data: T
  message: string
  pagination?: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface ApiError {
  message: string
  statusCode: number
  errors?: Record<string, string>
}

export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  search?: string
}

export interface FilterParams {
  status?: string
  type?: string
  priority?: string
  startDate?: string
  endDate?: string
  [key: string]: any
}