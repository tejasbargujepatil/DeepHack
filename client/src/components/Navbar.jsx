import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [scrolled, setScrolled]     = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userOpen, setUserOpen]     = useState(false);
  const [q, setQ]                   = useState('');
  const searchRef = useRef(null);
  const userRef   = useRef(null);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => { setMobileOpen(false); setUserOpen(false); }, [location.pathname]);
  useEffect(() => { if (searchOpen) searchRef.current?.focus(); }, [searchOpen]);
  useEffect(() => {
    const fn = (e) => { if (userRef.current && !userRef.current.contains(e.target)) setUserOpen(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const isActive = (p) => location.pathname === p;
  const links = [
    { to: '/', label: 'Home' },
    { to: '/products', label: 'Products' },
    ...(user ? [{ to: '/orders', label: 'Orders' }] : []),
    ...(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' ? [{ to: '/admin', label: 'Dashboard' }] : []),
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (q.trim()) { navigate(`/products?search=${encodeURIComponent(q.trim())}`); setSearchOpen(false); setQ(''); }
  };

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        background: '#FFFFFF',
        borderBottom: scrolled ? '1px solid rgba(0,0,0,0.08)' : '1px solid rgba(0,0,0,0.06)',
        boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.06)' : 'none',
        transition: 'box-shadow 0.3s, border-color 0.3s',
      }}>
        <div className="container-max" style={{ padding: '0 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', height: '64px', gap: '8px' }}>

            {/* Logo */}
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginRight: '36px', flexShrink: 0, textDecoration: 'none' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: '#1B3C1A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '16px', color: '#fff' }}>T</div>
              <span style={{ fontWeight: 700, fontSize: '17px', color: '#0D1B0D', letterSpacing: '-0.02em', fontFamily:"'Playfair Display', serif" }}>TechDrill</span>
            </Link>

            {/* Nav links desktop */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px', flex: 1 }} className="hidden lg:flex">
              {links.map(l => (
                <Link key={l.to} to={l.to}
                  style={{
                    padding: '7px 14px', borderRadius: '8px', fontSize: '14px', fontWeight: isActive(l.to) ? 600 : 500,
                    color: isActive(l.to) ? '#1B3C1A' : '#4A554A',
                    background: isActive(l.to) ? '#EEF7EE' : 'transparent',
                    transition: 'all 0.15s', textDecoration: 'none',
                  }}
                  onMouseEnter={e => { if (!isActive(l.to)) { e.currentTarget.style.background='#F4FAF4'; e.currentTarget.style.color='#1B3C1A'; }}}
                  onMouseLeave={e => { if (!isActive(l.to)) { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#4A554A'; }}}>
                  {l.label}
                </Link>
              ))}
            </div>

            {/* Right actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {/* Search */}
              <button onClick={() => setSearchOpen(o => !o)}
                style={{ width:'38px', height:'38px', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center', background: searchOpen ? '#EEF7EE' : 'transparent', border:'1.5px solid rgba(0,0,0,0.1)', cursor:'pointer', transition:'all 0.15s', color:'#4A554A' }}>
                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              </button>

              {/* Wishlist */}
              {user && (
                <Link to="/wishlist" style={{ width:'38px', height:'38px', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center', background:'transparent', border:'1.5px solid rgba(0,0,0,0.1)', cursor:'pointer', transition:'all 0.15s', color:'#4A554A', position:'relative', textDecoration:'none' }}
                  onMouseEnter={e => { e.currentTarget.style.background='#FFF5F5'; e.currentTarget.style.borderColor='rgba(229,57,53,0.3)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.borderColor='rgba(0,0,0,0.1)'; }}
                  title="My Wishlist">
                  <svg width="15" height="15" fill={wishlistCount > 0 ? '#E53935' : 'none'} stroke={wishlistCount > 0 ? '#E53935' : 'currentColor'} strokeWidth="2" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  {wishlistCount > 0 && (
                    <span style={{ position:'absolute', top:'-5px', right:'-5px', minWidth:'17px', height:'17px', background:'#E53935', borderRadius:'99px', fontSize:'9px', fontWeight:700, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', padding:'0 3px', border:'2px solid #fff' }}>
                      {wishlistCount > 9 ? '9+' : wishlistCount}
                    </span>
                  )}
                </Link>
              )}

              {/* Cart */}
              <Link to="/cart" style={{ width:'38px', height:'38px', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center', background:'transparent', border:'1.5px solid rgba(0,0,0,0.1)', cursor:'pointer', transition:'all 0.15s', color:'#4A554A', position:'relative', textDecoration:'none' }}
                onMouseEnter={e => { e.currentTarget.style.background='#EEF7EE'; e.currentTarget.style.borderColor='rgba(27,60,26,0.2)'; }}
                onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.borderColor='rgba(0,0,0,0.1)'; }}>
                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                {cartCount > 0 && (
                  <span style={{ position:'absolute', top:'-5px', right:'-5px', minWidth:'17px', height:'17px', background:'#1B3C1A', borderRadius:'99px', fontSize:'9px', fontWeight:700, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', padding:'0 3px', border:'2px solid #fff' }}>
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>

              {/* Mobile menu toggle */}
              <button onClick={() => setMobileOpen(o => !o)}
                style={{ width:'38px', height:'38px', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center', background:'transparent', border:'1.5px solid rgba(0,0,0,0.1)', cursor:'pointer', color:'#4A554A' }}
                className="lg:hidden">
                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="4" y1="8" x2="20" y2="8"/><line x1="4" y1="16" x2="20" y2="16"/></svg>
              </button>

              {/* User */}
              {user ? (
                <div ref={userRef} style={{ position: 'relative' }} className="hidden lg:block">
                  <button onClick={() => setUserOpen(o => !o)}
                    style={{ display:'flex', alignItems:'center', gap:'8px', padding:'6px 12px 6px 6px', borderRadius:'99px', cursor:'pointer', transition:'all 0.15s',
                      background: userOpen ? '#EEF7EE' : 'rgba(0,0,0,0.04)',
                      border:'1.5px solid rgba(0,0,0,0.08)', color:'#0D1B0D' }}>
                    <div style={{ width:'28px', height:'28px', borderRadius:'50%', background:'#1B3C1A', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:800, color:'#fff', flexShrink:0 }}>
                      {user.name?.[0]?.toUpperCase()}
                    </div>
                    <span style={{ fontSize:'13px', fontWeight:600, maxWidth:'72px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', color:'#0D1B0D' }}>{user.name?.split(' ')[0]}</span>
                    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" style={{ opacity:0.4 }}><path d="m6 9 6 6 6-6"/></svg>
                  </button>

                  <AnimatePresence>
                    {userOpen && (
                      <motion.div initial={{ opacity:0, y:6, scale:0.97 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:6, scale:0.97 }} transition={{ duration:0.15 }}
                        style={{ position:'absolute', top:'calc(100% + 8px)', right:0, width:'220px', background:'#fff', borderRadius:'16px', border:'1px solid rgba(0,0,0,0.08)', boxShadow:'0 16px 48px rgba(0,0,0,0.12)', overflow:'hidden', zIndex:100 }}>
                        <div style={{ padding:'14px 16px', borderBottom:'1px solid rgba(0,0,0,0.06)', background:'#F8FAF8' }}>
                          <p style={{ fontSize:'13px', fontWeight:700, color:'#0D1B0D' }}>{user.name}</p>
                          <p style={{ fontSize:'11px', color:'#4A554A', marginTop:'2px' }}>{user.email}</p>
                        </div>
                        <div style={{ padding:'6px' }}>
                           {
                              [
                                { to:'/orders',   label:'My Orders',   icon:'📦' },
                                { to:'/wishlist', label:'My Wishlist',  icon:'❤️' },
                                ...(user.role==='ADMIN'||user.role==='SUPER_ADMIN' ? [{ to:'/admin', label:'Admin Dashboard', icon:'⚙️' }] : []),
                              ].map(l => (
                            <Link key={l.to} to={l.to}
                              style={{ display:'flex', alignItems:'center', gap:'8px', padding:'10px 12px', borderRadius:'10px', fontSize:'13px', color:'#4A554A', transition:'all 0.15s', textDecoration:'none' }}
                              onMouseEnter={e => { e.currentTarget.style.background='#F4FAF4'; e.currentTarget.style.color='#1B3C1A'; }}
                              onMouseLeave={e => { e.currentTarget.style.background=''; e.currentTarget.style.color='#4A554A'; }}>
                              <span>{l.icon}</span>{l.label}
                            </Link>
                          ))}
                          <div style={{ height:'1px', background:'rgba(0,0,0,0.06)', margin:'4px 0' }} />
                          <button onClick={async () => { await logout(); navigate('/login'); }}
                            style={{ width:'100%', display:'flex', alignItems:'center', gap:'8px', padding:'10px 12px', borderRadius:'10px', fontSize:'13px', color:'#C62828', transition:'all 0.15s', textAlign:'left', cursor:'pointer', background:'none', border:'none', fontFamily:'inherit' }}
                            onMouseEnter={e => e.currentTarget.style.background='rgba(198,40,40,0.06)'}
                            onMouseLeave={e => e.currentTarget.style.background=''}>
                            <span>🚪</span> Sign out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div style={{ display:'flex', gap:'8px' }} className="hidden lg:flex">
                  <Link to="/login" style={{ padding:'8px 18px', borderRadius:'8px', fontSize:'14px', fontWeight:500, color:'#1B3C1A', background:'transparent', border:'1.5px solid rgba(27,60,26,0.25)', textDecoration:'none', transition:'all 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background='#EEF7EE'}
                    onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                    Sign in
                  </Link>
                  <Link to="/register" className="btn-primary" style={{ fontSize:'14px', padding:'8px 20px', borderRadius:'8px' }}>Get started</Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Search bar drop-down */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }} exit={{ height:0, opacity:0 }}
              style={{ overflow:'hidden', borderTop:'1px solid rgba(0,0,0,0.06)', background:'#F8FAF8' }}>
              <form onSubmit={handleSearch} style={{ display:'flex', gap:'10px', padding:'14px 28px', maxWidth:'1200px', margin:'0 auto' }}>
                <input ref={searchRef} value={q} onChange={e => setQ(e.target.value)} placeholder="Search products, brands…" className="form-input" style={{ flex:1, fontSize:'14px' }} />
                <button type="submit" className="btn-primary" style={{ flexShrink:0, borderRadius:'8px', padding:'10px 22px' }}>Search</button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} onClick={() => setMobileOpen(false)}
              style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', zIndex:998, backdropFilter:'blur(6px)' }} />
            <motion.div initial={{ x:'100%' }} animate={{ x:0 }} exit={{ x:'100%' }} transition={{ type:'spring', damping:28, stiffness:280 }}
              style={{ position:'fixed', top:0, right:0, bottom:0, width:'280px', background:'#fff', borderLeft:'1px solid rgba(0,0,0,0.08)', zIndex:999, overflow:'auto', boxShadow:'-8px 0 40px rgba(0,0,0,0.1)' }}>
              <div style={{ padding:'20px', borderBottom:'1px solid rgba(0,0,0,0.06)', display:'flex', justifyContent:'space-between', alignItems:'center', background:'#F8FAF8' }}>
                <span style={{ fontWeight:700, fontSize:'16px', color:'#0D1B0D', fontFamily:"'Playfair Display', serif" }}>TechDrill</span>
                <button onClick={() => setMobileOpen(false)} style={{ width:'32px', height:'32px', borderRadius:'8px', background:'rgba(0,0,0,0.06)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#4A554A' }}>
                  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
              <div style={{ padding:'10px' }}>
                {links.map(l => (
                  <Link key={l.to} to={l.to} onClick={() => setMobileOpen(false)}
                    style={{ display:'block', padding:'12px 14px', borderRadius:'10px', fontSize:'15px', fontWeight:isActive(l.to)?600:400, color:isActive(l.to)?'#1B3C1A':'#4A554A', background:isActive(l.to)?'#EEF7EE':'transparent', marginBottom:'2px', textDecoration:'none' }}>
                    {l.label}
                  </Link>
                ))}
              </div>
              <div style={{ padding:'12px', borderTop:'1px solid rgba(0,0,0,0.06)', marginTop:'8px' }}>
                {user
                  ? <button onClick={async () => { await logout(); navigate('/login'); setMobileOpen(false); }} style={{ width:'100%', padding:'12px', borderRadius:'10px', background:'rgba(198,40,40,0.08)', color:'#C62828', border:'1px solid rgba(198,40,40,0.15)', cursor:'pointer', fontWeight:600, fontSize:'14px', fontFamily:'inherit' }}>Sign out</button>
                  : <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                      <Link to="/login"    className="btn-secondary" style={{ justifyContent:'center' }} onClick={() => setMobileOpen(false)}>Sign in</Link>
                      <Link to="/register" className="btn-primary"   style={{ justifyContent:'center', borderRadius:'8px' }} onClick={() => setMobileOpen(false)}>Get started</Link>
                    </div>
                }
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
