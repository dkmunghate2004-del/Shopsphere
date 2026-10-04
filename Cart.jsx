import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { errMsg } from '../api';
import Page from '../components/Page';
import { Empty, Img } from '../components/ui';
import { useCart } from '../context/CartContext';
import { FREE_SHIPPING_ABOVE, calcTotals, money } from '../utils';

export default function Cart() {
  const { cart, loading, setQty, remove } = useCart();
  const navigate = useNavigate();
  const { shipping, tax, total } = calcTotals(cart.itemsPrice);

  const run = async (fn) => {
    try {
      await fn();
    } catch (e) {
      toast.error(errMsg(e));
    }
  };

  if (!loading && cart.items.length === 0) {
    return (
      <Page>
        <Empty icon={ShoppingCart} title="Your cart is empty">
          <Link to="/products" className="btn btn-primary mt">Start shopping</Link>
        </Empty>
      </Page>
    );
  }

  return (
    <Page>
      <h1 className="page-title">Shopping cart</h1>
      <p className="page-sub">{cart.count} item{cart.count === 1 ? '' : 's'}</p>

      <div className="two-col">
        <div className="card">
          {cart.items.map(({ product, quantity, lineTotal }) => (
            <div className="cart-line" key={product._id}>
              <Link to={`/products/${product._id}`}><Img src={product.images?.[0]} alt={product.name} /></Link>
              <div>
                <Link to={`/products/${product._id}`}><b>{product.name}</b></Link>
                <div className="muted" style={{ fontSize: '0.85rem' }}>{product.brand || product.category}</div>
                <div className="num" style={{ marginTop: 4 }}>{money(product.price)}</div>
                {product.stock < quantity && <span className="error-text">Only {product.stock} left, please reduce quantity</span>}
              </div>
              <div className="line-end" style={{ textAlign: 'right', display: 'grid', gap: 10, justifyItems: 'end' }}>
                <div className="qty">
                  <button onClick={() => quantity > 1 && run(() => setQty(product._id, quantity - 1))} aria-label="Decrease">−</button>
                  <span>{quantity}</span>
                  <button onClick={() => run(() => setQty(product._id, quantity + 1))} aria-label="Increase">+</button>
                </div>
                <b className="num">{money(lineTotal)}</b>
                <button className="btn btn-danger btn-sm" onClick={() => run(() => remove(product._id))}><Trash2 size={14} /> Remove</button>
              </div>
            </div>
          ))}
        </div>

        <aside className="card summary">
          <h3>Order summary</h3>
          <div className="line"><span>Subtotal</span><span className="num">{money(cart.itemsPrice)}</span></div>
          <div className="line"><span>Shipping</span><span className="num">{shipping === 0 ? 'Free' : money(shipping)}</span></div>
          <div className="line"><span>GST (18%)</span><span className="num">{money(tax)}</span></div>
          {shipping > 0 && <small className="muted">Add {money(FREE_SHIPPING_ABOVE - cart.itemsPrice)} more for free shipping</small>}
          <div className="line total"><b>Total</b><b className="num">{money(total)}</b></div>
          <button className="btn btn-primary btn-block" onClick={() => navigate('/checkout')} disabled={cart.items.some((i) => i.product.stock < i.quantity)}>
            Proceed to checkout
          </button>
        </aside>
      </div>
    </Page>
  );
}
