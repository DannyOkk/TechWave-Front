import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { orderService } from '../services/orderService';
import { paymentService } from '../services/paymentService';
import { API_ORIGIN } from '../services/api';
import ImageLightbox from '../components/ImageLightbox';

export default function PaymentPage(){
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: order } = useQuery({ queryKey:['order', id], queryFn: ()=> orderService.getById(id), enabled: !!id });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [payment, setPayment] = useState(null);

  // Formulario
  const [method, setMethod] = useState('tarjeta');
  // Tarjeta (capturar todo pero enviar solo no sensibles)
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardBrand, setCardBrand] = useState('visa');
  const [expMonth, setExpMonth] = useState('');
  const [expYear, setExpYear] = useState('');
  const [cvc, setCvc] = useState('');
  // Transferencia (solo op number y lectura de alias)
  const [opNumber, setOpNumber] = useState('');
  // Comprobante (aparece solo después de crear intento)
  const [proofUrl, setProofUrl] = useState('');
  const [proofFile, setProofFile] = useState(null);
  const [lightbox, setLightbox] = useState({ open:false, src:'' });

  // Reusar pago pendiente si existe al entrar
  useEffect(()=>{
    const run = async ()=>{
      try {
        setLoading(true); setError('');
        let list = await paymentService.list({ pedido: id, estado: 'pendiente' });
        let items = Array.isArray(list) ? list : (list?.results || []);
        if (items.length) { setPayment(items[0]); return; }
        // Si no hay pendiente, buscar en revisión
        list = await paymentService.list({ pedido: id, estado: 'en_revision' });
        items = Array.isArray(list) ? list : (list?.results || []);
        if (items.length) setPayment(items[0]);
      } catch (e){
        // ignorar
      } finally { setLoading(false); }
    };
    run();
  }, [id]);

  const hasAddress = Boolean(order?.direccion_envio && String(order.direccion_envio).trim().length > 0);
  const disabled = useMemo(()=> loading, [loading]);

  const startPayment = async ()=>{
    try {
      setLoading(true); setError('');
      let payload = { pedido: Number(id), metodo: method };
      if (method === 'tarjeta') {
        const digits = (cardNumber||'').replace(/\D/g, '');
        const last4 = digits.slice(-4);
        if (digits.length < 12) throw new Error('Número de tarjeta inválido');
        if (!cardHolder) throw new Error('Titular requerido');
        payload.metadata = { brand: cardBrand, last4, holder: cardHolder };
      } else if (method === 'transferencia') {
        payload.metadata = { alias_destino: 'DannyOkk.NX' };
        if (opNumber) payload.external_id = opNumber;
      } else if (method === 'paypal') {
        payload.external_redirect_url = 'https://www.paypal.com/checkoutnow?merchant=DannyOkk';
      }

      // Crear pago sin comprobante; el comprobante se adjunta luego
      const created = await paymentService.create(payload);
      setPayment(created);
    } catch (e) {
      setError(e?.response?.data?.detail || e.message || 'No se pudo iniciar el pago');
    } finally { setLoading(false); }
  };

  const sendProof = async ()=>{
    if (!payment) return;
    try {
      setLoading(true); setError('');
      const updated = await paymentService.proof(payment.id, { comprobante_url: proofUrl, comprobante_archivo: proofFile });
      setPayment(updated);
    } catch (e){
      setError(e?.response?.data?.detail || e.message || 'No se pudo enviar el comprobante');
    } finally { setLoading(false); }
  };

  const complete = async ()=>{
    if (!payment) return;
    try {
      setLoading(true); setError('');
      // Si aún está pendiente y hay comprobante, lo enviamos y luego finalizamos el flujo del usuario
      if (payment.estado === 'pendiente' && proofProvided) {
        await paymentService.proof(payment.id, { comprobante_url: proofUrl, comprobante_archivo: proofFile });
      }
      // En cualquier caso, volver a Mis pedidos (el admin revisará)
      navigate('/my-orders');
    } catch (e){
      setError(e?.response?.data?.detail || e.message || 'No se pudo completar');
    } finally { setLoading(false); }
  };
  const fail = async ()=>{
    if (!payment) return;
    try { setLoading(true); const faild = await paymentService.fail(payment.id); setPayment(faild); navigate('/my-orders'); }
    catch (e) { setError(e?.response?.data?.detail || e.message || 'No se pudo cancelar'); }
    finally { setLoading(false); }
  };

  const proofProvided = !!proofFile || (proofUrl && proofUrl.trim().length>0) || !!payment?.comprobante_archivo_url || !!payment?.comprobante_url;
  const step = !payment ? 1 : ((payment.estado==='en_revision' || proofProvided) ? 3 : 2);

  return (
    <div className="pay-section container v-stack" style={{gap:16, padding:'20px 16px', maxWidth:820}}>
      <div className="card" style={{padding:12}}>
        <div className="h-stack" style={{justifyContent:'space-between', alignItems:'center'}}>
          <div>
            <h2 style={{margin:0}}>Pagar pedido #{id}</h2>
            <div style={{opacity:.85, fontSize:14}}>Total: ${Number(order?.total||0).toLocaleString()} {order?.estado && `· Estado: ${order.estado}`}</div>
          </div>
          {payment && <span className="badge">{payment.estado}</span>}
        </div>
        {!hasAddress && (
          <div className="card" style={{marginTop:10, padding:10, background:'#fffbe6', color:'#7a5e00'}}>
            ⚠️ Falta dirección de envío. Podés agregarla en tu perfil.
          </div>
        )}
        <ol className="steps" style={{marginTop:12}}>
          <li className={step>=1? 'active':''}>Método</li>
          <li className={step>=2? 'active':''}>Intento</li>
          <li className={step>=3? 'active':''}>Comprobante</li>
          <li className={step>=4? 'active':''}>Listo</li>
        </ol>
      </div>

      <div className="v-stack" style={{gap:8}}>
        <label>Método de pago</label>
        <select className="input" value={method} onChange={(e)=> setMethod(e.target.value)} disabled={disabled || !!payment}>
          <option value="tarjeta">Tarjeta</option>
          <option value="transferencia">Transferencia</option>
          <option value="paypal">PayPal</option>
        </select>
      </div>

      {method === 'tarjeta' && (
        <div className="card" style={{padding:12, display:'grid', gap:8}}>
          <div className="h-stack" style={{gap:8}}>
            <div style={{flex:1}}>
              <label>Marca</label>
              <select className="input" value={cardBrand} onChange={(e)=> setCardBrand(e.target.value)} disabled={disabled || !!payment}>
                <option value="visa">Visa</option>
                <option value="mastercard">Mastercard</option>
                <option value="amex">Amex</option>
              </select>
            </div>
            <div style={{flex:2}}>
              <label>Número de tarjeta</label>
              <input className="input" value={cardNumber} onChange={(e)=> setCardNumber(e.target.value)} placeholder="0000 0000 0000 0000" disabled={disabled || !!payment} />
            </div>
          </div>
          <div className="h-stack" style={{gap:8}}>
            <div>
              <label>Vencimiento</label>
              <div className="h-stack" style={{gap:6}}>
                <input className="input" value={expMonth} onChange={(e)=> setExpMonth(e.target.value)} placeholder="MM" maxLength={2} style={{width:80}} disabled={disabled || !!payment} />
                <input className="input" value={expYear} onChange={(e)=> setExpYear(e.target.value)} placeholder="AA" maxLength={2} style={{width:80}} disabled={disabled || !!payment} />
              </div>
            </div>
            <div>
              <label>CVC</label>
              <input className="input" value={cvc} onChange={(e)=> setCvc(e.target.value)} placeholder="CVC" maxLength={4} style={{width:100}} disabled={disabled || !!payment} />
            </div>
            <div style={{flex:1}}>
              <label>Titular</label>
              <input className="input" value={cardHolder} onChange={(e)=> setCardHolder(e.target.value)} placeholder="Como figura en la tarjeta" disabled={disabled || !!payment} />
            </div>
          </div>
          <small style={{opacity:.75}}>Se guardarán solo datos no sensibles (marca, últimos 4 y titular).</small>
        </div>
      )}

      {method === 'transferencia' && (
    <div className="card" style={{padding:12, display:'grid', gap:8}}>
          <div>
            <label>ALIAS DE DESTINO</label>
      <input className="input" value={'DannyOkk.NX'} readOnly />
          </div>
          <div>
            <label>Número de operación (opcional)</label>
      <input className="input" value={opNumber} onChange={(e)=> setOpNumber(e.target.value)} disabled={disabled || !!payment} />
          </div>
        </div>
      )}

      {method === 'paypal' && (
  <div className="card" style={{padding:12}}>
          <p>Serás redirigido a PayPal para completar el pago.</p>
        </div>
      )}

      {!payment ? (
        <button className="btn btn-primary" onClick={startPayment} disabled={disabled}>Generar intento de pago</button>
      ) : (
        <>
          {/* Sección de comprobante aparece recién después de crear el intento */}
          <div className="card" style={{padding:12, display:'grid', gap:8}}>
            <div>
              <label>Comprobante (imagen o PDF) – opcional</label>
              <input className="input" type="file" accept="image/*,application/pdf" onChange={(e)=> setProofFile(e.target.files?.[0] || null)} disabled={disabled || payment.estado==='en_revision'} />
            </div>
            <div>
              <label>o URL del comprobante</label>
              <input className="input" value={proofUrl} onChange={(e)=> setProofUrl(e.target.value)} disabled={disabled || payment.estado==='en_revision'} />
            </div>
            <div className="pay-actions h-stack" style={{gap:8}}>
              <button className="btn" onClick={sendProof} disabled={disabled || payment.estado==='en_revision' || (!proofFile && !proofUrl)}>Enviar comprobante</button>
              {payment.estado === 'en_revision' && <span className="badge">En revisión por admin…</span>}
            </div>
            {(payment.comprobante_archivo_url || payment.comprobante_url) && (
              <div>
                <div style={{marginBottom:8}}><strong>Comprobante enviado:</strong></div>
                {payment.comprobante_archivo_url && (payment.comprobante_archivo_url.toLowerCase().endsWith('.pdf') ? (
                  <a href={payment.comprobante_archivo_url.startsWith('http')? payment.comprobante_archivo_url : `${API_ORIGIN}${payment.comprobante_archivo_url}`} target="_blank" rel="noreferrer">Ver PDF</a>
                ) : (
                  (()=>{
                    const src = payment.comprobante_archivo_url.startsWith('http')? payment.comprobante_archivo_url : `${API_ORIGIN}${payment.comprobante_archivo_url}`
                    return (
                      <img alt="comprobante" src={src} style={{maxWidth:'100%', cursor:'zoom-in'}} title="Click para ver grande" onClick={()=> setLightbox({ open:true, src })} />
                    )
                  })()
                ))}
                {!payment.comprobante_archivo_url && payment.comprobante_url && (
                  <a href={payment.comprobante_url} target="_blank" rel="noreferrer">Ver comprobante</a>
                )}
              </div>
            )}
          </div>

          <div className="pay-actions h-stack" style={{gap:8}}>
            {payment.metodo === 'paypal' && (
              <a className="btn btn-primary" href={payment.external_redirect_url || 'https://www.paypal.com/checkoutnow?merchant=DannyOkk'} target="_blank" rel="noreferrer">Ir a PayPal</a>
            )}
            {/* Completar se habilita solo después de adjuntar comprobante o si ya está en revisión; bloqueado para PayPal */}
            <button className="btn btn-primary" onClick={complete} disabled={disabled || (!proofProvided && payment.estado!=='en_revision')}>Completar</button>
            <button className="btn" onClick={fail} disabled={disabled}>Cancelar</button>
            <button className="btn" onClick={()=> navigate(`/orders/${id}`)}>Volver al pedido</button>
          </div>
        </>
      )}

  {error && <div className="card" style={{color:'#c62828', background:'#fff1f1', padding:10}}>{error}</div>}
  <ImageLightbox open={lightbox.open} src={lightbox.src} onClose={()=> setLightbox({ open:false, src:'' })} />
    </div>
  );
}
