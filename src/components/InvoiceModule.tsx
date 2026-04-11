/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

const T={s2:'#121520',s3:'#181C28',border:'#232840',accent:'#3D7EFF',accentG:'rgba(61,126,255,0.15)',green:'#18CF7A',red:'#FF3559',orange:'#FF7A35',text:'#D8E0F0',muted:'#5E6A88'}
const sC:Record<string,string>={draft:'#5E6A88',sent:'#3D7EFF',paid:'#18CF7A',overdue:'#FF3559',cancelled:'#FF7A35'}
const sL:Record<string,string>={draft:'Borrador',sent:'Enviada',paid:'Pagada',overdue:'Vencida',cancelled:'Cancelada'}

export default function InvoiceModule({wsId,contacts}:{wsId:string,contacts:any[]}){
  const[invoices,setInvoices]=useState<any[]>([])
  const[loading,setLoading]=useState(true)
  const[showForm,setShowForm]=useState(false)
  const[saving,setSaving]=useState(false)
  const[contactId,setContactId]=useState('')
  const[notes,setNotes]=useState('')
  const[items,setItems]=useState([{description:'',quantity:1,price:0}])
  const sb=createClient()

  useEffect(()=>{load()},[wsId])
  const load=async()=>{setLoading(true);const{data}=await sb.from('invoices').select('*,contact:contacts(first_name,last_name)').eq('workspace_id',wsId).order('created_at',{ascending:false});setInvoices(data||[]);setLoading(false)}

  const addItem=()=>setItems(p=>[...p,{description:'',quantity:1,price:0}])
  const updateItem=(i:number,f:string,v:any)=>setItems(p=>p.map((item,idx)=>idx===i?{...item,[f]:v}:item))
  const removeItem=(i:number)=>setItems(p=>p.filter((_,idx)=>idx!==i))
  const subtotal=items.reduce((s,i)=>s+(i.quantity*(i.price||0)),0)
  const tax=subtotal*0.21
  const total=subtotal+tax

  const save=async()=>{
    if(!items.some(i=>i.description&&i.price>0))return
    setSaving(true)
    const res=await fetch('/api/invoices',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({workspace_id:wsId,contact_id:contactId||null,items,notes})})
    const data=await res.json()
    if(data.success){setShowForm(false);setItems([{description:'',quantity:1,price:0}]);setNotes('');setContactId('');load()}
    setSaving(false)
  }

  const updateStatus=async(id:string,status:string)=>{
    await fetch('/api/invoices',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,status})})
    setInvoices(p=>p.map((x:any)=>x.id===id?{...x,status}:x))
  }

  const totalPaid=invoices.filter(i=>i.status==='paid').reduce((s:number,i:any)=>s+(i.total_amount||0),0)
  const pending=invoices.filter(i=>i.status==='sent').reduce((s:number,i:any)=>s+(i.total_amount||0),0)

  return(
    <div style={{display:'flex',flexDirection:'column' as const,gap:16,fontFamily:"'Outfit',sans-serif",color:T.text}}>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12}}>
        {[{i:'🧾',l:'Total',v:invoices.length,c:T.accent},{i:'✅',l:'Pagadas',v:invoices.filter(i=>i.status==='paid').length,c:T.green},{i:'💰',l:'Cobrado',v:'€'+totalPaid.toLocaleString(),c:T.green},{i:'⏳',l:'Pendiente',v:'€'+pending.toLocaleString(),c:T.orange}].map((s,i)=>(
          <div key={i} style={{background:T.s2,border:'1px solid '+T.border,borderRadius:14,padding:14,position:'relative',overflow:'hidden'}}>
            <div style={{position:'absolute',top:-10,right:-10,width:50,height:50,borderRadius:'50%',background:s.c,opacity:0.08}}/>
            <div style={{fontSize:18,marginBottom:6}}>{s.i}</div>
            <div style={{fontWeight:800,fontSize:20,color:s.c}}>{s.v}</div>
            <div style={{fontSize:11,color:T.muted,marginTop:2}}>{s.l}</div>
          </div>
        ))}
      </div>

      {showForm&&<div style={{background:T.s2,border:'1px solid '+T.border,borderRadius:14,padding:22}}>
        <div style={{display:'flex',justifyContent:'space-between',marginBottom:18}}><div style={{fontWeight:800,fontSize:15}}>🧾 Nueva Factura</div><button onClick={()=>setShowForm(false)} style={{background:'none',border:'none',color:T.muted,fontSize:20,cursor:'pointer'}}>×</button></div>
        <div style={{marginBottom:14}}>
          <div style={{fontSize:10,color:T.muted,textTransform:'uppercase' as const,letterSpacing:'0.6px',marginBottom:5}}>Cliente</div>
          <select value={contactId} onChange={e=>setContactId(e.target.value)} style={{width:'100%',background:T.s3,border:'1px solid '+T.border,borderRadius:9,padding:'9px 12px',color:T.text,fontSize:13,fontFamily:'inherit',outline:'none'}}>
            <option value="">— Seleccionar cliente —</option>
            {contacts.map((c:any)=><option key={c.id} value={c.id}>{c.first_name} {c.last_name}{c.email?' · '+c.email:''}</option>)}
          </select>
        </div>
        <div style={{marginBottom:10}}>
          <div style={{fontSize:10,color:T.muted,textTransform:'uppercase' as const,letterSpacing:'0.6px',marginBottom:8}}>Líneas de factura</div>
          {items.map((item,i)=>(
            <div key={i} style={{display:'grid',gridTemplateColumns:'1fr 80px 100px 36px',gap:8,marginBottom:8,alignItems:'center'}}>
              <input value={item.description} onChange={e=>updateItem(i,'description',e.target.value)} placeholder="Descripción del servicio" style={{background:T.s3,border:'1px solid '+T.border,borderRadius:8,padding:'8px 10px',color:T.text,fontSize:12,fontFamily:'inherit',outline:'none'}}/>
              <input type="number" value={item.quantity} onChange={e=>updateItem(i,'quantity',parseFloat(e.target.value)||1)} style={{background:T.s3,border:'1px solid '+T.border,borderRadius:8,padding:'8px 10px',color:T.text,fontSize:12,fontFamily:'inherit',outline:'none',textAlign:'center' as const}}/>
              <input type="number" value={item.price} onChange={e=>updateItem(i,'price',parseFloat(e.target.value)||0)} placeholder="Precio €" style={{background:T.s3,border:'1px solid '+T.border,borderRadius:8,padding:'8px 10px',color:T.text,fontSize:12,fontFamily:'inherit',outline:'none'}}/>
              <button onClick={()=>removeItem(i)} style={{width:36,height:36,borderRadius:8,border:'1px solid '+T.red+'40',background:T.red+'10',color:T.red,fontSize:16,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>×</button>
            </div>
          ))}
          <button onClick={addItem} style={{padding:'6px 14px',borderRadius:8,border:'1px dashed '+T.border,background:'transparent',color:T.muted,fontSize:11,cursor:'pointer'}}>+ Añadir línea</button>
        </div>
        <div style={{marginBottom:14}}>
          <div style={{fontSize:10,color:T.muted,textTransform:'uppercase' as const,letterSpacing:'0.6px',marginBottom:5}}>Notas</div>
          <input value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Condiciones de pago, notas..." style={{width:'100%',background:T.s3,border:'1px solid '+T.border,borderRadius:9,padding:'9px 12px',color:T.text,fontSize:13,fontFamily:'inherit',outline:'none'}}/>
        </div>
        <div style={{background:T.s3,borderRadius:10,padding:'14px 16px',marginBottom:16}}>
          {[{l:'Subtotal',v:'€'+subtotal.toFixed(2)},{l:'IVA (21%)',v:'€'+tax.toFixed(2)},{l:'TOTAL',v:'€'+total.toFixed(2),bold:true}].map(r=>(
            <div key={r.l} style={{display:'flex',justifyContent:'space-between',fontSize:r.bold?14:12,fontWeight:r.bold?800:400,color:r.bold?T.green:T.text,marginBottom:r.bold?0:6}}><span>{r.l}</span><span>{r.v}</span></div>
          ))}
        </div>
        <button onClick={save} disabled={saving} style={{width:'100%',padding:'11px',border:'none',borderRadius:9,background:'linear-gradient(135deg,#3D7EFF,#00C8C0)',color:'#fff',fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:'inherit',opacity:saving?0.7:1}}>
          {saving?'Guardando...':'💾 Crear factura'}
        </button>
      </div>}

      <div>
        <div style={{display:'flex',gap:8,marginBottom:14,alignItems:'center'}}>
          <span style={{fontSize:11,color:T.muted}}>{invoices.length} facturas</span>
          <button onClick={()=>setShowForm(true)} style={{marginLeft:'auto',border:'none',borderRadius:9,padding:'7px 16px',background:'linear-gradient(135deg,#3D7EFF,#00C8C0)',color:'#fff',fontSize:12,fontWeight:600,cursor:'pointer'}}>+ Nueva factura</button>
        </div>
        {!invoices.length&&!loading
          ?<div style={{background:T.s2,border:'1px solid '+T.border,borderRadius:14,padding:48,textAlign:'center'}}><div style={{fontSize:40,marginBottom:12}}>🧾</div><div style={{fontWeight:700,fontSize:16,marginBottom:8}}>Sin facturas aún</div><div style={{color:T.muted,fontSize:13,marginBottom:20}}>Crea facturas con IVA automático y haz seguimiento de pagos</div><button onClick={()=>setShowForm(true)} style={{border:'none',borderRadius:9,padding:'10px 24px',background:'linear-gradient(135deg,#3D7EFF,#00C8C0)',color:'#fff',fontSize:13,fontWeight:600,cursor:'pointer'}}>+ Crear primera factura</button></div>
          :<div style={{background:T.s2,border:'1px solid '+T.border,borderRadius:14,overflow:'hidden'}}>
            <table style={{width:'100%',borderCollapse:'collapse' as const}}>
              <thead><tr style={{borderBottom:'1px solid '+T.border}}>{['Nº','Cliente','Subtotal','IVA','Total','Estado','Vencimiento','Estado'].map(h=><th key={h} style={{padding:'9px 12px',textAlign:'left' as const,fontSize:10,color:T.muted,fontWeight:600,textTransform:'uppercase' as const,letterSpacing:'0.6px'}}>{h}</th>)}</tr></thead>
              <tbody>{invoices.map((inv:any)=><tr key={inv.id} style={{borderBottom:'1px solid '+T.border}}>
                <td style={{padding:'9px 12px',fontWeight:700,fontSize:12,color:T.accent}}>{inv.invoice_number}</td>
                <td style={{padding:'9px 12px',fontSize:11}}>{inv.contact?.first_name||'—'} {inv.contact?.last_name||''}</td>
                <td style={{padding:'9px 12px',fontSize:11,color:T.muted}}>€{(inv.subtotal||0).toFixed(2)}</td>
                <td style={{padding:'9px 12px',fontSize:11,color:T.muted}}>€{(inv.tax_amount||0).toFixed(2)}</td>
                <td style={{padding:'9px 12px',fontSize:12,fontWeight:800,color:T.green}}>€{(inv.total_amount||0).toFixed(2)}</td>
                <td style={{padding:'9px 12px'}}><span style={{display:'inline-flex',padding:'2px 8px',borderRadius:20,fontSize:10,fontWeight:600,background:(sC[inv.status]||T.muted)+'20',color:sC[inv.status]||T.muted}}>{sL[inv.status]||inv.status}</span></td>
                <td style={{padding:'9px 12px',fontSize:11,color:inv.status==='overdue'?T.red:T.muted}}>{inv.due_date?new Date(inv.due_date).toLocaleDateString('es'):'—'}</td>
                <td style={{padding:'9px 12px'}}>
                  <select value={inv.status} onChange={e=>updateStatus(inv.id,e.target.value)} style={{background:T.s3,border:'1px solid '+T.border,borderRadius:7,padding:'4px 8px',color:T.text,fontSize:10,fontFamily:'inherit',cursor:'pointer'}}>
                    {Object.entries(sL).map(([v,l])=><option key={v} value={v}>{l as string}</option>)}
                  </select>
                </td>
              </tr>)}</tbody>
            </table>
          </div>
        }
      </div>
    </div>
  )
}