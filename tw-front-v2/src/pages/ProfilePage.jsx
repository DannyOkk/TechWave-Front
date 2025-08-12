import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/authService'
import http from '../services/api'

export default function ProfilePage(){
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')
  const [form, setForm] = useState({ username:'', email:'', first_name:'', last_name:'', address:'', phone:'' })

  useEffect(()=>{
    const token = localStorage.getItem('access_token')
    if (!token){
      navigate(`/login?next=${encodeURIComponent('/profile')}`)
      return
    }
    const load = async ()=>{
      try {
        const me = await authService.profile()
        setForm({
          username: me?.username || '',
          email: me?.email || '',
          first_name: me?.first_name || '',
          last_name: me?.last_name || '',
          address: me?.address || '',
          phone: me?.phone || '',
        })
      } catch {
        setError('No se pudo cargar tu perfil')
      } finally { setLoading(false) }
    }
    load()
  }, [navigate])

  const handleChange = (e)=> setForm(p=> ({ ...p, [e.target.name]: e.target.value }))
  const handleSubmit = async (e)=>{
    e.preventDefault()
    setError(''); setOk(''); setSaving(true)
    try {
      await authService.updateProfile(form)
      setOk('Perfil actualizado')
    } catch {
      setError('No se pudo actualizar el perfil')
    } finally { setSaving(false) }
  }

  if (loading) return <div style={{padding:20}}>Cargando perfil…</div>

  return (
    <div className="v-stack" style={{gap:16, alignItems:'center'}}>
      <h2 style={{marginBottom:0}}>Mi perfil</h2>
      {error && <div style={{color:'tomato'}}>{error}</div>}
      {ok && <div style={{color:'seagreen'}}>{ok}</div>}
      <form onSubmit={handleSubmit} style={{display:'grid', gap:12, width:'100%', maxWidth:680}}>
        <div className="h-stack" style={{gap:8}}>
          <input className="input" name="first_name" placeholder="Nombre" value={form.first_name} onChange={handleChange} />
          <input className="input" name="last_name" placeholder="Apellido" value={form.last_name} onChange={handleChange} />
        </div>
        <input className="input" name="username" placeholder="Usuario" value={form.username} onChange={handleChange} />
        <input className="input" name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} />
        <input className="input" name="address" placeholder="Dirección" value={form.address} onChange={handleChange} />
        <input className="input" name="phone" placeholder="Teléfono" value={form.phone} onChange={handleChange} />
        <div className="h-stack" style={{gap:8, justifyContent:'center'}}>
          <button className="btn" type="button" onClick={()=> navigate(-1)}>Volver</button>
          <button className="btn btn-primary" type="submit" disabled={saving}>{saving? 'Guardando…' : 'Guardar cambios'}</button>
        </div>
      </form>
      <div>
        <ChangePasswordButton />
      </div>
    </div>
  )
}

function ChangePasswordButton(){
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const [form, setForm] = useState({ current_password:'', new_password:'', confirm:'' })
  const onChange = (e)=> setForm(p=> ({ ...p, [e.target.name]: e.target.value }))
  const submit = async (e)=>{
    e.preventDefault(); setMsg(''); setErr('');
    if (!form.new_password || form.new_password !== form.confirm){
      setErr('Las contraseñas no coinciden'); return
    }
    if ((form.new_password||'').length < 4){
      setErr('La nueva contraseña debe tener al menos 4 caracteres'); return
    }
    if (form.current_password === form.new_password){
      setErr('La nueva contraseña no puede ser igual a la actual'); return
    }
    setLoading(true)
    try {
      await http.post('/change-password/', { old_password: form.current_password, new_password: form.new_password })
      setMsg('Contraseña actualizada')
      setTimeout(()=> setOpen(false), 800)
    } catch (e){
      const apiMsg = e?.response?.data?.error || e?.response?.data?.message
      setErr(apiMsg || 'No se pudo cambiar la contraseña')
    } finally { setLoading(false) }
  }
  return (
    <>
      <button type="button" className="btn" onClick={()=> setOpen(true)}>Cambiar contraseña</button>
      {open && (
        <>
          <div className="drawer-overlay open" onClick={()=> setOpen(false)} />
          <div role="dialog" aria-label="Cambiar contraseña" className="card" style={{position:'fixed', inset:'0', margin:'auto', maxWidth:420, height:'fit-content', padding:16, zIndex:100, background:'var(--bg-card)'}}>
            <div className="h-stack" style={{justifyContent:'space-between'}}>
              <strong>Cambiar contraseña</strong>
            </div>
            {err && <div style={{color:'tomato', marginTop:8}}>{err}</div>}
            {msg && <div style={{color:'seagreen', marginTop:8}}>{msg}</div>}
            <form onSubmit={submit} style={{display:'grid', gap:10, marginTop:12}}>
              <input name="current_password" type="password" className="input" placeholder="Contraseña actual" value={form.current_password} onChange={onChange} />
              <input name="new_password" type="password" className="input" placeholder="Nueva contraseña" value={form.new_password} onChange={onChange} />
              <input name="confirm" type="password" className="input" placeholder="Confirmar contraseña" value={form.confirm} onChange={onChange} />
              <div className="h-stack" style={{gap:8, justifyContent:'flex-end'}}>
                <button type="button" className="btn" onClick={()=> setOpen(false)}>Cerrar</button>
                <button className="btn btn-primary" type="submit" disabled={loading}>{loading? 'Guardando…' : 'Guardar'}</button>
              </div>
            </form>
          </div>
        </>
      )}
    </>
  )
}
