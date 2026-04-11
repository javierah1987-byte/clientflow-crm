import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { workspace_id, contacts } = await req.json()
    if (!contacts?.length) return NextResponse.json({ error: 'No contacts provided' }, { status: 400 })
    const toInsert = contacts.map((c: any) => ({
      workspace_id,
      first_name: c.first_name || c.nombre || c.name?.split(' ')[0] || '',
      last_name: c.last_name || c.apellido || c.name?.split(' ').slice(1).join(' ') || '',
      email: c.email || c.correo || '',
      phone: c.phone || c.telefono || '',
      city: c.city || c.ciudad || '',
      status: c.status || 'lead',
      source: 'import',
      lifetime_value: parseFloat(c.lifetime_value || c.valor || '0') || 0,
    })).filter((c: any) => c.first_name || c.email)
    const { data, error } = await supabase.from('contacts').insert(toInsert).select()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, imported: data?.length || 0 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}