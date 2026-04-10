import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { orderService } from '../services';
import toast from 'react-hot-toast';

const LG='#1B3C1A'; const T1='#0D1B0D'; const T3='#6B806B'; const T4='#9FAF9F';
const BDR='rgba(0,0,0,0.07)';
const SPIN='@keyframes spin{to{transform:rotate(360deg)}}';

const STATUS_STEPS = ['PLACED','ACCEPTED','DISPATCHED','DELIVERED'];
const SC = {
  PLACED:     { bg:'#E3F2FD', color:'#1565C0', icon:'📋', label:'Order Placed' },
  ACCEPTED:   { bg:'#E8F5E9', color:'#2E7D32', icon:'✅', label:'Accepted' },
  PROCESSED:  { bg:'#E0F2F1', color:'#00695C', icon:'⚙️', label:'Processing' },
  DISPATCHED: { bg:'#FFF3E0', color:'#E65100', icon:'🚚', label:'Dispatched' },
  DELIVERED:  { bg:'#F1F8E9', color:'#1B5E20', icon:'🎉', label:'Delivered' },
  CANCELLED:  { bg:'#FFEBEE', color:'#C62828', icon:'✕',  label:'Cancelled' },
  RETURNED:   { bg:'#FBE9E7', color:'#BF360C', icon:'↩',  label:'Returned' },
};

