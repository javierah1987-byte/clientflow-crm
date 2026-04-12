import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
export async function GET(req: NextRequest) {
  const ws = req.nextUrl.searchParams.get('workspace_id')
  const { data: members } = await sb.from('workspace_members').select('*,user:user_id(email)').eq('workspace_id', ws)
  const { data: invites } = await sb.from('workspace_invitations').select('*').eq('workspace_id', ws).eq('status', 'pending')
  return NextResponse.json({ members: members||[], invitations: invites||[] })
}
export async function POST(req: NextRequest) {
  const { workspace_id, invited_by, email, role } = await req.json()
  const { data: invite } = await sb.from('workspace_invitations').insert({ workspace_id, invited_email: email, invited_by, role: role||'member' }).select().single()
  if (process.env.RESEND_API_KEY && invite) {
    await fetch('https://api.resend.com/emails', { method: 'POST', headers: { 'Authorization': 'Bearer '+process.env.RESEND_API_KEY, 'Content-Type': 'application/json' }, body: JSON.stringify({ from: 'ClientFlow CRM <onboarding@resend.dev>', to: [email], subject: 'Te han invitado a ClientFlow CRM', html: '<h2>Has sido invitado a ClientFlow CRM</h2><p>Tu token de acceso: '+invite.token+'</p>' }) })
  }
  return NextResponse.json({ invitation: invite })
}
export async function DELETE(req: NextRequest) {
  const { id } = await req.json()
  await sb.from('workspace_invitations').delete().eq('id', id)
  return NextResponse.json({ success: true })
}