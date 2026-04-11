import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

function generateDemoProposal(contactName: string, companyName: string, services: string, budget: string, notes: string): string {
  const date = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })
  const validDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })
  const budgetNum = budget ? parseFloat(budget) : 5000
  const budgetFormatted = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(budgetNum)

  return `
<div style="font-family: Georgia, serif; max-width: 700px; color: #1a1a1a; line-height: 1.7;">

  <div style="border-bottom: 3px solid #3D7EFF; padding-bottom: 20px; margin-bottom: 30px;">
    <h1 style="font-size: 28px; color: #3D7EFF; margin: 0 0 8px;">PROPUESTA COMERCIAL</h1>
    <p style="margin: 0; color: #666; font-size: 14px;">Ref: CF-${Date.now().toString().slice(-6)} · Fecha: ${date}</p>
  </div>

  <h2 style="color: #1a1a1a; font-size: 20px; margin-bottom: 8px;">Estimado/a ${contactName},</h2>
  
  <p>Es un placer dirigirme a usted en nombre de nuestro equipo. Tras analizar detenidamente las necesidades de <strong>${companyName || 'su empresa'}</strong>, hemos preparado esta propuesta personalizada con la convicción de que podemos aportar un valor significativo a su organización.</p>

  <h2 style="color: #3D7EFF; font-size: 18px; margin-top: 30px; border-left: 4px solid #3D7EFF; padding-left: 12px;">📋 Resumen Ejecutivo</h2>
  <p>En un mercado cada vez más competitivo, contar con las herramientas y estrategias adecuadas marca la diferencia. Nuestra propuesta está diseñada específicamente para abordar los desafíos de <strong>${companyName || 'su empresa'}</strong> y potenciar su crecimiento de forma sostenible.</p>

  <h2 style="color: #3D7EFF; font-size: 18px; margin-top: 30px; border-left: 4px solid #3D7EFF; padding-left: 12px;">🎯 Servicios Propuestos</h2>
  <p>Tras analizar sus requerimientos, proponemos los siguientes servicios:</p>
  <ul style="padding-left: 20px; margin: 12px 0;">
    ${services.split(',').map((s: string) => `<li style="margin-bottom: 8px; padding: 8px 12px; background: #f8f9ff; border-radius: 6px;"><strong>${s.trim()}</strong></li>`).join('')}
  </ul>
  ${notes ? `<p style="background: #fff8e1; padding: 12px; border-radius: 8px; border-left: 3px solid #ffc107;"><strong>Consideraciones especiales:</strong> ${notes}</p>` : ''}

  <h2 style="color: #3D7EFF; font-size: 18px; margin-top: 30px; border-left: 4px solid #3D7EFF; padding-left: 12px;">✅ Beneficios para ${companyName || 'su empresa'}</h2>
  <ul style="padding-left: 20px;">
    <li style="margin-bottom: 6px;">Optimización de procesos y reducción de costes operativos</li>
    <li style="margin-bottom: 6px;">Incremento de la productividad del equipo</li>
    <li style="margin-bottom: 6px;">Mayor visibilidad y posicionamiento en el mercado</li>
    <li style="margin-bottom: 6px;">Retorno de inversión medible desde el primer mes</li>
    <li style="margin-bottom: 6px;">Soporte continuo y acompañamiento personalizado</li>
  </ul>

  <h2 style="color: #3D7EFF; font-size: 18px; margin-top: 30px; border-left: 4px solid #3D7EFF; padding-left: 12px;">⚙️ Metodología de Trabajo</h2>
  <div style="display: grid; gap: 10px; margin: 12px 0;">
    ${['Fase 1: Análisis y diagnóstico inicial (1 semana)', 'Fase 2: Planificación estratégica y recursos (1 semana)', 'Fase 3: Implementación y desarrollo (2-4 semanas)', 'Fase 4: Testing, ajustes y optimización (1 semana)', 'Fase 5: Entrega, formación y soporte (continuo)'].map((f: string, i: number) => `<div style="padding: 10px 14px; background: #f0f4ff; border-radius: 8px; border-left: 3px solid #3D7EFF;"><strong>📌 ${f}</strong></div>`).join('')}
  </div>

  <h2 style="color: #3D7EFF; font-size: 18px; margin-top: 30px; border-left: 4px solid #3D7EFF; padding-left: 12px;">💰 Inversión</h2>
  <div style="background: #f8f9ff; border: 2px solid #3D7EFF; border-radius: 12px; padding: 20px; margin: 12px 0;">
    <table style="width: 100%; border-collapse: collapse;">
      <tr style="border-bottom: 1px solid #ddd;">
        <td style="padding: 8px 0; color: #666;">Servicios profesionales</td>
        <td style="padding: 8px 0; text-align: right; font-weight: bold;">${budgetFormatted}</td>
      </tr>
      <tr style="border-bottom: 1px solid #ddd;">
        <td style="padding: 8px 0; color: #666;">IVA (21%)</td>
        <td style="padding: 8px 0; text-align: right;">${new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(budgetNum * 0.21)}</td>
      </tr>
      <tr>
        <td style="padding: 12px 0; font-size: 18px; font-weight: bold; color: #3D7EFF;">TOTAL</td>
        <td style="padding: 12px 0; text-align: right; font-size: 18px; font-weight: bold; color: #3D7EFF;">${new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(budgetNum * 1.21)}</td>
      </tr>
    </table>
    <p style="margin: 12px 0 0; font-size: 13px; color: #666;">Formas de pago: 50% al inicio · 50% a la entrega. Válida hasta <strong>${validDate}</strong>.</p>
  </div>

  <h2 style="color: #3D7EFF; font-size: 18px; margin-top: 30px; border-left: 4px solid #3D7EFF; padding-left: 12px;">🚀 Próximos Pasos</h2>
  <ol style="padding-left: 20px;">
    <li style="margin-bottom: 8px;">Revisión conjunta de esta propuesta</li>
    <li style="margin-bottom: 8px;">Reunión de alineación y resolución de dudas</li>
    <li style="margin-bottom: 8px;">Firma del acuerdo de colaboración</li>
    <li style="margin-bottom: 8px;">Inicio inmediato del proyecto</li>
  </ol>

  <div style="background: linear-gradient(135deg, #3D7EFF15, #00C8C015); border-radius: 12px; padding: 20px; margin-top: 30px; text-align: center;">
    <p style="font-size: 16px; margin: 0 0 8px;"><strong>Estamos convencidos de que esta colaboración será el inicio de una relación a largo plazo basada en la confianza y los resultados.</strong></p>
    <p style="margin: 0; color: #666;">No dude en contactarnos para cualquier consulta. ¡Esperamos trabajar juntos!</p>
  </div>

  <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #999; text-align: center;">
    <p>Propuesta generada por ClientFlow CRM · Confidencial</p>
  </div>
</div>
`
}

