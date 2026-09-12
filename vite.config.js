import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

// Le micro (reconnaissance vocale) n'est autorise par les navigateurs qu'en HTTPS
// ou sur localhost. Pour utiliser l'appli depuis la tablette via le wifi, on lance
// `npm run tablette` qui active un certificat auto-signe.
const shouldServeOverHttps = process.env.HTTPS === '1'

export default defineConfig({
  plugins: [react(), ...(shouldServeOverHttps ? [basicSsl()] : [])],
  server: {
    port: 5173,
    strictPort: false,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setupTests.js'],
    include: ['src/**/*.test.{js,jsx}'],
  },
})
