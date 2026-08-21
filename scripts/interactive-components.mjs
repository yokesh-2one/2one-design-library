/*
  The interactive / stateful components — form controls, actions, and selection
  surfaces where "state" (validation, selection, active) is expressed to the user.
  For these, the brand + a11y rule "never signal state by colour alone" is
  non-negotiable, so the knowledge graph MUST link each to rule:no-color-alone
  (governed_by), and `npm run validate` fails if any is missing that edge.

  Single source of truth, imported by scripts/build-graph.mjs (adds the edges) and
  scripts/validate.mjs (enforces them) so the two can't drift. Add a component here
  when you add a new interactive primitive.
*/
export const INTERACTIVE = [
  'button',
  'checkbox',
  'radio-group',
  'switch',
  'select',
  'native-select',
  'input',
  'textarea',
  'slider',
  'toggle',
  'toggle-group',
  'input-otp',
  'field',
  'form',
  'calendar',
  'command',
  'tabs',
  'pagination',
]
