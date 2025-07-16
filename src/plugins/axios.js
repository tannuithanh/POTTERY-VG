import axios from 'axios'

// ⚙️ Tạo instance riêng
const api = axios.create({
  baseURL: 'http://localhost:8000/api', // bạn sửa theo env
  timeout: 10000
})

// 🧱 Gắn interceptor nếu cần (ví dụ gắn token từ localStorage)
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
