import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SearchX } from 'lucide-react';
import api from '../api';
import Page from '../components/Page';
import ProductCard from '../components/ProductCard';
import { Empty, Skeletons } from '../components/ui';

const SORT_OPTIONS = [
  ['newest', 'Newest'],
  ['price-asc', 'Price: low to high'],
  ['price-desc', 'Price: high to low'],
  ['rating', 'Top rated'],
  ['name', 'Name A-Z'],
];

export default function Products() {
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [price, setPrice] = useState({ min: params.get('minPrice') || '', max: params.get('maxPrice') || '' });

  const q = params.get('q') || '';
  const category = params.get('category') || 'all';
  const sort = params.get('sort') || 'newest';
  const page = Number(params.get('page') || 1);
  const minPrice = params.get('minPrice') || '';
  const maxPrice = params.get('maxPrice') || '';
  const inStock = params.get('inStock') || '';
  const featured = params.get('featured') || '';

  const set = (patch) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => (v === '' || v === null || v === 'all' ? next.delete(k) : next.set(k, v)));
    if (!('page' in patch)) next.delete('page');
    setParams(next);
  };

  useEffect(() => {
    api.get('/products/categories').then(({ data: d }) => setCategories(d.categories)).catch(() => {});
  }, []);

  useEffect(() => {
    setData(null);
    api
      .get('/products', { params: { q, category, sort, page, minPrice, maxPrice, inStock, featured, limit: 12 } })
      .then(({ data: d }) => setData(d))
      .catch(() => setData({ products: [], pages: 1, total: 0 }));
  }, [q, category, sort, page, minPrice, maxPrice, inStock, featured]);

  const clearAll = () => {
    setPrice({ min: '', max: '' });
    setParams({});
  };

  return (
    <Page>
      <h1 className="page-title">{q ? `Results for "${q}"` : category !== 'all' ? category : 'All products'}</h1>
      <p className="page-sub">{data ? `${data.total} product${data.total === 1 ? '' : 's'} found` : 'Loading…'}</p>

      <div className="shop-layout">
        <aside className="card filters">
          <div>
            <h4>Category</h4>
            <div className="chip-list">
              {['all', ...categories].map((c) => (
                <button key={c} className={`chip ${category === c ? 'on' : ''}`} onClick={() => set({ category: c })}>
                  {c === 'all' ? 'All' : c}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h4>Price (₹)</h4>
            <form
              className="row"
              onSubmit={(e) => {
                e.preventDefault();
                set({ minPrice: price.min, maxPrice: price.max });
              }}
            >
              <input className="input" type="number" min="0" placeholder="Min" value={price.min} onChange={(e) => setPrice({ ...price, min: e.target.value })} />
              <input className="input" type="number" min="0" placeholder="Max" value={price.max} onChange={(e) => setPrice({ ...price, max: e.target.value })} />
              <button className="btn btn-sm btn-primary">Go</button>
            </form>
          </div>
          <div>
            <h4>Sort by</h4>
            <select className="select" value={sort} onChange={(e) => set({ sort: e.target.value })}>
              {SORT_OPTIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <label className="row" style={{ cursor: 'pointer', fontSize: '0.92rem' }}>
            <input type="checkbox" checked={inStock === 'true'} onChange={(e) => set({ inStock: e.target.checked ? 'true' : '' })} style={{ accentColor: 'var(--primary)' }} />
            In stock only
          </label>
          <button className="btn btn-ghost btn-sm" onClick={clearAll}>Clear all filters</button>
        </aside>

        <section>
          {data === null ? (
            <Skeletons n={6} />
          ) : data.products.length === 0 ? (
            <Empty icon={SearchX} title="No products match">Try a different search or clear your filters.</Empty>
          ) : (
            <>
              <div className="grid-products">
                {data.products.map((p, i) => <ProductCard key={p._id} product={p} index={i} />)}
              </div>
              {data.pages > 1 && (
                <div className="pager">
                  {Array.from({ length: data.pages }).map((_, i) => (
                    <button key={i} className={`chip ${page === i + 1 ? 'on' : ''}`} onClick={() => { set({ page: String(i + 1) }); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </Page>
  );
}
