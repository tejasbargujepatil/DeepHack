import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const SPIN='@keyframes spin{to{transform:rotate(360deg)}}';
const LG='#1B3C1A'; const T1='#0D1B0D'; const T3='#6B806B'; const BDR='rgba(0,0,0,0.08)';

export default function AdminRegisterPage() {
  const [form, setForm]           = useState({ name:'', email:'', password:'', phone:'', adminSecret:'' });
  const [loading, setLoading]     = useState(false);
  const [showPass, setShowPass]   = useState(false);
  const [showSecret, setShowSecret] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]:v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      const { data } = await authService.registerAdmin(form);
      localStorage.setItem('accessToken',  data.data.accessToken);
      localStorage.setItem('refreshToken', data.data.refreshToken);
      toast.success('Retailer account created! Welcome 🎉');
      window.location.href = '/admin';
    } catch (err) {
      const msg = err?.response?.data?.message || 'Registration failed';
      toast.error(msg.includes('invite') ? 'Invalid admin invite code' : msg);
    } finally { setLoading(false); }
  };

  const fi = (field, extra={}) => ({
    value: form[field],
    onChange: e => set(field, e.target.value),
    style: { width:'100%', padding:'10px 14px', borderRadius:'8px', border:`1.5px solid ${BDR}`, fontSize:'14px', color:T1, background:'#fff', outline:'none', fontFamily:'inherit', transition:'border-color 0.2s', ...extra },
    onFocus: e => e.target.style.borderColor=LG,
    onBlur:  e => e.target.style.borderColor=BDR,
  });

  return (
    <div style={{ minHeight:'100vh', display:'flex', background:'#F0F5F0' }}>
      {/* Left decorative panel */}
      <div style={{ flex:'0 0 400px', background:`linear-gradient(160deg, ${LG} 0%, #2E7D32 60%, #388E3C 100%)`, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'48px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'-80px', right:'-80px', width:'300px', height:'300px', borderRadius:'50%', background:'rgba(255,255,255,0.04)' }} />
        <div style={{ position:'absolute', bottom:'-60px', left:'-60px', width:'240px', height:'240px', borderRadius:'50%', background:'rgba(255,255,255,0.04)' }} />
        <div style={{ position:'relative', zIndex:1, textAlign:'center' }}>
          <div style={{ width:'64px', height:'64px', borderRadius:'18px', background:'rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'28px', margin:'0 auto 24px' }}>🏪</div>
          <h2 style={{ fontFamily:"'Playfair Display', serif", fontSize:'28px', fontWeight:700, color:'#fff', marginBottom:'10px' }}>Sell on TechDrill</h2>
          <p style={{ fontSize:'15px', color:'rgba(255,255,255,0.75)', lineHeight:1.7, maxWidth:'280px' }}>
            Join thousands of verified retailers selling premium products across India.
          </p>
          <div style={{ marginTop:'36px', display:'flex', flexDirection:'column', gap:'10px' }}>
            {['🛒 Reach millions of customers','📦 Manage your own inventory','💰 Get paid directly to your account','📊 Real-time sales dashboard'].map(f => (
              <div key={f} style={{ fontSize:'13px', color:'rgba(255,255,255,0.85)', background:'rgba(255,255,255,0.1)', padding:'10px 16px', borderRadius:'10px', textAlign:'left' }}>{f}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form */}
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'32px', overflowY:'auto' }}>
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4 }}
          style={{ width:'100%', maxWidth:'440px' }}>

          <h1 style={{ fontFamily:"'Playfair Display', serif", fontSize:'28px', fontWeight:700, color:T1, marginBottom:'6px' }}>Retailer Registration</h1>
          <p style={{ fontSize:'15px', color:T3, marginBottom:'28px' }}>You'll need a valid invite code to register as a retailer</p>

          <div style={{ background:'#fff', borderRadius:'20px', padding:'32px', boxShadow:'0 4px 24px rgba(0,0,0,0.06)', border:`1px solid ${BDR}` }}>
            <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
              <style>{SPIN}</style>

              <div>
                <label style={{ display:'block', fontSize:'13px', fontWeight:600, color:'#3A4E3A', marginBottom:'6px' }}>Full Name</label>
                <input type="text" required autoFocus placeholder="Your full name" {...fi('name')} />
              </div>
              <div>
                <label style={{ display:'block', fontSize:'13px', fontWeight:600, color:'#3A4E3A', marginBottom:'6px' }}>Email Address</label>
                <input type="email" required placeholder="admin@yourstore.com" {...fi('email')} />
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
                  <input type={showPass?'text':'password'} required minLength={8} placeholder="Min. 8 characters" {...fi('password', { paddingRight:'60px' })} />
                  <button type="button" onClick={() => setShowPass(s => !s)}
                    style={{ position:'absolute', right:'12px', top:'50%', transform:'translateY(-50%)', fontSize:'12px', fontWeight:500, color:T3, background:'none', border:'none', cursor:'pointer', fontFamily:'inherit' }}>
                    {showPass?'Hide':'Show'}
                  </button>
                </div>
              </div>
              <div>
                <label style={{ display:'block', fontSize:'13px', fontWeight:600, color:'#3A4E3A', marginBottom:'6px' }}>
                  Admin Invite Code
                  <span style={{ marginLeft:'8px', fontSize:'10px', padding:'2px 7px', borderRadius:'4px', background:'#FFF3E0', color:'#E65100', fontWeight:700 }}>REQUIRED</span>
                </label>
                <div style={{ position:'relative' }}>
                  <input type={showSecret?'text':'password'} required placeholder="Enter invite code" {...fi('adminSecret', { paddingRight:'60px', fontFamily:'monospace', letterSpacing:'0.06em' })} />
                  <button type="button" onClick={() => setShowSecret(s => !s)}
                    style={{ position:'absolute', right:'12px', top:'50%', transform:'translateY(-50%)', fontSize:'12px', fontWeight:500, color:T3, background:'none', border:'none', cursor:'pointer', fontFamily:'inherit' }}>
                    {showSecret?'Hide':'Show'}
                  </button>
                </div>
                <p style={{ fontSize:'11px', color:'#9FAF9F', marginTop:'5px' }}>
                  Default code: <code style={{ background:'#F0F5F0', padding:'1px 6px', borderRadius:'4px', fontFamily:'monospace', color:LG }}>TECHDRILL_ADMIN_2024</code>
                </p>
              </div>

              {/* Info banner */}
              <div style={{ padding:'12px 16px', borderRadius:'10px', background:'#EEF7EE', border:`1px solid rgba(27,60,26,0.15)` }}>
                <p style={{ fontSize:'12px', color:T3, lineHeight:1.6 }}>
                  🛡️ Retailer accounts have access to manage their own products, view orders and revenue. Each retailer operates their own isolated storefront.
                </p>
              </div>

              <button type="submit" disabled={loading}
                style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:'10px', padding:'13px', borderRadius:'10px', fontSize:'15px', fontWeight:700, cursor:'pointer', background:LG, color:'#fff', border:'none', fontFamily:'inherit', marginTop:'4px', boxShadow:'0 2px 8px rgba(27,60,26,0.25)', transition:'all 0.2s', opacity:loading?0.7:1 }}
                onMouseEnter={e => { if(!loading) e.currentTarget.style.background='#2E7D32'; }}
                onMouseLeave={e => { if(!loading) e.currentTarget.style.background=LG; }}>
                {loading
                  ? <><span style={{ width:'16px', height:'16px', border:'2px solid rgba(255,255,255,0.4)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin 0.7s linear infinite', display:'inline-block' }} /> Creating…</>
                  : '🏪 Create Retailer Account'
                }
              </button>
            </form>
          </div>

          <div style={{ textAlign:'center', marginTop:'20px' }}>
            <p style={{ fontSize:'14px', color:T3 }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color:LG, fontWeight:700, textDecoration:'none' }}>Sign in →</Link>
            </p>
            <p style={{ fontSize:'13px', color:'#9FAF9F', marginTop:'8px' }}>
              <Link to="/register" style={{ color:T3, textDecoration:'none' }}>Register as a customer instead</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
