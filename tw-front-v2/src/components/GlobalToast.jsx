import { useEffect, useState } from 'react'

export default function GlobalToast(){
  const [msg, setMsg] = useState('')
  useEffect(()=>{
    let t
    const onShow = (e)=>{
      const m = e?.detail?.msg || 'Hecho'
      setMsg(m)
      clearTimeout(t)
      t = setTimeout(()=> setMsg(''), 2200)
    }
    window.addEventListener('cart:add:success', onShow)
    return ()=> { window.removeEventListener('cart:add:success', onShow); clearTimeout(t) }
  }, [])
  if (!msg) return null
  return (
    <div className="toast-bottom" role="status" aria-live="polite">{msg}</div>
  )
}
