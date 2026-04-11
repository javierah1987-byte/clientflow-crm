/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import { useState, useRef, useEffect } from 'react'

const T = {
  bg:'#07080C',s1:'#0D0F16',s2:'#121520',s3:'#181C28',
  border:'#232840',accent:'#3D7EFF',accentG:'rgba(61,126,255,0.15)',
  cyan:'#00C8C0',green:'#18CF7A',orange:'#FF7A35',red:'#FF3559',
  purple:'#9B72FF',pink:'#FF4D9E',yellow:'#FFD045',
  text:'#D8E0F0',muted:'#5E6A88',faint:'#252D45',
  meta:'#1877F2',google:'#4285F4',wa:'#25D366',
}

const NAV: any[] = [
  {g:'INICIO',items:[{id:'dashboard',label:'Dashboard',icon:'▣'}]},
  {g:'CONTACTOS',items:[{id:'contactos',label:'Contactos',icon:'◉',badge:1248},{id:'empresas',label:'Empresas',icon:'⬡'},{id:'actividades',label:'Actividades',icon:'◈'}]},
  {g:'VENTAS',items:[{id:'pipeline',label:'Oportunidades',icon:'⇢'},{id:'propuestas',label:'Propuestas IA',icon:'◧',badgeC:'#9B72FF',badge:'IA'},{id:'facturas',label:'Facturas',icon:'◪'}]},
  {g:'COMUNICACIÓN',items:[{id:'inbox',label:'WhatsApp Inbox',icon:'◎',badge:5,badgeC:'#18CF7A'},{id:'email',label:'Campañas Email',icon:'◈'}]},
  {g:'MARKETING',items:[{id:'landings',label:'Aterrizajes IA',icon:'◮',badge:'IA',badgeC:'#9B72FF'},{id:'formularios',label:'Formularios',icon:'◭'},{id:'flujos',label:'Flujos de Trabajo',icon:'⟳'}]},
  {g:'CAPTACIÓN',items:[{id:'meta',label:'Meta Ads',icon:'f'},{id:'google',label:'Google Ads',icon:'G'},{id:'social',label:'Redes Sociales',icon:'◓'}]},
  {g:'ANÁLISIS',items:[{id:'reportes',label:'Reportes',icon:'◻'},{id:'automatizaciones',label:'Automatizaciones',icon:'⚡'}]},
]

const contacts = [
  {id:1,name:'Sofía Martínez',co:'TechVision S.A.',email:'sofia@techvision.com',phone:'+34 611 234 567',status:'Cliente',value:'€12,400',av:'SM',color:'#3D7EFF',source:'Meta Ads',city:'Madrid',stage:'Cerrado'},
  {id:2,name:'Carlos Rueda',co:'Innova Digital',email:'carlos@innova.es',phone:'+34 622 345 678',status:'Lead',value:'€8,200',av:'CR',color:'#18CF7A',source:'Google Ads',city:'Barcelona',stage:'Propuesta'},
  {id:3,name:'Ana López',co:'Grupo Expansión',email:'ana@expansion.com',phone:'+34 633 456 789',status:'Prospecto',value:'€5,600',av:'AL',color:'#FF7A35',source:'Formulario',city:'Sevilla',stage:'Contactado'},
  {id:4,name:'Marcos Vega',co:'DataCore SL',email:'marcos@datacore.io',phone:'+34 644 567 890',status:'Cliente',value:'€21,800',av:'MV',color:'#9B72FF',source:'Meta Ads',city:'Valencia',stage:'Cerrado'},
  {id:5,name:'Elena Torres',co:'MediaGroup',email:'elena@mediagroup.es',phone:'+34 655 678 901',status:'Lead',value:'€3,400',av:'ET',color:'#FF4D9E',source:'Instagram',city:'Bilbao',stage:'Nuevo'},
  {id:6,name:'Raúl Díaz',co:'StartupXYZ',email:'raul@startupxyz.com',phone:'+34 666 789 012',status:'Prospecto',value:'€6,100',av:'RD',color:'#00C8C0',source:'Google Ads',city:'Zaragoza',stage:'Negociación'},
  {id:7,name:'Laura Sanz',co:'Consulting Pro',email:'laura@consultingpro.es',phone:'+34 677 890 123',status:'Cliente',value:'€9,300',av:'LS',color:'#FFD045',source:'Email',city:'Málaga',stage:'Cerrado'},
]

const kanban: any[] = [
  {id:'nuevo',label:'Nuevo Lead',color:'#3D7EFF',deals:[{name:'Elena Torres',val:'€3,400',co:'MediaGroup',color:'#FF4D9E',av:'ET'},{name:'Marta Gil',val:'€4,100',co:'StartupABC',color:'#00C8C0',av:'MG'}]},
  {id:'contactado',label:'Contactado',color:'#00C8C0',deals:[{name:'Ana López',val:'€5,600',co:'Grupo Expansión',color:'#FF7A35',av:'AL'}]},
  {id:'propuesta',label:'Propuesta',color:'#FF7A35',deals:[{name:'Carlos Rueda',val:'€8,200',co:'Innova Digital',color:'#18CF7A',av:'CR'},{name:'Pedro Gil',val:'€9,800',co:'Comercial Norte',color:'#FFD045',av:'PG'}]},
  {id:'negociacion',label:'Negociación',color:'#9B72FF',deals:[{name:'Raúl Díaz',val:'€6,100',co:'StartupXYZ',color:'#00C8C0',av:'RD'}]},
  {id:'ganado',label:'Ganado ✓',color:'#18CF7A',deals:[{name:'Sofía Martínez',val:'€12,400',co:'TechVision',color:'#3D7EFF',av:'SM'},{name:'Marcos Vega',val:'€21,800',co:'DataCore',color:'#9B72FF',av:'MV'}]},
  {id:'perdido',label:'Perdido',color:'#FF3559',deals:[]},
]

