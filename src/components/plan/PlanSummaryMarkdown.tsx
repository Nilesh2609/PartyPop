import type { Components } from 'react-markdown'
import ReactMarkdown from 'react-markdown'
import { cn } from '@/lib/utils'

const factCardClass =
  'border-border bg-muted/25 flex min-h-full min-w-0 flex-col gap-0.5 rounded-md border-[0.5px] px-3 py-2.5 text-sm leading-relaxed'

const components: Components = {
  h1: ({ children }) => (
    <div className={`${factCardClass} [&>p]:mb-0 [&>p]:block`}>
      <strong className="text-foreground font-medium">Party</strong>
      <span className="text-foreground/90">{children}</span>
    </div>
  ),
  h2: ({ children }) => (
    <div className={`${factCardClass} [&>p]:mb-0 [&>p]:block`}>
      <strong className="text-foreground font-medium">Party</strong>
      <span className="text-foreground/90">{children}</span>
    </div>
  ),
  h3: ({ children }) => (
    <h4 className="text-foreground col-span-full mt-4 mb-1.5 text-sm font-semibold first:mt-0">
      {children}
    </h4>
  ),
  p: ({ children }) => (
    <p className="text-foreground/90 col-span-full mt-2 text-sm leading-relaxed last:mb-0 first:mt-0">
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul className="contents list-none">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="text-foreground/90 col-span-full mb-4 list-decimal space-y-2 pl-5 text-sm last:mb-0">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className={`${factCardClass} [&>p]:mb-0 [&>p]:block`}>
      {children}
    </li>
  ),
  strong: ({ children }) => (
    <strong className="text-foreground font-medium">{children}</strong>
  ),
  a: ({ children, href }) => (
    <a
      href={href}
      className="text-primary font-medium underline-offset-2 hover:underline"
      target="_blank"
      rel="noreferrer"
    >
      {children}
    </a>
  ),
}

type PlanSummaryMarkdownProps = {
  markdown: string
  className?: string
}

export function PlanSummaryMarkdown({
  markdown,
  className,
}: PlanSummaryMarkdownProps) {
  if (!markdown.trim()) {
    return (
      <p className="text-muted-foreground text-sm">
        No summary yet — open edit to add notes, or wait for generation to
        finish.
      </p>
    )
  }

  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-2 text-sm sm:grid-cols-2 lg:grid-cols-5',
        className,
      )}
    >
      <ReactMarkdown components={components}>{markdown}</ReactMarkdown>
    </div>
  )
}
