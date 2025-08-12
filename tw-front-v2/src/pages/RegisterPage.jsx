import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { authService } from '../services/authService'

export default function RegisterPage(){
  const navigate = useNavigate();
  const [form, setForm] = useState({ username:'', email:'', password:'', first_name:'', last_name:'' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')

  const handleChange = (e)=> setForm(prev=> ({ ...prev, [e.target.name]: e.target.value }))
  const fieldsOrder = ['first_name','last_name','username','email','password']
  const focusNextOnEnter = (e)=>{
    if (e.key !== 'Enter') return;
    const values = fieldsOrder.map(f=> (form[f]||'').trim());
    const firstEmptyIdx = values.findIndex(v=> !v);
    if (firstEmptyIdx !== -1){
      e.preventDefault();
      const nextName = fieldsOrder[firstEmptyIdx];
      const el = e.currentTarget.form?.elements[nextName];
      if (el && typeof el.focus === 'function') el.focus();
      return;
    }
    // todos completos -> submit normal
  }
  const handleSubmit = async (e)=>{
    e.preventDefault()
    setError(''); setOk(''); setLoading(true)
    try {
      await authService.register(form)
      setOk('Cuenta creada. Ahora puedes ingresar.')
      setTimeout(()=> navigate('/login'), 1200)
    } catch (err){
      const msg = err?.response?.data || 'No se pudo crear la cuenta'
      setError(typeof msg === 'string' ? msg : 'Error en el registro')
    } finally { setLoading(false) }
  }
  return (
    <div className="auth-wrap">
      <div className="card auth-card">
        <h2 className="center" style={{marginTop:0}}>Crear cuenta</h2>
        {error && <div style={{color:'tomato', marginTop:8}}>{error}</div>}
        {ok && <div style={{color:'seagreen', marginTop:8}}>{ok}</div>}
        <form style={{display:'grid', gap:10, marginTop:12}} onSubmit={handleSubmit}>
          <div className="h-stack" style={{gap:8}}>
            <input className="input" name="first_name" placeholder="Nombre" value={form.first_name} onChange={handleChange} onKeyDown={focusNextOnEnter} />
            <input className="input" name="last_name" placeholder="Apellido" value={form.last_name} onChange={handleChange} onKeyDown={focusNextOnEnter} />
          </div>
          <input className="input" name="username" placeholder="Usuario" value={form.username} onChange={handleChange} onKeyDown={focusNextOnEnter} />
          <input className="input" name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} onKeyDown={focusNextOnEnter} />
          <input className="input" name="password" type="password" placeholder="Contraseña" value={form.password} onChange={handleChange} onKeyDown={focusNextOnEnter} />
          <button className="btn btn-primary" type="submit" disabled={loading}>{loading? 'Creando…' : 'Registrarme'}</button>
        </form>
        <div className="center" style={{marginTop:10}}>
          <span style={{opacity:.85, marginRight:8}}>¿Ya tenés cuenta?</span>
          <Link to="/login" className="btn btn-ghost" style={{display:'inline-block'}}>Ingresar</Link>
        </div>
      </div>
    </div>
  )
}
