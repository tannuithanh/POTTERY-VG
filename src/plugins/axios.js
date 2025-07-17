import axios from 'axios'
import { apiUrl } from '@/utils/env' // 👈 dùng biến môi trường đã tách sẵn

const api = axios.create({
  baseURL: apiUrl,
  timeout: 10000
})

// 🧱 Gắn token từ localStorage
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

export default api
