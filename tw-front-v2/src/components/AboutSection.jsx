export default function AboutSection(){
  return (
    <section className="card" style={{padding:24}}>
      <div className="v-stack" style={{gap:16}}>
        <div>
          <h2 style={{marginTop:0}}>Acerca de TechWave</h2>
          <p style={{opacity:.9, margin:0}}>
            En TechWave unimos selección curada con logística eficiente y soporte real. Queremos que disfrutes tecnología
            sin complicaciones: productos confiables, envíos veloces y pagos seguros.
          </p>
        </div>
        <div className="row-cards">
          <div className="card" style={{padding:16, width:280}}>
            <strong>Qué hacemos</strong>
            <ul className="check-list" style={{margin:'8px 0 0', opacity:.95}}>
              <li>Catálogo curado</li>
              <li>Ofertas y bundles</li>
              <li>Soporte preventa</li>
            </ul>
          </div>
          <div className="card" style={{padding:16, width:280}}>
            <strong>Por qué elegirnos</strong>
            <ul className="check-list" style={{margin:'8px 0 0', opacity:.95}}>
              <li>Envíos 24/48h</li>
              <li>Pagos seguros</li>
              <li>Garantía oficial</li>
            </ul>
          </div>
          <div className="card" style={{padding:16, width:280}}>
            <strong>Necesitás ayuda</strong>
            <ul className="check-list" style={{margin:'8px 0 0', opacity:.95}}>
              <li>Soporte: soporte@techwave.com</li>
              <li>Ventas: ventas@techwave.com</li>
              <li>WhatsApp: +54 11 5555‑5555</li>
            </ul>
          </div>
        </div>
        <div className="h-stack" style={{gap:10, justifyContent:'center'}}>
          <a href="/products" className="btn btn-primary">Explorar catálogo</a>
        </div>
      </div>
    </section>
  )
}
