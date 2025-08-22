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
        <span className="badge">ID: {data.id}</span>
      </div>
      <div className="grid-auto" style={{alignItems:'start'}}>
        <div className="card" style={{padding:12}}>
          <img src={data.imagen_url || '/assets/products/laptop.svg'} alt={data.nombre} className="img-skel" />
        </div>
        <div className="card" style={{padding:16}}>
          <div className="v-stack" style={{gap:10}}>
            <h2 style={{margin:0}}>{data.nombre}</h2>
            <div className="h-stack" style={{justifyContent:'space-between'}}>
              <div className="price">${Number(data.precio).toLocaleString()}</div>
              <span className="badge">Stock: {data.stock}</span>
            </div>
            <p style={{opacity:.9}}>{data.descripcion}</p>
            {msg && <div className="card" style={{padding:10, background:'#eef6ff', color:'#1b6fcc'}}>{msg}</div>}
            <div className="h-stack" style={{gap:8, flexWrap:'wrap'}}>
              <button className="btn btn-primary" disabled={adding} onClick={async()=>{
            try {
              setAdding(true); setMsg('')
              await cartService.addProduct(id, 1)
              setMsg('Agregado al carrito')
            } catch (e){
              if (e?.response?.status===401) setMsg('Inicia sesión para agregar al carrito')
              else setMsg('No se pudo agregar')
            } finally { setAdding(false) }
          }}>{adding? 'Agregando…' : 'Agregar al carrito'}</button>
              <button className="btn" disabled={buying} onClick={async()=>{
            try {
              setBuying(true); setMsg('')
              await cartService.addProduct(id, 1)
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
          </div>
        </div>
  </div>
    </div>
  )
}
