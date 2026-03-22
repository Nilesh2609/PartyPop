import type { AuthConfig } from 'convex/server'

const domain = process.env.CLERK_JWT_ISSUER_DOMAIN

export default {
  providers: [
    {
      // Set CLERK_JWT_ISSUER_DOMAIN in the Convex dashboard (Clerk JWT template issuer).
      domain: domain ?? 'https://placeholder.clerk.accounts.dev',
      applicationID: 'convex',
    },
  ],
} satisfies AuthConfig
