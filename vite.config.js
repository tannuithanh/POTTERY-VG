import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
        modifyVars: {
          'primary-color': '#c06252',         // ✅ Thay màu chủ đạo
          'link-color': '#c06252',            // ✅ Màu link, hover, selected
          'border-radius-base': '4px',
          // Có thể thêm các biến khác nếu muốn
        },
        
      },
    },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    host: "172.23.13.102", // <--- IP mong muốn
    port: 5173, // hoặc port tuỳ ý
    strictPort: true, // nếu muốn báo lỗi nếu port bị chiếm
  },
});
