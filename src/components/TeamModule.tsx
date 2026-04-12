// @ts-nocheck
'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

const T={s2:'#121520',s3:'#181C28',border:'#232840',accent:'#3D7EFF',accentG:'rgba(61,126,255,0.15)',green:'#18CF7A',red:'#FF3559',orange:'#FF7A35',purple:'#9B72FF',text:'#D8E0F0',muted:'#5E6A88'}
const roleC={owner:'#9B72FF',admin:'#3D7EFF',member:'#18CF7A',viewer:'#5E6A88'}

export default function TeamModule({wsId,userId}){
  const[members,setMembers]=useState([])
  const[invites,setInvites]=useState([])
  const[loading,setLoading]=useState(true)
  const[email,setEmail]=useState('')
  const[role,setRole]=useState('member')
  const[sending,setSending]=useState(false)
  const[result,setResult]=useState(null)
  const sb=createClient()

  useEffect(()=>{load()},[wsId])
  const load=async()=>{
    setLoading(true)
    const r=await fetch('/api/team/invite?workspace_id='+wsId)
    const d=await r.json()
    setMembers(d.members||[]);setInvites(d.invitations||[]);setLoading(false)
  }

  const invite=async()=>{
    if(!email||!email.includes('@'))return
    setSending(true);setResult(null)
    const r=await fetch('/api/team/invite',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({workspace_id:wsId,invited_by:userId,email,role})})
    const d=await r.json()
    if(d.invitation){setResult({ok:true,msg:'Invitación enviada a '+email+' ✅'});setEmail('');load()}
    else setResult({ok:false,msg:d.error||'Error al enviar'})
    setSending(false)
  }

  const cancel=async(id)=>{
    await fetch('/api/team/invite',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({id})})
    load()
  }

  return(
    <div style={{display:'flex',flexDirection:'column',gap:16,fontFamily:"'Outfit',sans-serif",color:T.text}}>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12}}>
        {[{i:'👥',l:'Miembros activos',v:members.length,c:T.accent},{i:'✉️',l:'Invitaciones pendientes',v:invites.length,c:T.orange},{i:'🔑',l:'Plan actual',v:'Pro Trial',c:T.purple}].map((s,i)=>(
          <div key={i} style={{background:T.s2,border:'1px solid '+T.border,borderRadius:14,padding:16,position:'relative',overflow:'hidden'}}>
            <div style={{position:'absolute',top:-10,right:-10,width:50,height:50,borderRadius:'50%',background:s.c,opacity:0.08}}/>
            <div style={{fontSize:20,marginBottom:8}}>{s.i}</div><div style={{fontWeight:800,fontSize:22,color:s.c}}>{s.v}</div><div style={{fontSize:11,color:T.muted,marginTop:2}}>{s.l}</div>
          </div>
        ))}
      </div>

      <div style={{background:T.s2,border:'1px solid '+T.border,borderRadius:14,padding:20}}>
        <div style={{fontWeight:800,fontSize:14,marginBottom:16}}>➕ Invitar nuevo miembro</div>
        {result&&<div style={{marginBottom:14,padding:'10px 14px',borderRadius:9,background:result.ok?T.green+'15':T.red+'15',border:'1px solid '+(result.ok?T.green:T.red)+'40',color:result.ok?T.green:T.red,fontSize:12,display:'flex',justifyContent:'space-between',alignItems:'center'}}><span>{result.msg}</span><button onClick={()=>setResult(null)} style={{background:'none',border:'none',color:'inherit',cursor:'pointer'}}>×</button></div>}
        <div style={{display:'grid',gridTemplateColumns:'1fr auto auto',gap:10,alignItems:'flex-end'}}>
          <div><div style={{fontSize:10,color:T.muted,textTransform:'uppercase',letterSpacing:'0.6px',marginBottom:5}}>Email del colaborador</div><input value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==='Enter'&&invite()} placeholder="colaborador@empresa.com" type="email" style={{width:'100%',background:T.s3,border:'1px solid '+T.border,borderRadius:9,padding:'9px 12px',color:T.text,fontSize:13,fontFamily:'inherit',outline:'none'}}/></div>
          <div><div style={{fontSize:10,color:T.muted,textTransform:'uppercase',letterSpacing:'0.6px',marginBottom:5}}>Rol</div><select value={role} onChange={e=>setRole(e.target.value)} style={{background:T.s3,border:'1px solid '+T.border,borderRadius:9,padding:'9px 12px',color:T.text,fontSize:13,fontFamily:'inherit',outline:'none'}}><option value="admin">Admin</option><option value="member">Miembro</option><option value="viewer">Visor</option></select></div>
          <button onClick={invite} disabled={sending} style={{padding:'9px 18px',border:'none',borderRadius:9,background:'linear-gradient(135deg,#3D7EFF,#00C8C0)',color:'#fff',fontSize:13,fontWeight:600,cursor:'pointer',opacity:sending?0.7:1,fontFamily:'inherit'}}>{sending?'Enviando...':'Invitar →'}</button>
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
        <div style={{background:T.s2,border:'1px solid '+T.border,borderRadius:14,padding:18}}>
          <div style={{fontWeight:700,fontSize:13,marginBottom:14}}>👥 Miembros del workspace</div>
          {!members.length?<div style={{color:T.muted,fontSize:12,textAlign:'center',padding:20}}>Solo tú por ahora</div>
          :members.map((m,i)=><div key={i} style={{display:'flex',gap:10,alignItems:'center',padding:'8px 0',borderBottom:'1px solid '+T.border}}>
            <div style={{width:32,height:32,borderRadius:'50%',background:T.accent,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,color:'#fff'}}>{m.user?.email?.[0]?.toUpperCase()||'?'}</div>
            <div style={{flex:1}}><div style={{fontSize:12,fontWeight:600}}>{m.user?.email||'Usuario'}</div><div style={{fontSize:10,color:T.muted}}>Desde {new Date(m.joined_at||m.created_at).toLocaleDateString('es')}</div></div>
            <span style={{fontSize:10,fontWeight:600,padding:'2px 8px',borderRadius:20,background:(roleC[m.role]||T.muted)+'20',color:roleC[m.role]||T.muted}}>{m.role}</span>
          </div>)}
        </div>
        <div style={{background:T.s2,border:'1px solid '+T.border,borderRadius:14,padding:18}}>
          <div style={{fontWeight:700,fontSize:13,marginBottom:14}}>✉️ Invitaciones pendientes</div>
          {!invites.length?<div style={{color:T.muted,fontSize:12,textAlign:'center',padding:20}}>Sin invitaciones pendientes</div>
          :invites.map((inv,i)=><div key={i} style={{display:'flex',gap:10,alignItems:'center',padding:'8px 0',borderBottom:'1px solid '+T.border}}>
            <div style={{width:32,height:32,borderRadius:'50%',background:T.orange+'30',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14}}>✉️</div>
            <div style={{flex:1}}><div style={{fontSize:12,fontWeight:600}}>{inv.invited_email}</div><div style={{fontSize:10,color:T.muted}}>Expira {new Date(inv.expires_at).toLocaleDateString('es')}</div></div>
            <div style={{display:'flex',gap:6}}>
              <span style={{fontSize:10,fontWeight:600,padding:'2px 8px',borderRadius:20,background:(roleC[inv.role]||T.muted)+'20',color:roleC[inv.role]||T.muted}}>{inv.role}</span>
              <button onClick={()=>cancel(inv.id)} style={{padding:'3px 8px',borderRadius:6,border:'1px solid '+T.red+'40',background:T.red+'10',color:T.red,fontSize:10,cursor:'pointer'}}>Cancelar</button>
            </div>
          </div>)}
        </div>
      </div>
    </div>
  )
}