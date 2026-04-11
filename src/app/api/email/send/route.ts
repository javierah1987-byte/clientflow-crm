import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { campaign_id, workspace_id, subject, html_content, text_content, from_email, from_name, recipient_ids } = await req.json()

    if (!process.env.SENDGRID_API_KEY) {
      return NextResponse.json({ error: 'SendGrid API key not configured' }, { status: 500 })
    }

    // Get recipients
    let recipients = []
    if (recipient_ids && recipient_ids.length > 0) {
      const { data } = await supabase.from('contacts')
        .select('email, first_name, last_name')
        .in('id', recipient_ids)
        .not('email', 'is', null)
      recipients = data || []
    } else {
      const { data } = await supabase.from('contacts')
        .select('email, first_name, last_name')
        .eq('workspace_id', workspace_id)
        .not('email', 'is', null)
      recipients = data || []
    }

    if (!recipients.length) {
      return NextResponse.json({ error: 'No recipients with email found' }, { status: 400 })
    }

    // Send via SendGrid
    const personalizations = recipients.map((r: any) => ({
      to: [{ email: r.email, name: r.first_name + ' ' + r.last_name }],
      substitutions: {
        '{{first_name}}': r.first_name || '',
        '{{last_name}}': r.last_name || '',
      }
    }))

    const sgPayload = {
      personalizations,
      from: { email: from_email || 'noreply@clientflow.io', name: from_name || 'ClientFlow CRM' },
      subject,
      content: [
        { type: 'text/plain', value: text_content || subject },
        { type: 'text/html', value: html_content }
      ]
    }

    const sgRes = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + process.env.SENDGRID_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(sgPayload)
    })

    if (!sgRes.ok) {
      const err = await sgRes.text()
      return NextResponse.json({ error: 'SendGrid error: ' + err }, { status: 500 })
    }

    // Update campaign status in Supabase
    if (campaign_id) {
      await supabase.from('email_campaigns').update({
        status: 'sent',
        sent_at: new Date().toISOString(),
        recipients_count: recipients.length
      }).eq('id', campaign_id)
    }

    return NextResponse.json({ 
      success: true, 
      sent_to: recipients.length,
      message: 'Email enviado a ' + recipients.length + ' contactos'
    })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const workspace_id = searchParams.get('workspace_id')
  if (!workspace_id) return NextResponse.json({ error: 'workspace_id required' }, { status: 400 })
  const { data } = await supabase.from('email_campaigns')
    .select('*').eq('workspace_id', workspace_id).order('created_at', { ascending: false })
  return NextResponse.json({ campaigns: data || [] })
}
