import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from '../components/ProductCard';
import { productService, categoryService } from '../services';

const LG='#1B3C1A'; const T1='#0D1B0D'; const T3='#6B806B'; const T4='#9FAF9F';
const BDR='rgba(0,0,0,0.07)';
const SPIN='@keyframes spin{to{transform:rotate(360deg)}}';

const SORT_OPTIONS = [
  { value:'newest',      label:'Newest first' },
  { value:'price_asc',   label:'Price: low → high' },
  { value:'price_desc',  label:'Price: high → low' },
  { value:'rating_desc', label:'Top rated' },
];

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [meta, setMeta]             = useState({});
  const [loading, setLoading]       = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const q        = searchParams.get('search')   || '';
  const category = searchParams.get('category') || '';
  const sort     = searchParams.get('sort')     || 'newest';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const page     = Number(searchParams.get('page') || 1);

  const setParam = (key, val) =>
    setSearchParams(prev => { const p = new URLSearchParams(prev); val ? p.set(key,val) : p.delete(key); p.delete('page'); return p; });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await productService.getAll({ search:q, category, sort, minPrice, maxPrice, page, limit:12 });
      setProducts(data.data || []); setMeta(data.meta || {});
    } catch { setProducts([]); }
    finally  { setLoading(false); }
  }, [q, category, sort, minPrice, maxPrice, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => { categoryService.getAll().then(r => setCategories(r.data.data || [])).catch(() => {}); }, []);

  const clearAll  = () => setSearchParams({});
  const hasFilters = q || category || minPrice || maxPrice;

  return (
    <div style={{ minHeight:'100vh', paddingTop:'64px', paddingBottom:'80px', background:'#F4F7F4' }}>
      <style>{SPIN}</style>

      {/* Page header */}
      <div style={{ borderBottom:`1px solid ${BDR}`, background:'#fff' }}>
        <div className="container-max" style={{ padding:'22px 28px' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:'16px', flexWrap:'wrap' }}>
            <div>
              <h1 style={{ fontFamily:"'Playfair Display', serif", fontSize:'26px', fontWeight:700, color:T1, marginBottom:'4px' }}>
                {q ? `Results for "${q}"` : category ? `${category.charAt(0).toUpperCase()+category.slice(1)}` : 'All Products'}
              </h1>
              <p style={{ fontSize:'13px', color:T3 }}>{loading ? 'Loading…' : `${meta.total||0} products found`}</p>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
              <button onClick={() => setSidebarOpen(o => !o)}
                style={{ display:'flex', alignItems:'center', gap:'6px', padding:'9px 16px', borderRadius:'8px', border:`1.5px solid ${hasFilters?LG:BDR}`, background:hasFilters?'#EEF7EE':'#fff', color:hasFilters?LG:T3, cursor:'pointer', fontWeight:600, fontSize:'13px', fontFamily:'inherit', transition:'all 0.15s' }}>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="20" y2="12"/><line x1="12" y1="18" x2="20" y2="18"/></svg>
                Filters {hasFilters && '●'}
              </button>
              <select value={sort} onChange={e => setParam('sort', e.target.value)}
                style={{ padding:'9px 14px', borderRadius:'8px', border:`1.5px solid ${BDR}`, background:'#fff', color:T1, fontSize:'13px', fontFamily:'inherit', outline:'none', cursor:'pointer' }}>
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          {/* Active filter chips */}
          {hasFilters && (
            <div style={{ display:'flex', gap:'6px', flexWrap:'wrap', marginTop:'12px', alignItems:'center' }}>
              {q        && <FilterChip label={`"${q}"`}            onRemove={() => setParam('search','')} />}
              {category && <FilterChip label={category}            onRemove={() => setParam('category','')} />}
              {minPrice && <FilterChip label={`From ₹${minPrice}`} onRemove={() => setParam('minPrice','')} />}
              {maxPrice && <FilterChip label={`Up to ₹${maxPrice}`} onRemove={() => setParam('maxPrice','')} />}
              <button onClick={clearAll} style={{ fontSize:'12px', color:T3, background:'none', border:'none', cursor:'pointer', fontFamily:'inherit', padding:'4px 8px', fontWeight:600 }}>Clear all ×</button>
            </div>
          )}
        </div>
      </div>

      <div className="container-max" style={{ padding:'0 28px', display:'flex', gap:'24px', marginTop:'24px' }}>

        {/* Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside initial={{ opacity:0, width:0 }} animate={{ opacity:1, width:240 }} exit={{ opacity:0, width:0 }}
              transition={{ duration:0.22 }} style={{ flexShrink:0, overflow:'hidden' }}>
              <div style={{ width:'240px', display:'flex', flexDirection:'column', gap:'8px', position:'sticky', top:'80px' }}>

                <FilterSection title="Search">
                  <input type="text" value={q} onChange={e => setParam('search', e.target.value)}
                    placeholder="Search products…"
                    style={{ width:'100%', padding:'9px 12px', borderRadius:'8px', border:`1.5px solid ${BDR}`, fontSize:'13px', color:T1, background:'#fff', outline:'none', fontFamily:'inherit' }}
                    onFocus={e => e.target.style.borderColor=LG} onBlur={e => e.target.style.borderColor=BDR} />
                </FilterSection>

                <FilterSection title="Category">
                  {[{ slug:'', name:'All' }, ...categories].map(c => {
                    const active = category === (c.slug||'');
                    return (
                      <button key={c.slug||'all'} onClick={() => setParam('category', c.slug||'')}
                        style={{ width:'100%', textAlign:'left', padding:'8px 12px', borderRadius:'8px', fontSize:'13px', fontWeight:500,
                          background: active ? '#EEF7EE' : 'transparent',
                          color: active ? LG : T3,
                          border:'none', cursor:'pointer', fontFamily:'inherit', transition:'all 0.15s' }}
                        onMouseEnter={e => { if(!active) e.currentTarget.style.background='rgba(0,0,0,0.03)'; }}
                        onMouseLeave={e => { if(!active) e.currentTarget.style.background='transparent'; }}>
                        {c.name || c.slug}
                      </button>
                    );
                  })}
                </FilterSection>

                <FilterSection title="Price Range">
                  <div style={{ display:'flex', gap:'8px', marginBottom:'8px' }}>
                    <input type="number" placeholder="Min ₹" value={minPrice} onChange={e => setParam('minPrice', e.target.value)}
                      style={{ flex:1, padding:'7px 10px', borderRadius:'7px', border:`1.5px solid ${BDR}`, fontSize:'12px', color:T1, background:'#fff', outline:'none', fontFamily:'inherit' }} />
                    <input type="number" placeholder="Max ₹" value={maxPrice} onChange={e => setParam('maxPrice', e.target.value)}
                      style={{ flex:1, padding:'7px 10px', borderRadius:'7px', border:`1.5px solid ${BDR}`, fontSize:'12px', color:T1, background:'#fff', outline:'none', fontFamily:'inherit' }} />
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:'2px' }}>
                    {[['Under ₹5,000','','5000'],['₹5K – ₹25K','5000','25000'],['Above ₹25K','25000','']].map(([l,mn,mx]) => (
                      <button key={l} onClick={() => { setParam('minPrice',mn); setParam('maxPrice',mx); }}
                        style={{ textAlign:'left', fontSize:'12px', color:T3, background:'none', border:'none', cursor:'pointer', padding:'5px 12px', borderRadius:'6px', fontFamily:'inherit', transition:'all 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.color=T1; e.currentTarget.style.background='rgba(0,0,0,0.04)'; }}
                        onMouseLeave={e => { e.currentTarget.style.color=T3; e.currentTarget.style.background='none'; }}>
                        {l}
                      </button>
                    ))}
                  </div>
                </FilterSection>

                {hasFilters && (
                  <button onClick={clearAll}
                    style={{ padding:'9px', borderRadius:'8px', background:'#FFEBEE', color:'#C62828', border:'1px solid rgba(198,40,40,0.2)', cursor:'pointer', fontWeight:600, fontSize:'13px', fontFamily:'inherit' }}>
                    Clear all filters
                  </button>
                )}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Product grid */}
        <main style={{ flex:1, minWidth:0 }}>
          {loading ? (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px, 1fr))', gap:'16px' }}>
              {Array(9).fill(0).map((_,i) => (
                <div key={i} style={{ background:'#fff', border:`1px solid ${BDR}`, borderRadius:'14px', overflow:'hidden' }}>
                  <div className="skeleton" style={{ height:'180px' }} />
                  <div style={{ padding:'16px', display:'flex', flexDirection:'column', gap:'8px' }}>
                    <div className="skeleton" style={{ height:'10px', width:'40%', borderRadius:'4px' }} />
                    <div className="skeleton" style={{ height:'14px', width:'80%', borderRadius:'4px' }} />
                    <div className="skeleton" style={{ height:'18px', width:'45%', borderRadius:'4px', marginTop:'4px' }} />
                    <div className="skeleton" style={{ height:'36px', borderRadius:'8px', marginTop:'4px' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} style={{ textAlign:'center', padding:'80px 24px' }}>
              <p style={{ fontSize:'48px', marginBottom:'16px' }}>🔍</p>
              <p style={{ fontSize:'20px', fontWeight:700, color:T1, marginBottom:'8px', fontFamily:"'Playfair Display', serif" }}>No products found</p>
              <p style={{ fontSize:'14px', color:T3, marginBottom:'24px' }}>Try adjusting your filters or search term</p>
              <button onClick={clearAll} className="btn-primary" style={{ fontSize:'14px' }}>Clear filters</button>
            </motion.div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px, 1fr))', gap:'18px' }}>
              {products.map((p,i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          )}

          {/* Pagination */}
          {meta.totalPages > 1 && (
            <div style={{ display:'flex', justifyContent:'center', gap:'6px', marginTop:'40px' }}>
              {Array.from({ length:meta.totalPages }, (_,i) => i+1).map(p => (
                <button key={p} onClick={() => setSearchParams(prev => { const q = new URLSearchParams(prev); q.set('page',p); return q; })}
                  style={{ width:'38px', height:'38px', borderRadius:'8px', fontSize:'13px', fontWeight:600, fontFamily:'inherit', cursor:'pointer',
                    background:page===p?LG:'#fff', border:`1.5px solid ${page===p?LG:BDR}`, color:page===p?'#fff':T3, transition:'all 0.15s' }}>
                  {p}
                </button>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function FilterSection({ title, children }) {
  return (
    <div style={{ borderRadius:'12px', border:`1px solid ${BDR}`, background:'#fff', overflow:'hidden' }}>
      <p style={{ fontSize:'11px', fontWeight:700, color:'#9FAF9F', textTransform:'uppercase', letterSpacing:'0.08em', padding:'12px 14px 8px' }}>{title}</p>
      <div style={{ padding:'0 10px 12px' }}>{children}</div>
    </div>
  );
}

function FilterChip({ label, onRemove }) {
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:'4px', padding:'4px 10px', borderRadius:'99px', fontSize:'12px', fontWeight:600,
      background:'#EEF7EE', border:'1px solid rgba(27,60,26,0.15)', color:'#1B3C1A' }}>
      {label}
      <button onClick={onRemove} style={{ background:'none', border:'none', cursor:'pointer', color:'inherit', padding:'0', lineHeight:1, fontFamily:'inherit', opacity:0.7, fontSize:'14px' }}>×</button>
    </span>
  );
}
