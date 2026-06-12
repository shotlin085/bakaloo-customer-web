import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'

interface CustomConfig extends InternalAxiosRequestConfig {
    _retry?: boolean
}

class ApiClient {
    private instance: AxiosInstance
    private isRefreshing = false
    private queue: Array<{
        resolve: (token: string) => void
        reject: (e: unknown) => void
    }> = []

    constructor() {
        this.instance = axios.create({
            baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api/v1`,
            timeout: 15_000,
            headers: { 'Content-Type': 'application/json' },
        })
        this.setupRequestInterceptor()
        this.setupResponseInterceptor()
    }

    private token() {
        return typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
    }

    private setTokens(access: string, refresh: string) {
        localStorage.setItem('accessToken', access)
        localStorage.setItem('refreshToken', refresh)
        document.cookie = `accessToken=${access}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`
    }

    private clearTokens() {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        document.cookie = 'accessToken=; path=/; max-age=0'
    }

    private flushQueue(error: unknown, token?: string) {
        this.queue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)))
        this.queue = []
    }

    private setupRequestInterceptor() {
        this.instance.interceptors.request.use((config) => {
            const t = this.token()
            if (t) config.headers.Authorization = `Bearer ${t}`
            return config
        })
    }

    private setupResponseInterceptor() {
        this.instance.interceptors.response.use(
            (res) => res,
            async (error: AxiosError) => {
                const orig = error.config as CustomConfig
                if (!orig || error.response?.status !== 401 || orig._retry) {
                    return Promise.reject(error)
                }

                if (this.isRefreshing) {
                    return new Promise<string>((resolve, reject) => {
                        this.queue.push({ resolve, reject })
                    }).then((t) => {
                        orig.headers.Authorization = `Bearer ${t}`
                        return this.instance(orig)
                    })
                }

                orig._retry = true
                this.isRefreshing = true

                try {
                    const rt = localStorage.getItem('refreshToken')
                    if (!rt) throw new Error('No refresh token')

                    const { data } = await axios.post(
                        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/refresh-token`,
                        { refreshToken: rt },
                    )

                    const { accessToken, refreshToken } = data.data
                    this.setTokens(accessToken, refreshToken)
                    this.flushQueue(null, accessToken)
                    orig.headers.Authorization = `Bearer ${accessToken}`
                    return this.instance(orig)
                } catch (e) {
                    this.flushQueue(e)
                    this.clearTokens()
                    if (typeof window !== 'undefined') {
                        window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`
                    }
                    return Promise.reject(e)
                } finally {
                    this.isRefreshing = false
                }
            },
        )
    }

    get http() {
        return this.instance
    }
}

export const api = new ApiClient().http
export default api
