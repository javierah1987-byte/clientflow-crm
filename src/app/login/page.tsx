'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mode, setMode] = useState<'login'|'register'>('login')

  const handle = async () => {
    setLoading(true)
    setError('')
    const supabase = createClient()
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        window.location.href = '/'
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setError('Revisa tu email para confirmar la cuenta')
      }
    } catch (e: any) {
      setError(e.message)
    }
    setLoading(false)
  }

  return (
    <div style={{display:'flex',height:'100vh',background:'#07080C',alignItems:'center',justifyContent:'center',fontFamily:"'Outfit',sans-serif"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');*{box-sizing:border-box;margin:0;padding:0}input{font-family:inherit;outline:none}`}</style>
      <div style={{width:400,background:'#0D0F16',border:'1px solid #232840',borderRadius:20,padding:40}}>
        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:32}}>
          <div style={{width:40,height:40,borderRadius:11,background:'linear-gradient(135deg,#3D7EFF,#00C8C0)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>⬡</div>
          <div>
            <div style={{fontWeight:800,fontSize:20,color:'#D8E0F0'}}>ClientFlow</div>
            <div style={{fontSize:11,color:'#5E6A88',textTransform:'uppercase',letterSpacing:'1px'}}>CRM Pro</div>
          </div>
        </div>
        <div style={{fontWeight:700,fontSize:18,color:'#D8E0F0',marginBottom:8}}>{mode==='login'?'Iniciar sesión':'Crear cuenta'}</div>
        <div style={{fontSize:13,color:'#5E6A88',marginBottom:28}}>{mode==='login'?'Accede a tu CRM':'Empieza tu prueba gratuita'}</div>
        <div style={{marginBottom:16}}>
          <div style={{fontSize:11,color:'#5E6A88',marginBottom:6,textTransform:'uppercase',letterSpacing:'0.6px'}}>Email</div>
          <input value={email} onChange={(e:any)=>setEmail(e.target.value)} type="email" placeholder="tu@email.com"
            style={{width:'100%',background:'#121520',border:'1px solid #232840',borderRadius:10,padding:'11px 14px',color:'#D8E0F0',fontSize:14}}/>
        </div>
        <div style={{marginBottom:24}}>
          <div style={{fontSize:11,color:'#5E6A88',marginBottom:6,textTransform:'uppercase',letterSpacing:'0.6px'}}>Contraseña</div>
          <input value={password} onChange={(e:any)=>setPassword(e.target.value)} type="password" placeholder="Mínimo 6 caracteres"
            onKeyDown={(e:any)=>e.key==='Enter'&&handle()}
            style={{width:'100%',background:'#121520',border:'1px solid #232840',borderRadius:10,padding:'11px 14px',color:'#D8E0F0',fontSize:14}}/>
        </div>
        {error&&<div style={{marginBottom:16,padding:'10px 14px',borderRadius:9,background:'#FF355915',color:'#FF3559',fontSize:12}}>{error}</div>}
        <button onClick={handle} disabled={loading}
          style={{width:'100%',padding:'13px',border:'none',borderRadius:10,background:'linear-gradient(135deg,#3D7EFF,#00C8C0)',color:'#fff',fontSize:15,fontWeight:700,cursor:'pointer',opacity:loading?0.7:1,fontFamily:'inherit'}}>
          {loading?'Cargando...':(mode==='login'?'Entrar al CRM →':'Crear cuenta →')}
        </button>
        <div style={{textAlign:'center',marginTop:20,fontSize:13,color:'#5E6A88'}}>
          {mode==='login'?'¿No tienes cuenta? ':'¿Ya tienes cuenta? '}
          <button onClick={()=>setMode(mode==='login'?'register':'login')} style={{background:'none',border:'none',color:'#3D7EFF',cursor:'pointer',fontSize:13,fontWeight:600,fontFamily:'inherit'}}>
            {mode==='login'?'Regístrate gratis':'Inicia sesión'}
          </button>
        </div>
      </div>
    </div>
  )
}