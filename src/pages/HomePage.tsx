import { SignedIn, SignedOut } from '@clerk/clerk-react'
import { Link } from 'react-router-dom'
import { CountdownHero } from '@/components/home/CountdownHero'
import { LandingMarketing } from '@/components/home/LandingMarketing'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function HomePage() {
  return (
    <>
      <SignedOut>
        <LandingMarketing />
      </SignedOut>

      <SignedIn>
        <div className="animate-enter mx-auto max-w-xl space-y-10 md:space-y-14">
          <header className="space-y-2 text-center">
            <p className="text-muted-foreground text-[11px] font-medium tracking-[0.08em] uppercase">
              Your plans
            </p>
            <h1 className="text-foreground font-display text-[clamp(1.75rem,4vw,2.25rem)] leading-snug font-normal tracking-tight">
              Pick up where you left off
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Next party countdown below — or start something new.
            </p>
          </header>
          <CountdownHero />
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/plan/new" className={cn(buttonVariants({ size: 'lg' }))}>
              New party
            </Link>
            <Link
              to="/plans"
              className={cn(buttonVariants({ size: 'lg', variant: 'outline' }))}
            >
              All my plans
            </Link>
          </div>
        </div>
      </SignedIn>
    </>
  )
}
