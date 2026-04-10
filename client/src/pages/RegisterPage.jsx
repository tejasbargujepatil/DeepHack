import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const SPIN = `@keyframes spin{to{transform:rotate(360deg)}}`;
const LG = '#1B3C1A';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm]         = useState({ name:'', email:'', password:'', phone:'' });
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);

  const strength = !form.password ? 0 : form.password.length < 6 ? 1 : form.password.length < 10 ? 2 : 3;
  const strengthColors = ['#E8F0E8','#C62828','#E65100','#2E7D32'];
  const strengthLabels = ['', 'Weak', 'Fair', 'Strong'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      const { data } = await authService.register(form);
      localStorage.setItem('accessToken',  data.data.accessToken);
      localStorage.setItem('refreshToken', data.data.refreshToken);
      toast.success('Account created! Welcome to TechDrill 🎉');
      window.location.href = '/';
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  const fi = (field) => ({
    value: form[field],
    onChange: e => setForm(f => ({ ...f, [field]: e.target.value })),
    style: { width:'100%', padding:'10px 14px', borderRadius:'8px', border:'1.5px solid rgba(0,0,0,0.08)', fontSize:'14px', color:'#0D1B0D', background:'#fff', outline:'none', fontFamily:'inherit', transition:'border-color 0.2s' },
    onFocus: e => e.target.style.borderColor=LG,
    onBlur:  e => e.target.style.borderColor='rgba(0,0,0,0.08)',
  });

  return (
    <div style={{ minHeight:'100vh', display:'flex', background:'#F0F5F0' }}>
      {/* Left panel */}
      <div style={{ flex:'0 0 420px', background:`linear-gradient(160deg, ${LG} 0%, #2E7D32 60%, #388E3C 100%)`, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'48px', position:'relative', overflow:'hidden' }}
        className="hidden lg:flex">
        <div style={{ position:'absolute', top:'-80px', right:'-80px', width:'320px', height:'320px', borderRadius:'50%', background:'rgba(255,255,255,0.04)' }} />
        <div style={{ position:'absolute', bottom:'-60px', left:'-60px', width:'240px', height:'240px', borderRadius:'50%', background:'rgba(255,255,255,0.04)' }} />
        <div style={{ position:'relative', zIndex:1, textAlign:'center' }}>
          <div style={{ width:'64px', height:'64px', borderRadius:'18px', background:'rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'28px', fontWeight:900, color:'#fff', margin:'0 auto 24px' }}>T</div>
          <h2 style={{ fontFamily:"'Playfair Display', serif", fontSize:'30px', fontWeight:700, color:'#fff', marginBottom:'12px' }}>Join TechDrill</h2>
          <p style={{ fontSize:'15px', color:'rgba(255,255,255,0.75)', lineHeight:1.7, maxWidth:'280px' }}>
            Shop from thousands of products from verified retailers across India.
          </p>
          <div style={{ marginTop:'40px', display:'flex', flexDirection:'column', gap:'10px' }}>
            {['✅ Free registration — no credit card','🛡️ Secure & encrypted shopping','📦 Real-time order tracking'].map(f => (
              <div key={f} style={{ fontSize:'13px', color:'rgba(255,255,255,0.85)', background:'rgba(255,255,255,0.1)', padding:'10px 16px', borderRadius:'10px' }}>{f}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form */}
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'32px', overflowY:'auto' }}>
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4 }}
          style={{ width:'100%', maxWidth:'420px' }}>

          <h1 style={{ fontFamily:"'Playfair Display', serif", fontSize:'28px', fontWeight:700, color:'#0D1B0D', marginBottom:'6px', letterSpacing:'-0.02em' }}>Create your account</h1>
          <p style={{ fontSize:'15px', color:'#6B806B', marginBottom:'28px' }}>Join TechDrill and start shopping</p>

          <div style={{ background:'#fff', borderRadius:'20px', padding:'32px', boxShadow:'0 4px 24px rgba(0,0,0,0.06)', border:'1px solid rgba(0,0,0,0.06)' }}>
            <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
              <style>{SPIN}</style>

              <div>
                <label style={{ display:'block', fontSize:'13px', fontWeight:600, color:'#3A4E3A', marginBottom:'6px' }}>Full Name</label>
                <input type="text" required minLength={2} placeholder="Your full name" autoFocus {...fi('name')} />
              </div>

              <div>
                <label style={{ display:'block', fontSize:'13px', fontWeight:600, color:'#3A4E3A', marginBottom:'6px' }}>Email Address</label>
                <input type="email" required placeholder="you@example.com" {...fi('email')} />
              </div>

              <div>
                <label style={{ display:'block', fontSize:'13px', fontWeight:600, color:'#3A4E3A', marginBottom:'6px' }}>
                  Phone <span style={{ color:'#9FAF9F', fontWeight:400 }}>(optional)</span>
                </label>
                <input type="tel" placeholder="+91 98765 43210" {...fi('phone')} />
              </div>

              <div>
                <label style={{ display:'block', fontSize:'13px', fontWeight:600, color:'#3A4E3A', marginBottom:'6px' }}>Password</label>
                <div style={{ position:'relative' }}>
                  <input type={showPass ? 'text':'password'} required minLength={8} placeholder="Min. 8 characters" {...fi('password')} style={{ ...fi('password').style, paddingRight:'60px' }} />
                  <button type="button" onClick={() => setShowPass(s => !s)}
                    style={{ position:'absolute', right:'12px', top:'50%', transform:'translateY(-50%)', fontSize:'12px', fontWeight:500, color:'#6B806B', background:'none', border:'none', cursor:'pointer', fontFamily:'inherit' }}>
                    {showPass ? 'Hide':'Show'}
                  </button>
                </div>
                {form.password && (
                  <div style={{ marginTop:'8px' }}>
                    <div style={{ display:'flex', gap:'4px', marginBottom:'4px' }}>
                      {[1,2,3].map(l => (
                        <div key={l} style={{ flex:1, height:'3px', borderRadius:'99px', background:l<=strength?strengthColors[strength]:'rgba(0,0,0,0.08)', transition:'background 0.3s' }} />
                      ))}
                    </div>
                    <p style={{ fontSize:'11px', color:strengthColors[strength], fontWeight:600 }}>{strengthLabels[strength]}</p>
                  </div>
                )}
              </div>

              <button type="submit" disabled={loading}
                style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:'10px', padding:'13px', borderRadius:'10px', fontSize:'15px', fontWeight:700, cursor:'pointer', background:LG, color:'#fff', border:'none', fontFamily:'inherit', marginTop:'4px', boxShadow:'0 2px 8px rgba(27,60,26,0.25)', transition:'all 0.2s', opacity:loading?0.7:1 }}>
                {loading
                  ? <><span style={{ width:'16px', height:'16px', border:'2px solid rgba(255,255,255,0.4)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin 0.7s linear infinite', display:'inline-block' }} /> Creating…</>
                  : 'Create account →'
                }
              </button>
            </form>
          </div>

          <p style={{ textAlign:'center', fontSize:'14px', color:'#6B806B', marginTop:'24px' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color:LG, fontWeight:700, textDecoration:'none' }}>Sign in →</Link>
          </p>
          <p style={{ textAlign:'center', fontSize:'13px', color:'#9FAF9F', marginTop:'12px' }}>
            Want to sell?{' '}
            <Link to="/admin-register" style={{ color:LG, fontWeight:600, textDecoration:'none' }}>Register as retailer →</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
