import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        tsconfigPaths()
    ],
    optimizeDeps: {
        exclude: ['@capsule/common'],
    },
    resolve: {
        alias: {
            '@capsule/common': '@capsule/common/src/index.ts',
        }
    },
})
