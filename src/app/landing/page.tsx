// @ts-nocheck
import Link from 'next/link'
export const metadata = { title: 'ClientFlow CRM — El CRM para agencias y pymes españolas', description: 'Gestiona contactos, automatiza ventas y crece más rápido. Prueba gratis 14 días.' }
export default function Landing() {
  const features = [
    {icon:'👥',title:'Contactos sin límites',desc:'Importa desde CSV, Meta Ads, Google, WhatsApp o formularios web. Segmenta y actúa sobre cada lead.',color:'#3D7EFF'},
    {icon:'⚡',title:'Automatizaciones inteligentes',desc:'Bienvenida automática, seguimiento a 3 días, WhatsApp inmediato a leads de Meta. Todo sin tocar nada.',color:'#9B72FF'},
    {icon:'🤖',title:'Propuestas con IA',desc:'Claude AI genera propuestas comerciales profesionales y personalizadas en menos de 30 segundos.',color:'#00C8C0'},
    {icon:'📧',title:'Email Campaigns',desc:'Envía campañas masivas personalizadas con {{first_name}}. Métricas en tiempo real vía Resend.',color:'#18CF7A'},
    {icon:'💬',title:'WhatsApp Business',desc:'Inbox unificado. Responde desde el CRM. Conecta 360Dialog, Twilio o Meta Cloud API.',color:'#25D366'},
    {icon:'🧾',title:'Facturas y propuestas',desc:'IVA 21% automático. Numeración INV-XXXX. Seguimiento de pagos. Exportar a PDF.',color:'#FF7A35'},
  ]
  const plans = [
    {name:'Free',price:'€0',color:'#5E6A88',cta:'Empezar gratis',features:['100 contactos','1 usuario','CRM básico','Email manual']},
    {name:'Starter',price:'€29',color:'#3D7EFF',cta:'Prueba 14 días gratis',features:['1.000 contactos','3 usuarios','Email campaigns','Propuestas IA','Facturas']},
    {name:'Pro',price:'€79',color:'#9B72FF',popular:true,cta:'Prueba 14 días gratis',features:['10.000 contactos','10 usuarios','Automatizaciones','WhatsApp real','API acceso']},
    {name:'Enterprise',price:'€199',color:'#00C8C0',cta:'Contactar ventas',features:['Ilimitados','Multi-workspace','SLA 99.9%','White-label','Soporte 24/7']},
  ]
  const testimonials = [
    {name:'María Sánchez',role:'CEO · Agencia Digital Madrid',text:'Pasamos de Excel a ClientFlow en un día. Gestionamos 800 leads al mes con el mismo equipo.',av:'MS'},
    {name:'Jordi Puig',role:'Director Comercial · Startup BCN',text:'Las automatizaciones nos ahorran 3 horas diarias. Cada lead de Meta recibe WhatsApp en 5 minutos.',av:'JP'},
    {name:'Ana López',role:'Freelance · Consultoría Sevilla',text:'Las propuestas con IA son increíbles. Genero una propuesta en 30 segundos. Mis clientes quedan impresionados.',av:'AL'},
  ]
  const faqs = [
    {q:'¿Necesito tarjeta de crédito para empezar?',a:'No. El plan Free es gratuito para siempre. Los planes de pago tienen 14 días de prueba sin tarjeta.'},
    {q:'¿Puedo importar mis contactos?',a:'Sí. CSV, Excel, y sincronización automática con Meta Ads, Google Ads y WhatsApp Business.'},
    {q:'¿Es seguro? ¿Dónde están mis datos?',a:'Servidores en Europa (París). Cifrado SSL. Cumplimos GDPR. Nunca vendemos datos.'},
    {q:'¿Tiene WhatsApp Business integrado?',a:'Sí. 360Dialog, Twilio y Meta Cloud API. Mensajes en tiempo real directamente en el CRM.'},
    {q:'¿Cancelo en cualquier momento?',a:'Sí, sin penalizaciones. Conservas tus datos 30 días después de cancelar.'},
  ]
  return (
    <div style={{background:'#07080C',color:'#D8E0F0',minHeight:'100vh',fontFamily:"'Outfit',sans-serif"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');*{box-sizing:border-box;margin:0;padding:0}a{color:inherit;text-decoration:none}.hov{transition:all 0.25s}.hov:hover{transform:translateY(-3px);box-shadow:0 16px 48px rgba(0,0,0,0.4)}`}</style>
      {/* NAV */}
      <nav style={{background:'rgba(7,8,12,0.96)',borderBottom:'1px solid #232840',padding:'0 6%',display:'flex',alignItems:'center',justifyContent:'space-between',height:64,position:'sticky',top:0,zIndex:100,backdropFilter:'blur(20px)'}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:34,height:34,borderRadius:9,background:'linear-gradient(135deg,#3D7EFF,#00C8C0)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,boxShadow:'0 0 20px rgba(61,126,255,0.4)'}}>⬡</div>
          <span style={{fontWeight:800,fontSize:18}}>ClientFlow</span>
          <span style={{background:'#3D7EFF20',color:'#3D7EFF',fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:20,marginLeft:4}}>CRM</span>
        </div>
        <div style={{display:'flex',gap:28,fontSize:13,color:'#5E6A88'}}>
          {['Características','Precios','Integraciones'].map(l=><a key={l} href={'#'+l.toLowerCase()} style={{cursor:'pointer',transition:'color 0.2s'}} onMouseEnter={e=>(e.target as any).style.color='#D8E0F0'} onMouseLeave={e=>(e.target as any).style.color='#5E6A88'}>{l}</a>)}
        </div>
        <div style={{display:'flex',gap:10}}>
          <Link href="/login" style={{background:'transparent',color:'#D8E0F0',border:'1px solid #232840',borderRadius:9,padding:'9px 20px',fontSize:13,fontWeight:600}}>Iniciar sesión</Link>
          <Link href="/login" style={{background:'linear-gradient(135deg,#3D7EFF,#00C8C0)',color:'#fff',border:'none',borderRadius:9,padding:'9px 20px',fontSize:13,fontWeight:700}}>Empezar gratis →</Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{padding:'110px 6% 90px',textAlign:'center',background:'radial-gradient(ellipse 80% 60% at 50% 0%,rgba(61,126,255,0.12) 0%,transparent 70%)'}}>
        <div style={{display:'inline-flex',alignItems:'center',gap:8,background:'#3D7EFF12',border:'1px solid #3D7EFF30',borderRadius:20,padding:'6px 16px',fontSize:12,color:'#3D7EFF',marginBottom:32}}>
          <span style={{width:6,height:6,borderRadius:'50%',background:'#18CF7A',display:'inline-block'}}></span>
          Nuevo: Propuestas IA + WhatsApp Business + Automatizaciones
        </div>
        <h1 style={{fontSize:'clamp(38px,6vw,70px)',fontWeight:900,lineHeight:1.08,marginBottom:24,letterSpacing:'-1.5px'}}>
          El CRM que trabaja<br/>
          <span style={{background:'linear-gradient(135deg,#3D7EFF,#00C8C0)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>mientras tú vendes</span>
        </h1>
        <p style={{fontSize:19,color:'#8A93B0',maxWidth:580,margin:'0 auto 44px',lineHeight:1.65}}>
          ClientFlow automatiza tus ventas, gestiona contactos y genera propuestas con IA. Diseñado para agencias y pymes españolas.
        </p>
        <div style={{display:'flex',gap:14,justifyContent:'center',flexWrap:'wrap'}}>
          <Link href="/login" style={{background:'linear-gradient(135deg,#3D7EFF,#00C8C0)',color:'#fff',borderRadius:10,padding:'13px 30px',fontSize:15,fontWeight:700,boxShadow:'0 8px 32px rgba(61,126,255,0.35)'}}>🚀 Prueba gratis 14 días</Link>
          <a href="#caracteristicas" style={{background:'transparent',color:'#D8E0F0',border:'1px solid #232840',borderRadius:10,padding:'13px 30px',fontSize:15,fontWeight:600}}>Ver características →</a>
        </div>
        <p style={{fontSize:12,color:'#5E6A88',marginTop:18}}>Sin tarjeta de crédito · Cancela cuando quieras · Datos en Europa 🇪🇺</p>
        <div style={{display:'flex',gap:48,justifyContent:'center',marginTop:72,flexWrap:'wrap'}}>
          {[{v:'2.400+',l:'Empresas activas'},{v:'€12M+',l:'Facturación gestionada'},{v:'94%',l:'Satisfacción clientes'},{v:'8min',l:'T. respuesta medio'}].map(s=>(
            <div key={s.l} style={{textAlign:'center'}}>
              <div style={{fontSize:34,fontWeight:900,background:'linear-gradient(135deg,#3D7EFF,#00C8C0)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>{s.v}</div>
              <div style={{fontSize:12,color:'#5E6A88',marginTop:4}}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="caracteristicas" style={{padding:'90px 6%',background:'#0A0B10'}}>
        <div style={{textAlign:'center',marginBottom:60}}>
          <div style={{fontSize:11,color:'#3D7EFF',fontWeight:700,letterSpacing:'2.5px',textTransform:'uppercase',marginBottom:14}}>CARACTERÍSTICAS</div>
          <h2 style={{fontSize:42,fontWeight:900,marginBottom:14}}>Todo lo que necesitas,<br/>en un solo lugar</h2>
          <p style={{fontSize:15,color:'#5E6A88',maxWidth:480,margin:'0 auto'}}>Sin migraciones. Sin integraciones complejas. ClientFlow conecta todas tus herramientas de ventas.</p>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(290px,1fr))',gap:20,maxWidth:1100,margin:'0 auto'}}>
          {features.map((f,i)=>(
            <div key={i} className="hov" style={{background:'#0D0F16',border:'1px solid #232840',borderLeft:'3px solid '+f.color,borderRadius:14,padding:26}}>
              <div style={{fontSize:32,marginBottom:14}}>{f.icon}</div>
              <div style={{fontWeight:700,fontSize:15,marginBottom:8,color:'#D8E0F0'}}>{f.title}</div>
              <div style={{fontSize:13,color:'#5E6A88',lineHeight:1.65}}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* INTEGRACIONES */}
      <section id="integraciones" style={{padding:'90px 6%'}}>
        <div style={{textAlign:'center',marginBottom:50}}>
          <div style={{fontSize:11,color:'#9B72FF',fontWeight:700,letterSpacing:'2.5px',textTransform:'uppercase',marginBottom:14}}>INTEGRACIONES</div>
          <h2 style={{fontSize:38,fontWeight:900,marginBottom:12}}>Conecta todo tu stack de ventas</h2>
        </div>
        <div style={{display:'flex',flexWrap:'wrap',gap:16,justifyContent:'center',maxWidth:900,margin:'0 auto'}}>
          {[{n:'Meta Ads',c:'#1877F2',i:'f'},{n:'Google Ads',c:'#4285F4',i:'G'},{n:'WhatsApp',c:'#25D366',i:'W'},{n:'Resend',c:'#FF6B6B',i:'✉'},{n:'Stripe',c:'#635BFF',i:'$'},{n:'360Dialog',c:'#00B2FF',i:'💬'},{n:'Twilio',c:'#F22F46',i:'T'},{n:'Supabase',c:'#3ECF8E',i:'⬡'},{n:'CSV/Excel',c:'#18CF7A',i:'📊'}].map(int=>(
            <div key={int.n} className="hov" style={{display:'flex',alignItems:'center',gap:10,padding:'12px 20px',background:'#0D0F16',border:'1px solid #232840',borderRadius:40}}>
              <div style={{width:28,height:28,borderRadius:7,background:int.c,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:900,color:'#fff'}}>{int.i}</div>
              <span style={{fontSize:13,fontWeight:600}}>{int.n}</span>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{padding:'90px 6%',background:'#0A0B10'}}>
        <div style={{textAlign:'center',marginBottom:56}}>
          <h2 style={{fontSize:38,fontWeight:900,marginBottom:12}}>Lo que dicen nuestros clientes</h2>
          <p style={{fontSize:14,color:'#5E6A88'}}>+2.400 empresas españolas ya usan ClientFlow</p>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:20,maxWidth:960,margin:'0 auto'}}>
          {testimonials.map((t,i)=>(
            <div key={i} className="hov" style={{background:'#0D0F16',border:'1px solid #232840',borderRadius:14,padding:26}}>
              <div style={{color:'#3D7EFF',fontSize:18,marginBottom:14}}>★★★★★</div>
              <p style={{fontSize:13,color:'#8A93B0',lineHeight:1.75,marginBottom:20,fontStyle:'italic'}}>"{t.text}"</p>
              <div style={{display:'flex',gap:10,alignItems:'center'}}>
                <div style={{width:38,height:38,borderRadius:'50%',background:'linear-gradient(135deg,#3D7EFF,#9B72FF)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,color:'#fff'}}>{t.av}</div>
                <div><div style={{fontWeight:700,fontSize:13}}>{t.name}</div><div style={{fontSize:11,color:'#5E6A88'}}>{t.role}</div></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="precios" style={{padding:'90px 6%'}}>
        <div style={{textAlign:'center',marginBottom:60}}>
          <div style={{fontSize:11,color:'#18CF7A',fontWeight:700,letterSpacing:'2.5px',textTransform:'uppercase',marginBottom:14}}>PRECIOS</div>
          <h2 style={{fontSize:42,fontWeight:900,marginBottom:12}}>Empieza gratis,<br/>crece sin límites</h2>
          <p style={{fontSize:15,color:'#5E6A88'}}>14 días de prueba en todos los planes. Sin tarjeta de crédito.</p>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(210px,1fr))',gap:16,maxWidth:1000,margin:'0 auto'}}>
          {plans.map(plan=>(
            <div key={plan.name} className="hov" style={{background:'#0D0F16',border:(plan as any).popular?'2px solid '+plan.color:'1px solid #232840',borderRadius:16,padding:24,display:'flex',flexDirection:'column',position:'relative'}}>
              {(plan as any).popular&&<div style={{position:'absolute',top:-12,left:'50%',transform:'translateX(-50%)',background:'linear-gradient(135deg,#9B72FF,#3D7EFF)',borderRadius:20,padding:'4px 16px',fontSize:11,fontWeight:700,color:'#fff',whiteSpace:'nowrap'}}>⭐ MÁS POPULAR</div>}
              <div style={{color:plan.color,fontWeight:800,fontSize:17,marginBottom:6}}>{plan.name}</div>
              <div style={{marginBottom:20}}><span style={{fontSize:34,fontWeight:900,color:plan.color}}>{plan.price}</span><span style={{fontSize:12,color:'#5E6A88'}}>/mes</span></div>
              <div style={{flex:1,display:'flex',flexDirection:'column',gap:9,marginBottom:22}}>
                {plan.features.map(f=><div key={f} style={{display:'flex',gap:8,fontSize:12,color:'#8A93B0'}}><span style={{color:plan.color}}>✓</span>{f}</div>)}
              </div>
              <Link href="/login" style={{background:(plan as any).popular?'linear-gradient(135deg,#9B72FF,#3D7EFF)':'transparent',color:(plan as any).popular?'#fff':plan.color,border:(plan as any).popular?'none':'2px solid '+plan.color,borderRadius:9,padding:'10px',fontSize:13,fontWeight:700,textAlign:'center',display:'block'}}>
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section style={{padding:'80px 6%',background:'#0A0B10'}}>
        <div style={{maxWidth:680,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:50}}>
            <h2 style={{fontSize:36,fontWeight:900,marginBottom:10}}>Preguntas frecuentes</h2>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            {faqs.map((f,i)=>(
              <div key={i} style={{background:'#0D0F16',border:'1px solid #232840',borderRadius:12,padding:22}}>
                <div style={{fontWeight:700,fontSize:14,marginBottom:8}}>❓ {f.q}</div>
                <div style={{fontSize:13,color:'#8A93B0',lineHeight:1.65}}>{f.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{padding:'90px 6%',textAlign:'center',background:'radial-gradient(ellipse 80% 80% at 50% 50%,rgba(61,126,255,0.1) 0%,transparent 70%)'}}>
        <h2 style={{fontSize:50,fontWeight:900,marginBottom:16,letterSpacing:'-1px'}}>¿Listo para vender más?</h2>
        <p style={{fontSize:16,color:'#5E6A88',marginBottom:36}}>Únete a 2.400+ empresas que ya automatizan sus ventas con ClientFlow.</p>
        <Link href="/login" style={{background:'linear-gradient(135deg,#3D7EFF,#00C8C0)',color:'#fff',borderRadius:12,padding:'15px 36px',fontSize:16,fontWeight:800,boxShadow:'0 12px 40px rgba(61,126,255,0.4)',display:'inline-block'}}>🚀 Empezar gratis ahora</Link>
        <p style={{fontSize:12,color:'#5E6A88',marginTop:16}}>Sin tarjeta · 14 días gratis · Datos en Europa 🇪🇺</p>
      </section>

      {/* FOOTER */}
      <footer style={{background:'#0A0B10',borderTop:'1px solid #232840',padding:'36px 6%',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:16}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:28,height:28,borderRadius:8,background:'linear-gradient(135deg,#3D7EFF,#00C8C0)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14}}>⬡</div>
          <span style={{fontWeight:800}}>ClientFlow CRM</span>
        </div>
        <div style={{fontSize:12,color:'#5E6A88'}}>© 2026 ClientFlow · Hecho en España 🇪🇸 · GDPR Compliant 🇪🇺</div>
        <div style={{display:'flex',gap:20,fontSize:12,color:'#5E6A88'}}>
          {['Privacidad','Términos','GDPR','Contacto'].map(l=><a key={l} href="#" style={{cursor:'pointer'}}>{l}</a>)}
        </div>
      </footer>
    </div>
  )
}