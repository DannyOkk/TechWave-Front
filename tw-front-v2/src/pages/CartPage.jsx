import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { cartService } from '../services/cartService'

export default function CartPage(){
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [checkingOut, setCheckingOut] = useState(false)
  const navigate = useNavigate()

  useEffect(()=>{
    const load = async ()=>{
      try { setLoading(true); const c = await cartService.getCart(); setCart(c); }
      catch (e){ setError('No se pudo cargar el carrito'); }
      finally { setLoading(false); }
    };
    load();
    const onChange = ()=> load();
    window.addEventListener('cart-changed', onChange)
    return ()=> window.removeEventListener('cart-changed', onChange)
  }, [])

  const checkout = async ()=>{
    try {
      setCheckingOut(true)
      const res = await cartService.checkout()
      const orderId = res?.pedido_id
      if (orderId) navigate(`/orders/${orderId}/pay`)
      else throw new Error('No se creó el pedido')
    } catch(e){
      setError(e?.response?.data?.error || e.message || 'No se pudo crear el pedido')
    } finally { setCheckingOut(false) }
  }

  if (loading) return <div style={{padding:20}}>Cargando carrito…</div>
  const items = cart?.items || []
  return (
    <div className="v-stack" style={{gap:12, padding:20}}>
      <h2>Tu carrito</h2>
      {error && <div style={{color:'#c62828'}}>{error}</div>}
      {items.length === 0 && <p>No has agregado productos.</p>}
      {items.length > 0 && (
        <>
          <div className="v-stack" style={{gap:8}}>
            {items.map(it=> (
              <div key={it.id} className="h-stack" style={{justifyContent:'space-between'}}>
                <div>{it.producto_nombre}</div>
                <div>x{it.cantidad}</div>
                <div>${Number(it.subtotal).toLocaleString()}</div>
              </div>
            ))}
          </div>
          <div className="h-stack" style={{justifyContent:'space-between'}}>
            <div><strong>Total</strong></div>
            <div><strong>${Number(cart?.total || 0).toLocaleString()}</strong></div>
          </div>
          <button className="btn btn-primary" onClick={checkout} disabled={checkingOut}>Ir a pagar</button>
        </>
      )}
    </div>
  )
}
