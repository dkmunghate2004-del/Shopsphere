import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { errMsg } from '../api';
import Page from '../components/Page';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from;
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={from || '/'} replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const u = await login(form.email, form.password);
      toast.success(`Welcome back, ${u.name.split(' ')[0]}!`);
      navigate(from || (u.role === 'admin' ? '/admin' : '/'), { replace: true });
    } catch (err) {
      setError(errMsg(err));
      setBusy(false);
    }
  };

  return (
    <Page>
      <div className="auth-wrap">
        <form className="card auth-card" onSubmit={submit} style={{ display: 'grid', gap: 16 }}>
          <div>
            <h1>Welcome back</h1>
            <p className="muted">Log in to continue shopping.</p>
          </div>
          <label className="field">Email<input className="input" type="email" required autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
          <label className="field">Password<input className="input" type="password" required autoComplete="current-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>
          {error && <div className="error-text" role="alert">{error}</div>}
          <button className="btn btn-primary btn-block" disabled={busy}>{busy ? 'Logging in…' : 'Log in'}</button>

          <div className="row wrap" style={{ gap: 8 }}>
            <button type="button" className="btn btn-ghost btn-sm grow" onClick={() => setForm({ email: 'user@shopsphere.com', password: 'User@123' })}>Fill demo user</button>
            <button type="button" className="btn btn-ghost btn-sm grow" onClick={() => setForm({ email: 'admin@shopsphere.com', password: 'Admin@123' })}>Fill demo admin</button>
          </div>
          <p className="muted center">New here? <Link to="/register" state={{ from }} style={{ color: 'var(--primary)', fontWeight: 600 }}>Create an account</Link></p>
        </form>
      </div>
    </Page>
  );
}
