export default function Stats(){
  const stats = [
    {k:"Productos", v:"2k+"},
    {k:"Clientes", v:"10k+"},
    {k:"Envíos", v:"24h"},
    {k:"Soporte", v:"7/24"},
  ]
  return (
    <section className="row-cards" style={{marginTop:12}}>
      {stats.map(s => (
        <div key={s.k} className="card" style={{padding:16, textAlign:'center', width:260}}>
          <div className="price" style={{fontSize:22}}>{s.v}</div>
          <div style={{opacity:.8}}>{s.k}</div>
        </div>
      ))}
    </section>
  )
}
