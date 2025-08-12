export default function Footer(){
  return (
    <footer className="site-footer">
      <div className="container" style={{padding:'28px 0'}}>
        <div className="row-cards" style={{justifyContent:'space-between', gap:24}}>
          <div className="v-stack" style={{minWidth:200}}>
            <strong>Contacto</strong>
            <a className="link" href="mailto:hola@techwave.com">hola@techwave.com</a>
            <a className="link" href="tel:+541155555555">+54 11 5555‑5555</a>
          </div>
          <div className="v-stack" style={{minWidth:200}}>
            <strong>Soporte</strong>
            <a className="link" href="#">Centro de ayuda</a>
            <a className="link" href="#">Garantías</a>
            <a className="link" href="#">Envíos y devoluciones</a>
          </div>
          <div className="v-stack" style={{minWidth:200}}>
            <strong>Empresa</strong>
            <a className="link" href="#">Nosotros</a>
            <a className="link" href="#">Trabajá con nosotros</a>
            <a className="link" href="#">Términos y privacidad</a>
          </div>
          <div className="v-stack" style={{minWidth:200}}>
            <strong>Redes</strong>
            <a className="link" href="#">Instagram</a>
            <a className="link" href="#">Twitter / X</a>
            <a className="link" href="#">YouTube</a>
          </div>
        </div>
        <div style={{marginTop:18, textAlign:'center', opacity:.8}}>© {new Date().getFullYear()} TechWave</div>
      </div>
    </footer>
  )
}
