// @expect literal-content-array
// Fake product data — module-scope records of pure content strings, mapped in the
// view. Ids alone don't make it config; move it to real data.
const TESTIMONIALS = [
  { id: 't1', name: 'Ana Diaz', role: 'Product Manager', quote: 'It shipped faster than we planned.' },
  { id: 't2', name: 'Bo Feng', role: 'Engineer', quote: 'Everything already looks like one system.' },
]

export function Wall() {
  return <ul>{TESTIMONIALS.map((t) => <li key={t.id}>{t.quote}</li>)}</ul>
}
