import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { orderService } from '../services/orderService'

export default function OrderDetailPage(){
  const { id } = useParams()
  const navigate = useNavigate()
  const { data, isLoading, isError } = useQuery({ queryKey:['order', id], queryFn: ()=> orderService.getById(id), enabled: !!id })
  if (isLoading) return <div style={{padding:20}}>Cargando detalle…</div>
  if (isError || !data) return <div style={{padding:20}}>No se pudo cargar el detalle.</div>
  const o = data
  return (
    <div className="v-stack" style={{gap:12}}>
      <div className="h-stack" style={{justifyContent:'space-between', alignItems:'center'}}>
        <h2 style={{margin:0}}>Pedido #{o.id}</h2>
        <div className="h-stack" style={{gap:8}}>
          <button className="btn" onClick={()=> navigate('/my-orders')}>Volver</button>
          {o.estado === 'pendiente' && (
            <button className="btn btn-primary" onClick={async()=>{
              try {
                const p = await orderService.createPayment(o.id)
                alert('Pago creado. Estado: ' + (p?.estado || 'pendiente'))
              } catch {
                alert('No se pudo crear el pago')
              }
            }}>Completar pago</button>
          )}
        </div>
      </div>
      <div className="card" style={{padding:12}}>
        <div>Estado: {o.estado}</div>
        <div>Total: ${Number(o.total||0).toLocaleString()}</div>
        <div>Fecha: {o.fecha}</div>
      </div>
      <div className="card" style={{padding:12}}>
        <h3 style={{marginTop:0}}>Productos</h3>
        {(o.detalles||[]).map(d=> (
          <div key={d.id} className="h-stack" style={{justifyContent:'space-between'}}>
            <div>{d.producto_detalle?.nombre || d.producto}</div>
            <div>x{d.cantidad}</div>
            <div>${Number(d.subtotal||0).toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