export async function POST(req: NextRequest) {
  try {
    const { contact_id, workspace_id, company_name, contact_name, services, budget, notes } = await req.json()

    let htmlContent: string

    // Try Claude API if key exists, otherwise use demo generator
    if (process.env.ANTHROPIC_API_KEY) {
      const prompt = `Eres un experto en ventas B2B. Genera una propuesta comercial profesional en español para:\n\nCliente: ${contact_name}\nEmpresa: ${company_name || 'Su empresa'}\nServicios: ${services}\nPresupuesto: ${budget ? '€' + budget : 'A definir'}\nNotas: ${notes || 'Ninguna'}\n\nFormato: HTML limpio con h2, p, ul, strong. Sin estilos inline.`

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-opus-4-6',
          max_tokens: 2000,
          messages: [{ role: 'user', content: prompt }]
        })
      })
      const aiData = await response.json()
      htmlContent = aiData.content?.[0]?.text || generateDemoProposal(contact_name, company_name, services, budget, notes)
    } else {
      // Demo mode - generate professional proposal with template
      htmlContent = generateDemoProposal(contact_name, company_name, services, budget, notes)
    }

    const { data: proposal } = await supabase.from('proposals').insert({
      workspace_id,
      contact_id: contact_id || null,
      title: 'Propuesta para ' + (company_name || contact_name),
      content: htmlContent,
      status: 'draft',
      total_amount: budget ? parseFloat(budget) * 1.21 : 0,
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
  const { data } = await supabase.from('proposals')
    .select('*,contact:contacts(first_name,last_name,email)')
    .eq('workspace_id', workspace_id)
    .order('created_at', { ascending: false })
  return NextResponse.json({ proposals: data || [] })
}