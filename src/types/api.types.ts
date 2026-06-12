export interface ApiResponse<T> {
    success: boolean
    message: string
    data: T
    pagination?: Pagination
}

export interface Pagination {
    page: number
    limit: number
    total: number
    totalPages: number
}

export interface ApiError {
    success: false
    message: string
    code?: string
}
