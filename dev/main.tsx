import { createRoot } from 'react-dom/client'
import './theme-dev.css'
import './showcase.css'
import { Showcase } from './showcase'

createRoot(document.getElementById('root')!).render(<Showcase />)
