import { useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const LG='#1B3C1A';

export default function OrderSuccessPage() {
  const { state } = useLocation();
  const navigate  = useNavigate();
  const canvasRef = useRef(null);

  useEffect(() => { if (!state?.orderId) navigate('/orders', { replace:true }); }, []);

  // Green confetti burst
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    const COLORS = ['#1B3C1A','#2E7D32','#66BB6A','#A5D6A7','#E8F5E9','#F59E0B','#fff'];
    const particles = Array.from({ length:140 }, () => ({
      x: Math.random()*canvas.width, y:-20-Math.random()*200,
      w: Math.random()*8+4, h: Math.random()*4+2,
      color: COLORS[Math.floor(Math.random()*COLORS.length)],
      vx:(Math.random()-0.5)*3, vy:Math.random()*4+2,
      rot:Math.random()*360, rotV:(Math.random()-0.5)*6, opacity:1,
    }));

    let raf;
    const draw = () => {
      ctx.clearRect(0,0,canvas.width,canvas.height);
      let alive = false;
      particles.forEach(p => {
        p.x+=p.vx; p.y+=p.vy; p.rot+=p.rotV; p.vy+=0.05;
        if (p.y < canvas.height) { alive=true; p.opacity=Math.max(0, 1-p.y/canvas.height); }
        ctx.save(); ctx.globalAlpha=p.opacity; ctx.translate(p.x,p.y); ctx.rotate((p.rot*Math.PI)/180);
        ctx.fillStyle=p.color; ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h); ctx.restore();
      });
      if (alive) raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  if (!state?.orderId) return null;

  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'24px', background:'#F4F7F4', position:'relative', overflow:'hidden' }}>
      <canvas ref={canvasRef} style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:10 }} />

      {/* Radial green glow */}
      <div style={{ position:'absolute', top:'30%', left:'50%', transform:'translateX(-50%)', width:'600px', height:'400px', background:'radial-gradient(ellipse, rgba(27,60,26,0.08) 0%, transparent 70%)', pointerEvents:'none' }} />

      <motion.div initial={{ opacity:0, scale:0.9, y:20 }} animate={{ opacity:1, scale:1, y:0 }} transition={{ duration:0.5, ease:[0.16,1,0.3,1] }}
        style={{ textAlign:'center', maxWidth:'460px', width:'100%', position:'relative', zIndex:20 }}>

        {/* Success checkmark */}
        <motion.div initial={{ scale:0 }} animate={{ scale:1 }} transition={{ delay:0.2, type:'spring', stiffness:260, damping:18 }}
          style={{ width:'88px', height:'88px', borderRadius:'50%', background:'#E8F5E9', border:'3px solid rgba(27,60,26,0.2)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 28px', boxShadow:'0 8px 32px rgba(27,60,26,0.15)' }}>
          <svg width="38" height="38" fill="none" stroke={LG} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <motion.path d="M20 6L9 17l-5-5" initial={{ pathLength:0 }} animate={{ pathLength:1 }} transition={{ delay:0.4, duration:0.6, ease:'easeOut' }} />
          </svg>
        </motion.div>

        <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}>
          <p style={{ fontSize:'13px', fontWeight:700, color:'#2E7D32', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:'12px' }}>
            ✓ Payment Confirmed
          </p>
          <h1 style={{ fontFamily:"'Playfair Display', serif", fontSize:'clamp(30px,5vw,48px)', fontWeight:900, color:'#0D1B0D', lineHeight:1.1, marginBottom:'12px', letterSpacing:'-0.02em' }}>
            Order placed<br />successfully!
          </h1>
          <p style={{ fontSize:'15px', color:'#6B806B', lineHeight:1.7, marginBottom:'28px' }}>
            Thank you for shopping with TechDrill. You'll receive a confirmation email shortly.
          </p>
        </motion.div>

        {/* Order details card */}
        <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.4 }}
          style={{ background:'#fff', border:'1px solid rgba(0,0,0,0.07)', borderRadius:'18px', padding:'22px', marginBottom:'20px', textAlign:'left', boxShadow:'0 4px 20px rgba(0,0,0,0.06)' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'14px' }}>
            <p style={{ fontSize:'12px', fontWeight:600, color:'#9FAF9F', textTransform:'uppercase', letterSpacing:'0.08em' }}>Order ID</p>
            <p style={{ fontSize:'13px', fontWeight:800, color:'#0D1B0D', fontFamily:'monospace' }}>#{state.orderId.slice(-8).toUpperCase()}</p>
          </div>
          {state.amount && (
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'14px' }}>
              <p style={{ fontSize:'12px', fontWeight:600, color:'#9FAF9F', textTransform:'uppercase', letterSpacing:'0.08em' }}>Amount Paid</p>
              <p style={{ fontFamily:"'Playfair Display', serif", fontSize:'22px', fontWeight:900, color:'#0D1B0D' }}>₹{Number(state.amount).toFixed(2)}</p>
            </div>
          )}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <p style={{ fontSize:'12px', fontWeight:600, color:'#9FAF9F', textTransform:'uppercase', letterSpacing:'0.08em' }}>Delivery</p>
            <p style={{ fontSize:'13px', color:'#2E7D32', fontWeight:700 }}>5–7 business days</p>
          </div>
        </motion.div>

        {/* Delivery progress */}
        <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.5 }}
          style={{ display:'flex', justifyContent:'space-between', marginBottom:'24px', padding:'18px 20px', background:'#fff', border:'1px solid rgba(0,0,0,0.07)', borderRadius:'14px', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
          {[['📦','Placed'],['✅','Confirmed'],['🚚','Shipped'],['🏠','Delivered']].map(([icon,label],i) => (
            <div key={label} style={{ textAlign:'center', flex:1 }}>
              <p style={{ fontSize:'22px', marginBottom:'4px', opacity:i<2?1:0.25 }}>{icon}</p>
              <p style={{ fontSize:'10px', fontWeight:i<2?700:400, color:i<2?'#0D1B0D':'#9FAF9F', lineHeight:1.4, letterSpacing:'0.04em' }}>{label}</p>
            </div>
          ))}
        </motion.div>

        {/* Actions */}
        <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.6 }}
          style={{ display:'flex', gap:'10px', flexDirection:'column' }}>
          <Link to="/orders"
            style={{ display:'flex', justifyContent:'center', padding:'14px', fontSize:'15px', fontWeight:700, borderRadius:'10px', textDecoration:'none', background:LG, color:'#fff', boxShadow:'0 2px 8px rgba(27,60,26,0.25)', transition:'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.background='#2E7D32'}
            onMouseLeave={e => e.currentTarget.style.background=LG}>
            View My Orders →
          </Link>
          <Link to="/products"
            style={{ display:'flex', justifyContent:'center', padding:'13px', fontSize:'14px', fontWeight:600, borderRadius:'10px', textDecoration:'none', background:'#fff', color:'#6B806B', border:'1.5px solid rgba(0,0,0,0.08)', transition:'all 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.background='#F0F5F0'}
            onMouseLeave={e => e.currentTarget.style.background='#fff'}>
            Continue Shopping
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
