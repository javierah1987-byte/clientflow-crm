import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { workspace_id, contact_id, items, notes, due_days = 30 } = body
    
    const subtotal = items.reduce((s: number, i: any) => s + (i.quantity * i.price), 0)
    const tax = subtotal * 0.21
    const total = subtotal + tax

    // Generate invoice number
    const { count } = await supabase.from('invoices').select('id', { count: 'exact' }).eq('workspace_id', workspace_id)
    const invoiceNumber = 'INV-' + String((count || 0) + 1).padStart(4, '0')

    const { data: invoice } = await supabase.from('invoices').insert({
      workspace_id,
      contact_id: contact_id || null,
      invoice_number: invoiceNumber,
      status: 'draft',
      subtotal,
      tax_amount: tax,
      total_amount: total,
      currency: 'EUR',
      notes,
      issue_date: new Date().toISOString(),
      due_date: new Date(Date.now() + due_days * 24 * 60 * 60 * 1000).toISOString(),
      items
    }).select().single()

    return NextResponse.json({ success: true, invoice })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const workspace_id = searchParams.get('workspace_id')
  if (!workspace_id) return NextResponse.json({ error: 'workspace_id required' }, { status: 400 })
  const { data } = await supabase.from('invoices')
    .select('*,contact:contacts(first_name,last_name,email)')
    .eq('workspace_id', workspace_id)
    .order('created_at', { ascending: false })
  return NextResponse.json({ invoices: data || [] })
}

export async function PATCH(req: NextRequest) {
  const { id, status } = await req.json()
  const { data } = await supabase.from('invoices').update({ 
    status,
    paid_at: status === 'paid' ? new Date().toISOString() : null
  }).eq('id', id).select().single()
  return NextResponse.json({ invoice: data })
}