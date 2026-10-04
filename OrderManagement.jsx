import { Fragment, useCallback, useEffect, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { errMsg } from '../../api';
import { StatusBadge } from '../../components/ui';
import { ALL_STATUSES, fmtDate, money } from '../../utils';

export default function OrderManagement() {
  const [orders, setOrders] = useState(null);
  const [status, setStatus] = useState('all');
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(null);

  const load = useCallback(() => {
    api.get('/orders/admin/all', { params: { status, q } }).then(({ data }) => setOrders(data.orders)).catch(() => setOrders([]));
  }, [status, q]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  const update = async (order, next) => {
    if (next === order.status) return;
    if (next === 'Cancelled' && !window.confirm('Cancel this order and return the items to stock?')) return;
    try {
      const { data } = await api.put(`/orders/${order._id}/status`, { status: next });
      setOrders((list) => list.map((o) => (o._id === order._id ? { ...data.order, user: o.user } : o)));
      toast.success(`Marked as ${next}`);
    } catch (e) {
      toast.error(errMsg(e));
    }
  };

  const closed = (o) => ['Delivered', 'Cancelled'].includes(o.status);

  return (
    <div style={{ display: 'grid', gap: 18 }}>
      <div>
        <h1 className="page-title">Orders</h1>
        <p className="page-sub" style={{ marginBottom: 0 }}>Review and update the status of customer orders.</p>
      </div>

      <div className="row wrap between">
        <div className="tabs">
          {['all', ...ALL_STATUSES].map((s) => (
            <button key={s} className={`chip ${status === s ? 'on' : ''}`} onClick={() => setStatus(s)}>{s === 'all' ? 'All' : s}</button>
          ))}
        </div>
        <input className="input" style={{ maxWidth: 240 }} placeholder="Search tracking ID" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      <div className="card table-wrap">
        <table>
          <thead><tr><th></th><th>Tracking ID</th><th>Customer</th><th>Date</th><th>Total</th><th>Payment</th><th>Status</th><th>Update</th></tr></thead>
          <tbody>
            {orders === null && <tr><td colSpan="8"><div className="skeleton" style={{ height: 40 }} /></td></tr>}
            {orders?.map((o) => (
              <Fragment key={o._id}>
                <tr>
                  <td><button className="icon-btn" style={{ width: 32, height: 32 }} onClick={() => setOpen(open === o._id ? null : o._id)} aria-label="Toggle details">{open === o._id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</button></td>
                  <td className="num">{o.trackingId}</td>
                  <td>{o.user?.name || 'Deleted user'}<div className="muted" style={{ fontSize: '0.78rem' }}>{o.user?.email}</div></td>
                  <td>{fmtDate(o.createdAt)}</td>
                  <td className="num">{money(o.totalPrice)}</td>
                  <td>{o.paymentMethod} {o.isPaid ? <span className="badge success">Paid</span> : <span className="badge warn">Due</span>}</td>
                  <td><StatusBadge status={o.status} /></td>
                  <td>
                    <select className="select" style={{ minWidth: 150 }} value={o.status} disabled={closed(o)} onChange={(e) => update(o, e.target.value)} aria-label="Update status">
                      {ALL_STATUSES.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
                {open === o._id && (
                  <tr>
                    <td colSpan="8" style={{ background: 'var(--surface-2)' }}>
                      <div className="form-grid">
                        <div>
                          <b>Items</b>
                          {o.items.map((i) => <div key={i.product + i.name} className="muted">{i.quantity} × {i.name} · {money(i.price)}</div>)}
                        </div>
                        <div>
                          <b>Ship to</b>
                          <div className="muted">
                            {o.shippingAddress.fullName}, {o.shippingAddress.phone}<br />
                            {o.shippingAddress.street}, {o.shippingAddress.city}, {o.shippingAddress.state} {o.shippingAddress.postalCode}
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
            {orders?.length === 0 && <tr><td colSpan="8" className="muted center">No orders match</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
