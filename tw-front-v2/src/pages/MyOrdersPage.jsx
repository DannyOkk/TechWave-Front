import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { orderService } from '../services/orderService'
import { Link } from 'react-router-dom'

export default function MyOrdersPage(){
  const qc = useQueryClient()
  const { data, isLoading, isError } = useQuery({ queryKey:['my-orders'], queryFn: orderService.myOrders })
  const cancelOrderM = useMutation({
    mutationFn: (id)=> orderService.cancel(id),
    onSuccess: ()=> qc.invalidateQueries({ queryKey:['my-orders'] })
  })
  if (isLoading) return <div style={{padding:20}}>Cargando pedidos…</div>
  if (isError) return <div style={{padding:20}}>No se pudieron cargar tus pedidos.</div>
  const orders = Array.isArray(data) ? data : []
  return (
    <div className="v-stack" style={{gap:12}}>
      <h2>Mis pedidos</h2>
      {orders.length === 0 && <div style={{opacity:.85}}>No tenés pedidos aún.</div>}
      {orders.map(o=> (
        <div key={o.id} className="card" style={{padding:12}}>
          <div className="h-stack" style={{justifyContent:'space-between'}}>
            <div>
              <div><strong>Pedido #{o.id}</strong> — {o.estado}</div>
              <div style={{opacity:.85}}>Fecha: {o.fecha}</div>
              <div style={{opacity:.85}}>Total: ${Number(o.total||0).toLocaleString()}</div>
            </div>
            <div className="h-stack" style={{gap:8}}>
              {o.estado === 'pendiente' && (
                <button className="btn btn-primary" onClick={async()=>{
                  try { await orderService.createPayment(o.id); alert('Pago iniciado'); }
                  catch { alert('No se pudo iniciar el pago'); }
                }}>Completar pago</button>
              )}
              {['pendiente','procesando','preparando'].includes(o.estado) && (
                <button className="btn" disabled={cancelOrderM.isLoading} onClick={()=>{
                  if (window.confirm('¿Cancelar este pedido?')) cancelOrderM.mutate(o.id)
                }}>Cancelar</button>
              )}
              <Link className="btn" to={`/orders/${o.id}`}>Ver detalle</Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
