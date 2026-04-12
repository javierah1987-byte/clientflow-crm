import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

const PRICE_IDS: Record<string, string> = {
  starter_monthly: process.env.STRIPE_PRICE_STARTER || 'price_starter',
  pro_monthly: process.env.STRIPE_PRICE_PRO || 'price_pro',
  enterprise_monthly: process.env.STRIPE_PRICE_ENTERPRISE || 'price_enterprise',
}

export async function POST(req: NextRequest) {
  try {
    const { plan, workspace_id, user_id, success_url, cancel_url } = await req.json()

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ 
        error: 'Stripe no configurado',
        demo: true,
        message: 'Añade STRIPE_SECRET_KEY en Vercel → Settings → Environment Variables',
        checkout_url: null
      }, { status: 200 })
    }

    // Create Stripe checkout session
    const stripe = await import('stripe').then(m => new m.default(process.env.STRIPE_SECRET_KEY!))
    
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card', 'sepa_debit'],
      line_items: [{ price: PRICE_IDS[plan + '_monthly'], quantity: 1 }],
      success_url: success_url || process.env.NEXTAUTH_URL + '/settings/billing?success=1',
      cancel_url: cancel_url || process.env.NEXTAUTH_URL + '/settings/billing?cancelled=1',
      metadata: { workspace_id, user_id, plan },
      locale: 'es',
      allow_promotion_codes: true,
    })

    return NextResponse.json({ checkout_url: session.url, session_id: session.id })
  } catch(e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// Stripe Webhook
export async function PUT(req: NextRequest) {
  const sig = req.headers.get('stripe-signature')!
  const body = await req.text()
  
  try {
    const stripe = await import('stripe').then(m => new m.default(process.env.STRIPE_SECRET_KEY!))
    const event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
    
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any
      const { workspace_id, plan } = session.metadata
      
      await sb.from('subscriptions').upsert({
        workspace_id,
        stripe_customer_id: session.customer,
        stripe_subscription_id: session.subscription,
        plan, status: 'active',
        monthly_price: { starter: 29, pro: 79, enterprise: 199 }[plan] || 0,
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      }, { onConflict: 'workspace_id' })
    }
    
    if (event.type === 'customer.subscription.deleted') {
      const sub = event.data.object as any
      await sb.from('subscriptions').update({ status: 'cancelled', plan: 'free' })
        .eq('stripe_subscription_id', sub.id)
    }
    
    return NextResponse.json({ received: true })
  } catch(e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
}
