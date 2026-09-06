import * as React from 'react'
import { CircleAlert, CircleCheck } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

import { PageCrumb } from './page-crumb'
import { PageHero } from './page-hero'
import { LINKS } from './nav'

export function ContactPage() {
  const [sent, setSent] = React.useState(false)
  const [emailError, setEmailError] = React.useState<string | null>(null)
  const [messageError, setMessageError] = React.useState<string | null>(null)

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const email = String(data.get('email') ?? '').trim()
    const message = String(data.get('message') ?? '').trim()
    let ok = true
    if (!email || !email.includes('@')) {
      setEmailError('Enter a work email so we can reply.')
      ok = false
    } else setEmailError(null)
    if (!message) {
      setMessageError('Say what you want to build, and roughly how many users.')
      ok = false
    } else setMessageError(null)
    if (ok) setSent(true)
  }

  return (
    <main>
      <PageCrumb current="Contact" />
      <PageHero
        eyebrow="2one"
        title="Contact 2one"
        body={
          <>
            <p>
              Origin seats or 2one consulting (AI and UX strategy). This form stays
              in your browser. Nothing is emailed yet.
            </p>
            <p className="mt-4">
              There’s no checkout here. We won’t claim a capability that isn’t in the
              repository.
            </p>
          </>
        }
      >
        <Card>
          <CardHeader>
            <CardTitle>Contact form</CardTitle>
            <CardDescription>Stored in this tab only. Nothing is emailed yet.</CardDescription>
          </CardHeader>
          <CardContent>
            {sent ? (
              <Alert>
                <CircleCheck />
                <AlertTitle>Message recorded locally</AlertTitle>
                <AlertDescription>
                  Nothing leaves this tab. Copy the same details to{' '}
                  <a href={LINKS.company.href} className="underline-offset-4 hover:underline">
                    {LINKS.company.label}
                  </a>
                  , or open an issue on the{' '}
                  <a href={LINKS.repo.href} className="underline-offset-4 hover:underline">
                    {LINKS.repo.label}
                  </a>
                  .
                </AlertDescription>
              </Alert>
            ) : (
              <form onSubmit={onSubmit} noValidate>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="name">Name</FieldLabel>
                    <Input id="name" name="name" autoComplete="name" />
                  </Field>
                  <Field data-invalid={emailError ? true : undefined}>
                    <FieldLabel htmlFor="email">Work email</FieldLabel>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      aria-invalid={emailError ? true : undefined}
                      aria-describedby={emailError ? 'email-error' : undefined}
                      required
                    />
                    {emailError && (
                      <FieldError id="email-error">
                        <CircleAlert className="size-4" aria-hidden /> {emailError}
                      </FieldError>
                    )}
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="seats">Approx. users</FieldLabel>
                    <Input id="seats" name="seats" inputMode="numeric" placeholder="e.g. 12 or 140" />
                  </Field>
                  <Field data-invalid={messageError ? true : undefined}>
                    <FieldLabel htmlFor="message">What you want to build</FieldLabel>
                    <Textarea
                      id="message"
                      name="message"
                      aria-invalid={messageError ? true : undefined}
                      aria-describedby={messageError ? 'message-error' : undefined}
                      required
                    />
                    {messageError && (
                      <FieldError id="message-error">
                        <CircleAlert className="size-4" aria-hidden /> {messageError}
                      </FieldError>
                    )}
                  </Field>
                  <Field>
                    <Button type="submit">Send</Button>
                  </Field>
                </FieldGroup>
              </form>
            )}
          </CardContent>
        </Card>
      </PageHero>
    </main>
  )
}
