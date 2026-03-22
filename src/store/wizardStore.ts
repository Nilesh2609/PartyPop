import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { PlanWizardValues } from '@/lib/planWizardSchema'

export type WizardState = {
  step: number
  draft: Partial<PlanWizardValues>
  setStep: (n: number) => void
  patchDraft: (p: Partial<PlanWizardValues>) => void
  reset: () => void
}

const initial: Pick<WizardState, 'step' | 'draft'> = {
  step: 0,
  draft: {},
}

export const useWizardStore = create<WizardState>()(
  persist(
    (set) => ({
      ...initial,
      setStep: (step) => set({ step }),
      patchDraft: (patch) =>
        set((s) => ({ draft: { ...s.draft, ...patch } })),
      reset: () => set({ ...initial }),
    }),
    { name: 'partypop-wizard-draft' },
  ),
)
