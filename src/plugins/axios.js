import axios from 'axios'
import { apiUrl } from '@/utils/env'
import router from '@/router'
import { notification } from 'ant-design-vue'

// Tạo instance
const api = axios.create({
  baseURL: apiUrl,
  timeout: 10000
})

// 🧱 Interceptor REQUEST: gắn token nếu có
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

let isLoggingOut = false

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      if (!isLoggingOut) {
        isLoggingOut = true

        const { useAuthStore } = await import('@/stores/auth')
        const auth = useAuthStore()

        // Đảm bảo không gọi API logout nếu không cần
        await auth.logout(false)

        notification.error({
          message: 'Phiên đăng nhập đã hết hạn',
          description: 'Vui lòng đăng nhập lại để tiếp tục.'
        })

        // Tránh spam sau 3s hoặc khi route đã redirect
        setTimeout(() => {
          isLoggingOut = false
        }, 3000)
      }
    }

    return Promise.reject(error)
  }
)


export default api
