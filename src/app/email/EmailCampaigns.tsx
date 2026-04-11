/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

const T={bg:'#07080C',s1:'#0D0F16',s2:'#121520',s3:'#181C28',border:'#232840',accent:'#3D7EFF',accentG:'rgba(61,126,255,0.15)',cyan:'#00C8C0',green:'#18CF7A',orange:'#FF7A35',red:'#FF3559',purple:'#9B72FF',text:'#D8E0F0',muted:'#5E6A88'}
const sC:Record<string,string>={sent:'#18CF7A',draft:'#5E6A88',scheduled:'#3D7EFF',sending:'#FF7A35',failed:'#FF3559'}
const sL:Record<string,string>={sent:'Enviada',draft:'Borrador',scheduled:'Programada',sending:'Enviando...',failed:'Error'}

const Card=({children,style={}}:{children:any,style?:any})=><div style={{background:T.s2,border:'1px solid '+T.border,borderRadius:14,...style}}>{children}</div>
const Pill=({c=T.accent,children,sm=false}:{c?:string,children:any,sm?:boolean})=><span style={{display:'inline-flex',alignItems:'center',padding:sm?'2px 8px':'3px 11px',borderRadius:20,fontSize:sm?10:11,fontWeight:600,background:c+'20',color:c}}>{children}</span>

