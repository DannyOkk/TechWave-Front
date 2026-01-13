import { Link, NavLink } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import SearchBar from './SearchBar'
import MiniCart from './MiniCart'
import ThemeToggle from './ThemeToggle'
import CartDrawer from './CartDrawer'
import NotificationsDrawer from './NotificationsDrawer'
import FavoritesDrawer from './FavoritesDrawer'
import { authService } from '../services/authService'
import { categoryService } from '../services/categoryService'
import { orderService } from '../services/orderService'
import useFavorites from '../hooks/useFavorite'

export default function Header(){
  const [open, setOpen] = useState(false)
  const [favOpen, setFavOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [catOpen, setCatOpen] = useState(false)
  const [isAuth, setIsAuth] = useState(!!localStorage.getItem('access_token'))
  const [role, setRole] = useState(()=>{
    const r = localStorage.getItem('user_role');
    if (r) return r;
    try { return (JSON.parse(localStorage.getItem('user_data'))||{}).role || null } catch { return null }
  })

  const { count: favCount } = useFavorites()
  const queryClient = useQueryClient()
  const { data: categories } = useQuery({ queryKey:['categories-header'], queryFn: categoryService.getAll })
  const { data: myOrders } = useQuery({ queryKey:['notif-my-orders'], queryFn: orderService.myOrders, enabled: isAuth })
  const pendingCount = Array.isArray(myOrders) ? myOrders.filter(o=> o.estado==='pendiente').length : 0

  useEffect(()=>{
    const refresh = () => { if (isAuth) queryClient.invalidateQueries({ queryKey:['notif-my-orders'] }) }
    window.addEventListener('orders-changed', refresh)
    window.addEventListener('focus', refresh)
    window.addEventListener('auth-changed', refresh)
    window.addEventListener('storage', refresh)
    return ()=> { window.removeEventListener('orders-changed', refresh); window.removeEventListener('focus', refresh); window.removeEventListener('auth-changed', refresh); window.removeEventListener('storage', refresh) }
  }, [queryClient, isAuth])

  useEffect(()=>{
    const check = ()=> {
      setIsAuth(!!localStorage.getItem('access_token'))
      const r = localStorage.getItem('user_role');
      if (r) { setRole(r); return }
      try { setRole((JSON.parse(localStorage.getItem('user_data'))||{}).role || null) } catch { /* noop */ }
    }
    check()
    window.addEventListener('storage', check)
    window.addEventListener('auth-changed', check)
    return ()=> {
      window.removeEventListener('storage', check)
      window.removeEventListener('auth-changed', check)
    }
  }, [])

  const menuRef = useRef(null)
  const catsRef = useRef(null)
  const cartBtnRef = useRef(null)
  const [cartPop, setCartPop] = useState('')
  const [cartPopHiding, setCartPopHiding] = useState(false)
  useEffect(()=>{
    const onDown = (e)=>{
      if (menuOpen && menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
      if (catOpen && catsRef.current && !catsRef.current.contains(e.target)) setCatOpen(false)
      if (open || favOpen || notifOpen){
        const drawerEl = document.querySelector('.cart-drawer.open')
        if (drawerEl && !drawerEl.contains(e.target)){
          setOpen(false); setFavOpen(false); setNotifOpen(false)
        }
      }
    }
    const onKey = (e)=>{ if (e.key === 'Escape'){ setMenuOpen(false); setCatOpen(false); setOpen(false); setNotifOpen(false); setFavOpen(false) } }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return ()=>{ document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey) }
  }, [menuOpen, catOpen, open, favOpen, notifOpen])

  // Popover anclado al botón del carrito (arriba cerca del header)
  useEffect(()=>{
    let t
    const onCartAdd = (e)=>{
      setCartPopHiding(false)
      setCartPop(e?.detail?.msg || 'Agregado al carrito')
      clearTimeout(t)
      t = setTimeout(()=> { setCartPopHiding(true); setTimeout(()=> setCartPop(''), 180) }, 2200)
    }
    window.addEventListener('cart:add:success', onCartAdd)
    return ()=> { window.removeEventListener('cart:add:success', onCartAdd); clearTimeout(t) }
  }, [])

  const isAdmin = (()=>{
    const r = (role||'').toLowerCase()
    if (['admin','operator','operador','administrador'].includes(r)) return true
    try {
      const u = JSON.parse(localStorage.getItem('user_data')||'{}')
      if (u?.is_staff || u?.is_admin || u?.is_superuser) return true
    } catch {}
    return false
  })()

  return (
    <>
      <header className="site-header">
        <div className="container header-row">
          <div className="header-left">
            <Link to="/" className="brand" style={{color:'var(--text-primary)'}}>TechWave</Link>
            <nav className="nav">
              <div className="dropdown" ref={catsRef}>
                <NavLink to="/products">Productos</NavLink>
                <button className="btn btn-ghost" aria-expanded={catOpen} aria-controls="cats-menu" onClick={()=> setCatOpen(v=>!v)}>▾</button>
                <div id="cats-menu" className={`dropdown-menu ${catOpen ? 'open':''}`}>
                  {(Array.isArray(categories)?categories:[]).map(c=> (
                    <a key={c.id} href={`/products?cat=${encodeURIComponent((c.nombre||'').toLowerCase())}`}>{c.nombre}</a>
                  ))}
                </div>
              </div>
              {isAuth ? (
                <NavLink to="/my-orders" className="hide-mobile">Mis pedidos</NavLink>
              ) : (
                <>
                  {/* Hide on mobile header; links remain available inside hamburger menu */}
                  <NavLink to="/login" className="hide-mobile">Ingresar</NavLink>
                  <NavLink to="/register" className="hide-mobile">Registrarse</NavLink>
                </>
              )}
            </nav>
          </div>
          <div className="header-right">
            <div className="search-wrap">
              <SearchBar />
            </div>
            <button className="btn btn-ghost h-stack hide-mobile" style={{gap:6}} onClick={()=> { setFavOpen(true); setMenuOpen(false); setCatOpen(false); }} aria-label="Abrir favoritos"><span className="emoji" aria-hidden>❤</span> <span style={{opacity:.85}}>{favCount}</span></button>
            <span className="hide-mobile" style={{position:'relative'}} ref={cartBtnRef}>
              <MiniCart onOpen={()=> { setOpen(true); setMenuOpen(false); setCatOpen(false); }} />
              {cartPop && (
                <span className={`cart-popover ${cartPopHiding ? 'is-hiding':''}`} role="status" aria-live="polite">{cartPop}</span>
              )}
            </span>
            {isAuth && (
              <button className="btn btn-ghost h-stack hide-mobile" style={{gap:6}} title="Notificaciones" onClick={()=> { setNotifOpen(true); setMenuOpen(false); setCatOpen(false); }} aria-label="Abrir notificaciones"><span className="emoji" aria-hidden>🔔</span> <span style={{opacity:.85}}>{pendingCount}</span></button>
            )}
            <div className="dropdown" style={{position:'relative'}} ref={menuRef}>
              <button className="btn btn-ghost" onClick={()=> { setMenuOpen(v=>!v); setOpen(false); setNotifOpen(false); setFavOpen(false); }} aria-label="Menú">☰</button>
        {menuOpen && (
        <div className={`dropdown-menu ${menuOpen ? 'open':''}`} style={{right:0, left:'auto'}}>
                  {isAuth ? (
                    <>
                      <Link to="/profile" onClick={()=> setMenuOpen(false)}>👤 Mi perfil</Link>
                      <Link to="/my-orders" className="only-mobile" onClick={()=> setMenuOpen(false)}>🧾 Mis pedidos</Link>
                      <button type="button" className="only-mobile" aria-label="Abrir carrito" onClick={()=>{ setOpen(true); setMenuOpen(false) }}>🛒 Carrito</button>
                      <button type="button" className="only-mobile" aria-label="Abrir favoritos" onClick={()=>{ setFavOpen(true); setMenuOpen(false) }}>❤ Favoritos {favCount ? `(${favCount})` : ''}</button>
                      <button type="button" className="only-mobile" aria-label="Abrir notificaciones" onClick={()=>{ setNotifOpen(true); setMenuOpen(false) }}>🔔 Notificaciones {pendingCount ? `(${pendingCount})` : ''}</button>
                      <ThemeToggle variant="menuCycle" onDone={()=> setMenuOpen(false)} />
                      {isAdmin && <Link to="/admin" onClick={()=> setMenuOpen(false)}>🛠️ Panel admin</Link>}
                      <button type="button" onClick={async ()=>{ try { await authService.logout() } catch {}; setIsAuth(false); setMenuOpen(false); if (window.location.pathname.startsWith('/profile')) window.location.href = '/' }}>
                        🚪 Salir
                      </button>
                    </>
                  ) : (
                    <>
          <button type="button" className="only-mobile" aria-label="Abrir carrito" onClick={()=>{ setOpen(true); setMenuOpen(false) }}>🛒 Carrito</button>
                      <Link to="/login" onClick={()=> setMenuOpen(false)}>🔑 Ingresar</Link>
                      <Link to="/register" onClick={()=> setMenuOpen(false)}>📝 Registrarse</Link>
                      <ThemeToggle variant="menuCycle" onDone={()=> setMenuOpen(false)} />
                      <button type="button" className="only-mobile" aria-label="Abrir favoritos" onClick={()=>{ setFavOpen(true); setMenuOpen(false) }}>❤ Favoritos</button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
  {/* FAB de carrito eliminado; acceso al carrito se movió al menú en móvil */}
      <CartDrawer open={open} onClose={()=> setOpen(false)} />
      <FavoritesDrawer open={favOpen} onClose={()=> setFavOpen(false)} />
      <NotificationsDrawer open={notifOpen} onClose={()=> setNotifOpen(false)} />
    </>
  )
}
