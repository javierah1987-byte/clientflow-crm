// @ts-nocheck
'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
const T={s1:'#0D0F16',s2:'#121520',s3:'#181C28',border:'#232840',accent:'#3D7EFF',green:'#18CF7A',text:'#D8E0F0',muted:'#5E6A88'}
const STEPS=[
  {id:'profile',icon:'👤',title:'Completa tu perfil',desc:'Añade el nombre de tu empresa',action:'Completar'},
  {id:'import_contacts',icon:'👥',title:'Importa tus contactos',desc:'Sube tu lista de clientes en CSV',action:'Importar CSV'},
  {id:'first_deal',icon:'🎯',title:'Crea tu primera oportunidad',desc:'Añade un deal al pipeline',action:'Crear deal'},
  {id:'send_email',icon:'📧',title:'Envía tu primera campaña',desc:'Email a todos tus contactos',action:'Crear campaña'},
  {id:'connect_whatsapp',icon:'💬',title:'Conecta WhatsApp',desc:'Recibe mensajes en el CRM',action:'Conectar'},
  {id:'create_proposal',icon:'🤖',title:'Genera una propuesta IA',desc:'Claude crea tu primera propuesta',action:'Generar'},
]
export default function OnboardingWizard({wsId,userId,onComplete}) {
  const[steps,setSteps]=useState([])
  const[loading,setLoading]=useState(true)
  const sb=createClient()
  useEffect(()=>{load()},[wsId])
  const load=async()=>{
    const{data}=await sb.from('onboarding_steps').select('*').eq('workspace_id',wsId).eq('user_id',userId)
    setSteps(data||[]);setLoading(false)
  }
  const complete=async(stepId)=>{
    await sb.from('onboarding_steps').upsert({workspace_id:wsId,user_id:userId,step:stepId,completed:true,completed_at:new Date().toISOString()},{onConflict:'workspace_id,user_id,step'})
    load()
  }
  const done=steps.filter(s=>s.completed).length
  const pct=Math.round(done/STEPS.length*100)
  const allDone=done===STEPS.length
  if(loading)return null
  return(
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.82)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:2000,fontFamily:"'Outfit',sans-serif"}}>
      <div style={{background:T.s1,border:'1px solid '+T.border,borderRadius:20,padding:36,width:520,maxHeight:'90vh',overflowY:'auto'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:24}}>
          <div>
            <div style={{fontWeight:900,fontSize:22,marginBottom:4}}>{allDone?'🎉 ¡Setup completo!':'🚀 Bienvenido a ClientFlow'}</div>
            <div style={{fontSize:13,color:T.muted}}>{allDone?'Ya tienes todo listo. ¡A vender!':'Completa estos pasos para sacarle el máximo partido'}</div>
          </div>
          <button onClick={onComplete} style={{background:'none',border:'none',color:T.muted,fontSize:24,cursor:'pointer',lineHeight:1}}>×</button>
        </div>
        <div style={{marginBottom:24}}>
          <div style={{display:'flex',justifyContent:'space-between',fontSize:12,marginBottom:8}}>
            <span style={{color:T.muted}}>{done} de {STEPS.length} pasos</span>
            <span style={{color:T.accent,fontWeight:700}}>{pct}%</span>
          </div>
          <div style={{height:8,borderRadius:4,background:T.s3}}>
            <div style={{height:'100%',borderRadius:4,background:'linear-gradient(90deg,#3D7EFF,#00C8C0)',width:pct+'%',transition:'width 0.5s ease'}}/>
          </div>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {STEPS.map(step=>{
            const isDone=steps.find(s=>s.step===step.id)?.completed
            return(
              <div key={step.id} style={{display:'flex',gap:14,alignItems:'center',padding:14,borderRadius:12,background:isDone?T.green+'10':T.s2,border:'1px solid '+(isDone?T.green+'30':T.border)}}>
                <div style={{width:40,height:40,borderRadius:10,background:isDone?T.green+'20':T.s3,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>{isDone?'✅':step.icon}</div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,fontSize:13,color:isDone?T.green:T.text,marginBottom:2}}>{step.title}</div>
                  <div style={{fontSize:11,color:T.muted}}>{step.desc}</div>
                </div>
                {!isDone&&<button onClick={()=>complete(step.id)} style={{padding:'7px 14px',borderRadius:8,border:'none',background:'linear-gradient(135deg,#3D7EFF,#00C8C0)',color:'#fff',fontSize:11,fontWeight:700,cursor:'pointer',fontFamily:'inherit',whiteSpace:'nowrap'}}>{step.action}</button>}
                {isDone&&<span style={{fontSize:11,color:T.green,fontWeight:700,flexShrink:0}}>✓ Hecho</span>}
              </div>
            )
          })}
        </div>
        {allDone&&<div style={{marginTop:20,padding:18,background:'linear-gradient(135deg,#3D7EFF15,#00C8C015)',border:'1px solid #3D7EFF30',borderRadius:12,textAlign:'center'}}>
          <div style={{fontSize:36,marginBottom:8}}>🎉</div>
          <div style={{fontWeight:700,fontSize:15,marginBottom:8}}>¡Eres un experto en ClientFlow!</div>
          <button onClick={onComplete} style={{padding:'10px 28px',border:'none',borderRadius:9,background:'linear-gradient(135deg,#3D7EFF,#00C8C0)',color:'#fff',fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>Ir al Dashboard →</button>
        </div>}
      </div>
    </div>
  )
}