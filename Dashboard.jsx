import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { IndianRupee, Package, ShoppingBag, Users } from 'lucide-react';
import api from '../../api';
import { StatusBadge } from '../../components/ui';
import { ALL_STATUSES, fmtDate, money } from '../../utils';

export default function Dashboard() {
  const [s, setS] = useState(null);

  useEffect(() => {
    api.get('/admin/stats').then(({ data }) => setS(data)).catch(() => setS(false));
  }, []);

  if (s === null) return <div className="skeleton" style={{ height: 360 }} />;
  if (s === false) return <div className="card card-pad error-text">Could not load dashboard stats.</div>;

  const max = Math.max(...s.last7.map((d) => d.revenue), 1);
  const cards = [
    [IndianRupee, 'Revenue', money(s.revenue)],
    [ShoppingBag, 'Orders', s.orders],
    [Package, 'Products', s.products],
    [Users, 'Customers', s.users],
  ];

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <div>
        <h1 className="page-title">Dashboard</h1>
        <p className="page-sub" style={{ marginBottom: 0 }}>A snapshot of your store.</p>
      </div>

      <div className="stat-grid">
        {cards.map(([Icon, label, value]) => (
          <div key={label} className="card stat">
            <span className="ico"><Icon size={22} /></span>
            <div><b>{value}</b><span className="muted">{label}</span></div>
          </div>
        ))}
      </div>

      <section className="card card-pad">
        <h3>Revenue, last 7 days</h3>
        <div className="bars">
          {s.last7.map((d) => (
            <div key={d.date} className="bar-col" title={`${d.orders} order(s)`}>
              <small className="num">{d.revenue ? money(d.revenue) : ''}</small>
              <div className="bar" style={{ height: `${(d.revenue / max) * 100}%` }} />
              <small>{new Date(d.date).toLocaleDateString('en-IN', { weekday: 'short' })}</small>
            </div>
          ))}
        </div>
      </section>

      <div className="two-col" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        <section className="card card-pad">
          <h3 className="mb">Orders by status</h3>
          <div style={{ display: 'grid', gap: 10 }}>
            {ALL_STATUSES.map((st) => (
              <div key={st} className="row between"><StatusBadge status={st} /><b className="num">{s.byStatus[st] || 0}</b></div>
            ))}
          </div>
        </section>
        <section className="card card-pad">
          <h3 className="mb">Low stock</h3>
          {s.lowStock.length === 0 ? <p className="muted">All products are well stocked.</p> : (
            <div style={{ display: 'grid', gap: 10 }}>
              {s.lowStock.map((p) => (
                <div key={p._id} className="row between">
                  <span>{p.name}</span>
                  <span className={`badge ${p.stock === 0 ? 'danger' : 'warn'}`}>{p.stock === 0 ? 'Sold out' : `${p.stock} left`}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="card">
        <div className="row between card-pad" style={{ paddingBottom: 0 }}>
          <h3>Recent orders</h3>
          <Link to="/admin/orders" className="btn btn-ghost btn-sm">Manage orders</Link>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Tracking ID</th><th>Customer</th><th>Date</th><th>Total</th><th>Status</th></tr></thead>
            <tbody>
              {s.recentOrders.map((o) => (
                <tr key={o._id}>
                  <td className="num">{o.trackingId}</td>
                  <td>{o.user?.name || 'Deleted user'}</td>
                  <td>{fmtDate(o.createdAt)}</td>
                  <td className="num">{money(o.totalPrice)}</td>
                  <td><StatusBadge status={o.status} /></td>
                </tr>
              ))}
              {s.recentOrders.length === 0 && <tr><td colSpan="5" className="muted center">No orders yet</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
