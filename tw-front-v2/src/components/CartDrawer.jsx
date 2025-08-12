import React, { useEffect, useState } from 'react'
import { cartService } from '../services/cartService'

export default function CartDrawer({ open, onClose }){
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')

  const load = async ()=>{
    try {
      setLoading(true)
      const data = await cartService.getCart()
      setCart(data)
    } catch (e){
      setError('Inicia sesión para ver tu carrito')
    } finally { setLoading(false) }
  }

  useEffect(()=>{ if (open) load() }, [open])

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

  const clear = async ()=>{ try { setActionLoading(true); await cartService.clearCart(); await load() } finally { setActionLoading(false) } }
  const doCheckout = async ()=>{
    try {
      setActionLoading(true)
      const res = await cartService.checkout()
      // Aquí podríamos redirigir a /orders/{id} si se expone ruta; por ahora cerrar y reset
      await load()
      alert('Pedido creado: #' + (res?.pedido_id || '?'))
      onClose?.()
    } catch (e){
      // mostrar error simple
      alert('No se pudo completar el checkout')
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
          <div className="h-stack" style={{gap:8}}>
            <button className="btn" style={{width:'40%'}} disabled={actionLoading || !cart || (cart.items||[]).length===0} onClick={clear}>Vaciar</button>
            <button className="btn btn-primary" style={{width:'60%'}} disabled={actionLoading || !cart || (cart.items||[]).length===0} onClick={doCheckout}>Ir a pagar</button>
          </div>
        </footer>
      </aside>
    </>
  )
}
