import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { userService } from '../../services';
import toast from 'react-hot-toast';

const LG='#1B3C1A'; const T1='#0D1B0D'; const T3='#6B806B'; const T4='#9FAF9F';
const BDR='rgba(0,0,0,0.07)';
const SPIN='@keyframes spin{to{transform:rotate(360deg)}}';

const ROLE_BADGE = {
  ADMIN:       { bg:'#FFF3E0', color:'#E65100', label:'Retailer' },
  SUPER_ADMIN: { bg:'#FCE4EC', color:'#880E4F', label:'Super Admin' },
};

export default function SuperAdminRetailers() {
  const [retailers, setRetailers] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [page, setPage]         = useState(1);
  const [meta, setMeta]         = useState({});
  const [toggling, setToggling] = useState(null);
  const [promoting, setPromoting] = useState(null);

  const fetchRetailers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await userService.getAllAdmins({ page, limit:12 });
      setRetailers(data.data || []);
      setMeta(data.meta || {});
    } catch { toast.error('Failed to load retailers'); }
    finally { setLoading(false); }
  }, [page]);

  useEffect(() => { fetchRetailers(); }, [fetchRetailers]);

  const handleBlock = async (id, name, isBlocked) => {
    setToggling(id);
    try {
      await userService.toggleBlock(id);
      toast.success(`${name} ${isBlocked ? 'unblocked' : 'blocked'}`);
      fetchRetailers();
    } catch (e) { toast.error(e?.response?.data?.message || 'Action failed'); }
    finally { setToggling(null); }
  };

  const handleRoleChange = async (id, name, currentRole) => {
    const newRole = currentRole === 'ADMIN' ? 'SUPER_ADMIN' : 'ADMIN';
    if (!window.confirm(`Change ${name}'s role to ${newRole}?`)) return;
    setPromoting(id);
    try {
      await userService.updateRole(id, { role: newRole });
      toast.success(`${name} is now ${newRole}`);
      fetchRetailers();
    } catch (e) { toast.error(e?.response?.data?.message || 'Role change failed'); }
    finally { setPromoting(null); }
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'22px' }}>
      <style>{SPIN}</style>

      {/* Header */}
      <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}>
        <h1 style={{ fontFamily:"'Playfair Display', serif", fontSize:'26px', fontWeight:700, color:T1, marginBottom:'4px' }}>
          Retailers Management
        </h1>
        <p style={{ fontSize:'13px', color:T3 }}>
          All admin / retailer accounts on the platform · {meta.total || 0} accounts
        </p>
      </motion.div>

      {/* Stats row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'16px' }}>
        {[
          { label:'Total Retailers', value:meta.total || 0, icon:'🏪', color:'#E3F2FD', tc:'#1565C0' },
          { label:'Active Accounts', value:retailers.filter(r => !r.isBlocked).length, icon:'✅', color:'#E8F5E9', tc:'#2E7D32' },
          { label:'Blocked Accounts', value:retailers.filter(r => r.isBlocked).length, icon:'🚫', color:'#FFEBEE', tc:'#C62828' },
        ].map(s => (
          <div key={s.label} style={{ background:'#fff', border:`1px solid ${BDR}`, borderRadius:'14px', padding:'18px 20px', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'10px' }}>
              <span style={{ fontSize:'22px', background:s.color, padding:'8px', borderRadius:'10px' }}>{s.icon}</span>
              <p style={{ fontSize:'12px', color:T3, fontWeight:500 }}>{s.label}</p>
            </div>
            <p style={{ fontFamily:"'Playfair Display', serif", fontSize:'28px', fontWeight:900, color:T1 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Retailers table */}
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.1 }}
        style={{ background:'#fff', border:`1px solid ${BDR}`, borderRadius:'16px', overflow:'hidden', boxShadow:'0 2px 12px rgba(0,0,0,0.05)' }}>
        <div style={{ overflowX:'auto' }}>
          {loading ? (
            <div style={{ padding:'48px', textAlign:'center', color:T4 }}>
              <div style={{ width:'24px', height:'24px', border:'2px solid rgba(27,60,26,0.15)', borderTopColor:LG, borderRadius:'50%', animation:'spin 0.7s linear infinite', margin:'0 auto 10px' }} />
              Loading retailers…
            </div>
          ) : retailers.length === 0 ? (
            <div style={{ padding:'64px', textAlign:'center' }}>
              <div style={{ fontSize:'52px', marginBottom:'12px' }}>🏪</div>
              <p style={{ color:T3, fontSize:'15px' }}>No retailers found</p>
            </div>
          ) : (
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ borderBottom:`1.5px solid ${BDR}`, background:'#F8FAF8' }}>
                  {['Retailer','Contact','Role','Products','Revenue','Orders','Status','Actions'].map(h => (
                    <th key={h} style={{ padding:'12px 16px', textAlign:'left', fontSize:'11px', fontWeight:700, color:T3, textTransform:'uppercase', letterSpacing:'0.07em', whiteSpace:'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {retailers.map((r, idx) => {
                  const rb = ROLE_BADGE[r.role] || ROLE_BADGE.ADMIN;
                  return (
                    <tr key={r.id} style={{ borderBottom:'1px solid rgba(0,0,0,0.05)', background: idx%2===0?'#fff':'#FAFCFA', transition:'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background='#F4FAF4'}
                      onMouseLeave={e => e.currentTarget.style.background=idx%2===0?'#fff':'#FAFCFA'}>

                      {/* Name + Avatar */}
                      <td style={{ padding:'14px 16px' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                          <div style={{ width:'36px', height:'36px', borderRadius:'50%', background:LG, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px', fontWeight:800, color:'#fff', flexShrink:0 }}>
                            {r.name?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p style={{ fontSize:'13px', fontWeight:700, color:T1 }}>{r.name}</p>
                            <p style={{ fontSize:'11px', color:T4 }}>Joined {new Date(r.createdAt).toLocaleDateString('en-IN',{month:'short',year:'numeric'})}</p>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td style={{ padding:'14px 16px' }}>
                        <p style={{ fontSize:'12px', color:T1 }}>{r.email}</p>
                        {r.phone && <p style={{ fontSize:'11px', color:T4 }}>{r.phone}</p>}
                      </td>

                      {/* Role badge */}
                      <td style={{ padding:'14px 16px' }}>
                        <span style={{ fontSize:'11px', fontWeight:700, padding:'4px 10px', borderRadius:'99px', background:rb.bg, color:rb.color, border:`1px solid ${rb.color}30`, whiteSpace:'nowrap' }}>
                          {r.role === 'SUPER_ADMIN' ? '👑 ' : '🏪 '}{rb.label}
                        </span>
                      </td>

                      {/* Products */}
                      <td style={{ padding:'14px 16px', textAlign:'center' }}>
                        <span style={{ fontSize:'14px', fontWeight:700, color:T1 }}>{r.productCount}</span>
                      </td>

                      {/* Revenue */}
                      <td style={{ padding:'14px 16px' }}>
                        <p style={{ fontFamily:"'Playfair Display', serif", fontSize:'14px', fontWeight:700, color:T1 }}>₹{Number(r.revenue).toLocaleString('en-IN')}</p>
                      </td>

                      {/* Orders */}
                      <td style={{ padding:'14px 16px', textAlign:'center' }}>
                        <span style={{ fontSize:'13px', fontWeight:600, color:T3 }}>{r.orderCount}</span>
                      </td>

                      {/* Status */}
                      <td style={{ padding:'14px 16px' }}>
                        <span style={{ fontSize:'11px', fontWeight:700, padding:'4px 10px', borderRadius:'99px',
                          background: r.isBlocked ? '#FFEBEE' : '#E8F5E9',
                          color: r.isBlocked ? '#C62828' : '#2E7D32',
                          border:`1px solid ${r.isBlocked ? 'rgba(198,40,40,0.2)' : 'rgba(46,125,50,0.2)'}`,
                        }}>
                          {r.isBlocked ? '● Blocked' : '● Active'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding:'14px 16px' }}>
                        <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
                          {/* Block / Unblock */}
                          {r.role !== 'SUPER_ADMIN' && (
                            <button onClick={() => handleBlock(r.id, r.name, r.isBlocked)} disabled={toggling===r.id}
                              style={{ fontSize:'11px', fontWeight:700, padding:'5px 10px', borderRadius:'7px', cursor:'pointer', fontFamily:'inherit', border:'none', transition:'all 0.15s', opacity:toggling===r.id?0.5:1,
                                background: r.isBlocked ? '#E8F5E9' : '#FFEBEE',
                                color: r.isBlocked ? '#2E7D32' : '#C62828',
                              }}
                              onMouseEnter={e => e.currentTarget.style.opacity='0.8'}
                              onMouseLeave={e => e.currentTarget.style.opacity='1'}>
                              {toggling===r.id ? '…' : r.isBlocked ? 'Unblock' : 'Block'}
                            </button>
                          )}

                          {/* Promote / Demote */}
                          {r.role !== 'SUPER_ADMIN' && (
                            <button onClick={() => handleRoleChange(r.id, r.name, r.role)} disabled={promoting===r.id}
                              style={{ fontSize:'11px', fontWeight:700, padding:'5px 10px', borderRadius:'7px', cursor:'pointer', fontFamily:'inherit', background:'#FFF3E0', color:'#E65100', border:'1px solid rgba(230,81,0,0.2)', transition:'all 0.15s', opacity:promoting===r.id?0.5:1 }}
                              onMouseEnter={e => { e.currentTarget.style.background='#E65100'; e.currentTarget.style.color='#fff'; }}
                              onMouseLeave={e => { e.currentTarget.style.background='#FFF3E0'; e.currentTarget.style.color='#E65100'; }}>
                              {promoting===r.id ? '…' : '↑ Promote'}
                            </button>
                          )}
                          {r.role === 'SUPER_ADMIN' && (
                            <span style={{ fontSize:'11px', color:T4, fontStyle:'italic', padding:'5px 0' }}>Platform Owner</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {meta.totalPages > 1 && (
          <div style={{ padding:'14px 20px', borderTop:`1px solid ${BDR}`, display:'flex', justifyContent:'center', gap:'6px', background:'#F8FAF8' }}>
            {Array.from({ length:meta.totalPages }, (_,i) => i+1).map(p => (
              <button key={p} onClick={() => setPage(p)}
                style={{ width:'34px', height:'34px', borderRadius:'8px', fontSize:'13px', fontWeight:600, cursor:'pointer', fontFamily:'inherit',
                  background: page===p ? LG : '#fff',
                  border:`1.5px solid ${page===p ? LG : BDR}`,
                  color: page===p ? '#fff' : T3,
                }}>
                {p}
              </button>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
