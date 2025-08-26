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

  if (loading) return <div className="container" style={{padding:20}}>Cargando perfil…</div>

  const initials = (form.first_name || form.username || '?')
    .toString()
    .trim()
    .split(/\s+/)
    .slice(0,2)
    .map(s=> s.charAt(0).toUpperCase())
    .join('')

  return (
    <div className="container v-stack" style={{gap:16, padding:'16px 16px'}}>
      <div className="profile-hero card" style={{padding:16, display:'flex', alignItems:'center', gap:14}}>
        <div className="avatar-chip" aria-hidden>{initials || 'U'}</div>
        <div style={{flex:1}}>
          <h2 style={{margin:0}}>Mi perfil</h2>
          <div style={{opacity:.8, fontSize:14}}>{form.email || '—'}</div>
        </div>
        <ChangePasswordButton />
      </div>

      {error && <div className="card" style={{padding:12, borderLeft:'3px solid tomato', color:'tomato'}}>{error}</div>}
      {ok && <div className="card" style={{padding:12, borderLeft:'3px solid seagreen', color:'seagreen'}}>{ok}</div>}

      <div className="profile-wrap">
        <form onSubmit={handleSubmit} className="profile-card" aria-label="Editar perfil">
          <h3 style={{marginTop:0}}>Datos personales</h3>
          <div className="grid-2">
            <div className="form-field">
              <label htmlFor="pf_first_name">Nombre</label>
              <input id="pf_first_name" className="input" name="first_name" value={form.first_name} onChange={handleChange} />
            </div>
            <div className="form-field">
              <label htmlFor="pf_last_name">Apellido</label>
              <input id="pf_last_name" className="input" name="last_name" value={form.last_name} onChange={handleChange} />
            </div>
          </div>
          <div className="grid-2">
            <div className="form-field">
              <label htmlFor="pf_username">Usuario</label>
              <input id="pf_username" className="input" name="username" value={form.username} onChange={handleChange} />
            </div>
            <div className="form-field">
              <label htmlFor="pf_email">Email</label>
              <input id="pf_email" className="input" name="email" type="email" value={form.email} onChange={handleChange} />
            </div>
          </div>
          <h3>Dirección y contacto</h3>
          <div className="form-field">
            <label htmlFor="pf_address">Dirección</label>
            <input id="pf_address" className="input" name="address" value={form.address} onChange={handleChange} />
          </div>
          <div className="grid-2">
            <div className="form-field">
              <label htmlFor="pf_phone">Teléfono</label>
              <input id="pf_phone" className="input" name="phone" value={form.phone} onChange={handleChange} />
            </div>
            <div />
          </div>
          <div className="h-stack" style={{gap:8, justifyContent:'flex-end'}}>
            <button className="btn" type="button" onClick={()=> navigate(-1)}>Volver</button>
            <button className="btn btn-primary" type="submit" disabled={saving}>{saving? 'Guardando…' : 'Guardar cambios'}</button>
          </div>
        </form>

        <aside className="profile-card" aria-label="Consejos">
          <h3 style={{marginTop:0}}>Consejos</h3>
          <ul className="check-list">
            <li>Usá un email activo para notificaciones.</li>
            <li>Completá dirección y teléfono para agilizar envíos.</li>
            <li>Podés cambiar tu contraseña cuando quieras.</li>
          </ul>
        </aside>
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
              <div className="form-field">
                <label htmlFor="pw_current">Contraseña actual</label>
                <input id="pw_current" name="current_password" type="password" className="input" value={form.current_password} onChange={onChange} />
              </div>
              <div className="form-field">
                <label htmlFor="pw_new">Nueva contraseña</label>
                <input id="pw_new" name="new_password" type="password" className="input" value={form.new_password} onChange={onChange} />
              </div>
              <div className="form-field">
                <label htmlFor="pw_confirm">Confirmar contraseña</label>
                <input id="pw_confirm" name="confirm" type="password" className="input" value={form.confirm} onChange={onChange} />
              </div>
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
