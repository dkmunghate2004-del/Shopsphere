import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Banknote, CreditCard, Smartphone } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { errMsg } from '../api';
import Page from '../components/Page';
import { Empty, Img } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { calcTotals, money } from '../utils';

const PAYMENTS = [
  ['COD', 'Cash on delivery', Banknote],
  ['UPI', 'UPI (simulated)', Smartphone],
  ['CARD', 'Credit / debit card (simulated)', CreditCard],
];

export default function Checkout() {
  const { user } = useAuth();
  const { cart, clear } = useCart();
  const navigate = useNavigate();
  const a = user.address || {};
  const [form, setForm] = useState({
    fullName: user.name || '',
    phone: user.phone || '',
    street: a.street || '',
    city: a.city || '',
    state: a.state || '',
    postalCode: a.postalCode || '',
    country: a.country || 'India',
  });
  const [payment, setPayment] = useState('COD');
  const [busy, setBusy] = useState(false);
  const { shipping, tax, total } = calcTotals(cart.itemsPrice);

  const bind = (k) => ({ value: form[k], onChange: (e) => setForm({ ...form, [k]: e.target.value }), required: true });

  if (cart.items.length === 0 && !busy) {
    return (
      <Page>
        <Empty title="Nothing to check out">
          Your cart is empty. <Link to="/products" style={{ color: 'var(--primary)' }}>Browse products</Link>
        </Empty>
      </Page>
    );
  }

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data } = await api.post('/orders', { shippingAddress: form, paymentMethod: payment });
      clear();
      toast.success('Order placed!');
      navigate(`/track/${data.order.trackingId}`, { state: { justPlaced: true } });
    } catch (err) {
      toast.error(errMsg(err));
      setBusy(false);
    }
  };

  return (
    <Page>
      <h1 className="page-title">Checkout</h1>
      <p className="page-sub">Confirm your delivery details and payment method.</p>

      <form className="two-col" onSubmit={submit}>
        <div style={{ display: 'grid', gap: 20 }}>
          <section className="card card-pad">
            <h3 className="mb">Shipping address</h3>
            <div className="form-grid">
              <label className="field">Full name<input className="input" {...bind('fullName')} /></label>
              <label className="field">Phone<input className="input" type="tel" {...bind('phone')} /></label>
              <label className="field full">Street address<input className="input" {...bind('street')} /></label>
              <label className="field">City<input className="input" {...bind('city')} /></label>
              <label className="field">State<input className="input" {...bind('state')} /></label>
              <label className="field">PIN code<input className="input" {...bind('postalCode')} /></label>
              <label className="field">Country<input className="input" {...bind('country')} /></label>
            </div>
          </section>

          <section className="card card-pad">
            <h3 className="mb">Payment method</h3>
            <div style={{ display: 'grid', gap: 10 }}>
              {PAYMENTS.map(([val, label, Icon]) => (
                <label key={val} className={`pay-opt ${payment === val ? 'on' : ''}`}>
                  <input type="radio" name="pay" checked={payment === val} onChange={() => setPayment(val)} />
                  <Icon size={20} /> {label}
                </label>
              ))}
            </div>
            <p className="muted mt" style={{ fontSize: '0.85rem' }}>No real payment is processed. Card and UPI are marked as paid for demo purposes.</p>
          </section>
        </div>

        <aside className="card summary">
          <h3>Your order</h3>
          {cart.items.map(({ product, quantity, lineTotal }) => (
            <div key={product._id} className="row" style={{ alignItems: 'flex-start' }}>
              <Img src={product.images?.[0]} alt="" style={{ width: 52, height: 52, borderRadius: 10, objectFit: 'cover' }} />
              <div className="grow" style={{ fontSize: '0.88rem' }}>{product.name}<div className="muted">Qty {quantity}</div></div>
              <span className="num">{money(lineTotal)}</span>
            </div>
          ))}
          <div className="line"><span>Subtotal</span><span className="num">{money(cart.itemsPrice)}</span></div>
          <div className="line"><span>Shipping</span><span className="num">{shipping === 0 ? 'Free' : money(shipping)}</span></div>
          <div className="line"><span>GST (18%)</span><span className="num">{money(tax)}</span></div>
          <div className="line total"><b>Total</b><b className="num">{money(total)}</b></div>
          <button className="btn btn-primary btn-block" disabled={busy}>{busy ? 'Placing order…' : `Place order · ${money(total)}`}</button>
        </aside>
      </form>
    </Page>
  );
}
