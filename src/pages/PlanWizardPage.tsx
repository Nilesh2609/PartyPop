/* eslint-disable react-hooks/incompatible-library -- react-hook-form watch */
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Trash2 } from 'lucide-react'
import { useMutation } from 'convex/react'
import { useMemo } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { api } from '../../convex/_generated/api'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  planWizardSchema,
  wizardBudgetCategoriesToAllocationJson,
  type PlanWizardValues,
  wizardValuesToCents,
} from '@/lib/planWizardSchema'
import { useWizardStore } from '@/store/wizardStore'

const TOTAL_STEPS = 10

const defaultValues: PlanWizardValues = {
  title: '',
  childNameOrNickname: '',
  theme: '',
  headcount: 12,
  budgetEuros: 350,
  budgetCategories: [
    'Food & drinks',
    'Entertainment',
    'Decor & setup',
    'Cake',
    'Buffer / extras',
  ],
  partyDate: '',
  zipCode: '',
  ageRangeMin: 6,
  ageRangeMax: 8,
  venueType: 'home',
  dietaryNotes: '',
  activityStyle: 'mixed',
  specialNeeds: '',
  rsvpDeadline: '',
}

export function PlanWizardPage() {
  const navigate = useNavigate()
  const { step, setStep, draft, patchDraft, reset } = useWizardStore()
  const createPlan = useMutation(api.partyPlans.createAndGenerate)

  const form = useForm<PlanWizardValues>({
    resolver: zodResolver(planWizardSchema) as Resolver<PlanWizardValues>,
    defaultValues: { ...defaultValues, ...draft },
    mode: 'onBlur',
  })
  const budgetCategories = form.watch('budgetCategories') ?? []


  const progress = useMemo(
    () => Math.round(((step + 1) / TOTAL_STEPS) * 100),
    [step],
  )

  const fieldsForStep = (s: number): (keyof PlanWizardValues)[] => {
    switch (s) {
      case 0:
        return ['title', 'childNameOrNickname']
      case 1:
        return ['theme']
      case 2:
        return ['headcount', 'budgetEuros', 'budgetCategories']
      case 3:
        return ['partyDate']
      case 4:
        return ['zipCode']
      case 5:
        return ['ageRangeMin', 'ageRangeMax']
      case 6:
        return ['venueType']
      case 7:
        return ['dietaryNotes']
      case 8:
        return ['activityStyle']
      case 9:
        return ['specialNeeds', 'rsvpDeadline']
      default:
        return []
    }
  }

  async function nextStep() {
    const ok = await form.trigger(fieldsForStep(step), { shouldFocus: true })
    if (!ok) return
    const vals = form.getValues()
    patchDraft(vals)
    if (step < TOTAL_STEPS - 1) {
      setStep(step + 1)
    } else {
      await submit(vals)
    }
  }

  function prevStep() {
    patchDraft(form.getValues())
    setStep(Math.max(0, step - 1))
  }

  async function submit(values: PlanWizardValues) {
    const parsed = planWizardSchema.safeParse(values)
    if (!parsed.success) {
      form.trigger()
      return
    }
    try {
      const planId = await createPlan({
        title: parsed.data.title,
        theme: parsed.data.theme,
        headcount: parsed.data.headcount,
        budgetCents: wizardValuesToCents(parsed.data),
        budgetAllocationJson: wizardBudgetCategoriesToAllocationJson(parsed.data),
        partyDate: parsed.data.partyDate,
        zipCode: parsed.data.zipCode,
        ageRangeMin: parsed.data.ageRangeMin,
        ageRangeMax: parsed.data.ageRangeMax,
        specialNeeds: parsed.data.specialNeeds || undefined,
        venueType: parsed.data.venueType,
        dietaryNotes: parsed.data.dietaryNotes || undefined,
        activityStyle: parsed.data.activityStyle,
        childNameOrNickname: parsed.data.childNameOrNickname,
        rsvpDeadline: parsed.data.rsvpDeadline || undefined,
      })
      reset()
      form.reset(defaultValues)
      setStep(0)
      void navigate(`/plans/${planId}`)
    } catch (e) {
      form.setError('root', {
        message: e instanceof Error ? e.message : 'Could not create plan',
      })
    }
  }

  const { register, formState, setValue, watch } = form
  const venueType = watch('venueType')
  const activityStyle = watch('activityStyle')

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="space-y-2">
        <p className="text-muted-foreground text-sm">
          Step {step + 1} of {TOTAL_STEPS}
        </p>
        <Progress value={progress} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Party planner</CardTitle>
          <CardDescription>
            Most parents finish in under three minutes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 0 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="title">Party name</Label>
                <Input
                  id="title"
                  placeholder="e.g. Leo’s 7th space party"
                  {...register('title')}
                />
                {formState.errors.title && (
                  <p className="text-destructive text-sm">
                    {formState.errors.title.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="childNameOrNickname">Birthday kid</Label>
                <Input
                  id="childNameOrNickname"
                  placeholder="Name or nickname"
                  {...register('childNameOrNickname')}
                />
                {formState.errors.childNameOrNickname && (
                  <p className="text-destructive text-sm">
                    {formState.errors.childNameOrNickname.message}
                  </p>
                )}
              </div>
            </>
          )}

          {step === 1 && (
            <div className="space-y-2">
              <Label htmlFor="theme">Theme</Label>
              <Input
                id="theme"
                placeholder="Dinosaurs, unicorns, soccer…"
                {...register('theme')}
              />
              {formState.errors.theme && (
                <p className="text-destructive text-sm">
                  {formState.errors.theme.message}
                </p>
              )}
            </div>
          )}

          {step === 2 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="headcount">Kids attending (approx.)</Label>
                <Input
                  id="headcount"
                  type="number"
                  min={1}
                  {...register('headcount')}
                />
                {formState.errors.headcount && (
                  <p className="text-destructive text-sm">
                    {formState.errors.headcount.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="budgetEuros">Total budget (€)</Label>
                <Input
                  id="budgetEuros"
                  type="number"
                  min={30}
                  step={10}
                  {...register('budgetEuros')}
                />
                {formState.errors.budgetEuros && (
                  <p className="text-destructive text-sm">
                    {formState.errors.budgetEuros.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Budget categories</Label>
                <p className="text-muted-foreground text-xs">
                  Add, remove, or rename categories for your budget split.
                </p>
                <div className="space-y-2">
                  {budgetCategories.map((_, index) => (
                    <div key={`budget-category-${index}`} className="flex items-center gap-2">
                      <Input
                        placeholder="Category name"
                        {...register(`budgetCategories.${index}`)}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        aria-label={`Remove budget category ${index + 1}`}
                        onClick={() =>
                          setValue(
                            'budgetCategories',
                            budgetCategories.filter((__, i) => i !== index),
                            { shouldValidate: true },
                          )
                        }
                        disabled={budgetCategories.length <= 1}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setValue('budgetCategories', [...budgetCategories, ''], {
                      shouldValidate: true,
                    })
                  }
                >
                  <Plus className="size-4" />
                  Add category
                </Button>
                {formState.errors.budgetCategories && (
                  <p className="text-destructive text-sm">
                    {formState.errors.budgetCategories.message}
                  </p>
                )}
              </div>
            </>
          )}

          {step === 3 && (
            <div className="space-y-2">
              <Label htmlFor="partyDate">Party date</Label>
              <Input id="partyDate" type="date" {...register('partyDate')} />
              {formState.errors.partyDate && (
                <p className="text-destructive text-sm">
                  {formState.errors.partyDate.message}
                </p>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-2">
              <Label htmlFor="zipCode">Zip code (launch metro)</Label>
              <Input
                id="zipCode"
                inputMode="numeric"
                maxLength={5}
                placeholder="30301"
                {...register('zipCode')}
              />
              <p className="text-muted-foreground text-xs">
                MVP maps all zips to the demo metro so vendor shortlists always
                populate.
              </p>
              {formState.errors.zipCode && (
                <p className="text-destructive text-sm">
                  {formState.errors.zipCode.message}
                </p>
              )}
            </div>
          )}

          {step === 5 && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="ageRangeMin">Youngest age</Label>
                  <Input
                    id="ageRangeMin"
                    type="number"
                    min={1}
                    max={17}
                    {...register('ageRangeMin')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ageRangeMax">Oldest age</Label>
                  <Input
                    id="ageRangeMax"
                    type="number"
                    min={1}
                    max={17}
                    {...register('ageRangeMax')}
                  />
                </div>
              </div>
              {(formState.errors.ageRangeMin ||
                formState.errors.ageRangeMax) && (
                <p className="text-destructive text-sm">
                  {formState.errors.ageRangeMax?.message ||
                    formState.errors.ageRangeMin?.message}
                </p>
              )}
            </>
          )}

          {step === 6 && (
            <div className="space-y-2">
              <Label>Venue</Label>
              <Select
                value={venueType}
                onValueChange={(v) =>
                  setValue('venueType', v as PlanWizardValues['venueType'], {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose venue" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="home">Home</SelectItem>
                  <SelectItem value="park">Park / outdoor</SelectItem>
                  <SelectItem value="rented">Rented space</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {step === 7 && (
            <div className="space-y-2">
              <Label htmlFor="dietaryNotes">Food notes (optional)</Label>
              <Textarea
                id="dietaryNotes"
                placeholder="Allergies, no nuts, vegetarian options…"
                {...register('dietaryNotes')}
              />
            </div>
          )}

          {step === 8 && (
            <div className="space-y-2">
              <Label>Activity style</Label>
              <Select
                value={activityStyle}
                onValueChange={(v) =>
                  setValue(
                    'activityStyle',
                    v as PlanWizardValues['activityStyle'],
                    { shouldValidate: true },
                  )
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="games">Classic party games</SelectItem>
                  <SelectItem value="crafts">Crafts station</SelectItem>
                  <SelectItem value="bounce">Bounce / physical play</SelectItem>
                  <SelectItem value="show">Hosted show / performer</SelectItem>
                  <SelectItem value="mixed">Mixed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {step === 9 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="specialNeeds">Accessibility & needs</Label>
                <Textarea
                  id="specialNeeds"
                  placeholder="Sensory-friendly, quiet room, etc."
                  {...register('specialNeeds')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rsvpDeadline">RSVP deadline (optional)</Label>
                <Input id="rsvpDeadline" type="date" {...register('rsvpDeadline')} />
              </div>
            </>
          )}

          {formState.errors.root && (
            <p className="text-destructive text-sm">
              {formState.errors.root.message}
            </p>
          )}

          <div className="flex justify-between gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={step === 0 || formState.isSubmitting}
            >
              Back
            </Button>
            <Button
              type="button"
              onClick={() => void nextStep()}
              disabled={formState.isSubmitting}
            >
              {step === TOTAL_STEPS - 1 ? 'Generate plan' : 'Continue'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
