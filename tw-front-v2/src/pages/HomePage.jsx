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
  <div className="row-cards section categories-tiles">
        {[
          { t: 'Laptops', d: 'Rendimiento y portabilidad en un solo lugar.', src: '/assets/products/laptops.webp', fallback: '/assets/products/laptop.svg' },
          { t: 'Audio', d: 'Sonido de calidad para cada experiencia.', src: '/assets/products/audio.png', fallback: '/assets/products/audio.svg' },
          { t: 'Gaming', d: 'Equipa tu setup con lo último en juegos.', src: '/assets/products/gaming.webp', fallback: '/assets/products/gaming.svg' },
          { t: 'Accesorios', d: 'Complementos que marcan la diferencia.', src: '/assets/products/accesorios.webp', fallback: '/assets/products/accessory.svg' },
        ].map(({ t, d, src, fallback }) => (
          <div key={t} className="card" style={{padding:14}}>
            <div className="relative">
              <img
                src={src}
                alt={t}
                className="img-skel"
                style={{objectFit:'cover', width:'100%'}}
                onError={(e)=>{ e.currentTarget.onerror=null; e.currentTarget.src=fallback; }}
                loading="lazy"
              />
            </div>
            <h3 style={{marginTop:12, textAlign:'center'}}>{t}</h3>
            <p style={{opacity:.8, marginTop:4, textAlign:'center'}}>{d}</p>
          </div>
        ))}
  </div>
      <div className="section" style={{display:'grid', placeItems:'center'}}>
        <BrandsStrip />
      </div>
{/*       <div className="section" style={{display:'grid', placeItems:'center'}}>
        <PromoBanner />
      </div> */}
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
