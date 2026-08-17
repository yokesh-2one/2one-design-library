import { useState } from 'react'
import { Button } from '@astryxdesign/core/Button'
import { Heading } from '@astryxdesign/core/Heading'
import { Text } from '@astryxdesign/core/Text'
import { Stack } from '@astryxdesign/core/Layout'
import { Gallery } from './Gallery'
import { TemplateView } from './TemplateView'

export function App() {
  const [dark, setDark] = useState(false)
  const [tab, setTab] = useState<'components' | 'templates'>('components')
  const toggle = () => {
    const next = !dark
    setDark(next)
    const el = document.documentElement
    el.setAttribute('data-astryx-media', next ? 'dark' : 'light')
    el.style.colorScheme = next ? 'dark' : 'light'
  }
  return (
    <div style={{ background: 'var(--color-background-body)', color: 'var(--color-text-primary)', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '32px 24px 96px' }}>
        <Stack direction="horizontal" gap={4} hAlign="space-between" vAlign="center">
          <Stack direction="vertical" gap={1}>
            <Text style={{ fontFamily: 'ui-monospace, monospace', fontSize: 12, color: 'var(--color-text-secondary)' }}>
              2one × Astryx · Meta Astryx re-skinned to the 2one brand
            </Text>
            <Heading level={1}>The 2one system, on Astryx.</Heading>
          </Stack>
          <Button label={dark ? 'Light' : 'Dark'} variant="secondary" onClick={toggle} />
        </Stack>

        <div style={{ display: 'flex', gap: 8, margin: '20px 0 28px' }}>
          <Button label="Components (81)" variant={tab === 'components' ? 'primary' : 'ghost'} onClick={() => setTab('components')} />
          <Button label="Templates (38)" variant={tab === 'templates' ? 'primary' : 'ghost'} onClick={() => setTab('templates')} />
        </div>

        {tab === 'components' ? <Gallery /> : <TemplateView />}
      </div>
    </div>
  )
}
