import { useNavigate, useLocation } from 'react-router-dom'

export default function SearchBar({ onSearch }){
  const navigate = useNavigate();
  const location = useLocation();
  const handleSubmit = (e) => {
    e.preventDefault();
    const q = e.currentTarget.q.value;
    if (onSearch) return onSearch(q);
    const params = new URLSearchParams(location.search);
    if (q) params.set('q', q); else params.delete('q');
    navigate({ pathname: '/products', search: params.toString() });
  };
  return (
    <form onSubmit={handleSubmit} className="h-stack" style={{gap:8}}>
      <input name="q" placeholder="Buscar productos..." style={{padding:'8px 10px', borderRadius:10, border:'1px solid var(--border-light)', background:'var(--bg-tertiary)', color:'var(--text-primary)'}} />
      <button className="btn btn-primary" type="submit">Buscar</button>
    </form>
  )
}
