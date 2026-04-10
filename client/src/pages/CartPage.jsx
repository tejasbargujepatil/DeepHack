import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const LG='#1B3C1A'; const T1='#0D1B0D'; const T3='#6B806B'; const T4='#9FAF9F';
const BDR='rgba(0,0,0,0.07)';

export default function CartPage() {
  const { cart, cartTotal, cartCount, removeFromCart, updateQuantity, fetchCart, loading } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  useEffect(() => { fetchCart(); }, []);

  const tax      = cartTotal * 0.18;
  const shipping = cartTotal > 999 ? 0 : 99;
  const total    = cartTotal + tax + shipping;

  const handleRemove = async (productId, name) => {
    try { await removeFromCart(productId); toast.success(`${name.split(' ').slice(0,2).join(' ')} removed`); }
    catch { toast.error('Failed to remove'); }
  };

  if (loading) return (
    <div style={{ minHeight:'100vh', paddingTop:'80px', background:'#F4F7F4' }}>
      <div className="container-max" style={{ padding:'0 28px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:'24px', marginTop:'32px' }}>
          <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
            {Array(3).fill(0).map((_,i) => <div key={i} className="skeleton" style={{ height:'100px', borderRadius:'14px' }} />)}
          </div>
          <div className="skeleton" style={{ height:'320px', borderRadius:'16px' }} />
        </div>
      </div>
    </div>
  );

  if (cart.length === 0) return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'#F4F7F4', textAlign:'center', padding:'24px', paddingTop:'80px' }}>
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4 }}>
        <div style={{ fontSize:'64px', marginBottom:'20px' }}>🛒</div>
        <h2 style={{ fontFamily:"'Playfair Display', serif", fontSize:'26px', fontWeight:700, color:T1, marginBottom:'8px' }}>Your cart is empty</h2>
        <p style={{ fontSize:'15px', color:T3, marginBottom:'28px' }}>Add some products to get started</p>
        <Link to="/products" className="btn-primary" style={{ fontSize:'15px', padding:'13px 32px', borderRadius:'10px' }}>Browse products →</Link>
      </motion.div>
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', paddingTop:'64px', paddingBottom:'80px', background:'#F4F7F4' }}>
      <div className="container-max" style={{ padding:'32px 28px 0' }}>
        <h1 style={{ fontFamily:"'Playfair Display', serif", fontSize:'28px', fontWeight:700, color:T1, marginBottom:'6px' }}>Your Cart</h1>
        <p style={{ fontSize:'13px', color:T3, marginBottom:'28px' }}>{cartCount} item{cartCount!==1?'s':''}</p>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:'24px', alignItems:'start' }}>

          {/* Cart items */}
          <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
            <AnimatePresence>
              {cart.map((item,i) => (
                <motion.div key={item.id||item.productId}
                  initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, height:0, marginBottom:0 }}
                  transition={{ delay:i*0.04 }}
                  style={{ background:'#fff', border:`1px solid ${BDR}`, borderRadius:'14px', padding:'16px 20px', display:'flex', gap:'16px', alignItems:'center', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>

                  {/* Thumbnail */}
                  {item.product?.images?.[0]?.url
                    ? <img src={item.product.images[0].url} alt={item.product?.name} style={{ width:'64px', height:'64px', borderRadius:'10px', objectFit:'cover', border:`1px solid ${BDR}`, flexShrink:0 }} onError={e => { e.target.style.display='none'; }} />
                    : <div style={{ width:'64px', height:'64px', borderRadius:'10px', background:'#EEF7EE', border:`1px solid ${BDR}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:'24px', fontWeight:800, color:'rgba(27,60,26,0.2)' }}>
                        {item.product?.name?.[0]}
                      </div>
                  }

                  {/* Info */}
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontSize:'12px', color:T4, marginBottom:'2px', textTransform:'uppercase', letterSpacing:'0.05em', fontWeight:500 }}>{item.product?.brand}</p>
                    <p style={{ fontSize:'14px', fontWeight:700, color:T1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.product?.name}</p>
                    <p style={{ fontSize:'16px', fontWeight:900, color:T1, marginTop:'4px', fontFamily:"'Playfair Display', serif" }}>₹{Number(item.product?.price).toLocaleString('en-IN')}</p>
                  </div>

                  {/* Qty stepper */}
                  <div style={{ display:'flex', alignItems:'center', border:`1.5px solid ${BDR}`, borderRadius:'8px', overflow:'hidden', flexShrink:0 }}>
                    <button onClick={() => item.quantity>1 ? updateQuantity(item.product?.id, item.quantity-1) : handleRemove(item.product?.id, item.product?.name||'')}
                      style={{ width:'32px', height:'32px', display:'flex', alignItems:'center', justifyContent:'center', background:'none', border:'none', cursor:'pointer', fontSize:'16px', color:T3, fontFamily:'inherit' }}
                      onMouseEnter={e => e.currentTarget.style.background='#EEF7EE'}
                      onMouseLeave={e => e.currentTarget.style.background='none'}>−</button>
                    <span style={{ width:'32px', textAlign:'center', fontSize:'13px', fontWeight:700, color:T1, borderLeft:`1px solid ${BDR}`, borderRight:`1px solid ${BDR}`, height:'32px', display:'flex', alignItems:'center', justifyContent:'center' }}>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product?.id, item.quantity+1)}
                      style={{ width:'32px', height:'32px', display:'flex', alignItems:'center', justifyContent:'center', background:'none', border:'none', cursor:'pointer', fontSize:'16px', color:T3, fontFamily:'inherit' }}
                      onMouseEnter={e => e.currentTarget.style.background='#EEF7EE'}
                      onMouseLeave={e => e.currentTarget.style.background='none'}>+</button>
                  </div>

                  {/* Line total */}
                  <p style={{ fontSize:'15px', fontWeight:900, color:T1, minWidth:'80px', textAlign:'right', flexShrink:0, fontFamily:"'Playfair Display', serif" }}>
                    ₹{(item.quantity * Number(item.product?.price)).toLocaleString('en-IN')}
                  </p>

                  {/* Remove */}
                  <button onClick={() => handleRemove(item.product?.id, item.product?.name||'Item')}
                    style={{ width:'30px', height:'30px', borderRadius:'8px', border:'none', background:'none', cursor:'pointer', color:T4, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.background='#FFEBEE'; e.currentTarget.style.color='#C62828'; }}
                    onMouseLeave={e => { e.currentTarget.style.background='none'; e.currentTarget.style.color=T4; }}>
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>

            <Link to="/products" style={{ display:'inline-flex', alignItems:'center', gap:'6px', fontSize:'13px', color:T3, textDecoration:'none', marginTop:'8px', fontWeight:500, transition:'color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.color=LG}
              onMouseLeave={e => e.currentTarget.style.color=T3}>
              ← Continue shopping
            </Link>
          </div>

          {/* Order summary */}
          <div style={{ position:'sticky', top:'80px' }}>
            <div style={{ background:'#fff', border:`1px solid ${BDR}`, borderRadius:'18px', padding:'24px', boxShadow:'0 4px 20px rgba(0,0,0,0.06)' }}>
              <p style={{ fontFamily:"'Playfair Display', serif", fontSize:'16px', fontWeight:700, color:T1, marginBottom:'20px' }}>Order Summary</p>

              <div style={{ display:'flex', flexDirection:'column', gap:'13px', marginBottom:'18px' }}>
                {[
                  { label:`Subtotal (${cartCount} item${cartCount!==1?'s':''})`, val:`₹${cartTotal.toFixed(2)}` },
                  { label:'GST (18%)',  val:`₹${tax.toFixed(2)}` },
                  { label:'Shipping',  val:shipping===0?'Free 🎉':`₹${shipping}`, green:shipping===0 },
                ].map(r => (
                  <div key={r.label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ fontSize:'13px', color:T3 }}>{r.label}</span>
                    <span style={{ fontSize:'13px', fontWeight:600, color:r.green?'#2E7D32':T1 }}>{r.val}</span>
                  </div>
                ))}
              </div>

              {shipping > 0 && (
                <p style={{ fontSize:'12px', color:'#E65100', background:'#FFF3E0', border:'1px solid rgba(230,81,0,0.2)', borderRadius:'8px', padding:'8px 12px', marginBottom:'16px' }}>
                  Add ₹{(999-cartTotal).toFixed(0)} more for free shipping
                </p>
              )}

              <div style={{ borderTop:`1px solid ${BDR}`, paddingTop:'16px', marginBottom:'20px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ fontSize:'15px', fontWeight:700, color:T1 }}>Total</span>
                <span style={{ fontFamily:"'Playfair Display', serif", fontSize:'24px', fontWeight:900, color:T1 }}>₹{total.toFixed(2)}</span>
              </div>

              <button onClick={() => user ? navigate('/checkout') : navigate('/login')}
                style={{ width:'100%', padding:'14px', borderRadius:'10px', fontSize:'15px', fontWeight:700, cursor:'pointer', background:LG, color:'#fff', border:'none', fontFamily:'inherit', boxShadow:'0 2px 8px rgba(27,60,26,0.25)', transition:'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background='#2E7D32'}
                onMouseLeave={e => e.currentTarget.style.background=LG}>
                {user ? 'Proceed to checkout →' : '🔒 Sign in to checkout'}
              </button>

              {/* Trust badges */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'8px', marginTop:'16px' }}>
                {[['🔒','Secure'],['📦','Tracked'],['↩','Returns']].map(([icon,label]) => (
                  <div key={label} style={{ textAlign:'center', padding:'10px 4px', borderRadius:'10px', border:`1px solid ${BDR}`, background:'#FAFCFA' }}>
                    <p style={{ fontSize:'18px', marginBottom:'3px' }}>{icon}</p>
                    <p style={{ fontSize:'10px', color:T3, fontWeight:600 }}>{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