export default function EmailCampaigns({wsId,contacts}:{wsId:string,contacts:any[]}) {
  const[campaigns,setCampaigns]=useState<any[]>([])
  const[loading,setLoading]=useState(true)
  const[showNew,setShowNew]=useState(false)
  const[sending,setSending]=useState(false)
  const[sendResult,setSendResult]=useState<any>(null)
  const[sel,setSel]=useState<any>(null)
  const[tab,setTab]=useState<'list'|'compose'>('list')
  const sb=createClient()

  const[form,setForm]=useState({
    name:'',subject:'',from_name:'ClientFlow CRM',from_email:'',
    html_content:'',text_content:'',
    recipients:'all',status:'draft'
  })

  useEffect(()=>{loadCampaigns()},[wsId])

  const loadCampaigns=async()=>{
    setLoading(true)
    const{data}=await sb.from('email_campaigns').select('*').eq('workspace_id',wsId).order('created_at',{ascending:false})
    setCampaigns(data||[])
    setLoading(false)
  }

  const saveDraft=async()=>{
    if(!form.name||!form.subject)return
    const{data}=await sb.from('email_campaigns').insert({
      workspace_id:wsId,name:form.name,subject:form.subject,
      from_name:form.from_name,from_email:form.from_email,
      html_content:form.html_content,text_content:form.text_content,
      status:'draft',recipients_count:contacts.filter(c=>c.email).length
    }).select().single()
    if(data){setCampaigns(p=>[data,...p]);setSel(data);setTab('list')}
  }

  const sendCampaign=async(campaign:any)=>{
    if(!confirm('¿Enviar esta campaña a '+contacts.filter(c=>c.email).length+' contactos?'))return
    setSending(true);setSendResult(null)
    try {
      const res=await fetch('/api/email/send',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          campaign_id:campaign.id,workspace_id:wsId,
          subject:campaign.subject,html_content:campaign.html_content,
          text_content:campaign.text_content,
          from_email:campaign.from_email,from_name:campaign.from_name
        })
      })
      const data=await res.json()
      if(data.success){
        setSendResult({ok:true,msg:data.message})
        loadCampaigns()
      } else {
        setSendResult({ok:false,msg:data.error})
      }
    } catch(e:any){setSendResult({ok:false,msg:e.message})}
    setSending(false)
  }

  const emailCount=contacts.filter(c=>c.email).length

  const TEMPLATES=[
    {name:'Bienvenida',subject:'¡Bienvenido a {{first_name}}!',html:'<h2>Hola {{first_name}},</h2><p>Gracias por confiar en nosotros. Estamos aquí para ayudarte.</p><p>Saludos,<br/>El equipo de ClientFlow</p>'},
    {name:'Seguimiento',subject:'¿Cómo podemos ayudarte, {{first_name}}?',html:'<h2>Hola {{first_name}},</h2><p>Queríamos hacer un seguimiento y ver si podemos ayudarte con algo.</p><p>No dudes en contactarnos.<br/>Saludos</p>'},
    {name:'Promoción',subject:'Oferta especial para ti, {{first_name}}',html:'<h2>¡Hola {{first_name}}!</h2><p>Tenemos una oferta exclusiva para ti. No te la pierdas.</p><p>Contáctanos para más información.<br/>Saludos</p>'},
    {name:'Newsletter',subject:'Novedades de este mes',html:'<h2>Hola {{first_name}},</h2><p>Este mes hemos preparado contenido especial para ti.</p><ul><li>Novedad 1</li><li>Novedad 2</li><li>Novedad 3</li></ul><p>Saludos del equipo</p>'},
  ]

  return (
    <div style={{display:'flex',flexDirection:'column',gap:16,fontFamily:"'Outfit',sans-serif"}}>
      
      {/* STATS BAR */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12}}>
        {[
          {i:'📧',l:'Campañas',v:campaigns.length,c:T.accent},
          {i:'✅',l:'Enviadas',v:campaigns.filter(c=>c.status==='sent').length,c:T.green},
          {i:'👥',l:'Contactos con email',v:emailCount,c:T.cyan},
          {i:'📬',l:'Emails enviados',v:campaigns.reduce((s:number,c:any)=>s+(c.recipients_count||0),0),c:T.purple},
        ].map((s,i)=>(
          <Card key={i} style={{padding:14,position:'relative',overflow:'hidden'}}>
            <div style={{position:'absolute',top:-10,right:-10,width:50,height:50,borderRadius:'50%',background:s.c,opacity:0.08}}/>
            <div style={{fontSize:18,marginBottom:6}}>{s.i}</div>
            <div style={{fontWeight:800,fontSize:20,color:s.c}}>{s.v}</div>
            <div style={{fontSize:11,color:T.muted,marginTop:2}}>{s.l}</div>
          </Card>
        ))}
      </div>

      {/* TABS */}
      <div style={{display:'flex',gap:8,alignItems:'center'}}>
        <div style={{display:'flex',background:T.s3,borderRadius:10,padding:3,gap:2}}>
          {(['list','compose'] as const).map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{padding:'6px 16px',borderRadius:8,border:'none',background:tab===t?T.s1:'transparent',color:tab===t?T.text:T.muted,fontSize:12,fontWeight:tab===t?600:400,cursor:'pointer'}}>
              {t==='list'?'📋 Campañas':'✏️ Nueva campaña'}
            </button>
          ))}
        </div>
        <div style={{marginLeft:'auto',fontSize:11,color:T.muted}}>
          {emailCount} contactos con email disponibles
        </div>
      </div>

      {sendResult&&(
        <div style={{padding:'12px 16px',borderRadius:10,background:sendResult.ok?T.green+'15':T.red+'15',border:'1px solid '+(sendResult.ok?T.green:T.red),color:sendResult.ok?T.green:T.red,fontSize:13,display:'flex',alignItems:'center',gap:10}}>
          <span>{sendResult.ok?'✅':'❌'}</span><span>{sendResult.msg}</span>
          <button onClick={()=>setSendResult(null)} style={{marginLeft:'auto',background:'none',border:'none',color:'inherit',cursor:'pointer',fontSize:16}}>×</button>
        </div>
      )}

      {/* LIST VIEW */}
      {tab==='list'&&(
        <div style={{display:'grid',gridTemplateColumns:sel?'1fr 340px':'1fr',gap:16}}>
          <div>
            {!campaigns.length&&!loading?(
              <Card style={{padding:48,textAlign:'center'}}>
                <div style={{fontSize:40,marginBottom:12}}>📧</div>
                <div style={{fontWeight:700,fontSize:16,marginBottom:8}}>Sin campañas aún</div>
                <div style={{color:T.muted,fontSize:13,marginBottom:20}}>Crea tu primera campaña de email y envíala a tus {emailCount} contactos</div>
                <button onClick={()=>setTab('compose')} style={{border:'none',borderRadius:9,padding:'10px 24px',background:'linear-gradient(135deg,#3D7EFF,#00C8C0)',color:'#fff',fontSize:13,fontWeight:600,cursor:'pointer'}}>✏️ Crear primera campaña</button>
              </Card>
            ):(
              <Card style={{overflow:'hidden'}}>
                <table style={{width:'100%',borderCollapse:'collapse'}}>
                  <thead><tr style={{borderBottom:'1px solid '+T.border}}>
                    {['Campaña','Asunto','Estado','Destinatarios','Fecha','Acciones'].map(h=><th key={h} style={{padding:'10px 14px',textAlign:'left',fontSize:10,color:T.muted,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.6px'}}>{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {campaigns.map(c=>(
                      <tr key={c.id} onClick={()=>setSel(sel?.id===c.id?null:c)} style={{borderBottom:'1px solid '+T.border,cursor:'pointer',background:sel?.id===c.id?T.accentG:'transparent'}}>
                        <td style={{padding:'10px 14px'}}><div style={{fontWeight:600,fontSize:12}}>{c.name}</div></td>
                        <td style={{padding:'10px 14px',fontSize:11,color:T.muted,maxWidth:200,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.subject}</td>
                        <td style={{padding:'10px 14px'}}><Pill c={sC[c.status]||T.muted} sm>{sL[c.status]||c.status}</Pill></td>
                        <td style={{padding:'10px 14px',fontSize:12,fontWeight:600}}>{c.recipients_count||emailCount}</td>
                        <td style={{padding:'10px 14px',fontSize:11,color:T.muted}}>{c.sent_at?new Date(c.sent_at).toLocaleDateString('es'):new Date(c.created_at).toLocaleDateString('es')}</td>
                        <td style={{padding:'10px 14px'}}>
                          <div style={{display:'flex',gap:6}} onClick={e=>e.stopPropagation()}>
                            {c.status==='draft'&&(
                              <button onClick={()=>sendCampaign(c)} disabled={sending} style={{padding:'5px 12px',borderRadius:7,border:'none',background:T.green,color:'#fff',fontSize:11,fontWeight:600,cursor:'pointer',opacity:sending?0.6:1}}>
                                {sending?'⏳':'🚀 Enviar'}
                              </button>
                            )}
                            {c.status==='sent'&&<Pill c={T.green} sm>✅ Enviada</Pill>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            )}
          </div>

          {/* DETAIL PANEL */}
          {sel&&(
            <Card style={{padding:18,height:'fit-content',position:'sticky',top:0}}>
              <button onClick={()=>setSel(null)} style={{float:'right',background:'none',border:'none',color:T.muted,fontSize:18,cursor:'pointer'}}>×</button>
              <div style={{fontWeight:700,fontSize:14,marginBottom:4}}>{sel.name}</div>
              <div style={{fontSize:11,color:T.muted,marginBottom:16}}>{sel.subject}</div>
              <Pill c={sC[sel.status]||T.muted}>{sL[sel.status]||sel.status}</Pill>
              
              <div style={{marginTop:16,display:'flex',flexDirection:'column',gap:10}}>
                {[
                  {l:'Remitente',v:sel.from_name+' <'+sel.from_email+'>',i:'✉️'},
                  {l:'Destinatarios',v:(sel.recipients_count||emailCount)+' contactos',i:'👥'},
                  {l:'Creada',v:new Date(sel.created_at).toLocaleDateString('es'),i:'📅'},
                  {l:'Enviada',v:sel.sent_at?new Date(sel.sent_at).toLocaleString('es'):'—',i:'🚀'},
                ].map(f=><div key={f.l} style={{display:'flex',gap:9,padding:'7px 0',borderBottom:'1px solid '+T.border}}>
                  <span style={{fontSize:12}}>{f.i}</span>
                  <div><div style={{fontSize:9,color:T.muted,textTransform:'uppercase',letterSpacing:'0.6px'}}>{f.l}</div><div style={{fontSize:11,fontWeight:500,marginTop:1}}>{f.v}</div></div>
                </div>)}
              </div>

              {sel.html_content&&(
                <div style={{marginTop:16}}>
                  <div style={{fontSize:10,color:T.muted,textTransform:'uppercase',letterSpacing:'0.6px',marginBottom:8}}>Vista previa</div>
                  <div style={{background:T.s3,borderRadius:9,padding:12,fontSize:12,color:T.text,lineHeight:1.6,maxHeight:200,overflow:'auto'}}
                    dangerouslySetInnerHTML={{__html:sel.html_content}}/>
                </div>
              )}

              {sel.status==='draft'&&(
                <button onClick={()=>sendCampaign(sel)} disabled={sending} style={{width:'100%',marginTop:14,padding:'10px',border:'none',borderRadius:9,background:'linear-gradient(135deg,#18CF7A,#00C8C0)',color:'#fff',fontSize:13,fontWeight:700,cursor:'pointer',opacity:sending?0.6:1}}>
                  {sending?'⏳ Enviando...':'🚀 Enviar campaña ahora'}
                </button>
              )}
            </Card>
          )}
        </div>
      )}

      {/* COMPOSE VIEW */}
      {tab==='compose'&&(
        <div style={{display:'grid',gridTemplateColumns:'1fr 340px',gap:16}}>
          <Card style={{padding:22}}>
            <div style={{fontWeight:800,fontSize:15,marginBottom:18}}>✏️ Nueva Campaña de Email</div>
            
            {/* Templates */}
            <div style={{marginBottom:18}}>
              <div style={{fontSize:11,color:T.muted,textTransform:'uppercase',letterSpacing:'0.6px',marginBottom:10}}>Plantillas rápidas</div>
              <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                {TEMPLATES.map(t=>(
                  <button key={t.name} onClick={()=>setForm(p=>({...p,name:t.name,subject:t.subject,html_content:t.html,text_content:t.html.replace(/<[^>]+>/g,' ')}))} style={{padding:'5px 12px',borderRadius:20,border:'1px solid '+T.border,background:form.name===t.name?T.accentG:'transparent',color:form.name===t.name?T.accent:T.muted,fontSize:11,cursor:'pointer',fontWeight:form.name===t.name?600:400}}>
                    {t.name}
                  </button>
                ))}
              </div>
            </div>

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0 14px'}}>
              <div style={{marginBottom:14}}>
                <div style={{fontSize:10,color:T.muted,textTransform:'uppercase',letterSpacing:'0.6px',marginBottom:5}}>Nombre de campaña *</div>
                <input value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="Ej: Newsletter Abril 2026" style={{width:'100%',background:T.s3,border:'1px solid '+T.border,borderRadius:9,padding:'9px 12px',color:T.text,fontSize:13,fontFamily:'inherit',outline:'none'}}/>
              </div>
              <div style={{marginBottom:14}}>
                <div style={{fontSize:10,color:T.muted,textTransform:'uppercase',letterSpacing:'0.6px',marginBottom:5}}>Asunto del email *</div>
                <input value={form.subject} onChange={e=>setForm(p=>({...p,subject:e.target.value}))} placeholder="Ej: Hola {{first_name}}, te escribimos..." style={{width:'100%',background:T.s3,border:'1px solid '+T.border,borderRadius:9,padding:'9px 12px',color:T.text,fontSize:13,fontFamily:'inherit',outline:'none'}}/>
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0 14px'}}>
              <div style={{marginBottom:14}}>
                <div style={{fontSize:10,color:T.muted,textTransform:'uppercase',letterSpacing:'0.6px',marginBottom:5}}>Nombre remitente</div>
                <input value={form.from_name} onChange={e=>setForm(p=>({...p,from_name:e.target.value}))} placeholder="ClientFlow CRM" style={{width:'100%',background:T.s3,border:'1px solid '+T.border,borderRadius:9,padding:'9px 12px',color:T.text,fontSize:13,fontFamily:'inherit',outline:'none'}}/>
              </div>
              <div style={{marginBottom:14}}>
                <div style={{fontSize:10,color:T.muted,textTransform:'uppercase',letterSpacing:'0.6px',marginBottom:5}}>Email remitente</div>
                <input type="email" value={form.from_email} onChange={e=>setForm(p=>({...p,from_email:e.target.value}))} placeholder="tu@empresa.com" style={{width:'100%',background:T.s3,border:'1px solid '+T.border,borderRadius:9,padding:'9px 12px',color:T.text,fontSize:13,fontFamily:'inherit',outline:'none'}}/>
              </div>
            </div>
            <div style={{marginBottom:14}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}>
                <div style={{fontSize:10,color:T.muted,textTransform:'uppercase',letterSpacing:'0.6px'}}>Contenido HTML</div>
                <div style={{fontSize:10,color:T.muted}}>Usa {'{{first_name}}'} y {'{{last_name}}'} para personalizar</div>
              </div>
              <textarea value={form.html_content} onChange={e=>setForm(p=>({...p,html_content:e.target.value}))} placeholder="<h2>Hola {{first_name}},</h2><p>Tu mensaje aquí...</p>" rows={10}
                style={{width:'100%',background:T.s3,border:'1px solid '+T.border,borderRadius:9,padding:'10px 12px',color:T.text,fontSize:12,fontFamily:'monospace',outline:'none',resize:'vertical'}}/>
            </div>

            <div style={{display:'flex',gap:10}}>
              <button onClick={saveDraft} style={{flex:1,padding:'11px',border:'1px solid '+T.border,borderRadius:9,background:'transparent',color:T.text,fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>💾 Guardar borrador</button>
              <button onClick={async()=>{await saveDraft();setTab('list')}} style={{flex:2,padding:'11px',border:'none',borderRadius:9,background:'linear-gradient(135deg,#3D7EFF,#00C8C0)',color:'#fff',fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>
                Guardar y revisar →
              </button>
            </div>
          </Card>

          {/* LIVE PREVIEW */}
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            <Card style={{padding:16}}>
              <div style={{fontWeight:700,fontSize:13,marginBottom:12}}>👁 Vista previa</div>
              <div style={{background:'#fff',borderRadius:9,padding:16,minHeight:200}}>
                {form.html_content?(
                  <div style={{fontSize:13,color:'#333',lineHeight:1.6}} dangerouslySetInnerHTML={{__html:form.html_content.replace(/{{first_name}}/g,'Javier').replace(/{{last_name}}/g,'A.')}}/>
                ):<div style={{color:'#999',fontSize:12,textAlign:'center',padding:40}}>El email aparecerá aquí...</div>}
              </div>
            </Card>
            <Card style={{padding:16}}>
              <div style={{fontWeight:700,fontSize:12,marginBottom:10}}>📊 Destinatarios</div>
              <div style={{fontSize:24,fontWeight:800,color:T.cyan}}>{emailCount}</div>
              <div style={{fontSize:11,color:T.muted,marginTop:2}}>contactos con email válido</div>
              <div style={{marginTop:12}}>
                {['meta_ads','google_ads','whatsapp','form','email'].map(src=>{
                  const count=contacts.filter(c=>c.source===src&&c.email).length
                  if(!count)return null
                  return <div key={src} style={{display:'flex',justifyContent:'space-between',fontSize:11,padding:'4px 0',borderBottom:'1px solid '+T.border}}><span style={{color:T.muted}}>{src.replace('_',' ')}</span><span style={{fontWeight:600}}>{count}</span></div>
                })}
              </div>
            </Card>
            <Card style={{padding:14,background:T.orange+'10',border:'1px solid '+T.orange+'40'}}>
              <div style={{fontWeight:700,fontSize:12,color:T.orange,marginBottom:6}}>⚠️ Requiere SendGrid</div>
              <div style={{fontSize:11,color:T.muted,lineHeight:1.5}}>Para enviar emails reales necesitas añadir tu API key de SendGrid en Vercel → Settings → Environment Variables → <code style={{background:T.s3,padding:'1px 5px',borderRadius:4,fontSize:10}}>SENDGRID_API_KEY</code></div>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
