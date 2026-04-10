import { Link } from 'react-router-dom';
import { useState } from 'react';

const LG  = '#1B3C1A';
const LG2 = '#2E7D32';
const MG  = '#2A4A29';   // mid-green panel bg
const BDR = 'rgba(255,255,255,0.08)';

const SHOP_LINKS = [
  ['Laptops',      '/products?category=laptops'],
  ['Smartphones',  '/products?category=smartphones'],
  ['Audio',        '/products?category=audio'],
  ['Gaming',       '/products?category=gaming'],
  ['Accessories',  '/products?category=accessories'],
];

const ACCOUNT_LINKS = [
  ['Sign In',   '/login'],
  ['Register',  '/register'],
  ['My Orders', '/orders'],
  ['Cart',      '/cart'],
];

const COMPANY_LINKS = [
  ['Help Center', '#'],
  ['Returns',     '#'],
  ['Shipping',    '#'],
  ['Privacy',     '#'],
  ['Terms',       '#'],
];

const TRUST_BADGES = [
  { icon: '🔒', label: 'Razorpay Secured',   sub: '256-bit SSL' },
  { icon: '📦', label: 'Fast Delivery',       sub: '2-7 business days' },
  { icon: '↩',  label: '7-Day Returns',       sub: 'Hassle-free' },
  { icon: '🛡️', label: 'Genuine Products',    sub: '100% authentic' },
];

const SOCIALS = [
  { icon: (
    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  ), href:'#', label:'Facebook' },
  { icon: (
    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
    </svg>
  ), href:'#', label:'Instagram' },
  { icon: (
    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
    </svg>
  ), href:'#', label:'Twitter' },
  { icon: (
    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.79 1.54V6.78a4.85 4.85 0 01-1.02-.09z"/>
    </svg>
  ), href:'#', label:'TikTok' },
];

function FooterLink({ to, children }) {
  return (
    <Link to={to} style={{ fontSize:'14px', color:'rgba(255,255,255,0.65)', textDecoration:'none', transition:'color 0.15s', lineHeight:1 }}
      onMouseEnter={e => e.currentTarget.style.color='#fff'}
      onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.65)'}>
      {children}
    </Link>
  );
}

