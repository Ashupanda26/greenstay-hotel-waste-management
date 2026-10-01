type PlaceholderPanelProps = {
  /** Requirements this page will satisfy, taken from the project brief. */
  planned: string[]
}

// Temporary panel used during the setup phase. Remove once a page is implemented.
export default function PlaceholderPanel({ planned }: PlaceholderPanelProps) {
  return (
    <section
      aria-label="Not built yet"
      className="rounded-lg border-2 border-dashed border-moss/40 bg-white/70 p-6"
    >
      <p className="font-display text-lg font-bold text-moss">Not built yet</p>
      <p className="mt-1 text-sm text-ink/70">This page will cover:</p>
      <ul className="mt-3 list-disc space-y-1 pl-5 text-ink/85">
        {planned.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  )
}
