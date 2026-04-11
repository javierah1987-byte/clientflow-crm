import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { campaign_id, workspace_id, subject, html_content, text_content, from_email, from_name } = await req.json()

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: 'RESEND_API_KEY not configured. Añádela en Vercel → Settings → Environment Variables' }, { status: 500 })
    }

    // Get all contacts with email from workspace
    const { data: contacts } = await supabase
      .from('contacts')
      .select('email, first_name, last_name')
      .eq('workspace_id', workspace_id)
      .not('email', 'is', null)
      .neq('email', '')

    const recipients = contacts || []

    if (!recipients.length) {
      return NextResponse.json({ error: 'No hay contactos con email en este workspace' }, { status: 400 })
    }

    let sent = 0
    let errors = 0

    // Send to each contact individually for personalization
    for (const contact of recipients) {
      const personalizedHtml = (html_content || '')
        .replace(/{{first_name}}/g, contact.first_name || '')
        .replace(/{{last_name}}/g, contact.last_name || '')
      
      const personalizedText = (text_content || subject)
        .replace(/{{first_name}}/g, contact.first_name || '')
        .replace(/{{last_name}}/g, contact.last_name || '')

      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + process.env.RESEND_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: (from_name || 'ClientFlow CRM') + ' <onboarding@resend.dev>',
          to: [contact.email],
          subject: subject,
          html: personalizedHtml,
          text: personalizedText,
        })
      })

      if (res.ok) sent++
      else errors++
    }

    // Update campaign in Supabase
    if (campaign_id) {
      await supabase.from('email_campaigns').update({
        status: 'sent',
        sent_at: new Date().toISOString(),
        recipients_count: sent
      }).eq('id', campaign_id)
    }

    return NextResponse.json({ 
      success: true,
      sent_to: sent,
      errors,
      message: sent + ' emails enviados correctamente' + (errors > 0 ? ' (' + errors + ' errores)' : '')
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
