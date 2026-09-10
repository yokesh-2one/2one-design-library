// Two route components in one file, each with ONE primary — the case the old
// whole-file count wrongly flagged. Per-view counting must pass this.
import { Button } from '@2one/design-library'

export function EditScreen() {
  return <div><Button>Save</Button><Button variant="outline">Cancel</Button></div>
}
export function ComposeScreen() {
  return <div><Button>Send</Button></div>
}
