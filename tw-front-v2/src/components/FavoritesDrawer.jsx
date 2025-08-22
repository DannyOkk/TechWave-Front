import React from 'react'
import useFavorites from '../hooks/useFavorite'
import { useQuery } from '@tanstack/react-query'
import { productService } from '../services/productService'
import { Link, useNavigate } from 'react-router-dom'

export default function FavoritesDrawer({ open, onClose }){
  const { favorites, isAuth, count, loading, toggle } = useFavorites()
  // Si guest necesitamos mapear IDs -> productos del catálogo (cache en react-query)
  const { data: allProducts } = useQuery({ queryKey:['products'], queryFn: productService.getAll })
  const productList = isAuth ? favorites : (Array.isArray(allProducts)? allProducts.filter(p=> favorites.includes(Number(p.id))) : [])
  const navigate = useNavigate()
  return (
    <>
      <div className={`drawer-overlay ${open ? 'open':''}`} onClick={onClose} />
      <aside className={`cart-drawer ${open ? 'open':''}`} role="dialog" aria-label="Favoritos">
        <header>
          <strong>Favoritos</strong>
          <button className="btn btn-ghost" onClick={onClose}>Cerrar</button>
        </header>
        <div className="content">
          {!isAuth && count===0 && (
            <div style={{opacity:.9}}>Inicia sesión o marca productos para verlos aquí.</div>
          )}
          {loading && <div style={{opacity:.8}}>Cargando…</div>}
          {!loading && count===0 && isAuth && (
            <div style={{opacity:.8}}>Aún no hay favoritos.</div>
          )}
          {!loading && count>0 && (
            <ul className="v-stack" style={{listStyle:'none', padding:0, margin:0, gap:8}}>
              {productList.map(p => (
                <li key={p.id} style={{display:'flex', alignItems:'center', gap:10}}>
                  <Link to={`/products/${p.id}`} style={{flex:1, textDecoration:'none', color:'var(--text-primary)'}} onClick={onClose}>
                    <div style={{fontWeight:600, fontSize:14}}>{p.nombre}</div>
                    <div style={{fontSize:12, opacity:.7}}>${Number(p.precio).toLocaleString()}</div>
                  </Link>
                  <button className="btn btn-ghost" aria-label="Quitar de favoritos" title="Quitar" onClick={()=> toggle(p.id)}>✕</button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <footer>
          <button className="btn btn-primary" style={{width:'100%'}} onClick={()=> { onClose(); navigate('/products'); }}>Ver productos</button>
        </footer>
      </aside>
    </>
  )
}
