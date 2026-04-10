import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productService } from '../services';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const LG='#1B3C1A'; const T1='#0D1B0D'; const T3='#6B806B'; const T4='#9FAF9F';
const BDR='rgba(0,0,0,0.07)';
const SPIN='@keyframes spin{to{transform:rotate(360deg)}}';

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [qty, setQty]             = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const { addToCart, toggleWishlist, inWishlist } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    productService.getOne(id)
      .then(r => setProduct(r.data.data))
      .catch(() => toast.error('Product not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) { toast.error('Please login first'); return; }
    try { await addToCart(product.id, qty); toast.success('Added to cart!'); }
    catch (e) { toast.error(e?.response?.data?.message || 'Error'); }
  };

  if (loading) return (
    <div style={{ minHeight:'100vh', paddingTop:'80px', background:'#F4F7F4' }}>
      <style>{SPIN}</style>
      <div className="container-max" style={{ padding:'32px 28px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'48px' }}>
        <div className="skeleton" style={{ aspectRatio:'1', borderRadius:'18px' }} />
        <div style={{ display:'flex', flexDirection:'column', gap:'16px', paddingTop:'16px' }}>
          {[40, 80, 60, 130, 50, 56].map((h,i) => <div key={i} className="skeleton" style={{ height:`${h}px`, borderRadius:'8px', width:i===0?'40%':i===2?'55%':i===4?'50%':'100%' }} />)}
        </div>
      </div>
    </div>
  );

  if (!product) return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'#F4F7F4', textAlign:'center', padding:'24px' }}>
      <p style={{ fontSize:'52px', marginBottom:'16px' }}>😕</p>
      <p style={{ fontFamily:"'Playfair Display', serif", fontSize:'22px', fontWeight:700, color:T1, marginBottom:'12px' }}>Product not found</p>
      <Link to="/products" className="btn-primary">Back to Products →</Link>
    </div>
  );

  const finalPrice = product.discount ? product.price*(1-product.discount/100) : product.price;

  return (
    <div style={{ minHeight:'100vh', paddingTop:'64px', paddingBottom:'80px', background:'#F4F7F4' }}>
      <style>{SPIN}</style>

      <div className="container-max" style={{ padding:'32px 28px 0' }}>
        {/* Breadcrumb */}
        <nav style={{ display:'flex', gap:'8px', alignItems:'center', marginBottom:'28px', fontSize:'13px', color:T3 }}>
          <Link to="/" style={{ color:T3, textDecoration:'none', transition:'color 0.15s' }} onMouseEnter={e => e.currentTarget.style.color=LG} onMouseLeave={e => e.currentTarget.style.color=T3}>Home</Link>
          <span>/</span>
          <Link to="/products" style={{ color:T3, textDecoration:'none', transition:'color 0.15s' }} onMouseEnter={e => e.currentTarget.style.color=LG} onMouseLeave={e => e.currentTarget.style.color=T3}>Products</Link>
          <span>/</span>
          <span style={{ color:T1, fontWeight:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'200px' }}>{product.name}</span>
        </nav>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'48px', alignItems:'start' }}>

          {/* Images */}
          <div>
            <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
              style={{ background:'#fff', borderRadius:'20px', overflow:'hidden', border:`1px solid ${BDR}`, aspectRatio:'1', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'12px', boxShadow:'0 4px 24px rgba(0,0,0,0.06)', position:'relative' }}>
              {product.images?.[activeImage]?.url
                ? <img src={product.images[activeImage].url} alt={product.name} style={{ width:'80%', height:'80%', objectFit:'contain' }} onError={e => { e.target.style.display='none'; }} />
                : <div style={{ fontSize:'80px', color:'rgba(27,60,26,0.1)', fontWeight:900 }}>{product.name?.[0]}</div>
              }
              {product.discount > 0 && (
                <span style={{ position:'absolute', top:'14px', left:'14px', background:'#C62828', color:'#fff', fontSize:'12px', fontWeight:800, padding:'4px 10px', borderRadius:'99px' }}>
                  {product.discount}% OFF
                </span>
              )}
            </motion.div>

            {/* Thumbnail strip */}
            {product.images?.length > 1 && (
              <div style={{ display:'flex', gap:'8px', overflowX:'auto' }}>
                {product.images.map((img,i) => (
                  <button key={i} onClick={() => setActiveImage(i)}
                    style={{ flexShrink:0, width:'64px', height:'64px', borderRadius:'12px', overflow:'hidden', border:`2px solid ${i===activeImage?LG:BDR}`, cursor:'pointer', background:'#fff', padding:'0', transition:'border-color 0.15s' }}>
                    <img src={img.url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
            style={{ display:'flex', flexDirection:'column', gap:'20px' }}>

            {/* Brand + Status badges */}
            <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
              {(product.brand||product.category?.name) && (
                <span style={{ fontSize:'11px', fontWeight:700, padding:'4px 12px', borderRadius:'99px', background:'#E3F2FD', color:'#1565C0' }}>
                  {product.brand || product.category?.name}
                </span>
              )}
              {product.stock <= 5 && product.stock > 0 && (
                <span style={{ fontSize:'11px', fontWeight:700, padding:'4px 12px', borderRadius:'99px', background:'#FFF3E0', color:'#E65100' }}>
                  Only {product.stock} left!
                </span>
              )}
              {product.stock === 0 && (
                <span style={{ fontSize:'11px', fontWeight:700, padding:'4px 12px', borderRadius:'99px', background:'#FFEBEE', color:'#C62828' }}>
                  Out of Stock
                </span>
              )}
            </div>

            <h1 style={{ fontFamily:"'Playfair Display', serif", fontSize:'clamp(22px,3.5vw,32px)', fontWeight:700, color:T1, lineHeight:1.3 }}>{product.name}</h1>

            {/* Rating */}
            {product.rating && (
              <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                <div style={{ display:'flex', gap:'2px' }}>
                  {[1,2,3,4,5].map(s => (
                    <span key={s} style={{ color: s<=Math.round(product.rating) ? '#F59E0B' : '#E0E0E0', fontSize:'16px' }}>★</span>
                  ))}
                </div>
                <span style={{ fontSize:'13px', color:T3 }}>{product.rating} ({product.reviewCount||0} reviews)</span>
              </div>
            )}

            {/* Price */}
            <div style={{ display:'flex', alignItems:'flex-end', gap:'12px' }}>
              <span style={{ fontFamily:"'Playfair Display', serif", fontSize:'42px', fontWeight:900, color:T1, lineHeight:1 }}>
                ₹{Number(finalPrice).toLocaleString('en-IN')}
              </span>
              {product.discount > 0 && (
                <span style={{ fontSize:'20px', color:T4, textDecoration:'line-through', paddingBottom:'4px' }}>
                  ₹{Number(product.price).toLocaleString('en-IN')}
                </span>
              )}
              {product.comparePrice && !product.discount && (
                <span style={{ fontSize:'16px', color:T4, textDecoration:'line-through', paddingBottom:'6px' }}>
                  ₹{Number(product.comparePrice).toLocaleString('en-IN')}
                </span>
              )}
            </div>

            {/* Description */}
            <p style={{ fontSize:'15px', color:T3, lineHeight:1.75 }}>{product.description}</p>

            {/* Specs */}
            {product.specs && (
              <div style={{ background:'#F8FAF8', border:`1px solid ${BDR}`, borderRadius:'12px', padding:'16px 20px' }}>
                <p style={{ fontSize:'13px', fontWeight:700, color:T1, marginBottom:'12px' }}>Specifications</p>
                <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                  {Object.entries(product.specs).map(([k,v]) => (
                    <div key={k} style={{ display:'flex', justifyContent:'space-between', fontSize:'13px' }}>
                      <span style={{ color:T3 }}>{k}</span>
                      <span style={{ fontWeight:600, color:T1 }}>{String(v)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Qty + Cart */}
            <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
              <div style={{ display:'flex', alignItems:'center', border:`1.5px solid ${BDR}`, borderRadius:'10px', overflow:'hidden', background:'#fff' }}>
                <button onClick={() => setQty(q => Math.max(1, q-1))}
                  style={{ width:'40px', height:'44px', display:'flex', alignItems:'center', justifyContent:'center', background:'none', border:'none', cursor:'pointer', fontSize:'18px', color:T3, fontFamily:'inherit' }}
                  onMouseEnter={e => e.currentTarget.style.background='#EEF7EE'}
                  onMouseLeave={e => e.currentTarget.style.background='none'}>−</button>
                <span style={{ width:'44px', textAlign:'center', fontSize:'15px', fontWeight:700, color:T1, borderLeft:`1px solid ${BDR}`, borderRight:`1px solid ${BDR}`, height:'44px', display:'flex', alignItems:'center', justifyContent:'center' }}>{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.stock||99, q+1))}
                  style={{ width:'40px', height:'44px', display:'flex', alignItems:'center', justifyContent:'center', background:'none', border:'none', cursor:'pointer', fontSize:'18px', color:T3, fontFamily:'inherit' }}
                  onMouseEnter={e => e.currentTarget.style.background='#EEF7EE'}
                  onMouseLeave={e => e.currentTarget.style.background='none'}>+</button>
              </div>

              <button onClick={handleAddToCart} disabled={product.stock===0}
                style={{ flex:1, padding:'13px 20px', borderRadius:'10px', fontSize:'15px', fontWeight:700, cursor:product.stock===0?'not-allowed':'pointer',
                  background:product.stock===0?'#E0E0E0':LG, color:product.stock===0?T4:'#fff',
                  border:'none', fontFamily:'inherit', boxShadow:product.stock===0?'none':'0 2px 8px rgba(27,60,26,0.25)', transition:'all 0.2s' }}
                onMouseEnter={e => { if(product.stock!==0) e.currentTarget.style.background='#2E7D32'; }}
                onMouseLeave={e => { if(product.stock!==0) e.currentTarget.style.background=LG; }}>
                🛒 {product.stock===0 ? 'Out of Stock' : 'Add to Cart'}
              </button>

              <button onClick={() => { if(!user){toast.error('Login first');return;} toggleWishlist(product.id); }}
                style={{ width:'48px', height:'48px', borderRadius:'10px', border:`1.5px solid ${BDR}`, background:'#fff', cursor:'pointer', fontSize:'22px', display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor='#E91E63'; e.currentTarget.style.background='#FCE4EC'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor=BDR; e.currentTarget.style.background='#fff'; }}>
                {inWishlist(product.id) ? '❤️' : '🤍'}
              </button>
            </div>

            {/* Seller info */}
            {product.admin && (
              <div style={{ display:'flex', alignItems:'center', gap:'10px', padding:'12px 16px', background:'#F0F5F0', border:'1px solid rgba(27,60,26,0.12)', borderRadius:'10px' }}>
                <div style={{ width:'32px', height:'32px', borderRadius:'50%', background:LG, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'13px', fontWeight:800, color:'#fff', flexShrink:0 }}>
                  {product.admin.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p style={{ fontSize:'12px', fontWeight:700, color:T1 }}>Sold by {product.admin.name}</p>
                  <p style={{ fontSize:'11px', color:T3 }}>Verified TechDrill Retailer</p>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Reviews */}
        {product.reviews?.length > 0 && (
          <section style={{ marginTop:'64px', paddingTop:'40px', borderTop:`1px solid ${BDR}` }}>
            <h2 style={{ fontFamily:"'Playfair Display', serif", fontSize:'24px', fontWeight:700, color:T1, marginBottom:'28px' }}>Customer Reviews</h2>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:'16px' }}>
              {product.reviews.map(rev => (
                <div key={rev.id} style={{ background:'#fff', border:`1px solid ${BDR}`, borderRadius:'14px', padding:'18px', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'10px' }}>
                    <div style={{ width:'36px', height:'36px', borderRadius:'50%', background:LG, color:'#fff', fontWeight:800, fontSize:'14px', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      {rev.user?.name?.[0]}
                    </div>
                    <div>
                      <p style={{ fontSize:'13px', fontWeight:600, color:T1 }}>{rev.user?.name}</p>
                      <div style={{ display:'flex', gap:'2px' }}>
                        {[1,2,3,4,5].map(s => <span key={s} style={{ color:s<=rev.rating?'#F59E0B':'#E0E0E0', fontSize:'12px' }}>★</span>)}
                      </div>
                    </div>
                  </div>
                  {rev.title   && <p style={{ fontSize:'13px', fontWeight:600, color:T1, marginBottom:'4px' }}>{rev.title}</p>}
                  {rev.comment && <p style={{ fontSize:'13px', color:T3, lineHeight:1.6 }}>{rev.comment}</p>}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
