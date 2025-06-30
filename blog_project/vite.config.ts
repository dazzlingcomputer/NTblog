import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // 确保资源路径正确
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          editor: ['@uiw/react-md-editor'],
          syntax: ['react-syntax-highlighter']
        }
      }
    },
    // 优化构建
    minify: 'terser',
    sourcemap: false,
    // 确保兼容性
    target: 'es2015'
  },
  // 开发服务器配置
  server: {
    port: 3000,
    host: true
  },
  // 预览服务器配置
  preview: {
    port: 4173,
    host: true
  },
  // 优化依赖预构建
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@uiw/react-md-editor',
      'react-syntax-highlighter',
      'lucide-react'
    ]
  }
})

