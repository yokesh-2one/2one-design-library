import { createRoot } from 'react-dom/client'

import { ThemeProvider } from '../src/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'

import { StudioPage } from './studio'
import './site.css'

const el = document.getElementById('root')
if (!el) throw new Error('Origin: #root is missing')
createRoot(el).render(
  <ThemeProvider>
    <TooltipProvider>
      <StudioPage />
      <Toaster />
    </TooltipProvider>
  </ThemeProvider>,
)
