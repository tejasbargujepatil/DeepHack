import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { productService } from '../services';
import ProductCard from '../components/ProductCard';

const LG  = '#1B3C1A';
const ease = [0.16, 1, 0.3, 1];
const fadeUp = (delay=0) => ({
  initial:{ opacity:0, y:28 },
  whileInView:{ opacity:1, y:0 },
  viewport:{ once:true },
  transition:{ duration:0.6, delay, ease },
});

export default function HomePage() {
  return (
    <div style={{ background:'#F4F7F4', overflowX:'hidden' }}>
      <Hero />
      <Brands />
      <FeaturedProducts />
      <FeatureGrid />
      <CTA />
    </div>
  );
}

/* ─── HERO ─────────────────────────────────────────────── */
function Hero() {
  return (
    <section style={{ minHeight:'92vh', display:'flex', alignItems:'center', position:'relative', overflow:'hidden', paddingTop:'64px', background:'linear-gradient(160deg, #F0F5F0 0%, #E8F4E8 40%, #F4F7F4 100%)' }}>
      {/* Decorative leaf shapes */}
      <div style={{ position:'absolute', top:'-100px', right:'-80px', width:'600px', height:'600px', borderRadius:'50%', background:'radial-gradient(ellipse, rgba(27,60,26,0.06) 0%, transparent 70%)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', bottom:'-80px', left:'-100px', width:'500px', height:'500px', borderRadius:'50%', background:'radial-gradient(ellipse, rgba(46,125,50,0.05) 0%, transparent 70%)', pointerEvents:'none' }} />

      <div className="container-max" style={{ padding:'0 32px', width:'100%', position:'relative', zIndex:1 }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'64px', alignItems:'center', minHeight:'calc(92vh - 64px)' }}>

          {/* LEFT */}
          <div>
            {/* Pill badge */}
            <motion.div {...fadeUp(0)} style={{ marginBottom:'24px' }}>
              <span style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'6px 14px 6px 8px', borderRadius:'99px',
                background:'#fff', border:'1px solid rgba(27,60,26,0.15)', fontSize:'13px', color:'#3A4E3A', boxShadow:'0 2px 8px rgba(0,0,0,0.06)' }}>
                <span style={{ background:LG, color:'#fff', padding:'2px 10px', borderRadius:'99px', fontSize:'11px', fontWeight:700 }}>NEW</span>
                Free shipping on orders over ₹999
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1 {...fadeUp(0.05)}
              style={{ fontFamily:"'Playfair Display', serif", fontSize:'clamp(38px,5.5vw,68px)', fontWeight:900, color:'#0D1B0D', letterSpacing:'-0.03em', lineHeight:1.1, marginBottom:'22px' }}>
              Premium Tech,<br />
              <span style={{ color:LG }}>India's</span> Best Prices.
            </motion.h1>

            <motion.p {...fadeUp(0.1)}
              style={{ fontSize:'18px', color:'#6B806B', lineHeight:1.7, maxWidth:'460px', marginBottom:'40px' }}>
              Shop from thousands of verified retailers. Get the latest gadgets with guaranteed authenticity and fast delivery.
            </motion.p>

            {/* CTAs */}
            <motion.div {...fadeUp(0.15)} style={{ display:'flex', gap:'14px', flexWrap:'wrap', marginBottom:'52px', alignItems:'center' }}>
              <Link to="/products" className="btn-primary" style={{ padding:'14px 36px', fontSize:'16px', fontWeight:700, borderRadius:'10px' }}>
                Shop Now →
              </Link>
              <Link to="/register" className="btn-secondary" style={{ padding:'13px 28px', fontSize:'15px', borderRadius:'10px' }}>
                Sell on TechDrill
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div {...fadeUp(0.2)} style={{ display:'flex', gap:'32px', paddingTop:'28px', borderTop:'1px solid rgba(0,0,0,0.08)' }}>
              {[['50K+','Happy customers'],['200+','Premium products'],['4.9★','Average rating'],['24hr','Support']].map(([val, label]) => (
                <div key={label}>
                  <p style={{ fontSize:'22px', fontWeight:900, color:'#0D1B0D', letterSpacing:'-0.03em', marginBottom:'4px', fontFamily:"'Playfair Display', serif" }}>{val}</p>
                  <p style={{ fontSize:'12px', color:'#6B806B', fontWeight:500 }}>{label}</p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* RIGHT — product showcase */}
          <motion.div initial={{ opacity:0, x:40 }} animate={{ opacity:1, x:0 }} transition={{ duration:0.8, ease }}
            style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
            {[
              { emoji:'💻', name:'MacBook Pro M4', price:'₹1,79,999', badge:'New Arrival', sub:'Apple Silicon' },
              { emoji:'📱', name:'iPhone 15 Pro Max', price:'₹1,39,999', badge:'Best Seller', sub:'Titanium Edition' },
              { emoji:'🎧', name:'Sony WH-1000XM5', price:'₹29,999', badge:'Top Rated', sub:'Noise Cancelling' },
            ].map((item, i) => (
              <motion.div key={item.name} initial={{ opacity:0, x:40 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.2+i*0.1, duration:0.6, ease }}
                style={{ background:'#fff', border:'1px solid rgba(0,0,0,0.07)', borderRadius:'16px', padding:'20px', display:'flex', alignItems:'center', gap:'18px', boxShadow:'0 4px 20px rgba(0,0,0,0.06)', transition:'transform 0.2s, box-shadow 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='0 12px 32px rgba(0,0,0,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='0 4px 20px rgba(0,0,0,0.06)'; }}>
                <div style={{ width:'56px', height:'56px', borderRadius:'14px', background:'#F0F5F0', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'28px', flexShrink:0 }}>{item.emoji}</div>
                <div style={{ flex:1 }}>
                  <p style={{ fontSize:'14px', fontWeight:700, color:'#0D1B0D' }}>{item.name}</p>
                  <p style={{ fontSize:'12px', color:'#9FAF9F' }}>{item.sub}</p>
                </div>
                <div style={{ textAlign:'right' }}>
                  <p style={{ fontSize:'16px', fontWeight:900, color:'#0D1B0D', fontFamily:"'Playfair Display', serif" }}>{item.price}</p>
                  <span style={{ fontSize:'10px', fontWeight:700, padding:'2px 8px', borderRadius:'99px', background:'#E8F5E9', color:LG }}>{item.badge}</span>
                </div>
              </motion.div>
            ))}
            <div style={{ background:`linear-gradient(135deg, ${LG}, #388E3C)`, borderRadius:'16px', padding:'24px', display:'flex', justifyContent:'space-between', alignItems:'center', boxShadow:`0 8px 24px rgba(27,60,26,0.25)` }}>
              <div>
                <p style={{ fontSize:'13px', color:'rgba(255,255,255,0.75)', marginBottom:'4px' }}>Trusted by retailers across India</p>
                <p style={{ fontSize:'22px', fontWeight:900, color:'#fff', fontFamily:"'Playfair Display', serif" }}>Start Selling Today</p>
              </div>
              <Link to="/admin-register" style={{ background:'rgba(255,255,255,0.2)', color:'#fff', padding:'10px 18px', borderRadius:'10px', fontSize:'13px', fontWeight:700, textDecoration:'none', backdropFilter:'blur(10px)', border:'1px solid rgba(255,255,255,0.3)', whiteSpace:'nowrap' }}>
                Register →
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ─── BRAND STRIP ─────────────────────────────────────── */
function Brands() {
  const brands = ['Apple','Samsung','Sony','Dell','Bose','Logitech','Microsoft','OnePlus','Asus','Boat'];
  return (
    <section style={{ borderTop:'1px solid rgba(0,0,0,0.07)', borderBottom:'1px solid rgba(0,0,0,0.07)', padding:'18px 0', overflow:'hidden', background:'#fff' }}>
      <div style={{ display:'flex', gap:'0', animation:'marquee 28s linear infinite', width:'max-content' }}>
        {[...brands,...brands].map((b,i) => (
          <span key={i} style={{ padding:'0 48px', fontSize:'13px', fontWeight:700, color:'#9FAF9F', letterSpacing:'0.1em', textTransform:'uppercase', whiteSpace:'nowrap' }}>
            {b}
          </span>
        ))}
      </div>
      <style>{`@keyframes marquee{ from{transform:translateX(0)} to{transform:translateX(-50%)} }`}</style>
    </section>
  );
}

/* ─── FEATURED PRODUCTS ───────────────────────────────── */
function FeaturedProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    productService.getAll({ featured:true, limit:4 })
      .then(r => setProducts(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <section style={{ padding:'96px 0', background:'#F4F7F4' }}>
      <div className="container-max" style={{ padding:'0 32px' }}>
        <motion.div {...fadeUp()} style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:'48px', gap:'16px' }}>
          <div>
            <p style={{ fontSize:'12px', fontWeight:700, color:LG, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'10px' }}>Featured</p>
            <h2 style={{ fontFamily:"'Playfair Display', serif", fontSize:'clamp(28px,4vw,42px)', fontWeight:900, color:'#0D1B0D', letterSpacing:'-0.02em' }}>Top Picks</h2>
          </div>
          <Link to="/products" className="btn-secondary" style={{ fontSize:'13px', flexShrink:0 }}>View all →</Link>
        </motion.div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))', gap:'20px' }}>
          {loading
            ? Array(4).fill(0).map((_,i) => (
                <div key={i} style={{ background:'#fff', border:'1px solid rgba(0,0,0,0.07)', borderRadius:'14px', overflow:'hidden' }}>
                  <div className="skeleton" style={{ height:'200px' }} />
                  <div style={{ padding:'16px', display:'flex', flexDirection:'column', gap:'8px' }}>
                    <div className="skeleton" style={{ height:'12px', width:'35%', borderRadius:'4px' }} />
                    <div className="skeleton" style={{ height:'16px', width:'75%', borderRadius:'4px' }} />
                    <div className="skeleton" style={{ height:'20px', width:'45%', marginTop:'8px', borderRadius:'4px' }} />
                  </div>
                </div>
              ))
            : products.map((p,i) => <ProductCard key={p.id} product={p} index={i} />)
          }
        </div>
      </div>
    </section>
  );
}

