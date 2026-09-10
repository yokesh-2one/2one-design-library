// @expect em-dash-overuse
// Copy that reaches for the em-dash in every sentence reads as machine-written.
// The comment above does not count; the four in the CardDescription below do.
import { Card, CardDescription, CardHeader, CardTitle } from '@2one/design-library'

export function Pitch() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>One system, measured</CardTitle>
        <CardDescription>
          Built for teams — designers and developers — who want speed without the
          slop. Ship on-brand — first try — and never re-decide a button again.
        </CardDescription>
      </CardHeader>
    </Card>
  )
}
