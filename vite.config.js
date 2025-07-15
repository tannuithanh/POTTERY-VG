import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: '172.23.13.102', // <--- IP mong muốn
    port: 5173,             // hoặc port tuỳ ý
    strictPort: true,       // nếu muốn báo lỗi nếu port bị chiếm
  },
})
