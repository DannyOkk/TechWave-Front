import { useEffect } from 'react'

export default function ImageLightbox({ open, src, alt = 'image', onClose }){
  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') onClose?.() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open || !src) return null
  return (
    <div
      role="dialog"
      aria-label={alt}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, cursor: 'zoom-out'
      }}
    >
      <img
        src={src}
        alt={alt}
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '92vw', maxHeight: '92vh', objectFit: 'contain',
          borderRadius: 4, boxShadow: '0 8px 24px rgba(0,0,0,0.5)', background: '#fff', cursor: 'default'
        }}
      />
    </div>
  )
}
