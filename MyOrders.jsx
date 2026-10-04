import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PackageOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { errMsg } from '../api';
import Page from '../components/Page';
import { Empty, Img, StatusBadge } from '../components/ui';
import { fmtDate, money } from '../utils';

export default function MyOrders() {
  const [orders, setOrders] = useState(null);

  useEffect(() => {
    api.get('/orders/mine').then(({ data }) => setOrders(data.orders)).catch(() => setOrders([]));
  }, []);

  const cancel = async (id) => {
    if (!window.confirm('Cancel this order?')) return;
    try {
      const { data } = await api.put(`/orders/${id}/cancel`);
      setOrders((list) => list.map((o) => (o._id === id ? data.order : o)));
      toast.success('Order cancelled');
    } catch (e) {
      toast.error(errMsg(e));
    }
  };

  return (
    <Page>
      <h1 className="page-title">My orders</h1>
      <p className="page-sub">Track, review or cancel your purchases.</p>

      {orders === null ? (
        <div className="skeleton" style={{ height: 200 }} />
      ) : orders.length === 0 ? (
        <Empty icon={PackageOpen} title="No orders yet">
          <Link to="/products" className="btn btn-primary mt">Browse products</Link>
        </Empty>
      ) : (
        <div style={{ display: 'grid', gap: 16 }}>
          {orders.map((o) => (
            <article key={o._id} className="card order-card">
              <div className="row between wrap">
                <div>
                  <b className="num">#{o.trackingId}</b>
                  <div className="muted" style={{ fontSize: '0.85rem' }}>Placed {fmtDate(o.createdAt, true)}</div>
                </div>
                <StatusBadge status={o.status} />
              </div>
              <div className="order-items">
                {o.items.map((i) => <Img key={i.product + i.name} src={i.image} alt={i.name} title={`${i.name} × ${i.quantity}`} />)}
              </div>
              <div className="row between wrap">
                <span className="muted">{o.items.reduce((n, i) => n + i.quantity, 0)} item(s) · <b className="num" style={{ color: 'var(--text)' }}>{money(o.totalPrice)}</b></span>
                <div className="row">
                  {['Placed', 'Confirmed'].includes(o.status) && <button className="btn btn-danger btn-sm" onClick={() => cancel(o._id)}>Cancel order</button>}
                  <Link to={`/track/${o.trackingId}`} className="btn btn-primary btn-sm">Track order</Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </Page>
  );
}
