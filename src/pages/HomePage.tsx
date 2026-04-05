import { SignedIn, SignedOut } from '@clerk/clerk-react'
import { LandingMarketing } from '@/components/home/LandingMarketing'
import { PartyPlansOverview } from '@/components/plans/PartyPlansOverview'

export function HomePage() {
  return (
    <>
      <SignedOut>
        <LandingMarketing />
      </SignedOut>

      <SignedIn>
        <PartyPlansOverview />
      </SignedIn>
    </>
  )
}
