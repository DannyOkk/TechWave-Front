import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query';
import { productService } from '../services/productService';
import { cartService } from '../services/cartService';
import { useState } from 'react';

export default function ProductDetailPage(){
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);
  const [buying, setBuying] = useState(false);
  const [msg, setMsg] = useState('');
  const { id } = useParams();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productService.getById(id),
    enabled: Boolean(id),
  });

  if (isLoading) return <div className="container" style={{padding:20}}>Cargando…</div>;
  if (isError || !data) return <div className="container" style={{padding:20}}>No se pudo cargar el producto.</div>;

  return (
    <div className="container v-stack" style={{gap:16, padding:'16px 16px'}}>
      <div className="h-stack" style={{justifyContent:'space-between', alignItems:'center'}}>
        <button className="btn" onClick={()=> navigate(-1)}>← Volver</button>
        {/* Ocultamos el ID al público */}
      </div>
  {/* Layout más vistoso: imagen grande + panel lateral con precio/acciones */}
  <div className="product-detail" style={{alignItems:'start'}}>
        <div className="card" style={{padding:12}}>
          <img src={data.imagen_url || '/assets/products/laptop.svg'} alt={data.nombre} className="img-skel" style={{objectFit:'cover', width:'100%'}} />
        </div>
        <aside className="card" style={{padding:16, position:'sticky', top:80, alignSelf:'start'}}>
          <div className="v-stack" style={{gap:10}}>
            <h2 style={{margin:0}}>{data.nombre}</h2>
            <div className="h-stack" style={{justifyContent:'space-between', alignItems:'center'}}>
              <div className="price">${Number(data.precio).toLocaleString()}</div>
              {Number(data.stock) > 0 ? <span className="badge">En stock</span> : <span className="badge" style={{background:'#fee2e2', color:'#991b1b'}}>Sin stock</span>}
            </div>
            {data.categoria_nombre && (
              <div className="h-stack" style={{gap:8, flexWrap:'wrap'}}>
                <span className="badge" style={{background:'#eef6ff'}}>#{data.categoria_nombre}</span>
                {data.marca && <span className="badge" style={{background:'#eef6ff'}}>#{data.marca}</span>}
              </div>
            )}
            <p style={{opacity:.9, lineHeight:1.6}}>{data.descripcion}</p>
            {msg && <div className="card" style={{padding:10, background:'#eef6ff', color:'#1b6fcc'}}>{msg}</div>}
            <div className="h-stack" style={{gap:8, flexWrap:'wrap'}}>
              <button className="btn btn-primary" disabled={adding} onClick={async()=>{
            try {
              setAdding(true); setMsg('')
              await cartService.addProduct(id, 1)
              setMsg('Agregado al carrito')
              window.dispatchEvent(new CustomEvent('cart:add:success', { detail: { msg: 'Producto agregado al carrito' }}));
            } catch (e){
              if (e?.response?.status===401) setMsg('Inicia sesión para agregar al carrito')
              else setMsg('No se pudo agregar')
            } finally { setAdding(false) }
          }}>{adding? 'Agregando…' : 'Agregar al carrito'}</button>
              <button className="btn" disabled={buying} onClick={async()=>{
            try {
              setBuying(true); setMsg('')
              await cartService.addProduct(id, 1)
              window.dispatchEvent(new CustomEvent('cart:add:success', { detail: { msg: 'Producto agregado al carrito' }}));
              const res = await cartService.checkout()
              const orderId = res?.pedido_id
              if (orderId) navigate(`/orders/${orderId}/pay`)
              else setMsg('No se pudo crear el pedido')
            } catch (e){
              if (e?.response?.status===401) setMsg('Inicia sesión para comprar')
              else setMsg('No se pudo iniciar el pago')
            } finally { setBuying(false) }
          }}>{buying? 'Redirigiendo…' : 'Comprar ahora'}</button>
            </div>
            <small style={{opacity:.7}}>Envío rápido · Pagos seguros</small>
          </div>
        </aside>
      </div>
    </div>
  )
}
