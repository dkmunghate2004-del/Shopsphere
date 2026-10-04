import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Book, Dumbbell, Home as HomeIcon, Headphones, RotateCcw, Shirt, ShieldCheck, Truck } from 'lucide-react';
import api from '../api';
import Page from '../components/Page';
import ProductCard from '../components/ProductCard';
import { Img, Skeletons } from '../components/ui';

const CAT_ICONS = {
  Electronics: Headphones,
  Fashion: Shirt,
  'Home & Kitchen': HomeIcon,
  Books: Book,
  Sports: Dumbbell,
};

export default function Home() {
  const [featured, setFeatured] = useState(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    api.get('/products', { params: { featured: true, limit: 8 } }).then(({ data }) => setFeatured(data.products)).catch(() => setFeatured([]));
    api.get('/products/categories').then(({ data }) => setCategories(data.categories)).catch(() => {});
  }, []);

  return (
    <Page>
      <section className="hero">
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} style={{ position: 'relative', zIndex: 1 }}>
          <span className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', marginBottom: 16 }}>New season, new deals</span>
          <h1>Everything you love, one smooth checkout away.</h1>
          <p>Discover curated electronics, fashion, home essentials and more, with live order tracking from the moment you buy.</p>
          <div className="row wrap">
            <Link to="/products" className="btn btn-light">Shop now <ArrowRight size={18} /></Link>
            <Link to="/track" className="btn btn-outline">Track an order</Link>
          </div>
        </motion.div>
        <div className="hero-art">
          {[1, 4, 7, 9].map((n, i) => (
            <motion.div key={n} initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 + i * 0.1 }}>
              <Img src={`https://picsum.photos/seed/shopsphere-${n}-a/500/500`} alt="" />
            </motion.div>
          ))}
        </div>
      </section>

      <div className="perks">
        {[
          [Truck, 'Free shipping', 'On orders above ₹999'],
          [ShieldCheck, 'Secure checkout', 'Protected accounts and orders'],
          [RotateCcw, 'Easy cancellation', 'Cancel before it ships'],
        ].map(([Icon, t, d]) => (
          <div key={t} className="card perk">
            <span className="ico"><Icon size={22} /></span>
            <div><b>{t}</b><div className="muted" style={{ fontSize: '0.88rem' }}>{d}</div></div>
          </div>
        ))}
      </div>

      {categories.length > 0 && (
        <section className="section">
          <div className="section-head"><h2>Shop by category</h2></div>
          <div className="cat-grid">
            {categories.map((c) => {
              const Icon = CAT_ICONS[c] || HomeIcon;
              return (
                <Link key={c} to={`/products?category=${encodeURIComponent(c)}`} className="cat-tile">
                  <div className="ico"><Icon size={22} /></div>
                  {c}
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <section className="section">
        <div className="section-head">
          <h2>Featured products</h2>
          <Link to="/products" className="btn btn-ghost btn-sm">View all <ArrowRight size={16} /></Link>
        </div>
        {featured === null ? (
          <Skeletons n={4} />
        ) : featured.length === 0 ? (
          <p className="muted">No featured products yet. Run <code>npm run seed</code> in the server folder to add demo data.</p>
        ) : (
          <div className="grid-products">
            {featured.map((p, i) => <ProductCard key={p._id} product={p} index={i} />)}
          </div>
        )}
      </section>
    </Page>
  );
}
