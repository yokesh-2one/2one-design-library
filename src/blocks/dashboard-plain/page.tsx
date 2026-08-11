import { SectionCards } from './section-cards'
import { ChartAreaInteractive } from './chart-area-interactive'
import { DataTable } from './data-table'
import data from './data.json'

// dashboard-plain — the dashboard content (stat cards + area chart + data table)
// with NO sidebar / navigation. A menu-less template you drop into your own shell.
export function DashboardPlain() {
  return (
    <div className="flex w-full min-w-0 flex-col bg-background">
      <header className="flex h-14 shrink-0 items-center border-b px-6">
        <h1 className="text-base font-medium">Dashboard</h1>
      </header>
      <div className="@container/main flex w-full min-w-0 flex-col gap-4 p-4 md:gap-6 md:p-6">
        <SectionCards />
        <ChartAreaInteractive />
        <DataTable data={data} />
      </div>
    </div>
  )
}
