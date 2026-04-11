import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { contact_id, workspace_id, company_name, contact_name, services, budget, notes } = await req.json()

    const prompt = `Eres un experto en ventas B2B. Genera una propuesta comercial profesional y persuasiva en español para:

Cliente: ${contact_name}
Empresa: ${company_name || 'Su empresa'}
Servicios solicitados: ${services}
Presupuesto aproximado: ${budget ? '€' + budget : 'A definir'}
Notas adicionales: ${notes || 'Ninguna'}

La propuesta debe incluir:
1. Saludo personalizado
2. Resumen ejecutivo
3. Descripción detallada de los servicios propuestos
4. Beneficios específicos para el cliente
5. Metodología de trabajo
6. Inversión y condiciones de pago
7. Próximos pasos
8. Cierre profesional

Formato: HTML limpio y profesional con etiquetas h2, p, ul, strong. Sin estilos inline.`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-opus-4-6',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }]
      })
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'Error al contactar Claude AI' }, { status: 500 })
    }

    const aiData = await response.json()
    const htmlContent = aiData.content[0].text

    // Save to Supabase
    const { data: proposal } = await supabase.from('proposals').insert({
      workspace_id,
      contact_id: contact_id || null,
      title: 'Propuesta para ' + (company_name || contact_name),
      content: htmlContent,
      status: 'draft',
      total_amount: budget ? parseFloat(budget) : 0,
      valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    }).select().single()

    return NextResponse.json({ success: true, proposal, html: htmlContent })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const workspace_id = searchParams.get('workspace_id')
  if (!workspace_id) return NextResponse.json({ error: 'workspace_id required' }, { status: 400 })
  const { data } = await supabase.from('proposals').select('*,contact:contacts(first_name,last_name,email)')
    .eq('workspace_id', workspace_id).order('created_at', { ascending: false })
  return NextResponse.json({ proposals: data || [] })
}