import type { Components } from 'react-markdown'
import ReactMarkdown from 'react-markdown'

const components: Components = {
  h1: ({ children }) => (
    <h3 className="text-foreground font-display mt-6 mb-2 text-xl font-normal tracking-tight first:mt-0">
      {children}
    </h3>
  ),
  h2: ({ children }) => (
    <h3 className="text-foreground font-display mt-6 mb-2 text-xl font-normal tracking-tight first:mt-0">
      {children}
    </h3>
  ),
  h3: ({ children }) => (
    <h4 className="text-foreground mt-4 mb-1.5 text-sm font-semibold first:mt-0">
      {children}
    </h4>
  ),
  p: ({ children }) => (
    <p className="text-foreground/90 mb-3 text-sm leading-relaxed last:mb-0">
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul className="text-foreground/90 mb-4 list-none space-y-2 text-sm last:mb-0">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="text-foreground/90 mb-4 list-decimal space-y-2 pl-5 text-sm last:mb-0">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="border-border border-l-2 border-[color:var(--brand-border)] pl-3 leading-relaxed [&>p]:mb-0 [&>p]:inline">
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
    <div className={className}>
      <ReactMarkdown components={components}>{markdown}</ReactMarkdown>
    </div>
  )
}
