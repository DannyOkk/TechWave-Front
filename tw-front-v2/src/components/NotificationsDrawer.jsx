import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { orderService } from '../services/orderService'

export default function NotificationsDrawer({ open, onClose }){
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(()=>{
    const load = async ()=>{
      if (!open) return
      try {
        setLoading(true)
        const data = await orderService.myOrders()
        setOrders(Array.isArray(data) ? data.filter(o=> o.estado==='pendiente') : [])
      } finally { setLoading(false) }
    }
    load()
  }, [open])

  return (
    <>
      <div className={`drawer-overlay ${open ? 'open':''}`} onClick={onClose} />
      <aside className={`cart-drawer ${open ? 'open':''}`} role="dialog" aria-label="Notificaciones">
        <header>
          <strong>Notificaciones</strong>
          <button className="btn btn-ghost" onClick={onClose}>Cerrar</button>
        </header>
        <div className="content">
          {loading && <div style={{opacity:.8}}>Cargando…</div>}
          {!loading && orders.length === 0 && <div style={{opacity:.8}}>No hay pedidos pendientes.</div>}
          {!loading && orders.length > 0 && (
            <div className="v-stack" style={{gap:8}}>
              {orders.map(o=> (
                <div key={o.id} className="h-stack" style={{justifyContent:'space-between', alignItems:'center'}}>
                  <div>
                    <div><strong>Pedido #{o.id}</strong></div>
                    <div style={{opacity:.85}}>Estado: {o.estado}</div>
                  </div>
                  <div className="h-stack" style={{gap:6}}>
                    <Link className="btn" to={`/orders/${o.id}`}>Ver detalle</Link>
                    <button className="btn btn-primary" onClick={async()=>{ try { await orderService.createPayment(o.id); alert('Pago iniciado'); } catch { alert('No se pudo iniciar el pago') } }}>Completar pago</button>
                    <button className="btn" onClick={async()=>{
							if (!window.confirm('¿Cancelar este pedido?')) return
							try { await orderService.cancel(o.id); setOrders(prev=> prev.filter(x=> x.id!==o.id)) } catch { alert('No se pudo cancelar') }
						}}>
                      Cancelar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
