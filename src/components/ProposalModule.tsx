/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

const T={s2:'#121520',s3:'#181C28',border:'#232840',accent:'#3D7EFF',accentG:'rgba(61,126,255,0.15)',green:'#18CF7A',red:'#FF3559',purple:'#9B72FF',text:'#D8E0F0',muted:'#5E6A88'}
const sC:Record<string,string>={draft:'#5E6A88',sent:'#3D7EFF',accepted:'#18CF7A',rejected:'#FF3559',paid:'#00C8C0'}
const sL:Record<string,string>={draft:'Borrador',sent:'Enviada',accepted:'Aceptada',rejected:'Rechazada',paid:'Pagada'}

export default function ProposalModule({wsId,contacts}:{wsId:string,contacts:any[]}){
  const[proposals,setProposals]=useState<any[]>([])
  const[loading,setLoading]=useState(true)
  const[generating,setGenerating]=useState(false)
  const[showForm,setShowForm]=useState(false)
  const[sel,setSel]=useState<any>(null)
  const[result,setResult]=useState<any>(null)
  const[form,setForm]=useState({contact_id:'',company_name:'',contact_name:'',services:'',budget:'',notes:''})
  const sb=createClient()

  useEffect(()=>{load()},[wsId])
  const load=async()=>{setLoading(true);const{data}=await sb.from('proposals').select('*,contact:contacts(first_name,last_name)').eq('workspace_id',wsId).order('created_at',{ascending:false});setProposals(data||[]);setLoading(false)}

  const generate=async()=>{
    if(!form.contact_name&&!form.company_name)return
    setGenerating(true);setResult(null)
    try{
      const res=await fetch('/api/proposals/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...form,workspace_id:wsId})})
      const data=await res.json()
      if(data.success){setResult({ok:true,msg:'Propuesta generada y guardada ✅'});load();setShowForm(false)}
      else setResult({ok:false,msg:data.error||'Error al generar'})
    }catch(e:any){setResult({ok:false,msg:e.message})}
    setGenerating(false)
  }

  const updateStatus=async(id:string,status:string)=>{
    await sb.from('proposals').update({status}).eq('id',id)
    setProposals(p=>p.map((x:any)=>x.id===id?{...x,status}:x))
    if(sel?.id===id)setSel((p:any)=>({...p,status}))
  }

  const inp=(label:string,val:string,set:(v:string)=>void,ph='',type='text')=>(
    <div style={{marginBottom:14}}>
      <div style={{fontSize:10,color:T.muted,textTransform:'uppercase' as const,letterSpacing:'0.6px',marginBottom:5}}>{label}</div>
      {type==='textarea'
        ?<textarea value={val} onChange={e=>set(e.target.value)} placeholder={ph} rows={3} style={{width:'100%',background:T.s3,border:'1px solid '+T.border,borderRadius:9,padding:'9px 12px',color:T.text,fontSize:13,fontFamily:'inherit',outline:'none',resize:'vertical' as const}}/>
        :<input type={type} value={val} onChange={e=>set(e.target.value)} placeholder={ph} style={{width:'100%',background:T.s3,border:'1px solid '+T.border,borderRadius:9,padding:'9px 12px',color:T.text,fontSize:13,fontFamily:'inherit',outline:'none'}}/>
      }
    </div>
  )

  return(
    <div style={{display:'flex',flexDirection:'column' as const,gap:16,fontFamily:"'Outfit',sans-serif",color:T.text}}>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12}}>
        {[{i:'📄',l:'Total',v:proposals.length,c:T.accent},{i:'✅',l:'Aceptadas',v:proposals.filter(p=>p.status==='accepted').length,c:T.green},{i:'⏳',l:'Enviadas',v:proposals.filter(p=>p.status==='sent').length,c:'#3D7EFF'},{i:'💰',l:'Valor aceptado',v:'€'+proposals.filter(p=>p.status==='accepted').reduce((s:number,p:any)=>s+(p.total_amount||0),0).toLocaleString(),c:'#9B72FF'}].map((s,i)=>(
          <div key={i} style={{background:T.s2,border:'1px solid '+T.border,borderRadius:14,padding:14,position:'relative',overflow:'hidden'}}>
            <div style={{position:'absolute',top:-10,right:-10,width:50,height:50,borderRadius:'50%',background:s.c,opacity:0.08}}/>
            <div style={{fontSize:18,marginBottom:6}}>{s.i}</div>
            <div style={{fontWeight:800,fontSize:20,color:s.c}}>{s.v}</div>
            <div style={{fontSize:11,color:T.muted,marginTop:2}}>{s.l}</div>
          </div>
        ))}
      </div>

      {result&&<div style={{padding:'12px 16px',borderRadius:10,background:result.ok?T.green+'15':T.red+'15',border:'1px solid '+(result.ok?T.green:T.red)+'40',color:result.ok?T.green:T.red,fontSize:13,display:'flex',justifyContent:'space-between',alignItems:'center'}}><span>{result.msg}</span><button onClick={()=>setResult(null)} style={{background:'none',border:'none',color:'inherit',cursor:'pointer',fontSize:16}}>×</button></div>}

      {showForm&&<div style={{background:T.s2,border:'1px solid '+T.border,borderRadius:14,padding:22}}>
        <div style={{display:'flex',justifyContent:'space-between',marginBottom:18}}><div style={{fontWeight:800,fontSize:15}}>🤖 Generar Propuesta con IA</div><button onClick={()=>setShowForm(false)} style={{background:'none',border:'none',color:T.muted,fontSize:20,cursor:'pointer'}}>×</button></div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0 14px'}}>
          {inp('Nombre contacto *',form.contact_name,v=>setForm(p=>({...p,contact_name:v})),'Sofía Martínez')}
          {inp('Empresa',form.company_name,v=>setForm(p=>({...p,company_name:v})),'TechVision S.A.')}
        </div>
        {inp('Servicios a proponer *',form.services,v=>setForm(p=>({...p,services:v})),'CRM, formación, soporte 6 meses...','textarea')}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0 14px'}}>
          {inp('Presupuesto (€)',form.budget,v=>setForm(p=>({...p,budget:v})),'5000','number')}
          <div style={{marginBottom:14}}>
            <div style={{fontSize:10,color:T.muted,textTransform:'uppercase' as const,letterSpacing:'0.6px',marginBottom:5}}>Contacto (opcional)</div>
            <select value={form.contact_id} onChange={e=>setForm(p=>({...p,contact_id:e.target.value}))} style={{width:'100%',background:T.s3,border:'1px solid '+T.border,borderRadius:9,padding:'9px 12px',color:T.text,fontSize:13,fontFamily:'inherit',outline:'none'}}>
              <option value="">— Ninguno —</option>
              {contacts.map((c:any)=><option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}
            </select>
          </div>
        </div>
        {inp('Notas adicionales',form.notes,v=>setForm(p=>({...p,notes:v})),'Cliente interesado en plan anual...')}
        <button onClick={generate} disabled={generating} style={{width:'100%',padding:'12px',border:'none',borderRadius:10,background:generating?T.s3:'linear-gradient(135deg,#9B72FF,#3D7EFF)',color:'#fff',fontSize:14,fontWeight:700,cursor:generating?'default':'pointer',fontFamily:'inherit'}}>
          {generating?'⟳ Generando con IA...':'🤖 Generar Propuesta'}
        </button>
      </div>}

      <div style={{display:'grid',gridTemplateColumns:sel?'1fr 380px':'1fr',gap:16}}>
        <div>
          <div style={{display:'flex',gap:8,marginBottom:14,alignItems:'center'}}>
            <span style={{fontSize:11,color:T.muted}}>{proposals.length} propuestas</span>
            <button onClick={()=>{setShowForm(true);setSel(null)}} style={{marginLeft:'auto',border:'none',borderRadius:9,padding:'7px 16px',background:'linear-gradient(135deg,#9B72FF,#3D7EFF)',color:'#fff',fontSize:12,fontWeight:600,cursor:'pointer'}}>🤖 + Generar con IA</button>
          </div>
          {!proposals.length&&!loading
            ?<div style={{background:T.s2,border:'1px solid '+T.border,borderRadius:14,padding:48,textAlign:'center'}}><div style={{fontSize:40,marginBottom:12}}>📄</div><div style={{fontWeight:700,fontSize:16,marginBottom:8}}>Sin propuestas aún</div><div style={{color:T.muted,fontSize:13,marginBottom:20}}>Genera propuestas comerciales profesionales con IA en segundos</div><button onClick={()=>setShowForm(true)} style={{border:'none',borderRadius:9,padding:'10px 24px',background:'linear-gradient(135deg,#9B72FF,#3D7EFF)',color:'#fff',fontSize:13,fontWeight:600,cursor:'pointer'}}>🤖 Generar primera propuesta</button></div>
            :<div style={{background:T.s2,border:'1px solid '+T.border,borderRadius:14,overflow:'hidden'}}>
              <table style={{width:'100%',borderCollapse:'collapse' as const}}>
                <thead><tr style={{borderBottom:'1px solid '+T.border}}>{['Propuesta','Cliente','Valor','Estado','Válida hasta','Cambiar estado'].map(h=><th key={h} style={{padding:'9px 14px',textAlign:'left' as const,fontSize:10,color:T.muted,fontWeight:600,textTransform:'uppercase' as const,letterSpacing:'0.6px'}}>{h}</th>)}</tr></thead>
                <tbody>{proposals.map((p:any)=><tr key={p.id} onClick={()=>setSel(sel?.id===p.id?null:p)} style={{borderBottom:'1px solid '+T.border,cursor:'pointer',background:sel?.id===p.id?T.accentG:'transparent'}}>
                  <td style={{padding:'9px 14px',fontWeight:600,fontSize:12}}>{p.title}</td>
                  <td style={{padding:'9px 14px',fontSize:11,color:T.muted}}>{p.contact?.first_name||'—'} {p.contact?.last_name||''}</td>
                  <td style={{padding:'9px 14px',fontSize:12,fontWeight:700}}>€{(p.total_amount||0).toLocaleString()}</td>
                  <td style={{padding:'9px 14px'}}><span style={{display:'inline-flex',alignItems:'center',padding:'2px 8px',borderRadius:20,fontSize:10,fontWeight:600,background:(sC[p.status]||T.muted)+'20',color:sC[p.status]||T.muted}}>{sL[p.status]||p.status}</span></td>
                  <td style={{padding:'9px 14px',fontSize:11,color:T.muted}}>{p.valid_until?new Date(p.valid_until).toLocaleDateString('es'):'—'}</td>
                  <td style={{padding:'9px 14px'}} onClick={e=>e.stopPropagation()}>
                    <select value={p.status} onChange={e=>updateStatus(p.id,e.target.value)} style={{background:T.s3,border:'1px solid '+T.border,borderRadius:7,padding:'4px 8px',color:T.text,fontSize:11,fontFamily:'inherit',cursor:'pointer'}}>
                      {Object.entries(sL).map(([v,l])=><option key={v} value={v}>{l as string}</option>)}
                    </select>
                  </td>
                </tr>)}</tbody>
              </table>
            </div>
          }
        </div>
        {sel&&<div style={{background:T.s2,border:'1px solid '+T.border,borderRadius:14,padding:18,height:'fit-content',position:'sticky',top:0,maxHeight:'80vh',overflowY:'auto'}}>
          <button onClick={()=>setSel(null)} style={{float:'right',background:'none',border:'none',color:T.muted,fontSize:18,cursor:'pointer'}}>×</button>
          <div style={{fontWeight:700,fontSize:14,marginBottom:4}}>{sel.title}</div>
          <div style={{fontSize:11,color:T.muted,marginBottom:12}}>Creada {new Date(sel.created_at).toLocaleDateString('es')}</div>
          {sel.content&&<div style={{background:'#fff',borderRadius:9,padding:16,fontSize:12,color:'#333',lineHeight:1.7}} dangerouslySetInnerHTML={{__html:sel.content}}/>}
        </div>}
      </div>
    </div>
  )
}