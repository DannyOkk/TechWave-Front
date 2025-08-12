import React from 'react'

export default function FavoritesDrawer({ open, onClose }){
  const isAuth = !!localStorage.getItem('access_token')
  return (
    <>
      <div className={`drawer-overlay ${open ? 'open':''}`} onClick={onClose} />
      <aside className={`cart-drawer ${open ? 'open':''}`} role="dialog" aria-label="Favoritos">
        <header>
          <strong>Favoritos</strong>
          <button className="btn btn-ghost" onClick={onClose}>Cerrar</button>
        </header>
        <div className="content">
          {!isAuth ? (
            <div style={{opacity:.9}}>Inicia sesión para poner aquí tus productos favoritos.</div>
          ) : (
            <div style={{opacity:.8}}>Aún no hay favoritos.</div>
          )}
        </div>
        <footer>
          <button className="btn btn-primary" style={{width:'100%'}}>Ver productos</button>
        </footer>
      </aside>
    </>
  )
}
