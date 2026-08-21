// Auto-generated — Astryx page templates, 2one-themed. Picker renders one at a time.
import { useState, Component, type ReactNode } from "react"
import { Button } from "@astryxdesign/core/Button"
import { Stack } from "@astryxdesign/core/Layout"
import T_ai_chat from "./templates/ai-chat"
import T_ai_chat_landing from "./templates/ai-chat-landing"
import T_blank from "./templates/blank"
import T_centered_hero from "./templates/centered-hero"
import T_classic_gallery from "./templates/classic-gallery"
import T_contact_form from "./templates/contact-form"
import T_dashboard from "./templates/dashboard"
import T_dashboard_portfolio from "./templates/dashboard-portfolio"
import T_detail_page from "./templates/detail-page"
import T_documentation from "./templates/documentation"
import T_documentation_design from "./templates/documentation-design"
import T_documentation_technical from "./templates/documentation-technical"
import T_editor from "./templates/editor"
import T_file_explorer from "./templates/file-explorer"
import T_form_two_column from "./templates/form-two-column"
import T_gallery_hero from "./templates/gallery-hero"
import T_ide from "./templates/ide"
import T_incident_console from "./templates/incident-console"
import T_library from "./templates/library"
import T_login from "./templates/login"
import T_login_card from "./templates/login-card"
import T_login_split from "./templates/login-split"
import T_login_sso from "./templates/login-sso"
import T_messaging_shell from "./templates/messaging-shell"
import T_mixed_gallery from "./templates/mixed-gallery"
import T_payment_form from "./templates/payment-form"
import T_product_detail from "./templates/product-detail"
import T_product_gallery from "./templates/product-gallery"
import T_settings from "./templates/settings"
import T_settings_dialog from "./templates/settings-dialog"
import T_settings_sidebar from "./templates/settings-sidebar"
import T_shell_nav from "./templates/shell-nav"
import T_shell_side_nav from "./templates/shell-side-nav"
import T_side_gallery from "./templates/side-gallery"
import T_table from "./templates/table"
import T_table_grouped from "./templates/table-grouped"
import T_table_page from "./templates/table-page"
import T_theme_showcase from "./templates/theme-showcase"
class Errorable extends Component<{ name: string; children: ReactNode }, { err: boolean }> {
  state = { err: false }
  static getDerivedStateFromError() { return { err: true } }
  render() { return this.state.err ? <span style={{ color: "var(--color-error)", padding: 24, display: "block" }}>⚠ {this.props.name} failed to render</span> : this.props.children }
}
const TEMPLATES = [
  { id: "ai-chat", title: "Ai Chat", C: T_ai_chat },
  { id: "ai-chat-landing", title: "Ai Chat Landing", C: T_ai_chat_landing },
  { id: "blank", title: "Blank", C: T_blank },
  { id: "centered-hero", title: "Centered Hero", C: T_centered_hero },
  { id: "classic-gallery", title: "Classic Gallery", C: T_classic_gallery },
  { id: "contact-form", title: "Contact Form", C: T_contact_form },
  { id: "dashboard", title: "Dashboard", C: T_dashboard },
  { id: "dashboard-portfolio", title: "Dashboard Portfolio", C: T_dashboard_portfolio },
  { id: "detail-page", title: "Detail Page", C: T_detail_page },
  { id: "documentation", title: "Documentation", C: T_documentation },
  { id: "documentation-design", title: "Documentation Design", C: T_documentation_design },
  { id: "documentation-technical", title: "Documentation Technical", C: T_documentation_technical },
  { id: "editor", title: "Editor", C: T_editor },
  { id: "file-explorer", title: "File Explorer", C: T_file_explorer },
  { id: "form-two-column", title: "Form Two Column", C: T_form_two_column },
  { id: "gallery-hero", title: "Gallery Hero", C: T_gallery_hero },
  { id: "ide", title: "Ide", C: T_ide },
  { id: "incident-console", title: "Incident Console", C: T_incident_console },
  { id: "library", title: "Library", C: T_library },
  { id: "login", title: "Login", C: T_login },
  { id: "login-card", title: "Login Card", C: T_login_card },
  { id: "login-split", title: "Login Split", C: T_login_split },
  { id: "login-sso", title: "Login Sso", C: T_login_sso },
  { id: "messaging-shell", title: "Messaging Shell", C: T_messaging_shell },
  { id: "mixed-gallery", title: "Mixed Gallery", C: T_mixed_gallery },
  { id: "payment-form", title: "Payment Form", C: T_payment_form },
  { id: "product-detail", title: "Product Detail", C: T_product_detail },
  { id: "product-gallery", title: "Product Gallery", C: T_product_gallery },
  { id: "settings", title: "Settings", C: T_settings },
  { id: "settings-dialog", title: "Settings Dialog", C: T_settings_dialog },
  { id: "settings-sidebar", title: "Settings Sidebar", C: T_settings_sidebar },
  { id: "shell-nav", title: "Shell Nav", C: T_shell_nav },
  { id: "shell-side-nav", title: "Shell Side Nav", C: T_shell_side_nav },
  { id: "side-gallery", title: "Side Gallery", C: T_side_gallery },
  { id: "table", title: "Table", C: T_table },
  { id: "table-grouped", title: "Table Grouped", C: T_table_grouped },
  { id: "table-page", title: "Table Page", C: T_table_page },
  { id: "theme-showcase", title: "Theme Showcase", C: T_theme_showcase },
]
export function TemplateView() {
  const [active, setActive] = useState(TEMPLATES[0].id)
  const cur = TEMPLATES.find(t => t.id === active)!
  return (
    <Stack direction="vertical" gap={4}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {TEMPLATES.map(t => <Button key={t.id} label={t.title} size="sm" variant={t.id === active ? "primary" : "secondary"} onClick={() => setActive(t.id)} />)}
      </div>
      <div style={{ border: "1px solid var(--color-border)", borderRadius: "var(--radius-container)", overflow: "auto", height: 640, background: "var(--color-background-body)" }}>
        <Errorable key={cur.id} name={cur.title}><cur.C /></Errorable>
      </div>
    </Stack>
  )
}
