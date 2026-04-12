// @ts-nocheck
'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

const T={s2:'#121520',s3:'#181C28',border:'#232840',accent:'#3D7EFF',accentG:'rgba(61,126,255,0.15)',green:'#18CF7A',red:'#FF3559',orange:'#FF7A35',purple:'#9B72FF',cyan:'#00C8C0',text:'#D8E0F0',muted:'#5E6A88'}
const tC={active:'#18CF7A',draft:'#5E6A88',paused:'#FF7A35',inactive:'#FF3559'}
const tL={contact_created:'Nuevo contacto',deal_updated:'Deal actualizado',proposal_updated:'Propuesta actualizada',invoice_updated:'Factura actualizada'}
const aL={send_email:'📧 Enviar email',send_whatsapp:'💬 Enviar WhatsApp',create_deal:'🎯 Crear deal',add_tag:'🏷 Añadir etiqueta'}

export default function AutomationsModule({wsId}){
  const[autos,setAutos]=useState([])
  const[logs,setLogs]=useState([])
  const[loading,setLoading]=useState(true)
  const[showNew,setShowNew]=useState(false)
  const[form,setForm]=useState({name:'',description:'',trigger_type:'contact_created',action_type:'send_email',action_subject:'',action_message:''})
  const sb=createClient()

  useEffect(()=>{load()},[wsId])
  const load=async()=>{
    setLoading(true)
    const r=await fetch('/api/automations?workspace_id='+wsId)
    const d=await r.json()
    setAutos(d.automations||[]);setLogs(d.logs||[]);setLoading(false)
  }

  const save=async()=>{
    if(!form.name)return
    const nodes=[{id:'1',type:form.action_type,config:{subject:form.action_subject,message:form.action_message,delay:0}}]
    await fetch('/api/automations',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({workspace_id:wsId,name:form.name,description:form.description,trigger_type:form.trigger_type,nodes})})
    setShowNew(false);load()
  }

  const toggle=async(id,status)=>{
    const newStatus=status==='active'?'paused':'active'
    await fetch('/api/automations',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,status:newStatus})})
    load()
  }

  const totalRuns=autos.reduce((s,a)=>s+(a.run_count||0),0)
  const activeCount=autos.filter(a=>a.status==='active').length

  return(
    <div style={{display:'flex',flexDirection:'column',gap:16,fontFamily:"'Outfit',sans-serif",color:T.text}}>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12}}>
        {[{i:'⚡',l:'Total',v:autos.length,c:T.purple},{i:'✅',l:'Activas',v:activeCount,c:T.green},{i:'🔄',l:'Ejecuciones',v:totalRuns,c:T.cyan},{i:'📋',l:'Logs hoy',v:logs.length,c:T.accent}].map((s,i)=>(
          <div key={i} style={{background:T.s2,border:'1px solid '+T.border,borderRadius:14,padding:14,position:'relative',overflow:'hidden'}}>
            <div style={{position:'absolute',top:-10,right:-10,width:50,height:50,borderRadius:'50%',background:s.c,opacity:0.08}}/>
            <div style={{fontSize:18,marginBottom:6}}>{s.i}</div><div style={{fontWeight:800,fontSize:20,color:s.c}}>{s.v}</div><div style={{fontSize:11,color:T.muted,marginTop:2}}>{s.l}</div>
          </div>
        ))}
      </div>

      {showNew&&<div style={{background:T.s2,border:'1px solid '+T.border,borderRadius:14,padding:22}}>
        <div style={{display:'flex',justifyContent:'space-between',marginBottom:18}}><div style={{fontWeight:800,fontSize:15}}>⚡ Nueva Automatización</div><button onClick={()=>setShowNew(false)} style={{background:'none',border:'none',color:T.muted,fontSize:20,cursor:'pointer'}}>×</button></div>
        {[{l:'Nombre *',k:'name',ph:'Ej: Bienvenida a nuevos leads'},{l:'Descripción',k:'description',ph:'Qué hace esta automatización...'}].map(f=>(
          <div key={f.k} style={{marginBottom:14}}><div style={{fontSize:10,color:T.muted,textTransform:'uppercase',letterSpacing:'0.6px',marginBottom:5}}>{f.l}</div><input value={form[f.k]} onChange={e=>setForm(p=>({...p,[f.k]:e.target.value}))} placeholder={f.ph} style={{width:'100%',background:T.s3,border:'1px solid '+T.border,borderRadius:9,padding:'9px 12px',color:T.text,fontSize:13,fontFamily:'inherit',outline:'none'}}/></div>
        ))}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0 14px'}}>
          <div style={{marginBottom:14}}><div style={{fontSize:10,color:T.muted,textTransform:'uppercase',letterSpacing:'0.6px',marginBottom:5}}>Disparador</div><select value={form.trigger_type} onChange={e=>setForm(p=>({...p,trigger_type:e.target.value}))} style={{width:'100%',background:T.s3,border:'1px solid '+T.border,borderRadius:9,padding:'9px 12px',color:T.text,fontSize:13,fontFamily:'inherit',outline:'none'}}>{Object.entries(tL).map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></div>
          <div style={{marginBottom:14}}><div style={{fontSize:10,color:T.muted,textTransform:'uppercase',letterSpacing:'0.6px',marginBottom:5}}>Acción</div><select value={form.action_type} onChange={e=>setForm(p=>({...p,action_type:e.target.value}))} style={{width:'100%',background:T.s3,border:'1px solid '+T.border,borderRadius:9,padding:'9px 12px',color:T.text,fontSize:13,fontFamily:'inherit',outline:'none'}}>{Object.entries(aL).map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></div>
        </div>
        {(form.action_type==='send_email'||form.action_type==='send_whatsapp')&&<div style={{marginBottom:14}}><div style={{fontSize:10,color:T.muted,textTransform:'uppercase',letterSpacing:'0.6px',marginBottom:5}}>{form.action_type==='send_email'?'Asunto del email':'Mensaje WhatsApp'}</div><input value={form.action_subject||form.action_message} onChange={e=>setForm(p=>({...p,[form.action_type==='send_email'?'action_subject':'action_message']:e.target.value}))} placeholder="Usa {{first_name}} para personalizar" style={{width:'100%',background:T.s3,border:'1px solid '+T.border,borderRadius:9,padding:'9px 12px',color:T.text,fontSize:13,fontFamily:'inherit',outline:'none'}}/></div>}
        <button onClick={save} style={{width:'100%',padding:'11px',border:'none',borderRadius:9,background:'linear-gradient(135deg,#9B72FF,#3D7EFF)',color:'#fff',fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>⚡ Crear automatización</button>
      </div>}

      <div>
        <div style={{display:'flex',gap:8,marginBottom:14,alignItems:'center'}}>
          <span style={{fontSize:11,color:T.muted}}>{autos.length} automatizaciones · {totalRuns} ejecuciones totales</span>
          <button onClick={()=>setShowNew(true)} style={{marginLeft:'auto',border:'none',borderRadius:9,padding:'7px 16px',background:'linear-gradient(135deg,#9B72FF,#3D7EFF)',color:'#fff',fontSize:12,fontWeight:600,cursor:'pointer'}}>⚡ + Nueva</button>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {!autos.length&&!loading&&<div style={{background:T.s2,border:'1px solid '+T.border,borderRadius:14,padding:48,textAlign:'center'}}><div style={{fontSize:40,marginBottom:12}}>⚡</div><div style={{fontWeight:700,fontSize:16,marginBottom:8}}>Sin automatizaciones</div><div style={{color:T.muted,fontSize:13,marginBottom:20}}>Automatiza emails, deals y mensajes cuando ocurren eventos en tu CRM</div><button onClick={()=>setShowNew(true)} style={{border:'none',borderRadius:9,padding:'10px 24px',background:'linear-gradient(135deg,#9B72FF,#3D7EFF)',color:'#fff',fontSize:13,fontWeight:600,cursor:'pointer'}}>⚡ Crear primera automatización</button></div>}
          {autos.map(a=>(
            <div key={a.id} style={{background:T.s2,border:'1px solid '+T.border,borderRadius:12,padding:16,display:'flex',alignItems:'center',gap:14}}>
              <div style={{width:40,height:40,borderRadius:10,background:T.purple+'20',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>⚡</div>
              <div style={{flex:1}}>
                <div style={{fontWeight:700,fontSize:13,marginBottom:3}}>{a.name}</div>
                <div style={{fontSize:11,color:T.muted}}>{a.description}</div>
                <div style={{display:'flex',gap:12,marginTop:6}}>
                  <span style={{fontSize:10,color:T.muted}}>Disparador: <strong style={{color:T.text}}>{tL[a.trigger_type]||a.trigger_type}</strong></span>
                  <span style={{fontSize:10,color:T.muted}}>Ejecuciones: <strong style={{color:T.cyan}}>{a.run_count||0}</strong></span>
                  {a.last_run_at&&<span style={{fontSize:10,color:T.muted}}>Última: <strong style={{color:T.text}}>{new Date(a.last_run_at).toLocaleDateString('es')}</strong></span>}
                </div>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <span style={{fontSize:10,fontWeight:600,padding:'3px 10px',borderRadius:20,background:(tC[a.status]||T.muted)+'20',color:tC[a.status]||T.muted}}>{a.status}</span>
                <button onClick={()=>toggle(a.id,a.status)} style={{padding:'6px 12px',borderRadius:8,border:'1px solid '+T.border,background:'transparent',color:T.text,fontSize:11,cursor:'pointer',fontFamily:'inherit'}}>
                  {a.status==='active'?'⏸ Pausar':'▶ Activar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {logs.length>0&&<div>
        <div style={{fontWeight:700,fontSize:13,marginBottom:10,color:T.muted}}>📋 Últimas ejecuciones</div>
        <div style={{background:T.s2,border:'1px solid '+T.border,borderRadius:12,overflow:'hidden'}}>
          {logs.slice(0,5).map((l,i)=><div key={i} style={{padding:'10px 14px',borderBottom:i<4?'1px solid '+T.border:'none',display:'flex',alignItems:'center',gap:12}}>
            <span style={{fontSize:16}}>{l.status==='success'?'✅':'❌'}</span>
            <div style={{flex:1}}><div style={{fontSize:11,fontWeight:600}}>{autos.find(a=>a.id===l.automation_id)?.name||'Automatización'}</div><div style={{fontSize:10,color:T.muted}}>{new Date(l.executed_at).toLocaleString('es')}</div></div>
            <span style={{fontSize:10,padding:'2px 8px',borderRadius:20,background:(l.status==='success'?T.green:T.red)+'20',color:l.status==='success'?T.green:T.red}}>{l.status}</span>
          </div>)}
        </div>
      </div>}
    </div>
  )
}