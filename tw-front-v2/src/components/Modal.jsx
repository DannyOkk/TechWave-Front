import { useEffect } from 'react'

export default function Modal({ open, title, children, onClose, footer }){
  useEffect(()=>{
    const onKey = (e)=>{ if (e.key === 'Escape') onClose?.() }
    if (open) window.addEventListener('keydown', onKey)
    return ()=> window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null
  return (
    <>
      <div className="drawer-overlay open" onClick={onClose} />
      <div role="dialog" aria-label={title||'Modal'} className="card" style={{position:'fixed', inset:0, margin:'auto', maxWidth:560, width:'92vw', height:'fit-content', padding:16, zIndex:100}}>
        {title && <h3 style={{marginTop:0}}>{title}</h3>}
        <div style={{display:'grid', gap:12}}>
          {children}
        </div>
        {footer && <div className="h-stack" style={{justifyContent:'flex-end', gap:8, marginTop:12}}>{footer}</div>}
      </div>
    </>
  )
}
