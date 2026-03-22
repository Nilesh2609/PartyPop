import { useMutation, useQuery } from 'convex/react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import {
  ChevronDown,
  ClipboardList,
  Clock,
  ListChecks,
  ShoppingBasket,
  Store,
  Users,
} from 'lucide-react'
import {
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

export function PlanDetailPage() {
  const { planId } = useParams<{ planId: string }>()
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
        <Link to="/plans" className="text-primary underline">
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

  const [titleEdit, setTitleEdit] = useState(plan.title)
  const [overviewEdit, setOverviewEdit] = useState(plan.overviewMarkdown ?? '')
  const [guestName, setGuestName] = useState('')
  const [planEditorOpen, setPlanEditorOpen] = useState(false)

  return (
    <div className="space-y-6">
      <div className="border-border bg-card space-y-2 rounded-lg border-[0.5px] p-4 shadow-sm md:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={plan.status === 'ready' ? 'default' : 'secondary'}>
            {plan.status}
          </Badge>
          {tier === 'pro' && <Badge variant="outline">Pro</Badge>}
        </div>
        <h1 className="text-foreground font-display text-[22px] font-normal tracking-tight">
          {plan.title}
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {plan.theme} · {plan.partyDate} · ~{plan.headcount} guests · €
          {(plan.budgetCents / 100).toFixed(0)} budget
        </p>
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
          />

          <section className="space-y-3" aria-labelledby="plan-summary-heading">
            <h2
              id="plan-summary-heading"
              className="text-foreground font-display text-lg font-normal tracking-tight"
            >
              Plan summary
            </h2>
            <div className={cn(PLAN_TAB_PANEL, 'p-4 md:p-5')}>
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
            <p className="text-muted-foreground text-sm leading-relaxed">
              Indicative pricing only — tap through to contact vendors. We log
              when you open a link to improve recommendations later.
            </p>
            {vendors === undefined && (
              <p className="text-muted-foreground text-sm">Loading vendors…</p>
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
