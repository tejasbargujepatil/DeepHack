import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { userService, aiService, productService } from '../services';
import toast from 'react-hot-toast';

const LG = '#1B3C1A'; const T1 = '#0D1B0D'; const T3 = '#6B806B'; const T4 = '#9FAF9F';
const BDR = 'rgba(0,0,0,0.07)';

export default function WishlistPage() {
  const { toggle } = useWishlist();
  const { addToCart } = useCart();
  const [items, setItems]               = useState([]);
  const [recs, setRecs]                 = useState([]);
  const [loading, setLoading]           = useState(true);
  const [addingCart, setAddingCart]     = useState(null);

  useEffect(() => {
    Promise.allSettled([
      userService.getWishlist(),
      aiService.getRecommendations(),
    ]).then(([w, r]) => {
      if (w.status === 'fulfilled') {
        const wishlistItems = w.value.data.data || [];
        setItems(wishlistItems);
      }
      if (r.status === 'fulfilled') {
        setRecs(r.value.data.data || []);
      }
    }).finally(() => setLoading(false));
  }, []);

  const handleRemove = async (productId) => {
    setItems(prev => prev.filter(i => (i.productId || i.product?.id) !== productId));
    await toggle(productId);
  };

  const handleAddToCart = async (productId, name) => {
    setAddingCart(productId);
    try {
      await addToCart({ productId, quantity: 1 });
      toast.success(`${name.split(' ').slice(0,3).join(' ')} added to cart`);
    } catch { toast.error('Could not add to cart'); }
    finally { setAddingCart(null); }
  };

  if (loading) return (
    <div style={{ minHeight:'80vh', display:'flex', alignItems:'center', justifyContent:'center', paddingTop:'64px' }}>
      <div style={{ width:'32px', height:'32px', border:`3px solid rgba(27,60,26,0.15)`, borderTopColor:LG, borderRadius:'50%', animation:'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const products = items.map(i => i.product || i).filter(Boolean);

  return (
    <div style={{ minHeight:'100vh', paddingTop:'80px', paddingBottom:'80px', background:'#F4F7F4' }}>
      <div className="container-max" style={{ padding:'32px 28px' }}>

        {/* Header */}
        <div style={{ marginBottom:'32px' }}>
          <h1 style={{ fontFamily:"'Playfair Display', serif", fontSize:'32px', fontWeight:700, color:T1, marginBottom:'6px' }}>My Wishlist ❤️</h1>
          <p style={{ fontSize:'14px', color:T3 }}>{products.length} saved {products.length === 1 ? 'item' : 'items'}</p>
        </div>

        {/* Wishlist Grid */}
        {products.length === 0
          ? <div style={{ textAlign:'center', padding:'80px 24px', background:'#fff', borderRadius:'20px', border:`1px solid ${BDR}` }}>
              <div style={{ fontSize:'64px', marginBottom:'16px' }}>🤍</div>
              <h2 style={{ fontFamily:"'Playfair Display', serif", fontSize:'22px', fontWeight:700, color:T1, marginBottom:'8px' }}>Your wishlist is empty</h2>
              <p style={{ fontSize:'14px', color:T3, marginBottom:'24px' }}>Save items you love and come back to them anytime</p>
              <Link to="/products" style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'12px 28px', borderRadius:'10px', background:LG, color:'#fff', textDecoration:'none', fontWeight:700, fontSize:'14px' }}>
                Browse Products →
              </Link>
            </div>
          : <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:'20px', marginBottom:'48px' }}>
              <AnimatePresence>
                {products.map((product, i) => {
                  const productId = product.id;
                  const imgUrl = product.images?.[0]?.url;
                  const inStock = product.stock > 0;
                  return (
                    <motion.div key={productId}
                      initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:0.9, transition:{ duration:0.2 } }}
                      transition={{ duration:0.3, delay:i*0.05 }}>
                      <div style={{ background:'#fff', borderRadius:'16px', border:`1px solid ${BDR}`, overflow:'hidden', boxShadow:'0 2px 12px rgba(0,0,0,0.05)', transition:'box-shadow 0.2s,transform 0.2s' }}
                        onMouseEnter={e => { e.currentTarget.style.boxShadow='0 8px 28px rgba(0,0,0,0.1)'; e.currentTarget.style.transform='translateY(-2px)'; }}
                        onMouseLeave={e => { e.currentTarget.style.boxShadow='0 2px 12px rgba(0,0,0,0.05)'; e.currentTarget.style.transform=''; }}>

                        {/* Image */}
                        <Link to={`/products/${productId}`} style={{ display:'block', position:'relative' }}>
                          <div style={{ height:'200px', background:'#F0F4F0', overflow:'hidden' }}>
                            {imgUrl
                              ? <img src={imgUrl} alt={product.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                              : <div style={{ height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'48px', opacity:0.15 }}>📦</div>
                            }
                          </div>
                          {!inStock && (
                            <div style={{ position:'absolute', inset:0, background:'rgba(255,255,255,0.7)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                              <span style={{ padding:'6px 14px', borderRadius:'8px', background:'#fff', border:`1px solid ${BDR}`, fontSize:'12px', fontWeight:700, color:T3 }}>Out of stock</span>
                            </div>
                          )}
                        </Link>

                        {/* Info */}
                        <div style={{ padding:'16px' }}>
                          <p style={{ fontSize:'11px', color:T3, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'4px' }}>{product.brand || product.category?.name}</p>
                          <Link to={`/products/${productId}`} style={{ textDecoration:'none' }}>
                            <p style={{ fontSize:'14px', fontWeight:600, color:T1, lineHeight:1.4, marginBottom:'8px', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{product.name}</p>
                          </Link>
                          <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'14px' }}>
                            <span style={{ fontSize:'20px', fontWeight:800, color:T1 }}>₹{Number(product.price).toLocaleString('en-IN')}</span>
                            {product.comparePrice && <span style={{ fontSize:'13px', color:T4, textDecoration:'line-through' }}>₹{Number(product.comparePrice).toLocaleString('en-IN')}</span>}
                          </div>

                          {/* Actions */}
                          <div style={{ display:'flex', gap:'8px' }}>
                            <button onClick={() => handleAddToCart(productId, product.name)} disabled={!inStock || addingCart === productId}
                              style={{ flex:1, padding:'9px', borderRadius:'8px', fontSize:'13px', fontWeight:700, border:'none', cursor: inStock ? 'pointer' : 'not-allowed', fontFamily:'inherit', transition:'all 0.2s',
                                background: inStock ? LG : 'rgba(0,0,0,0.05)', color: inStock ? '#fff' : T4 }}
                              onMouseEnter={e => { if(inStock) e.currentTarget.style.background='#2E7D32'; }}
                              onMouseLeave={e => { if(inStock) e.currentTarget.style.background=LG; }}>
                              {addingCart === productId ? 'Adding…' : '🛒 Add to Cart'}
                            </button>
                            <button onClick={() => handleRemove(productId)}
                              style={{ width:'38px', height:'38px', borderRadius:'8px', border:`1.5px solid #FFCDD2`, background:'#FFF5F5', color:'#E53935', fontSize:'16px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.2s', flexShrink:0 }}
                              onMouseEnter={e => { e.currentTarget.style.background='#E53935'; e.currentTarget.style.color='#fff'; }}
                              onMouseLeave={e => { e.currentTarget.style.background='#FFF5F5'; e.currentTarget.style.color='#E53935'; }}
                              title="Remove from wishlist">
                              🗑️
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
        }

        {/* ── Recommendations Section ── */}
        {recs.length > 0 && (
          <div style={{ marginTop:'16px' }}>
            <div style={{ marginBottom:'20px' }}>
              <h2 style={{ fontFamily:"'Playfair Display', serif", fontSize:'22px', fontWeight:700, color:T1, marginBottom:'4px' }}>Recommended for You ✨</h2>
              <p style={{ fontSize:'13px', color:T3 }}>Picked based on your browsing history</p>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px, 1fr))', gap:'16px' }}>
              {recs.slice(0, 6).map((product, i) => {
                const imgUrl = product.images?.[0]?.url;
                const inStock = product.stock > 0;
                return (
                  <motion.div key={product.id}
                    initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }}
                    viewport={{ once:true }} transition={{ delay:i*0.06 }}>
                    <Link to={`/products/${product.id}`} style={{ textDecoration:'none' }}>
                      <div style={{ background:'#fff', borderRadius:'14px', border:`1px solid ${BDR}`, overflow:'hidden', boxShadow:'0 2px 8px rgba(0,0,0,0.04)', transition:'all 0.2s' }}
                        onMouseEnter={e => { e.currentTarget.style.boxShadow='0 6px 20px rgba(0,0,0,0.1)'; e.currentTarget.style.transform='translateY(-2px)'; }}
                        onMouseLeave={e => { e.currentTarget.style.boxShadow='0 2px 8px rgba(0,0,0,0.04)'; e.currentTarget.style.transform=''; }}>
                        <div style={{ height:'160px', background:'#F0F4F0', overflow:'hidden' }}>
                          {imgUrl
                            ? <img src={imgUrl} alt={product.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                            : <div style={{ height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'40px', opacity:0.15 }}>📦</div>
                          }
                        </div>
                        <div style={{ padding:'12px' }}>
                          <p style={{ fontSize:'11px', color:T3, fontWeight:600, marginBottom:'3px', textTransform:'uppercase', letterSpacing:'0.05em' }}>{product.brand || product.category?.name}</p>
                          <p style={{ fontSize:'13px', fontWeight:600, color:T1, lineHeight:1.4, marginBottom:'6px', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{product.name}</p>
                          <p style={{ fontSize:'16px', fontWeight:800, color:T1 }}>₹{Number(product.price).toLocaleString('en-IN')}</p>
                          {!inStock && <p style={{ fontSize:'11px', color:T4, marginTop:'3px' }}>Out of stock</p>}
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
