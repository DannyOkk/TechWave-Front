import AboutSection from '../components/AboutSection'
import BrandsStrip from '../components/BrandsStrip'
import Stats from '../components/Stats'
import FeaturesGrid from '../components/FeaturesGrid'
import PromoBanner from '../components/PromoBanner'

export default function HomePage(){
  return (
    <section className="v-stack" style={{gap:24}}>
      <div className="hero center">
        <h1>Todo en Tecnología</h1>
        <p>Explorá laptops, audio, gaming y más. Envíos rápidos y pagos seguros.</p>
        <div className="cta-group" style={{justifyContent:'center'}}>
          <a href="/products" className="btn btn-primary">Ver productos</a>
          <a href="#acerca" className="btn btn-ghost">Acerca de</a>
        </div>
      </div>
  <div className="row-cards section">
        {[{t:"Laptops",img:"/assets/products/laptop.svg"},{t:"Audio",img:"/assets/products/audio.svg"},{t:"Gaming",img:"/assets/products/gaming.svg"},{t:"Accesorios",img:"/assets/products/accessory.svg"}].map(({t,img}) => (
          <div key={t} className="card" style={{padding:14, width:280}}>
            <div className="relative">
              <img src={img} alt={t} className="img-skel" style={{objectFit:'cover', width:'100%'}} />
            </div>
            <h3 style={{marginTop:12, textAlign:'center'}}>{t}</h3>
            <p style={{opacity:.8, marginTop:4, textAlign:'center'}}>Descubrí las mejores opciones.</p>
          </div>
        ))}
  </div>
      <div className="section" style={{display:'grid', placeItems:'center'}}>
        <BrandsStrip />
      </div>
      <div className="section" style={{display:'grid', placeItems:'center'}}>
        <PromoBanner />
      </div>
      <div className="section" style={{display:'grid', placeItems:'center', width:'100%'}}>
        <div className="container">
          <Stats />
        </div>
      </div>
      <div className="section" style={{display:'grid', placeItems:'center', width:'100%'}}>
        <div className="container">
          <FeaturesGrid />
        </div>
      </div>
      <div id="acerca" className="section" style={{display:'grid', placeItems:'center', width:'100%'}}>
        <div className="container">
          <AboutSection />
        </div>
      </div>
    </section>
  )
}
