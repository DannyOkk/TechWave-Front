import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useState } from 'react'
import { authService } from '../services/authService'

export default function LoginPage(){
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get('next') || '/';
  const [form, setForm] = useState({ username:'', password:'' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e)=> setForm(prev=> ({ ...prev, [e.target.name]: e.target.value }));
  const focusNextOnEnter = (e)=>{
    if (e.key !== 'Enter') return;
    const fields = ['username','password'];
    const values = fields.map(f=> (form[f]||'').trim());
    const firstEmptyIdx = values.findIndex(v=> !v);
    if (firstEmptyIdx !== -1){
      e.preventDefault();
      const nextName = fields[firstEmptyIdx];
      const el = e.currentTarget.form?.elements[nextName];
      if (el && typeof el.focus === 'function') el.focus();
      return;
    }
    // todos llenos -> submit
    // permitir submit nativo del form
  };
  const handleSubmit = async (e)=>{
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authService.login(form);
      navigate(next);
    } catch (err){
      const msg = err?.response?.data?.detail || 'Credenciales inválidas';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="auth-wrap">
      <div className="card auth-card">
        <h2 className="center" style={{marginTop:0}}>Ingresar</h2>
        {error && <div style={{color:'tomato', marginTop:8}}>{error}</div>}
        <form style={{display:'grid', gap:10, marginTop:12}} onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="lg_username">Usuario</label>
            <input id="lg_username" className="input" name="username" value={form.username} onChange={handleChange} onKeyDown={focusNextOnEnter} />
          </div>
          <div className="form-field">
            <label htmlFor="lg_password">Contraseña</label>
            <input id="lg_password" className="input" name="password" type="password" value={form.password} onChange={handleChange} onKeyDown={focusNextOnEnter} />
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading}>{loading? 'Ingresando…' : 'Entrar'}</button>
        </form>
        <div className="center" style={{marginTop:10}}>
          <span style={{opacity:.85, marginRight:8}}>¿No tenés cuenta?</span>
          <Link to="/register" className="btn btn-ghost" style={{display:'inline-block'}}>Registrarme</Link>
        </div>
      </div>
    </div>
  )
}
