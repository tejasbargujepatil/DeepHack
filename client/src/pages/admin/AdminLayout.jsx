import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LG = '#1B3C1A';

// NAV items visible to ALL admins
const NAV_COMMON = [
  { to:'/admin', label:'Dashboard', end:true, icon:(
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
  )},
  { to:'/admin/products', label:'My Products', icon:(
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
  )},
  { to:'/admin/orders', label:'Orders', icon:(
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
  )},
];

// NAV items visible to SUPER_ADMIN only
const NAV_SUPER = [
  { to:'/admin/retailers', label:'Retailers', icon:(
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
  )},
  { to:'/admin/users', label:'All Users', icon:(
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  )},
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [mobileSidebar, setMobileSidebar] = useState(false);

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const NAV = isSuperAdmin ? [...NAV_COMMON, ...NAV_SUPER] : NAV_COMMON;

  const current   = NAV.find(n => n.end ? location.pathname === n.to : location.pathname.startsWith(n.to));
  const pageTitle = current?.label || 'Dashboard';

  const handleLogout = async () => { await logout(); navigate('/login'); };

  const SidebarLink = ({ n }) => (
    <NavLink key={n.to} to={n.to} end={n.end} onClick={() => setMobileSidebar(false)}
      style={({ isActive }) => ({
        display:'flex', alignItems:'center', gap:'10px', padding:'10px 12px', borderRadius:'10px',
        fontSize:'13px', fontWeight: isActive ? 600 : 500,
        color: isActive ? LG : '#4A554A',
        background: isActive ? '#EEF7EE' : 'transparent',
        textDecoration:'none', marginBottom:'2px', transition:'all 0.15s',
        border: isActive ? '1px solid rgba(27,60,26,0.12)' : '1px solid transparent',
      })}
      onMouseEnter={e => {
        const active = location.pathname === n.to || (!n.end && location.pathname.startsWith(n.to));
        if (!active) { e.currentTarget.style.background='#F4FAF4'; e.currentTarget.style.color=LG; }
      }}
      onMouseLeave={e => {
        const active = location.pathname === n.to || (!n.end && location.pathname.startsWith(n.to));
        if (!active) { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#4A554A'; }
      }}>
      <span style={{ flexShrink:0, color:'inherit' }}>{n.icon}</span>
      {n.label}
    </NavLink>
  );

  const Sidebar = () => (
    <div style={{ width:'230px', background:'#fff', borderRight:'1px solid rgba(0,0,0,0.07)', display:'flex', flexDirection:'column', height:'100vh', position:'sticky', top:0, flexShrink:0, boxShadow:'2px 0 10px rgba(0,0,0,0.04)' }}>
      {/* Logo */}
      <div style={{ padding:'20px 18px 16px', borderBottom:'1px solid rgba(0,0,0,0.06)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          <div style={{ width:'34px', height:'34px', borderRadius:'10px', background:LG, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:'16px', color:'#fff', flexShrink:0 }}>T</div>
          <div>
            <p style={{ fontWeight:700, fontSize:'15px', color:'#0D1B0D', letterSpacing:'-0.01em', fontFamily:"'Playfair Display', serif" }}>TechDrill</p>
            <p style={{ fontSize:'10px', color:'#6B806B', fontWeight:500 }}>{isSuperAdmin ? 'Super Admin' : 'Seller Dashboard'}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex:1, padding:'10px', overflowY:'auto' }}>
        <p style={{ fontSize:'10px', fontWeight:700, color:'#9FAF9F', textTransform:'uppercase', letterSpacing:'0.1em', padding:'10px 10px 6px' }}>Store</p>
        {NAV_COMMON.map(n => <SidebarLink key={n.to} n={n} />)}

        {isSuperAdmin && (
          <>
            <p style={{ fontSize:'10px', fontWeight:700, color:'#9FAF9F', textTransform:'uppercase', letterSpacing:'0.1em', padding:'16px 10px 6px', borderTop:'1px solid rgba(0,0,0,0.05)', marginTop:'8px' }}>
              Platform Admin
            </p>
            {NAV_SUPER.map(n => <SidebarLink key={n.to} n={n} />)}
          </>
        )}
      </nav>

      {/* Role badge + User block */}
      <div style={{ padding:'12px', borderTop:'1px solid rgba(0,0,0,0.06)' }}>
        {isSuperAdmin && (
          <div style={{ display:'flex', alignItems:'center', gap:'6px', padding:'6px 10px', borderRadius:'8px', background:'#FFF3E0', border:'1px solid rgba(230,81,0,0.15)', marginBottom:'8px' }}>
            <span style={{ fontSize:'14px' }}>👑</span>
            <span style={{ fontSize:'11px', fontWeight:700, color:'#E65100' }}>SUPER ADMIN</span>
          </div>
        )}
        <div style={{ display:'flex', alignItems:'center', gap:'10px', padding:'10px 12px', borderRadius:'12px', background:'#F4FAF4', marginBottom:'8px', border:'1px solid rgba(27,60,26,0.08)' }}>
          <div style={{ width:'32px', height:'32px', borderRadius:'50%', background:LG, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'13px', fontWeight:800, color:'#fff', flexShrink:0 }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <p style={{ fontSize:'13px', fontWeight:600, color:'#0D1B0D', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.name}</p>
            <p style={{ fontSize:'10px', color:'#6B806B' }}>{user?.email?.split('@')[0]}</p>
          </div>
        </div>
        <NavLink to="/" style={{ display:'flex', alignItems:'center', gap:'8px', padding:'9px 12px', borderRadius:'8px', fontSize:'13px', color:'#4A554A', transition:'all 0.15s', marginBottom:'4px', textDecoration:'none' }}
          onMouseEnter={e => { e.currentTarget.style.background='#F4FAF4'; e.currentTarget.style.color=LG; }}
          onMouseLeave={e => { e.currentTarget.style.background=''; e.currentTarget.style.color='#4A554A'; }}>
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
          View Storefront
        </NavLink>
        <button onClick={handleLogout}
          style={{ width:'100%', display:'flex', alignItems:'center', gap:'8px', padding:'9px 12px', borderRadius:'8px', fontSize:'13px', color:'#C62828', transition:'all 0.15s', background:'none', border:'none', cursor:'pointer', fontFamily:'inherit', textAlign:'left' }}
          onMouseEnter={e => e.currentTarget.style.background='rgba(198,40,40,0.06)'}
          onMouseLeave={e => e.currentTarget.style.background=''}>
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#F4F7F4' }}>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex" style={{ flexShrink:0 }}><Sidebar /></div>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileSidebar && (
          <>
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              onClick={() => setMobileSidebar(false)}
              style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', zIndex:998, backdropFilter:'blur(4px)' }} />
            <motion.div initial={{ x:'-100%' }} animate={{ x:0 }} exit={{ x:'-100%' }} transition={{ type:'spring', damping:28, stiffness:280 }}
              style={{ position:'fixed', top:0, left:0, bottom:0, zIndex:999 }}>
              <Sidebar />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0, overflow:'hidden' }}>
        {/* Topbar */}
        <header style={{ height:'60px', background:'#fff', borderBottom:'1px solid rgba(0,0,0,0.07)', display:'flex', alignItems:'center', padding:'0 24px', gap:'12px', position:'sticky', top:0, zIndex:100, flexShrink:0, boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
          <button onClick={() => setMobileSidebar(o => !o)} className="lg:hidden"
            style={{ width:'36px', height:'36px', borderRadius:'9px', display:'flex', alignItems:'center', justifyContent:'center', background:'#F4FAF4', border:'1px solid rgba(0,0,0,0.08)', cursor:'pointer', color:'#4A554A', flexShrink:0 }}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="4" y1="8" x2="20" y2="8"/><line x1="4" y1="16" x2="20" y2="16"/></svg>
          </button>
          <div style={{ flex:1 }}>
            <p style={{ fontSize:'16px', fontWeight:700, color:'#0D1B0D', letterSpacing:'-0.01em', fontFamily:"'Playfair Display', serif" }}>{pageTitle}</p>
            <p style={{ fontSize:'11px', color:'#9FAF9F' }}>TechDrill · {isSuperAdmin ? 'Platform Admin' : 'Seller Portal'}</p>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
            {isSuperAdmin && (
              <span style={{ fontSize:'11px', fontWeight:700, padding:'4px 10px', borderRadius:'99px', background:'#FFF3E0', color:'#E65100', border:'1px solid rgba(230,81,0,0.2)' }}>
                👑 SUPER ADMIN
              </span>
            )}
            <span style={{ fontSize:'11px', color:'#2E7D32', display:'flex', alignItems:'center', gap:'5px', background:'#E8F5E9', padding:'4px 10px', borderRadius:'99px', fontWeight:600 }}>
              <span style={{ width:'6px', height:'6px', borderRadius:'50%', background:'#2E7D32', display:'inline-block' }} />
              Live
            </span>
            <NavLink to="/" style={{ fontSize:'13px', fontWeight:600, padding:'7px 14px', borderRadius:'8px', color:LG, background:'#EEF7EE', border:'1px solid rgba(27,60,26,0.15)', textDecoration:'none', transition:'all 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background='#DFF0DF'}
              onMouseLeave={e => e.currentTarget.style.background='#EEF7EE'}>
              ← Storefront
            </NavLink>
          </div>
        </header>

        {/* Page */}
        <main style={{ flex:1, padding:'28px', overflowY:'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
