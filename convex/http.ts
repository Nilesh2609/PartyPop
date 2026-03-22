import { httpRouter } from 'convex/server'
import { internal } from './_generated/api'
import { httpAction } from './_generated/server'

const http = httpRouter()

http.route({
  path: '/stripe/webhook',
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
    const signature = request.headers.get('stripe-signature')
    if (!signature) {
      return new Response('Missing stripe-signature', { status: 400 })
    }
    const rawBody = await request.text()
    await ctx.runAction(internal.stripeNode.ingestWebhook, {
      rawBody,
      signature,
    })
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }),
})

export default http
