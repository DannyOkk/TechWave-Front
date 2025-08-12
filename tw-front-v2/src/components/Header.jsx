import { Link, NavLink } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import SearchBar from './SearchBar'
import MiniCart from './MiniCart'
import ThemeToggle from './ThemeToggle'
import CartDrawer from './CartDrawer'
import FavoritesDrawer from './FavoritesDrawer'
import NotificationsDrawer from './NotificationsDrawer'
import { authService } from '../services/authService'
import { useQuery } from '@tanstack/react-query'
import { categoryService } from '../services/categoryService'
import { orderService } from '../services/orderService'

export default function Header(){
  const [open, setOpen] = useState(false)
  const [favOpen, setFavOpen] = useState(false)
  const [isAuth, setIsAuth] = useState(!!localStorage.getItem('access_token'))
  const [role, setRole] = useState(()=>{
    const r = localStorage.getItem('user_role');
    if (r) return r;
    try { return (JSON.parse(localStorage.getItem('user_data'))||{}).role || null } catch { return null }
  })
  const { data: categories } = useQuery({ queryKey:['categories-header'], queryFn: categoryService.getAll })
  const { data: myOrders } = useQuery({ queryKey:['notif-my-orders'], queryFn: orderService.myOrders, enabled: isAuth })
  const pendingCount = Array.isArray(myOrders) ? myOrders.filter(o=> o.estado==='pendiente').length : 0
  const [menuOpen, setMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [catOpen, setCatOpen] = useState(false)
  const menuRef = useRef(null)
  const catsRef = useRef(null)
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
  // Cierre por clic-fuera y Escape para menús desplegables
  useEffect(()=>{
    const onDown = (e)=>{
      if (menuOpen && menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
      if (catOpen && catsRef.current && !catsRef.current.contains(e.target)) setCatOpen(false)
      // Cerrar drawers si se hace clic fuera de ellos
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
    <header className="site-header">
      <div className="container header-row" style={{height:64}}>
        <div className="header-left" style={{display:'flex', alignItems:'center', gap:16}}>
          <Link to="/" className="brand" style={{color:'var(--text-primary)', fontSize:22}}>TechWave</Link>
          <nav className="nav" style={{display:'flex', alignItems:'center', gap:12}}>
            <div className="dropdown" ref={catsRef}>
              <NavLink to="/products">Productos</NavLink>
              <button className="btn btn-ghost" aria-expanded={catOpen} aria-controls="cats-menu" onClick={()=> setCatOpen(v=>!v)} style={{padding:'6px 10px'}}>▾</button>
              <div id="cats-menu" className={`dropdown-menu ${catOpen ? 'open':''}`}>
                {(Array.isArray(categories)?categories:[]).map(c=> (
                  <a key={c.id} href={`/products?cat=${encodeURIComponent((c.nombre||'').toLowerCase())}`}>{c.nombre}</a>
                ))}
              </div>
            </div>
            {isAuth ? (
              <NavLink to="/my-orders">Mis pedidos</NavLink>
            ) : (
              <>
                <NavLink to="/login">Ingresar</NavLink>
                <NavLink to="/register">Registrarse</NavLink>
              </>
            )}
          </nav>
        </div>
        <div className="header-right">
          <div className="search-wrap">
            <SearchBar />
          </div>
          <button className="btn btn-ghost h-stack" style={{gap:6}} onClick={()=> { setFavOpen(true); setMenuOpen(false); setCatOpen(false); }} aria-label="Abrir favoritos">❤ <span style={{opacity:.85}}>0</span></button>
      <MiniCart onOpen={()=> { setOpen(true); setMenuOpen(false); setCatOpen(false); }} />
          <ThemeToggle />
          {isAuth && (
              <button className="btn btn-ghost h-stack" style={{gap:6}} title="Notificaciones" onClick={()=> { setNotifOpen(true); setMenuOpen(false); setCatOpen(false); }} aria-label="Abrir notificaciones">🔔 <span style={{opacity:.85}}>{pendingCount}</span></button>
          )}
          {isAuth && (
          <div className="dropdown" style={{position:'relative'}} ref={menuRef}>
            <button className="btn btn-ghost" onClick={()=> { setMenuOpen(v=>!v); setOpen(false); setNotifOpen(false); setFavOpen(false); }} aria-label="Menú">
              ☰
            </button>
            {menuOpen && (
              <div className={`dropdown-menu ${menuOpen ? 'open':''}`} style={{right:0, left:'auto'}}>
                {isAuth ? (
                  <>
                    <Link to="/profile" onClick={()=> setMenuOpen(false)}>Mi perfil</Link>
                      {isAdmin && <Link to="/admin" onClick={()=> setMenuOpen(false)}>Panel admin</Link>}
                    <a href="/logout" onClick={async (e)=>{ e.preventDefault(); try { await authService.logout() } catch {}; setIsAuth(false); setMenuOpen(false); if (window.location.pathname.startsWith('/profile')) window.location.href = '/' }}>Salir</a>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={()=> setMenuOpen(false)}>Ingresar</Link>
                    <Link to="/register" onClick={()=> setMenuOpen(false)}>Registrarse</Link>
                  </>
                )}
              </div>
            )}
          </div>
          )}
        </div>
      </div>
    <CartDrawer open={open} onClose={()=> setOpen(false)} />
    <FavoritesDrawer open={favOpen} onClose={()=> setFavOpen(false)} />
    <NotificationsDrawer open={notifOpen} onClose={()=> setNotifOpen(false)} />
    </header>
  )
}
