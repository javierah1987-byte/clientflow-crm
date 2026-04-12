import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

const PLANS = {
  free: { name: 'Free', price: 0, contacts: 100, users: 1, features: ['CRM básico', '100 contactos', '1 usuario'] },
  starter: { name: 'Starter', price: 29, contacts: 1000, users: 3, features: ['1.000 contactos', '3 usuarios', 'Email campaigns', 'Propuestas IA'] },
  pro: { name: 'Pro', price: 79, contacts: 10000, users: 10, features: ['10.000 contactos', '10 usuarios', 'Automatizaciones', 'WhatsApp', 'Facturas'] },
  enterprise: { name: 'Enterprise', price: 199, contacts: -1, users: -1, features: ['Contactos ilimitados', 'Usuarios ilimitados', 'API acceso', 'SLA 99.9%', 'Soporte prioritario'] }
}

export async function GET(req: NextRequest) {
  const ws = req.nextUrl.searchParams.get('workspace_id')
  const { data: sub } = await sb.from('subscriptions').select('*').eq('workspace_id', ws).single()
  return NextResponse.json({ subscription: sub, plans: PLANS })
}

export async function POST(req: NextRequest) {
  const { workspace_id, user_id, plan } = await req.json()
  // In production: create Stripe checkout session here
  // For demo: just update the subscription
  const { data } = await sb.from('subscriptions').upsert({
    workspace_id, user_id, plan,
    status: plan === 'free' ? 'active' : 'trialing',
    monthly_price: PLANS[plan as keyof typeof PLANS]?.price || 0,
    trial_end: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
  }, { onConflict: 'workspace_id' }).select().single()
  return NextResponse.json({ subscription: data, checkout_url: 'https://stripe.com' })
}