const waChats: any[] = [
  {id:1,name:'Sofía Martínez',av:'SM',color:'#3D7EFF',last:'¿Cuándo podemos hacer la demo?',time:'10:42',unread:2,msgs:[{from:'them',text:'Hola, vi su propuesta. Me interesa.',time:'10:30'},{from:'me',text:'¡Hola Sofía! ¿Le parece mañana a las 10h?',time:'10:32'},{from:'them',text:'¿Cuándo podemos hacer la demo?',time:'10:42'}]},
  {id:2,name:'Carlos Rueda',av:'CR',color:'#18CF7A',last:'Nos vemos el jueves',time:'09:15',unread:0,msgs:[{from:'me',text:'¿Revisó la propuesta?',time:'09:00'},{from:'them',text:'Sí, podemos cerrar.',time:'09:10'},{from:'them',text:'Nos vemos el jueves',time:'09:15'}]},
  {id:3,name:'Ana López',av:'AL',color:'#FF7A35',last:'Necesito info del plan Pro',time:'Ayer',unread:1,msgs:[{from:'them',text:'Necesito más información del plan Pro',time:'Ayer'}]},
]

const sC: Record<string,string> = {Cliente:'#18CF7A',Lead:'#3D7EFF',Prospecto:'#FF7A35',Activa:'#18CF7A',Pausada:'#FF7A35',Borrador:'#5E6A88',Enviada:'#3D7EFF',Aceptada:'#18CF7A',Rechazada:'#FF3559',Pagada:'#00C8C0'}

const Pill = ({c=T.accent,children,sm=false}:{c?:string,children:React.ReactNode,sm?:boolean}) => (
  <span style={{display:'inline-flex',alignItems:'center',padding:sm?'2px 8px':'3px 11px',borderRadius:20,fontSize:sm?10:11,fontWeight:600,background:c+'20',color:c}}>{children}</span>
)
const Card = ({children,style={}}:{children:React.ReactNode,style?:React.CSSProperties}) => (
  <div style={{background:T.s2,border:'1px solid '+T.border,borderRadius:14,...style}}>{children}</div>
)