function ColTitle({ children }) {
  return (
    <p style={{ fontSize:'11px', fontWeight:700, color:'rgba(255,255,255,0.45)', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:'18px' }}>
      {children}
    </p>
  );
}

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail('');
    setTimeout(() => setSubscribed(false), 4000);
  };

  return (
    <footer style={{ background:LG, color:'#fff' }}>

      {/* ── Trust badge strip ──────────────────────────────────────── */}
      <div style={{ borderBottom:`1px solid ${BDR}` }}>
        <div className="container-max" style={{ padding:'0 32px' }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', borderLeft:`1px solid ${BDR}` }}>
            {TRUST_BADGES.map(b => (
              <div key={b.label}
                style={{ display:'flex', alignItems:'center', gap:'12px', padding:'20px 24px', borderRight:`1px solid ${BDR}` }}>
                <span style={{ fontSize:'22px', flexShrink:0 }}>{b.icon}</span>
                <div>
                  <p style={{ fontSize:'13px', fontWeight:600, color:'#fff', marginBottom:'2px' }}>{b.label}</p>
                  <p style={{ fontSize:'11px', color:'rgba(255,255,255,0.5)' }}>{b.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main footer body ───────────────────────────────────────── */}
      <div className="container-max" style={{ padding:'56px 32px 40px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr', gap:'48px', marginBottom:'48px' }}>

          {/* Brand column */}
          <div>
            {/* Logo */}
            <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'18px' }}>
              <div style={{ width:'38px', height:'38px', borderRadius:'12px', background:'rgba(255,255,255,0.12)', border:'1px solid rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:'18px', color:'#fff', flexShrink:0 }}>T</div>
              <span style={{ fontWeight:700, fontSize:'18px', color:'#fff', letterSpacing:'-0.02em', fontFamily:"'Playfair Display', serif" }}>TechDrill</span>
            </div>

            <p style={{ fontSize:'14px', color:'rgba(255,255,255,0.6)', lineHeight:1.8, maxWidth:'220px', marginBottom:'20px' }}>
              India's trusted marketplace for premium electronics.
            </p>

            {/* Status pill */}
            <div style={{ display:'inline-flex', alignItems:'center', gap:'7px', padding:'6px 14px', borderRadius:'99px', background:'rgba(46,125,50,0.25)', border:'1px solid rgba(46,125,50,0.4)', marginBottom:'28px' }}>
              <span style={{ width:'7px', height:'7px', borderRadius:'50%', background:'#4CAF50', boxShadow:'0 0 8px rgba(76,175,80,0.8)', display:'inline-block', animation:'pulse 2s infinite' }} />
              <span style={{ fontSize:'12px', color:'rgba(255,255,255,0.8)', fontWeight:600 }}>All systems operational</span>
            </div>

            {/* Newsletter */}
            <p style={{ fontSize:'12px', fontWeight:600, color:'rgba(255,255,255,0.55)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'10px' }}>Stay updated</p>
            {subscribed ? (
              <div style={{ display:'flex', alignItems:'center', gap:'8px', padding:'10px 14px', borderRadius:'10px', background:'rgba(76,175,80,0.15)', border:'1px solid rgba(76,175,80,0.3)' }}>
                <span style={{ fontSize:'14px' }}>✅</span>
                <span style={{ fontSize:'13px', color:'rgba(255,255,255,0.8)' }}>You're subscribed!</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} style={{ display:'flex', gap:'0' }}>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  style={{ flex:1, padding:'10px 14px', borderRadius:'10px 0 0 10px', border:'1px solid rgba(255,255,255,0.15)', background:'rgba(255,255,255,0.08)', color:'#fff', fontSize:'13px', outline:'none', fontFamily:'inherit', minWidth:0 }} />
                <button type="submit"
                  style={{ padding:'10px 16px', borderRadius:'0 10px 10px 0', background:LG2, border:'none', color:'#fff', fontSize:'13px', fontWeight:700, cursor:'pointer', fontFamily:'inherit', transition:'background 0.15s', flexShrink:0 }}
                  onMouseEnter={e => e.currentTarget.style.background='#388E3C'}
                  onMouseLeave={e => e.currentTarget.style.background=LG2}>
                  →
                </button>
              </form>
            )}

            {/* Socials */}
            <div style={{ display:'flex', gap:'8px', marginTop:'20px' }}>
              {SOCIALS.map(s => (
                <a key={s.label} href={s.href} aria-label={s.label}
                  style={{ width:'34px', height:'34px', borderRadius:'8px', background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.1)', display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(255,255,255,0.55)', textDecoration:'none', transition:'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,0.15)'; e.currentTarget.style.color='#fff'; }}
                  onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.08)'; e.currentTarget.style.color='rgba(255,255,255,0.55)'; }}>
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Shop column */}
          <div>
            <ColTitle>Shop</ColTitle>
            <ul style={{ listStyle:'none', display:'flex', flexDirection:'column', gap:'12px' }}>
              {SHOP_LINKS.map(([label, href]) => (
                <li key={label}>
                  <FooterLink to={href}>{label}</FooterLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Account column */}
          <div>
            <ColTitle>Account</ColTitle>
            <ul style={{ listStyle:'none', display:'flex', flexDirection:'column', gap:'12px' }}>
              {ACCOUNT_LINKS.map(([label, href]) => (
                <li key={label}>
                  <FooterLink to={href}>{label}</FooterLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Company column */}
          <div>
            <ColTitle>Company</ColTitle>
            <ul style={{ listStyle:'none', display:'flex', flexDirection:'column', gap:'12px' }}>
              {COMPANY_LINKS.map(([label, href]) => (
                <li key={label}>
                  <FooterLink to={href}>{label}</FooterLink>
                </li>
              ))}
            </ul>

            {/* App badge */}
            <div style={{ marginTop:'24px', padding:'12px 14px', borderRadius:'12px', background:'rgba(255,255,255,0.06)', border:`1px solid ${BDR}` }}>
              <p style={{ fontSize:'10px', color:'rgba(255,255,255,0.4)', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'0.08em', fontWeight:600 }}>Download app</p>
              <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
                {[['📱', 'App Store'], ['🤖', 'Google Play']].map(([icon, label]) => (
                  <a key={label} href="#"
                    style={{ display:'flex', alignItems:'center', gap:'7px', fontSize:'12px', color:'rgba(255,255,255,0.65)', textDecoration:'none', transition:'color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.color='#fff'}
                    onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.65)'}>
                    <span>{icon}</span> {label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom bar ─────────────────────────────────────────── */}
        <div style={{ borderTop:`1px solid ${BDR}`, paddingTop:'24px', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'12px' }}>
          <p style={{ fontSize:'13px', color:'rgba(255,255,255,0.35)' }}>
            © {new Date().getFullYear()} TechDrill Technologies Pvt. Ltd. · Made in India 🇮🇳
          </p>
          <div style={{ display:'flex', gap:'20px', flexWrap:'wrap' }}>
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(l => (
              <a key={l} href="#" style={{ fontSize:'12px', color:'rgba(255,255,255,0.35)', textDecoration:'none', transition:'color 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.color='rgba(255,255,255,0.7)'}
                onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.35)'}>
                {l}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* CSS animation for the status dot */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </footer>
  );
}
