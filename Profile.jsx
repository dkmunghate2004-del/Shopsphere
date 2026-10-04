import { useState } from 'react';
import toast from 'react-hot-toast';
import api, { errMsg } from '../api';
import Page from '../components/Page';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user.name,
    phone: user.phone || '',
    street: user.address?.street || '',
    city: user.address?.city || '',
    state: user.address?.state || '',
    postalCode: user.address?.postalCode || '',
    country: user.address?.country || 'India',
  });
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '' });
  const [busy, setBusy] = useState(false);

  const bind = (k) => ({ value: form[k], onChange: (e) => setForm({ ...form, [k]: e.target.value }) });

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { name, phone, ...address } = form;
      const { data } = await api.put('/users/profile', { name, phone, address });
      updateUser(data.user);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    try {
      await api.put('/users/password', pw);
      setPw({ currentPassword: '', newPassword: '' });
      toast.success('Password changed');
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  return (
    <Page>
      <h1 className="page-title">My profile</h1>
      <p className="page-sub">{user.email} · <span className="badge">{user.role}</span></p>

      <div style={{ display: 'grid', gap: 20, maxWidth: 760 }}>
        <form className="card card-pad" onSubmit={save}>
          <h3 className="mb">Personal details</h3>
          <div className="form-grid">
            <label className="field">Full name<input className="input" required {...bind('name')} /></label>
            <label className="field">Phone<input className="input" type="tel" {...bind('phone')} /></label>
            <label className="field full">Street address<input className="input" {...bind('street')} /></label>
            <label className="field">City<input className="input" {...bind('city')} /></label>
            <label className="field">State<input className="input" {...bind('state')} /></label>
            <label className="field">PIN code<input className="input" {...bind('postalCode')} /></label>
            <label className="field">Country<input className="input" {...bind('country')} /></label>
          </div>
          <button className="btn btn-primary mt" disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</button>
        </form>

        <form className="card card-pad" onSubmit={changePassword}>
          <h3 className="mb">Change password</h3>
          <div className="form-grid">
            <label className="field">Current password<input className="input" type="password" required value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} /></label>
            <label className="field">New password<input className="input" type="password" required minLength={6} value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} /></label>
          </div>
          <button className="btn btn-ghost mt">Update password</button>
        </form>
      </div>
    </Page>
  );
}
