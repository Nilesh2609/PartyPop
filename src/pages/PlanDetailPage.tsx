import { useAction, useMutation, useQuery } from 'convex/react'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../../convex/_generated/api'
import type { Doc, Id } from '../../convex/_generated/dataModel'
import { BudgetBreakdown } from '@/components/plan/BudgetBreakdown'
import { PlanSummaryMarkdown } from '@/components/plan/PlanSummaryMarkdown'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import {
  ChevronDown,
  ClipboardList,
  Clock,
  ListChecks,
  Pencil,
  ShoppingBasket,
  Store,
  Trash2,
  Users,
} from 'lucide-react'
import {
  formatPartyWeekdayLong,
  parsePlanDate,
  startOfLocalDay,
} from '@/lib/partyCountdown'
import { formatTimelineRange } from '@/lib/timelineLabels'
import { subscriptionTier } from '@/lib/subscription'

/** Card-style panel: contrasts with page canvas like the plan tab bar. */
const PLAN_TAB_PANEL =
  'border-border bg-card overflow-hidden rounded-lg border-[0.5px] shadow-sm'

const ROW_DIVIDE =
  'divide-y divide-[0.5px] divide-[color:var(--brand-row-divider)]'

function isOverdue(dueDate: string, done: boolean): boolean {
  if (done) return false
  const d = parsePlanDate(dueDate)
  if (!d) return false
  return startOfLocalDay(d).getTime() < startOfLocalDay(new Date()).getTime()
}

type PlanBundle = {
  plan: Doc<'partyPlans'>
  tasks: Doc<'planTasks'>[]
  shopping: Doc<'planShoppingItems'>[]
  timeline: Doc<'planTimelineSlots'>[]
}

type LiveVendorRow = {
  externalId: string
  name: string
  rating: number | null
  reviewCount: number | null
  url: string
  priceHint: string | null
  addressSnippet: string | null
}

type LiveByCategory = {
  inflatables: LiveVendorRow[]
  cakes: LiveVendorRow[]
  entertainment: LiveVendorRow[]
}

export function PlanDetailPage() {
  const { planId } = useParams<{ planId: string }>()
  const navigate = useNavigate()
  const id = planId as Id<'partyPlans'> | undefined

  const bundle = useQuery(
    api.partyPlans.getBundle,
    id ? { planId: id } : 'skip',
  )
  const vendors = useQuery(
    api.vendors.shortlistedForPlan,
    id ? { planId: id } : 'skip',
  )
  const guests = useQuery(api.guests.listByPlan, id ? { planId: id } : 'skip')
  const sub = useQuery(api.subscriptions.getMine)

  const updateOverview = useMutation(api.partyPlans.updateOverview)
  const setTaskDone = useMutation(api.partyPlans.setTaskDone)
  const addTask = useMutation(api.partyPlans.addTask)
  const setShoppingDone = useMutation(api.partyPlans.setShoppingDone)
  const addShopping = useMutation(api.partyPlans.addShoppingItem)
  const deletePlan = useMutation(api.partyPlans.deletePlan)
  const addGuest = useMutation(api.guests.addGuest)
  const logVendor = useMutation(api.vendors.logVendorContact)

  if (!id) {
    return <p className="text-destructive text-sm">Invalid plan link.</p>
  }

  if (bundle === undefined) {
    return (
      <p className="text-muted-foreground text-sm">Loading plan…</p>
    )
  }

  if (bundle === null) {
    return (
      <p className="text-muted-foreground text-sm">
        Plan not found.{' '}
        <Link to="/" className="text-primary underline">
          Back to plans
        </Link>
      </p>
    )
  }

  const { plan } = bundle
  const syncKey = `${plan._id}-${plan.status}-${(plan.overviewMarkdown ?? '').length}`

  return (
    <PlanDetailContent
      key={syncKey}
      planId={id}
      bundle={bundle}
      vendors={vendors}
      guests={guests}
      sub={sub}
      updateOverview={updateOverview}
      setTaskDone={setTaskDone}
      addTask={addTask}
      setShoppingDone={setShoppingDone}
      addShopping={addShopping}
      deletePlan={deletePlan}
      navigate={navigate}
      addGuest={addGuest}
      logVendor={logVendor}
    />
  )
}

