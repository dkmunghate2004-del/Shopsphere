import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api, { errMsg } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { fmtDate } from '../../utils';

export default function UserManagement() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState(null);

  useEffect(() => {
    api.get('/users').then(({ data }) => setUsers(data.users)).catch(() => setUsers([]));
  }, []);

  const setRole = async (u, role) => {
    try {
      const { data } = await api.put(`/users/${u._id}/role`, { role });
      setUsers((list) => list.map((x) => (x._id === u._id ? data.user : x)));
      toast.success(`${u.name} is now ${role}`);
    } catch (e) {
      toast.error(errMsg(e));
    }
  };

  const remove = async (u) => {
    if (!window.confirm(`Delete ${u.name}'s account?`)) return;
    try {
      await api.delete(`/users/${u._id}`);
      setUsers((list) => list.filter((x) => x._id !== u._id));
      toast.success('User deleted');
    } catch (e) {
      toast.error(errMsg(e));
    }
  };

  return (
    <div style={{ display: 'grid', gap: 18 }}>
      <div>
        <h1 className="page-title">Users</h1>
        <p className="page-sub" style={{ marginBottom: 0 }}>Manage customer and admin accounts.</p>
      </div>
      <div className="card table-wrap">
        <table>
          <thead><tr><th>Name</th><th>Email</th><th>Joined</th><th>Role</th><th></th></tr></thead>
          <tbody>
            {users === null && <tr><td colSpan="5"><div className="skeleton" style={{ height: 40 }} /></td></tr>}
            {users?.map((u) => (
              <tr key={u._id}>
                <td><b>{u.name}</b>{u._id === me._id && <span className="badge" style={{ marginLeft: 8 }}>You</span>}</td>
                <td>{u.email}</td>
                <td>{fmtDate(u.createdAt)}</td>
                <td>
                  <select className="select" style={{ width: 120 }} value={u.role} disabled={u._id === me._id} onChange={(e) => setRole(u, e.target.value)}>
                    <option value="user">user</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button className="btn btn-danger btn-sm" disabled={u._id === me._id} onClick={() => remove(u)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
