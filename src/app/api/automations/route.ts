import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export async function GET(req: NextRequest) {
  const ws = req.nextUrl.searchParams.get('workspace_id')
  if (!ws) return NextResponse.json({ error: 'workspace_id required' }, { status: 400 })
  const { data } = await sb.from('automations').select('*').eq('workspace_id', ws).order('created_at', { ascending: false })
  const { data: logs } = await sb.from('automation_logs').select('*').eq('workspace_id', ws).order('executed_at', { ascending: false }).limit(20)
  return NextResponse.json({ automations: data || [], logs: logs || [] })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { data } = await sb.from('automations').insert({
    workspace_id: body.workspace_id,
    name: body.name,
    description: body.description,
    trigger_type: body.trigger_type,
    trigger_config: body.trigger_config || {},
    nodes: body.nodes || [],
    status: 'active'
  }).select().single()
  return NextResponse.json({ automation: data })
}

export async function PATCH(req: NextRequest) {
  const { id, status } = await req.json()
  const { data } = await sb.from('automations').update({ status }).eq('id', id).select().single()
  return NextResponse.json({ automation: data })
}

// Webhook trigger - called when contacts/deals/proposals change
export async function PUT(req: NextRequest) {
  const { workspace_id, trigger_type, trigger_data } = await req.json()
  
  // Get active automations for this trigger
  const { data: autos } = await sb.from('automations').select('*')
    .eq('workspace_id', workspace_id)
    .eq('trigger_type', trigger_type)
    .eq('status', 'active')
  
  if (!autos?.length) return NextResponse.json({ triggered: 0 })
  
  let triggered = 0
  for (const auto of autos) {
    try {
      const nodes = auto.nodes || []
      for (const node of nodes) {
        if (node.type === 'send_email' && trigger_data.email) {
          await fetch(process.env.NEXT_PUBLIC_APP_URL + '/api/email/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              workspace_id,
              subject: (node.config?.subject || '').replace('{{first_name}}', trigger_data.first_name || ''),
              html_content: '<p>Hola ' + (trigger_data.first_name || '') + ',</p><p>Gracias por tu interés. Nos pondremos en contacto contigo pronto.</p>',
            })
          })
        }
      }
      
      await sb.from('automation_logs').insert({
        automation_id: auto.id,
        workspace_id,
        trigger_data,
        actions_executed: nodes,
        status: 'success'
      })
      
      await sb.from('automations').update({ 
        run_count: (auto.run_count || 0) + 1,
        last_run_at: new Date().toISOString()
      }).eq('id', auto.id)
      
      triggered++
    } catch(e) {
      await sb.from('automation_logs').insert({
        automation_id: auto.id, workspace_id, trigger_data,
        status: 'error', error_message: String(e)
      })
    }
  }
  
  return NextResponse.json({ triggered })
}
