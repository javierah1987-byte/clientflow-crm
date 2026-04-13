import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// ============================================================
// META LEAD GEN WEBHOOK
// URL a configurar en Meta Business Manager:
// https://clientflow-crm-phi.vercel.app/api/meta/webhook
// ============================================================

// Verificación del webhook (Meta envía GET para verificar)
export async function GET(req: NextRequest) {
  const mode = req.nextUrl.searchParams.get('hub.mode')
  const token = req.nextUrl.searchParams.get('hub.verify_token')
  const challenge = req.nextUrl.searchParams.get('hub.challenge')

  // Verifica que el token coincide con META_VERIFY_TOKEN en Vercel
  if (mode === 'subscribe' && token === process.env.META_VERIFY_TOKEN) {
    console.log('Meta webhook verified!')
    return new NextResponse(challenge, { status: 200 })
  }
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

// Recepción de leads de Meta Lead Gen Forms
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    // Verify Meta signature
    const signature = req.headers.get('x-hub-signature-256')
    // TODO: validate signature with META_APP_SECRET for production
    
    const entries = body.entry || []
    let leadsCreated = 0
    
    for (const entry of entries) {
      const changes = entry.changes || []
      for (const change of changes) {
        if (change.field !== 'leadgen') continue
        
        const leadgenId = change.value?.leadgen_id
        const formId = change.value?.form_id
        const adId = change.value?.ad_id
        const campaignId = change.value?.campaign_id
        
        if (!leadgenId) continue
        
        // Fetch lead data from Meta Graph API
        if (!process.env.META_ACCESS_TOKEN) {
          console.log('META_ACCESS_TOKEN not set, skipping lead fetch')
          continue
        }
        
        const leadRes = await fetch(
          `https://graph.facebook.com/v18.0/${leadgenId}?access_token=${process.env.META_ACCESS_TOKEN}`
        )
        const leadData = await leadRes.json()
        
        if (leadData.error) {
          console.error('Meta API error:', leadData.error)
          continue
        }
        
        // Parse field_data into object
        const fields: Record<string, string> = {}
        for (const f of leadData.field_data || []) {
          fields[f.name] = f.values?.[0] || ''
        }
        
        // Find workspace by Meta form ID or use default
        const { data: wsData } = await sb.from('workspaces')
          .select('id').eq('slug', 'clientflow-demo').single()
        
        if (!wsData) continue
        
        // Check if lead already exists
        const email = fields.email || fields.correo_electronico || ''
        const phone = fields.phone_number || fields.telefono || fields.phone || ''
        
        if (email) {
          const { data: existing } = await sb.from('contacts')
            .select('id').eq('email', email).eq('workspace_id', wsData.id).single()
          if (existing) continue // Already imported
        }
        
        // Create contact in Supabase
        const firstName = fields.first_name || fields.nombre || leadData.full_name?.split(' ')[0] || 'Lead'
        const lastName = fields.last_name || fields.apellido || leadData.full_name?.split(' ').slice(1).join(' ') || ''
        
        const { data: contact, error } = await sb.from('contacts').insert({
          workspace_id: wsData.id,
          first_name: firstName,
          last_name: lastName,
          email,
          phone,
          source: 'meta_ads',
          status: 'lead',
          notes: `Meta Lead Gen Form ID: ${formId}\nAd ID: ${adId}\nCampaign: ${campaignId}`,
          metadata: {
            meta_leadgen_id: leadgenId,
            meta_form_id: formId,
            meta_ad_id: adId,
            meta_campaign_id: campaignId,
            raw_fields: fields
          }
        }).select().single()
        
        if (error) {
          console.error('Error creating contact:', error)
          continue
        }
        
        leadsCreated++
        
        // Trigger automations for new Meta lead
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'https://clientflow-crm-phi.vercel.app'}/api/automations`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            workspace_id: wsData.id,
            trigger_type: 'contact_created',
            trigger_data: { ...contact, source: 'meta_ads' }
          })
        }).catch(e => console.error('Automation trigger error:', e))
        
        // Log the event
        await sb.from('analytics_events').insert({
          workspace_id: wsData.id,
          event_type: 'contact_created',
          entity_type: 'contact',
          entity_id: contact?.id,
          value: 0,
          metadata: { source: 'meta_ads', form_id: formId, campaign_id: campaignId }
        }).catch(() => {})
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      leads_created: leadsCreated,
      message: `${leadsCreated} leads importados desde Meta Ads`
    })
    
  } catch (error: any) {
    console.error('Meta webhook error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Sync campaigns and stats from Meta Ads API
export async function PUT(req: NextRequest) {
  try {
    if (!process.env.META_ACCESS_TOKEN || !process.env.META_AD_ACCOUNT_ID) {
      return NextResponse.json({ 
        error: 'META_ACCESS_TOKEN y META_AD_ACCOUNT_ID requeridos',
        setup: {
          step1: 'Ve a business.facebook.com → Configuración → Usuarios del sistema',
          step2: 'Crea un token de sistema con permisos: ads_read, leads_retrieval, pages_read_engagement',
          step3: 'Añade META_ACCESS_TOKEN en Vercel Environment Variables',
          step4: 'Añade META_AD_ACCOUNT_ID (ej: act_123456789)',
          step5: 'Añade META_APP_SECRET para verificar webhooks',
          step6: 'Añade META_VERIFY_TOKEN (cualquier string secreto)',
          webhook_url: 'https://clientflow-crm-phi.vercel.app/api/meta/webhook'
        }
      }, { status: 400 })
    }
    
    const { workspace_id, date_start, date_end } = await req.json()
    
    // Fetch campaigns
    const campaignsRes = await fetch(
      `https://graph.facebook.com/v18.0/${process.env.META_AD_ACCOUNT_ID}/campaigns?` +
      `fields=id,name,status,objective,spend_cap,daily_budget&` +
      `access_token=${process.env.META_ACCESS_TOKEN}`
    )
    const campaigns = await campaignsRes.json()
    
    // Fetch insights (stats)
    const insightsRes = await fetch(
      `https://graph.facebook.com/v18.0/${process.env.META_AD_ACCOUNT_ID}/insights?` +
      `fields=spend,impressions,clicks,ctr,cpc,actions,cost_per_action_type&` +
      `time_range={"since":"${date_start || new Date(Date.now()-30*24*60*60*1000).toISOString().slice(0,10)}","until":"${date_end || new Date().toISOString().slice(0,10)}"}&` +
      `access_token=${process.env.META_ACCESS_TOKEN}`
    )
    const insights = await insightsRes.json()
    
    return NextResponse.json({
      success: true,
      campaigns: campaigns.data || [],
      insights: insights.data?.[0] || {},
      webhook_url: 'https://clientflow-crm-phi.vercel.app/api/meta/webhook'
    })
    
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
