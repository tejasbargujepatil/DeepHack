import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function ProductCard({ product, index = 0 }) {
  const { addToCart } = useCart();
  const { isInWishlist, toggle } = useWishlist();
  const [adding, setAdding]     = useState(false);
  const [wishing, setWishing]   = useState(false);
  const cardRef = useRef(null);

  const inWishlist = isInWishlist(product.id);
  const inStock    = product.stock > 0;
  const discount   = product.discount ? Math.round(product.discount) : null;
  const imgUrl     = product.images?.[0]?.url;

  const handleAddToCart = async (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!inStock) return;
    setAdding(true);
    try {
      await addToCart({ productId: product.id, quantity: 1 });
      toast.success(`${product.name.split(' ').slice(0,3).join(' ')} added to cart`);
    } catch { toast.error('Could not add to cart'); }
    finally { setAdding(false); }
  };

  const handleWishlist = async (e) => {
    e.preventDefault(); e.stopPropagation();
    setWishing(true);
    try {
      await toggle(product.id);
    } catch { toast.error('Could not update wishlist'); }
    finally { setWishing(false); }
  };

  return (
    <motion.div
      initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }}
      viewport={{ once:true }} transition={{ duration:0.4, delay:index*0.05 }}>
      <Link to={`/products/${product.id}`} style={{ textDecoration:'none', display:'block', height:'100%' }}>
        <div ref={cardRef} className="product-card" style={{ height:'100%', display:'flex', flexDirection:'column', cursor:'pointer', position:'relative' }}>

          {/* Image */}
          <div style={{ height:'200px', background:'#F0F4F0', borderBottom:'1px solid rgba(0,0,0,0.06)', position:'relative', overflow:'hidden', flexShrink:0 }}>
            {imgUrl
              ? <img src={imgUrl} alt={product.name} style={{ width:'100%', height:'100%', objectFit:'cover' }}
                  onError={e => { e.target.style.display='none'; }} />
              : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <span style={{ fontSize:'64px', opacity:0.15 }}>📦</span>
                </div>
            }

            {/* Badges */}
            <div style={{ position:'absolute', top:'10px', left:'10px', display:'flex', flexDirection:'column', gap:'4px' }}>
              {product.isFeatured && <span style={{ fontSize:'10px', fontWeight:700, padding:'3px 8px', borderRadius:'99px', background:'#1B3C1A', color:'#fff' }}>Featured</span>}
              {discount && <span style={{ fontSize:'10px', fontWeight:700, padding:'3px 8px', borderRadius:'99px', background:'#C62828', color:'#fff' }}>–{discount}%</span>}
            </div>

            {/* Wishlist Heart Button */}
            <button onClick={handleWishlist} disabled={wishing}
              style={{
                position:'absolute', top:'8px', right:'8px',
                width:'32px', height:'32px', borderRadius:'50%',
                background: inWishlist ? '#FFF0F0' : 'rgba(255,255,255,0.9)',
                border: `1.5px solid ${inWishlist ? '#E53935' : 'rgba(0,0,0,0.1)'}`,
                cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:'15px', transition:'all 0.2s', boxShadow:'0 2px 8px rgba(0,0,0,0.1)',
                transform: wishing ? 'scale(0.85)' : 'scale(1)',
              }}
              title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}>
              {inWishlist ? '❤️' : '🤍'}
            </button>

            {!inStock && (
              <div style={{ position:'absolute', inset:0, background:'rgba(255,255,255,0.75)', display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(2px)' }}>
                <span style={{ fontSize:'12px', fontWeight:700, color:'#6B806B', border:'1px solid rgba(0,0,0,0.1)', padding:'5px 14px', borderRadius:'8px', background:'#fff' }}>Out of stock</span>
              </div>
            )}
          </div>

          {/* Content */}
          <div style={{ padding:'16px', flex:1, display:'flex', flexDirection:'column', gap:'6px', background:'#fff' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <p style={{ fontSize:'11px', color:'#6B806B', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em' }}>{product.brand || product.category?.name}</p>
              {Number(product.rating) > 0 && (
                <span style={{ fontSize:'11px', color:'#6B806B', display:'flex', alignItems:'center', gap:'2px' }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="#E65100"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  {product.rating}
                </span>
              )}
            </div>
            <p style={{ fontSize:'14px', fontWeight:600, color:'#0D1B0D', lineHeight:1.4, flex:1, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>
              {product.name}
            </p>
            <div style={{ display:'flex', alignItems:'center', gap:'8px', marginTop:'4px' }}>
              <span style={{ fontSize:'18px', fontWeight:800, color:'#0D1B0D', letterSpacing:'-0.02em' }}>₹{Number(product.price).toLocaleString('en-IN')}</span>
              {product.comparePrice && (
                <span style={{ fontSize:'13px', color:'#9FAF9F', textDecoration:'line-through' }}>₹{Number(product.comparePrice).toLocaleString('en-IN')}</span>
              )}
            </div>
            {inStock && product.stock <= 10 && (
              <p style={{ fontSize:'11px', color:'#E65100', fontWeight:600 }}>Only {product.stock} left!</p>
            )}
            <button onClick={handleAddToCart} disabled={!inStock || adding}
              style={{
                marginTop:'8px', padding:'10px', borderRadius:'8px', fontSize:'13px', fontWeight:700,
                cursor: inStock ? 'pointer' : 'not-allowed', transition:'all 0.2s', fontFamily:'inherit', border:'none',
                background: inStock ? (adding ? 'rgba(27,60,26,0.12)' : '#1B3C1A') : 'rgba(0,0,0,0.05)',
                color: inStock ? '#fff' : '#9FAF9F',
                boxShadow: inStock ? '0 2px 8px rgba(27,60,26,0.2)' : 'none',
              }}
              onMouseEnter={e => { if (inStock && !adding) e.currentTarget.style.background='#2E7D32'; }}
              onMouseLeave={e => { if (inStock && !adding) e.currentTarget.style.background='#1B3C1A'; }}>
              {adding ? 'Adding…' : inStock ? '+ Add to cart' : 'Unavailable'}
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