export default function CRM() {
  const [nav,setNav] = useState('dashboard')
  const [search,setSearch] = useState('')
  const [sel,setSel] = useState<any>(null)
  const [selChat,setSelChat] = useState<any>(waChats[0])
  const [msg,setMsg] = useState('')
  const [chats,setChats] = useState<any[]>(waChats)
  const allItems = NAV.flatMap((g:any)=>g.items)
  const curLabel = allItems.find((i:any)=>i.id===nav)?.label||'Dashboard'
  const sendWA = () => {
    if(!msg.trim()) return
    const m = {from:'me',text:msg,time:'Ahora'}
    setChats((p:any[])=>p.map((c:any)=>c.id===selChat.id?{...c,last:msg,msgs:[...c.msgs,m]}:c))
    setSelChat((p:any)=>({...p,msgs:[...p.msgs,m]}))
    setMsg('')
  }
  return (
    <div style={{display:'flex',height:'100vh',background:T.bg,fontFamily:"'Outfit',sans-serif",color:T.text,overflow:'hidden'}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:3px} ::-webkit-scrollbar-thumb{background:#232840;border-radius:3px}
        input,button{font-family:inherit;outline:none}
        @keyframes fi{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
        .fi{animation:fi 0.2s ease}
      `}</style>
      <aside style={{width:220,background:T.s1,borderRight:'1px solid '+T.border,display:'flex',flexDirection:'column',flexShrink:0,overflowY:'auto'}}>
        <div style={{padding:'18px 14px 16px',borderBottom:'1px solid '+T.border,display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:32,height:32,borderRadius:9,background:'linear-gradient(135deg,#3D7EFF,#00C8C0)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16}}>⬡</div>
          <div><div style={{fontWeight:800,fontSize:15}}>ClientFlow</div><div style={{fontSize:9,color:T.muted,textTransform:'uppercase',letterSpacing:'1px'}}>CRM Pro</div></div>
        </div>
        <div style={{flex:1,padding:'10px 8px'}}>
          {NAV.map((group:any)=>(
            <div key={group.g}>
              <div style={{fontSize:9,color:T.faint,fontWeight:700,letterSpacing:'1.5px',padding:'8px 8px 3px',textTransform:'uppercase'}}>{group.g}</div>
              {group.items.map((item:any)=>{
                const active=nav===item.id
                return <button key={item.id} onClick={()=>setNav(item.id)} style={{width:'100%',display:'flex',alignItems:'center',gap:9,padding:'8px 9px',borderRadius:8,border:'none',background:active?T.accentG:'transparent',color:active?T.text:T.muted,fontSize:11.5,fontWeight:active?600:400,marginBottom:1,cursor:'pointer',textAlign:'left'}}>
                  <span style={{fontSize:14}}>{item.icon}</span>
                  <span style={{flex:1}}>{item.label}</span>
                  {item.badge&&<span style={{fontSize:9,fontWeight:700,padding:'1px 6px',borderRadius:20,background:(item.badgeC||T.accent)+'22',color:item.badgeC||T.accent}}>{item.badge}</span>}
                </button>
              })}
            </div>
          ))}
        </div>
        <div style={{padding:'12px 14px',borderTop:'1px solid '+T.border,display:'flex',alignItems:'center',gap:9}}>
          <div style={{width:28,height:28,borderRadius:'50%',background:'linear-gradient(135deg,#3D7EFF,#00C8C0)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,color:'#fff'}}>JA</div>
          <div><div style={{fontSize:11,fontWeight:600}}>Javier A.</div><div style={{fontSize:9,color:T.green}}>● Admin · Pro</div></div>
        </div>
      </aside>
      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
        <header style={{background:T.s1,borderBottom:'1px solid '+T.border,padding:'11px 22px',display:'flex',alignItems:'center',gap:14,flexShrink:0}}>
          <h1 style={{fontWeight:800,fontSize:17}}>{curLabel}</h1>
          <div style={{flex:1,display:'flex',alignItems:'center',gap:10,justifyContent:'flex-end'}}>
            <div style={{background:T.s3,border:'1px solid '+T.border,borderRadius:9,padding:'7px 12px',display:'flex',alignItems:'center',gap:7}}>
              <span style={{color:T.muted,fontSize:12}}>🔍</span>
              <input value={search} onChange={(e:any)=>setSearch(e.target.value)} placeholder="Buscar..." style={{background:'none',border:'none',color:T.text,fontSize:12,width:180}}/>
            </div>
            <button style={{border:'none',borderRadius:9,padding:'7px 16px',background:'linear-gradient(135deg,#3D7EFF,#00C8C0)',color:'#fff',fontSize:12,fontWeight:600,cursor:'pointer'}}>+ Nuevo</button>
          </div>
        </header>
        <div className="fi" key={nav} style={{flex:1,overflow:'auto',padding:nav==='inbox'?0:22}}>
          {nav==='dashboard'&&<Dash/>}
          {nav==='contactos'&&<Contacts search={search} sel={sel} setSel={setSel}/>}
          {nav==='pipeline'&&<Pipeline/>}
          {nav==='inbox'&&<Inbox chats={chats} sel={selChat} setSel={setSelChat} msg={msg} setMsg={setMsg} send={sendWA}/>}
          {nav==='meta'&&<MetaAds/>}
          {nav==='google'&&<GoogleAds/>}
          {nav==='reportes'&&<Reports/>}
          {!['dashboard','contactos','pipeline','inbox','meta','google','reportes'].includes(nav)&&<Soon label={curLabel}/>}
        </div>
      </div>
    </div>
  )
}

function Dash() {
  const bars=[38,55,42,72,60,85,68,74,90,78,95,88]
  return <div style={{display:'flex',flexDirection:'column',gap:18}}>
    <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:14}}>
      {[{i:'👥',l:'Contactos',v:'1,248',c:T.accent},{i:'🎯',l:'Leads activos',v:'342',c:T.cyan},{i:'💰',l:'Ingresos mes',v:'€84,320',c:T.green},{i:'📄',l:'Propuestas',v:'24',c:T.purple},{i:'📈',l:'Tasa cierre',v:'38%',c:T.orange}].map((m,i)=>(
        <Card key={i} style={{padding:18,position:'relative',overflow:'hidden'}}>
          <div style={{position:'absolute',top:-12,right:-12,width:60,height:60,borderRadius:'50%',background:m.c,opacity:0.08}}/>
          <div style={{fontSize:20,marginBottom:8}}>{m.i}</div>
          <div style={{fontWeight:800,fontSize:22}}>{m.v}</div>
          <div style={{fontSize:11,color:T.muted,marginTop:3}}>{m.l}</div>
          <div style={{marginTop:8,fontSize:11,fontWeight:700,color:T.green}}>↑ este mes</div>
        </Card>
      ))}
    </div>
    <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr',gap:16}}>
      <Card style={{padding:20}}>
        <div style={{fontWeight:800,fontSize:14,marginBottom:18}}>Ingresos 2026</div>
        <div style={{display:'flex',alignItems:'flex-end',gap:7,height:110}}>
          {bars.map((h,i)=><div key={i} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
            <div style={{width:'100%',borderRadius:'4px 4px 0 0',height:h+'%',background:i===3?'linear-gradient(180deg,#3D7EFF,#00C8C0)':'#3D7EFF28'}}/>
            <div style={{fontSize:8,color:T.faint}}>{'EFMAMJJASOND'[i]}</div>
          </div>)}
        </div>
      </Card>
      <Card style={{padding:18}}>
        <div style={{fontWeight:800,fontSize:13,marginBottom:14}}>Fuentes de Leads</div>
        {[{l:'Meta Ads',p:38,c:'#1877F2'},{l:'Google Ads',p:27,c:'#4285F4'},{l:'WhatsApp',p:18,c:'#25D366'},{l:'Orgánico',p:12,c:T.green},{l:'Email',p:5,c:T.purple}].map(s=>(
          <div key={s.l} style={{marginBottom:10}}>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:11,marginBottom:4}}><span style={{color:T.muted}}>{s.l}</span><span style={{fontWeight:700,color:s.c}}>{s.p}%</span></div>
            <div style={{height:4,borderRadius:2,background:T.s3}}><div style={{height:'100%',width:s.p+'%',borderRadius:2,background:s.c}}/></div>
          </div>
        ))}
      </Card>
      <Card style={{padding:18}}>
        <div style={{fontWeight:800,fontSize:13,marginBottom:14}}>Actividad Reciente</div>
        {[{t:'Lead Meta — Marta Gil',d:'5 min',i:'🎯'},{t:'Carlos abrió propuesta',d:'22 min',i:'✉️'},{t:'Marcos — factura pagada',d:'1h',i:'💰'},{t:'Conversión Google Ads',d:'2h',i:'🔍'},{t:'WhatsApp — Ana López',d:'3h',i:'💬'}].map((a,i)=>(
          <div key={i} style={{display:'flex',gap:9,alignItems:'flex-start',marginBottom:11}}>
            <div style={{width:24,height:24,borderRadius:7,background:T.s3,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,flexShrink:0}}>{a.i}</div>
            <div><div style={{fontSize:11}}>{a.t}</div><div style={{fontSize:10,color:T.muted}}>Hace {a.d}</div></div>
          </div>
        ))}
      </Card>
    </div>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:14}}>
      {[{name:'Meta Ads',icon:'f',bg:'#1877F2',stats:[{l:'Inversión',v:'€4,060'},{l:'Leads',v:'419'},{l:'CPL',v:'€9.69'},{l:'ROAS',v:'3.4x'}]},{name:'Google Ads',icon:'G',bg:'#4285F4',stats:[{l:'Inversión',v:'€3,860'},{l:'Conv.',v:'180'},{l:'CPA',v:'€21.44'},{l:'CTR',v:'5.1%'}]},{name:'WhatsApp',icon:'W',bg:'#25D366',stats:[{l:'Chats',v:'28'},{l:'Mensajes',v:'142'},{l:'Resp.',v:'94%'},{l:'T.resp.',v:'8min'}]}].map(intg=>(
        <Card key={intg.name} style={{padding:18}}>
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}>
            <div style={{width:28,height:28,borderRadius:8,background:intg.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,color:'#fff',fontWeight:900}}>{intg.icon}</div>
            <div style={{fontWeight:700,fontSize:13}}>{intg.name}</div>
            <Pill c={T.green} sm>● Activo</Pill>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8}}>
            {intg.stats.map((s:any)=><div key={s.l} style={{textAlign:'center',padding:'8px 4px',background:T.s3,borderRadius:8}}><div style={{fontWeight:800,fontSize:14}}>{s.v}</div><div style={{fontSize:9,color:T.muted,marginTop:1}}>{s.l}</div></div>)}
          </div>
        </Card>
      ))}
    </div>
  </div>
}

function Contacts({search,sel,setSel}:{search:string,sel:any,setSel:any}) {
  const [filter,setFilter] = useState('Todos')
  const filtered = contacts.filter(c=>(c.name.toLowerCase().includes(search.toLowerCase())||c.co.toLowerCase().includes(search.toLowerCase()))&&(filter==='Todos'||c.status===filter))
  return <div style={{display:'grid',gridTemplateColumns:sel?'1fr 300px':'1fr',gap:16}}>
    <div>
      <div style={{display:'flex',gap:8,marginBottom:14,alignItems:'center'}}>
        {['Todos','Cliente','Lead','Prospecto'].map(s=><button key={s} onClick={()=>setFilter(s)} style={{padding:'5px 13px',borderRadius:20,border:'1px solid '+(filter===s?T.accent:T.border),background:filter===s?T.accentG:'transparent',color:filter===s?T.accent:T.muted,fontSize:11,fontWeight:600,cursor:'pointer'}}>{s}</button>)}
        <span style={{marginLeft:'auto',fontSize:11,color:T.muted}}>{filtered.length} contactos</span>
      </div>
      <Card style={{overflow:'hidden'}}>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead><tr style={{borderBottom:'1px solid '+T.border}}>{['Contacto','Ciudad','Empresa','Origen','Estado','Valor'].map(h=><th key={h} style={{padding:'9px 13px',textAlign:'left',fontSize:10,color:T.muted,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.6px'}}>{h}</th>)}</tr></thead>
          <tbody>
            {filtered.map(c=><tr key={c.id} onClick={()=>setSel(sel?.id===c.id?null:c)} style={{borderBottom:'1px solid '+T.border,cursor:'pointer',background:sel?.id===c.id?T.accentG:'transparent'}}>
              <td style={{padding:'9px 13px'}}><div style={{display:'flex',alignItems:'center',gap:9}}><div style={{width:28,height:28,borderRadius:'50%',background:c.color,display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,fontWeight:700,color:'#fff'}}>{c.av}</div><div><div style={{fontSize:12,fontWeight:600}}>{c.name}</div><div style={{fontSize:10,color:T.muted}}>{c.email}</div></div></div></td>
              <td style={{padding:'9px 13px',fontSize:11,color:T.muted}}>{c.city}</td>
              <td style={{padding:'9px 13px',fontSize:11,color:T.muted}}>{c.co}</td>
              <td style={{padding:'9px 13px'}}><Pill c={T.purple} sm>{c.source}</Pill></td>
              <td style={{padding:'9px 13px'}}><Pill c={sC[c.status]||T.muted} sm>{c.status}</Pill></td>
              <td style={{padding:'9px 13px',fontSize:12,fontWeight:700}}>{c.value}</td>
            </tr>)}
          </tbody>
        </table>
      </Card>
    </div>
    {sel&&<Card style={{padding:18,height:'fit-content',position:'sticky',top:0}}>
      <button onClick={()=>setSel(null)} style={{float:'right',background:'none',border:'none',color:T.muted,fontSize:18,cursor:'pointer'}}>×</button>
      <div style={{textAlign:'center',marginBottom:16}}>
        <div style={{width:48,height:48,borderRadius:'50%',background:sel.color,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:700,color:'#fff',margin:'0 auto 10px'}}>{sel.av}</div>
        <div style={{fontWeight:700,fontSize:14}}>{sel.name}</div>
        <div style={{fontSize:11,color:T.muted,marginTop:3}}>{sel.co}</div>
        <div style={{marginTop:8}}><Pill c={sC[sel.status]||T.muted} sm>{sel.status}</Pill></div>
      </div>
      {[{l:'Email',v:sel.email,i:'✉️'},{l:'Teléfono',v:sel.phone,i:'📞'},{l:'Ciudad',v:sel.city,i:'📍'},{l:'Valor',v:sel.value,i:'💰'},{l:'Origen',v:sel.source,i:'🎯'},{l:'Etapa',v:sel.stage,i:'⇢'}].map((f:any)=><div key={f.l} style={{display:'flex',gap:9,padding:'8px 0',borderBottom:'1px solid '+T.border}}><span style={{fontSize:12}}>{f.i}</span><div><div style={{fontSize:9,color:T.muted,textTransform:'uppercase',letterSpacing:'0.6px'}}>{f.l}</div><div style={{fontSize:11,fontWeight:500,marginTop:1}}>{f.v}</div></div></div>)}
      <div style={{display:'flex',gap:7,marginTop:14}}>
        <button style={{flex:1,padding:'7px',borderRadius:8,border:'1px solid '+T.border,background:'transparent',color:T.text,fontSize:10,fontWeight:600,cursor:'pointer'}}>📞</button>
        <button style={{flex:1,padding:'7px',borderRadius:8,border:'1px solid #25D366',background:'#25D36615',color:'#25D366',fontSize:10,fontWeight:600,cursor:'pointer'}}>WhatsApp</button>
        <button style={{flex:1,padding:'7px',borderRadius:8,border:'none',background:'linear-gradient(135deg,#3D7EFF,#00C8C0)',color:'#fff',fontSize:10,fontWeight:600,cursor:'pointer'}}>✉️ Email</button>
      </div>
    </Card>}
  </div>
}

function Pipeline() {
  return <div>
    <div style={{display:'flex',gap:14,marginBottom:16,alignItems:'center'}}>
      <div style={{fontSize:12,color:T.muted}}>Total: <strong style={{color:T.green}}>€73,600</strong> · 11 oportunidades</div>
      <button style={{marginLeft:'auto',border:'none',borderRadius:9,padding:'7px 16px',background:'linear-gradient(135deg,#3D7EFF,#00C8C0)',color:'#fff',fontSize:12,fontWeight:600,cursor:'pointer'}}>+ Oportunidad</button>
    </div>
    <div style={{display:'flex',gap:10,overflowX:'auto',paddingBottom:8}}>
      {kanban.map((stage:any)=>{
        const total=stage.deals.reduce((a:number,d:any)=>a+parseInt(d.val.replace(/[^0-9]/g,'')),0)
        return <div key={stage.id} style={{minWidth:200,flexShrink:0}}>
          <div style={{display:'flex',alignItems:'center',gap:6,padding:'7px 10px',background:T.s2,borderRadius:9,border:'1px solid '+T.border,marginBottom:9}}>
            <div style={{width:7,height:7,borderRadius:'50%',background:stage.color}}/><span style={{fontSize:11,fontWeight:600,flex:1}}>{stage.label}</span><span style={{fontSize:10,fontWeight:700,color:stage.color}}>{stage.deals.length}</span>
          </div>
          <div style={{fontSize:10,color:T.muted,marginBottom:8}}>€{total.toLocaleString()}</div>
          {stage.deals.map((d:any,i:number)=><div key={i} style={{background:T.s2,border:'1px solid '+T.border,borderLeft:'3px solid '+stage.color,borderRadius:9,padding:11,cursor:'grab',marginBottom:7}}>
            <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:6}}><div style={{width:20,height:20,borderRadius:'50%',background:d.color,display:'flex',alignItems:'center',justifyContent:'center',fontSize:7,fontWeight:700,color:'#fff'}}>{d.av}</div><div style={{fontSize:11,fontWeight:600}}>{d.name}</div></div>
            <div style={{fontSize:10,color:T.muted,marginBottom:6}}>{d.co}</div>
            <div style={{fontSize:13,fontWeight:800,color:stage.color}}>{d.val}</div>
          </div>)}
          <button style={{width:'100%',padding:'6px',borderRadius:8,border:'1px dashed '+T.border,background:'transparent',color:T.muted,fontSize:10,cursor:'pointer'}}>+ Deal</button>
        </div>
      })}
    </div>
  </div>
}

function Inbox({chats,sel,setSel,msg,setMsg,send}:any) {
  const endRef = useRef<HTMLDivElement>(null)
  useEffect(()=>{endRef.current?.scrollIntoView({behavior:'smooth'})},[sel?.msgs?.length])
  return <div style={{display:'flex',height:'100%'}}>
    <div style={{width:250,borderRight:'1px solid '+T.border,display:'flex',flexDirection:'column'}}>
      <div style={{padding:'14px 12px',borderBottom:'1px solid '+T.border,display:'flex',alignItems:'center',gap:7,marginBottom:0}}>
        <div style={{fontWeight:800,fontSize:14}}>WhatsApp Inbox</div><Pill c={T.green} sm>● Live</Pill>
      </div>
      <div style={{flex:1,overflowY:'auto'}}>
        {chats.map((c:any)=><div key={c.id} onClick={()=>setSel(c)} style={{padding:'11px 12px',borderBottom:'1px solid '+T.border,cursor:'pointer',background:sel?.id===c.id?T.accentG:'transparent'}}>
          <div style={{display:'flex',gap:9,alignItems:'center'}}>
            <div style={{width:32,height:32,borderRadius:'50%',background:c.color,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,color:'#fff',flexShrink:0,position:'relative'}}>
              {c.av}{c.unread>0&&<div style={{position:'absolute',top:-2,right:-2,width:14,height:14,borderRadius:'50%',background:T.green,display:'flex',alignItems:'center',justifyContent:'center',fontSize:8,fontWeight:700,color:'#fff',border:'1.5px solid '+T.s1}}>{c.unread}</div>}
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:'flex',justifyContent:'space-between'}}><div style={{fontSize:12,fontWeight:600}}>{c.name}</div><div style={{fontSize:9,color:T.muted}}>{c.time}</div></div>
              <div style={{fontSize:10,color:T.muted,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',marginTop:2}}>{c.last}</div>
            </div>
          </div>
        </div>)}
      </div>
    </div>
    <div style={{flex:1,display:'flex',flexDirection:'column'}}>
      {sel?<>
        <div style={{padding:'11px 16px',borderBottom:'1px solid '+T.border,display:'flex',alignItems:'center',gap:10,background:T.s1}}>
          <div style={{width:32,height:32,borderRadius:'50%',background:sel.color,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,color:'#fff'}}>{sel.av}</div>
          <div><div style={{fontWeight:600,fontSize:13}}>{sel.name}</div><div style={{fontSize:10,color:T.green}}>● En línea</div></div>
        </div>
        <div style={{flex:1,overflowY:'auto',padding:'16px 18px',display:'flex',flexDirection:'column',gap:9}}>
          {sel.msgs.map((m:any,i:number)=><div key={i} style={{display:'flex',justifyContent:m.from==='me'?'flex-end':'flex-start'}}>
            <div style={{maxWidth:'70%',padding:'8px 12px',borderRadius:m.from==='me'?'12px 12px 4px 12px':'12px 12px 12px 4px',background:m.from==='me'?'linear-gradient(135deg,#3D7EFF,#00C8C0)':T.s3,color:'#fff',fontSize:12,lineHeight:1.5}}>
              {m.text}<div style={{fontSize:9,opacity:0.6,marginTop:3,textAlign:'right'}}>{m.time}</div>
            </div>
          </div>)}
          <div ref={endRef}/>
        </div>
        <div style={{padding:'10px 16px',borderTop:'1px solid '+T.border,display:'flex',gap:9,alignItems:'center'}}>
          <div style={{flex:1,background:T.s3,border:'1px solid '+T.border,borderRadius:20,padding:'8px 13px',display:'flex',alignItems:'center',gap:7}}>
            <input value={msg} onChange={(e:any)=>setMsg(e.target.value)} onKeyDown={(e:any)=>e.key==='Enter'&&send()} placeholder="Escribe un mensaje..." style={{flex:1,background:'none',border:'none',color:T.text,fontSize:12}}/>
          </div>
          <button onClick={send} style={{width:36,height:36,borderRadius:'50%',border:'none',background:'linear-gradient(135deg,#25D366,#1aab53)',color:'#fff',fontSize:15,cursor:'pointer'}}>➤</button>
        </div>
      </>:<div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',color:T.muted,fontSize:13}}>Selecciona una conversación</div>}
    </div>
  </div>
}

function MetaAds() {
  const camps=[{name:'Captación Leads B2B',platform:'Facebook',status:'Activa',budget:'€50/día',spent:'€1,240',impressions:'184k',clicks:'3,841',leads:'127',cpl:'€9.76',roas:'3.2x'},{name:'Retargeting Web',platform:'Instagram',status:'Activa',budget:'€30/día',spent:'€720',impressions:'98k',clicks:'2,210',leads:'89',cpl:'€8.09',roas:'4.1x'},{name:'Awareness Marca',platform:'FB+IG',status:'Pausada',budget:'€80/día',spent:'€2,100',impressions:'512k',clicks:'5,100',leads:'203',cpl:'€10.34',roas:'2.8x'}]
  return <div style={{display:'flex',flexDirection:'column',gap:16}}>
    <div style={{display:'flex',alignItems:'center',gap:12}}>
      <div style={{width:38,height:38,borderRadius:11,background:'#1877F2',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,color:'#fff',fontWeight:900}}>f</div>
      <div><div style={{fontWeight:800,fontSize:18}}>Meta Ads</div><div style={{fontSize:11,color:T.muted}}>Facebook & Instagram · ClientFlow Spain</div></div>
      <Pill c={T.green}>● Conectado</Pill>
    </div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(6,1fr)',gap:11}}>
      {[{l:'Inversión',v:'€4,060'},{l:'Impresiones',v:'794k'},{l:'Clics',v:'11,151'},{l:'Leads',v:'419',h:true},{l:'CPL',v:'€9.69'},{l:'ROAS',v:'3.4x',h:true}].map((k:any,i:number)=><div key={i} style={{padding:'11px 12px',background:T.s2,border:'1px solid '+T.border,borderRadius:11,textAlign:'center'}}><div style={{fontWeight:800,fontSize:17,color:k.h?T.green:T.text}}>{k.v}</div><div style={{fontSize:10,color:T.muted,marginTop:2}}>{k.l}</div></div>)}
    </div>
    <Card style={{overflow:'hidden'}}>
      <table style={{width:'100%',borderCollapse:'collapse'}}>
        <thead><tr style={{borderBottom:'1px solid '+T.border}}>{['Campaña','Plataforma','Estado','Presupuesto','Gastado','Impresiones','Clics','Leads','CPL','ROAS'].map(h=><th key={h} style={{padding:'8px 11px',textAlign:'left',fontSize:10,color:T.muted,fontWeight:600,textTransform:'uppercase',whiteSpace:'nowrap'}}>{h}</th>)}</tr></thead>
        <tbody>{camps.map((c,i)=><tr key={i} style={{borderBottom:'1px solid '+T.border,cursor:'pointer'}}>
          <td style={{padding:'9px 11px'}}><div style={{fontSize:11,fontWeight:600}}>{c.name}</div></td>
          <td style={{padding:'9px 11px',fontSize:11,color:T.muted}}>{c.platform}</td>
          <td style={{padding:'9px 11px'}}><Pill c={sC[c.status]||T.muted} sm>{c.status}</Pill></td>
          <td style={{padding:'9px 11px',fontSize:11,color:T.muted}}>{c.budget}</td>
          <td style={{padding:'9px 11px',fontSize:12,fontWeight:600}}>{c.spent}</td>
          <td style={{padding:'9px 11px',fontSize:11,color:T.muted}}>{c.impressions}</td>
          <td style={{padding:'9px 11px',fontSize:11,color:T.muted}}>{c.clicks}</td>
          <td style={{padding:'9px 11px',fontSize:12,fontWeight:700,color:T.green}}>{c.leads}</td>
          <td style={{padding:'9px 11px',fontSize:12,color:T.orange}}>{c.cpl}</td>
          <td style={{padding:'9px 11px',fontSize:12,fontWeight:700,color:T.cyan}}>{c.roas}</td>
        </tr>)}</tbody>
      </table>
    </Card>
  </div>
}

function GoogleAds() {
  const camps=[{name:'Búsqueda — CRM',type:'Búsqueda',status:'Activa',budget:'€60/día',spent:'€1,840',clicks:'2,160',conv:'98',cpc:'€0.85',cpa:'€18.78',qs:8},{name:'Display Remarketing',type:'Display',status:'Activa',budget:'€25/día',spent:'€620',clicks:'1,540',conv:'41',cpc:'€0.40',cpa:'€15.12',qs:0},{name:'YouTube Awareness',type:'Video',status:'Activa',budget:'€35/día',spent:'€420',clicks:'640',conv:'12',cpc:'€0.66',cpa:'€35.00',qs:0}]
  return <div style={{display:'flex',flexDirection:'column',gap:16}}>
    <div style={{display:'flex',alignItems:'center',gap:12}}>
      <div style={{width:38,height:38,borderRadius:11,background:'#4285F4',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,color:'#fff',fontWeight:900}}>G</div>
      <div><div style={{fontWeight:800,fontSize:18}}>Google Ads</div><div style={{fontSize:11,color:T.muted}}>Search · Display · Shopping · Video</div></div>
      <Pill c={T.green}>● Conectado</Pill>
    </div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(6,1fr)',gap:11}}>
      {[{l:'Inversión',v:'€3,860'},{l:'Impresiones',v:'376k'},{l:'Clics',v:'5,230'},{l:'Conv.',v:'180',h:true},{l:'CPA',v:'€21.44'},{l:'CTR',v:'1.39%',h:true}].map((k:any,i:number)=><div key={i} style={{padding:'11px 12px',background:T.s2,border:'1px solid '+T.border,borderRadius:11,textAlign:'center'}}><div style={{fontWeight:800,fontSize:17,color:k.h?T.green:T.text}}>{k.v}</div><div style={{fontSize:10,color:T.muted,marginTop:2}}>{k.l}</div></div>)}
    </div>
    <Card style={{overflow:'hidden'}}>
      <table style={{width:'100%',borderCollapse:'collapse'}}>
        <thead><tr style={{borderBottom:'1px solid '+T.border}}>{['Campaña','Tipo','Estado','Presupuesto','Gastado','Clics','Conv.','CPC','CPA','QS'].map(h=><th key={h} style={{padding:'8px 11px',textAlign:'left',fontSize:10,color:T.muted,fontWeight:600,textTransform:'uppercase'}}>{h}</th>)}</tr></thead>
        <tbody>{camps.map((c,i)=><tr key={i} style={{borderBottom:'1px solid '+T.border,cursor:'pointer'}}>
          <td style={{padding:'9px 11px',fontSize:11,fontWeight:600}}>{c.name}</td>
          <td style={{padding:'9px 11px'}}><Pill c={'#4285F4'} sm>{c.type}</Pill></td>
          <td style={{padding:'9px 11px'}}><Pill c={sC[c.status]||T.muted} sm>{c.status}</Pill></td>
          <td style={{padding:'9px 11px',fontSize:11,color:T.muted}}>{c.budget}</td>
          <td style={{padding:'9px 11px',fontSize:12,fontWeight:600}}>{c.spent}</td>
          <td style={{padding:'9px 11px',fontSize:11,color:T.muted}}>{c.clicks}</td>
          <td style={{padding:'9px 11px',fontSize:12,fontWeight:700,color:T.green}}>{c.conv}</td>
          <td style={{padding:'9px 11px',fontSize:12,color:T.cyan}}>{c.cpc}</td>
          <td style={{padding:'9px 11px',fontSize:12,color:T.orange}}>{c.cpa}</td>
          <td style={{padding:'9px 11px'}}>{c.qs?<div style={{width:24,height:24,borderRadius:'50%',border:'2px solid '+(c.qs>=8?T.green:T.orange),display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,fontWeight:700,color:c.qs>=8?T.green:T.orange}}>{c.qs}</div>:<span style={{color:T.muted}}>–</span>}</td>
        </tr>)}</tbody>
      </table>
    </Card>
  </div>
}

function Reports() {
  const bars=[30,48,42,65,55,80,72,61,85,70,95,88]
  return <div style={{display:'flex',flexDirection:'column',gap:16}}>
    <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14}}>
      {[{i:'💰',l:'Ingresos',v:'€84,320',c:T.green},{i:'🎯',l:'Leads',v:'599',c:T.accent},{i:'📈',l:'Tasa cierre',v:'38%',c:T.purple},{i:'⌛',l:'Ciclo venta',v:'18 días',c:T.orange}].map((s,i)=><Card key={i} style={{padding:16}}><div style={{fontSize:18,marginBottom:6}}>{s.i}</div><div style={{fontWeight:800,fontSize:20,color:s.c}}>{s.v}</div><div style={{fontSize:11,color:T.muted,marginTop:2}}>{s.l}</div></Card>)}
    </div>
    <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:16}}>
      <Card style={{padding:20}}>
        <div style={{fontWeight:800,fontSize:14,marginBottom:18}}>Ingresos 2026</div>
        <div style={{display:'flex',alignItems:'flex-end',gap:7,height:120}}>
          {bars.map((h,i)=><div key={i} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:4}}><div style={{width:'100%',borderRadius:'4px 4px 0 0',height:h+'%',background:i===3?'linear-gradient(180deg,#3D7EFF,#00C8C0)':'#3D7EFF28'}}/><div style={{fontSize:8,color:T.faint}}>{'EFMAMJJASOND'[i]}</div></div>)}
        </div>
      </Card>
      <Card style={{padding:20}}>
        <div style={{fontWeight:800,fontSize:14,marginBottom:16}}>ROI por Canal</div>
        {[{l:'Meta Ads',roi:'340%',c:'#1877F2'},{l:'Google Ads',roi:'280%',c:'#4285F4'},{l:'Email',roi:'820%',c:T.accent},{l:'WhatsApp',roi:'650%',c:'#25D366'},{l:'Orgánico',roi:'∞',c:T.green}].map(c=><div key={c.l} style={{marginBottom:11}}>
          <div style={{display:'flex',justifyContent:'space-between',fontSize:11,marginBottom:4}}><span style={{color:T.muted}}>{c.l}</span><span style={{fontWeight:700,color:c.c}}>ROI {c.roi}</span></div>
          <div style={{height:4,borderRadius:2,background:T.s3}}><div style={{height:'100%',width:c.roi==='∞'?'100%':Math.min(parseInt(c.roi)/10,100)+'%',borderRadius:2,background:c.c}}/></div>
        </div>)}
      </Card>
    </div>
  </div>
}

function Soon({label}:{label:string}) {
  return <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:400,gap:16}}>
    <div style={{fontSize:48}}>🚧</div>
    <div style={{fontWeight:800,fontSize:22}}>{label}</div>
    <div style={{color:T.muted,fontSize:14}}>Conectando con la API · Próximamente</div>
  </div>
}
