import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false
      }
    }
  },
  resolve: {
    alias: {
      'dayjs': 'dayjs',
      '@mui/x-date-pickers': '@mui/x-date-pickers'
    }
  },
  optimizeDeps: {
    include: ['dayjs', '@mui/x-date-pickers']
  }
});
