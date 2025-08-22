import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminService } from '../services/adminService'
import { productService } from '../services/productService'
import { categoryService } from '../services/categoryService'
import { orderService } from '../services/orderService'
import Modal from '../components/Modal'

export default function AdminPage(){
  const navigate = useNavigate()
  const [allowed, setAllowed] = useState(false)

  useEffect(()=>{
    const token = localStorage.getItem('access_token')
    if (!token){
      navigate(`/login?next=${encodeURIComponent('/admin')}`)
      return
    }
    let role = localStorage.getItem('user_role')
    if (!role){
      try { role = (JSON.parse(localStorage.getItem('user_data'))||{}).role } catch {}
    }
    const r = (role||'').toLowerCase()
    if (['admin','operator','operador','administrador'].includes(r)) setAllowed(true)
    else {
      // Fallback a flags comunes
      try {
        const u = JSON.parse(localStorage.getItem('user_data')||'{}')
        if (u?.is_staff || u?.is_admin || u?.is_superuser) setAllowed(true)
        else navigate('/')
      } catch { navigate('/') }
    }
  }, [navigate])

  if (!allowed) return null

  return <AdminDashboard />
}

function AdminDashboard(){
  const qc = useQueryClient()
  const [tab, setTab] = useState('usuarios')
  const [modal, setModal] = useState({ type:null, open:false, payload:null })

  // Usuarios
  const usersQ = useQuery({ queryKey:['admin-users'], queryFn: adminService.listUsers })
  const changeRoleM = useMutation({
    mutationFn: ({ id, role }) => adminService.changeRole(id, role),
    onSuccess: ()=> qc.invalidateQueries({ queryKey:['admin-users'] })
  })
  const deleteUserM = useMutation({
    mutationFn: (id)=> adminService.deleteUser(id),
    onSuccess: ()=> qc.invalidateQueries({ queryKey:['admin-users'] })
  })
  const updateUserM = useMutation({
    mutationFn: ({ id, payload })=> adminService.updateUser(id, payload),
    onSuccess: ()=> { qc.invalidateQueries({ queryKey:['admin-users'] }); setModal({ type:null, open:false, payload:null }) }
  })
  const createUserM = useMutation({
    mutationFn: (payload)=> adminService.createUser(payload),
    onSuccess: ()=> { qc.invalidateQueries({ queryKey:['admin-users'] }); setModal({ type:null, open:false, payload:null }) }
  })

  // Productos / Categorías / Pedidos (solo listados rápidos)
  const productsQ = useQuery({ queryKey:['admin-products'], queryFn: productService.getAll })
  const createProductM = useMutation({
    mutationFn: (payload)=> productService.create(payload),
    onSuccess: ()=> { qc.invalidateQueries({ queryKey:['admin-products'] }); setModal({ type:null, open:false, payload:null }) }
  })
  const updateProductM = useMutation({
    mutationFn: ({ id, payload })=> productService.update(id, payload),
    onSuccess: ()=> { qc.invalidateQueries({ queryKey:['admin-products'] }); setModal({ type:null, open:false, payload:null }) }
  })
  const deleteProductM = useMutation({
    mutationFn: (id)=> productService.remove(id),
    onSuccess: ()=> qc.invalidateQueries({ queryKey:['admin-products'] })
  })
  const categoriesQ = useQuery({ queryKey:['admin-categories'], queryFn: categoryService.getAll })
  const createCategoryM = useMutation({
    mutationFn: (payload)=> categoryService.create(payload),
    onSuccess: ()=> { qc.invalidateQueries({ queryKey:['admin-categories'] }); setModal({ type:null, open:false, payload:null }) }
  })
  const updateCategoryM = useMutation({
    mutationFn: ({ id, payload })=> categoryService.update(id, payload),
    onSuccess: ()=> { qc.invalidateQueries({ queryKey:['admin-categories'] }); setModal({ type:null, open:false, payload:null }) }
  })
  const deleteCategoryM = useMutation({
    mutationFn: (id)=> categoryService.remove(id),
    onSuccess: ()=> qc.invalidateQueries({ queryKey:['admin-categories'] })
  })
  const ordersQ = useQuery({ queryKey:['admin-orders'], queryFn: orderService.getAll })
  const updateOrderM = useMutation({
    mutationFn: ({ id, payload })=> orderService.update(id, payload),
    onSuccess: ()=> qc.invalidateQueries({ queryKey:['admin-orders'] })
  })
  const cancelOrderM = useMutation({
    mutationFn: (id)=> orderService.cancel(id),
    onSuccess: ()=> qc.invalidateQueries({ queryKey:['admin-orders'] })
  })
  const deleteOrderM = useMutation({
    mutationFn: (id)=> orderService.remove(id),
    onSuccess: ()=> qc.invalidateQueries({ queryKey:['admin-orders'] })
  })

  return (
    <div className="v-stack" style={{gap:12}}>
      <h2>Panel Admin</h2>
      <div className="h-stack" style={{gap:8, flexWrap:'wrap'}}>
        <button className={`btn ${tab==='usuarios'?'btn-primary':''}`} onClick={()=> setTab('usuarios')}>Usuarios</button>
        <button className={`btn ${tab==='productos'?'btn-primary':''}`} onClick={()=> setTab('productos')}>Productos</button>
        <button className={`btn ${tab==='categorias'?'btn-primary':''}`} onClick={()=> setTab('categorias')}>Categorías</button>
        <button className={`btn ${tab==='pedidos'?'btn-primary':''}`} onClick={()=> setTab('pedidos')}>Pedidos</button>
      </div>

      {tab==='usuarios' && (
        <div className="card" style={{padding:12}}>
          <div className="h-stack" style={{justifyContent:'space-between', alignItems:'center'}}>
            <h3 style={{marginTop:0}}>Usuarios</h3>
            <button className="btn btn-primary" onClick={()=> setModal({ type:'user-create', open:true, payload:null })}>Nuevo usuario</button>
          </div>
          {usersQ.isLoading && <div>Cargando…</div>}
          {usersQ.error && <div style={{color:'tomato'}}>No se pudieron cargar</div>}
          {!usersQ.isLoading && !usersQ.error && (
            <div className="v-stack" style={{gap:8}}>
              {(usersQ.data||[]).map(u=> (
                <div key={u.id} className="h-stack" style={{justifyContent:'space-between'}}>
                  <div>
                    <strong>{u.username}</strong> <span style={{opacity:.8}}>{u.email}</span>
                    <div style={{opacity:.75, fontSize:12}}>Rol: {u.role || (u.is_staff ? 'staff' : 'user')} · Nombre: {u.first_name||'-'} {u.last_name||''}</div>
                  </div>
                  <div className="h-stack" style={{gap:6}}>
                    <select className="input" defaultValue={u.role||''} onChange={(e)=> changeRoleM.mutate({ id: u.id, role: e.target.value })}>
                      <option value="">(sin cambio)</option>
                      <option value="admin">admin</option>
                      <option value="operator">operator</option>
                      <option value="client">client</option>
                    </select>
                    <button className="btn" onClick={()=> setModal({ type:'user-edit', open:true, payload:u })}>Editar</button>
                    <button className="btn" disabled={deleteUserM.isLoading} onClick={()=> { if (window.confirm('¿Eliminar usuario?')) deleteUserM.mutate(u.id) }}>Eliminar</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab==='productos' && (
        <div className="card" style={{padding:12}}>
          <div className="h-stack" style={{justifyContent:'space-between', alignItems:'center'}}>
            <h3 style={{marginTop:0}}>Productos</h3>
            <button className="btn btn-primary" onClick={()=> setModal({ type:'product-create', open:true })}>Nuevo producto</button>
          </div>
          {productsQ.isLoading && <div>Cargando…</div>}
          {productsQ.error && <div style={{color:'tomato'}}>No se pudieron cargar</div>}
          {!productsQ.isLoading && !productsQ.error && (
            <div className="v-stack" style={{gap:10}}>
              {(productsQ.data||[]).map(p=> (
                <div key={p.id} className="h-stack" style={{justifyContent:'space-between'}}>
                  <div>
                    <strong>{p.nombre}</strong>
                    <div style={{opacity:.8}}>${p.precio} · {p.categoria?.nombre}</div>
                  </div>
                  <div className="h-stack" style={{gap:6}}>
                    <span className="badge">Stock: {p.stock}</span>
                    <button className="btn" onClick={()=> setModal({ type:'product-edit', open:true, payload:p })}>Editar</button>
                    <button className="btn" disabled={deleteProductM.isLoading} onClick={()=> { if (window.confirm('¿Eliminar producto?')) deleteProductM.mutate(p.id) }}>Eliminar</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab==='categorias' && (
        <div className="card" style={{padding:12}}>
          <div className="h-stack" style={{justifyContent:'space-between', alignItems:'center'}}>
            <h3 style={{marginTop:0}}>Categorías</h3>
            <button className="btn btn-primary" onClick={()=> setModal({ type:'category-create', open:true })}>Nueva categoría</button>
          </div>
          {categoriesQ.isLoading && <div>Cargando…</div>}
          {categoriesQ.error && <div style={{color:'tomato'}}>No se pudieron cargar</div>}
          {!categoriesQ.isLoading && !categoriesQ.error && (
            <div className="v-stack" style={{gap:8}}>
              {(categoriesQ.data||[]).map(c=> (
                <div key={c.id} className="h-stack" style={{justifyContent:'space-between'}}>
                  <div><strong>{c.nombre}</strong></div>
                  <div className="h-stack" style={{gap:6}}>
                    <span className="badge">ID: {c.id}</span>
                    <button className="btn" onClick={()=> setModal({ type:'category-edit', open:true, payload:c })}>Editar</button>
                    <button className="btn" disabled={deleteCategoryM.isLoading} onClick={()=> { if (window.confirm('¿Eliminar categoría?')) deleteCategoryM.mutate(c.id) }}>Eliminar</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab==='pedidos' && (
        <div className="card" style={{padding:12}}>
          <h3 style={{marginTop:0}}>Todos los pedidos</h3>
          {ordersQ.isLoading && <div>Cargando…</div>}
          {ordersQ.error && <div style={{color:'tomato'}}>No se pudieron cargar</div>}
          {!ordersQ.isLoading && !ordersQ.error && (
            <div className="v-stack" style={{gap:10}}>
              {(ordersQ.data||[]).map(o=> (
                <div key={o.id} className="h-stack" style={{justifyContent:'space-between'}}>
                  <div>
                    <strong>Pedido #{o.id}</strong> <span style={{opacity:.8}}>· {o.usuario?.username || '—'}</span>
                    <div style={{opacity:.8}}>Estado: {o.estado} · Fecha: {new Date(o.fecha).toLocaleString()} · Dirección: {o.direccion_envio||'—'}</div>
                  </div>
                  <div className="h-stack" style={{gap:6}}>
                    <span className="badge">Total: ${o.total}</span>
                    <select className="input" defaultValue={o.estado} disabled={o.estado==='cancelado'} onChange={(e)=> updateOrderM.mutate({ id:o.id, payload:{ estado: e.target.value } })}>
                      <option value="pendiente">pendiente</option>
                      <option value="pagado">pagado</option>
                      <option value="preparando">preparando</option>
                      <option value="enviado">enviado</option>
                      <option value="entregado">entregado</option>
                      <option value="cancelado">cancelado</option>
                    </select>
                    {o.estado !== 'cancelado' && (
                      <button className="btn" disabled={cancelOrderM.isLoading} onClick={()=> cancelOrderM.mutate(o.id)}>Cancelar</button>
                    )}
                    {o.estado === 'cancelado' && (
                      <button className="btn" style={{background:'tomato', color:'#fff'}} disabled={deleteOrderM.isLoading} onClick={()=> { if (window.confirm('¿Eliminar pedido cancelado? Esta acción es irreversible.')) deleteOrderM.mutate(o.id) }}>Eliminar</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modales CRUD */}
      <UserModal modal={modal} setModal={setModal} onCreate={createUserM.mutate} onUpdate={(id, payload)=> updateUserM.mutate({ id, payload })} />
      <ProductModal modal={modal} setModal={setModal} categories={categoriesQ.data||[]} onCreate={createProductM.mutate} onUpdate={(id, payload)=> updateProductM.mutate({ id, payload })} />
      <CategoryModal modal={modal} setModal={setModal} onCreate={createCategoryM.mutate} onUpdate={(id, payload)=> updateCategoryM.mutate({ id, payload })} />
    </div>
  )
}

function UserModal({ modal, setModal, onCreate, onUpdate }){
  const isOpen = modal.open && (modal.type==='user-create' || modal.type==='user-edit')
  const isEdit = modal.type==='user-edit'
  const data = modal.payload || {}
  const close = ()=> setModal({ type:null, open:false, payload:null })
  const submit = (e)=>{
    e.preventDefault()
    const form = Object.fromEntries(new FormData(e.currentTarget).entries())
    if (isEdit) onUpdate(data.id, form); else onCreate(form)
  }
  return (
    <Modal open={isOpen} onClose={close} title={isEdit? 'Editar usuario':'Crear usuario'} footer={[
      <button key="cancel" className="btn" onClick={close}>Cancelar</button>,
      <button key="save" className="btn btn-primary" form="user-form" type="submit">Guardar</button>
    ]}>
      <form id="user-form" onSubmit={submit} className="v-stack" style={{gap:10}}>
        <div className="h-stack" style={{gap:10}}>
          <input className="input" name="first_name" placeholder="Nombre" defaultValue={data.first_name||''} />
          <input className="input" name="last_name" placeholder="Apellido" defaultValue={data.last_name||''} />
        </div>
        <input className="input" name="username" placeholder="Usuario" defaultValue={data.username||''} />
        <input className="input" type="email" name="email" placeholder="Email" defaultValue={data.email||''} />
        {!isEdit && <input className="input" type="password" name="password" placeholder="Contraseña (solo al crear)" />}
        <input className="input" name="address" placeholder="Dirección" defaultValue={data.address||''} />
        <input className="input" name="phone" placeholder="Teléfono" defaultValue={data.phone||''} />
        <select className="input" name="role" defaultValue={data.role||''}>
          <option value="">Rol…</option>
          <option value="admin">admin</option>
          <option value="operator">operator</option>
          <option value="client">client</option>
        </select>
      </form>
    </Modal>
  )
}

function ProductModal({ modal, setModal, categories, onCreate, onUpdate }){
  const isOpen = modal.open && (modal.type==='product-create' || modal.type==='product-edit')
  const isEdit = modal.type==='product-edit'
  const data = modal.payload || {}
  const close = ()=> setModal({ type:null, open:false, payload:null })
  const submit = (e)=>{
    e.preventDefault()
    const formObj = Object.fromEntries(new FormData(e.currentTarget).entries())
    // Normalizar tipos
    const payload = {
      nombre: formObj.nombre,
      descripcion: formObj.descripcion,
      precio: parseFloat(formObj.precio||0),
      stock: parseInt(formObj.stock||0, 10),
      categoria: parseInt(formObj.categoria, 10),
    }
    if (isEdit) onUpdate(data.id, payload); else onCreate(payload)
  }
  return (
    <Modal open={isOpen} onClose={close} title={isEdit? 'Editar producto':'Crear producto'} footer={[
      <button key="cancel" className="btn" onClick={close}>Cancelar</button>,
      <button key="save" className="btn btn-primary" form="product-form" type="submit">Guardar</button>
    ]}>
      <form id="product-form" onSubmit={submit} className="v-stack" style={{gap:10}}>
        <input className="input" name="nombre" placeholder="Nombre" defaultValue={data.nombre||''} />
        <textarea className="input" name="descripcion" placeholder="Descripción" defaultValue={data.descripcion||''} rows={3} />
        <div className="h-stack" style={{gap:10}}>
          <input className="input" name="precio" type="number" step="0.01" placeholder="Precio" defaultValue={data.precio||''} />
          <input className="input" name="stock" type="number" placeholder="Stock" defaultValue={data.stock||''} />
        </div>
        <select className="input" name="categoria" defaultValue={data.categoria?.id || data.categoria || ''}>
          <option value="">Categoría…</option>
          {(categories||[]).map(c=> <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>
      </form>
    </Modal>
  )
}

function CategoryModal({ modal, setModal, onCreate, onUpdate }){
  const isOpen = modal.open && (modal.type==='category-create' || modal.type==='category-edit')
  const isEdit = modal.type==='category-edit'
  const data = modal.payload || {}
  const close = ()=> setModal({ type:null, open:false, payload:null })
  const submit = (e)=>{
    e.preventDefault()
    const form = Object.fromEntries(new FormData(e.currentTarget).entries())
    if (isEdit) onUpdate(data.id, form); else onCreate(form)
  }
  return (
    <Modal open={isOpen} onClose={close} title={isEdit? 'Editar categoría':'Crear categoría'} footer={[
      <button key="cancel" className="btn" onClick={close}>Cancelar</button>,
      <button key="save" className="btn btn-primary" form="category-form" type="submit">Guardar</button>
    ]}>
      <form id="category-form" onSubmit={submit} className="v-stack" style={{gap:10}}>
        <input className="input" name="nombre" placeholder="Nombre" defaultValue={data.nombre||''} />
        <textarea className="input" name="descripcion" placeholder="Descripción" defaultValue={data.descripcion||''} rows={3} />
      </form>
    </Modal>
  )
}
