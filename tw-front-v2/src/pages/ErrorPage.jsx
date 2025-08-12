export default function ErrorPage(){
  return (
    <div style={{padding:20}}>
      <h2>Algo salió mal</h2>
      <p>La página no existe o se produjo un error. Volvé al inicio.</p>
      <a className="btn" href="/">Ir al inicio</a>
    </div>
  )
}
