import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import { LayoutDashboard, LogOut, Menu, Moon, Package, Search, ShoppingBag, ShoppingCart, Sun, User, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const { cart } = useCart();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [q, setQ] = useState(params.get('q') || '');
  const [menu, setMenu] = useState(false);
  const [mobile, setMobile] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const close = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenu(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const search = (e) => {
    e.preventDefault();
    navigate(`/products${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ''}`);
    setMobile(false);
  };

  const searchBox = (cls) => (
    <form className={cls} onSubmit={search} role="search">
      <Search size={18} />
      <input className="input" placeholder="Search products, brands, categories" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search products" />
    </form>
  );

  return (
    <header className="navbar">
      <div className="container">
        <div className="nav-inner">
          <Link to="/" className="logo" onClick={() => setMobile(false)}>
            <span className="logo-mark"><ShoppingBag size={20} /></span>
            <span>Shop<span className="grad">Sphere</span></span>
          </Link>

          {searchBox('nav-search')}

          <nav className={`nav-links ${mobile ? 'open' : ''}`} onClick={() => setMobile(false)}>
            <NavLink to="/products" className="nav-link">Shop</NavLink>
            {user && <NavLink to="/orders" className="nav-link">My Orders</NavLink>}
            {user && <NavLink to="/track" className="nav-link">Track Order</NavLink>}
            {isAdmin && <NavLink to="/admin" className="nav-link">Admin</NavLink>}
            {!user && <NavLink to="/login" className="nav-link">Login</NavLink>}
            {!user && <Link to="/register" className="btn btn-primary btn-sm">Sign up</Link>}
          </nav>

          <div className="row" style={{ gap: 8 }}>
            <button className="icon-btn" onClick={toggle} aria-label="Toggle dark mode" title="Toggle theme">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <Link to="/cart" className="icon-btn" aria-label="Cart">
              <ShoppingCart size={18} />
              <AnimatePresence>
                {cart.count > 0 && (
                  <motion.span key={cart.count} className="cart-count" initial={{ scale: 0.4 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                    {cart.count}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>

            {user && (
              <div className="menu-wrap" ref={menuRef}>
                <button className="icon-btn" onClick={() => setMenu((m) => !m)} aria-label="Account menu"><User size={18} /></button>
                <AnimatePresence>
                  {menu && (
                    <motion.div className="dropdown" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} onClick={() => setMenu(false)}>
                      <div className="who">
                        <b>{user.name}</b>
                        <div className="muted" style={{ fontSize: '0.8rem' }}>{user.email}</div>
                        <span className={`badge ${isAdmin ? '' : 'success'}`} style={{ marginTop: 6 }}>{user.role}</span>
                      </div>
                      <Link to="/profile"><User size={16} /> Profile</Link>
                      <Link to="/orders"><Package size={16} /> My Orders</Link>
                      {isAdmin && <Link to="/admin"><LayoutDashboard size={16} /> Admin Dashboard</Link>}
                      <button onClick={() => { logout(); navigate('/'); }}><LogOut size={16} /> Logout</button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            <button className="icon-btn hamburger" onClick={() => setMobile((m) => !m)} aria-label="Menu">
              {mobile ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
        {searchBox('mobile-search')}
      </div>
    </header>
  );
}
