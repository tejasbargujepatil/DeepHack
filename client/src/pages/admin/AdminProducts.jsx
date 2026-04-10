import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { productService, categoryService } from '../../services';
import toast from 'react-hot-toast';

const EMPTY_FORM = {
  name:'', description:'', price:'', comparePrice:'', stock:'', brand:'',
  categoryId:'', sku:'', images:[''], isActive:true, isFeatured:false,
};

const SPIN = `@keyframes spin{to{transform:rotate(360deg)}}`;

const LG = '#1B3C1A';   // forest green
const BG = '#fff';       // card bg
const BORDER = 'rgba(0,0,0,0.08)';
const T1 = '#0D1B0D';
const T3 = '#6B806B';
const T4 = '#9FAF9F';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [cats, setCats]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]   = useState(null);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [saving, setSaving]     = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [search, setSearch]     = useState('');
  const [page, setPage]         = useState(1);
  const [meta, setMeta]         = useState({});

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await productService.getMyProducts({ page, search: search || undefined, limit:10 });
      setProducts(data.data || []);
      setMeta(data.meta || {});
    } catch { toast.error('Failed to load products'); }
    finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => {
    categoryService.getAll().then(r => setCats(r.data.data || [])).catch(() => {});
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setShowForm(true); };
  const openEdit   = (p) => {
    setEditing(p);
    setForm({
      name: p.name, description: p.description, price: p.price,
      comparePrice: p.comparePrice || '', stock: p.stock, brand: p.brand || '',
      categoryId: p.categoryId, sku: p.sku,
      images: p.images?.length ? p.images.map(i => i.url) : [''],
      isActive: p.isActive, isFeatured: p.isFeatured,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanImages = form.images.filter(u => u.trim());
    if (!form.name.trim())        { toast.error('Product name is required'); return; }
    if (!form.description.trim()) { toast.error('Description is required'); return; }
    if (!form.price || isNaN(form.price)) { toast.error('Valid price is required'); return; }
    if (!form.stock && form.stock !== 0)  { toast.error('Stock is required'); return; }
    if (!form.sku.trim())         { toast.error('SKU is required'); return; }
    if (!form.categoryId)         { toast.error('Please select a category'); return; }

    setSaving(true);
    try {
      const payload = {
        name:         form.name.trim(),
        description:  form.description.trim(),
        price:        parseFloat(form.price),
        comparePrice: form.comparePrice ? parseFloat(form.comparePrice) : null,
        stock:        parseInt(form.stock) || 0,
        brand:        form.brand.trim() || null,
        categoryId:   form.categoryId,
        sku:          form.sku.trim(),
        images:       cleanImages,
        isActive:     form.isActive,
        isFeatured:   form.isFeatured,
      };
      if (editing) {
        await productService.update(editing.id, payload);
        toast.success('Product updated ✓');
      } else {
        await productService.create(payload);
        toast.success('Product created ✓');
      }
      setShowForm(false);
      fetchProducts();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save product');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product? Cannot be undone.')) return;
    setDeleting(id);
    try {
      await productService.delete(id);
      toast.success('Product deleted');
      fetchProducts();
    } catch { toast.error('Failed to delete'); }
    finally { setDeleting(null); }
  };

  const addImageField = () => set('images', [...form.images, '']);
  const setImgUrl     = (i, v) => set('images', form.images.map((u, idx) => idx === i ? v : u));
  const removeImg     = (i) => set('images', form.images.filter((_, idx) => idx !== i));

  const FieldLabel = ({ children, required }) => (
    <label style={{ display:'block', fontSize:'12px', fontWeight:600, color:T3, marginBottom:'5px', letterSpacing:'0.01em' }}>
      {children}{required && <span style={{ color:'#C62828', marginLeft:'3px' }}>*</span>}
    </label>
  );

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'22px' }}>
      <style>{SPIN}</style>

      {/* Header */}
      <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
        style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'12px' }}>
        <div>
          <h1 style={{ fontSize:'26px', fontWeight:700, color:T1, marginBottom:'4px', fontFamily:"'Playfair Display', serif" }}>My Products</h1>
          <p style={{ fontSize:'13px', color:T3 }}>{meta.total || 0} products in your store</p>
        </div>
        <div style={{ display:'flex', gap:'10px', alignItems:'center' }}>
          <input value={search} onChange={e => setSearch(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { setPage(1); fetchProducts(); }}}
            placeholder="Search products…"
            style={{ padding:'9px 14px', borderRadius:'8px', fontSize:'13px', border:'1.5px solid '+BORDER, background:BG, color:T1, outline:'none', width:'200px', fontFamily:'inherit' }} />
          <button onClick={openCreate}
            style={{ display:'inline-flex', alignItems:'center', gap:'6px', padding:'9px 18px', borderRadius:'8px', background:LG, color:'#fff', border:'none', cursor:'pointer', fontWeight:700, fontSize:'13px', fontFamily:'inherit', boxShadow:'0 2px 8px rgba(27,60,26,0.25)', transition:'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.background='#2E7D32'}
            onMouseLeave={e => e.currentTarget.style.background=LG}>
            + Add Product
          </button>
        </div>
      </motion.div>

      {/* Table */}
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.1 }}
        style={{ background:BG, border:'1px solid '+BORDER, borderRadius:'16px', overflow:'hidden', boxShadow:'0 2px 12px rgba(0,0,0,0.05)' }}>
        <div style={{ overflowX:'auto' }}>
          {loading
            ? <div style={{ padding:'48px', textAlign:'center', color:T4, fontSize:'13px' }}>
                <div style={{ width:'24px', height:'24px', border:'2px solid rgba(27,60,26,0.15)', borderTopColor:LG, borderRadius:'50%', animation:'spin 0.7s linear infinite', margin:'0 auto 10px' }} />
                Loading products…
              </div>
            : products.length === 0
              ? <div style={{ padding:'64px', textAlign:'center' }}>
                  <div style={{ fontSize:'52px', marginBottom:'12px' }}>📦</div>
                  <p style={{ color:T3, fontSize:'15px', marginBottom:'20px' }}>No products yet. Add your first product!</p>
                  <button onClick={openCreate}
                    style={{ padding:'11px 24px', borderRadius:'8px', background:LG, color:'#fff', border:'none', cursor:'pointer', fontWeight:700, fontSize:'14px', fontFamily:'inherit', boxShadow:'0 2px 8px rgba(27,60,26,0.25)' }}>
                    + Add First Product
                  </button>
                </div>
              : <table style={{ width:'100%', borderCollapse:'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom:'1.5px solid '+BORDER, background:'#F8FAF8' }}>
                      {['','Product','Category','Price','Stock','Status','Actions'].map(h => (
                        <th key={h} style={{ padding:'12px 16px', textAlign:'left', fontSize:'11px', fontWeight:700, color:T3, textTransform:'uppercase', letterSpacing:'0.07em', whiteSpace:'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p, idx) => (
                      <tr key={p.id} style={{ borderBottom:'1px solid rgba(0,0,0,0.05)', transition:'background 0.15s', background: idx%2===0?'#fff':'#FAFCFA' }}
                        onMouseEnter={e => e.currentTarget.style.background='#F4FAF4'}
                        onMouseLeave={e => e.currentTarget.style.background=idx%2===0?'#fff':'#FAFCFA'}>
                        <td style={{ padding:'10px 16px' }}>
                          {p.images?.[0]?.url
                            ? <img src={p.images[0].url} alt={p.name} style={{ width:'44px', height:'44px', borderRadius:'10px', objectFit:'cover', border:'1px solid '+BORDER }} onError={e => { e.target.style.display='none'; }} />
                            : <div style={{ width:'44px', height:'44px', borderRadius:'10px', background:'#EEF7EE', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px' }}>📦</div>
                          }
                        </td>
                        <td style={{ padding:'10px 16px', maxWidth:'200px' }}>
                          <p style={{ fontSize:'13px', fontWeight:700, color:T1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.name}</p>
                          <p style={{ fontSize:'11px', color:T4, marginTop:'2px' }}>{p.brand || p.sku}</p>
                        </td>
                        <td style={{ padding:'10px 16px', fontSize:'12px', color:T3 }}>{p.category?.name || '—'}</td>
                        <td style={{ padding:'10px 16px' }}>
                          <p style={{ fontSize:'13px', fontWeight:800, color:T1 }}>₹{Number(p.price).toLocaleString('en-IN')}</p>
                          {p.comparePrice && <p style={{ fontSize:'11px', color:T4, textDecoration:'line-through' }}>₹{Number(p.comparePrice).toLocaleString('en-IN')}</p>}
                        </td>
                        <td style={{ padding:'10px 16px' }}>
                          <span style={{ fontSize:'13px', fontWeight:700, color: p.stock < 5 ? '#C62828' : p.stock < 15 ? '#E65100' : '#2E7D32' }}>{p.stock}</span>
                        </td>
                        <td style={{ padding:'10px 16px' }}>
                          <span style={{ fontSize:'11px', fontWeight:700, padding:'4px 10px', borderRadius:'99px',
                            background: p.isActive ? '#E8F5E9' : '#FFEBEE',
                            color: p.isActive ? '#2E7D32' : '#C62828',
                            border:`1px solid ${p.isActive ? 'rgba(46,125,50,0.2)' : 'rgba(198,40,40,0.2)'}`,
                          }}>
                            {p.isActive ? '● Active' : '● Hidden'}
                          </span>
                        </td>
                        <td style={{ padding:'10px 16px' }}>
                          <div style={{ display:'flex', gap:'6px' }}>
                            <button onClick={() => openEdit(p)}
                              style={{ fontSize:'12px', fontWeight:600, padding:'6px 12px', borderRadius:'7px', cursor:'pointer', background:'#EEF7EE', color:LG, border:'1px solid rgba(27,60,26,0.15)', fontFamily:'inherit', transition:'all 0.15s' }}
                              onMouseEnter={e => { e.currentTarget.style.background=LG; e.currentTarget.style.color='#fff'; }}
                              onMouseLeave={e => { e.currentTarget.style.background='#EEF7EE'; e.currentTarget.style.color=LG; }}>
                              Edit
                            </button>
                            <button onClick={() => handleDelete(p.id)} disabled={deleting===p.id}
                              style={{ fontSize:'12px', fontWeight:600, padding:'6px 12px', borderRadius:'7px', cursor:'pointer', background:'#FFEBEE', color:'#C62828', border:'1px solid rgba(198,40,40,0.2)', fontFamily:'inherit', opacity:deleting===p.id?0.5:1, transition:'all 0.15s' }}
                              onMouseEnter={e => { e.currentTarget.style.background='#C62828'; e.currentTarget.style.color='#fff'; }}
                              onMouseLeave={e => { e.currentTarget.style.background='#FFEBEE'; e.currentTarget.style.color='#C62828'; }}>
                              {deleting===p.id ? '…' : 'Delete'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
          }
        </div>
        {meta.totalPages > 1 && (
          <div style={{ padding:'14px 20px', borderTop:'1px solid '+BORDER, display:'flex', justifyContent:'center', gap:'6px', background:'#F8FAF8' }}>
            {Array.from({ length:meta.totalPages }, (_,i) => i+1).map(p => (
              <button key={p} onClick={() => setPage(p)}
                style={{ width:'34px', height:'34px', borderRadius:'8px', fontSize:'13px', fontWeight:600, cursor:'pointer', fontFamily:'inherit',
                  background: page===p ? LG : BG,
                  border:`1.5px solid ${page===p ? LG : BORDER}`,
                  color: page===p ? '#fff' : T3,
                }}>
                {p}
              </button>
            ))}
          </div>
        )}
      </motion.div>

      {/* ── Modal ── */}
      <AnimatePresence>
        {showForm && (
          <>
            {/* Backdrop */}
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              onClick={() => setShowForm(false)}
              style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.35)', zIndex:1000, backdropFilter:'blur(4px)',
                display:'flex', alignItems:'center', justifyContent:'center', padding:'16px' }} />

            {/* Modal shell — centred via its own flex wrapper */}
            <div style={{ position:'fixed', inset:0, zIndex:1001, display:'flex', alignItems:'center', justifyContent:'center', padding:'16px', pointerEvents:'none' }}>
            <motion.div initial={{ opacity:0, scale:0.96, y:16 }} animate={{ opacity:1, scale:1, y:0 }} exit={{ opacity:0, scale:0.95, y:8 }}
              transition={{ type:'spring', damping:28, stiffness:280 }}
              onClick={e => e.stopPropagation()}
              style={{ width:'100%', maxWidth:'640px', maxHeight:'92vh', overflowY:'auto',
                background:BG, borderRadius:'20px', padding:'24px 28px',
                boxShadow:'0 24px 80px rgba(0,0,0,0.18)', border:'1px solid '+BORDER,
                pointerEvents:'all',
              }}>

              {/* Modal header */}
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px', paddingBottom:'16px', borderBottom:'1px solid '+BORDER }}>
                <div>
                  <h2 style={{ fontSize:'20px', fontWeight:700, color:T1, fontFamily:"'Playfair Display', serif" }}>
                    {editing ? '✏️ Edit Product' : '+ Add New Product'}
                  </h2>
                  <p style={{ fontSize:'12px', color:T3, marginTop:'2px' }}>
                    {editing ? 'Update product details' : 'Fill in the details below to add to your store'}
                  </p>
                </div>
                <button onClick={() => setShowForm(false)}
                  style={{ width:'32px', height:'32px', borderRadius:'50%', background:'rgba(0,0,0,0.06)', border:'none', cursor:'pointer', fontSize:'18px', display:'flex', alignItems:'center', justifyContent:'center', color:T3, fontFamily:'inherit', flexShrink:0, lineHeight:1 }}>
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'13px' }}>
                {/* Product name */}
                <div>
                  <FieldLabel required>Product Name</FieldLabel>
                  <input value={form.name} onChange={e => set('name', e.target.value)} required
                    placeholder="e.g. iPhone 15 Pro Max"
                    style={{ width:'100%', padding:'10px 14px', borderRadius:'8px', border:'1.5px solid '+BORDER, fontSize:'14px', color:T1, background:BG, outline:'none', fontFamily:'inherit', transition:'border-color 0.2s' }}
                    onFocus={e => e.target.style.borderColor=LG} onBlur={e => e.target.style.borderColor=BORDER} />
                </div>

                {/* Description */}
                <div>
                  <FieldLabel required>Description</FieldLabel>
                  <textarea value={form.description} onChange={e => set('description', e.target.value)} required rows={3}
                    placeholder="Describe your product — features, specs, what makes it great…"
                    style={{ width:'100%', padding:'10px 14px', borderRadius:'8px', border:'1.5px solid '+BORDER, fontSize:'14px', color:T1, background:BG, outline:'none', fontFamily:'inherit', resize:'vertical', minHeight:'80px', transition:'border-color 0.2s' }}
                    onFocus={e => e.target.style.borderColor=LG} onBlur={e => e.target.style.borderColor=BORDER} />
                </div>

                {/* Price + Compare Price */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                  <div>
                    <FieldLabel required>Selling Price (₹)</FieldLabel>
                    <input type="number" min="1" step="0.01" value={form.price} onChange={e => set('price', e.target.value)} required
                      placeholder="e.g. 29999"
                      style={{ width:'100%', padding:'10px 14px', borderRadius:'8px', border:'1.5px solid '+BORDER, fontSize:'14px', color:T1, background:BG, outline:'none', fontFamily:'inherit', transition:'border-color 0.2s' }}
                      onFocus={e => e.target.style.borderColor=LG} onBlur={e => e.target.style.borderColor=BORDER} />
                  </div>
                  <div>
                    <FieldLabel>MRP / Compare Price (₹)</FieldLabel>
                    <input type="number" min="1" step="0.01" value={form.comparePrice} onChange={e => set('comparePrice', e.target.value)}
                      placeholder="Original price (optional)"
                      style={{ width:'100%', padding:'10px 14px', borderRadius:'8px', border:'1.5px solid '+BORDER, fontSize:'14px', color:T1, background:BG, outline:'none', fontFamily:'inherit', transition:'border-color 0.2s' }}
                      onFocus={e => e.target.style.borderColor=LG} onBlur={e => e.target.style.borderColor=BORDER} />
                  </div>
                </div>

                {/* Stock + SKU */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                  <div>
                    <FieldLabel required>Stock Quantity</FieldLabel>
                    <input type="number" min="0" value={form.stock} onChange={e => set('stock', e.target.value)} required
                      placeholder="e.g. 50"
                      style={{ width:'100%', padding:'10px 14px', borderRadius:'8px', border:'1.5px solid '+BORDER, fontSize:'14px', color:T1, background:BG, outline:'none', fontFamily:'inherit', transition:'border-color 0.2s' }}
                      onFocus={e => e.target.style.borderColor=LG} onBlur={e => e.target.style.borderColor=BORDER} />
                  </div>
                  <div>
                    <FieldLabel required>SKU</FieldLabel>
                    <input value={form.sku} onChange={e => set('sku', e.target.value)} required
                      placeholder="e.g. APPLE-IP15-128"
                      style={{ width:'100%', padding:'10px 14px', borderRadius:'8px', border:'1.5px solid '+BORDER, fontSize:'14px', color:T1, background:BG, outline:'none', fontFamily:'inherit', transition:'border-color 0.2s' }}
                      onFocus={e => e.target.style.borderColor=LG} onBlur={e => e.target.style.borderColor=BORDER} />
                  </div>
                </div>

                {/* Brand + Category */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                  <div>
                    <FieldLabel>Brand</FieldLabel>
                    <input value={form.brand} onChange={e => set('brand', e.target.value)}
                      placeholder="e.g. Apple, Samsung"
                      style={{ width:'100%', padding:'10px 14px', borderRadius:'8px', border:'1.5px solid '+BORDER, fontSize:'14px', color:T1, background:BG, outline:'none', fontFamily:'inherit', transition:'border-color 0.2s' }}
                      onFocus={e => e.target.style.borderColor=LG} onBlur={e => e.target.style.borderColor=BORDER} />
                  </div>
                  <div>
                    <FieldLabel required>Category</FieldLabel>
                    <select value={form.categoryId} onChange={e => set('categoryId', e.target.value)} required
                      style={{ width:'100%', padding:'10px 14px', borderRadius:'8px', border:'1.5px solid '+BORDER, fontSize:'14px', color:T1, background:BG, outline:'none', fontFamily:'inherit', cursor:'pointer', transition:'border-color 0.2s' }}
                      onFocus={e => e.target.style.borderColor=LG} onBlur={e => e.target.style.borderColor=BORDER}>
                      <option value="">Select category…</option>
                      {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>

                {/* Product Images (URLs) */}
                <div>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px' }}>
                    <FieldLabel>Product Images (URLs)</FieldLabel>
                    <button type="button" onClick={addImageField}
                      style={{ fontSize:'12px', color:LG, background:'none', border:'none', cursor:'pointer', fontFamily:'inherit', fontWeight:700 }}>
                      + Add URL
                    </button>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                    {form.images.map((url, i) => (
                      <div key={i} style={{ display:'flex', gap:'8px', alignItems:'center' }}>
                        <input value={url} onChange={e => setImgUrl(i, e.target.value)}
                          placeholder={`https://example.com/image-${i+1}.jpg`}
                          style={{ flex:1, padding:'9px 14px', borderRadius:'8px', border:'1.5px solid '+BORDER, fontSize:'13px', color:T1, background:BG, outline:'none', fontFamily:'inherit', transition:'border-color 0.2s' }}
                          onFocus={e => e.target.style.borderColor=LG} onBlur={e => e.target.style.borderColor=BORDER} />
                        {url.trim() && (
                          <img src={url} alt="" style={{ width:'40px', height:'40px', borderRadius:'8px', objectFit:'cover', border:'1px solid '+BORDER, flexShrink:0 }}
                            onError={e => { e.target.style.opacity='0.3'; }} />
                        )}
                        {form.images.length > 1 && (
                          <button type="button" onClick={() => removeImg(i)}
                            style={{ width:'30px', height:'30px', borderRadius:'7px', background:'#FFEBEE', border:'1px solid rgba(198,40,40,0.2)', color:'#C62828', cursor:'pointer', fontFamily:'inherit', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px' }}>
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <p style={{ fontSize:'11px', color:T4, marginTop:'6px' }}>Paste direct image URLs. First URL = main product image shown to customers.</p>
                </div>

                {/* Toggles */}
                <div style={{ display:'flex', gap:'16px', flexWrap:'wrap', padding:'12px 14px', background:'#F8FAF8', borderRadius:'10px', border:'1px solid '+BORDER }}>
                  {[['isActive','List product (visible to customers)'],['isFeatured','Feature on homepage']].map(([key, label]) => (
                    <label key={key} style={{ display:'flex', alignItems:'center', gap:'10px', cursor:'pointer' }}>
                      <div onClick={() => set(key, !form[key])}
                        style={{ width:'38px', height:'22px', borderRadius:'11px', transition:'background 0.2s', background:form[key]?LG:'rgba(0,0,0,0.15)', position:'relative', flexShrink:0, cursor:'pointer' }}>
                        <div style={{ width:'16px', height:'16px', borderRadius:'50%', background:'#fff', position:'absolute', top:'3px', transition:'left 0.2s', left:form[key]?'19px':'3px', boxShadow:'0 1px 4px rgba(0,0,0,0.2)' }} />
                      </div>
                      <span style={{ fontSize:'13px', color:T3, fontWeight:500 }}>{label}</span>
                    </label>
                  ))}
                </div>

                {/* Actions */}
                <div style={{ display:'flex', gap:'10px', paddingTop:'4px' }}>
                  <button type="button" onClick={() => setShowForm(false)}
                    style={{ flex:1, padding:'12px', borderRadius:'8px', fontSize:'14px', fontWeight:600, cursor:'pointer', background:'transparent', color:T3, border:'1.5px solid '+BORDER, fontFamily:'inherit', transition:'all 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.background='rgba(0,0,0,0.04)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background='transparent'; }}>
                    Cancel
                  </button>
                  <button type="submit" disabled={saving}
                    style={{ flex:2, padding:'12px', borderRadius:'8px', fontSize:'14px', fontWeight:700, cursor:'pointer', background:LG, color:'#fff', border:'none', fontFamily:'inherit', boxShadow:'0 2px 8px rgba(27,60,26,0.25)', transition:'all 0.2s', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', opacity:saving?0.7:1 }}>
                    {saving
                      ? <><span style={{ width:'15px', height:'15px', border:'2px solid rgba(255,255,255,0.4)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin 0.7s linear infinite', display:'inline-block' }} /> Saving…</>
                      : editing ? '✓ Update Product' : '+ Create Product'
                    }
                  </button>
                </div>
              </form>
            </motion.div>
            </div>{/* centering wrapper */}
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
