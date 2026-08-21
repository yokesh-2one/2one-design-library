import { Rocket } from "lucide-react"
export function Bad() {
  return (
    <div className="bg-blue-600 mt-[13px]">
      <h1>acme</h1>
      <span className="bg-slate-500 text-alert-600">acme's own ramps — must NOT be flagged</span>
      <Rocket />
    </div>
  )
}