function PlanDetailContent({
  planId,
  bundle,
  vendors,
  guests,
  sub,
  updateOverview,
  setTaskDone,
  addTask,
  setShoppingDone,
  addShopping,
  deletePlan,
  navigate,
  addGuest,
  logVendor,
}: {
  planId: Id<'partyPlans'>
  bundle: PlanBundle
  vendors:
    | {
        inflatables: Doc<'vendors'>[]
        cakes: Doc<'vendors'>[]
        entertainment: Doc<'vendors'>[]
      }
    | null
    | undefined
  guests: Doc<'guests'>[] | undefined
  sub: Doc<'subscriptions'> | null | undefined
  updateOverview: (args: {
    planId: Id<'partyPlans'>
    title?: string
    overviewMarkdown?: string
    budgetAllocationJson?: string
    budgetCents?: number
    theme?: string
    headcount?: number
    partyDate?: string
    zipCode?: string
    ageRangeMin?: number
    ageRangeMax?: number
    specialNeeds?: string
    venueType?: string
    dietaryNotes?: string
    activityStyle?: string
    childNameOrNickname?: string
    rsvpDeadline?: string
  }) => Promise<unknown>
  setTaskDone: (args: {
    taskId: Id<'planTasks'>
    done: boolean
  }) => Promise<unknown>
  addTask: (args: {
    planId: Id<'partyPlans'>
    title: string
    dueDate?: string
  }) => Promise<unknown>
  setShoppingDone: (args: {
    itemId: Id<'planShoppingItems'>
    done: boolean
  }) => Promise<unknown>
  addShopping: (args: {
    planId: Id<'partyPlans'>
    category: string
    label: string
    quantity?: string
  }) => Promise<unknown>
  deletePlan: (args: { planId: Id<'partyPlans'> }) => Promise<unknown>
  navigate: ReturnType<typeof useNavigate>
  addGuest: (args: {
    planId: Id<'partyPlans'>
    name: string
    rsvpStatus: 'pending' | 'yes' | 'no' | 'maybe'
    notes?: string
  }) => Promise<unknown>
  logVendor: (args: {
    vendorId: Id<'vendors'>
    planId?: Id<'partyPlans'>
  }) => Promise<unknown>
}) {
  const { plan, tasks, shopping, timeline } = bundle
  const tier = subscriptionTier(sub ?? null)
  const partyDateLabel =
    formatPartyWeekdayLong(plan.partyDate) ?? plan.partyDate
  const planDisplayTitle =
    plan.childNameOrNickname?.trim() && plan.childNameOrNickname.trim().length > 0
      ? `${plan.childNameOrNickname.trim()}'s birthday`
      : plan.title

  const [titleEdit, setTitleEdit] = useState(plan.title)
  const [overviewEdit, setOverviewEdit] = useState(plan.overviewMarkdown ?? '')
  const [guestName, setGuestName] = useState('')
  const [planEditorOpen, setPlanEditorOpen] = useState(false)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [detailTitle, setDetailTitle] = useState(plan.title)
  const [detailChildName, setDetailChildName] = useState(
    plan.childNameOrNickname ?? '',
  )
  const [detailTheme, setDetailTheme] = useState(plan.theme)
  const [detailDate, setDetailDate] = useState(plan.partyDate)
  const [detailHeadcount, setDetailHeadcount] = useState(String(plan.headcount))
  const [detailBudgetEuros, setDetailBudgetEuros] = useState(
    String(Math.round(plan.budgetCents / 100)),
  )
  const [detailZipCode, setDetailZipCode] = useState(plan.zipCode)
  const [detailAgeMin, setDetailAgeMin] = useState(String(plan.ageRangeMin))
  const [detailAgeMax, setDetailAgeMax] = useState(String(plan.ageRangeMax))
  const [detailVenueType, setDetailVenueType] = useState(plan.venueType ?? '')
  const [detailDietaryNotes, setDetailDietaryNotes] = useState(
    plan.dietaryNotes ?? '',
  )
  const [detailActivityStyle, setDetailActivityStyle] = useState(
    plan.activityStyle ?? '',
  )
  const [detailSpecialNeeds, setDetailSpecialNeeds] = useState(
    plan.specialNeeds ?? '',
  )
  const [detailRsvpDeadline, setDetailRsvpDeadline] = useState(
    plan.rsvpDeadline ?? '',
  )
  const [savingDetails, setSavingDetails] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const searchLiveVendors = useAction(api.vendorsLive.searchByZip)
  const logExternalVendor = useMutation(api.vendors.logExternalVendorContact)
  const [vendorZipInput, setVendorZipInput] = useState(plan.zipCode)
  const [liveVendors, setLiveVendors] = useState<LiveByCategory | null>(null)
  const [liveSearchLoading, setLiveSearchLoading] = useState(false)
  const [liveSearchError, setLiveSearchError] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      <div className="border-border bg-card space-y-3 rounded-lg border-[0.5px] p-4 shadow-sm md:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={plan.status === 'ready' ? 'default' : 'secondary'}>
              {plan.status}
            </Badge>
            {tier === 'pro' && <Badge variant="outline">Pro</Badge>}
          </div>
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogTrigger
              render={
                <Button variant="destructive" size="sm" disabled={deleting} />
              }
            >
              <Trash2 className="size-4" />
              Delete party
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete this party?</DialogTitle>
                <DialogDescription>
                  This will permanently remove this plan and all related items.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter showCloseButton>
                <Button
                  variant="destructive"
                  disabled={deleting}
                  onClick={() => {
                    setDeleting(true)
                    void deletePlan({ planId })
                      .then(() => {
                        void navigate('/')
                      })
                      .catch((error) => {
                        setDeleting(false)
                        setDeleteDialogOpen(false)
                        console.error('Failed to delete party', error)
                        window.alert('Could not delete party. Please try again.')
                      })
                  }}
                >
                  {deleting ? 'Deleting…' : 'Confirm delete'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <h1 className="text-foreground font-display text-[22px] font-normal tracking-tight">
          {planDisplayTitle}
        </h1>
        <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-sm">
          <span className="border-border bg-background/70 rounded-pill border-[0.5px] px-2.5 py-1">
            {plan.theme}
          </span>
          <span className="border-border bg-background/70 rounded-pill border-[0.5px] px-2.5 py-1">
            {partyDateLabel}
          </span>
          <span className="border-border bg-background/70 rounded-pill border-[0.5px] px-2.5 py-1">
            ~{plan.headcount} guests
          </span>
          <span className="bg-primary/12 text-foreground rounded-pill px-2.5 py-1 font-medium">
            €{(plan.budgetCents / 100).toFixed(0)} budget
          </span>
        </div>
      </div>

      {plan.status === 'generating' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Generating your plan…</CardTitle>
            <p className="text-muted-foreground text-sm">
              This usually takes a few seconds. This page updates automatically.
            </p>
          </CardHeader>
        </Card>
      )}

      {plan.status === 'failed' && plan.generationError && (
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive text-base">
              Generation failed
            </CardTitle>
            <p className="text-muted-foreground text-sm">
              {plan.generationError}
            </p>
          </CardHeader>
        </Card>
      )}

      <Tabs defaultValue="overview">
        <TabsList variant="plan" className="sticky top-0 z-10 mb-2">
          <TabsTrigger value="overview">
            <ClipboardList className="size-4 stroke-[1.5]" aria-hidden />
            Summary
          </TabsTrigger>
          <TabsTrigger value="checklist">
            <ListChecks className="size-4 stroke-[1.5]" aria-hidden />
            To-do
          </TabsTrigger>
          <TabsTrigger value="shopping">
            <ShoppingBasket className="size-4 stroke-[1.5]" aria-hidden />
            Shopping
          </TabsTrigger>
          <TabsTrigger value="timeline">
            <Clock className="size-4 stroke-[1.5]" aria-hidden />
            Schedule
          </TabsTrigger>
          <TabsTrigger value="vendors">
            <Store className="size-4 stroke-[1.5]" aria-hidden />
            Vendors
          </TabsTrigger>
          <TabsTrigger value="guests">
            <Users className="size-4 stroke-[1.5]" aria-hidden />
            Guests
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8 pt-2">
          <BudgetBreakdown
            budgetAllocationJson={plan.budgetAllocationJson}
            budgetCents={plan.budgetCents}
            onSaveBudget={(nextBudgetCents, nextBudgetAllocationJson) =>
              updateOverview({
                planId,
                budgetCents: nextBudgetCents,
                budgetAllocationJson: nextBudgetAllocationJson,
              })
            }
          />

          <section aria-labelledby="plan-summary-heading">
            <div className={cn(PLAN_TAB_PANEL, 'bg-card p-5 md:p-6')}>
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2
                  id="plan-summary-heading"
                  className="text-foreground font-display text-lg font-normal tracking-tight"
                >
                  Plan summary
                </h2>
                <Dialog
                  open={detailsDialogOpen}
                  onOpenChange={(nextOpen) => {
                    setDetailsDialogOpen(nextOpen)
                    if (nextOpen) {
                      setDetailTitle(plan.title)
                      setDetailChildName(plan.childNameOrNickname ?? '')
                      setDetailTheme(plan.theme)
                      setDetailDate(plan.partyDate)
                      setDetailHeadcount(String(plan.headcount))
                      setDetailBudgetEuros(String(Math.round(plan.budgetCents / 100)))
                      setDetailZipCode(plan.zipCode)
                      setDetailAgeMin(String(plan.ageRangeMin))
                      setDetailAgeMax(String(plan.ageRangeMax))
                      setDetailVenueType(plan.venueType ?? '')
                      setDetailDietaryNotes(plan.dietaryNotes ?? '')
                      setDetailActivityStyle(plan.activityStyle ?? '')
                      setDetailSpecialNeeds(plan.specialNeeds ?? '')
                      setDetailRsvpDeadline(plan.rsvpDeadline ?? '')
                    }
                  }}
                >
                  <DialogTrigger render={<Button variant="outline" size="sm" />}>
                    <Pencil className="size-4" />
                    Edit details
                  </DialogTrigger>
                  <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
                  <DialogHeader>
                    <DialogTitle>Edit party details</DialogTitle>
                    <DialogDescription>
                      Update plan summary details for this party.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="detail-title">Plan name</Label>
                      <Input
                        id="detail-title"
                        value={detailTitle}
                        onChange={(e) => setDetailTitle(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="detail-child-name">Birthday kid</Label>
                      <Input
                        id="detail-child-name"
                        value={detailChildName}
                        onChange={(e) => setDetailChildName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="detail-theme">Theme</Label>
                      <Input
                        id="detail-theme"
                        value={detailTheme}
                        onChange={(e) => setDetailTheme(e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor="detail-date">Party date</Label>
                        <Input
                          id="detail-date"
                          type="date"
                          value={detailDate}
                          onChange={(e) => setDetailDate(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="detail-rsvp-deadline">RSVP deadline</Label>
                        <Input
                          id="detail-rsvp-deadline"
                          type="date"
                          value={detailRsvpDeadline}
                          onChange={(e) => setDetailRsvpDeadline(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor="detail-headcount">Guest count</Label>
                        <Input
                          id="detail-headcount"
                          type="number"
                          min={1}
                          value={detailHeadcount}
                          onChange={(e) => setDetailHeadcount(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="detail-budget">Budget (EUR)</Label>
                        <Input
                          id="detail-budget"
                          type="number"
                          min={1}
                          value={detailBudgetEuros}
                          onChange={(e) => setDetailBudgetEuros(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor="detail-zip">Zip code</Label>
                        <Input
                          id="detail-zip"
                          value={detailZipCode}
                          onChange={(e) => setDetailZipCode(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="detail-age-min">Youngest age</Label>
                        <Input
                          id="detail-age-min"
                          type="number"
                          min={1}
                          value={detailAgeMin}
                          onChange={(e) => setDetailAgeMin(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="detail-age-max">Oldest age</Label>
                        <Input
                          id="detail-age-max"
                          type="number"
                          min={1}
                          value={detailAgeMax}
                          onChange={(e) => setDetailAgeMax(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="detail-venue">Venue type</Label>
                      <Input
                        id="detail-venue"
                        value={detailVenueType}
                        onChange={(e) => setDetailVenueType(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="detail-activity">Activity style</Label>
                      <Input
                        id="detail-activity"
                        value={detailActivityStyle}
                        onChange={(e) => setDetailActivityStyle(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="detail-dietary">Dietary notes</Label>
                      <Textarea
                        id="detail-dietary"
                        rows={3}
                        value={detailDietaryNotes}
                        onChange={(e) => setDetailDietaryNotes(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="detail-special-needs">Special needs</Label>
                      <Textarea
                        id="detail-special-needs"
                        rows={3}
                        value={detailSpecialNeeds}
                        onChange={(e) => setDetailSpecialNeeds(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter showCloseButton>
                    <Button
                      disabled={savingDetails}
                      onClick={() => {
                        const nextHeadcount = Number(detailHeadcount)
                        const nextBudgetEuros = Number(detailBudgetEuros)
                        const nextAgeMin = Number(detailAgeMin)
                        const nextAgeMax = Number(detailAgeMax)
                        if (
                          !Number.isFinite(nextHeadcount) ||
                          nextHeadcount < 1 ||
                          !Number.isFinite(nextBudgetEuros) ||
                          nextBudgetEuros < 1 ||
                          !Number.isFinite(nextAgeMin) ||
                          !Number.isFinite(nextAgeMax) ||
                          nextAgeMin < 1 ||
                          nextAgeMax < 1 ||
                          nextAgeMin > nextAgeMax
                        ) {
                          window.alert('Please check guest count, budget, and age range.')
                          return
                        }
                        setSavingDetails(true)
                        void updateOverview({
                          planId,
                          title: detailTitle.trim() || plan.title,
                          childNameOrNickname: detailChildName.trim() || undefined,
                          theme: detailTheme.trim() || plan.theme,
                          partyDate: detailDate || plan.partyDate,
                          rsvpDeadline: detailRsvpDeadline || undefined,
                          headcount: Math.round(nextHeadcount),
                          budgetCents: Math.round(nextBudgetEuros * 100),
                          zipCode: detailZipCode.trim() || plan.zipCode,
                          ageRangeMin: Math.round(nextAgeMin),
                          ageRangeMax: Math.round(nextAgeMax),
                          venueType: detailVenueType.trim() || undefined,
                          dietaryNotes: detailDietaryNotes.trim() || undefined,
                          activityStyle: detailActivityStyle.trim() || undefined,
                          specialNeeds: detailSpecialNeeds.trim() || undefined,
                        })
                          .then(() => {
                            setSavingDetails(false)
                            setDetailsDialogOpen(false)
                          })
                          .catch((error) => {
                            setSavingDetails(false)
                            console.error('Failed to update party details', error)
                            window.alert('Could not save party details. Please try again.')
                          })
                      }}
                    >
                      {savingDetails ? 'Saving…' : 'Save changes'}
                    </Button>
                  </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <PlanSummaryMarkdown markdown={overviewEdit} />
            </div>
          </section>

          <div className={PLAN_TAB_PANEL}>
            <button
              type="button"
              onClick={() => setPlanEditorOpen((o) => !o)}
              className="text-muted-foreground hover:text-foreground flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium transition-colors"
              aria-expanded={planEditorOpen}
            >
              <ChevronDown
                className={cn(
                  'text-muted-foreground size-4 shrink-0 stroke-[1.5] transition-transform duration-200 ease-out',
                  planEditorOpen && 'rotate-180',
                )}
                aria-hidden
              />
              Edit plan name &amp; notes
            </button>
            {planEditorOpen ? (
              <div className="border-border space-y-4 border-t border-[0.5px] px-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Plan name</Label>
                  <Input
                    id="title"
                    value={titleEdit}
                    onChange={(e) => setTitleEdit(e.target.value)}
                    onBlur={() =>
                      void updateOverview({
                        planId,
                        title: titleEdit || plan.title,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="overview">
                    Notes{' '}
                    <span className="text-muted-foreground font-normal">
                      (headings, lists, bold)
                    </span>
                  </Label>
                  <Textarea
                    id="overview"
                    rows={10}
                    value={overviewEdit}
                    onChange={(e) => setOverviewEdit(e.target.value)}
                    onBlur={() =>
                      void updateOverview({
                        planId,
                        overviewMarkdown: overviewEdit,
                      })
                    }
                    className="font-mono text-xs md:text-sm"
                  />
                </div>
              </div>
            ) : null}
          </div>
        </TabsContent>

        <TabsContent value="checklist" className="pt-2">
          <div className={PLAN_TAB_PANEL}>
            <ul className={ROW_DIVIDE}>
              {tasks.length === 0 ? (
                <li className="text-muted-foreground px-4 py-10 text-center text-sm md:px-5">
                  Nothing here yet — add your first task below.
                </li>
              ) : (
                tasks.map((t: Doc<'planTasks'>) => (
                  <li
                    key={t._id}
                    className="hover:bg-muted/35 flex gap-4 px-4 py-3.5 transition-colors md:px-5"
                  >
                    <div className="flex w-5 shrink-0 justify-center pt-[3px]">
                      <Checkbox
                        checked={t.done}
                        onCheckedChange={(c) =>
                          void setTaskDone({ taskId: t._id, done: Boolean(c) })
                        }
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          'text-sm leading-snug font-medium task-complete',
                          t.done && 'text-muted-foreground line-through',
                        )}
                      >
                        {t.title}
                      </p>
                      {t.dueDate ? (
                        <p
                          className={cn(
                            'mt-1 text-[10px] leading-normal',
                            isOverdue(t.dueDate, t.done)
                              ? 'text-primary font-medium'
                              : 'text-muted-foreground',
                          )}
                        >
                          {t.dueDate}
                        </p>
                      ) : null}
                    </div>
                  </li>
                ))
              )}
            </ul>
            <div className="border-border bg-muted/25 border-t border-[0.5px] p-4 md:px-5 md:py-4">
              <AddTaskForm onAdd={(title) => void addTask({ planId, title })} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="shopping" className="pt-2">
          <div className={PLAN_TAB_PANEL}>
            <ul className={ROW_DIVIDE}>
              {shopping.length === 0 ? (
                <li className="text-muted-foreground px-4 py-10 text-center text-sm md:px-5">
                  No shopping items yet — add what you need below.
                </li>
              ) : (
                shopping.map((s: Doc<'planShoppingItems'>) => (
                  <li
                    key={s._id}
                    className="hover:bg-muted/35 flex gap-4 px-4 py-3.5 transition-colors md:px-5"
                  >
                    <div className="flex w-5 shrink-0 justify-center pt-[3px]">
                      <Checkbox
                        checked={s.done}
                        onCheckedChange={(c) =>
                          void setShoppingDone({
                            itemId: s._id,
                            done: Boolean(c),
                          })
                        }
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          'text-sm leading-snug font-medium task-complete',
                          s.done && 'text-muted-foreground line-through',
                        )}
                      >
                        {s.label}
                      </p>
                      <p className="text-muted-foreground mt-1 text-xs leading-normal">
                        {s.category}
                        {s.quantity ? ` · ${s.quantity}` : ''}
                      </p>
                    </div>
                  </li>
                ))
              )}
            </ul>
            <div className="border-border bg-muted/25 border-t border-[0.5px] p-4 md:px-5 md:py-4">
              <AddShoppingForm
                onAdd={(category, label) =>
                  void addShopping({ planId, category, label })
                }
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="timeline" className="pt-2">
          <div className={PLAN_TAB_PANEL}>
            <ul className={ROW_DIVIDE}>
              {timeline.length === 0 ? (
                <li className="text-muted-foreground px-4 py-10 text-center text-sm md:px-5">
                  Your day-of schedule will show here once the plan is ready.
                </li>
              ) : (
                timeline.map((s: Doc<'planTimelineSlots'>) => (
                  <li
                    key={s._id}
                    className="hover:bg-muted/35 px-4 py-3.5 transition-colors md:px-5"
                  >
                    <p className="text-primary text-xs font-medium leading-snug">
                      {formatTimelineRange(s.startTime, s.endTime)}
                    </p>
                    <p className="text-foreground mt-1 text-sm leading-snug">
                      {s.label}
                    </p>
                  </li>
                ))
              )}
            </ul>
          </div>
        </TabsContent>

        <TabsContent value="vendors" className="pt-2">
          <div className={cn(PLAN_TAB_PANEL, 'space-y-6 p-4 md:p-5')}>
            <div className="space-y-3">
              <p className="text-muted-foreground text-sm leading-relaxed">
                Enter your ZIP or postal code to load real nearby businesses
                (Yelp). Demo suggestions stay available below until you search.
              </p>
              <div className="flex flex-wrap items-end gap-2">
                <div className="space-y-1.5">
                  <Label htmlFor="vendor-zip">ZIP / postal code</Label>
                  <Input
                    id="vendor-zip"
                    inputMode="numeric"
                    autoComplete="postal-code"
                    maxLength={12}
                    className="w-40"
                    value={vendorZipInput}
                    onChange={(e) => setVendorZipInput(e.target.value)}
                  />
                </div>
                <Button
                  type="button"
                  disabled={liveSearchLoading}
                  onClick={() => {
                    setLiveSearchLoading(true)
                    setLiveSearchError(null)
                    void (async () => {
                      try {
                        const result = await searchLiveVendors({
                          zipCode: vendorZipInput.trim(),
                        })
                        if (result.ok === false) {
                          setLiveVendors(null)
                          setLiveSearchError(result.error)
                          return
                        }
                        setLiveVendors({
                          inflatables: result.inflatables,
                          cakes: result.cakes,
                          entertainment: result.entertainment,
                        })
                        if (vendorZipInput.trim() !== plan.zipCode) {
                          void updateOverview({
                            planId,
                            zipCode: vendorZipInput.trim(),
                          })
                        }
                      } catch (e) {
                        setLiveVendors(null)
                        setLiveSearchError(
                          e instanceof Error ? e.message : 'Search failed',
                        )
                      } finally {
                        setLiveSearchLoading(false)
                      }
                    })()
                  }}
                >
                  {liveSearchLoading ? 'Searching…' : 'Search nearby'}
                </Button>
                {liveVendors ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setLiveVendors(null)
                      setLiveSearchError(null)
                    }}
                  >
                    Show demo only
                  </Button>
                ) : null}
              </div>
              {liveSearchError ? (
                <p className="text-destructive text-sm">{liveSearchError}</p>
              ) : null}
            </div>

            {liveVendors ? (
              <>
                <p className="text-muted-foreground text-sm">
                  Live results near{' '}
                  <span className="text-foreground font-medium">
                    {vendorZipInput.trim()}
                  </span>
                  . Opens Yelp in a new tab.
                </p>
                {(['inflatables', 'cakes', 'entertainment'] as const).map(
                  (cat, i) => (
                    <div
                      key={cat}
                      className={
                        i > 0
                          ? 'border-border border-t border-[0.5px] pt-6'
                          : undefined
                      }
                    >
                      <h3 className="text-foreground font-display mb-3 text-lg font-normal capitalize tracking-tight">
                        {cat}
                      </h3>
                      {liveVendors[cat].length === 0 ? (
                        <p className="text-muted-foreground text-sm">
                          No matches in this category for this area.
                        </p>
                      ) : (
                        <div className="grid gap-3 sm:grid-cols-2">
                          {liveVendors[cat].map((row: LiveVendorRow) => (
                            <div
                              key={row.externalId}
                              className="border-border bg-background/80 rounded-lg border-[0.5px] p-4 shadow-none"
                            >
                              <p className="text-foreground text-base font-medium leading-snug">
                                {row.name}
                              </p>
                              <p className="text-muted-foreground mt-1 text-xs">
                                {row.rating != null ? `★ ${row.rating}` : '—'}
                                {row.reviewCount != null
                                  ? ` · ${row.reviewCount} reviews`
                                  : ''}
                                {row.priceHint
                                  ? ` · ${row.priceHint}`
                                  : ''}
                              </p>
                              {row.addressSnippet ? (
                                <p className="text-foreground/90 mt-2 text-sm leading-relaxed">
                                  {row.addressSnippet}
                                </p>
                              ) : null}
                              <a
                                href={row.url}
                                target="_blank"
                                rel="noreferrer"
                                className={cn(
                                  buttonVariants({
                                    variant: 'outline',
                                    size: 'sm',
                                  }),
                                  'mt-3 inline-flex',
                                )}
                                onClick={() =>
                                  void logExternalVendor({
                                    planId,
                                    category: cat,
                                    businessName: row.name,
                                    url: row.url,
                                  })
                                }
                              >
                                View on Yelp
                              </a>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ),
                )}
                <p className="text-muted-foreground text-center text-[11px]">
                  <a
                    href="https://www.yelp.com"
                    target="_blank"
                    rel="noreferrer"
                    className="underline underline-offset-2"
                  >
                    Powered by Yelp
                  </a>
                </p>
              </>
            ) : null}

            {!liveVendors ? (
              <>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Demo catalog (sample data). Indicative pricing only — tap
                  through to contact vendors. We log when you open a link.
                </p>
                {vendors === undefined && (
                  <p className="text-muted-foreground text-sm">
                    Loading vendors…
                  </p>
                )}
                {vendors &&
                  (['inflatables', 'cakes', 'entertainment'] as const).map(
                    (cat, i) => (
                      <div
                        key={cat}
                        className={
                          i > 0
                            ? 'border-border border-t border-[0.5px] pt-6'
                            : undefined
                        }
                      >
                        <h3 className="text-foreground font-display mb-3 text-lg font-normal capitalize tracking-tight">
                          {cat}
                        </h3>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {vendors[cat].map((v: Doc<'vendors'>) => (
                            <div
                              key={v._id}
                              className="border-border bg-background/80 rounded-lg border-[0.5px] p-4 shadow-none"
                            >
                              <p className="text-foreground text-base font-medium leading-snug">
                                {v.name}
                              </p>
                              <p className="text-muted-foreground mt-1 text-xs">
                                Reliability {v.reliabilityScore}
                                {v.rating != null ? ` · ★ ${v.rating}` : ''} ·{' '}
                                {v.priceBand}
                              </p>
                              {v.indicativePriceNote ? (
                                <p className="text-foreground/90 mt-2 text-sm leading-relaxed">
                                  {v.indicativePriceNote}
                                </p>
                              ) : null}
                              <a
                                href={v.contactUrl}
                                target="_blank"
                                rel="noreferrer"
                                className={cn(
                                  buttonVariants({
                                    variant: 'outline',
                                    size: 'sm',
                                  }),
                                  'mt-3 inline-flex',
                                )}
                                onClick={() =>
                                  void logVendor({ vendorId: v._id, planId })
                                }
                              >
                                Contact / book
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    ),
                  )}
              </>
            ) : null}
          </div>
        </TabsContent>

        <TabsContent value="guests" className="pt-2">
          <div className={PLAN_TAB_PANEL}>
            <form
              className="border-border bg-muted/20 flex flex-wrap items-end gap-2 border-b border-[0.5px] p-4 md:px-5"
              onSubmit={(e) => {
                e.preventDefault()
                if (!guestName.trim()) return
                void addGuest({
                  planId,
                  name: guestName.trim(),
                  rsvpStatus: 'pending',
                }).then(() => setGuestName(''))
              }}
            >
              <div className="min-w-0 flex-1 sm:max-w-xs">
                <Label htmlFor="guestName" className="sr-only">
                  Guest name
                </Label>
                <Input
                  id="guestName"
                  placeholder="Guest name"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                />
              </div>
              <Button type="submit">Add guest</Button>
            </form>
            <ul className={ROW_DIVIDE}>
              {guests === undefined ? (
                <li className="text-muted-foreground px-4 py-6 text-sm md:px-5">
                  Loading guests…
                </li>
              ) : guests.length === 0 ? (
                <li className="text-muted-foreground px-4 py-10 text-center text-sm md:px-5">
                  No guests yet — add names as you hear back.
                </li>
              ) : (
                guests.map((g: Doc<'guests'>) => (
                  <li
                    key={g._id}
                    className="hover:bg-muted/35 flex items-center justify-between gap-3 px-4 py-3.5 transition-colors md:px-5"
                  >
                    <span className="text-sm font-medium">{g.name}</span>
                    <Badge variant="outline">{g.rsvpStatus}</Badge>
                  </li>
                ))
              )}
            </ul>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function AddTaskForm({ onAdd }: { onAdd: (title: string) => void }) {
  const [v, setV] = useState('')
  return (
    <form
      className="flex flex-wrap gap-2"
      onSubmit={(e) => {
        e.preventDefault()
        if (!v.trim()) return
        onAdd(v.trim())
        setV('')
      }}
    >
      <Input
        placeholder="New task"
        value={v}
        onChange={(e) => setV(e.target.value)}
        className="max-w-md"
      />
      <Button type="submit">Add task</Button>
    </form>
  )
}

function AddShoppingForm({
  onAdd,
}: {
  onAdd: (category: string, label: string) => void
}) {
  const [cat, setCat] = useState('supplies')
  const [label, setLabel] = useState('')
  return (
    <form
      className="flex flex-wrap gap-2"
      onSubmit={(e) => {
        e.preventDefault()
        if (!label.trim()) return
        onAdd(cat, label.trim())
        setLabel('')
      }}
    >
      <Input
        placeholder="Category"
        value={cat}
        onChange={(e) => setCat(e.target.value)}
        className="max-w-[140px]"
      />
      <Input
        placeholder="Item"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        className="max-w-md"
      />
      <Button type="submit">Add item</Button>
    </form>
  )
}
