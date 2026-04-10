import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { reportService } from '../../services';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const LG = '#1B3C1A'; const LG2 = '#2E7D32';
const T1 = '#0D1B0D'; const T3 = '#6B806B'; const T4 = '#9FAF9F';
const BDR = 'rgba(0,0,0,0.07)';
const SPIN = '@keyframes spin{to{transform:rotate(360deg)}}';
const fadeUp = (d=0) => ({ initial:{opacity:0,y:16}, animate:{opacity:1,y:0}, transition:{duration:0.4,delay:d,ease:[0.16,1,0.3,1]} });

const STATUS_COLORS = {
  PLACED:'#1565C0', ACCEPTED:'#2E7D32', PROCESSED:'#00695C',
  DISPATCHED:'#E65100', DELIVERED:'#1B5E20', CANCELLED:'#C62828',
};
const PIE_PALETTE = ['#1565C0','#2E7D32','#00695C','#E65100','#1B5E20','#C62828'];

// ─── Stat Card ─────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, bg, trend, delay }) {
  return (
    <motion.div {...fadeUp(delay)}
      style={{ background:'#fff', border:`1px solid ${BDR}`, borderRadius:'16px', padding:'22px', display:'flex', alignItems:'flex-start', gap:'16px', boxShadow:'0 2px 12px rgba(0,0,0,0.04)', transition:'box-shadow 0.2s,transform 0.2s' }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow='0 8px 28px rgba(0,0,0,0.09)'; e.currentTarget.style.transform='translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow='0 2px 12px rgba(0,0,0,0.04)'; e.currentTarget.style.transform=''; }}>
      <div style={{ width:'48px', height:'48px', borderRadius:'14px', background:bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px', flexShrink:0 }}>{icon}</div>
      <div style={{ flex:1 }}>
        <p style={{ fontSize:'28px', fontWeight:900, color:T1, letterSpacing:'-0.04em', lineHeight:1, fontFamily:"'Playfair Display', serif" }}>{value ?? '—'}</p>
        <p style={{ fontSize:'13px', color:T3, marginTop:'4px' }}>{label}</p>
        {sub && <p style={{ fontSize:'11px', color:LG2, marginTop:'3px', fontWeight:600 }}>{sub}</p>}
      </div>
    </motion.div>
  );
}

// ─── Custom Tooltip ─────────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:'#fff', border:`1px solid ${BDR}`, borderRadius:'10px', padding:'10px 14px', fontSize:'12px', boxShadow:'0 4px 16px rgba(0,0,0,0.1)' }}>
      <p style={{ color:T3, marginBottom:'4px', fontWeight:600 }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color:LG, fontWeight:700 }}>₹{Number(p.value).toLocaleString('en-IN')}</p>
      ))}
    </div>
  );
};

const PieTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:'#fff', border:`1px solid ${BDR}`, borderRadius:'8px', padding:'8px 12px', fontSize:'12px', boxShadow:'0 4px 12px rgba(0,0,0,0.1)' }}>
      <p style={{ fontWeight:700, color:T1 }}>{payload[0].name}</p>
      <p style={{ color:T3 }}>{payload[0].value} orders</p>
    </div>
  );
};

