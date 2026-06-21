import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Docker Compose: set VITE_API_TARGET=http://backend:5000
// รันบนเครื่อง (npm run dev) + backend ที่พอร์ต 5000: ค่าเริ่มต้นนี้ใช้ได้
// backend ใน Docker แมปเป็น 5001 บน host: VITE_API_TARGET=http://127.0.0.1:5001
const apiTarget = process.env.VITE_API_TARGET || 'http://127.0.0.1:5000'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: true,
    modulePreload: {
      resolveDependencies: (filename, deps) =>
        deps.filter(
          (dep) =>
            !dep.includes("vendor-lucide") &&
            !dep.includes("vendor-emotion") &&
            !dep.includes("vendor-mui-core") &&
            !dep.includes("vendor-mui-overlays") &&
            !dep.includes("vendor-mui-icons") &&
            !dep.includes("vendor-mui-x") &&
            !dep.includes("vendor-fa-regular")
        ),
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalizedId = id.replace(/\\/g, "/");

          if (!normalizedId.includes("node_modules")) return;
          if (normalizedId.includes("/@emotion/")) return "vendor-emotion";
          if (normalizedId.includes("/@mui/x-data-grid/")) return "vendor-mui-x";
          if (normalizedId.includes("/@mui/icons-material/")) return "vendor-mui-icons";
          if (
            normalizedId.includes("/@mui/material/Modal/") ||
            normalizedId.includes("/@mui/material/Dialog/") ||
            normalizedId.includes("/@mui/material/Popover/") ||
            normalizedId.includes("/@mui/material/Popper/") ||
            normalizedId.includes("/@mui/material/Menu/") ||
            normalizedId.includes("/@mui/material/Tooltip/") ||
            normalizedId.includes("/@mui/material/Snackbar/") ||
            normalizedId.includes("/@mui/material/Drawer/")
          ) {
            return "vendor-mui-overlays";
          }
          if (normalizedId.includes("/@mui/")) return "vendor-mui-core";
          if (normalizedId.includes("/@dnd-kit/")) return "vendor-dnd";
          if (normalizedId.includes("/@fortawesome/free-regular-svg-icons/")) return "vendor-fa-regular";
          if (
            normalizedId.includes("/@fortawesome/react-fontawesome/") ||
            normalizedId.includes("/@fortawesome/fontawesome-svg-core/")
          ) {
            return "vendor-fa-core";
          }
          if (normalizedId.includes("/lucide-react/")) return "vendor-lucide";
          if (normalizedId.includes("/react-icons/")) return "vendor-react-icons";
          if (
            normalizedId.includes("/@headlessui/") ||
            normalizedId.includes("/@heroicons/") ||
            normalizedId.includes("/swiper/") ||
            normalizedId.includes("/embla-carousel")
          ) {
            return "vendor-ui";
          }
          if (normalizedId.includes("/lodash/") || normalizedId.includes("/axios/")) return "vendor-utils";
          if (normalizedId.includes("/react-router-dom/") || normalizedId.includes("/react-router/")) {
            return "vendor-router";
          }
        },
      },
    },
  },
  server:{
    host: true,
    port: 5173,
    watch:{
      usePolling: true
    },
    proxy:{
      "/api":{
        target: apiTarget,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      },
      "/uploads":{
        target: apiTarget,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/uploads/, '/uploads')
      }
    }
  }
})
