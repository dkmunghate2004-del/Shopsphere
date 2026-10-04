import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ admin = false }) {
  const { user, ready, isAdmin } = useAuth();
  const location = useLocation();

  if (!ready) {
    return (
      <div className="container page">
        <div className="skeleton" style={{ height: 240 }} />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  if (admin && !isAdmin) return <Navigate to="/" replace />;
  return <Outlet />;
}
