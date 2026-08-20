# Build an app

```bash
npm install @2one/design-library react react-dom
```

Add the theme once at your app root, run Tailwind v4, and point it at the package
so the component utility classes are generated:

```ts
// main.tsx
import '@2one/design-library/styles'
```

```css
/* app.css */
@import 'tailwindcss';
@import '@2one/design-library/styles';
@source '../node_modules/@2one/design-library/dist';
```

Then compose screens from components (shadcn names, 2one-themed):

```tsx
import { AppBar, Input, Button, Checkbox, Label } from '@2one/design-library'

<AppBar title="Sign in" onBack={() => history.back()} />
<div className="grid gap-1.5">
  <Label htmlFor="email">Email</Label>
  <Input id="email" placeholder="you@example.com" />
</div>
<label className="flex items-center gap-2"><Checkbox /> Remember me</label>
<Button>Continue</Button>   {/* pill, monochrome — one primary per view */}
```
