import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, MapPin, Search } from 'lucide-react';
import api, { errMsg } from '../api';
import Page from '../components/Page';
import { Img, OrderTimeline, StatusBadge } from '../components/ui';
import { fmtDate, money } from '../utils';

export default function OrderTracking() {
  const { trackingId } = useParams();
  const navigate = useNavigate();
  const justPlaced = useLocation().state?.justPlaced;
  const [input, setInput] = useState(trackingId || '');
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setOrder(null);
    setError('');
    if (!trackingId) return;
    setLoading(true);
    api
      .get(`/orders/track/${encodeURIComponent(trackingId)}`)
      .then(({ data }) => setOrder(data.order))
      .catch((e) => setError(errMsg(e)))
      .finally(() => setLoading(false));
  }, [trackingId]);

  const submit = (e) => {
    e.preventDefault();
    if (input.trim()) navigate(`/track/${input.trim().toUpperCase()}`);
  };

  return (
    <Page>
      <h1 className="page-title">Track your order</h1>
      <p className="page-sub">Enter your tracking ID (for example SS1A2B3C4D5E) to see where your package is.</p>

      <form className="row mb" onSubmit={submit} style={{ maxWidth: 520 }}>
        <input className="input" placeholder="Tracking ID" value={input} onChange={(e) => setInput(e.target.value)} aria-label="Tracking ID" />
        <button className="btn btn-primary"><Search size={18} /> Track</button>
      </form>

      {justPlaced && order && (
        <div className="card card-pad row mb" style={{ background: 'var(--success-soft)', borderColor: 'transparent' }}>
          <CheckCircle2 color="var(--success)" />
          <div>
            <b>Thank you! Your order has been placed.</b>
            <div className="muted">Save your tracking ID: <b className="num">{order.trackingId}</b></div>
          </div>
        </div>
      )}

      {loading && <div className="skeleton" style={{ height: 260 }} />}
      {error && <div className="card card-pad error-text">{error}</div>}

      {order && (
        <div className="two-col">
          <section className="card card-pad">
            <div className="row between wrap mb">
              <div>
                <h3 className="num">#{order.trackingId}</h3>
                <span className="muted" style={{ fontSize: '0.85rem' }}>Placed {fmtDate(order.createdAt, true)}</span>
              </div>
              <StatusBadge status={order.status} />
            </div>
            <OrderTimeline order={order} />
          </section>

          <aside style={{ display: 'grid', gap: 16 }}>
            <section className="card card-pad">
              <h4 className="mb">Items</h4>
              <div style={{ display: 'grid', gap: 12 }}>
                {order.items.map((i) => (
                  <div key={i.product + i.name} className="row">
                    <Img src={i.image} alt="" style={{ width: 48, height: 48, borderRadius: 10, objectFit: 'cover' }} />
                    <div className="grow" style={{ fontSize: '0.88rem' }}>{i.name}<div className="muted">Qty {i.quantity}</div></div>
                    <span className="num">{money(i.price * i.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="row between mt" style={{ borderTop: '1px dashed var(--border)', paddingTop: 12 }}>
                <b>Total ({order.paymentMethod}{order.isPaid ? ', paid' : ', pay on delivery'})</b>
                <b className="num">{money(order.totalPrice)}</b>
              </div>
            </section>
            <section className="card card-pad">
              <h4 className="row mb" style={{ gap: 8 }}><MapPin size={18} /> Delivery address</h4>
              <div className="muted" style={{ fontSize: '0.92rem' }}>
                <b style={{ color: 'var(--text)' }}>{order.shippingAddress.fullName}</b><br />
                {order.shippingAddress.street}<br />
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}<br />
                {order.shippingAddress.phone}
              </div>
            </section>
          </aside>
        </div>
      )}
    </Page>
  );
}
