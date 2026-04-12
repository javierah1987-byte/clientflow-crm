// @ts-nocheck
'use client'
import { useState } from 'react'
const T={s2:'#121520',s3:'#181C28',border:'#232840',green:'#18CF7A',orange:'#FF7A35',text:'#D8E0F0',muted:'#5E6A88',wa:'#25D366'}
const PROVIDERS=[{id:'360dialog',name:'360Dialog',desc:'Recomendado para España · Meta Business Partner oficial',recommend:true},{id:'twilio',name:'Twilio',desc:'Global · Muy fiable · Desde $0.005/mensaje'},{id:'meta',name:'Meta Cloud API',desc:'Gratis hasta 1.000 conversaciones/mes'}]
export default function WhatsAppConfig({wsId}){
  const[provider,setProvider]=useState('360dialog')
  const[phone,setPhone]=useState('')
  const[apiKey,setApiKey]=useState('')
  const[step,setStep]=useState(1)
  const[connecting,setConnecting]=useState(false)
  const connect=async()=>{if(!phone||!apiKey)return;setConnecting(true);await new Promise(r=>setTimeout(r,2000));setStep(3);setConnecting(false)}
  return(
    <div style={{display:'flex',flexDirection:'column',gap:16,fontFamily:"'Outfit',sans-serif",color:T.text}}>
      {step===1&&<div>
        <div style={{fontWeight:800,fontSize:15,marginBottom:16}}>📱 Elige tu proveedor WhatsApp</div>
        {PROVIDERS.map(p=><div key={p.id} onClick={()=>setProvider(p.id)} style={{background:T.s2,border:'2px solid '+(provider===p.id?T.wa:T.border),borderRadius:12,padding:16,cursor:'pointer',marginBottom:10,display:'flex',gap:12,alignItems:'center',position:'relative'}}>
          {p.recommend&&<div style={{position:'absolute',top:-8,right:12,background:T.wa,borderRadius:20,padding:'2px 10px',fontSize:9,fontWeight:700,color:'#fff'}}>⭐ Recomendado</div>}
          <div style={{width:36,height:36,borderRadius:9,background:T.wa+'20',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,color:T.wa}}>📱</div>
          <div style={{flex:1}}><div style={{fontWeight:700,fontSize:13}}>{p.name}</div><div style={{fontSize:11,color:T.muted,marginTop:2}}>{p.desc}</div></div>
          <div style={{width:20,height:20,borderRadius:'50%',border:'2px solid '+(provider===p.id?T.wa:T.border),background:provider===p.id?T.wa:'transparent',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,color:'#fff'}}>{provider===p.id?'✓':''}</div>
        </div>)}
        <button onClick={()=>setStep(2)} style={{width:'100%',padding:'11px',border:'none',borderRadius:9,background:'linear-gradient(135deg,#25D366,#1aab53)',color:'#fff',fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>Continuar →</button>
      </div>}
      {step===2&&<div>
        <div style={{fontWeight:800,fontSize:15,marginBottom:16}}>🔧 Configura {PROVIDERS.find(p=>p.id===provider)?.name}</div>
        {[{l:'Teléfono (con prefijo)',ph:'+34 600 000 000',v:phone,s:setPhone},{l:'API Key / Token',ph:'Tu clave...',v:apiKey,s:setApiKey}].map((f,i)=><div key={i} style={{marginBottom:14}}><div style={{fontSize:10,color:T.muted,textTransform:'uppercase',letterSpacing:'0.6px',marginBottom:5}}>{f.l}</div><input value={f.v} onChange={e=>f.s(e.target.value)} placeholder={f.ph} style={{width:'100%',background:T.s3,border:'1px solid '+T.border,borderRadius:9,padding:'9px 12px',color:T.text,fontSize:13,fontFamily:'inherit',outline:'none'}}/></div>)}
        <div style={{display:'flex',gap:10}}><button onClick={()=>setStep(1)} style={{padding:'9px 16px',borderRadius:9,border:'1px solid '+T.border,background:'transparent',color:T.muted,fontSize:12,cursor:'pointer',fontFamily:'inherit'}}>← Atrás</button><button onClick={connect} disabled={connecting||!phone||!apiKey} style={{flex:1,padding:'11px',border:'none',borderRadius:9,background:'linear-gradient(135deg,#25D366,#1aab53)',color:'#fff',fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>{connecting?'⏳ Conectando...':'⚡ Conectar'}</button></div>
      </div>}
      {step===3&&<div style={{textAlign:'center',padding:40}}><div style={{fontSize:60,marginBottom:16}}>✅</div><div style={{fontWeight:800,fontSize:20,marginBottom:8,color:T.green}}>¡WhatsApp Conectado!</div><div style={{color:T.muted,fontSize:13}}>Los mensajes de {phone} aparecerán en el Inbox.</div></div>}
    </div>
  )
}