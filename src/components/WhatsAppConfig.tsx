// @ts-nocheck
'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

const T={s2:'#121520',s3:'#181C28',border:'#232840',accent:'#3D7EFF',green:'#18CF7A',orange:'#FF7A35',text:'#D8E0F0',muted:'#5E6A88',wa:'#25D366'}
const PROVIDERS=[
  {id:'360dialog',name:'360Dialog',desc:'Recomendado · Meta Business Partner · Desde €0/mes',steps:['Ve a hub.360dialog.com y crea cuenta','Añade tu número en "Phone Numbers"','Copia la API Key que aparece','Pégala abajo y conecta']},
  {id:'twilio',name:'Twilio',desc:'Global · Muy fiable · Desde $0.005/mensaje',steps:['Ve a twilio.com/console','Activa "WhatsApp Sandbox" o compra número','Copia Account SID y Auth Token','Pégalos abajo y conecta']},
  {id:'meta',name:'Meta Cloud API',desc:'Oficial · Gratis hasta 1.000 conv/mes',steps:['Ve a developers.facebook.com','Crea app tipo "Business"','Añade producto WhatsApp','Copia el Permanent Token']},
]

export default function WhatsAppConfig({wsId}){
  const[provider,setProvider]=useState('360dialog')
  const[phone,setPhone]=useState('')
  const[apiKey,setApiKey]=useState('')
  const[step,setStep]=useState(1)
  const[connecting,setConnecting]=useState(false)
  const[existing,setExisting]=useState(null)
  const sb=createClient()

  useEffect(()=>{
    sb.from('whatsapp_numbers').select('*').eq('workspace_id',wsId).single()
      .then(({data})=>{if(data){setExisting(data);if(data.status==='active')setStep(3);setPhone(data.phone_number||'');setProvider(data.provider||'360dialog')}})
  },[wsId])

  const connect=async()=>{
    if(!phone||!apiKey)return
    setConnecting(true)
    const webhookUrl = window.location.origin+'/api/whatsapp/webhook'
    const {error}=await sb.from('whatsapp_numbers').upsert({
      workspace_id:wsId,
      phone_number:phone,
      provider,
      api_key:apiKey,
      webhook_url:webhookUrl,
      status:'active',
      connected_at:new Date().toISOString()
    },{onConflict:'workspace_id'})
    if(!error)setStep(3)
    else alert('Error: '+error.message)
    setConnecting(false)
  }

  const curProvider=PROVIDERS.find(p=>p.id===provider)||PROVIDERS[0]

  return(
    <div style={{display:'flex',flexDirection:'column',gap:16,fontFamily:"'Outfit',sans-serif",color:T.text}}>
      <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:4}}>
        {[{n:1,l:'Proveedor'},{n:2,l:'Configurar'},{n:3,l:'Conectado ✅'}].map((s,i)=>(
          <div key={s.n} style={{display:'flex',alignItems:'center',gap:6}}>
            <div style={{width:26,height:26,borderRadius:'50%',background:step>=s.n?T.wa:'#232840',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,color:step>=s.n?'#fff':T.muted}}>{step>s.n?'✓':s.n}</div>
            <span style={{fontSize:11,color:step>=s.n?T.text:T.muted,fontWeight:step===s.n?600:400}}>{s.l}</span>
            {i<2&&<div style={{width:30,height:1,background:step>s.n?T.wa:T.border,margin:'0 4px'}}/>}
          </div>
        ))}
      </div>

      {step===1&&<>
        <div style={{fontWeight:800,fontSize:15}}>📱 Elige tu proveedor WhatsApp Business</div>
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {PROVIDERS.map(p=><div key={p.id} onClick={()=>setProvider(p.id)} style={{background:T.s2,border:'2px solid '+(provider===p.id?T.wa:T.border),borderRadius:12,padding:16,cursor:'pointer',display:'flex',gap:12,alignItems:'center',position:'relative'}}>
            {p.id==='360dialog'&&<div style={{position:'absolute',top:-8,right:12,background:T.wa,borderRadius:20,padding:'2px 10px',fontSize:9,fontWeight:700,color:'#fff'}}>⭐ RECOMENDADO</div>}
            <div style={{width:38,height:38,borderRadius:9,background:T.wa+'20',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>📱</div>
            <div style={{flex:1}}><div style={{fontWeight:700,fontSize:13}}>{p.name}</div><div style={{fontSize:11,color:T.muted,marginTop:2}}>{p.desc}</div></div>
            <div style={{width:22,height:22,borderRadius:'50%',border:'2px solid '+(provider===p.id?T.wa:T.border),background:provider===p.id?T.wa:'transparent',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:12}}>{provider===p.id?'✓':''}</div>
          </div>)}
        </div>
        <button onClick={()=>setStep(2)} style={{padding:'11px',border:'none',borderRadius:9,background:'linear-gradient(135deg,#25D366,#1aab53)',color:'#fff',fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>Continuar con {curProvider.name} →</button>
      </>}

      {step===2&&<>
        <div style={{fontWeight:800,fontSize:15}}>🔧 Configura {curProvider.name}</div>
        <div style={{background:T.s3,border:'1px solid '+T.border,borderRadius:10,padding:16,marginBottom:4}}>
          <div style={{fontWeight:600,fontSize:12,marginBottom:8,color:T.accent}}>📋 Instrucciones:</div>
          {curProvider.steps.map((s,i)=><div key={i} style={{display:'flex',gap:8,fontSize:11,color:T.muted,marginBottom:6}}><span style={{color:T.wa,fontWeight:700,flexShrink:0}}>{i+1}.</span><span>{s}</span></div>)}
        </div>
        <div style={{background:'#1a2030',border:'1px solid #3D7EFF40',borderRadius:10,padding:'12px 16px',marginBottom:4}}>
          <div style={{fontSize:10,color:T.accent,fontWeight:600,marginBottom:4}}>🔗 Tu webhook URL (cópiala en {curProvider.name}):</div>
          <code style={{fontSize:11,color:T.text}}>{typeof window!=='undefined'?window.location.origin:''}/api/whatsapp/webhook</code>
        </div>
        {[{l:'Número de teléfono (con prefijo +34)',ph:'+34 600 000 000',v:phone,s:setPhone},{l:'API Key / Token de '+curProvider.name,ph:'Tu clave API...',v:apiKey,s:setApiKey}].map((f,i)=>(
          <div key={i} style={{marginBottom:12}}>
            <div style={{fontSize:10,color:T.muted,textTransform:'uppercase',letterSpacing:'0.6px',marginBottom:5}}>{f.l}</div>
            <input value={f.v} onChange={e=>f.s(e.target.value)} placeholder={f.ph} type={i===1?'password':'text'} style={{width:'100%',background:T.s3,border:'1px solid '+T.border,borderRadius:9,padding:'9px 12px',color:T.text,fontSize:13,fontFamily:'inherit',outline:'none'}}/>
          </div>
        ))}
        <div style={{display:'flex',gap:10}}>
          <button onClick={()=>setStep(1)} style={{padding:'9px 16px',borderRadius:9,border:'1px solid '+T.border,background:'transparent',color:T.muted,fontSize:12,cursor:'pointer',fontFamily:'inherit'}}>← Atrás</button>
          <button onClick={connect} disabled={connecting||!phone||!apiKey} style={{flex:1,padding:'11px',border:'none',borderRadius:9,background:connecting?T.s3:'linear-gradient(135deg,#25D366,#1aab53)',color:'#fff',fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:'inherit',opacity:(!phone||!apiKey)?0.5:1}}>
            {connecting?'⏳ Guardando y conectando...':'⚡ Conectar WhatsApp'}
          </button>
        </div>
      </>}

      {step===3&&<div style={{textAlign:'center',padding:40}}>
        <div style={{fontSize:64,marginBottom:16}}>✅</div>
        <div style={{fontWeight:800,fontSize:22,marginBottom:8,color:T.green}}>¡WhatsApp Conectado!</div>
        <div style={{color:T.muted,fontSize:14,marginBottom:8}}>Número: <strong style={{color:T.text}}>{phone||existing?.phone_number}</strong></div>
        <div style={{color:T.muted,fontSize:13,marginBottom:24}}>Proveedor: <strong style={{color:T.text}}>{curProvider.name}</strong> · Los mensajes aparecerán en el Inbox en tiempo real.</div>
        <div style={{background:T.s2,border:'1px solid '+T.border,borderRadius:12,padding:16,marginBottom:20,textAlign:'left'}}>
          <div style={{fontWeight:700,fontSize:12,marginBottom:8,color:T.accent}}>🔗 Webhook URL activo:</div>
          <code style={{fontSize:11,color:T.text}}>{typeof window!=='undefined'?window.location.origin:''}/api/whatsapp/webhook</code>
        </div>
        <div style={{display:'flex',gap:12,justifyContent:'center'}}>
          <button onClick={()=>setStep(2)} style={{padding:'10px 20px',borderRadius:9,border:'1px solid '+T.border,background:'transparent',color:T.muted,fontSize:12,cursor:'pointer',fontFamily:'inherit'}}>⚙️ Reconfigurar</button>
          <button onClick={()=>window.dispatchEvent(new CustomEvent('navigate',{detail:'inbox'}))} style={{padding:'10px 20px',borderRadius:9,border:'none',background:'linear-gradient(135deg,#25D366,#1aab53)',color:'#fff',fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>💬 Ir al Inbox →</button>
        </div>
      </div>}
    </div>
  )
}