import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// ============================================================
// GOOGLE ADS API CONNECTOR
// Requiere: Google Ads Developer Token (aprobado)
// URL: https://clientflow-crm-phi.vercel.app/api/google/sync
// ============================================================

// GET - Check connection status and setup instructions
export async function GET(req: NextRequest) {
  const hasToken = !!process.env.GOOGLE_ADS_DEVELOPER_TOKEN
  const hasCustomer = !!process.env.GOOGLE_ADS_CUSTOMER_ID
  const hasCredentials = !!process.env.GOOGLE_ADS_CLIENT_ID && !!process.env.GOOGLE_ADS_CLIENT_SECRET
  const hasRefreshToken = !!process.env.GOOGLE_ADS_REFRESH_TOKEN
  
  const configured = hasToken && hasCustomer && hasCredentials && hasRefreshToken
  
  if (!configured) {
    return NextResponse.json({
      connected: false,
      setup_instructions: {
        step1: 'Ve a ads.google.com → Herramientas → API Center → Solicita Developer Token',
        step2: 'Una vez aprobado (puede tardar días), añade GOOGLE_ADS_DEVELOPER_TOKEN en Vercel',
        step3: 'Ve a console.cloud.google.com → Crea proyecto → Habilita Google Ads API',
        step4: 'Crea OAuth 2.0 credentials → Copia Client ID y Client Secret',
        step5: 'Usa OAuth playground para obtener el Refresh Token con scope: https://www.googleapis.com/auth/adwords',
        step6: 'Añade todas las variables en Vercel Environment Variables:',
        variables: {
          GOOGLE_ADS_DEVELOPER_TOKEN: hasToken ? '✅ Configurado' : '❌ Falta - aprobación requerida',
          GOOGLE_ADS_CUSTOMER_ID: hasCustomer ? '✅ Configurado' : '❌ Falta (ej: 123-456-7890)',
          GOOGLE_ADS_CLIENT_ID: hasCredentials ? '✅ Configurado' : '❌ Falta (OAuth Client ID)',
          GOOGLE_ADS_CLIENT_SECRET: hasCredentials ? '✅ Configurado' : '❌ Falta (OAuth Client Secret)',
          GOOGLE_ADS_REFRESH_TOKEN: hasRefreshToken ? '✅ Configurado' : '❌ Falta (OAuth Refresh Token)',
          GOOGLE_ADS_LOGIN_CUSTOMER_ID: 'Opcional - MCC account ID si usas gestor'
        },
        webhook_url: 'https://clientflow-crm-phi.vercel.app/api/google/sync',
        docs: 'https://developers.google.com/google-ads/api/docs/start'
      }
    })
  }
  
  return NextResponse.json({ connected: true, customer_id: process.env.GOOGLE_ADS_CUSTOMER_ID })
}

