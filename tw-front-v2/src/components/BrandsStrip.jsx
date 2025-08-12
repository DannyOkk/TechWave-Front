export default function BrandsStrip(){
  const brands = ['Lenovo','ASUS','Acer','HP','Dell','Logitech','Razer','HyperX','Corsair','MSI']
  return (
    <div className="tags" role="region" aria-label="Marcas destacadas">
      <div className="tags-track">
        {brands.map((b)=> (
          <span key={b} className="badge">{b}</span>
        ))}
      </div>
    </div>
  )
}
