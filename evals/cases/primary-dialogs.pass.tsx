// Two independent dialogs, each with its own single primary — each dialog is a
// separately-rendered view, so this is correct and must pass.
import { Dialog, DialogContent, Button } from '@2one/design-library'

export function Screen() {
  return (
    <>
      <Dialog><DialogContent><Button>Confirm</Button></DialogContent></Dialog>
      <Dialog><DialogContent><Button>Delete</Button></DialogContent></Dialog>
    </>
  )
}