// POST - Sync leads and conversions from Google Ads
export async function POST(req: NextRequest) {
  try {
    if (!process.env.GOOGLE_ADS_DEVELOPER_TOKEN || !process.env.GOOGLE_ADS_REFRESH_TOKEN) {
      return NextResponse.json({ 
        error: 'Google Ads no configurado. Consulta GET /api/google/sync para instrucciones.'
      }, { status: 400 })
    }
    
    const { workspace_id, days_back = 30 } = await req.json()
    
    // Step 1: Get access token from refresh token
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_ADS_CLIENT_ID!,
        client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET!,
        refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN!,
        grant_type: 'refresh_token',
      })
    })
    const { access_token, error: tokenError } = await tokenRes.json()
    
    if (tokenError || !access_token) {
      return NextResponse.json({ error: 'Error obteniendo token de Google: ' + tokenError }, { status: 401 })
    }
    
    const customerId = process.env.GOOGLE_ADS_CUSTOMER_ID!.replace(/-/g, '')
    const headers = {
      'Authorization': `Bearer ${access_token}`,
      'developer-token': process.env.GOOGLE_ADS_DEVELOPER_TOKEN!,
      'Content-Type': 'application/json',
      ...(process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID && {
        'login-customer-id': process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID
      })
    }
    
    // Step 2: Query campaigns with Google Ads Query Language (GAQL)
    const campaignQuery = `
      SELECT 
        campaign.id, campaign.name, campaign.status,
        metrics.impressions, metrics.clicks, metrics.cost_micros,
        metrics.conversions, metrics.ctr, metrics.average_cpc
      FROM campaign 
      WHERE segments.date DURING LAST_30_DAYS
        AND campaign.status != 'REMOVED'
      ORDER BY metrics.cost_micros DESC
      LIMIT 10
    `
    
    const campaignsRes = await fetch(
      `https://googleads.googleapis.com/v14/customers/${customerId}/googleAds:searchStream`,
      { method: 'POST', headers, body: JSON.stringify({ query: campaignQuery }) }
    )
    const campaignsData = await campaignsRes.json()
    
    if (!campaignsRes.ok) {
      return NextResponse.json({ error: 'Google Ads API error', details: campaignsData }, { status: 500 })
    }
    
    // Step 3: Process campaigns and extract metrics
    const campaigns = []
    for (const result of campaignsData) {
      for (const row of result.results || []) {
        campaigns.push({
          id: row.campaign?.id,
          name: row.campaign?.name,
          status: row.campaign?.status,
          impressions: row.metrics?.impressions || 0,
          clicks: row.metrics?.clicks || 0,
          cost: (row.metrics?.cost_micros || 0) / 1000000,
          conversions: row.metrics?.conversions || 0,
          ctr: ((row.metrics?.ctr || 0) * 100).toFixed(2),
          avg_cpc: ((row.metrics?.average_cpc || 0) / 1000000).toFixed(2),
        })
      }
    }
    
    // Step 4: Get lead form submissions if Lead Form Extensions are used
    const leadFormQuery = `
      SELECT 
        lead_form_submission_data.id,
        lead_form_submission_data.lead_form,
        lead_form_submission_data.submission_date_time,
        lead_form_submission_data.field_values
      FROM lead_form_submission_data
      WHERE segments.date DURING LAST_${days_back}_DAYS
    `
    
    const leadsRes = await fetch(
      `https://googleads.googleapis.com/v14/customers/${customerId}/googleAds:searchStream`,
      { method: 'POST', headers, body: JSON.stringify({ query: leadFormQuery }) }
    )
    const leadsData = await leadsRes.json()
    
    let leadsImported = 0
    for (const result of leadsData) {
      for (const row of result.results || []) {
        const fieldValues = row.lead_form_submission_data?.field_values || []
        const fields: Record<string, string> = {}
        for (const fv of fieldValues) {
          fields[fv.field_type?.toLowerCase() || 'unknown'] = fv.field_value || ''
        }
        
        const email = fields.email || ''
        const phone = fields.phone_number || ''
        
        if (!email && !phone) continue
        
        // Check for duplicates
        if (email) {
          const { data: existing } = await sb.from('contacts')
            .select('id').eq('email', email).eq('workspace_id', workspace_id).single()
          if (existing) continue
        }
        
        await sb.from('contacts').insert({
          workspace_id,
          first_name: fields.full_name?.split(' ')[0] || fields.given_name || 'Lead',
          last_name: fields.full_name?.split(' ').slice(1).join(' ') || fields.family_name || '',
          email,
          phone,
          source: 'google_ads',
          status: 'lead',
          notes: `Google Ads Lead Form · ${row.lead_form_submission_data?.submission_date_time || ''}`,
        })
        leadsImported++
      }
    }
    
    // Step 5: Log sync to analytics
    const { data: ws } = await sb.from('workspaces').select('id').eq('id', workspace_id).single()
    if (ws) {
      await sb.from('analytics_events').insert({
        workspace_id,
        event_type: 'google_ads_sync',
        entity_type: 'integration',
        value: campaigns.reduce((s, c) => s + c.cost, 0),
        metadata: { campaigns_count: campaigns.length, leads_imported: leadsImported, days_back }
      }).catch(() => {})
    }
    
    return NextResponse.json({
      success: true,
      campaigns,
      leads_imported: leadsImported,
      summary: {
        total_campaigns: campaigns.length,
        total_spend: campaigns.reduce((s, c) => s + c.cost, 0).toFixed(2),
        total_clicks: campaigns.reduce((s, c) => s + c.clicks, 0),
        total_conversions: campaigns.reduce((s, c) => s + c.conversions, 0),
        leads_imported: leadsImported
      }
    })
    
  } catch (error: any) {
    console.error('Google Ads sync error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Upload conversions to Google Ads (for offline conversion tracking)
export async function PUT(req: NextRequest) {
  try {
    if (!process.env.GOOGLE_ADS_DEVELOPER_TOKEN || !process.env.GOOGLE_ADS_REFRESH_TOKEN) {
      return NextResponse.json({ error: 'Google Ads no configurado' }, { status: 400 })
    }
    
    const { gclid, conversion_name, conversion_value, conversion_time, workspace_id } = await req.json()
    
    if (!gclid) {
      return NextResponse.json({ error: 'gclid requerido para tracking de conversiones' }, { status: 400 })
    }
    
    // Get fresh access token
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_ADS_CLIENT_ID!,
        client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET!,
        refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN!,
        grant_type: 'refresh_token',
      })
    })
    const { access_token } = await tokenRes.json()
    const customerId = process.env.GOOGLE_ADS_CUSTOMER_ID!.replace(/-/g, '')
    
    // Upload offline conversion
    const conversionRes = await fetch(
      `https://googleads.googleapis.com/v14/customers/${customerId}/conversionUploads:uploadClickConversions`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'developer-token': process.env.GOOGLE_ADS_DEVELOPER_TOKEN!,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversions: [{
            gclid,
            conversion_action: `customers/${customerId}/conversionActions/${conversion_name || 'ClientFlow_Lead'}`,
            conversion_date_time: conversion_time || new Date().toISOString().replace('T', ' ').replace('Z', '+00:00'),
            conversion_value: conversion_value || 1,
            currency_code: 'EUR',
          }],
          partial_failure: true,
        })
      }
    )
    
    const data = await conversionRes.json()
    return NextResponse.json({ success: conversionRes.ok, data })
    
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
