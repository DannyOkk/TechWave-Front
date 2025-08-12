import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query';
import { productService } from '../services/productService';
import { cartService } from '../services/cartService';
import { useState } from 'react';

export default function ProductDetailPage(){
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);
  const [msg, setMsg] = useState('');
  const { id } = useParams();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productService.getById(id),
    enabled: Boolean(id),
  });

  if (isLoading) return <div style={{padding:20}}>Cargando…</div>;
  if (isError || !data) return <div style={{padding:20}}>No se pudo cargar el producto.</div>;

  return (
    <div className="v-stack" style={{gap:12}}>
      <div className="h-stack" style={{justifyContent:'space-between'}}>
        <button className="btn" onClick={()=> navigate(-1)}>Volver</button>
      </div>
      <div className="grid-auto" style={{alignItems:'start'}}>
        <div className="card" style={{padding:12}}>
          <img src={'/assets/products/laptop.svg'} alt={data.nombre} className="img-skel" />
        </div>
        <div className="v-stack" style={{gap:10}}>
          <h2 style={{margin:0}}>{data.nombre}</h2>
          <div className="price">${Number(data.precio).toLocaleString()}</div>
          <p style={{opacity:.9}}>{data.descripcion}</p>
          <div>Stock: {data.stock}</div>
          {msg && <div style={{opacity:.9}}>{msg}</div>}
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
        </div>
      </div>
    </div>
  )
}
