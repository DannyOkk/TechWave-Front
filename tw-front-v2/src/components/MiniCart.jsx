import { useEffect, useState } from 'react'
import { cartService } from '../services/cartService'

export default function MiniCart({ onOpen }){
  const [count, setCount] = useState(0)

  const load = async ()=>{
    try {
      const data = await cartService.getCart()
      const n = Number(data?.cantidad_items ?? (data?.items?.length || 0))
      setCount(Number.isFinite(n)? n : 0)
    } catch { setCount(0) }
  }

  useEffect(()=>{
    load()
    const onChanged = ()=> load()
    window.addEventListener('cart-changed', onChanged)
    return ()=> window.removeEventListener('cart-changed', onChanged)
  }, [])

  return (
    <button className="btn btn-ghost h-stack" style={{gap:6, position:'relative'}} onClick={onOpen} aria-label="Abrir carrito">
      <span role="img" aria-label="cart">🛒</span>
      <span style={{opacity:.85}}>{count}</span>
    </button>
  )
}
