export default function FeaturesGrid(){
  const feats = [
    {t:'Pagos seguros', d:'Tus datos protegidos con estándares de la industria.'},
    {t:'Envíos rápidos', d:'Recibí tu compra en 24/48hs en las principales ciudades.'},
    {t:'Garantía oficial', d:'Productos 100% originales con garantía.'},
    {t:'Soporte experto', d:'Te ayudamos a elegir y resolver cualquier duda.'},
  ]
  return (
    <section className="row-cards" style={{marginTop:12}}>
      {feats.map((f,i)=> (
        <div key={i} className="card" style={{padding:16, width:280}}>
          <div className="badge" style={{marginBottom:10}}>{f.t}</div>
          <div style={{opacity:.9}}>{f.d}</div>
        </div>
      ))}
    </section>
  )
}
