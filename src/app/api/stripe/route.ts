import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const PLANS: Record<string, {name:string,price:number}> = {
  free: { name: 'Free', price: 0 },
  starter: { name: 'Starter', price: 29 },
  pro: { name: 'Pro', price: 79 },
  enterprise: { name: 'Enterprise', price: 199 },
}

// GET - Get current subscription and available plans
export async function GET(req: NextRequest) {
  const ws = req.nextUrl.searchParams.get('workspace_id')
  const { data: sub } = await sb.from('subscriptions').select('*').eq('workspace_id', ws).single()
  return NextResponse.json({ subscription: sub, plans: PLANS })
}

// POST - Create Stripe checkout session (requires STRIPE_SECRET_KEY)
export async function POST(req: NextRequest) {
  try {
    const { plan, workspace_id, user_id, success_url, cancel_url } = await req.json()

    if (!process.env.STRIPE_SECRET_KEY) {
      // Demo mode - just update the subscription in Supabase
      const { data } = await sb.from('subscriptions').upsert({
        workspace_id, user_id, plan,
        status: plan === 'free' ? 'active' : 'trialing',
        monthly_price: PLANS[plan]?.price || 0,
        trial_end: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
      }, { onConflict: 'workspace_id' }).select().single()
      
      return NextResponse.json({ 
        subscription: data,
        demo: true,
        message: 'Para pagos reales añade STRIPE_SECRET_KEY en Vercel → Settings → Environment Variables',
        checkout_url: null
      })
    }

    // Create Stripe checkout session via Stripe API (no npm package needed)
    const params = new URLSearchParams({
      mode: 'subscription',
      'line_items[0][price]': process.env['STRIPE_PRICE_' + plan.toUpperCase()] || '',
      'line_items[0][quantity]': '1',
      success_url: success_url || (process.env.NEXTAUTH_URL || 'https://clientflow-crm-phi.vercel.app') + '?plan_success=1',
      cancel_url: cancel_url || (process.env.NEXTAUTH_URL || 'https://clientflow-crm-phi.vercel.app'),
      'metadata[workspace_id]': workspace_id,
      'metadata[user_id]': user_id || '',
      'metadata[plan]': plan,
      locale: 'es',
      allow_promotion_codes: 'true',
    })

    const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + process.env.STRIPE_SECRET_KEY,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString()
    })

    const session = await res.json()
    
    if (!res.ok) {
      return NextResponse.json({ error: session.error?.message || 'Stripe error' }, { status: 500 })
    }

    return NextResponse.json({ checkout_url: session.url, session_id: session.id })
    
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT - Handle Stripe webhook events
export async function PUT(req: NextRequest) {
  try {
    const body = await req.text()
    const sig = req.headers.get('stripe-signature')
    
    // Parse the event (in production, verify signature with STRIPE_WEBHOOK_SECRET)
    let event: any
    try {
      event = JSON.parse(body)
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }
    
    if (event.type === 'checkout.session.completed') {
      const session = event.data?.object
      const { workspace_id, plan } = session?.metadata || {}
      
      if (workspace_id && plan) {
        await sb.from('subscriptions').upsert({
          workspace_id,
          stripe_customer_id: session.customer,
          stripe_subscription_id: session.subscription,
          plan, status: 'active',
          monthly_price: PLANS[plan]?.price || 0,
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        }, { onConflict: 'workspace_id' })
      }
    }
    
    if (event.type === 'customer.subscription.deleted') {
      const sub = event.data?.object
      if (sub?.id) {
        await sb.from('subscriptions').update({ status: 'cancelled', plan: 'free' })
          .eq('stripe_subscription_id', sub.id)
      }
    }
    
    return NextResponse.json({ received: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