// ── Printable Invoice ──────────────────────────────────────────────────────
function printInvoice(order) {
  const fmt = n => `₹${Number(n||0).toLocaleString('en-IN', { minimumFractionDigits:2 })}`;
  const date = new Date(order.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'});
  const addr = order.address;
  const rows = (order.items||[]).map(item => `
    <tr>
      <td style="padding:10px 8px;border-bottom:1px solid #e8edea">${item.name}</td>
      <td style="padding:10px 8px;border-bottom:1px solid #e8edea;text-align:center">${item.quantity}</td>
      <td style="padding:10px 8px;border-bottom:1px solid #e8edea;text-align:right">${fmt(item.price)}</td>
      <td style="padding:10px 8px;border-bottom:1px solid #e8edea;text-align:right;font-weight:700">${fmt(item.total)}</td>
    </tr>`).join('');

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Invoice #${order.id.slice(-8).toUpperCase()} — TechDrill</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family: 'Inter', sans-serif; color: #0D1B0D; background:#fff; font-size:13px; }
    .page { max-width:780px; margin:0 auto; padding:48px 40px; }
    .header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:40px; padding-bottom:24px; border-bottom:2px solid #1B3C1A; }
    .logo { display:flex; align-items:center; gap:10px; }
    .logo-box { width:38px; height:38px; border-radius:10px; background:#1B3C1A; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:18px; color:#fff; }
    .logo-text { font-size:20px; font-weight:700; color:#1B3C1A; }
    .invoice-title { font-size:28px; font-weight:900; color:#1B3C1A; }
    .invoice-meta { font-size:12px; color:#6B806B; margin-top:4px; }
    .section-title { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.1em; color:#6B806B; margin-bottom:8px; }
    .info-grid { display:grid; grid-template-columns:1fr 1fr; gap:32px; margin-bottom:32px; }
    .info-block p { font-size:13px; color:#0D1B0D; line-height:1.7; }
    table { width:100%; border-collapse:collapse; margin-bottom:24px; }
    thead th { background:#F0F5F0; padding:10px 8px; text-align:left; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.07em; color:#6B806B; }
    thead th:not(:first-child) { text-align:right; }
    thead th:nth-child(2) { text-align:center; }
    .totals { margin-left:auto; width:280px; }
    .totals-row { display:flex; justify-content:space-between; padding:7px 0; font-size:13px; color:#6B806B; border-bottom:1px solid #E8EDEA; }
    .totals-row.total { border-bottom:none; border-top:2px solid #1B3C1A; margin-top:8px; padding-top:12px; font-size:16px; font-weight:900; color:#1B3C1A; }
    .payment-box { margin-top:24px; padding:16px 20px; border-radius:10px; background:#E8F5E9; border:1px solid rgba(46,125,50,0.2); }
    .payment-box p { font-size:12px; color:#2E7D32; }
    .footer-note { margin-top:40px; padding-top:20px; border-top:1px solid #E8EDEA; font-size:11px; color:#9FAF9F; text-align:center; }
    @media print { body { -webkit-print-color-adjust:exact; print-color-adjust:exact; } }
  </style>
</head>
<body>
<div class="page">
  <div class="header">
    <div class="logo">
      <div class="logo-box">T</div>
      <div>
        <div class="logo-text">TechDrill</div>
        <div style="font-size:11px;color:#6B806B">India's Trusted Tech Marketplace</div>
      </div>
    </div>
    <div style="text-align:right">
      <div class="invoice-title">INVOICE</div>
      <div class="invoice-meta">#${order.id.slice(-8).toUpperCase()} · ${date}</div>
      ${order.payment?.method === 'COD' ? '<div class="invoice-meta" style="color:#E65100">Payment Mode: Cash on Delivery</div>' : order.payment?.razorpayPaymentId && !order.payment.razorpayPaymentId.startsWith('cod_') ? `<div class="invoice-meta">Payment: ${order.payment.razorpayPaymentId}</div>` : ''}
    </div>
  </div>

  <div class="info-grid">
    <div class="info-block">
      <div class="section-title">Bill From</div>
      <p><strong>TechDrill Technologies Pvt. Ltd.</strong></p>
      <p>support@techdrill.com</p>
      <p>GSTIN: 27AXXXX0000X1Z5</p>
    </div>
    ${addr ? `
    <div class="info-block">
      <div class="section-title">Ship To</div>
      <p><strong>${addr.line1}${addr.line2?', '+addr.line2:''}</strong></p>
      <p>${addr.city}, ${addr.state} — ${addr.pincode}</p>
      <p>📞 ${addr.phone}</p>
    </div>` : ''}
  </div>

  <table>
    <thead>
      <tr>
        <th style="text-align:left">Product</th>
        <th>Qty</th>
        <th style="text-align:right">Unit Price</th>
        <th style="text-align:right">Total</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>

  <div class="totals">
    <div class="totals-row"><span>Subtotal</span><span>${fmt(order.subtotal)}</span></div>
    <div class="totals-row"><span>GST (18%)</span><span>${fmt(order.tax)}</span></div>
    <div class="totals-row"><span>Shipping</span><span>${Number(order.shippingCharge||0)===0?'FREE':fmt(order.shippingCharge)}</span></div>
    <div class="totals-row total"><span>${order.payment?.method==='COD' ? 'Amount Payable (COD)' : 'Amount Paid'}</span><span>${fmt(order.total)}</span></div>
  </div>

  ${(() => {
    const isCOD = order.payment?.method === 'COD';
    const isPaid = order.payment?.status === 'SUCCESS';
    if (isCOD) return `
  <div class="payment-box" style="background:#FFF8E1;border-color:rgba(255,152,0,0.3)">
    <p style="color:#E65100">💵 <strong>Cash on Delivery</strong> · Payment to be collected at delivery</p>
    <p style="margin-top:4px;color:#BF360C">Order Status: ${order.status || 'PLACED'}</p>
  </div>`;
    if (isPaid) return `
  <div class="payment-box">
    <p>✅ <strong>Payment Verified</strong> · Paid via ${order.payment.method||'Online'} on ${new Date(order.payment.createdAt||order.createdAt).toLocaleDateString('en-IN')}</p>
    ${order.payment.razorpayPaymentId && !order.payment.razorpayPaymentId.startsWith('cod_') ? `<p style="margin-top:4px;font-family:monospace">Transaction ID: ${order.payment.razorpayPaymentId}</p>` : ''}
  </div>`;
    return `
  <div class="payment-box" style="background:#E3F2FD;border-color:rgba(21,101,192,0.2)">
    <p style="color:#1565C0">🕐 <strong>Payment Pending</strong> · Complete payment to confirm order</p>
  </div>`;
  })()}

  <div class="footer-note">
    Thank you for shopping with TechDrill! · support@techdrill.com · +91 98765 43210 · india.techdrill.com
  </div>
</div>
</body>
</html>`;

  const w = window.open('', '_blank', 'width=900,height=700');
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => { w.print(); }, 600);
}

export default function OrdersPage() {
  const [orders, setOrders]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    orderService.getMyOrders({ limit:30 })
      .then(r => { const data = r.data.data || []; setOrders(data); if (data.length>0) setSelected(data[0]); })
      .catch(() => toast.error('Failed to load order history'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ minHeight:'100vh', paddingTop:'80px', background:'#F4F7F4' }}>
      <style>{SPIN}</style>
      <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'40vh' }}>
        <div style={{ width:'28px', height:'28px', border:'3px solid rgba(27,60,26,0.15)', borderTopColor:LG, borderRadius:'50%', animation:'spin 0.7s linear infinite' }} />
      </div>
    </div>
  );

  if (orders.length === 0) return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'#F4F7F4', textAlign:'center', padding:'24px', paddingTop:'80px' }}>
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}>
        <div style={{ fontSize:'64px', marginBottom:'16px' }}>📭</div>
        <h2 style={{ fontFamily:"'Playfair Display', serif", fontSize:'26px', fontWeight:700, color:T1, marginBottom:'8px' }}>No orders yet</h2>
        <p style={{ fontSize:'15px', color:T3, marginBottom:'28px' }}>Your order history will appear here after your first purchase</p>
        <Link to="/products" className="btn-primary" style={{ fontSize:'15px', padding:'13px 32px', borderRadius:'10px' }}>Start Shopping →</Link>
      </motion.div>
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', paddingTop:'64px', paddingBottom:'80px', background:'#F4F7F4' }}>
      <style>{SPIN}</style>

      {/* Header */}
      <div style={{ borderBottom:`1px solid ${BDR}`, background:'#fff', padding:'22px 0', marginBottom:'28px' }}>
        <div className="container-max" style={{ padding:'0 28px' }}>
          <h1 style={{ fontFamily:"'Playfair Display', serif", fontSize:'28px', fontWeight:700, color:T1, marginBottom:'4px' }}>My Orders</h1>
          <p style={{ fontSize:'13px', color:T3 }}>{orders.length} order{orders.length!==1?'s':''} found</p>
        </div>
      </div>

      <div className="container-max" style={{ padding:'0 28px', display:'grid', gridTemplateColumns:'300px 1fr', gap:'24px', alignItems:'start' }}>

        {/* Order list sidebar */}
        <div style={{ display:'flex', flexDirection:'column', gap:'8px', maxHeight:'70vh', overflowY:'auto', paddingRight:'4px' }}>
          {orders.map((order,i) => {
            const sc   = SC[order.status] || SC.PLACED;
            const isActive = selected?.id === order.id;
            return (
              <motion.button key={order.id}
                initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.04 }}
                onClick={() => setSelected(order)}
                style={{ width:'100%', textAlign:'left', borderRadius:'14px', padding:'16px', cursor:'pointer', fontFamily:'inherit', position:'relative',
                  background: isActive ? '#EEF7EE' : '#fff',
                  border:`1.5px solid ${isActive ? 'rgba(27,60,26,0.3)' : BDR}`,
                  boxShadow: isActive ? '0 4px 16px rgba(27,60,26,0.1)' : '0 2px 8px rgba(0,0,0,0.04)',
                  transition:'all 0.15s' }}>
                {isActive && <div style={{ position:'absolute', left:0, top:'8px', bottom:'8px', width:'3px', borderRadius:'0 2px 2px 0', background:LG }} />}
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px', paddingLeft:isActive?'8px':'0', transition:'padding 0.15s' }}>
                  <p style={{ fontFamily:'monospace', fontSize:'13px', fontWeight:700, color:isActive?LG:T1 }}>#{order.id.slice(-8).toUpperCase()}</p>
                  <span style={{ fontSize:'11px', fontWeight:700, padding:'3px 8px', borderRadius:'99px', background:sc.bg, color:sc.color }}>
                    {sc.icon} {sc.label}
                  </span>
                </div>
                <p style={{ fontSize:'12px', color:T4, paddingLeft:isActive?'8px':'0', transition:'padding 0.15s' }}>
                  {new Date(order.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}
                </p>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'8px', paddingLeft:isActive?'8px':'0', transition:'padding 0.15s' }}>
                  <span style={{ fontSize:'12px', color:T3 }}>{order.items?.length||0} item{(order.items?.length||0)!==1?'s':''}</span>
                  <span style={{ fontFamily:"'Playfair Display', serif", fontSize:'16px', fontWeight:900, color:isActive?LG:T1 }}>₹{Number(order.total).toLocaleString('en-IN')}</span>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Detail panel */}
        <div>
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div key={selected.id} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }}>
                <OrderDetail orderId={selected.id} />
              </motion.div>
            ) : (
              <div style={{ background:'#fff', border:`1px solid ${BDR}`, borderRadius:'18px', padding:'64px', textAlign:'center' }}>
                <p style={{ fontSize:'48px', marginBottom:'12px' }}>📋</p>
                <p style={{ color:T3, fontSize:'15px' }}>Select an order to see details</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function OrderDetail({ orderId }) {
  const [order, setOrder]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    orderService.getOne(orderId).then(r => setOrder(r.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, [orderId]);

  if (loading) return (
    <div style={{ background:'#fff', border:`1px solid rgba(0,0,0,0.07)`, borderRadius:'18px', padding:'32px' }}>
      <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
        {Array(5).fill(0).map((_,i) => <div key={i} className="skeleton" style={{ height:'48px', borderRadius:'10px' }} />)}
      </div>
    </div>
  );
  if (!order) return null;

  const stepIdx    = STATUS_STEPS.indexOf(order.status);
  const sc         = SC[order.status] || SC.PLACED;
  const isCancelled = ['CANCELLED','RETURNED'].includes(order.status);

  return (
    <div style={{ background:'#fff', border:`1px solid rgba(0,0,0,0.07)`, borderRadius:'18px', padding:'28px', boxShadow:'0 4px 20px rgba(0,0,0,0.06)' }}>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'24px', paddingBottom:'20px', borderBottom:'1px solid rgba(0,0,0,0.07)', gap:'12px', flexWrap:'wrap' }}>
        <div>
          <p style={{ fontSize:'12px', color:'#9FAF9F', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:'4px' }}>Order ID</p>
          <h2 style={{ fontFamily:"'Playfair Display', serif", fontSize:'22px', fontWeight:700, color:'#0D1B0D', marginBottom:'4px' }}>#{order.id.slice(-8).toUpperCase()}</h2>
          <p style={{ fontSize:'12px', color:'#9FAF9F' }}>{new Date(order.createdAt).toLocaleString('en-IN')}</p>
        </div>
        <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'8px' }}>
          <span style={{ display:'inline-flex', alignItems:'center', gap:'6px', padding:'8px 16px', borderRadius:'12px', fontSize:'13px', fontWeight:700, background:sc.bg, color:sc.color }}>
            {sc.icon} {sc.label}
          </span>
          {!['CANCELLED','RETURNED'].includes(order.status) && (
            <button onClick={() => printInvoice(order)}
              style={{ fontSize:'12px', fontWeight:700, padding:'7px 14px', borderRadius:'9px', border:`1.5px solid ${LG}`, background:'#EEF7EE', color:LG, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:'6px', transition:'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.background=LG; e.currentTarget.style.color='#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background='#EEF7EE'; e.currentTarget.style.color=LG; }}>
              🧾 Download Invoice
            </button>
          )}
        </div>
      </div>

      {/* Progress tracker */}
      {!isCancelled && (
        <div style={{ background:'#F8FAF8', border:'1px solid rgba(0,0,0,0.06)', borderRadius:'14px', padding:'20px 24px', marginBottom:'24px' }}>
          <p style={{ fontSize:'11px', fontWeight:700, color:'#9FAF9F', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'20px' }}>Shipment Tracker</p>
          <div style={{ position:'relative', display:'flex', justifyContent:'space-between' }}>
            {/* Progress line */}
            <div style={{ position:'absolute', top:'18px', left:'28px', right:'28px', height:'2px', background:'rgba(0,0,0,0.08)' }}>
              <div style={{ height:'100%', borderRadius:'99px', background:`linear-gradient(90deg, ${LG}, #2E7D32)`, width:`${(stepIdx/(STATUS_STEPS.length-1))*100}%`, transition:'width 1s ease' }} />
            </div>
            {STATUS_STEPS.map((s,i) => {
              const done = i <= stepIdx;
              return (
                <div key={s} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'8px', zIndex:1 }}>
                  <div style={{ width:'36px', height:'36px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'13px', fontWeight:700, transition:'all 0.4s',
                    background: done ? LG : '#fff',
                    border:`2px solid ${done ? LG : 'rgba(0,0,0,0.12)'}`,
                    color: done ? '#fff' : '#9FAF9F',
                    boxShadow: done ? `0 4px 12px rgba(27,60,26,0.3)` : '0 2px 6px rgba(0,0,0,0.06)',
                  }}>
                    {i < stepIdx ? '✓' : i+1}
                  </div>
                  <span style={{ fontSize:'10px', fontWeight:600, color:done?LG:'#9FAF9F', textAlign:'center', letterSpacing:'0.04em', whiteSpace:'nowrap' }}>{s}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Items */}
      <div style={{ marginBottom:'20px' }}>
        <p style={{ fontSize:'13px', fontWeight:700, color:'#0D1B0D', marginBottom:'12px' }}>Items ({order.items?.length})</p>
        <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
          {order.items?.map(item => (
            <div key={item.id} style={{ display:'flex', gap:'12px', alignItems:'center', padding:'12px 14px', borderRadius:'10px', background:'#F8FAF8', border:'1px solid rgba(0,0,0,0.06)' }}>
              <div style={{ width:'38px', height:'38px', borderRadius:'8px', background:'#EEF7EE', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:'14px', fontWeight:800, color:LG }}>
                {item.name?.[0]}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ fontSize:'13px', fontWeight:700, color:'#0D1B0D', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.name}</p>
                <p style={{ fontSize:'12px', color:'#9FAF9F' }}>Qty: {item.quantity} × ₹{Number(item.price).toLocaleString('en-IN')}</p>
              </div>
              <p style={{ fontFamily:"'Playfair Display', serif", fontSize:'15px', fontWeight:900, color:'#0D1B0D', flexShrink:0 }}>₹{Number(item.total).toLocaleString('en-IN')}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Totals */}
      <div style={{ background:'#F8FAF8', border:'1px solid rgba(0,0,0,0.06)', borderRadius:'12px', padding:'16px 20px', marginBottom:'20px' }}>
        {[
          { label:'Subtotal', val:`₹${Number(order.subtotal||0).toLocaleString('en-IN')}` },
          { label:'GST (18%)', val:`₹${Number(order.tax||0).toLocaleString('en-IN')}` },
          { label:'Shipping', val:Number(order.shippingCharge||0)===0?'Free':'₹'+Number(order.shippingCharge).toLocaleString('en-IN') },
        ].map(r => (
          <div key={r.label} style={{ display:'flex', justifyContent:'space-between', fontSize:'13px', color:'#6B806B', marginBottom:'8px' }}>
            <span>{r.label}</span><span>{r.val}</span>
          </div>
        ))}
        <div style={{ display:'flex', justifyContent:'space-between', borderTop:'1px solid rgba(0,0,0,0.07)', paddingTop:'12px', marginTop:'4px' }}>
          <span style={{ fontSize:'15px', fontWeight:700, color:'#0D1B0D' }}>Total Charged</span>
          <span style={{ fontFamily:"'Playfair Display', serif", fontSize:'20px', fontWeight:900, color:LG }}>₹{Number(order.total).toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Delivery address */}
      {order.address && (
        <div style={{ background:'#F0F5F0', border:'1px solid rgba(27,60,26,0.12)', borderRadius:'12px', padding:'16px 20px', marginBottom:'16px' }}>
          <p style={{ fontSize:'11px', fontWeight:700, color:LG, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:'8px' }}>📍 Delivery Address</p>
          <p style={{ fontSize:'13px', fontWeight:600, color:'#0D1B0D' }}>{order.address.line1}{order.address.line2?`, ${order.address.line2}`:''}</p>
          <p style={{ fontSize:'12px', color:'#6B806B', marginTop:'3px' }}>{order.address.city}, {order.address.state} — {order.address.pincode}</p>
          {order.address.phone && <p style={{ fontSize:'12px', color:'#6B806B', marginTop:'2px' }}>📞 {order.address.phone}</p>}
        </div>
      )}

      {/* Payment status */}
      {order.payment && (
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 16px', borderRadius:'10px',
          background: order.payment.status==='SUCCESS' ? '#E8F5E9' : '#FFEBEE',
          border:`1px solid ${order.payment.status==='SUCCESS' ? 'rgba(46,125,50,0.2)' : 'rgba(198,40,40,0.2)'}` }}>
          <span style={{ fontSize:'12px', color:'#6B806B', fontFamily:'monospace' }}>{order.payment.razorpayPaymentId||'Pending'}</span>
          <span style={{ fontSize:'12px', fontWeight:700, color: order.payment.status==='SUCCESS' ? '#2E7D32' : '#C62828' }}>
            {order.payment.status==='SUCCESS' ? '✓ Payment Verified' : order.payment.status}
          </span>
        </div>
      )}
    </div>
  );
}