/* ─── FEATURE GRID ─────────────────────────────────────── */
const FEATURES = [
  { icon:'⚡', title:'AI Recommendations', desc:'Personalized picks powered by our intelligent engine.' },
  { icon:'🔒', title:'Secure Payments',    desc:'Bank-grade encryption with Razorpay. Zero stored card data.' },
  { icon:'🚚', title:'Fast Delivery',      desc:'Express 2–3 day delivery across India with live tracking.' },
  { icon:'↩', title:'7-Day Returns',      desc:'Free, hassle-free returns within 7 days of delivery.' },
  { icon:'🛡️', title:'Genuine Products',  desc:'100% authentic products with manufacturer warranty.' },
  { icon:'💬', title:'24/7 Support',       desc:'Our AI assistant and support team are always available.' },
];

function FeatureGrid() {
  return (
    <section style={{ padding:'96px 0', borderTop:'1px solid rgba(0,0,0,0.07)', background:'#fff' }}>
      <div className="container-max" style={{ padding:'0 32px' }}>
        <motion.div {...fadeUp()} style={{ textAlign:'center', marginBottom:'64px' }}>
          <p style={{ fontSize:'12px', fontWeight:700, color:LG, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'12px' }}>Why TechDrill</p>
          <h2 style={{ fontFamily:"'Playfair Display', serif", fontSize:'clamp(28px,4vw,44px)', fontWeight:900, color:'#0D1B0D' }}>
            Built for people who<br />demand the best
          </h2>
        </motion.div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'1px', background:'rgba(0,0,0,0.06)', borderRadius:'20px', overflow:'hidden', border:'1px solid rgba(0,0,0,0.06)' }}>
          {FEATURES.map((f, i) => (
            <motion.div key={f.title} {...fadeUp(i*0.05)}
              style={{ padding:'40px 36px', background:'#fff', transition:'background 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background='#F4FAF4'}
              onMouseLeave={e => e.currentTarget.style.background='#fff'}>
              <span style={{ fontSize:'30px', display:'block', marginBottom:'16px' }}>{f.icon}</span>
              <p style={{ fontSize:'16px', fontWeight:700, color:'#0D1B0D', marginBottom:'10px', fontFamily:"'Playfair Display', serif" }}>{f.title}</p>
              <p style={{ fontSize:'14px', color:'#6B806B', lineHeight:1.7 }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── CTA BANNER ─────────────────────────────────────── */
function CTA() {
  return (
    <section style={{ padding:'0 0 96px', background:'#F4F7F4' }}>
      <div className="container-max" style={{ padding:'0 32px' }}>
        <motion.div {...fadeUp()}
          style={{ textAlign:'center', padding:'80px 48px', borderRadius:'24px',
            background:`linear-gradient(135deg, ${LG} 0%, #2E7D32 60%, #388E3C 100%)`,
            position:'relative', overflow:'hidden', boxShadow:`0 24px 80px rgba(27,60,26,0.25)` }}>
          <div style={{ position:'absolute', top:'-100px', left:'-100px', width:'400px', height:'400px', background:'radial-gradient(circle, rgba(255,255,255,0.06), transparent 70%)', pointerEvents:'none' }} />
          <div style={{ position:'absolute', bottom:'-80px', right:'-80px', width:'350px', height:'350px', background:'radial-gradient(circle, rgba(255,255,255,0.04), transparent 70%)', pointerEvents:'none' }} />

          <p style={{ fontSize:'12px', fontWeight:700, color:'rgba(255,255,255,0.7)', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:'18px' }}>Limited Time Offer</p>
          <h2 style={{ fontFamily:"'Playfair Display', serif", fontSize:'clamp(28px,4vw,52px)', fontWeight:900, color:'#fff', marginBottom:'16px', letterSpacing:'-0.02em', position:'relative' }}>
            Free shipping on<br />your first order
          </h2>
          <p style={{ fontSize:'17px', color:'rgba(255,255,255,0.8)', marginBottom:'40px', maxWidth:'420px', margin:'0 auto 40px', lineHeight:1.7, position:'relative' }}>
            Join 50,000+ customers who trust TechDrill for their technology needs.
          </p>
          <div style={{ display:'flex', gap:'14px', justifyContent:'center', position:'relative' }}>
            <Link to="/register" style={{ background:'#fff', color:LG, padding:'14px 36px', borderRadius:'10px', fontSize:'15px', fontWeight:800, textDecoration:'none', transition:'all 0.2s', boxShadow:'0 4px 16px rgba(0,0,0,0.15)' }}
              onMouseEnter={e => e.currentTarget.style.transform='translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform=''}>
              Get started free →
            </Link>
            <Link to="/products" style={{ background:'rgba(255,255,255,0.15)', color:'#fff', padding:'14px 32px', borderRadius:'10px', fontSize:'15px', fontWeight:600, textDecoration:'none', border:'1.5px solid rgba(255,255,255,0.3)', backdropFilter:'blur(8px)', transition:'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.22)'}
              onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.15)'}>
              Browse products
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
