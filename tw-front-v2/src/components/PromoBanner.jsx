export default function PromoBanner(){
  return (
    <section className="card" style={{padding:20, display:'flex', alignItems:'center', justifyContent:'space-between'}}>
      <div>
        <div className="badge">Oferta por tiempo limitado</div>
        <h3 style={{margin:'8px 0 0'}}>Hasta 30% OFF en accesorios</h3>
      </div>
      <a href="/products" className="btn btn-primary">Ver ofertas</a>
    </section>
  )
}
