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

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      const { useAuthStore } = await import('@/stores/auth')
      const auth = useAuthStore()

      // Gọi logout để xóa token trong store và redirect
      await auth.logout(false)

      notification.error({
        message: 'Phiên đăng nhập đã hết hạn',
        description: 'Vui lòng đăng nhập lại để tiếp tục.'
      })
    }

    return Promise.reject(error)
  }
)


export default api
