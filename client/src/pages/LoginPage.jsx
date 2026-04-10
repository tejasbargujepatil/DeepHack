import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from      = location.state?.from?.pathname || '/';
  const [form, setForm]       = useState({ email:'', password:'' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form);
      toast.success(`Welcome back, ${user.name?.split(' ')[0]}!`);
      navigate(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' ? '/admin' : from, { replace:true });
    } catch (err) {
      const msg = err?.response?.data?.message || '';
      toast.error(
        msg.includes('No account') ? 'No account found with this email'
        : msg.includes('Incorrect') ? 'Incorrect password'
        : msg.includes('blocked')  ? 'Account has been suspended'
        : 'Sign in failed. Please try again.'
      );
    } finally { setLoading(false); }
  };

  const SPIN = `@keyframes spin{to{transform:rotate(360deg)}}`;

  return (
    <div style={{ minHeight:'100vh', display:'flex', background:'#F0F5F0' }}>
      {/* Left decorative panel */}
      <div style={{ flex:'0 0 420px', background:'linear-gradient(160deg, #1B3C1A 0%, #2E7D32 60%, #388E3C 100%)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'48px', position:'relative', overflow:'hidden' }}
        className="hidden lg:flex">
        <div style={{ position:'absolute', top:'-80px', right:'-80px', width:'320px', height:'320px', borderRadius:'50%', background:'rgba(255,255,255,0.04)' }} />
        <div style={{ position:'absolute', bottom:'-60px', left:'-60px', width:'240px', height:'240px', borderRadius:'50%', background:'rgba(255,255,255,0.04)' }} />
        <div style={{ position:'relative', zIndex:1, textAlign:'center' }}>
          <div style={{ width:'64px', height:'64px', borderRadius:'18px', background:'rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'28px', fontWeight:900, color:'#fff', margin:'0 auto 24px', backdropFilter:'blur(10px)' }}>T</div>
          <h2 style={{ fontFamily:"'Playfair Display', serif", fontSize:'32px', fontWeight:700, color:'#fff', marginBottom:'12px', letterSpacing:'-0.02em' }}>TechDrill</h2>
          <p style={{ fontSize:'15px', color:'rgba(255,255,255,0.75)', lineHeight:1.7, maxWidth:'280px' }}>
            India's premium marketplace for electronics and technology.
          </p>
          <div style={{ marginTop:'40px', display:'flex', flexDirection:'column', gap:'12px' }}>
            {['🔒 Razorpay Secured Payments','📦 Fast Pan-India Delivery','🛡️ 100% Genuine Products'].map(f => (
              <div key={f} style={{ fontSize:'13px', color:'rgba(255,255,255,0.8)', display:'flex', alignItems:'center', gap:'8px', background:'rgba(255,255,255,0.08)', padding:'10px 16px', borderRadius:'10px' }}>{f}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Right login panel */}
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'32px' }}>
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4 }}
          style={{ width:'100%', maxWidth:'420px' }}>

          {/* Mobile logo */}
          <div style={{ textAlign:'center', marginBottom:'32px' }} className="lg:hidden">
            <div style={{ width:'48px', height:'48px', borderRadius:'14px', background:'#1B3C1A', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px', fontWeight:900, color:'#fff', margin:'0 auto 14px' }}>T</div>
          </div>

          <h1 style={{ fontFamily:"'Playfair Display', serif", fontSize:'28px', fontWeight:700, color:'#0D1B0D', marginBottom:'6px', letterSpacing:'-0.02em' }}>Welcome back</h1>
          <p style={{ fontSize:'15px', color:'#6B806B', marginBottom:'32px' }}>Sign in to your TechDrill account</p>

          <div style={{ background:'#fff', borderRadius:'20px', padding:'32px', boxShadow:'0 4px 24px rgba(0,0,0,0.06)', border:'1px solid rgba(0,0,0,0.06)' }}>
            <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'18px' }}>
              <div>
                <label style={{ display:'block', fontSize:'13px', fontWeight:600, color:'#3A4E3A', marginBottom:'6px' }}>Email address</label>
                <input type="email" required autoFocus value={form.email}
                  onChange={e => setForm(f => ({ ...f, email:e.target.value }))}
                  placeholder="you@example.com" className="form-input" style={{ fontSize:'14px' }} />
              </div>
              <div>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'6px' }}>
                  <label style={{ fontSize:'13px', fontWeight:600, color:'#3A4E3A' }}>Password</label>
                  <button type="button" style={{ fontSize:'12px', color:'#1B3C1A', background:'none', border:'none', cursor:'pointer', fontFamily:'inherit', fontWeight:500 }}>Forgot password?</button>
                </div>
                <div className="input-wrap">
                  <input type={showPass ? 'text' : 'password'} required value={form.password}
                    onChange={e => setForm(f => ({ ...f, password:e.target.value }))}
                    placeholder="••••••••" className="form-input" style={{ paddingRight:'60px', fontSize:'14px' }} />
                  <button type="button" onClick={() => setShowPass(s => !s)} className="input-action" style={{ color:'#6B806B' }}>{showPass ? 'Hide' : 'Show'}</button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary"
                style={{ width:'100%', justifyContent:'center', padding:'13px', fontSize:'15px', fontWeight:700, borderRadius:'10px', marginTop:'4px' }}>
                <style>{SPIN}</style>
                {loading
                  ? <span style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                      <span style={{ width:'16px', height:'16px', border:'2px solid rgba(255,255,255,0.4)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin 0.7s linear infinite', display:'inline-block' }} />
                      Signing in…
                    </span>
                  : 'Sign in →'}
              </button>
            </form>

            {/* Demo credentials */}
            <div style={{ marginTop:'22px', padding:'16px', borderRadius:'12px', background:'#F4FAF4', border:'1px solid rgba(27,60,26,0.1)' }}>
              <p style={{ fontSize:'11px', fontWeight:700, color:'#1B3C1A', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'10px' }}>Try Demo Accounts</p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'6px' }}>
                {[
                  { label:'Super Admin', email:'admin@techdrill.com',    icon:'👑' },
                  { label:'Retailer A',  email:'retailera@techdrill.com', icon:'🏪' },
                  { label:'Customer',   email:'customer@techdrill.com',  icon:'👤' },
                ].map(d => (
                  <button key={d.label} onClick={() => setForm({ email:d.email, password:'Test@1234' })}
                    style={{ padding:'9px 8px', borderRadius:'8px', fontSize:'11px', fontWeight:600, border:'1px solid rgba(27,60,26,0.15)', background:'#fff', color:'#1B3C1A', cursor:'pointer', transition:'all 0.15s', fontFamily:'inherit', display:'flex', flexDirection:'column', alignItems:'center', gap:'3px' }}
                    onMouseEnter={e => e.currentTarget.style.background='#EEF7EE'}
                    onMouseLeave={e => e.currentTarget.style.background='#fff'}>
                    <span>{d.icon}</span>
                    {d.label}
                  </button>
                ))}
              </div>
              <p style={{ fontSize:'11px', color:'#9FAF9F', marginTop:'8px', textAlign:'center' }}>All demo accounts use password: <code style={{ background:'#EEF7EE', padding:'1px 5px', borderRadius:'3px', fontFamily:'monospace', color:'#1B3C1A' }}>Test@1234</code></p>
            </div>
          </div>

          <p style={{ textAlign:'center', fontSize:'14px', color:'#6B806B', marginTop:'20px' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color:'#1B3C1A', fontWeight:700, textDecoration:'none' }}>Create one →</Link>
          </p>
          <p style={{ textAlign:'center', fontSize:'13px', color:'#9FAF9F', marginTop:'10px' }}>
            Are you a seller?{' '}
            <Link to="/admin-register" style={{ color:'#2E7D32', fontWeight:700, textDecoration:'none' }}>Register as Retailer 🏪</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
