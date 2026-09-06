import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { VERSUS } from './content'

export function Versus() {
  return (
    <section className="w-full border-b bg-background">
      <div className="mx-auto max-w-7xl px-6 py-20 md:py-24">
        <h2 className="max-w-2xl text-3xl font-bold tracking-tight text-balance md:text-4xl">
          Sketch there. Ship from here.
        </h2>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground text-pretty">
          Figma and Claude Design are for drawing. Origin is for the brand and rules
          AI should follow. We do not replace their canvas.
        </p>
        <div className="mt-10 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[22%]">Job</TableHead>
                <TableHead>Figma</TableHead>
                <TableHead>Claude Design</TableHead>
                <TableHead>Origin</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {VERSUS.map((row) => (
                <TableRow key={row.job}>
                  <TableCell className="align-top font-medium text-pretty">{row.job}</TableCell>
                  <TableCell className="align-top text-pretty text-muted-foreground tabular-nums">
                    {row.figma}
                  </TableCell>
                  <TableCell className="align-top text-pretty text-muted-foreground tabular-nums">
                    {row.claudeDesign}
                  </TableCell>
                  <TableCell className="align-top text-pretty tabular-nums">{row.origin}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  )
}
