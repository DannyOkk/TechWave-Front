import { useNavigate, useParams } from 'react-router-dom'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { orderService } from '../services/orderService'
import { paymentService } from '../services/paymentService'
import { API_ORIGIN } from '../services/api'
import ImageLightbox from '../components/ImageLightbox'
 

export default function OrderDetailPage(){
  const { id } = useParams()
  const navigate = useNavigate()
  const { data, isLoading, isError } = useQuery({ queryKey:['order', id], queryFn: ()=> orderService.getById(id), enabled: !!id })
  const payPendQ = useQuery({ queryKey:['pay-pend', id], queryFn: ()=> paymentService.list({ pedido:id, estado:'pendiente' }), enabled: !!id })
  const payRevQ = useQuery({ queryKey:['pay-rev', id], queryFn: ()=> paymentService.list({ pedido:id, estado:'en_revision' }), enabled: !!id })
  const payFailQ = useQuery({ queryKey:['pay-fail', id], queryFn: ()=> paymentService.list({ pedido:id, estado:'fallido' }), enabled: !!id })
  const [lightbox, setLightbox] = useState({ open:false, src:'' })
  if (isLoading) return <div style={{padding:20}}>Cargando detalle…</div>
  if (isError || !data) return <div style={{padding:20}}>No se pudo cargar el detalle.</div>
  const o = data
  const payList = (Array.isArray(payRevQ.data)?payRevQ.data:(payRevQ.data?.results||[]))
    .concat(Array.isArray(payPendQ.data)?payPendQ.data:(payPendQ.data?.results||[]))
  const pay = payList[0]
  const proofSrc = pay?.comprobante_archivo_url ? (pay.comprobante_archivo_url.startsWith('http')? pay.comprobante_archivo_url : `${API_ORIGIN}${pay.comprobante_archivo_url}`) : ''
  const listPend = Array.isArray(payPendQ.data) ? payPendQ.data : (payPendQ.data?.results || [])
  const listRev = Array.isArray(payRevQ.data) ? payRevQ.data : (payRevQ.data?.results || [])
  const listFail = Array.isArray(payFailQ.data) ? payFailQ.data : (payFailQ.data?.results || [])
  const hasOpenPay = (listPend.length + listRev.length) > 0
  const hasFailedPay = listFail.length > 0
  return (
    <div className="v-stack" style={{gap:12}}>
      <div className="h-stack" style={{justifyContent:'space-between', alignItems:'center'}}>
        <h2 style={{margin:0}}>Pedido #{o.id}</h2>
        <div className="h-stack" style={{gap:8}}>
          <button className="btn" onClick={()=> navigate('/my-orders')}>Volver</button>
          {o.estado === 'pendiente' && (
            <button className="btn btn-primary" onClick={()=> navigate(`/orders/${o.id}/pay`)}>
              {(!hasOpenPay && hasFailedPay) ? 'Reintentar pago' : 'Ir a pagar'}
            </button>
          )}
          {o.estado === 'en_revision' && (
            <button className="btn" disabled>Pago en revisión…</button>
          )}
        </div>
      </div>
      {o.estado === 'pendiente' && !hasOpenPay && hasFailedPay && (
        <div className="card" style={{padding:12, background:'#fff3f3', border:'1px solid #f3c0c0'}}>
          <div className="h-stack" style={{justifyContent:'space-between', alignItems:'center'}}>
            <div>
              <strong>Pago rechazado</strong>
              <div style={{opacity:.85}}>Tu último comprobante fue rechazado. Podés reintentar el pago.</div>
            </div>
            <button className="btn btn-primary" onClick={()=> navigate(`/orders/${o.id}/pay`)}>Reintentar pago</button>
          </div>
        </div>
      )}
      <div className="card" style={{padding:12}}>
        <div>Estado: {o.estado}</div>
        <div>Total: ${Number(o.total||0).toLocaleString()}</div>
        <div>Fecha: {o.fecha}</div>
      </div>
      {pay && (pay.comprobante_archivo_url || pay.comprobante_url) && (
        <div className="card" style={{padding:12}}>
          <h3 style={{marginTop:0}}>Comprobante</h3>
          {pay.comprobante_archivo_url && (pay.comprobante_archivo_url.toLowerCase().endsWith('.pdf') ? (
            <a href={proofSrc} target="_blank" rel="noreferrer">Ver PDF</a>
          ) : (
            <img
              alt="comprobante"
              src={proofSrc}
              title="Click para ver grande"
              onClick={()=> setLightbox({ open:true, src: proofSrc })}
              style={{maxWidth:400, maxHeight:300, objectFit:'contain', cursor:'zoom-in'}}
            />
          ))}
          {!pay.comprobante_archivo_url && pay.comprobante_url && (
            <a href={pay.comprobante_url} target="_blank" rel="noreferrer">Ver comprobante</a>
          )}
        </div>
      )}
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
  <ImageLightbox open={lightbox.open} src={lightbox.src} onClose={()=> setLightbox({ open:false, src:'' })} />
    </div>
  )
}
