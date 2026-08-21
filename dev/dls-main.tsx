import { createRoot } from 'react-dom/client'
import './theme-dev.css'
import './showcase.css'
import './dls.css'
import { ThemeProvider } from '../src/theme-provider'
import { Dls } from './dls'

createRoot(document.getElementById('root')!).render(
  <ThemeProvider>
    <Dls />
  </ThemeProvider>,
)
