import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    clearScreen: false,
    server: {
        port: 14321,
        strictPort: true,
    },
    preview: {
        port: 14322,
        strictPort: true,
    },
})
