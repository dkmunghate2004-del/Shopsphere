import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="logo" style={{ marginBottom: 10 }}>
              <span className="logo-mark"><ShoppingBag size={20} /></span>
              <span>Shop<span className="grad">Sphere</span></span>
            </div>
            <p className="muted" style={{ maxWidth: 360 }}>
              A full-stack demo store built with React, Node.js, Express and MongoDB.
            </p>
          </div>
          <div>
            <h4>Shop</h4>
            <ul>
              <li><Link to="/products">All products</Link></li>
              <li><Link to="/products?featured=true">Featured</Link></li>
              <li><Link to="/cart">Cart</Link></li>
            </ul>
          </div>
          <div>
            <h4>Account</h4>
            <ul>
              <li><Link to="/orders">My orders</Link></li>
              <li><Link to="/track">Track an order</Link></li>
              <li><Link to="/profile">Profile</Link></li>
            </ul>
          </div>
        </div>
        <p className="muted center" style={{ marginTop: 26, fontSize: '0.85rem' }}>
          © {new Date().getFullYear()} ShopSphere. Demo project, payments are simulated.
        </p>
      </div>
    </footer>
  );
}
