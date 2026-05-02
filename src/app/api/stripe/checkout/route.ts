import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  const stripeKey = process.env.STRIPE_SECRET_KEY
  if (!stripeKey) {
    return Response.json({ error: 'Stripe not configured' }, { status: 503 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return Response.json({ error: 'Unauthenticated' }, { status: 401 })
  }

  const { priceId } = await request.json() as { priceId: string }
  if (!priceId) {
    return Response.json({ error: 'priceId required' }, { status: 400 })
  }

  const stripe = new Stripe(stripeKey)
  const admin = getAdminClient()
  const origin = request.headers.get('origin') || 'https://teacher-os-three.vercel.app'

  // Get or create Stripe customer
  let customerId: string | undefined
  if (admin) {
    const { data: profile } = await admin
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single()

    if (profile?.stripe_customer_id) {
      customerId = profile.stripe_customer_id
    }
  }

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { supabase_uid: user.id },
    })
    customerId = customer.id

    if (admin) {
      await admin
        .from('profiles')
        .upsert({ id: user.id, stripe_customer_id: customerId, updated_at: new Date().toISOString() })
    }
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    success_url: `${origin}/billing?success=true`,
    cancel_url: `${origin}/billing?canceled=true`,
    allow_promotion_codes: true,
    billing_address_collection: 'auto',
    metadata: { supabase_uid: user.id },
  })

  return Response.json({ url: session.url })
}
