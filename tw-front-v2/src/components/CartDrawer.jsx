import React, { useEffect, useState } from 'react'
import { cartService } from '../services/cartService'
import { useNavigate } from 'react-router-dom'

export default function CartDrawer({ open, onClose }){
  const navigate = useNavigate()
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')
  const [, setLastOrderId] = useState(null)
  const isLogged = Boolean(localStorage.getItem('access_token'))

  const load = async ()=>{
    try {
      setLoading(true)
      const data = await cartService.getCart()
      setCart(data)
    } catch (e){
      setError('Inicia sesión para ver tu carrito')
    } finally { setLoading(false) }
  }

  useEffect(()=>{ if (open) { load(); } }, [open])

  const changeQty = async (itemId, delta)=>{
    const item = cart?.items?.find(i=> i.id===itemId)
    if (!item) return
    const newQty = (item.cantidad||0) + delta
    try {
      setActionLoading(true)
      await cartService.updateItem(itemId, newQty)
      await load()
    } catch (e){
      // noop simple
    } finally { setActionLoading(false) }
  }

  const remove = async (itemId)=>{
    try { setActionLoading(true); await cartService.removeItem(itemId); await load() } finally { setActionLoading(false) }
  }

  const clear = async ()=>{ try { setActionLoading(true); await cartService.clearCart(); await load(); setLastOrderId(null) } finally { setActionLoading(false) } }
  const createOrder = async ()=>{
    try {
      setActionLoading(true)
      const res = await cartService.checkout()
      const oid = res?.pedido_id || res?.id || null
      setLastOrderId(oid)
      await load()
      alert('Pedido creado: #' + (oid || '?') + '\nPuedes proceder a pagar cuando quieras.')
    } catch {
      alert('No se pudo crear el pedido')
    } finally { setActionLoading(false) }
  }
  const goToPay = async ()=>{
    try {
      setActionLoading(true)
      // Crear pedido desde el carrito y redirigir a la página de pago
      const res = await cartService.checkout()
      const oid = res?.pedido_id || res?.id
      if (!oid) {
        alert('No se pudo crear el pedido')
        return
      }
      setLastOrderId(oid)
      onClose?.()
      navigate(`/orders/${oid}/pay`)
    } catch (e){
      alert(e?.response?.data?.error || 'No se pudo crear el pedido')
    } finally { setActionLoading(false) }
  }
  return (
    <>
      <div className={`drawer-overlay ${open ? 'open':''}`} onClick={onClose} />
      <aside className={`cart-drawer ${open ? 'open':''}`} role="dialog" aria-label="Carrito">
        <header>
          <strong>Tu carrito</strong>
          <button className="btn btn-ghost" onClick={onClose}>Cerrar</button>
        </header>
        <div className="content">
          {loading && <div style={{opacity:.8}}>Cargando…</div>}
          {!loading && error && <div style={{opacity:.8}}>{error}</div>}
          {!loading && !error && (!cart || (cart.items||[]).length===0) && <div style={{opacity:.8}}>Aún no hay items.</div>}
          {!loading && !error && cart && (cart.items||[]).length>0 && (
            <div className="v-stack" style={{gap:8}}>
              {cart.items.map(it=> (
                <div key={it.id} className="h-stack" style={{justifyContent:'space-between', alignItems:'center'}}>
                  <div>
                    <div style={{fontWeight:600}}>{it.producto_nombre}</div>
                    <div style={{opacity:.8, fontSize:12}}>{it.categoria_nombre}</div>
                    <div style={{opacity:.9}}>${Number(it.precio_unitario).toLocaleString()} x {it.cantidad} = ${Number(it.subtotal).toLocaleString()}</div>
                  </div>
                  <div className="h-stack" style={{gap:6}}>
                    <button className="btn btn-ghost" disabled={actionLoading} onClick={()=> changeQty(it.id, -1)}>-</button>
                    <span>{it.cantidad}</span>
                    <button className="btn btn-ghost" disabled={actionLoading} onClick={()=> changeQty(it.id, +1)}>+</button>
                    <button className="btn btn-ghost" disabled={actionLoading} onClick={()=> remove(it.id)} title="Eliminar">🗑️</button>
                  </div>
                </div>
              ))}
              <div className="h-stack" style={{justifyContent:'space-between', marginTop:8}}>
                <strong>Total</strong>
                <strong>${Number(cart.total||0).toLocaleString()}</strong>
              </div>
            </div>
          )}
        </div>
        <footer>
          <div className="v-stack" style={{gap:8, width:'100%'}}>
            {isLogged && (
              <>
                <div style={{fontSize:12, opacity:.75}}>
                  La dirección de envío se gestiona en tu perfil. Se requerirá durante el pago si falta.
                </div>
                {(cart && (cart.items||[]).length>0) && (
                  <div className="h-stack" style={{gap:8, flexWrap:'wrap'}}>
                    <button className="btn" style={{flex:'1 1 30%'}} disabled={actionLoading} onClick={clear}>Vaciar</button>
                    <button className="btn" style={{flex:'1 1 30%'}} disabled={actionLoading} onClick={createOrder}>Crear pedido</button>
                    <button className="btn btn-primary" style={{flex:'1 1 30%'}} disabled={actionLoading} onClick={goToPay}>Ir a pagar</button>
                  </div>
                )}
              </>
            )}
          </div>
        </footer>
      </aside>
    </>
  )
}
