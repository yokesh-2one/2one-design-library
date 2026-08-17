import { createRoot } from 'react-dom/client'
import '@fontsource-variable/inter'
import './fonts.css'
import '@astryxdesign/core/reset.css'
import '@astryxdesign/core/astryx.css'
import '../dist/theme-2one.css'
import './overrides.css'
import { App } from './App'

const el = document.documentElement
el.setAttribute('data-astryx-theme', '2one')
el.setAttribute('data-astryx-media', 'light') // Astryx toggles dark via this attr
el.style.colorScheme = 'light'

createRoot(document.getElementById('root')!).render(<App />)