export default function AdminDashboard() {
  const [stats, setStats]         = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [exporting, setExporting] = useState(null); // 'excel' | 'pdf'

  useEffect(() => {
    Promise.allSettled([
      reportService.getDashboardStats(),
      reportService.getSalesReport({}),
    ]).then(([s, r]) => {
      if (s.status === 'fulfilled') setStats(s.value.data.data);
      if (r.status === 'fulfilled') setSalesData(r.value.data.data || []);
    }).catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  const handleExport = async (type) => {
    setExporting(type);
    try {
      const res = type === 'pdf'
        ? await reportService.exportPDF()
        : await reportService.exportSales();
      const ext  = type === 'pdf' ? 'pdf' : 'xlsx';
      const mime = type === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      const url  = URL.createObjectURL(new Blob([res.data], { type: mime }));
      const a    = document.createElement('a');
      a.href = url; a.download = `TechDrill_Sales_Report.${ext}`; a.click();
      URL.revokeObjectURL(url);
      toast.success(`${type.toUpperCase()} report downloaded!`);
    } catch { toast.error('Export failed'); }
    finally { setExporting(null); }
  };

  const STAT_DATA = stats ? [
    { icon:'👥', label:'Total Customers',  value: stats.totalUsers?.toLocaleString(), bg:'#E8F5E9', delay:0 },
    { icon:'📦', label:'My Products',      value: stats.totalProducts?.toLocaleString(), bg:'#E8F0FE', delay:0.05 },
    { icon:'🛒', label:'Orders',           value: stats.totalOrders?.toLocaleString(), bg:'#FFF3E0', delay:0.1 },
    { icon:'💰', label:'Revenue',          value:`₹${Number(stats.totalRevenue||0).toLocaleString('en-IN',{maximumFractionDigits:0})}`, sub:'All time · your store', bg:'#E8F5E9', delay:0.15 },
  ] : [];

  const pieData = (stats?.ordersByStatus || []).map(s => ({ name: s.status, value: s.count }));

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'24px' }}>
      <style>{SPIN}</style>

      {/* ── Header ── */}
      <motion.div {...fadeUp()} style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'12px', flexWrap:'wrap' }}>
        <div>
          <h1 style={{ fontSize:'28px', fontWeight:700, color:T1, marginBottom:'4px', fontFamily:"'Playfair Display', serif" }}>Dashboard</h1>
          <p style={{ fontSize:'13px', color:T3 }}>Live overview of your store performance</p>
        </div>

        {/* Export buttons */}
        <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
          <button onClick={() => handleExport('excel')} disabled={!!exporting}
            style={{ display:'inline-flex', alignItems:'center', gap:'6px', padding:'9px 16px', borderRadius:'8px', background:'#fff', color:LG, border:`1.5px solid rgba(27,60,26,0.2)`, cursor:'pointer', fontWeight:600, fontSize:'13px', fontFamily:'inherit', transition:'all 0.15s', opacity:exporting?0.6:1 }}
            onMouseEnter={e => { if(!exporting) e.currentTarget.style.background='#EEF7EE'; }}
            onMouseLeave={e => { if(!exporting) e.currentTarget.style.background='#fff'; }}>
            {exporting==='excel'
              ? <span style={{ width:'12px', height:'12px', border:'2px solid rgba(27,60,26,0.3)', borderTopColor:LG, borderRadius:'50%', animation:'spin 0.7s linear infinite', display:'inline-block' }} />
              : '📊'} Excel Report
          </button>
          <button onClick={() => handleExport('pdf')} disabled={!!exporting}
            style={{ display:'inline-flex', alignItems:'center', gap:'6px', padding:'9px 16px', borderRadius:'8px', background:LG, color:'#fff', border:'none', cursor:'pointer', fontWeight:600, fontSize:'13px', fontFamily:'inherit', transition:'all 0.15s', opacity:exporting?0.6:1 }}
            onMouseEnter={e => { if(!exporting) e.currentTarget.style.background=LG2; }}
            onMouseLeave={e => { if(!exporting) e.currentTarget.style.background=LG; }}>
            {exporting==='pdf'
              ? <span style={{ width:'12px', height:'12px', border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin 0.7s linear infinite', display:'inline-block' }} />
              : '📄'} PDF Report
          </button>
        </div>
      </motion.div>

      {/* ── Stat Cards ── */}
      {loading
        ? <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px' }}>
            {Array(4).fill(0).map((_,i) => (
              <div key={i} style={{ height:'100px', borderRadius:'16px', background:'#E8F0E8', animation:'pulse 1.5s ease-in-out infinite' }} />
            ))}
            <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>
          </div>
        : <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px, 1fr))', gap:'14px' }}>
            {STAT_DATA.map(s => <StatCard key={s.label} {...s} />)}
          </div>
      }

      {/* ── Charts Row 1: Revenue + Order Volume ── */}
      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:'16px' }}>

        {/* Monthly Revenue Area Chart */}
        <motion.div {...fadeUp(0.1)} style={{ background:'#fff', border:`1px solid ${BDR}`, borderRadius:'16px', padding:'22px', boxShadow:'0 2px 12px rgba(0,0,0,0.04)' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
            <div>
              <p style={{ fontSize:'15px', fontWeight:700, color:T1, fontFamily:"'Playfair Display', serif" }}>Monthly Revenue</p>
              <p style={{ fontSize:'11px', color:T4, marginTop:'2px' }}>Last 6 months</p>
            </div>
            <span style={{ fontSize:'10px', fontWeight:700, padding:'3px 10px', borderRadius:'99px', background:'#E8F5E9', color:LG2, border:'1px solid rgba(46,125,50,0.2)' }}>Live</span>
          </div>
          {(!stats?.monthlyChartData?.length)
            ? <div style={{ height:'200px', display:'flex', alignItems:'center', justifyContent:'center', color:T4, fontSize:'13px', flexDirection:'column', gap:'8px' }}>
                <span style={{ fontSize:'32px' }}>📈</span>No data yet
              </div>
            : <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={stats.monthlyChartData}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={LG} stopOpacity={0.15} />
                      <stop offset="95%" stopColor={LG} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="month" tick={{ fontSize:10, fill:T4 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize:10, fill:T4 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="revenue" stroke={LG} fill="url(#revGrad)" strokeWidth={2.5} dot={{ fill:LG, r:3 }} activeDot={{ r:5 }} />
                </AreaChart>
              </ResponsiveContainer>
          }
        </motion.div>

        {/* Order Status Donut */}
        <motion.div {...fadeUp(0.15)} style={{ background:'#fff', border:`1px solid ${BDR}`, borderRadius:'16px', padding:'22px', boxShadow:'0 2px 12px rgba(0,0,0,0.04)' }}>
          <p style={{ fontSize:'15px', fontWeight:700, color:T1, fontFamily:"'Playfair Display', serif", marginBottom:'4px' }}>Order Status</p>
          <p style={{ fontSize:'11px', color:T4, marginBottom:'16px' }}>Distribution breakdown</p>
          {pieData.length === 0
            ? <div style={{ height:'200px', display:'flex', alignItems:'center', justifyContent:'center', color:T4, fontSize:'13px' }}>No orders yet</div>
            : <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                      {pieData.map((_, i) => <Cell key={i} fill={PIE_PALETTE[i % PIE_PALETTE.length]} />)}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display:'flex', flexDirection:'column', gap:'5px', marginTop:'8px' }}>
                  {pieData.map((d, i) => (
                    <div key={d.name} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:'11px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                        <span style={{ width:'8px', height:'8px', borderRadius:'50%', background:PIE_PALETTE[i % PIE_PALETTE.length], flexShrink:0 }} />
                        <span style={{ color:T3 }}>{d.name}</span>
                      </div>
                      <span style={{ fontWeight:700, color:T1 }}>{d.value}</span>
                    </div>
                  ))}
                </div>
              </>
          }
        </motion.div>
      </div>

      {/* ── Charts Row 2: Daily Revenue Bar + Top Products ── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>

        {/* Daily Revenue Bar */}
        <motion.div {...fadeUp(0.2)} style={{ background:'#fff', border:`1px solid ${BDR}`, borderRadius:'16px', padding:'22px', boxShadow:'0 2px 12px rgba(0,0,0,0.04)' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
            <div>
              <p style={{ fontSize:'15px', fontWeight:700, color:T1, fontFamily:"'Playfair Display', serif" }}>Daily Revenue</p>
              <p style={{ fontSize:'11px', color:T4, marginTop:'2px' }}>Recent days</p>
            </div>
          </div>
          {salesData.length === 0
            ? <div style={{ height:'180px', display:'flex', alignItems:'center', justifyContent:'center', color:T4, fontSize:'13px' }}>No data yet</div>
            : <ResponsiveContainer width="100%" height={180}>
                <BarChart data={salesData.slice(-14)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="date" tick={{ fontSize:9, fill:T4 }} axisLine={false} tickLine={false} tickFormatter={v => v.slice(5)} />
                  <YAxis tick={{ fontSize:9, fill:T4 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="revenue" fill="#C8E6C9" stroke={LG} strokeWidth={1} radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
          }
        </motion.div>

        {/* Top Products */}
        <motion.div {...fadeUp(0.25)} style={{ background:'#fff', border:`1px solid ${BDR}`, borderRadius:'16px', padding:'22px', boxShadow:'0 2px 12px rgba(0,0,0,0.04)' }}>
          <p style={{ fontSize:'15px', fontWeight:700, color:T1, fontFamily:"'Playfair Display', serif", marginBottom:'4px' }}>Top Products</p>
          <p style={{ fontSize:'11px', color:T4, marginBottom:'16px' }}>By units sold</p>
          {(!stats?.topProducts?.length)
            ? <div style={{ height:'180px', display:'flex', alignItems:'center', justifyContent:'center', color:T4, fontSize:'13px', flexDirection:'column', gap:'8px' }}>
                <span style={{ fontSize:'32px' }}>📦</span>No products sold yet
              </div>
            : <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                {stats.topProducts.map((p, i) => {
                  const maxSold = stats.topProducts[0]?.soldCount || 1;
                  const pct = Math.round((p.soldCount / maxSold) * 100);
                  return (
                    <div key={p.id}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'4px' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'8px', minWidth:0 }}>
                          <span style={{ width:'20px', height:'20px', borderRadius:'6px', background:i===0?'#FFD700':i===1?'#C0C0C0':i===2?'#CD7F32':'#E8F5E9', color:i<3?'#0D1B0D':LG, fontSize:'10px', fontWeight:900, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{i+1}</span>
                          <p style={{ fontSize:'12px', fontWeight:600, color:T1, overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis' }}>{p.name}</p>
                        </div>
                        <span style={{ fontSize:'12px', fontWeight:700, color:LG, flexShrink:0, marginLeft:'8px' }}>{p.soldCount} sold</span>
                      </div>
                      <div style={{ height:'5px', borderRadius:'99px', background:'#F0F5F0', overflow:'hidden' }}>
                        <div style={{ height:'100%', width:`${pct}%`, borderRadius:'99px', background:i===0?LG:LG2, transition:'width 0.6s ease' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
          }
        </motion.div>
      </div>

      {/* ── Recent Orders Table ── */}
      {stats?.recentOrders?.length > 0 && (
        <motion.div {...fadeUp(0.3)} style={{ background:'#fff', border:`1px solid ${BDR}`, borderRadius:'16px', overflow:'hidden', boxShadow:'0 2px 12px rgba(0,0,0,0.04)' }}>
          <div style={{ padding:'18px 22px', borderBottom:`1px solid ${BDR}`, display:'flex', justifyContent:'space-between', alignItems:'center', background:'#F8FAF8' }}>
            <p style={{ fontSize:'15px', fontWeight:700, color:T1, fontFamily:"'Playfair Display', serif" }}>Recent Orders</p>
            <Link to="/admin/orders" style={{ fontSize:'13px', color:LG, fontWeight:600, textDecoration:'none' }}>View all →</Link>
          </div>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ borderBottom:`1px solid ${BDR}`, background:'#FAFCFA' }}>
                  {['Order ID','Customer','Status','Total','Date'].map(h => (
                    <th key={h} style={{ padding:'10px 20px', textAlign:'left', fontSize:'11px', fontWeight:700, color:T3, textTransform:'uppercase', letterSpacing:'0.07em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map(o => {
                  const sc = STATUS_COLORS[o.status] || '#666';
                  return (
                    <tr key={o.id}
                      style={{ borderBottom:`1px solid rgba(0,0,0,0.04)`, transition:'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background='#F4FAF4'}
                      onMouseLeave={e => e.currentTarget.style.background=''}>
                      <td style={{ padding:'12px 20px', fontFamily:'monospace', fontSize:'12px', color:T3 }}>#{o.id.slice(-8).toUpperCase()}</td>
                      <td style={{ padding:'12px 20px', fontSize:'13px', fontWeight:600, color:T1 }}>{o.user?.name || '—'}</td>
                      <td style={{ padding:'12px 20px' }}>
                        <span style={{ fontSize:'11px', fontWeight:700, padding:'3px 10px', borderRadius:'99px', background:`${sc}18`, color:sc, border:`1px solid ${sc}30` }}>
                          {o.status}
                        </span>
                      </td>
                      <td style={{ padding:'12px 20px', fontSize:'13px', fontWeight:800, color:T1 }}>₹{Number(o.total).toLocaleString('en-IN')}</td>
                      <td style={{ padding:'12px 20px', fontSize:'12px', color:T4 }}>{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}
