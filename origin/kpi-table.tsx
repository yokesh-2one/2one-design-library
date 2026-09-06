import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { formatScore, kpisFor, type ScoreSurface } from './scores'

export function KpiTable({ surface }: { surface: ScoreSurface }) {
  const rows = kpisFor(surface)
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[36%]">KPI</TableHead>
          <TableHead>Value</TableHead>
          <TableHead>Kind</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell className="align-top">
              <p className="font-medium text-pretty">{row.label}</p>
              {row.product_use ? (
                <p className="mt-1 text-xs text-muted-foreground text-pretty">{row.product_use}</p>
              ) : null}
            </TableCell>
            <TableCell className="align-top tabular-nums">{formatScore(row)}</TableCell>
            <TableCell className="align-top text-sm text-muted-foreground">{row.kind}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
