import { useMutation } from 'convex/react'
import { useEffect } from 'react'
import { api } from '../../../convex/_generated/api'

/** Seeds demo vendor data on first use when the table is empty. */
export function VendorSeedBootstrap() {
  const seed = useMutation(api.seed.ensureDemoVendors)
  useEffect(() => {
    void seed({})
  }, [seed])
  return null
}
