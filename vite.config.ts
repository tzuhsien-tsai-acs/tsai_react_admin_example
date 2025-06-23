import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
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
