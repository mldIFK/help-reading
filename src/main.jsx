import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './styles.css'

// Pas de <StrictMode> ici : son double montage en developpement declencherait
// deux fois les lectures audio.
createRoot(document.getElementById('root')).render(<App />)
