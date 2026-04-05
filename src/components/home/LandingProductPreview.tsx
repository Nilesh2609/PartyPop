/**
 * Static hero visual — explains the product without Convex (signed-out marketing).
 */
export function LandingProductPreview() {
  return (
    <div className="space-y-4 lg:pl-4">
      <div className="border-primary bg-card rounded-2xl border px-5 py-6 shadow-sm">
        <p className="text-muted-foreground text-[11px] font-medium tracking-[0.08em] uppercase">
          Jordan&apos;s 8th birthday
        </p>
        <div className="mt-3 flex flex-wrap items-baseline gap-x-2">
          <span className="text-foreground font-display text-5xl leading-none font-normal md:text-6xl">
            12
          </span>
          <span className="text-primary font-display text-lg leading-none md:text-xl">
            days
          </span>
        </div>
        <p className="text-muted-foreground mt-2 text-xs">Saturday, May 17</p>
      </div>
      <div className="border-border bg-card rounded-lg border-[0.5px] p-4 shadow-sm">
        <p className="text-muted-foreground mb-3 text-[11px] font-medium tracking-wide uppercase">
          Today&apos;s checklist
        </p>
        <ul className="space-y-2.5 text-sm">
          <li className="text-muted-foreground flex gap-3">
            <span
              className="border-primary mt-0.5 size-4 shrink-0 rounded-full border-[1.5px]"
              aria-hidden
            />
            <span className="leading-snug">Confirm cake pickup time</span>
          </li>
          <li className="text-muted-foreground flex gap-3">
            <span
              className="border-primary mt-0.5 size-4 shrink-0 rounded-full border-[1.5px] bg-primary"
              aria-hidden
            />
            <span className="text-foreground line-through opacity-70">
              Send invites with RSVP date
            </span>
          </li>
          <li className="text-muted-foreground flex gap-3">
            <span
              className="border-border mt-0.5 size-4 shrink-0 rounded-full border-[1.5px]"
              aria-hidden
            />
            <span className="leading-snug">Order balloons &amp; tableware</span>
          </li>
        </ul>
      </div>
      <div className="bg-[var(--brand-canvas)] h-1.5 overflow-hidden rounded-full">
        <div className="bg-primary h-full w-[62%] rounded-full" aria-hidden />
      </div>
      <p className="text-muted-foreground text-center text-[11px]">
        Example screen — your plan updates in real time
      </p>
    </div>
  )
}
