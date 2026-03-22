import { ClerkProvider, useAuth } from '@clerk/clerk-react'
import { ConvexReactClient } from 'convex/react'
import { ConvexProviderWithClerk } from 'convex/react-clerk'
import type { ReactNode } from 'react'

const convexUrl = (import.meta.env.VITE_CONVEX_URL as string | undefined)?.trim()
const clerkPub = (
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined
)?.trim()

const convex = convexUrl ? new ConvexReactClient(convexUrl) : null

function MissingConfigMessage() {
  const missing: string[] = []
  if (!convexUrl) missing.push('VITE_CONVEX_URL')
  if (!clerkPub) missing.push('VITE_CLERK_PUBLISHABLE_KEY')
  const isProd = import.meta.env.PROD

  return (
    <div className="mx-auto max-w-lg p-8 text-center">
      <h1 className="text-xl font-semibold">Configuration needed</h1>
      <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
        Missing:{' '}
        {missing.map((k) => (
          <code key={k} className="text-foreground mx-0.5 text-xs">
            {k}
          </code>
        ))}
        . Vite embeds these at <strong className="text-foreground">build</strong>{' '}
        time, so they must be present when <code className="text-xs">npm run build</code>{' '}
        runs.
      </p>
      {isProd ? (
        <ul className="text-muted-foreground mt-4 list-inside list-disc space-y-2 text-left text-sm">
          <li>
            In{' '}
            <strong className="text-foreground">Vercel</strong> → Project →
            Settings → Environment Variables: add the variables above for{' '}
            <strong className="text-foreground">Production</strong> (and Preview
            if you use preview deploys).
          </li>
          <li>
            Redeploy (Deployments → … → Redeploy). Editing env alone does not
            update an old build.
          </li>
        </ul>
      ) : (
        <ul className="text-muted-foreground mt-4 list-inside list-disc space-y-2 text-left text-sm">
          <li>
            In the project root, create or edit{' '}
            <code className="text-xs">.env.local</code> with those exact names
            (see <code className="text-xs">.env.example</code>).
          </li>
          <li>
            Stop and restart <code className="text-xs">npm run dev</code> so Vite
            reloads env.
          </li>
          <li>
            Run <code className="text-xs">npx convex dev</code> when developing
            against Convex.
          </li>
        </ul>
      )}
    </div>
  )
}

export function AppProviders({ children }: { children: ReactNode }) {
  if (!convexUrl || !clerkPub || !convex) {
    return <MissingConfigMessage />
  }

  return (
    <ClerkProvider publishableKey={clerkPub}>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  )
}
