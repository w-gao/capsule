import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    optimizeDeps: {
        exclude: ['@capsule/common'],
    },
    resolve: {
        alias: {
            '@capsule/common': '@capsule/common/src/index.ts',
        }
    },
})
