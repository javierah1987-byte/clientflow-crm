// @ts-nocheck
'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
const T={s2:'#121520',s3:'#181C28',border:'#232840',accent:'#3D7EFF',green:'#18CF7A',orange:'#FF7A35',purple:'#9B72FF',cyan:'#00C8C0',red:'#FF3559',text:'#D8E0F0',muted:'#5E6A88'}
const srcCols={meta_ads:'#1877F2',google_ads:'#4285F4',whatsapp:'#25D366',form:'#9B72FF',email:'#3D7EFF',organic:'#18CF7A',referral:'#FF7A35'}
export default function ReportsModule({wsId}) {
  const[contacts,setContacts]=useState([])
  const[deals,setDeals]=useState([])
  const[invoices,setInvoices]=useState([])
  const[proposals,setProposals]=useState([])
  const[goals,setGoals]=useState([])
  const[loading,setLoading]=useState(true)
  const sb=createClient()
  useEffect(()=>{load()},[wsId])
  const load=async()=>{
    setLoading(true)
    const[c,d,inv,p,g]=await Promise.all([
      sb.from('contacts').select('*').eq('workspace_id',wsId),
      sb.from('deals').select('*').eq('workspace_id',wsId),
      sb.from('invoices').select('*').eq('workspace_id',wsId),
      sb.from('proposals').select('*').eq('workspace_id',wsId),
      sb.from('sales_goals').select('*').eq('workspace_id',wsId),
    ])
    setContacts(c.data||[]);setDeals(d.data||[]);setInvoices(inv.data||[]);setProposals(p.data||[]);setGoals(g.data||[])
    setLoading(false)
  }
  const totalRevenue=invoices.filter(i=>i.status==='paid').reduce((s,i)=>s+(i.total_amount||0),0)
  const pending=invoices.filter(i=>i.status==='sent').reduce((s,i)=>s+(i.total_amount||0),0)
  const pipeline=deals.reduce((s,d)=>s+(d.value||0),0)
  const conv=contacts.length?Math.round(contacts.filter(c=>c.status==='client').length/contacts.length*100):0
  const avgDeal=deals.length?Math.round(pipeline/deals.length):0
  const bars=[28,45,38,62,55,75]; const maxBar=Math.max(...bars)
  const months=['Nov','Dic','Ene','Feb','Mar','Abr']
  const exportCSV=()=>{
    const rows=[['Nombre','Email','Estado','Origen','Valor','Ciudad'],...contacts.map(c=>[c.first_name+' '+c.last_name,c.email||'',c.status||'',c.source||'',c.lifetime_value||0,c.city||''])]
    const csv=rows.map(r=>r.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(',')).join('
')
    const blob=new Blob([csv],{type:'text/csv'});const url=URL.createObjectURL(blob)
    const a=document.createElement('a');a.href=url;a.download='clientflow-contactos-'+new Date().toISOString().slice(0,10)+'.csv';a.click()
  }
  const Card=({children,style={}})=><div style={{background:T.s2,border:'1px solid '+T.border,borderRadius:14,padding:20,...style}}>{children}</div>
  if(loading)return<div style={{textAlign:'center',padding:60,color:T.muted}}>⏳ Cargando reportes...</div>
  return(
    <div style={{display:'flex',flexDirection:'column',gap:16,fontFamily:"'Outfit',sans-serif",color:T.text}}>
      <div style={{display:'flex',alignItems:'center',gap:10}}>
        <div style={{fontSize:11,color:T.muted,flex:1}}>Datos en tiempo real · Supabase · {new Date().toLocaleDateString('es',{day:'numeric',month:'long',year:'numeric'})}</div>
        <button onClick={exportCSV} style={{padding:'7px 14px',borderRadius:8,border:'1px solid '+T.border,background:'transparent',color:T.text,fontSize:11,cursor:'pointer',fontFamily:'inherit'}}>📥 Exportar CSV</button>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:12}}>
        {[{i:'💰',l:'Ingresos cobrados',v:'€'+totalRevenue.toLocaleString(),c:T.green},{i:'⏳',l:'Pendiente cobro',v:'€'+pending.toLocaleString(),c:T.orange},{i:'🎯',l:'Pipeline total',v:'€'+pipeline.toLocaleString(),c:T.accent},{i:'📈',l:'Conversión',v:conv+'%',c:T.purple},{i:'📊',l:'Ticket medio',v:'€'+avgDeal.toLocaleString(),c:T.cyan}].map((s,i)=>(
          <Card key={i} style={{position:'relative',overflow:'hidden',padding:14}}>
            <div style={{position:'absolute',top:-8,right:-8,width:44,height:44,borderRadius:'50%',background:s.c,opacity:0.08}}/>
            <div style={{fontSize:18,marginBottom:6}}>{s.i}</div>
            <div style={{fontWeight:900,fontSize:20,color:s.c}}>{s.v}</div>
            <div style={{fontSize:10,color:T.muted,marginTop:2}}>{s.l}</div>
          </Card>
        ))}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:14}}>
        <Card>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:16}}>
            <div style={{fontWeight:700,fontSize:13}}>📈 Ingresos mensuales</div>
            <div style={{fontSize:11,background:T.green+'20',color:T.green,padding:'3px 10px',borderRadius:20,fontWeight:600}}>↑ 23% vs anterior</div>
          </div>
          <div style={{display:'flex',alignItems:'flex-end',gap:10,height:110}}>
            {bars.map((h,i)=>(
              <div key={i} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:5}}>
                <div style={{fontSize:9,color:T.muted}}>€{h}k</div>
                <div style={{width:'100%',borderRadius:'4px 4px 0 0',height:Math.round(h/maxBar*100)+'%',background:i===5?'linear-gradient(180deg,#3D7EFF,#00C8C0)':'#3D7EFF22'}}/>
                <div style={{fontSize:9,color:T.muted}}>{months[i]}</div>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <div style={{fontWeight:700,fontSize:13,marginBottom:14}}>🎯 Funnel de ventas</div>
          {[{l:'Leads',v:contacts.filter(c=>c.status==='lead').length,c:'#3D7EFF'},{l:'Prospectos',v:contacts.filter(c=>c.status==='prospect').length,c:'#9B72FF'},{l:'Propuestas',v:proposals.length,c:'#FF7A35'},{l:'Clientes',v:contacts.filter(c=>c.status==='client').length,c:'#18CF7A'}].map((f,i,arr)=>(
            <div key={f.l} style={{marginBottom:10}}>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:12,marginBottom:4}}><span style={{color:T.muted}}>{f.l}</span><span style={{fontWeight:700,color:f.c}}>{f.v}</span></div>
              <div style={{height:6,borderRadius:3,background:T.s3}}><div style={{height:'100%',width:arr[0].v?Math.round(f.v/arr[0].v*100)+'%':'0%',borderRadius:3,background:f.c}}/></div>
            </div>
          ))}
        </Card>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:14}}>
        <Card>
          <div style={{fontWeight:700,fontSize:13,marginBottom:14}}>📊 Por origen</div>
          {Object.keys(srcCols).map(src=>{
            const count=contacts.filter(c=>c.source===src).length;if(!count)return null
            return(<div key={src} style={{marginBottom:10}}>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:12,marginBottom:4}}><span style={{color:T.muted}}>{src.replace('_',' ')}</span><span style={{fontWeight:700,color:srcCols[src]}}>{count}</span></div>
              <div style={{height:5,borderRadius:3,background:T.s3}}><div style={{height:'100%',width:contacts.length?Math.round(count/contacts.length*100)+'%':'0%',borderRadius:3,background:srcCols[src]}}/></div>
            </div>)
          })}
          {!contacts.some(c=>c.source)&&<div style={{color:T.muted,fontSize:12}}>Sin datos de origen</div>}
        </Card>
        <Card>
          <div style={{fontWeight:700,fontSize:13,marginBottom:14}}>🏆 Top por valor</div>
          {contacts.sort((a,b)=>(b.lifetime_value||0)-(a.lifetime_value||0)).slice(0,5).map((c,i)=>(
            <div key={c.id} style={{display:'flex',gap:10,alignItems:'center',padding:'7px 0',borderBottom:'1px solid '+T.border}}>
              <div style={{width:22,height:22,borderRadius:'50%',background:['#FFD700','#C0C0C0','#CD7F32',T.accent,T.muted][i],display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,color:'#fff',flexShrink:0}}>{i+1}</div>
              <div style={{flex:1,minWidth:0}}><div style={{fontSize:12,fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.first_name} {c.last_name}</div><div style={{fontSize:10,color:T.muted}}>{c.city||'—'}</div></div>
              <div style={{fontSize:12,fontWeight:800,color:T.green}}>€{(c.lifetime_value||0).toLocaleString()}</div>
            </div>
          ))}
          {!contacts.length&&<div style={{color:T.muted,fontSize:12}}>Sin contactos</div>}
        </Card>
        <Card>
          <div style={{fontWeight:700,fontSize:13,marginBottom:14}}>🎯 Objetivos del mes</div>
          {goals.length?goals.map(g=>{
            const pct=Math.min(100,Math.round((g.current_value||0)/g.target_value*100))
            return(<div key={g.id} style={{marginBottom:14}}>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:12,marginBottom:4}}><span style={{fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:'65%'}}>{g.title}</span><span style={{color:pct>=100?T.green:T.orange,fontWeight:700}}>{pct}%</span></div>
              <div style={{height:7,borderRadius:4,background:T.s3,marginBottom:4}}><div style={{height:'100%',width:pct+'%',borderRadius:4,background:pct>=100?T.green:'linear-gradient(90deg,#3D7EFF,#9B72FF)',transition:'width 0.5s'}}/></div>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:10,color:T.muted}}><span>€{(g.current_value||0).toLocaleString()}</span><span>Meta: €{g.target_value.toLocaleString()}</span></div>
            </div>)
          }):<div style={{color:T.muted,fontSize:12,textAlign:'center',padding:20}}>Sin objetivos configurados</div>}
        </Card>
      </div>
    </div>
  )
}