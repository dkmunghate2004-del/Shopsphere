import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, Users } from 'lucide-react';
import Page from '../../components/Page';

const links = [
  ['/admin', 'Dashboard', LayoutDashboard, true],
  ['/admin/products', 'Products', Package],
  ['/admin/orders', 'Orders', ShoppingBag],
  ['/admin/users', 'Users', Users],
];

export default function AdminLayout() {
  return (
    <Page>
      <div className="admin-layout">
        <nav className="card side" aria-label="Admin">
          {links.map(([to, label, Icon, end]) => (
            <NavLink key={to} to={to} end={end}><Icon size={18} /> {label}</NavLink>
          ))}
        </nav>
        <div style={{ minWidth: 0 }}><Outlet /></div>
      </div>
    </Page>
  );
}
