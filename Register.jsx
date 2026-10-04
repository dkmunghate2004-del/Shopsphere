import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { errMsg } from '../api';
import Page from '../components/Page';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const from = useLocation().state?.from;
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={from || '/'} replace />;

  const bind = (k) => ({ value: form[k], onChange: (e) => setForm({ ...form, [k]: e.target.value }) });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    if (form.password !== form.confirm) return setError('Passwords do not match');
    setBusy(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Account created. Welcome to ShopSphere!');
      navigate(from || '/', { replace: true });
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
            <h1>Create your account</h1>
            <p className="muted">It takes less than a minute.</p>
          </div>
          <label className="field">Full name<input className="input" required autoComplete="name" {...bind('name')} /></label>
          <label className="field">Email<input className="input" type="email" required autoComplete="email" {...bind('email')} /></label>
          <label className="field">Password<input className="input" type="password" required minLength={6} autoComplete="new-password" {...bind('password')} /></label>
          <label className="field">Confirm password<input className="input" type="password" required autoComplete="new-password" {...bind('confirm')} /></label>
          {error && <div className="error-text" role="alert">{error}</div>}
          <button className="btn btn-primary btn-block" disabled={busy}>{busy ? 'Creating…' : 'Sign up'}</button>
          <p className="muted center">Already registered? <Link to="/login" state={{ from }} style={{ color: 'var(--primary)', fontWeight: 600 }}>Log in</Link></p>
        </form>
      </div>
    </Page>
  );
}
