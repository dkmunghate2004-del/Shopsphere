import { Check, Package, Star, Truck, Home as HomeIcon, ClipboardCheck, Boxes, XCircle } from 'lucide-react';
import { STEPS, fmtDate, statusTone } from '../utils';

const FALLBACK =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1d4ed8"/><stop offset="1" stop-color="#60a5fa"/></linearGradient></defs><rect width="400" height="400" fill="url(#g)"/><text x="200" y="215" font-size="60" text-anchor="middle" fill="white" font-family="sans-serif">SS</text></svg>`
  );

export function Img({ src, alt = '', ...rest }) {
  return (
    <img
      src={src || FALLBACK}
      alt={alt}
      loading="lazy"
      onError={(e) => {
        if (e.currentTarget.src !== FALLBACK) e.currentTarget.src = FALLBACK;
      }}
      {...rest}
    />
  );
}

export function Stars({ rating = 0, count = 0 }) {
  if (!rating) return <span className="stars muted">No ratings yet</span>;
  return (
    <span className="stars">
      <Star size={14} /> <b className="num" style={{ color: 'var(--text)' }}>{rating.toFixed(1)}</b>
      {count > 0 && <span>({count.toLocaleString('en-IN')})</span>}
    </span>
  );
}

export function StatusBadge({ status }) {
  return <span className={`badge ${statusTone(status)}`}>{status}</span>;
}

export function Empty({ icon: Icon = Package, title, children }) {
  return (
    <div className="empty">
      <Icon size={44} />
      <h3 style={{ color: 'var(--text)', marginBottom: 6 }}>{title}</h3>
      <div>{children}</div>
    </div>
  );
}

export function Skeletons({ n = 8, height = 340 }) {
  return (
    <div className="grid-products">
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} className="skeleton" style={{ height }} />
      ))}
    </div>
  );
}

const STEP_ICONS = {
  Placed: ClipboardCheck,
  Confirmed: Check,
  Packed: Boxes,
  Shipped: Truck,
  'Out for Delivery': Truck,
  Delivered: HomeIcon,
};

export function OrderTimeline({ order }) {
  if (order.status === 'Cancelled') {
    const when = order.statusHistory.find((h) => h.status === 'Cancelled')?.at;
    return (
      <div className="row" style={{ gap: 14 }}>
        <span className="tl-dot" style={{ background: 'var(--danger-soft)', color: 'var(--danger)', borderColor: 'transparent' }}>
          <XCircle size={18} />
        </span>
        <div>
          <b>Order cancelled</b>
          {when && <div className="muted" style={{ fontSize: '0.85rem' }}>{fmtDate(when, true)}</div>}
        </div>
      </div>
    );
  }
  const currentIdx = STEPS.indexOf(order.status);
  return (
    <div className="timeline">
      {STEPS.map((step, i) => {
        const Icon = STEP_ICONS[step];
        const entry = [...order.statusHistory].reverse().find((h) => h.status === step);
        const cls = i <= currentIdx ? 'done' : '';
        return (
          <div key={step} className={`tl-step ${cls} ${i === currentIdx ? 'current' : ''}`}>
            <span className="tl-dot">{i <= currentIdx ? <Icon size={16} /> : <span style={{ fontSize: 12 }}>{i + 1}</span>}</span>
            <div>
              <h4>{step}</h4>
              {entry && (
                <small>
                  {fmtDate(entry.at, true)}
                  {entry.note ? ` · ${entry.note}` : ''}
                </small>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
