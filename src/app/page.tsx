/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

const T={bg:'#07080C',s1:'#0D0F16',s2:'#121520',s3:'#181C28',border:'#232840',accent:'#3D7EFF',accentG:'rgba(61,126,255,0.15)',cyan:'#00C8C0',green:'#18CF7A',orange:'#FF7A35',red:'#FF3559',purple:'#9B72FF',text:'#D8E0F0',muted:'#5E6A88',faint:'#252D45',meta:'#1877F2',google:'#4285F4',wa:'#25D366'}
const NAV:any[]=[{g:'INICIO',items:[{id:'dashboard',label:'Dashboard',icon:'▣'}]},{g:'CONTACTOS',items:[{id:'contactos',label:'Contactos',icon:'◉'},{id:'empresas',label:'Empresas',icon:'⬡'},{id:'actividades',label:'Actividades',icon:'◈'}]},{g:'VENTAS',items:[{id:'pipeline',label:'Oportunidades',icon:'⇢'},{id:'propuestas',label:'Propuestas IA',icon:'◧',badge:'IA',badgeC:'#9B72FF'},{id:'facturas',label:'Facturas',icon:'◪'}]},{g:'COMUNICACIÓN',items:[{id:'inbox',label:'WhatsApp',icon:'◎',badgeC:'#18CF7A'},{id:'email',label:'Email',icon:'◈'}]},{g:'CAPTACIÓN',items:[{id:'meta',label:'Meta Ads',icon:'f'},{id:'google',label:'Google Ads',icon:'G'},{id:'social',label:'Social',icon:'◓'}]},{g:'ANÁLISIS',items:[{id:'reportes',label:'Reportes',icon:'◻'},{id:'automatizaciones',label:'Automatizaciones',icon:'⚡'}]}]
const sC:Record<string,string>={client:'#18CF7A',lead:'#3D7EFF',prospect:'#FF7A35',inactive:'#5E6A88'}
const sL:Record<string,string>={client:'Cliente',lead:'Lead',prospect:'Prospecto',inactive:'Inactivo'}
const Pill=({c=T.accent,children,sm=false}:{c?:string,children:any,sm?:boolean})=><span style={{display:'inline-flex',alignItems:'center',padding:sm?'2px 8px':'3px 11px',borderRadius:20,fontSize:sm?10:11,fontWeight:600,background:c+'20',color:c}}>{children}</span>
const Card=({children,style={}}:{children:any,style?:any})=><div style={{background:T.s2,border:'1px solid '+T.border,borderRadius:14,...style}}>{children}</div>
const Input=({label,value,onChange,type='text',placeholder=''}:any)=><div style={{marginBottom:14}}><div style={{fontSize:10,color:T.muted,textTransform:'uppercase',letterSpacing:'0.6px',marginBottom:5}}>{label}</div><input type={type} value={value} onChange={onChange} placeholder={placeholder} style={{width:'100%',background:T.s3,border:'1px solid '+T.border,borderRadius:9,padding:'9px 12px',color:T.text,fontSize:13,fontFamily:'inherit',outline:'none'}}/></div>
const Sel=({label,value,onChange,opts}:any)=><div style={{marginBottom:14}}><div style={{fontSize:10,color:T.muted,textTransform:'uppercase',letterSpacing:'0.6px',marginBottom:5}}>{label}</div><select value={value} onChange={onChange} style={{width:'100%',background:T.s3,border:'1px solid '+T.border,borderRadius:9,padding:'9px 12px',color:T.text,fontSize:13,fontFamily:'inherit',outline:'none'}}>{opts.map((o:any)=><option key={o.v} value={o.v}>{o.l}</option>)}</select></div>

