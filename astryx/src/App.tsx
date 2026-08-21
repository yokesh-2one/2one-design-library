import { useState, useEffect } from 'react'
import { AppShell } from '@astryxdesign/core/AppShell'
import { SideNav, SideNavHeading, SideNavItem } from '@astryxdesign/core/SideNav'
import { Button } from '@astryxdesign/core/Button'
import { Badge } from '@astryxdesign/core/Badge'
import { CATEGORIES } from './catalog'
import { TemplateView } from './TemplateView'
import { Logo2one } from './Logo2one'
import './showcase.css'

const TOTAL_COMPONENTS = CATEGORIES.reduce((n, c) => n + c.items.length, 0)
const STATS: [string, string][] = [
  ['Components', String(TOTAL_COMPONENTS)],
  ['Categories', String(CATEGORIES.length)],
  ['Page templates', '38'],
  ['Themes', 'Light + Dark'],
]

export function App() {
  const [dark, setDark] = useState(false)
  const [active, setActive] = useState('overview')

  const toggle = () => {
    const next = !dark
    setDark(next)
    const el = document.documentElement
    el.setAttribute('data-astryx-media', next ? 'dark' : 'light')
    el.style.colorScheme = next ? 'dark' : 'light'
  }
  const go = (id: string) => { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }) }

  // scroll-spy — highlight the active section in the sidebar (same as the shadcn showcase)
  useEffect(() => {
    const secs = Array.from(document.querySelectorAll('.g-section[id]'))
    const obs = new IntersectionObserver(
      (es) => es.forEach((e) => { if (e.isIntersecting) setActive(e.target.id) }),
      { rootMargin: '-45% 0px -50% 0px' },
    )
    secs.forEach((s) => obs.observe(s))
    return () => obs.disconnect()
  }, [])

  const sideNav = (
    <SideNav header={<SideNavHeading heading="2one × Astryx" subheading="design library" icon={<Logo2one width={38} />} />}>
      <SideNavItem label="Overview" isSelected={active === 'overview'} onClick={() => go('overview')} />
      <SideNavHeading heading="Components" />
      {CATEGORIES.map((c) => (
        <SideNavItem
          key={c.id}
          label={c.title}
          isSelected={active === c.id}
          onClick={() => go(c.id)}
          endContent={<Badge label={String(c.items.length)} variant="neutral" />}
        />
      ))}
      <SideNavHeading heading="Templates" />
      <SideNavItem
        label="Page templates"
        isSelected={active === 'templates'}
        onClick={() => go('templates')}
        endContent={<Badge label="38" variant="neutral" />}
      />
      <SideNavHeading heading="Explore" />
      <SideNavItem label="Knowledge graph" href="./graph.html" />
    </SideNav>
  )

  const topNav = (
    <div className="g-topbar">
      <span className="repo">2one × Astryx · Meta Astryx re-skinned to the 2one brand</span>
      <Button label={dark ? 'Light' : 'Dark'} variant="secondary" size="sm" onClick={toggle} />
    </div>
  )

  return (
    <AppShell height="auto" variant="section" contentPadding={0} sideNav={sideNav} topNav={topNav}>
      <div className="g-content">
        <section id="overview" className="g-section g-hero">
          <div className="g-eyebrow">2one · Astryx design library</div>
          <h1 className="g-h1">The 2one system, on Astryx.</h1>
          <p className="g-lede">Meta Astryx re-skinned to the 2one brand — grayscale, Satoshi headings + Inter body, danger/success reserved for validation, APCA-audited in light and dark.</p>
          <div className="g-stats">
            {STATS.map(([label, value]) => (
              <div className="g-stat" key={label}>
                <div className="g-stat-n">{value}</div>
                <div className="g-stat-l">{label}</div>
              </div>
            ))}
          </div>
        </section>

        {CATEGORIES.map((c) => (
          <section id={c.id} className="g-section" key={c.id}>
            <div className="g-eyebrow">Components</div>
            <h2 className="g-h2">{c.title}</h2>
            <p className="g-lede">{c.desc}</p>
            <div className="g-grid">
              {c.items.map(([name, C]) => (
                <div className="g-card" key={name}>
                  <div className="g-card-h">{name}</div>
                  <div className="g-card-b"><C /></div>
                </div>
              ))}
            </div>
          </section>
        ))}

        <section id="templates" className="g-section">
          <div className="g-eyebrow">Templates</div>
          <h2 className="g-h2">Page templates</h2>
          <p className="g-lede">38 full-page templates — dashboards, auth, checkout, tables, IDE, and more. Pick one to preview it full-width.</p>
          <div style={{ marginTop: 24 }}><TemplateView /></div>
        </section>
      </div>
    </AppShell>
  )
}
