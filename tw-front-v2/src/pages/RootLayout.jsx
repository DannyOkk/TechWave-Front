import { Outlet, useLocation } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function RootLayout() {
  const location = useLocation()
  const isAuth = location.pathname.startsWith('/login') || location.pathname.startsWith('/register')
  const isHome = location.pathname === '/'
  return (
    <div className="App">
      {!isAuth && <Header />}
      <main className="container" style={{padding: '24px 0', minHeight: '70vh'}}>
        <Outlet />
      </main>
      {!isAuth && isHome && <Footer />}
    </div>
  )
}
