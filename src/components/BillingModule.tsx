// @ts-nocheck
'use client'
import { useState, useEffect } from 'react'

const T={s2:'#121520',s3:'#181C28',border:'#232840',accent:'#3D7EFF',green:'#18CF7A',orange:'#FF7A35',purple:'#9B72FF',cyan:'#00C8C0',text:'#D8E0F0',muted:'#5E6A88'}

const PLANS=[
  {id:'free',name:'Free',price:0,color:'#5E6A88',features:['100 contactos','1 usuario','CRM básico','Email manual']},
  {id:'starter',name:'Starter',price:29,color:'#3D7EFF',features:['1.000 contactos','3 usuarios','Email campaigns','Propuestas IA','Facturas','CSV import']},
  {id:'pro',name:'Pro',price:79,color:'#9B72FF',popular:true,features:['10.000 contactos','10 usuarios','Automatizaciones','WhatsApp real','Reportes avanzados','API acceso','Soporte prioritario']},
  {id:'enterprise',name:'Enterprise',price:199,color:'#00C8C0',features:['Contactos ilimitados','Usuarios ilimitados','SLA 99.9%','Onboarding dedicado','White-label','Soporte 24/7']}
]

export default function BillingModule({wsId,userId}){
  const[sub,setSub]=useState(null)
  const[loading,setLoading]=useState(true)
  const[upgrading,setUpgrading]=useState('')

  useEffect(()=>{load()},[wsId])
  const load=async()=>{
    setLoading(true)
    try{const r=await fetch('/api/billing?workspace_id='+wsId);const d=await r.json();setSub(d.subscription);}catch(e){}
    setLoading(false)
  }

  const upgrade=async(plan)=>{
    if(plan==='free')return
    setUpgrading(plan)
    try{
      const r=await fetch('/api/stripe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({plan,workspace_id:wsId,user_id:userId,success_url:window.location.origin+'?plan_success=1',cancel_url:window.location.href})})
      const d=await r.json()
      if(d.checkout_url){window.location.href=d.checkout_url}
      else if(d.demo){alert('⚠️ Stripe no configurado aún.\n\nPara activar pagos reales:\n1. Crea cuenta en stripe.com\n2. Copia tu Secret Key (sk_test_...)\n3. Añádela en Vercel → Settings → Env Variables → STRIPE_SECRET_KEY\n4. Redespliega')}
    }catch(e){console.error(e)}
    setUpgrading('')
  }

  const currentPlan=sub?.plan||'free'
  const trialDays=sub?.trial_end?Math.max(0,Math.ceil((new Date(sub.trial_end)-Date.now())/(1000*60*60*24))):0
  const currentPlanData=PLANS.find(p=>p.id===currentPlan)||PLANS[0]

  return(
    <div style={{display:'flex',flexDirection:'column',gap:20,fontFamily:"'Outfit',sans-serif",color:T.text}}>
      {sub&&<div style={{background:'linear-gradient(135deg,'+currentPlanData.color+'20,'+currentPlanData.color+'10)',border:'1px solid '+currentPlanData.color+'40',borderRadius:16,padding:22,display:'flex',alignItems:'center',gap:16}}>
        <div style={{width:48,height:48,borderRadius:12,background:'linear-gradient(135deg,'+currentPlanData.color+','+currentPlanData.color+'99)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22}}>💎</div>
        <div style={{flex:1}}>
          <div style={{fontWeight:800,fontSize:18}}>Plan {currentPlanData.name}</div>
          <div style={{fontSize:12,color:T.muted,marginTop:3}}>
            {sub.status==='trialing'?'✨ Prueba gratuita · '+trialDays+' días restantes':'Estado: '+sub.status} · €{sub.monthly_price}/mes
          </div>
        </div>
        {sub.status==='trialing'&&<div style={{background:T.orange+'20',color:T.orange,padding:'8px 16px',borderRadius:20,fontSize:12,fontWeight:700}}>⏰ {trialDays} días de trial</div>}
      </div>}

      <div style={{fontWeight:800,fontSize:16}}>Planes disponibles</div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14}}>
        {PLANS.map(plan=>{
          const isCurrent=currentPlan===plan.id
          return(
            <div key={plan.id} style={{background:T.s2,border:'2px solid '+(isCurrent?plan.color:plan.popular?plan.color+'50':T.border),borderRadius:16,padding:20,display:'flex',flexDirection:'column',position:'relative'}}>
              {plan.popular&&!isCurrent&&<div style={{position:'absolute',top:-10,left:'50%',transform:'translateX(-50%)',background:'linear-gradient(135deg,#9B72FF,#3D7EFF)',borderRadius:20,padding:'3px 14px',fontSize:10,fontWeight:700,color:'#fff',whiteSpace:'nowrap'}}>⭐ MÁS POPULAR</div>}
              {isCurrent&&<div style={{position:'absolute',top:-10,right:14,background:plan.color,borderRadius:20,padding:'3px 12px',fontSize:10,fontWeight:700,color:'#fff'}}>✓ Tu plan</div>}
              <div style={{fontWeight:800,fontSize:17,color:plan.color,marginBottom:4}}>{plan.name}</div>
              <div style={{marginBottom:16}}><span style={{fontWeight:900,fontSize:30,color:plan.color}}>€{plan.price}</span><span style={{fontSize:12,color:T.muted}}>/mes</span></div>
              <div style={{flex:1,display:'flex',flexDirection:'column',gap:8,marginBottom:18}}>
                {plan.features.map(f=><div key={f} style={{display:'flex',gap:8,alignItems:'flex-start',fontSize:11}}><span style={{color:plan.color,flexShrink:0,marginTop:1}}>✓</span><span style={{color:T.muted}}>{f}</span></div>)}
              </div>
              <button onClick={()=>!isCurrent&&upgrade(plan.id)} disabled={isCurrent||!!upgrading} style={{width:'100%',padding:'10px',borderRadius:9,border:isCurrent?'none':'2px solid '+plan.color,background:isCurrent?plan.color+'25':'transparent',color:isCurrent?plan.color:plan.color,fontSize:12,fontWeight:700,cursor:isCurrent?'default':'pointer',fontFamily:'inherit',transition:'all 0.2s',opacity:upgrading&&upgrading!==plan.id?0.4:1}}>
                {upgrading===plan.id?'⏳ Redirigiendo a Stripe...':(isCurrent?'✓ Plan actual':(plan.price===0?'Degradar a Free':'Actualizar a '+plan.name+' →'))}
              </button>
            </div>
          )
        })}
      </div>

      <div style={{background:T.s2,border:'1px solid '+T.border,borderRadius:14,padding:20}}>
        <div style={{fontWeight:700,fontSize:13,marginBottom:14}}>💳 Información de pago</div>
        <div style={{display:'flex',gap:12,alignItems:'center',padding:'14px 16px',background:T.s3,borderRadius:10,marginBottom:12}}>
          <span style={{fontSize:24}}>🔒</span>
          <div><div style={{fontSize:12,fontWeight:600}}>Pagos seguros con Stripe</div><div style={{fontSize:11,color:T.muted}}>Visa · Mastercard · SEPA Débito · Cancela cuando quieras</div></div>
        </div>
        <div style={{background:T.orange+'10',border:'1px solid '+T.orange+'30',borderRadius:10,padding:'12px 16px'}}>
          <div style={{fontWeight:700,fontSize:12,color:T.orange,marginBottom:4}}>⚙️ Para activar pagos reales</div>
          <div style={{fontSize:11,color:T.muted,lineHeight:1.6}}>1. Crea cuenta en <strong style={{color:T.text}}>stripe.com</strong><br/>2. Copia tu <strong style={{color:T.text}}>Secret Key</strong> (sk_live_...)<br/>3. Añade en Vercel → Settings → <code style={{background:T.s3,padding:'1px 5px',borderRadius:4}}>STRIPE_SECRET_KEY</code><br/>4. Crea los productos en Stripe y añade los Price IDs</div>
        </div>
      </div>
    </div>
  )
}