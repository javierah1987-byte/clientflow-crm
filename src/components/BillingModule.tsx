// @ts-nocheck
'use client'
import { useState, useEffect } from 'react'

const T={s2:'#121520',s3:'#181C28',border:'#232840',accent:'#3D7EFF',green:'#18CF7A',orange:'#FF7A35',purple:'#9B72FF',cyan:'#00C8C0',text:'#D8E0F0',muted:'#5E6A88'}

const PLANS=[
  {id:'free',name:'Free',price:0,color:'#5E6A88',features:['100 contactos','1 usuario','CRM básico','Email manual']},
  {id:'starter',name:'Starter',price:29,color:'#3D7EFF',popular:false,features:['1.000 contactos','3 usuarios','Email campaigns','Propuestas IA','Facturas']},
  {id:'pro',name:'Pro',price:79,color:'#9B72FF',popular:true,features:['10.000 contactos','10 usuarios','Automatizaciones','WhatsApp','Reportes avanzados','API acceso']},
  {id:'enterprise',name:'Enterprise',price:199,color:'#00C8C0',features:['Contactos ilimitados','Usuarios ilimitados','SLA 99.9%','Soporte prioritario','Onboarding dedicado','White-label']}
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
    setUpgrading(plan)
    await fetch('/api/billing',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({workspace_id:wsId,user_id:userId,plan})})
    load();setUpgrading('')
  }

  const currentPlan=sub?.plan||'free'
  const trialDays=sub?.trial_end?Math.max(0,Math.ceil((new Date(sub.trial_end)-Date.now())/(1000*60*60*24))):0

  return(
    <div style={{display:'flex',flexDirection:'column',gap:20,fontFamily:"'Outfit',sans-serif",color:T.text}}>
      {sub&&<div style={{background:'linear-gradient(135deg,#9B72FF20,#3D7EFF20)',border:'1px solid #9B72FF40',borderRadius:14,padding:20,display:'flex',alignItems:'center',gap:16}}>
        <div style={{fontSize:32}}>💎</div>
        <div><div style={{fontWeight:800,fontSize:16}}>Plan {PLANS.find(p=>p.id===currentPlan)?.name||currentPlan}</div><div style={{fontSize:12,color:T.muted,marginTop:3}}>{sub.status==='trialing'?'Prueba gratuita · '+trialDays+' días restantes':'Estado: '+sub.status} · €{sub.monthly_price}/mes</div></div>
        {sub.status==='trialing'&&<div style={{marginLeft:'auto',fontSize:11,background:T.orange+'20',color:T.orange,padding:'6px 12px',borderRadius:20,fontWeight:600}}>⏰ Trial: {trialDays} días</div>}
      </div>}

      <div style={{fontWeight:800,fontSize:16,marginBottom:4}}>Elige tu plan</div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14}}>
        {PLANS.map(plan=>{
          const isCurrent=currentPlan===plan.id
          return(
            <div key={plan.id} style={{background:T.s2,border:'2px solid '+(isCurrent?plan.color:plan.popular?plan.color+'40':T.border),borderRadius:16,padding:20,position:'relative',display:'flex',flexDirection:'column',gap:0}}>
              {plan.popular&&<div style={{position:'absolute',top:-10,left:'50%',transform:'translateX(-50%)',background:'linear-gradient(135deg,#9B72FF,#3D7EFF)',borderRadius:20,padding:'3px 12px',fontSize:10,fontWeight:700,color:'#fff',whiteSpace:'nowrap'}}>⭐ Más popular</div>}
              {isCurrent&&<div style={{position:'absolute',top:-10,right:12,background:plan.color,borderRadius:20,padding:'3px 12px',fontSize:10,fontWeight:700,color:'#fff'}}>Tu plan</div>}
              <div style={{fontWeight:800,fontSize:16,color:plan.color,marginBottom:4}}>{plan.name}</div>
              <div style={{marginBottom:16}}><span style={{fontWeight:800,fontSize:28}}>€{plan.price}</span><span style={{fontSize:12,color:T.muted}}>/mes</span></div>
              <div style={{flex:1,display:'flex',flexDirection:'column',gap:7,marginBottom:16}}>
                {plan.features.map(f=><div key={f} style={{display:'flex',gap:7,alignItems:'center',fontSize:11}}><span style={{color:plan.color}}>✓</span><span style={{color:T.muted}}>{f}</span></div>)}
              </div>
              <button onClick={()=>!isCurrent&&upgrade(plan.id)} disabled={isCurrent||upgrading===plan.id} style={{width:'100%',padding:'9px',borderRadius:9,border:isCurrent?'none':'1px solid '+plan.color,background:isCurrent?plan.color+'30':'transparent',color:isCurrent?plan.color:plan.color,fontSize:12,fontWeight:600,cursor:isCurrent?'default':'pointer',fontFamily:'inherit',opacity:upgrading&&upgrading!==plan.id?0.5:1}}>
                {upgrading===plan.id?'Procesando...':(isCurrent?'Plan actual':'Seleccionar →')}
              </button>
            </div>
          )
        })}
      </div>

      <div style={{background:T.s2,border:'1px solid '+T.border,borderRadius:14,padding:20}}>
        <div style={{fontWeight:700,fontSize:13,marginBottom:12}}>💳 Método de pago</div>
        <div style={{display:'flex',alignItems:'center',gap:12,padding:'12px 16px',background:T.s3,borderRadius:10,border:'1px solid '+T.border}}>
          <span style={{fontSize:24}}>💳</span>
          <div><div style={{fontSize:12,fontWeight:600}}>Pago seguro con Stripe</div><div style={{fontSize:11,color:T.muted}}>Visa, Mastercard, SEPA · Cancela cuando quieras</div></div>
          <button style={{marginLeft:'auto',padding:'7px 14px',borderRadius:8,border:'1px solid '+T.accent,background:'transparent',color:T.accent,fontSize:12,cursor:'pointer',fontFamily:'inherit'}}>Añadir tarjeta →</button>
        </div>
      </div>
    </div>
  )
}