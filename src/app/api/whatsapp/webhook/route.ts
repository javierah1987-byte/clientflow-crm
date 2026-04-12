import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const messages = body.messages || []
    for (const msg of messages) {
      const from = msg.from
      const content = msg.text?.body || '[media]'
      const timestamp = msg.timestamp ? new Date(parseInt(msg.timestamp)*1000).toISOString() : new Date().toISOString()
      const { data: waNum } = await sb.from('whatsapp_numbers').select('workspace_id').single()
      const workspace_id = waNum?.workspace_id
      if (!workspace_id) continue
      let { data: contact } = await sb.from('contacts').select('id').eq('phone', from).eq('workspace_id', workspace_id).single()
      if (!contact) {
        const { data: nc } = await sb.from('contacts').insert({ workspace_id, phone: from, first_name: 'Lead', last_name: from, source: 'whatsapp', status: 'lead' }).select().single()
        contact = nc
      }
      let { data: conv } = await sb.from('wa_conversations').select('id').eq('contact_phone', from).eq('workspace_id', workspace_id).single()
      if (!conv) {
        const { data: nc } = await sb.from('wa_conversations').insert({ workspace_id, contact_id: contact?.id, contact_phone: from, status: 'open', last_message_at: timestamp, unread_count: 1 }).select().single()
        conv = nc
      }
      await sb.from('wa_messages').insert({ workspace_id, conversation_id: conv?.id, direction: 'inbound', type: msg.type||'text', content, status: 'received', sent_at: timestamp })
    }
    return NextResponse.json({ status: 'ok' })
  } catch(e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
export async function PUT(req: NextRequest) {
  const { workspace_id, to, message } = await req.json()
  const { data: waNum } = await sb.from('whatsapp_numbers').select('*').eq('workspace_id', workspace_id).eq('status', 'active').single()
  if (!waNum?.api_key) return NextResponse.json({ error: 'No hay número WhatsApp configurado' }, { status: 400 })
  const res = await fetch('https://waba.360dialog.io/v1/messages', { method: 'POST', headers: { 'D360-API-KEY': waNum.api_key, 'Content-Type': 'application/json' }, body: JSON.stringify({ messaging_product: 'whatsapp', to: to.replace(/[^0-9]/g,''), type: 'text', text: { body: message } }) })
  const data = await res.json()
  return NextResponse.json({ success: res.ok, data })
}
export async function GET() { return NextResponse.json({ status: 'webhook active', platform: 'ClientFlow CRM' }) }
