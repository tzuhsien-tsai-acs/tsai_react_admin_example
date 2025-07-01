import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  define: {
    // 注入 process.env.NODE_ENV，使其在瀏覽器環境中可用
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    // 如果還有其他 process.env.XXX 被引用，也需要類似注入
    // 'process.env.YOUR_OTHER_VAR': JSON.stringify(process.env.YOUR_OTHER_VAR || 'default_value'),
  },
  optimizeDeps: {
    include: [
      '@mui/material/colors/indigo',
      '@mui/material/colors/pink', // 也把您使用的其他颜色模块加进去
      '@mui/material/colors/red',
    ],
  },
  server: {
    host: true,
  },
  build: {
    sourcemap: mode === "development",
  },
  base: "./",
}));
