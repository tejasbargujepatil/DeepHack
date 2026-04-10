import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { userService } from '../../services';
import toast from 'react-hot-toast';

const LG='#1B3C1A'; const T1='#0D1B0D'; const T3='#6B806B'; const T4='#9FAF9F';
const BDR='rgba(0,0,0,0.07)';
const SPIN='@keyframes spin{to{transform:rotate(360deg)}}';

const RC = {
  CUSTOMER:   { bg:'#E8F5E9', color:'#2E7D32' },
  ADMIN:      { bg:'#FFF3E0', color:'#E65100' },
  SUPER_ADMIN:{ bg:'#FCE4EC', color:'#C62828' },
};

export default function AdminUsers() {
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [page, setPage]         = useState(1);
  const [meta, setMeta]         = useState({});
  const [search, setSearch]     = useState('');
  const [toggling, setToggling] = useState(null);

  const [role, setRole]         = useState('');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await userService.getAllUsers({ page, search: search||undefined, role: role||undefined, limit:15 });
      setUsers(data.data || []);
      setMeta(data.meta || {});
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  }, [page, search, role]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const toggleBlock = async (u) => {
    setToggling(u.id);
    try {
      await userService.toggleBlock(u.id);
      toast.success(u.isBlocked ? 'User unblocked' : 'User blocked');
      setUsers(prev => prev.map(x => x.id===u.id ? { ...x, isBlocked:!u.isBlocked } : x));
    } catch (e) { toast.error(e?.response?.data?.message || 'Action failed'); }
    finally { setToggling(null); }
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'20px' }}>
      <style>{SPIN}</style>

      <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
        style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'12px' }}>
        <div>
          <h1 style={{ fontSize:'28px', fontWeight:700, color:T1, marginBottom:'4px', fontFamily:"'Playfair Display', serif" }}>Users</h1>
          <p style={{ fontSize:'13px', color:T3 }}>{meta.total || 0} registered users</p>
        </div>
        <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
          <input value={search} onChange={e => setSearch(e.target.value)}
            onKeyDown={e => { if(e.key==='Enter'){setPage(1);fetchUsers();}}}
            placeholder="Search name or email…"
            style={{ padding:'9px 14px', borderRadius:'8px', fontSize:'13px', border:`1.5px solid ${BDR}`, background:'#fff', color:T1, outline:'none', width:'220px', fontFamily:'inherit' }} />
          <select value={role} onChange={e => { setRole(e.target.value); setPage(1); }}
            style={{ padding:'9px 14px', borderRadius:'8px', fontSize:'13px', border:`1.5px solid ${BDR}`, background:'#fff', color:T1, outline:'none', fontFamily:'inherit', cursor:'pointer' }}>
            <option value=''>All roles</option>
            <option value='CUSTOMER'>Customers</option>
            <option value='EMPLOYEE'>Employees</option>
          </select>
          <button onClick={() => { setPage(1); fetchUsers(); }}
            style={{ padding:'9px 18px', borderRadius:'8px', background:LG, color:'#fff', border:'none', cursor:'pointer', fontWeight:700, fontSize:'13px', fontFamily:'inherit', boxShadow:'0 2px 8px rgba(27,60,26,0.25)' }}>
            Search
          </button>
        </div>
      </motion.div>

      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.1 }}
        style={{ background:'#fff', border:`1px solid ${BDR}`, borderRadius:'16px', overflow:'hidden', boxShadow:'0 2px 12px rgba(0,0,0,0.05)' }}>
        <div style={{ overflowX:'auto' }}>
          {loading
            ? <div style={{ padding:'48px', textAlign:'center', color:T4, fontSize:'13px' }}>
                <div style={{ width:'24px', height:'24px', border:'2px solid rgba(27,60,26,0.15)', borderTopColor:LG, borderRadius:'50%', animation:'spin 0.7s linear infinite', margin:'0 auto 10px' }} />
                Loading users…
              </div>
            : users.length === 0
              ? <div style={{ padding:'60px', textAlign:'center', color:T4, fontSize:'14px' }}>No users found</div>
              : <table style={{ width:'100%', borderCollapse:'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom:`1.5px solid ${BDR}`, background:'#F8FAF8' }}>
                      {['User','Email','Role','Joined','Status','Action'].map(h => (
                        <th key={h} style={{ padding:'12px 18px', textAlign:'left', fontSize:'11px', fontWeight:700, color:T3, textTransform:'uppercase', letterSpacing:'0.07em', whiteSpace:'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u,idx) => (
                      <tr key={u.id}
                        style={{ borderBottom:`1px solid rgba(0,0,0,0.04)`, transition:'background 0.15s', background:idx%2===0?'#fff':'#FAFCFA' }}
                        onMouseEnter={e => e.currentTarget.style.background='#F4FAF4'}
                        onMouseLeave={e => e.currentTarget.style.background=idx%2===0?'#fff':'#FAFCFA'}>
                        <td style={{ padding:'12px 18px' }}>
                          <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                            <div style={{ width:'34px', height:'34px', borderRadius:'50%', background:LG, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'13px', fontWeight:800, color:'#fff', flexShrink:0 }}>
                              {u.name?.[0]?.toUpperCase()}
                            </div>
                            <span style={{ fontSize:'13px', fontWeight:600, color:T1 }}>{u.name}</span>
                          </div>
                        </td>
                        <td style={{ padding:'12px 18px', fontSize:'12px', color:T3 }}>{u.email}</td>
                        <td style={{ padding:'12px 18px' }}>
                          <span style={{ fontSize:'10px', fontWeight:700, padding:'4px 10px', borderRadius:'99px',
                            background:(RC[u.role]||RC.CUSTOMER).bg, color:(RC[u.role]||RC.CUSTOMER).color }}>
                            {u.role}
                          </span>
                        </td>
                        <td style={{ padding:'12px 18px', fontSize:'12px', color:T4 }}>
                          {new Date(u.createdAt).toLocaleDateString('en-IN')}
                        </td>
                        <td style={{ padding:'12px 18px' }}>
                          <span style={{ fontSize:'11px', fontWeight:700, padding:'4px 10px', borderRadius:'99px',
                            background: u.isBlocked ? '#FFEBEE' : '#E8F5E9',
                            color: u.isBlocked ? '#C62828' : '#2E7D32' }}>
                            {u.isBlocked ? '● Blocked' : '● Active'}
                          </span>
                        </td>
                        <td style={{ padding:'12px 18px' }}>
                          {u.role !== 'SUPER_ADMIN' && (
                            <button onClick={() => toggleBlock(u)} disabled={toggling===u.id}
                              style={{ fontSize:'12px', fontWeight:600, padding:'6px 14px', borderRadius:'8px', cursor:'pointer', fontFamily:'inherit',
                                background: u.isBlocked ? '#E8F5E9' : '#FFEBEE',
                                color: u.isBlocked ? '#2E7D32' : '#C62828',
                                border:`1px solid ${u.isBlocked ? 'rgba(46,125,50,0.2)' : 'rgba(198,40,40,0.2)'}`,
                                opacity:toggling===u.id?0.5:1, transition:'all 0.15s' }}
                              onMouseEnter={e => { e.currentTarget.style.opacity='0.8'; }}
                              onMouseLeave={e => { e.currentTarget.style.opacity=toggling===u.id?'0.5':'1'; }}>
                              {toggling===u.id ? '…' : u.isBlocked ? 'Unblock' : 'Block'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
          }
        </div>
        {meta.totalPages > 1 && (
          <div style={{ padding:'14px 20px', borderTop:`1px solid ${BDR}`, display:'flex', justifyContent:'center', gap:'6px', background:'#F8FAF8' }}>
            {Array.from({ length:meta.totalPages }, (_,i) => i+1).map(p => (
              <button key={p} onClick={() => setPage(p)}
                style={{ width:'34px', height:'34px', borderRadius:'8px', fontSize:'13px', fontWeight:600, cursor:'pointer', fontFamily:'inherit', transition:'all 0.15s',
                  background:page===p?LG:'#fff', border:`1.5px solid ${page===p?LG:BDR}`, color:page===p?'#fff':T3 }}>
                {p}
              </button>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
