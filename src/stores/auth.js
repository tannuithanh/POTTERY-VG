import { defineStore } from 'pinia'
import api from '@/plugins/axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('access_token') || null,
    user: null
  }),

  actions: {
    // 🟢 Đăng nhập
    async login({ email, password }) {
      const res = await api.post('/login', { email, password })
      this.token = res.data.access_token

      // 🔐 Lưu token
      localStorage.setItem('access_token', this.token)
      api.defaults.headers.common.Authorization = `Bearer ${this.token}`

      // 👤 Lấy user
      const me = await api.get('/me')
      this.user = me.data
    },

    // 🔐 Tải lại thông tin user (nếu đã có token)
    async fetchMe() {
      if (!this.token) return
      api.defaults.headers.common.Authorization = `Bearer ${this.token}`

      try {
        const res = await api.get('/me')
        this.user = res.data
      } catch (err) {
        this.logout() // Token hết hạn hoặc lỗi -> auto logout
      }
    },

    // 🔴 Đăng xuất
    async logout() {
      try {
        await api.post('/logout')
      } catch (_) {}

      this.token = null
      this.user = null
      localStorage.removeItem('access_token')
      delete api.defaults.headers.common.Authorization
    }
  }
})
