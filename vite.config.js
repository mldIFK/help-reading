import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

// Le micro (reconnaissance vocale) n'est autorise par les navigateurs qu'en HTTPS
// ou sur localhost. Pour utiliser l'appli depuis la tablette via le wifi, on lance
// `npm run tablette` qui active un certificat auto-signe.
const shouldServeOverHttps = process.env.HTTPS === '1'

// GitHub Pages sert un site de projet sous /<depot>/ et non a la racine : le
// build doit donc prefixer ses assets. En developpement (`vite`/`tablette`),
// l'appli reste servie a la racine pour ne rien changer a l'adresse habituelle.
const GITHUB_PAGES_REPOSITORY_NAME = 'help-reading'

export default defineConfig(({ command }) => ({
  base: command === 'build' ? `/${GITHUB_PAGES_REPOSITORY_NAME}/` : '/',
  plugins: [react(), ...(shouldServeOverHttps ? [basicSsl()] : [])],
  // Les lecons et les voix enregistrees vivent dans le stockage du navigateur,
  // qui est attache au port du serveur : un port qui change silencieusement
  // (strictPort: false) fait apparaitre l'appli comme vide sur une nouvelle
  // "adresse", alors que les donnees sont toujours intactes sur l'ancien port.
  // On prefere donc que le demarrage echoue franchement si le port est deja pris.
  server: {
    port: 5173,
    strictPort: true,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setupTests.js'],
    include: ['src/**/*.test.{js,jsx}'],
  },
}))
