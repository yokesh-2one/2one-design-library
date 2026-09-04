import * as React from 'react'

import { LoginForm } from '@/blocks/login-01'
import { SignupForm } from '@/blocks/signup-01'
import { DashboardPlain } from '@/blocks/dashboard-plain/page'
import { MarketingPage } from '@/blocks/marketing/page'

/*
  Full-page block fixtures — the compositions a builder ships whole (auth, a
  dashboard, a marketing page). Rendered from the real DLS blocks; deterministic
  (the harness freezes the clock, so any date-derived UI is stable). Harvested
  from the parallel a11y-harness effort so the merged suite covers page blocks
  too, not just components.
*/

type Case = { render: () => React.ReactNode; layout?: 'center' | 'fill' }

export const BLOCK_CASES: Record<string, Case> = {
  login: {
    render: () => (
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    ),
    layout: 'center',
  },
  signup: {
    render: () => (
      <div className="w-full max-w-sm">
        <SignupForm />
      </div>
    ),
    layout: 'center',
  },
  dashboard: { render: () => <DashboardPlain />, layout: 'fill' },
  marketing: { render: () => <MarketingPage />, layout: 'fill' },
}
