// @expect multiple-primary-buttons
// Two filled primaries in ONE rendered view — the real violation. One primary
// action per view; make the lesser action a secondary/outline.
import { Button } from '@2one/design-library'

export function Toolbar() {
  return <div><Button>Save</Button><Button>Publish</Button></div>
}
