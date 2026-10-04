import { useCallback, useEffect, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { errMsg } from '../../api';
import { Img } from '../../components/ui';
import { money } from '../../utils';

const BLANK = { name: '', description: '', brand: '', category: '', price: '', mrp: '', stock: '', images: '', featured: false };

export default function ProductManagement() {
  const [products, setProducts] = useState(null);
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState(null); // null | 'new' | product
  const [form, setForm] = useState(BLANK);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    api.get('/products', { params: { q, limit: 60, sort: 'newest' } }).then(({ data }) => setProducts(data.products)).catch(() => setProducts([]));
  }, [q]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  const openForm = (p) => {
    setEditing(p || 'new');
    setForm(p ? { ...p, images: (p.images || []).join('\n'), mrp: p.mrp || '' } : BLANK);
  };

  const bind = (k) => ({ value: form[k], onChange: (e) => setForm({ ...form, [k]: e.target.value }) });

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    const payload = {
      name: form.name,
      description: form.description,
      brand: form.brand,
      category: form.category,
      price: Number(form.price),
      mrp: Number(form.mrp) || 0,
      stock: Number(form.stock),
      featured: !!form.featured,
      images: String(form.images).split(/[\n,]/).map((s) => s.trim()).filter(Boolean),
    };
    try {
      if (editing === 'new') await api.post('/products', payload);
      else await api.put(`/products/${editing._id}`, payload);
      toast.success(editing === 'new' ? 'Product created' : 'Product updated');
      setEditing(null);
      load();
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  const del = async (p) => {
    if (!window.confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/products/${p._id}`);
      toast.success('Product deleted');
      load();
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  return (
    <div style={{ display: 'grid', gap: 18 }}>
      <div className="row between wrap">
        <div>
          <h1 className="page-title">Products</h1>
          <p className="page-sub" style={{ marginBottom: 0 }}>Add, edit and remove catalog items.</p>
        </div>
        <button className="btn btn-primary" onClick={() => openForm(null)}><Plus size={18} /> Add product</button>
      </div>

      <input className="input" style={{ maxWidth: 360 }} placeholder="Search products…" value={q} onChange={(e) => setQ(e.target.value)} />

      <div className="card table-wrap">
        <table>
          <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Featured</th><th></th></tr></thead>
          <tbody>
            {products === null && <tr><td colSpan="6"><div className="skeleton" style={{ height: 40 }} /></td></tr>}
            {products?.map((p) => (
              <tr key={p._id}>
                <td><div className="row"><Img className="thumb-sm" src={p.images?.[0]} alt="" /><b>{p.name}</b></div></td>
                <td>{p.category}</td>
                <td className="num">{money(p.price)}</td>
                <td><span className={`badge ${p.stock === 0 ? 'danger' : p.stock <= 5 ? 'warn' : 'success'}`}>{p.stock}</span></td>
                <td>{p.featured ? 'Yes' : '—'}</td>
                <td>
                  <div className="row" style={{ gap: 6, justifyContent: 'flex-end' }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => openForm(p)} aria-label={`Edit ${p.name}`}><Pencil size={14} /></button>
                    <button className="btn btn-danger btn-sm" onClick={() => del(p)} aria-label={`Delete ${p.name}`}><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {products?.length === 0 && <tr><td colSpan="6" className="muted center">No products found</td></tr>}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="modal-back" onMouseDown={(e) => e.target === e.currentTarget && setEditing(null)}>
          <form className="card modal" onSubmit={save}>
            <h3 className="mb">{editing === 'new' ? 'Add product' : 'Edit product'}</h3>
            <div className="form-grid">
              <label className="field full">Name<input className="input" required {...bind('name')} /></label>
              <label className="field">Category<input className="input" required list="cats" {...bind('category')} /></label>
              <datalist id="cats">{['Electronics', 'Fashion', 'Home & Kitchen', 'Books', 'Sports'].map((c) => <option key={c} value={c} />)}</datalist>
              <label className="field">Brand<input className="input" {...bind('brand')} /></label>
              <label className="field">Price (₹)<input className="input" type="number" min="0" step="any" required {...bind('price')} /></label>
              <label className="field">MRP (₹, optional)<input className="input" type="number" min="0" step="any" {...bind('mrp')} /></label>
              <label className="field">Stock<input className="input" type="number" min="0" required {...bind('stock')} /></label>
              <label className="field row" style={{ alignSelf: 'end', paddingBottom: 12, flexDirection: 'row' }}>
                <input type="checkbox" checked={!!form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} style={{ accentColor: 'var(--primary)' }} /> Featured on home page
              </label>
              <label className="field full">Description<textarea className="input" required {...bind('description')} /></label>
              <label className="field full">Image URLs (one per line)<textarea className="input" {...bind('images')} placeholder="https://…" /></label>
            </div>
            <div className="row mt" style={{ justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-ghost" onClick={() => setEditing(null)}>Cancel</button>
              <button className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save product'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
