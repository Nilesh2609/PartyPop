import { SignedIn, SignedOut } from '@clerk/clerk-react'
import { Link } from 'react-router-dom'
import { CountdownHero } from '@/components/home/CountdownHero'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export function HomePage() {
  return (
    <div className="animate-enter flex flex-col gap-16 md:gap-24">
      <CountdownHero />

      <section className="mx-auto max-w-lg space-y-6 text-center">
        <h1 className="text-foreground font-display text-[22px] leading-snug font-normal tracking-tight md:text-[26px]">
          Plan a kid&apos;s party without the noise.
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed font-medium">
          One quiet, organized flow — checklist, shopping list, day-of timeline,
          and local vendor ideas tuned to your budget.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <SignedIn>
            <Link
              to="/plan/new"
              className={cn(buttonVariants({ size: 'lg' }))}
            >
              Start planning
            </Link>
            <Link
              to="/plans"
              className={cn(buttonVariants({ size: 'lg', variant: 'outline' }))}
            >
              View my plans
            </Link>
          </SignedIn>
          <SignedOut>
            <Link
              to="/sign-in"
              className={cn(buttonVariants({ size: 'lg' }))}
            >
              Plan my kid&apos;s party
            </Link>
          </SignedOut>
        </div>
      </section>

      <section className="mx-auto flex max-w-lg flex-col gap-12">
        <div className="space-y-2">
          <h2 className="text-foreground font-display text-[22px] font-normal tracking-tight">
            Guided flow
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Ten focused questions so you&apos;re done before decision fatigue
            hits.
          </p>
        </div>
        <div className="space-y-2">
          <h2 className="text-foreground font-display text-[22px] font-normal tracking-tight">
            Your plan
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Checklist, shopping list, and timeline you can edit anytime.
          </p>
        </div>
        <div className="space-y-2">
          <h2 className="text-foreground font-display text-[22px] font-normal tracking-tight">
            Local vendors
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Shortlists for inflatables, cakes, and entertainment in your launch
            city.
          </p>
        </div>
      </section>

      <SignedOut>
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>Sign in to save plans</CardTitle>
            <CardDescription>
              Create a free account to generate, save, and revisit party plans
              across devices.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/sign-in" className={cn(buttonVariants())}>
              Create account or sign in
            </Link>
          </CardContent>
        </Card>
      </SignedOut>
    </div>
  )
}
