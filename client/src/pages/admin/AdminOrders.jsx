import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { orderService } from '../../services';
import toast from 'react-hot-toast';

const LG='#1B3C1A';
const T1='#0D1B0D'; const T3='#6B806B'; const T4='#9FAF9F';
const BDR='rgba(0,0,0,0.07)';
const SPIN='@keyframes spin{to{transform:rotate(360deg)}}';

const SC = {
  PLACED:     { bg:'#E3F2FD', color:'#1565C0', label:'Placed' },
  ACCEPTED:   { bg:'#E8F5E9', color:'#2E7D32', label:'Accepted' },
  PROCESSED:  { bg:'#E0F2F1', color:'#00695C', label:'Processed' },
  DISPATCHED: { bg:'#FFF3E0', color:'#E65100', label:'Dispatched' },
  DELIVERED:  { bg:'#F1F8E9', color:'#1B5E20', label:'Delivered' },
  CANCELLED:  { bg:'#FFEBEE', color:'#C62828', label:'Cancelled' },
  RETURNED:   { bg:'#FBE9E7', color:'#BF360C', label:'Returned' },
};
const ALL_STATUSES = ['PLACED','ACCEPTED','PROCESSED','DISPATCHED','DELIVERED','CANCELLED'];

export default function AdminOrders() {
  const [orders, setOrders]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [page, setPage]         = useState(1);
  const [meta, setMeta]         = useState({});
  const [filter, setFilter]     = useState('');
  const [updating, setUpdating] = useState(null);
  const [expanded, setExpanded] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await orderService.getAll({ page, status: filter || undefined, limit:12 });
      setOrders(data.data || []);
      setMeta(data.meta || {});
    } catch { toast.error('Failed to load orders'); }
    finally { setLoading(false); }
  }, [page, filter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleStatusChange = async (orderId, status) => {
    setUpdating(orderId);
    try {
      await orderService.updateStatus(orderId, { status });
      setOrders(prev => prev.map(o => o.id===orderId ? { ...o, status } : o));
      toast.success(`Status updated to ${status}`);
    } catch { toast.error('Failed to update status'); }
    finally { setUpdating(null); }
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'20px' }}>
      <style>{SPIN}</style>

      {/* Header */}
      <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
        style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'12px' }}>
        <div>
          <h1 style={{ fontSize:'28px', fontWeight:700, color:T1, marginBottom:'4px', fontFamily:"'Playfair Display', serif" }}>Orders</h1>
          <p style={{ fontSize:'13px', color:T3 }}>{meta.total || 0} total orders</p>
        </div>
        {/* Status filter chips */}
        <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
          {['', ...ALL_STATUSES].map(s => {
            const active = filter === s;
            const sc = SC[s] || { bg:'#EEF7EE', color:LG };
            return (
              <button key={s} onClick={() => { setFilter(s); setPage(1); }}
                style={{ fontSize:'11px', fontWeight:700, padding:'6px 14px', borderRadius:'99px', cursor:'pointer', fontFamily:'inherit',
                  background: active ? (s ? sc.bg : '#EEF7EE') : '#fff',
                  color: active ? (s ? sc.color : LG) : T3,
                  border: `1.5px solid ${active ? (s ? sc.color+'40' : 'rgba(27,60,26,0.25)') : BDR}`,
                  transition:'all 0.15s',
                }}>
                {s || 'All'}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Table */}
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.1 }}
        style={{ background:'#fff', border:`1px solid ${BDR}`, borderRadius:'16px', overflow:'hidden', boxShadow:'0 2px 12px rgba(0,0,0,0.05)' }}>
        <div style={{ overflowX:'auto' }}>
          {loading
            ? <div style={{ padding:'48px', textAlign:'center', color:T4, fontSize:'13px' }}>
                <div style={{ width:'24px', height:'24px', border:'2px solid rgba(27,60,26,0.15)', borderTopColor:LG, borderRadius:'50%', animation:'spin 0.7s linear infinite', margin:'0 auto 10px' }} />
                Loading orders…
              </div>
            : orders.length === 0
              ? <div style={{ padding:'64px', textAlign:'center' }}>
                  <div style={{ fontSize:'48px', marginBottom:'12px' }}>📭</div>
                  <p style={{ color:T3, fontSize:'15px' }}>No orders found</p>
                </div>
              : <table style={{ width:'100%', borderCollapse:'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom:`1.5px solid ${BDR}`, background:'#F8FAF8' }}>
                      {['Order ID','Customer','Items','Total','Status','Update Status','Date'].map(h => (
                        <th key={h} style={{ padding:'12px 18px', textAlign:'left', fontSize:'11px', fontWeight:700, color:T3, textTransform:'uppercase', letterSpacing:'0.07em', whiteSpace:'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o,idx) => (
                      <>
                        <tr key={o.id}
                          style={{ borderBottom:`1px solid rgba(0,0,0,0.04)`, cursor:'pointer', transition:'background 0.15s', background:idx%2===0?'#fff':'#FAFCFA' }}
                          onMouseEnter={e => e.currentTarget.style.background='#F4FAF4'}
                          onMouseLeave={e => e.currentTarget.style.background=idx%2===0?'#fff':'#FAFCFA'}
                          onClick={() => setExpanded(expanded===o.id ? null : o.id)}>
                          <td style={{ padding:'13px 18px', fontFamily:'monospace', fontSize:'12px', color:T3, whiteSpace:'nowrap' }}>
                            #{o.id.slice(-8).toUpperCase()}
                          </td>
                          <td style={{ padding:'13px 18px', fontSize:'13px', fontWeight:600, color:T1, whiteSpace:'nowrap' }}>
                            {o.user?.name || o.userId?.slice(0,8)}
                          </td>
                          <td style={{ padding:'13px 18px', fontSize:'13px', color:T3 }}>
                            {o.items?.length || o._count?.items || '—'}
                          </td>
                          <td style={{ padding:'13px 18px', fontSize:'13px', fontWeight:800, color:T1, whiteSpace:'nowrap' }}>
                            ₹{Number(o.total).toLocaleString('en-IN')}
                          </td>
                          <td style={{ padding:'13px 18px' }}>
                            <span style={{ fontSize:'11px', fontWeight:700, padding:'4px 10px', borderRadius:'99px',
                              background: (SC[o.status]||SC.PLACED).bg, color:(SC[o.status]||SC.PLACED).color }}>
                              {o.status}
                            </span>
                          </td>
                          <td style={{ padding:'8px 18px' }} onClick={e => e.stopPropagation()}>
                            <select value={o.status} onChange={e => handleStatusChange(o.id, e.target.value)}
                              disabled={updating===o.id || o.status==='DELIVERED' || o.status==='CANCELLED'}
                              style={{ fontSize:'12px', padding:'6px 10px', borderRadius:'7px', border:`1.5px solid ${BDR}`, background:'#fff', color:T1, cursor:'pointer', fontFamily:'inherit', outline:'none', opacity:(o.status==='DELIVERED'||o.status==='CANCELLED')?0.4:1, width:'130px' }}>
                              {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </td>
                          <td style={{ padding:'13px 18px', fontSize:'12px', color:T4, whiteSpace:'nowrap' }}>
                            {new Date(o.createdAt).toLocaleDateString('en-IN')}
                          </td>
                        </tr>
                        {expanded===o.id && o.items && (
                          <tr key={o.id+'-exp'} style={{ background:'#F4FAF4' }}>
                            <td colSpan={7} style={{ padding:'12px 18px 16px 18px' }}>
                              <p style={{ fontSize:'11px', fontWeight:700, color:T3, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:'8px' }}>Order Items</p>
                              <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
                                {o.items.map((item,i) => (
                                  <div key={i} style={{ display:'flex', gap:'12px', alignItems:'center', fontSize:'13px', color:T3, padding:'8px 12px', background:'#fff', borderRadius:'8px', border:`1px solid ${BDR}` }}>
                                    <span style={{ fontWeight:700, color:T1 }}>{item.name}</span>
                                    <span>× {item.quantity}</span>
                                    <span style={{ marginLeft:'auto', fontWeight:700, color:T1 }}>₹{Number(item.total).toLocaleString('en-IN')}</span>
                                  </div>
                                ))}
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </tbody>
                </table>
          }
        </div>

        {meta.totalPages > 1 && (
          <div style={{ padding:'14px 20px', borderTop:`1px solid ${BDR}`, display:'flex', justifyContent:'center', gap:'6px', background:'#F8FAF8' }}>
            {Array.from({ length:meta.totalPages }, (_,i) => i+1).map(p => (
              <button key={p} onClick={() => setPage(p)}
                style={{ width:'34px', height:'34px', borderRadius:'8px', fontSize:'13px', fontWeight:600, cursor:'pointer', fontFamily:'inherit',
                  background:page===p?LG:'#fff', border:`1.5px solid ${page===p?LG:BDR}`, color:page===p?'#fff':T3, transition:'all 0.15s' }}>
                {p}
              </button>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