export default function CRM(){
  const[nav,setNav]=useState('dashboard')
  const[search,setSearch]=useState('')
  const[sel,setSel]=useState<any>(null)
  const[user,setUser]=useState<any>(null)
  const[ws,setWs]=useState<any>(null)
  const[contacts,setContacts]=useState<any[]>([])
  const[deals,setDeals]=useState<any[]>([])
  const[stages,setStages]=useState<any[]>([])
  const[stats,setStats]=useState({contacts:0,leads:0,revenue:0,proposals:0})
  const[loading,setLoading]=useState(true)
  const[showNewContact,setShowNewContact]=useState(false)
  const[showNewDeal,setShowNewDeal]=useState(false)
  const[saving,setSaving]=useState(false)
  const[msg,setMsg]=useState('')
  const[waChats,setWaChats]=useState<any[]>([])
  const[selChat,setSelChat]=useState<any>(null)
  const[waMsgs,setWaMsgs]=useState<any[]>([])
  const endRef=useRef<HTMLDivElement>(null)
  const sb=createClient()

  // New contact form state
  const[nc,setNc]=useState({first_name:'',last_name:'',email:'',phone:'',city:'',status:'lead',source:'',lifetime_value:0})
  // New deal form state
  const[nd,setNd]=useState({title:'',value:0,stage_id:'',contact_id:'',probability:50})

  useEffect(()=>{
    sb.auth.getUser().then(({data})=>{
      if(!data.user){window.location.href='/login';return}
      setUser(data.user)
      sb.from('workspaces').select('*').eq('slug','clientflow-demo').single()
        .then(({data:w})=>{if(w){setWs(w);load(w.id)}else setLoading(false)})
    })
  },[])

  useEffect(()=>{endRef.current?.scrollIntoView({behavior:'smooth'})},[waMsgs])

  const load=async(id:string)=>{
    setLoading(true)
    const[c,d,p,st]=await Promise.all([
      sb.from('contacts').select('*,company:companies(name)').eq('workspace_id',id).order('created_at',{ascending:false}),
      sb.from('deals').select('*,contact:contacts(first_name,last_name),stage:pipeline_stages(name,color,position)').eq('workspace_id',id),
      sb.from('proposals').select('id',{count:'exact'}).eq('workspace_id',id),
      sb.from('pipeline_stages').select('*').eq('workspace_id',id).order('position'),
    ])
    const cl=c.data||[],dl=d.data||[]
    setContacts(cl);setDeals(dl);setStages(st.data||[])
    setStats({contacts:cl.length,leads:cl.filter((x:any)=>x.status==='lead').length,revenue:cl.reduce((s:number,x:any)=>s+(x.lifetime_value||0),0),proposals:p.count||0})
    setLoading(false)
    sb.from('wa_conversations').select('*,contact:contacts(first_name,last_name,phone)').eq('workspace_id',id).order('last_message_at',{ascending:false}).then(({data})=>setWaChats(data||[]))
    // Real-time
    sb.channel('rt-contacts').on('postgres_changes',{event:'*',schema:'public',table:'contacts',filter:'workspace_id=eq.'+id},()=>load(id)).subscribe()
    sb.channel('rt-deals').on('postgres_changes',{event:'*',schema:'public',table:'deals',filter:'workspace_id=eq.'+id},()=>sb.from('deals').select('*,contact:contacts(first_name,last_name),stage:pipeline_stages(name,color,position)').eq('workspace_id',id).then(({data})=>setDeals(data||[]))).subscribe()
  }

  const saveContact=async()=>{
    if(!nc.first_name||!nc.email)return
    setSaving(true)
    await sb.from('contacts').insert({...nc,workspace_id:ws.id,lifetime_value:Number(nc.lifetime_value)||0})
    setNc({first_name:'',last_name:'',email:'',phone:'',city:'',status:'lead',source:'',lifetime_value:0})
    setShowNewContact(false)
    setSaving(false)
  }

  const saveDeal=async()=>{
    if(!nd.title)return
    setSaving(true)
    await sb.from('deals').insert({...nd,workspace_id:ws.id,value:Number(nd.value)||0,probability:Number(nd.probability)||50})
    setNd({title:'',value:0,stage_id:'',contact_id:'',probability:50})
    setShowNewDeal(false)
    setSaving(false)
  }

  const deleteContact=async(id:string)=>{
    if(!confirm('¿Eliminar este contacto?'))return
    await sb.from('contacts').delete().eq('id',id)
    setContacts(p=>p.filter((c:any)=>c.id!==id))
    setSel(null)
  }

  const logout=async()=>{await sb.auth.signOut();window.location.href='/login'}
  const selectChat=async(chat:any)=>{setSelChat(chat);const{data}=await sb.from('wa_messages').select('*').eq('conversation_id',chat.id).order('created_at');setWaMsgs(data||[])}
  const sendWA=async()=>{if(!msg.trim()||!selChat)return;const m={workspace_id:ws?.id,conversation_id:selChat.id,direction:'outbound',type:'text',content:msg,status:'sent',sent_at:new Date().toISOString()};await sb.from('wa_messages').insert(m);setWaMsgs(p=>[...p,{...m,id:Date.now()}]);setMsg('')}

  const allItems=NAV.flatMap((g:any)=>g.items)
  const curLabel=allItems.find((i:any)=>i.id===nav)?.label||'Dashboard'
  const bars=[38,55,42,72,60,85,68,74,90,78,95,88]
  const filtered=contacts.filter((c:any)=>(c.first_name+' '+c.last_name).toLowerCase().includes(search.toLowerCase())||(c.email||'').toLowerCase().includes(search.toLowerCase()))
  const kg=deals.reduce((acc:any,d:any)=>{const n=d.stage?.name||'Sin etapa';if(!acc[n])acc[n]={color:d.stage?.color||T.muted,deals:[],pos:d.stage?.position||99};acc[n].deals.push(d);return acc},{})

  const Modal=({title,onClose,onSave,children}:any)=>(
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000}}>
      <div style={{background:T.s1,border:'1px solid '+T.border,borderRadius:16,padding:28,width:460,maxHeight:'85vh',overflowY:'auto'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:22}}>
          <div style={{fontWeight:800,fontSize:16}}>{title}</div>
          <button onClick={onClose} style={{background:'none',border:'none',color:T.muted,fontSize:20,cursor:'pointer',lineHeight:1}}>×</button>
        </div>
        {children}
        <div style={{display:'flex',gap:10,marginTop:20}}>
          <button onClick={onClose} style={{flex:1,padding:'10px',borderRadius:9,border:'1px solid '+T.border,background:'transparent',color:T.muted,fontSize:13,cursor:'pointer'}}>Cancelar</button>
          <button onClick={onSave} disabled={saving} style={{flex:2,padding:'10px',borderRadius:9,border:'none',background:'linear-gradient(135deg,#3D7EFF,#00C8C0)',color:'#fff',fontSize:13,fontWeight:700,cursor:'pointer',opacity:saving?0.7:1}}>
            {saving?'Guardando...':'💾 Guardar en Supabase'}
          </button>
        </div>
      </div>
    </div>
  )

  return(
    <div style={{display:'flex',height:'100vh',background:T.bg,fontFamily:"'Outfit',sans-serif",color:T.text,overflow:'hidden'}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');*{box-sizing:border-box;margin:0;padding:0}::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:#232840;border-radius:3px}input,button,select{font-family:inherit;outline:none}@keyframes fi{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}.fi{animation:fi 0.2s ease}tr:hover td{background:#181C28!important}`}</style>

      {/* MODALES */}
      {showNewContact&&<Modal title="➕ Nuevo Contacto" onClose={()=>setShowNewContact(false)} onSave={saveContact}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0 14px'}}>
          <Input label="Nombre *" value={nc.first_name} onChange={(e:any)=>setNc({...nc,first_name:e.target.value})} placeholder="Ej: Sofía"/>
          <Input label="Apellido" value={nc.last_name} onChange={(e:any)=>setNc({...nc,last_name:e.target.value})} placeholder="Ej: Martínez"/>
        </div>
        <Input label="Email *" type="email" value={nc.email} onChange={(e:any)=>setNc({...nc,email:e.target.value})} placeholder="sofia@empresa.com"/>
        <Input label="Teléfono" value={nc.phone} onChange={(e:any)=>setNc({...nc,phone:e.target.value})} placeholder="+34 600 000 000"/>
        <Input label="Ciudad" value={nc.city} onChange={(e:any)=>setNc({...nc,city:e.target.value})} placeholder="Madrid"/>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0 14px'}}>
          <Sel label="Estado" value={nc.status} onChange={(e:any)=>setNc({...nc,status:e.target.value})} opts={[{v:'lead',l:'Lead'},{v:'prospect',l:'Prospecto'},{v:'client',l:'Cliente'}]}/>
          <Sel label="Origen" value={nc.source} onChange={(e:any)=>setNc({...nc,source:e.target.value})} opts={[{v:'',l:'— Seleccionar —'},{v:'meta_ads',l:'Meta Ads'},{v:'google_ads',l:'Google Ads'},{v:'whatsapp',l:'WhatsApp'},{v:'form',l:'Formulario'},{v:'email',l:'Email'},{v:'organic',l:'Orgánico'},{v:'referral',l:'Referido'}]}/>
        </div>
        <Input label="Valor potencial (€)" type="number" value={nc.lifetime_value} onChange={(e:any)=>setNc({...nc,lifetime_value:e.target.value})} placeholder="5000"/>
      </Modal>}

      {showNewDeal&&<Modal title="🎯 Nueva Oportunidad" onClose={()=>setShowNewDeal(false)} onSave={saveDeal}>
        <Input label="Título *" value={nd.title} onChange={(e:any)=>setNd({...nd,title:e.target.value})} placeholder="Ej: Propuesta CRM Empresa X"/>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0 14px'}}>
          <Input label="Valor (€)" type="number" value={nd.value} onChange={(e:any)=>setNd({...nd,value:e.target.value})} placeholder="10000"/>
          <Input label="Probabilidad %" type="number" value={nd.probability} onChange={(e:any)=>setNd({...nd,probability:e.target.value})} placeholder="50"/>
        </div>
        <Sel label="Etapa" value={nd.stage_id} onChange={(e:any)=>setNd({...nd,stage_id:e.target.value})} opts={[{v:'',l:'— Seleccionar —'},...stages.map((s:any)=>({v:s.id,l:s.name}))]}/>
        <Sel label="Contacto" value={nd.contact_id} onChange={(e:any)=>setNd({...nd,contact_id:e.target.value})} opts={[{v:'',l:'— Ninguno —'},...contacts.map((c:any)=>({v:c.id,l:c.first_name+' '+c.last_name}))]}/>
      </Modal>}

      {/* SIDEBAR */}
      <aside style={{width:220,background:T.s1,borderRight:'1px solid '+T.border,display:'flex',flexDirection:'column',flexShrink:0,overflowY:'auto'}}>
        <div style={{padding:'18px 14px 16px',borderBottom:'1px solid '+T.border,display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:32,height:32,borderRadius:9,background:'linear-gradient(135deg,#3D7EFF,#00C8C0)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,boxShadow:'0 0 20px rgba(61,126,255,0.3)'}}>⬡</div>
          <div><div style={{fontWeight:800,fontSize:15}}>ClientFlow</div><div style={{fontSize:9,color:T.muted,textTransform:'uppercase',letterSpacing:'1px'}}>CRM Pro</div></div>
        </div>
        <div style={{flex:1,padding:'10px 8px'}}>
          {NAV.map((g:any)=>(
            <div key={g.g}>
              <div style={{fontSize:9,color:T.faint,fontWeight:700,letterSpacing:'1.5px',padding:'8px 8px 3px',textTransform:'uppercase'}}>{g.g}</div>
              {g.items.map((item:any)=>{const active=nav===item.id;return(
                <button key={item.id} onClick={()=>{setNav(item.id);setSel(null)}} style={{width:'100%',display:'flex',alignItems:'center',gap:9,padding:'8px 9px',borderRadius:8,border:'none',background:active?T.accentG:'transparent',color:active?T.text:T.muted,fontSize:11.5,fontWeight:active?600:400,marginBottom:1,cursor:'pointer',textAlign:'left'}}>
                  <span style={{fontSize:14}}>{item.icon}</span><span style={{flex:1}}>{item.label}</span>
                  {item.badge&&<span style={{fontSize:9,fontWeight:700,padding:'1px 6px',borderRadius:20,background:(item.badgeC||T.accent)+'22',color:item.badgeC||T.accent}}>{item.badge}</span>}
                  {active&&<div style={{width:4,height:4,borderRadius:'50%',background:T.accent,flexShrink:0}}/>}
                </button>
              )})}
            </div>
          ))}
        </div>
        <div style={{padding:'12px 14px',borderTop:'1px solid '+T.border}}>
          <div style={{display:'flex',alignItems:'center',gap:9,marginBottom:10}}>
            <div style={{width:28,height:28,borderRadius:'50%',background:'linear-gradient(135deg,#3D7EFF,#00C8C0)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,color:'#fff'}}>{user?.email?.[0]?.toUpperCase()||'U'}</div>
            <div style={{flex:1,minWidth:0}}><div style={{fontSize:11,fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{user?.email||'Usuario'}</div><div style={{fontSize:9,color:T.green}}>● Supabase Live</div></div>
          </div>
          <button onClick={logout} style={{width:'100%',padding:'6px',borderRadius:8,border:'1px solid '+T.border,background:'transparent',color:T.muted,fontSize:10,cursor:'pointer'}}>Cerrar sesión</button>
        </div>
      </aside>

      {/* MAIN */}
      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
        <header style={{background:T.s1,borderBottom:'1px solid '+T.border,padding:'11px 22px',display:'flex',alignItems:'center',gap:14,flexShrink:0}}>
          <h1 style={{fontWeight:800,fontSize:17}}>{curLabel}</h1>
          {loading&&<span style={{fontSize:11,color:T.muted}}>⏳ Cargando...</span>}
          {!loading&&ws&&<span style={{fontSize:10,color:T.green}}>● {ws.name}</span>}
          <div style={{flex:1,display:'flex',alignItems:'center',gap:10,justifyContent:'flex-end'}}>
            <div style={{background:T.s3,border:'1px solid '+T.border,borderRadius:9,padding:'7px 12px',display:'flex',alignItems:'center',gap:7}}>
              <span style={{color:T.muted,fontSize:12}}>🔍</span>
              <input value={search} onChange={(e:any)=>setSearch(e.target.value)} placeholder="Buscar..." style={{background:'none',border:'none',color:T.text,fontSize:12,width:180}}/>
            </div>
            <button onClick={()=>nav==='pipeline'?setShowNewDeal(true):setShowNewContact(true)} style={{border:'none',borderRadius:9,padding:'7px 16px',background:'linear-gradient(135deg,#3D7EFF,#00C8C0)',color:'#fff',fontSize:12,fontWeight:600,cursor:'pointer',boxShadow:'0 4px 18px rgba(61,126,255,0.3)'}}>
              {nav==='pipeline'?'+ Deal':'+ Nuevo'}
            </button>
          </div>
        </header>

        <div className="fi" key={nav} style={{flex:1,overflow:'auto',padding:nav==='inbox'?0:22}}>

          {/* DASHBOARD */}
          {nav==='dashboard'&&<div style={{display:'flex',flexDirection:'column',gap:18}}>
            <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:14}}>
              {[{i:'👥',l:'Contactos',v:loading?'...':(stats.contacts||0),c:T.accent,s:'● Supabase live'},{i:'🎯',l:'Leads',v:loading?'...':(stats.leads||0),c:T.cyan,s:'Tiempo real'},{i:'💰',l:'Valor total',v:loading?'...':'€'+(stats.revenue||0).toLocaleString(),c:T.green,s:'Base de datos'},{i:'📄',l:'Propuestas',v:loading?'...':(stats.proposals||0),c:T.purple,s:'Supabase'},{i:'📈',l:'Tasa cierre',v:'38%',c:T.orange,s:'↑ este mes'}].map((m,i)=>(
                <Card key={i} style={{padding:18,position:'relative',overflow:'hidden',cursor:'pointer'}} >
                  <div style={{position:'absolute',top:-12,right:-12,width:60,height:60,borderRadius:'50%',background:m.c,opacity:0.08}}/>
                  <div style={{fontSize:20,marginBottom:8}}>{m.i}</div>
                  <div style={{fontWeight:800,fontSize:22}}>{m.v}</div>
                  <div style={{fontSize:11,color:T.muted,marginTop:3}}>{m.l}</div>
                  <div style={{marginTop:8,fontSize:11,fontWeight:700,color:T.green}}>{m.s}</div>
                </Card>
              ))}
            </div>
            <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr',gap:16}}>
              <Card style={{padding:20}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:18}}><div style={{fontWeight:800,fontSize:14}}>Ingresos 2026</div><Pill c={T.green}>↑ 23%</Pill></div>
                <div style={{display:'flex',alignItems:'flex-end',gap:7,height:110}}>
                  {bars.map((h,i)=><div key={i} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:4}}><div style={{width:'100%',borderRadius:'4px 4px 0 0',height:h+'%',background:i===3?'linear-gradient(180deg,#3D7EFF,#00C8C0)':'#3D7EFF28'}}/><div style={{fontSize:8,color:T.faint}}>{'EFMAMJJASOND'[i]}</div></div>)}
                </div>
              </Card>
              <Card style={{padding:18}}>
                <div style={{fontWeight:800,fontSize:13,marginBottom:14}}>Por origen</div>
                {['meta_ads','google_ads','whatsapp','form','email','organic'].map(src=>{
                  const count=contacts.filter((c:any)=>c.source===src).length;const t=contacts.length||1
                  const cols:any={meta_ads:'#1877F2',google_ads:'#4285F4',whatsapp:'#25D366',form:'#9B72FF',email:'#3D7EFF',organic:'#18CF7A'}
                  if(!count)return null
                  return<div key={src} style={{marginBottom:10}}><div style={{display:'flex',justifyContent:'space-between',fontSize:11,marginBottom:4}}><span style={{color:T.muted}}>{src.replace('_',' ')}</span><span style={{fontWeight:700,color:cols[src]}}>{Math.round(count/t*100)}%</span></div><div style={{height:4,borderRadius:2,background:T.s3}}><div style={{height:'100%',width:Math.round(count/t*100)+'%',borderRadius:2,background:cols[src]}}/></div></div>
                })}
                {!contacts.length&&<div style={{color:T.muted,fontSize:12}}>Añade contactos para ver estadísticas</div>}
              </Card>
              <Card style={{padding:18}}>
                <div style={{fontWeight:800,fontSize:13,marginBottom:14}}>Últimos contactos</div>
                {contacts.slice(0,5).map((c:any,i:number)=><div key={i} style={{display:'flex',gap:9,alignItems:'center',marginBottom:10}}>
                  <div style={{width:26,height:26,borderRadius:'50%',background:T.accent,display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,fontWeight:700,color:'#fff',flexShrink:0}}>{(c.first_name?.[0]||'?')+(c.last_name?.[0]||'')}</div>
                  <div style={{flex:1,minWidth:0}}><div style={{fontSize:11,fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.first_name} {c.last_name}</div><div style={{fontSize:9,color:T.muted}}>{sL[c.status]||c.status} · {c.city||'—'}</div></div>
                </div>)}
                {!contacts.length&&!loading&&<div style={{color:T.muted,fontSize:12,textAlign:'center',padding:16}}>
                  <div style={{marginBottom:8}}>Sin contactos aún</div>
                  <button onClick={()=>setShowNewContact(true)} style={{border:'none',borderRadius:7,padding:'6px 12px',background:T.accentG,color:T.accent,fontSize:11,cursor:'pointer',fontWeight:600}}>+ Añadir primero</button>
                </div>}
              </Card>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:14}}>
              {[{name:'Meta Ads',icon:'f',bg:'#1877F2',s:[{l:'Inversión',v:'€4,060'},{l:'Leads',v:'419'},{l:'CPL',v:'€9.69'},{l:'ROAS',v:'3.4x'}]},{name:'Google Ads',icon:'G',bg:'#4285F4',s:[{l:'Inversión',v:'€3,860'},{l:'Conv.',v:'180'},{l:'CPA',v:'€21.44'},{l:'CTR',v:'5.1%'}]},{name:'WhatsApp',icon:'W',bg:'#25D366',s:[{l:'Chats',v:waChats.length||0},{l:'Sin leer',v:waChats.reduce((s:number,c:any)=>s+(c.unread_count||0),0)},{l:'Resp.',v:'94%'},{l:'T.resp.',v:'8min'}]}].map(intg=>(
                <Card key={intg.name} style={{padding:18}}>
                  <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}>
                    <div style={{width:28,height:28,borderRadius:8,background:intg.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,color:'#fff',fontWeight:900}}>{intg.icon}</div>
                    <div style={{fontWeight:700,fontSize:13}}>{intg.name}</div><Pill c={T.green} sm>● Activo</Pill>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8}}>
                    {intg.s.map((x:any)=><div key={x.l} style={{textAlign:'center',padding:'8px 4px',background:T.s3,borderRadius:8}}><div style={{fontWeight:800,fontSize:14}}>{x.v}</div><div style={{fontSize:9,color:T.muted,marginTop:1}}>{x.l}</div></div>)}
                  </div>
                </Card>
              ))}
            </div>
          </div>}

          {/* CONTACTOS */}
          {nav==='contactos'&&<div style={{display:'grid',gridTemplateColumns:sel?'1fr 300px':'1fr',gap:16}}>
            <div>
              <div style={{display:'flex',gap:8,marginBottom:14,alignItems:'center'}}>
                <span style={{fontSize:11,color:T.muted}}>{loading?'⏳ Cargando...':filtered.length+' contactos · Supabase live'}</span>
                <button onClick={()=>setShowNewContact(true)} style={{marginLeft:'auto',border:'none',borderRadius:9,padding:'6px 14px',background:'linear-gradient(135deg,#3D7EFF,#00C8C0)',color:'#fff',fontSize:11,fontWeight:600,cursor:'pointer'}}>+ Nuevo contacto</button>
              </div>
              <Card style={{overflow:'hidden'}}>
                <table style={{width:'100%',borderCollapse:'collapse'}}>
                  <thead><tr style={{borderBottom:'1px solid '+T.border}}>{['Contacto','Ciudad','Empresa','Origen','Estado','Valor'].map(h=><th key={h} style={{padding:'9px 13px',textAlign:'left',fontSize:10,color:T.muted,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.6px'}}>{h}</th>)}</tr></thead>
                  <tbody>
                    {!filtered.length&&!loading?<tr><td colSpan={6} style={{padding:'48px',textAlign:'center'}}>
                      <div style={{color:T.muted,marginBottom:12}}>Sin contactos en Supabase</div>
                      <button onClick={()=>setShowNewContact(true)} style={{border:'none',borderRadius:9,padding:'8px 18px',background:'linear-gradient(135deg,#3D7EFF,#00C8C0)',color:'#fff',fontSize:12,fontWeight:600,cursor:'pointer'}}>+ Crear primer contacto</button>
                    </td></tr>
                    :filtered.map((c:any)=><tr key={c.id} onClick={()=>setSel(sel?.id===c.id?null:c)} style={{borderBottom:'1px solid '+T.border,cursor:'pointer',background:sel?.id===c.id?T.accentG:'transparent'}}>
                      <td style={{padding:'9px 13px'}}><div style={{display:'flex',alignItems:'center',gap:9}}><div style={{width:28,height:28,borderRadius:'50%',background:sC[c.status]||T.accent,display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,fontWeight:700,color:'#fff'}}>{(c.first_name?.[0]||'?')+(c.last_name?.[0]||'')}</div><div><div style={{fontSize:12,fontWeight:600}}>{c.first_name} {c.last_name}</div><div style={{fontSize:10,color:T.muted}}>{c.email||'—'}</div></div></div></td>
                      <td style={{padding:'9px 13px',fontSize:11,color:T.muted}}>{c.city||'—'}</td>
                      <td style={{padding:'9px 13px',fontSize:11,color:T.muted}}>{c.company?.name||'—'}</td>
                      <td style={{padding:'9px 13px'}}><Pill c={T.purple} sm>{c.source||'—'}</Pill></td>
                      <td style={{padding:'9px 13px'}}><Pill c={sC[c.status]||T.muted} sm>{sL[c.status]||c.status}</Pill></td>
                      <td style={{padding:'9px 13px',fontSize:12,fontWeight:700}}>€{(c.lifetime_value||0).toLocaleString()}</td>
                    </tr>)}
                  </tbody>
                </table>
              </Card>
            </div>
            {sel&&<Card style={{padding:18,height:'fit-content',position:'sticky',top:0}}>
              <button onClick={()=>setSel(null)} style={{float:'right',background:'none',border:'none',color:T.muted,fontSize:18,cursor:'pointer'}}>×</button>
              <div style={{textAlign:'center',marginBottom:16}}>
                <div style={{width:48,height:48,borderRadius:'50%',background:sC[sel.status]||T.accent,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:700,color:'#fff',margin:'0 auto 10px'}}>{(sel.first_name?.[0]||'?')+(sel.last_name?.[0]||'')}</div>
                <div style={{fontWeight:700,fontSize:14}}>{sel.first_name} {sel.last_name}</div>
                <div style={{fontSize:11,color:T.muted,marginTop:3}}>{sel.company?.name||'—'}</div>
                <div style={{marginTop:8}}><Pill c={sC[sel.status]||T.muted} sm>{sL[sel.status]||sel.status}</Pill></div>
              </div>
              {[{l:'Email',v:sel.email,i:'✉️'},{l:'Teléfono',v:sel.phone,i:'📞'},{l:'Ciudad',v:sel.city,i:'📍'},{l:'Valor',v:'€'+(sel.lifetime_value||0).toLocaleString(),i:'💰'},{l:'Origen',v:sel.source,i:'🎯'}].filter((f:any)=>f.v).map((f:any)=>(
                <div key={f.l} style={{display:'flex',gap:9,padding:'8px 0',borderBottom:'1px solid '+T.border}}><span>{f.i}</span><div><div style={{fontSize:9,color:T.muted,textTransform:'uppercase',letterSpacing:'0.6px'}}>{f.l}</div><div style={{fontSize:11,fontWeight:500,marginTop:1}}>{f.v}</div></div></div>
              ))}
              <div style={{display:'flex',gap:7,marginTop:14}}>
                <button style={{flex:1,padding:'7px',borderRadius:8,border:'1px solid '+T.border,background:'transparent',color:T.text,fontSize:10,cursor:'pointer'}}>📞</button>
                <button style={{flex:1,padding:'7px',borderRadius:8,border:'1px solid #25D366',background:'#25D36615',color:'#25D366',fontSize:10,cursor:'pointer'}}>WhatsApp</button>
                <button onClick={()=>deleteContact(sel.id)} style={{flex:1,padding:'7px',borderRadius:8,border:'1px solid '+T.red,background:T.red+'15',color:T.red,fontSize:10,cursor:'pointer'}}>🗑 Borrar</button>
              </div>
            </Card>}
          </div>}

          {/* PIPELINE */}
          {nav==='pipeline'&&<div>
            <div style={{display:'flex',gap:14,marginBottom:16,alignItems:'center'}}>
              <div style={{fontSize:12,color:T.muted}}>{deals.length} deals · <strong style={{color:T.green}}>€{deals.reduce((s:number,d:any)=>s+(d.value||0),0).toLocaleString()}</strong></div>
              <button onClick={()=>setShowNewDeal(true)} style={{marginLeft:'auto',border:'none',borderRadius:9,padding:'7px 16px',background:'linear-gradient(135deg,#3D7EFF,#00C8C0)',color:'#fff',fontSize:12,fontWeight:600,cursor:'pointer'}}>+ Nueva oportunidad</button>
            </div>
            {!Object.keys(kg).length?<div style={{textAlign:'center',padding:60,color:T.muted}}>
              <div style={{fontSize:32,marginBottom:12}}>📋</div>
              <div style={{marginBottom:16}}>Sin oportunidades en Supabase</div>
              <button onClick={()=>setShowNewDeal(true)} style={{border:'none',borderRadius:9,padding:'8px 18px',background:'linear-gradient(135deg,#3D7EFF,#00C8C0)',color:'#fff',fontSize:12,fontWeight:600,cursor:'pointer'}}>+ Crear primera oportunidad</button>
            </div>
            :<div style={{display:'flex',gap:10,overflowX:'auto',paddingBottom:8}}>
              {Object.entries(kg).sort(([,a]:any,[,b]:any)=>a.pos-b.pos).map(([name,data]:any)=>(
                <div key={name} style={{minWidth:210,flexShrink:0}}>
                  <div style={{display:'flex',alignItems:'center',gap:6,padding:'7px 10px',background:T.s2,borderRadius:9,border:'1px solid '+T.border,marginBottom:9}}>
                    <div style={{width:7,height:7,borderRadius:'50%',background:data.color}}/><span style={{fontSize:11,fontWeight:600,flex:1}}>{name}</span>
                    <span style={{fontSize:10,fontWeight:700,color:data.color}}>{data.deals.length}</span>
                  </div>
                  <div style={{fontSize:10,color:T.muted,marginBottom:8}}>€{data.deals.reduce((s:number,d:any)=>s+(d.value||0),0).toLocaleString()}</div>
                  {data.deals.map((d:any)=><div key={d.id} style={{background:T.s2,border:'1px solid '+T.border,borderLeft:'3px solid '+data.color,borderRadius:9,padding:11,cursor:'grab',marginBottom:7,transition:'all 0.15s'}}
                    onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.transform='translateY(-2px)';(e.currentTarget as HTMLElement).style.boxShadow='0 6px 20px rgba(0,0,0,0.4)'}}
                    onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.transform='';(e.currentTarget as HTMLElement).style.boxShadow=''}}>
                    <div style={{fontSize:11,fontWeight:600,marginBottom:4}}>{d.title}</div>
                    <div style={{fontSize:10,color:T.muted,marginBottom:6}}>{d.contact?.first_name||'—'} {d.contact?.last_name||''}</div>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                      <div style={{fontSize:13,fontWeight:800,color:data.color}}>€{(d.value||0).toLocaleString()}</div>
                      <div style={{fontSize:10,color:T.muted}}>{d.probability||0}%</div>
                    </div>
                    {d.probability>0&&<div style={{marginTop:6,height:3,borderRadius:2,background:T.s3}}><div style={{height:'100%',width:d.probability+'%',borderRadius:2,background:data.color,opacity:0.5}}/></div>}
                  </div>)}
                  <button onClick={()=>setShowNewDeal(true)} style={{width:'100%',padding:'6px',borderRadius:8,border:'1px dashed '+T.border,background:'transparent',color:T.muted,fontSize:10,cursor:'pointer'}}>+ Deal</button>
                </div>
              ))}
            </div>}
          </div>}

          {/* WHATSAPP */}
          {nav==='inbox'&&<div style={{display:'flex',height:'100%'}}>
            <div style={{width:260,borderRight:'1px solid '+T.border,display:'flex',flexDirection:'column'}}>
              <div style={{padding:'14px 12px',borderBottom:'1px solid '+T.border,display:'flex',alignItems:'center',gap:7}}>
                <div style={{fontWeight:800,fontSize:14}}>WhatsApp</div><Pill c={T.green} sm>● Live</Pill>
              </div>
              <div style={{flex:1,overflowY:'auto'}}>
                {!waChats.length?<div style={{padding:24,textAlign:'center',color:T.muted,fontSize:12,lineHeight:1.6}}>Sin conversaciones.<br/>Conecta tu número de WhatsApp para ver los mensajes aquí.</div>
                :waChats.map((c:any)=><div key={c.id} onClick={()=>selectChat(c)} style={{padding:'11px 12px',borderBottom:'1px solid '+T.border,cursor:'pointer',background:selChat?.id===c.id?T.accentG:'transparent'}}>
                  <div style={{display:'flex',gap:9,alignItems:'center'}}>
                    <div style={{width:32,height:32,borderRadius:'50%',background:T.wa,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,color:'#fff',flexShrink:0,position:'relative'}}>
                      {c.contact?.first_name?.[0]||'?'}
                      {c.unread_count>0&&<div style={{position:'absolute',top:-2,right:-2,width:14,height:14,borderRadius:'50%',background:T.green,display:'flex',alignItems:'center',justifyContent:'center',fontSize:8,fontWeight:700,color:'#fff',border:'1.5px solid '+T.s1}}>{c.unread_count}</div>}
                    </div>
                    <div style={{flex:1,minWidth:0}}><div style={{fontSize:12,fontWeight:600}}>{c.contact?.first_name||'?'} {c.contact?.last_name||''}</div><div style={{fontSize:10,color:T.muted,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.contact_phone}</div></div>
                  </div>
                </div>)}
              </div>
            </div>
            <div style={{flex:1,display:'flex',flexDirection:'column'}}>
              {selChat?<>
                <div style={{padding:'11px 16px',borderBottom:'1px solid '+T.border,display:'flex',alignItems:'center',gap:10,background:T.s1}}>
                  <div style={{width:32,height:32,borderRadius:'50%',background:T.wa,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,color:'#fff'}}>{selChat.contact?.first_name?.[0]||'?'}</div>
                  <div><div style={{fontWeight:600,fontSize:13}}>{selChat.contact?.first_name} {selChat.contact?.last_name||''}</div><div style={{fontSize:10,color:T.green}}>● {selChat.contact_phone}</div></div>
                </div>
                <div style={{flex:1,overflowY:'auto',padding:'16px 18px',display:'flex',flexDirection:'column',gap:9}}>
                  {waMsgs.map((m:any,i:number)=><div key={i} style={{display:'flex',justifyContent:m.direction==='outbound'?'flex-end':'flex-start'}}>
                    <div style={{maxWidth:'70%',padding:'8px 12px',borderRadius:m.direction==='outbound'?'12px 12px 4px 12px':'12px 12px 12px 4px',background:m.direction==='outbound'?'linear-gradient(135deg,#3D7EFF,#00C8C0)':T.s3,color:'#fff',fontSize:12,lineHeight:1.5}}>{m.content||''}<div style={{fontSize:9,opacity:0.6,marginTop:3,textAlign:'right'}}>{m.sent_at?new Date(m.sent_at).toLocaleTimeString('es',{hour:'2-digit',minute:'2-digit'}):''}</div></div>
                  </div>)}
                  <div ref={endRef}/>
                </div>
                <div style={{padding:'10px 16px',borderTop:'1px solid '+T.border,display:'flex',gap:9,alignItems:'center'}}>
                  <div style={{flex:1,background:T.s3,border:'1px solid '+T.border,borderRadius:20,padding:'8px 13px'}}><input value={msg} onChange={(e:any)=>setMsg(e.target.value)} onKeyDown={(e:any)=>e.key==='Enter'&&sendWA()} placeholder="Escribe un mensaje..." style={{width:'100%',background:'none',border:'none',color:T.text,fontSize:12}}/></div>
                  <button onClick={sendWA} style={{width:36,height:36,borderRadius:'50%',border:'none',background:'linear-gradient(135deg,#25D366,#1aab53)',color:'#fff',fontSize:15,cursor:'pointer'}}>➤</button>
                </div>
              </>:<div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',color:T.muted,fontSize:13}}>Selecciona una conversación</div>}
            </div>
          </div>}

          {/* META */}
          {nav==='meta'&&<Card style={{padding:36,textAlign:'center',maxWidth:500,margin:'0 auto'}}>
            <div style={{fontSize:48,marginBottom:16}}>f</div>
            <div style={{fontWeight:800,fontSize:20,marginBottom:8,color:'#1877F2'}}>Meta Ads</div>
            <div style={{color:T.muted,fontSize:14,marginBottom:24,lineHeight:1.6}}>Los webhooks de Meta Lead Gen ya están configurados. Cuando conectes tu cuenta de Meta Business, los leads llegarán automáticamente a Supabase.</div>
            <button style={{border:'none',borderRadius:9,padding:'12px 28px',background:'#1877F2',color:'#fff',fontSize:14,fontWeight:600,cursor:'pointer'}}>Conectar Meta Business →</button>
          </Card>}

          {/* GOOGLE */}
          {nav==='google'&&<Card style={{padding:36,textAlign:'center',maxWidth:500,margin:'0 auto'}}>
            <div style={{fontSize:48,marginBottom:16}}>G</div>
            <div style={{fontWeight:800,fontSize:20,marginBottom:8,color:'#4285F4'}}>Google Ads</div>
            <div style={{color:T.muted,fontSize:14,marginBottom:24,lineHeight:1.6}}>El endpoint /api/google/sync está listo en tu API. Cuando consigas el Developer Token de Google, la sincronización será automática.</div>
            <button style={{border:'none',borderRadius:9,padding:'12px 28px',background:'#4285F4',color:'#fff',fontSize:14,fontWeight:600,cursor:'pointer'}}>Conectar Google Ads →</button>
          </Card>}

          {/* REPORTES */}
          {nav==='reportes'&&<div style={{display:'flex',flexDirection:'column',gap:16}}>
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14}}>
              {[{i:'💰',l:'Valor cartera',v:'€'+(stats.revenue||0).toLocaleString(),c:T.green},{i:'👥',l:'Contactos',v:stats.contacts,c:T.accent},{i:'🎯',l:'Leads',v:stats.leads,c:T.purple},{i:'📋',l:'Propuestas',v:stats.proposals,c:T.orange}].map((s,i)=>(
                <Card key={i} style={{padding:16}}><div style={{fontSize:18,marginBottom:6}}>{s.i}</div><div style={{fontWeight:800,fontSize:20,color:s.c}}>{s.v}</div><div style={{fontSize:11,color:T.muted,marginTop:2}}>{s.l}</div></Card>
              ))}
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
              <Card style={{padding:20}}>
                <div style={{fontWeight:800,fontSize:14,marginBottom:16}}>Contactos por origen</div>
                {['meta_ads','google_ads','whatsapp','form','email','organic','referral'].map(src=>{
                  const count=contacts.filter((c:any)=>c.source===src).length;if(!count)return null
                  const cols:any={meta_ads:'#1877F2',google_ads:'#4285F4',whatsapp:'#25D366',form:'#9B72FF',email:'#3D7EFF',organic:'#18CF7A',referral:'#FF7A35'}
                  return<div key={src} style={{marginBottom:12}}><div style={{display:'flex',justifyContent:'space-between',fontSize:12,marginBottom:5}}><span style={{color:T.muted}}>{src.replace('_',' ')}</span><span style={{fontWeight:700}}>{count} contacto{count>1?'s':''}</span></div><div style={{height:5,borderRadius:3,background:T.s3}}><div style={{height:'100%',width:Math.round(count/(contacts.length||1)*100)+'%',borderRadius:3,background:cols[src]||T.accent}}/></div></div>
                })}
                {!contacts.length&&<div style={{color:T.muted,fontSize:12}}>Sin datos aún. Añade contactos primero.</div>}
              </Card>
              <Card style={{padding:20}}>
                <div style={{fontWeight:800,fontSize:14,marginBottom:16}}>Por estado</div>
                {['client','lead','prospect','inactive'].map(st=>{
                  const count=contacts.filter((c:any)=>c.status===st).length
                  return<div key={st} style={{marginBottom:12}}><div style={{display:'flex',justifyContent:'space-between',fontSize:12,marginBottom:5}}><span style={{color:T.muted}}>{sL[st]}</span><span style={{fontWeight:700,color:sC[st]}}>{count}</span></div><div style={{height:5,borderRadius:3,background:T.s3}}><div style={{height:'100%',width:contacts.length?Math.round(count/contacts.length*100)+'%':'0%',borderRadius:3,background:sC[st]}}/></div></div>
                })}
              </Card>
            </div>
          </div>}

          {!['dashboard','contactos','pipeline','inbox','meta','google','reportes'].includes(nav)&&(
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:400,gap:16}}>
              <div style={{fontSize:48}}>🚧</div><div style={{fontWeight:800,fontSize:22}}>{curLabel}</div>
              <div style={{color:T.muted,fontSize:14}}>Próximamente · API en construcción</div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}