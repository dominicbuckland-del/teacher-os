import Stripe from 'stripe'
import { getAdminClient } from '@/lib/supabase/admin'
import { headers } from 'next/headers'

export async function POST(request: Request) {
  const stripeKey = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!stripeKey || !webhookSecret) {
    return Response.json({ error: 'Not configured' }, { status: 503 })
  }

  const stripe = new Stripe(stripeKey)
  const body = await request.text()
  const headersList = await headers()
  const sig = headersList.get('stripe-signature')

  if (!sig) {
    return Response.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch {
    return Response.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const admin = getAdminClient()
  if (!admin) {
    // Can't process without admin client, but acknowledge receipt so Stripe doesn't retry
    console.error('SUPABASE_SERVICE_ROLE_KEY not set — webhook events cannot update subscription status')
    return Response.json({ received: true })
  }

  const getUidForCustomer = async (customerId: string): Promise<string | null> => {
    const { data } = await admin
      .from('profiles')
      .select('id')
      .eq('stripe_customer_id', customerId)
      .single()
    return data?.id ?? null
  }

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      const uid = await getUidForCustomer(sub.customer as string)
      if (uid) {
        const isActive = sub.status === 'active' || sub.status === 'trialing'
        const periodEnd = sub.items?.data?.[0]?.current_period_end
        await admin.from('profiles').upsert({
          id: uid,
          stripe_subscription_id: sub.id,
          subscription_status: isActive ? 'active' : sub.status,
          subscription_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
          updated_at: new Date().toISOString(),
        })
      }
      break
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      const uid = await getUidForCustomer(sub.customer as string)
      if (uid) {
        await admin.from('profiles').update({
          subscription_status: 'canceled',
          stripe_subscription_id: null,
          subscription_period_end: null,
          updated_at: new Date().toISOString(),
        }).eq('id', uid)
      }
      break
    }
    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      const uid = await getUidForCustomer(invoice.customer as string)
      if (uid) {
        await admin.from('profiles').update({
          subscription_status: 'past_due',
          updated_at: new Date().toISOString(),
        }).eq('id', uid)
      }
      break
    }
  }

  return Response.json({ received: true })
}
