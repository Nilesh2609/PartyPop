export function requireIdentity(auth: {
  getUserIdentity: () => Promise<{ subject: string; email?: string } | null>
}): Promise<{ subject: string; email?: string }> {
  return auth.getUserIdentity().then((id) => {
    if (!id) throw new Error('Not authenticated')
    return id
  })
}

export function assertPlanOwner<T extends { userId: string }>(
  plan: T,
  clerkSubject: string,
): void {
  if (plan.userId !== clerkSubject) {
    throw new Error('Not authorized for this plan')
  }
}
