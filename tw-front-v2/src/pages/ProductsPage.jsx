import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { productService } from '../services/productService';
import { API_ORIGIN } from '../services/api';
import { categoryService } from '../services/categoryService';
import { cartService } from '../services/cartService';
import useFavorites from '../hooks/useFavorite';

export default function ProductsPage(){
  const [addingId, setAddingId] = useState(null);
  const [params, setParams] = useSearchParams();
  const sort = params.get('sort') || '';
  const cat = params.get('cat') || '';
  const q = params.get('q') || '';

  const { data: products, isLoading, isError } = useQuery({
    queryKey: ['products'],
    queryFn: productService.getAll,
  });
  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: categoryService.getAll });
  const { isFavorite, toggle: toggleFavorite } = useFavorites();

  const filtered = useMemo(()=>{
    let list = Array.isArray(products) ? products : [];
    if (q) list = list.filter(p => `${p.nombre} ${p.descripcion}`.toLowerCase().includes(q.toLowerCase()));
    if (cat) list = list.filter(p => (p.categoria?.nombre || '').toLowerCase() === cat.toLowerCase());
    if (sort === 'price_asc') list = [...list].sort((a,b)=> Number(a.precio) - Number(b.precio));
    if (sort === 'price_desc') list = [...list].sort((a,b)=> Number(b.precio) - Number(a.precio));
    if (sort === 'name_asc') list = [...list].sort((a,b)=> a.nombre.localeCompare(b.nombre));
    return list;
  }, [products, sort, cat, q]);

  const handleSort = (e)=> setParams(prev=>{ const p = new URLSearchParams(prev); const v=e.target.value; v? p.set('sort', v): p.delete('sort'); return p; });
  const handleCat = (e)=> setParams(prev=>{ const p = new URLSearchParams(prev); const v=e.target.value; v? p.set('cat', v): p.delete('cat'); return p; });

  return (
    <div className="v-stack" style={{gap:16, alignItems:'center'}}>
  {/* Aviso visual se maneja con popover del carrito en header */}
      <div className="toolbar" style={{justifyContent:'center', width:'100%', maxWidth:900}}>
        <h2 style={{margin:'8px 0'}}>Productos</h2>
        <div className="h-stack" style={{gap:8}}>
          <select value={sort} onChange={handleSort} style={{padding:'8px 10px', borderRadius:10, background:'var(--bg-tertiary)', color:'var(--text-primary)', border:'1px solid var(--border-light)'}}>
            <option value="">Ordenar</option>
            <option value="price_asc">Precio ↑</option>
            <option value="price_desc">Precio ↓</option>
            <option value="name_asc">Nombre A‑Z</option>
          </select>
          <select value={cat} onChange={handleCat} style={{padding:'8px 10px', borderRadius:10, background:'var(--bg-tertiary)', color:'var(--text-primary)', border:'1px solid var(--border-light)'}}>
            <option value="">Categoría</option>
            {(Array.isArray(categories)?categories:[]).map(c=> (
              <option key={c.id} value={(c.nombre||'').toLowerCase()}>{c.nombre}</option>
            ))}
          </select>
        </div>
      </div>
      {isLoading && <div style={{textAlign:'center', padding:20}}>Cargando productos…</div>}
      {isError && <div style={{textAlign:'center', padding:20}}>Error al cargar productos.</div>}
    {!isLoading && !isError && (
    <div className="row-cards products-tiles">
  {filtered.map((p)=> (
      <div key={p.id} className="card" style={{padding:12}}>
            <div className="relative">
              <Link to={`/products/${p.id}`}>
                <img src={(p.imagen || (p.imagen_url ? (p.imagen_url.startsWith('http') ? p.imagen_url : `${API_ORIGIN}${p.imagen_url}`) : '/assets/products/laptop.svg'))} alt={p.nombre} className="img-skel" style={{objectFit:'cover', width:'100%'}} />
              </Link>
              <button
                className="fav-btn"
                title={isFavorite(p.id) ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                aria-label={isFavorite(p.id) ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                aria-pressed={isFavorite(p.id)}
                onClick={async (e)=> { e.preventDefault(); e.stopPropagation(); await toggleFavorite(p.id); }}
                style={isFavorite(p.id) ? { background:'rgba(0,0,0,.5)', color:'#ff4d4f', borderColor:'rgba(255,77,79,.6)' } : undefined}
              >❤</button>
            </div>
            <div style={{marginTop:10}}>
              <div style={{fontWeight:600}}><Link to={`/products/${p.id}`}>{p.nombre}</Link></div>
              <div className="price">${Number(p.precio).toLocaleString()}</div>
            </div>
            <button className="btn btn-primary" style={{marginTop:10}} disabled={addingId===p.id}
              onClick={async ()=>{
                try {
                  setAddingId(p.id);
                  await cartService.addProduct(p.id, 1);
                  window.dispatchEvent(new CustomEvent('cart:add:success', { detail: { msg: 'Producto agregado al carrito' }}));
                } catch (e){
                  // Sin toast de error: mantener UI limpia
                } finally {
                  setAddingId(null);
                }
              }}
            >{addingId===p.id? 'Agregando…' : 'Agregar'}</button>
          </div>
        ))}
      </div>
      )}
    </div>
  )
}
