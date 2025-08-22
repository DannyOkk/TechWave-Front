import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { paymentService } from '../services/paymentService';

export default function PaymentModal({ order, open, onClose, onCompleted }){
  const navigate = useNavigate();
  const [method, setMethod] = useState('tarjeta');
  const [brand, setBrand] = useState('visa');
  const [last4, setLast4] = useState('4242');
  const [holder, setHolder] = useState('');
  const [refId, setRefId] = useState('');
  const [proofUrl, setProofUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [payment, setPayment] = useState(null);

  useEffect(()=>{ setError(''); setPayment(null); setMethod('tarjeta'); setRefId(''); setProofUrl(''); }, [order?.id, open]);

  const disabled = useMemo(()=> loading, [loading]);
  if (!open || !order) return null;

  const ensurePayment = async () => {
    try {
      setLoading(true); setError('');
      if (method === 'paypal') {
        // Navegar a página dedicada
        onClose?.();
        navigate(`/orders/${order.id}/pay`);
        return;
      }
      const payload = { pedido: order.id, metodo: method };
      if (method === 'tarjeta') {
        payload.metadata = { brand, last4, holder };
      } else if (method === 'transferencia') {
        payload.metadata = { alias_mostrado: 'DannyOkk.NX' };
        if (refId) payload.external_id = refId;
        if (proofUrl) payload.comprobante_url = proofUrl;
      }
      const p = await paymentService.create(payload);
      setPayment(p);
    } catch (e) {
      setError(e?.response?.data?.detail || e.message || 'Error iniciando pago');
    } finally { setLoading(false); }
  };

  const complete = async () => {
    if (!payment) return;
    try { setLoading(true); setError(''); const done = await paymentService.complete(payment.id); setPayment(done); onCompleted?.(done); onClose?.(); }
    catch (e) { setError(e?.response?.data?.detail || e.message || 'No se pudo completar'); }
    finally { setLoading(false); }
  };
  const fail = async () => {
    if (!payment) return;
    try { setLoading(true); setError(''); const failed = await paymentService.fail(payment.id); setPayment(failed); }
    catch (e) { setError(e?.response?.data?.detail || e.message || 'No se pudo fallar'); }
    finally { setLoading(false); }
  };

  const hasAddress = Boolean(order?.direccion_envio);

  return (
    <div className="modal-backdrop" style={{position:'fixed', inset:0, background:'rgba(0,0,0,.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000}}>
      <div className="card" style={{width:'min(520px, 92vw)', padding:16}} role="dialog" aria-modal>
        <div className="h-stack" style={{justifyContent:'space-between', alignItems:'center'}}>
          <h3 style={{margin:0}}>Pagar pedido #{order.id}</h3>
          <button className="btn" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>
        {!hasAddress && (
          <div className="card" style={{marginTop:10, background:'#fffbe6', color:'#7a5e00', padding:10}}>
            ⚠️ Falta dirección de envío. Podés agregarla en tu perfil.
          </div>
        )}

        <div className="v-stack" style={{gap:10, marginTop:12}}>
          <div className="v-stack" style={{gap:6}}>
            <label>Método</label>
            <select value={method} onChange={(e)=> setMethod(e.target.value)} disabled={!!payment || disabled}>
              <option value="tarjeta">Tarjeta</option>
              <option value="transferencia">Transferencia</option>
              <option value="paypal">PayPal</option>
            </select>
          </div>

          {method === 'tarjeta' && (
            <div className="v-stack" style={{gap:8}}>
              <div className="h-stack" style={{gap:8}}>
                <div style={{flex:1}}>
                  <label>Marca</label>
                  <select value={brand} onChange={(e)=> setBrand(e.target.value)} disabled={!!payment || disabled}>
                    <option value="visa">Visa</option>
                    <option value="mastercard">Mastercard</option>
                    <option value="amex">Amex</option>
                  </select>
                </div>
                <div style={{flex:1}}>
                  <label>Últimos 4</label>
                  <input value={last4} onChange={(e)=> setLast4(e.target.value)} maxLength={4} disabled={!!payment || disabled} />
                </div>
              </div>
              <div>
                <label>Titular</label>
                <input value={holder} onChange={(e)=> setHolder(e.target.value)} disabled={!!payment || disabled} />
              </div>
            </div>
          )}

          {method === 'transferencia' && (
            <div className="v-stack" style={{gap:8}}>
              <div>
                <label>Alias (mostrar)</label>
                <input value={'DannyOkk.NX'} readOnly />
              </div>
              <div>
                <label>Referencia (opcional)</label>
                <input value={refId} onChange={(e)=> setRefId(e.target.value)} disabled={!!payment || disabled} />
              </div>
              <div>
                <label>Comprobante (URL opcional)</label>
                <input value={proofUrl} onChange={(e)=> setProofUrl(e.target.value)} disabled={!!payment || disabled} />
              </div>
            </div>
          )}

          {!payment ? (
            <button className="btn btn-primary" onClick={ensurePayment} disabled={disabled}>
              {method === 'paypal' ? 'Continuar a PayPal' : 'Generar intento de pago'}
            </button>
          ) : (
            <div className="h-stack" style={{gap:8}}>
              <button className="btn btn-primary" onClick={complete} disabled={disabled}>Completar</button>
              <button className="btn" onClick={fail} disabled={disabled}>Fallar</button>
            </div>
          )}

          {error && <div style={{color:'#c62828'}}>{error}</div>}
        </div>
      </div>
    </div>
  );
}
