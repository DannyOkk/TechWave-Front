import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { orderService } from '../services/orderService'
import { paymentService } from '../services/paymentService'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'

export default function MyOrdersPage(){
  const qc = useQueryClient()
  const { data, isLoading, isError } = useQuery({ queryKey:['my-orders'], queryFn: orderService.myOrders })
  const cancelOrderM = useMutation({
    mutationFn: (id)=> orderService.cancel(id),
    onSuccess: ()=> qc.invalidateQueries({ queryKey:['my-orders'] })
  })
  const navigate = useNavigate()
  if (isLoading) return <div className="container" style={{padding:20}}>Cargando pedidos…</div>
  if (isError) return <div className="container" style={{padding:20}}>No se pudieron cargar tus pedidos.</div>
  const orders = Array.isArray(data) ? data : []
  return (
    <div className="container v-stack orders-list" style={{gap:16, padding:'16px 16px'}}>
      <div className="h-stack" style={{justifyContent:'space-between', alignItems:'center'}}>
        <h2 style={{margin:0}}>Mis pedidos</h2>
        <span className="badge">{orders.length} {orders.length===1?'pedido':'pedidos'}</span>
      </div>
      {orders.length === 0 && <div className="card" style={{padding:12, opacity:.9}}>No tenés pedidos aún.</div>}
      {orders.map(o=> (
        <OrderRow key={o.id} o={o} navigate={navigate} onCancel={(id)=> cancelOrderM.mutate(id)} cancelLoading={cancelOrderM.isLoading} />
      ))}
    </div>
  )
}

function OrderRow({ o, navigate, onCancel, cancelLoading }){
  // Consultar si hay pagos abiertos (pendiente o en revisión). Si no los hay, permitir reintentar.
  const payPendQ = useQuery({ queryKey:['my-pay-pend', o.id], queryFn: ()=> paymentService.list({ pedido:o.id, estado:'pendiente' }) })
  const payRevQ = useQuery({ queryKey:['my-pay-rev', o.id], queryFn: ()=> paymentService.list({ pedido:o.id, estado:'en_revision' }) })
  const payFailQ = useQuery({ queryKey:['my-pay-fail', o.id], queryFn: ()=> paymentService.list({ pedido:o.id, estado:'fallido' }) })
  const listPend = Array.isArray(payPendQ.data) ? payPendQ.data : (payPendQ.data?.results || [])
  const listRev = Array.isArray(payRevQ.data) ? payRevQ.data : (payRevQ.data?.results || [])
  const listFail = Array.isArray(payFailQ.data) ? payFailQ.data : (payFailQ.data?.results || [])
  const loadingPays = payPendQ.isLoading || payRevQ.isLoading
  const hasOpenPay = (listPend.length + listRev.length) > 0
  const hasFailedPay = listFail.length > 0
  return (
    <div className="card" style={{padding:12}}>
      <div className="h-stack" style={{justifyContent:'space-between', alignItems:'center'}}>
        <div>
          <div className="h-stack" style={{gap:8}}>
            <strong>Pedido #{o.id}</strong>
            <span className="badge">{o.estado}</span>
          </div>
          <div style={{opacity:.85, fontSize:12}}>Fecha: {new Date(o.fecha).toLocaleString?.() || o.fecha}</div>
          <div style={{opacity:.9}}>Total: ${Number(o.total||0).toLocaleString()}</div>
        </div>
        <div className="h-stack" style={{gap:8, flexWrap:'wrap', justifyContent:'flex-end'}}>
          {o.estado === 'pendiente' && (
            <button className="btn btn-primary" onClick={()=> navigate(`/orders/${o.id}/pay`)}>
              {(!loadingPays && hasFailedPay && !hasOpenPay) ? 'Reintentar pago' : 'Ir a pagar'}
            </button>
          )}
          {o.estado === 'en_revision' && (
            <button className="btn" disabled>Pago en revisión…</button>
          )}
          {['pendiente','procesando','preparando'].includes(o.estado) && (
            <button className="btn" disabled={cancelLoading} onClick={()=>{
              if (window.confirm('¿Cancelar este pedido?')) onCancel(o.id)
            }}>Cancelar</button>
          )}
          <Link className="btn" to={`/orders/${o.id}`}>Ver detalle</Link>
        </div>
      </div>
    </div>
  )
}
