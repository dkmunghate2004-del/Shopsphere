import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { errMsg } from '../api';
import { discountPct, money } from '../utils';
import { Img, Stars } from './ui';

export default function ProductCard({ product, index = 0 }) {
  const { user } = useAuth();
  const { add } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const off = discountPct(product);

  const addToCart = async (e) => {
    e.preventDefault();
    if (!user) {
      toast('Please log in to add items to your cart');
      return navigate('/login', { state: { from: location.pathname + location.search } });
    }
    try {
      await add(product._id, 1);
      toast.success('Added to cart');
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  return (
    <motion.article
      className="card product-card"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index, 8) * 0.05, duration: 0.35 }}
    >
      <Link to={`/products/${product._id}`} className="pc-img">
        <Img src={product.images?.[0]} alt={product.name} />
        {off > 0 && <span className="badge success pc-tag">{off}% off</span>}
        {product.stock === 0 && <span className="badge danger pc-tag" style={{ left: 'auto', right: 12 }}>Sold out</span>}
      </Link>
      <div className="pc-body">
        <span className="muted" style={{ fontSize: '0.78rem' }}>{product.brand || product.category}</span>
        <h3><Link to={`/products/${product._id}`}>{product.name}</Link></h3>
        <Stars rating={product.rating} count={product.numReviews} />
        <div className="price-row">
          <span className="price">{money(product.price)}</span>
          {off > 0 && <span className="mrp">{money(product.mrp)}</span>}
        </div>
        <div className="pc-foot">
          <button className="btn btn-primary btn-sm btn-block" onClick={addToCart} disabled={product.stock === 0}>
            <ShoppingCart size={16} /> {product.stock === 0 ? 'Out of stock' : 'Add to cart'}
          </button>
        </div>
      </div>
    </motion.article>
  );
}
