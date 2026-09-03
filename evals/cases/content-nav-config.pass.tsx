// Navigation CONFIG (ids + labels + icon components) mapped in a view — structure,
// not fake product data. The refined literal-content-array rule must exempt it.
import { Home, Search, Bell } from 'lucide-react'

const TABS = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'search', label: 'Search', icon: Search },
  { id: 'alerts', label: 'Alerts', icon: Bell },
]

export function BottomNav() {
  return <nav>{TABS.map((t) => <a key={t.id} href={'#' + t.id}>{t.label}</a>)}</nav>
}
