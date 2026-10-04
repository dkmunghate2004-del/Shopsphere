import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, ShoppingCart, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { errMsg } from '../api';
import Page from '../components/Page';
import ProductCard from '../components/ProductCard';
import { Empty, Img, Stars } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { discountPct, money } from '../utils';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { add } = useCart();
  const [state, setState] = useState({ loading: true });
  const [img, setImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setState({ loading: true });
    setImg(0);
    setQty(1);
    api
      .get(`/products/${id}`)
      .then(({ data }) => setState({ product: data.product, related: data.related }))
      .catch((e) => setState({ error: errMsg(e) }));
  }, [id]);

  if (state.loading) return <Page><div className="skeleton" style={{ height: 480 }} /></Page>;
  if (state.error) return <Page><Empty title="Product not found">{state.error}</Empty></Page>;

  const { product, related } = state;
  const off = discountPct(product);
  const soldOut = product.stock === 0;

  const requireLogin = () => {
    toast('Please log in first');
    navigate('/login', { state: { from: location.pathname } });
  };

  const addToCart = async (goCheckout = false) => {
    if (!user) return requireLogin();
    setBusy(true);
    try {
      await add(product._id, qty);
      if (goCheckout) navigate('/checkout');
      else toast.success(`${qty} added to cart`);
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Page>
      <Link to="/products" className="row muted mb" style={{ gap: 4 }}><ChevronLeft size={18} /> Back to products</Link>
      <div className="pd">
        <div>
          <div className="gallery-main"><Img src={product.images?.[img]} alt={product.name} /></div>
          {product.images?.length > 1 && (
            <div className="thumbs">
              {product.images.map((src, i) => (
                <button key={src + i} className={`thumb ${i === img ? 'on' : ''}`} onClick={() => setImg(i)} aria-label={`Image ${i + 1}`}>
                  <Img src={src} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gap: 16, alignContent: 'start' }}>
          <div className="row wrap">
            <span className="badge">{product.category}</span>
            {product.brand && <span className="muted">by {product.brand}</span>}
          </div>
          <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.1rem)' }}>{product.name}</h1>
          <Stars rating={product.rating} count={product.numReviews} />
          <div className="price-row">
            <span className="price" style={{ fontSize: '2rem' }}>{money(product.price)}</span>
            {off > 0 && <><span className="mrp">{money(product.mrp)}</span><span className="off">{off}% off</span></>}
          </div>
          <p className="muted">{product.description}</p>

          {soldOut ? (
            <span className="badge danger" style={{ width: 'fit-content' }}>Out of stock</span>
          ) : (
            <span className={`badge ${product.stock <= 5 ? 'warn' : 'success'}`} style={{ width: 'fit-content' }}>
              {product.stock <= 5 ? `Only ${product.stock} left` : 'In stock'}
            </span>
          )}

          <div className="row wrap">
            <div className="qty">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease">−</button>
              <span>{qty}</span>
              <button onClick={() => setQty((q) => Math.min(product.stock || 1, q + 1))} aria-label="Increase">+</button>
            </div>
            <button className="btn btn-primary" disabled={soldOut || busy} onClick={() => addToCart(false)}>
              <ShoppingCart size={18} /> Add to cart
            </button>
            <button className="btn btn-ghost" disabled={soldOut || busy} onClick={() => addToCart(true)}>
              <Zap size={18} /> Buy now
            </button>
          </div>
        </div>
      </div>

      {related?.length > 0 && (
        <section className="section">
          <div className="section-head"><h2>You may also like</h2></div>
          <div className="grid-products">
            {related.map((p, i) => <ProductCard key={p._id} product={p} index={i} />)}
          </div>
        </section>
      )}
    </Page>
  );
}
