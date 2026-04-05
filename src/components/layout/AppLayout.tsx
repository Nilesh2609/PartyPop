import { SignedIn, SignedOut, UserButton } from '@clerk/clerk-react'
import { Link, Outlet } from 'react-router-dom'
import { SubscriptionBootstrap } from '@/components/auth/SubscriptionBootstrap'
import { PartyPopWordmark } from '@/components/brand/PartyPopWordmark'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const SHELL = 'max-w-6xl'

export function AppLayout() {
  return (
    <div className="bg-background flex min-h-svh flex-col">
      <SignedIn>
        <SubscriptionBootstrap />
      </SignedIn>
      <header className="border-border bg-header shrink-0 border-b border-[0.5px] shadow-[0_1px_0_0_color-mix(in_srgb,var(--brand-border)_65%,transparent)]">
        <div
          className={cn(
            'mx-auto flex w-full items-center justify-between gap-4 px-4 py-4 md:px-6',
            SHELL,
          )}
        >
          <Link to="/" className="focus-visible:ring-ring rounded-sm focus-visible:ring-2 focus-visible:outline-none">
            <PartyPopWordmark />
          </Link>
          <nav className="text-muted-foreground flex items-center gap-4 text-sm font-medium">
            <SignedIn>
              <Link to="/" className="hover:text-foreground transition-colors duration-200">
                My plans
              </Link>
              <Link to="/plan/new" className="hover:text-foreground transition-colors duration-200">
                New party
              </Link>
              <Link to="/account" className="hover:text-foreground transition-colors duration-200">
                Account
              </Link>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            <SignedOut>
              <Link
                to="/sign-in"
                className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
              >
                Sign in
              </Link>
            </SignedOut>
          </nav>
        </div>
      </header>
      <main className="bg-background flex-1">
        <div
          className={cn(
            'mx-auto w-full px-4 py-10 md:px-6 md:py-14',
            SHELL,
          )}
        >
          <Outlet />
        </div>
      </main>
    </div>
  )
}
