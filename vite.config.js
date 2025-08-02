import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  base: '/',
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
});
