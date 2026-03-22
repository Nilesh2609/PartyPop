import { ClerkProvider, useAuth } from '@clerk/clerk-react'
import { ConvexReactClient } from 'convex/react'
import { ConvexProviderWithClerk } from 'convex/react-clerk'
import type { ReactNode } from 'react'

const convexUrl = import.meta.env.VITE_CONVEX_URL as string | undefined
const clerkPub = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined

const convex = convexUrl ? new ConvexReactClient(convexUrl) : null

export function AppProviders({ children }: { children: ReactNode }) {
  if (!convexUrl || !clerkPub || !convex) {
    return (
      <div className="mx-auto max-w-lg p-8 text-center">
        <h1 className="text-xl font-semibold">Configuration needed</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Create <code className="text-xs">.env.local</code> with{' '}
          <code className="text-xs">VITE_CONVEX_URL</code> and{' '}
          <code className="text-xs">VITE_CLERK_PUBLISHABLE_KEY</code>, then run{' '}
          <code className="text-xs">npx convex dev</code>.
        </p>
      </div>
    )
  }

  return (
    <ClerkProvider publishableKey={clerkPub}>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  )
}
