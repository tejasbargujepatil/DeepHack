import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderService, paymentService, userService } from '../services';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const STATES = ['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Chandigarh','Puducherry'];

const loadRazorpay = () => new Promise(resolve => {
  if (window.Razorpay) { resolve(true); return; }
  const s = document.createElement('script');
  s.src = 'https://checkout.razorpay.com/v1/checkout.js';
  s.onload = () => resolve(true);
  s.onerror = () => resolve(false);
  document.body.appendChild(s);
});

const STEPS = ['Delivery', 'Review', 'Payment'];

export default function CheckoutPage() {
  const { cart, cartTotal, fetchCart } = useCart();
  const { user } = useAuth();
  const navigate  = useNavigate();

  const [step, setStep]           = useState(1);
  const [addresses, setAddresses] = useState([]);
  const [selAddr, setSelAddr]     = useState(null);
  const [showForm, setShowForm]   = useState(false);
  const [processing, setProcessing] = useState(false);
  const [payMethod, setPayMethod] = useState('razorpay'); // 'razorpay' | 'cod'
  const [addrForm, setAddrForm]   = useState({ label:'Home', line1:'', line2:'', city:'', state:'Maharashtra', pincode:'', phone: user?.phone || '' });

  const totalDiscount = cart.reduce((sum, item) => {
    const compare = Number(item.product?.comparePrice || 0);
    const price   = Number(item.product?.price || 0);
    return sum + (compare > price ? (compare - price) * item.quantity : 0);
  }, 0);

  const tax      = cartTotal * 0.18;
  const shipping = cartTotal > 500 ? 0 : 50;
  const total    = cartTotal + tax + shipping;

  useEffect(() => {
    if (cart.length === 0) { navigate('/cart'); return; }
    userService.getProfile()
      .then(r => {
        const addrs = r.data.data?.addresses || [];
        setAddresses(addrs);
        if (addrs.length > 0) setSelAddr(addrs[0].id);
        else setShowForm(true);
      }).catch(() => {});
  }, []);

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const { data } = await userService.addAddress(addrForm);
      const a = data.data;
      setAddresses(prev => [...prev, a]);
      setSelAddr(a.id);
      setShowForm(false);
      toast.success('Address saved');
    } catch (err) { toast.error(err?.response?.data?.message || 'Could not save address'); }
  };

  const handlePay = async () => {
    if (!selAddr) { toast.error('Select a delivery address'); return; }
    setProcessing(true);
    try {
      // Create the order record first
      const { data: od } = await orderService.create({ addressId: selAddr });
      const order = od.data;

      if (payMethod === 'cod') {
        // Cash on Delivery path
        await paymentService.placeCOD({ orderId: order.id });
        await fetchCart();
        navigate('/order-success', { state: { orderId: order.id, amount: total, method: 'COD' } });
        return;
      }

      // Razorpay path
      const { data: rp } = await paymentService.createRazorpayOrder({ orderId: order.id });
      const loaded = await loadRazorpay();
      if (!loaded) { toast.error('Payment gateway unavailable. Check your connection.'); setProcessing(false); return; }

      const opts = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: rp.data.amount,
        currency: rp.data.currency || 'INR',
        name: 'TechDrill',
        description: `Order #${order.id.slice(-8).toUpperCase()}`,
        order_id: rp.data.razorpayOrderId,
        prefill: { name: user?.name, email: user?.email, contact: user?.phone || '' },
        theme: { color: '#1B3C1A' },
        modal: {
          ondismiss: () => {
            toast('Payment cancelled. Your order is saved — you can pay from My Orders.', { icon: 'ℹ️' });
            setProcessing(false);
          }
        },
        handler: async (response) => {
          try {
            await paymentService.verify({
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
            });
            await fetchCart();
            navigate('/order-success', { state: { orderId: order.id, amount: total } });
          } catch {
            toast.error('Payment verification failed. Contact support if money was deducted.');
            navigate('/orders');
          }
        },
      };

      const rzp = new window.Razorpay(opts);
      rzp.on('payment.failed', resp => {
        toast.error(`Payment failed: ${resp.error.description}`);
        setProcessing(false);
      });
      rzp.open();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not place order');
      setProcessing(false);
    }
  };

  if (cart.length === 0) return null;
  const selectedAddress = addresses.find(a => a.id === selAddr);

  return (
    <div style={{ minHeight:'100vh', paddingTop:'60px', paddingBottom:'80px', background:'var(--bg)' }}>
      {/* Header */}
      <div style={{ borderBottom:'1px solid var(--b1)', background:'rgba(255,255,255,0.01)' }}>
        <div className="container-max" style={{ padding:'24px 32px' }}>
          <h1 style={{ fontSize:'22px', fontWeight:800, color:'var(--t1)', letterSpacing:'-0.03em', marginBottom:'16px' }}>Checkout</h1>

          {/* Step bar */}
          <div style={{ display:'flex', alignItems:'center', gap:'0' }}>
            {STEPS.map((s, i) => {
              const done    = step > i + 1;
              const active  = step === i + 1;
              return (
                <div key={s} style={{ display:'flex', alignItems:'center' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                    <div style={{ width:'28px', height:'28px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:700, transition:'all 0.3s',
                      background: done ? '#22c55e' : active ? '#6366f1' : 'rgba(255,255,255,0.06)',
                      color: done || active ? '#fff' : 'var(--t4)',
                      border: `2px solid ${done ? '#22c55e' : active ? '#6366f1' : 'rgba(255,255,255,0.1)'}`,
                    }}>
                      {done ? '✓' : i + 1}
                    </div>
                    <span style={{ fontSize:'13px', fontWeight: active ? 600 : 400, color: active ? 'var(--t1)' : done ? 'var(--t3)' : 'var(--t4)' }}>{s}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div style={{ width:'40px', height:'1px', background: step > i + 1 ? '#22c55e' : 'var(--b2)', margin:'0 12px', transition:'background 0.4s' }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="container-max" style={{ padding:'32px 32px 0', display:'grid', gridTemplateColumns:'1fr 340px', gap:'24px', alignItems:'start' }}>

        {/* ───── LEFT PANEL ───── */}
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity:0, x:-12 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:12 }} transition={{ duration:0.25 }}>
              <div style={{ background:'var(--bg-1)', border:'1px solid var(--b1)', borderRadius:'16px', padding:'28px' }}>
                <h2 style={{ fontSize:'16px', fontWeight:700, color:'var(--t1)', marginBottom:'20px', letterSpacing:'-0.01em' }}>Select Delivery Address</h2>

                {addresses.length > 0 && (
                  <div style={{ display:'flex', flexDirection:'column', gap:'10px', marginBottom:'16px' }}>
                    {addresses.map(addr => (
                      <label key={addr.id}
                        style={{ display:'flex', gap:'14px', padding:'16px', borderRadius:'12px', cursor:'pointer', transition:'all 0.2s',
                          border:`2px solid ${selAddr === addr.id ? '#6366f1' : 'var(--b1)'}`,
                          background: selAddr === addr.id ? 'rgba(99,102,241,0.06)' : 'rgba(255,255,255,0.02)',
                        }}>
                        <input type="radio" name="addr" value={addr.id} checked={selAddr === addr.id}
                          onChange={() => setSelAddr(addr.id)}
                          style={{ marginTop:'2px', accentColor:'#6366f1', flexShrink:0 }} />
                        <div>
                          <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'4px' }}>
                            <span className="badge-blue" style={{ fontSize:'10px' }}>{addr.label}</span>
                            <span style={{ fontSize:'13px', color:'var(--t3)' }}>{addr.phone}</span>
                          </div>
                          <p style={{ fontSize:'14px', color:'var(--t1)', fontWeight:500 }}>{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}</p>
                          <p style={{ fontSize:'13px', color:'var(--t3)', marginTop:'2px' }}>{addr.city}, {addr.state} — {addr.pincode}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}

                <button onClick={() => setShowForm(o => !o)} className="btn-ghost" style={{ fontSize:'13px', marginBottom:'12px', color:'#818cf8' }}>
                  {showForm ? '✕ Cancel' : '+ Add new address'}
                </button>

                <AnimatePresence>
                  {showForm && (
                    <motion.form initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }}
                      onSubmit={handleAddAddress}
                      style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', padding:'16px', background:'rgba(255,255,255,0.02)', borderRadius:'12px', border:'1px solid var(--b1)', overflow:'hidden', marginBottom:'16px' }}>
                      {[
                        { label:'Type', key:'label', type:'select', opts:['Home','Work','Other'], span:1 },
                        { label:'Phone', key:'phone', type:'tel', placeholder:'10-digit mobile', span:1 },
                        { label:'Address Line 1', key:'line1', type:'text', placeholder:'House No, Street', span:2 },
                        { label:'Line 2 (optional)', key:'line2', type:'text', placeholder:'Landmark, Area', span:2 },
                        { label:'City', key:'city', type:'text', placeholder:'City', span:1 },
                        { label:'Pincode', key:'pincode', type:'text', placeholder:'6-digit', maxLength:6, span:1 },
                        { label:'State', key:'state', type:'select', opts:STATES, span:2 },
                      ].map(f => (
                        <div key={f.key} style={{ gridColumn: `span ${f.span}` }}>
                          <label className="form-label">{f.label}</label>
                          {f.type === 'select'
                            ? <select value={addrForm[f.key]} onChange={e => setAddrForm(p => ({...p, [f.key]:e.target.value}))} className="form-input">
                                {f.opts.map(o => <option key={o}>{o}</option>)}
                              </select>
                            : <input type={f.type} required={f.key !== 'line2'} value={addrForm[f.key]}
                                onChange={e => setAddrForm(p => ({...p, [f.key]:e.target.value}))}
                                placeholder={f.placeholder} maxLength={f.maxLength} className="form-input" />
                          }
                        </div>
                      ))}
                      <div style={{ gridColumn:'span 2', display:'flex', justifyContent:'flex-end', gap:'10px', marginTop:'4px' }}>
                        <button type="button" onClick={() => setShowForm(false)} className="btn-secondary" style={{ fontSize:'13px' }}>Cancel</button>
                        <button type="submit" className="btn-accent" style={{ fontSize:'13px' }}>Save address</button>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>

                {selAddr && (
                  <button onClick={() => setStep(2)} className="btn-accent"
                    style={{ width:'100%', justifyContent:'center', padding:'13px', fontSize:'15px', fontWeight:700, borderRadius:'12px', marginTop:'8px' }}>
                    Continue to Review →
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity:0, x:-12 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:12 }} transition={{ duration:0.25 }}>
              <div style={{ background:'var(--bg-1)', border:'1px solid var(--b1)', borderRadius:'16px', padding:'28px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
                  <h2 style={{ fontSize:'16px', fontWeight:700, color:'var(--t1)', letterSpacing:'-0.01em' }}>Review Order</h2>
                  <button onClick={() => setStep(1)} className="btn-ghost" style={{ fontSize:'13px', color:'#818cf8' }}>← Change address</button>
                </div>

                {selectedAddress && (
                  <div style={{ padding:'14px', borderRadius:'12px', background:'rgba(34,197,94,0.05)', border:'1px solid rgba(34,197,94,0.15)', marginBottom:'20px' }}>
                    <p style={{ fontSize:'11px', fontWeight:600, color:'#4ade80', marginBottom:'6px', letterSpacing:'0.05em' }}>📍 SHIPPING TO</p>
                    <p style={{ fontSize:'14px', fontWeight:600, color:'var(--t1)' }}>{selectedAddress.line1}{selectedAddress.line2 ? `, ${selectedAddress.line2}` : ''}</p>
                    <p style={{ fontSize:'13px', color:'var(--t3)', marginTop:'2px' }}>{selectedAddress.city}, {selectedAddress.state} — {selectedAddress.pincode}</p>
                    <p style={{ fontSize:'13px', color:'var(--t3)', marginTop:'2px' }}>📞 {selectedAddress.phone}</p>
                  </div>
                )}

                <div style={{ display:'flex', flexDirection:'column', gap:'10px', marginBottom:'20px' }}>
                  {cart.map(item => (
                    <div key={item.id || item.productId} style={{ display:'flex', gap:'12px', alignItems:'center', padding:'12px', borderRadius:'10px', background:'rgba(255,255,255,0.02)' }}>
                      <div style={{ width:'44px', height:'44px', borderRadius:'8px', background:'rgba(255,255,255,0.04)', border:'1px solid var(--b1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', fontWeight:800, color:'rgba(255,255,255,0.12)', flexShrink:0 }}>
                        {item.product?.name?.[0]}
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <p style={{ fontSize:'14px', fontWeight:600, color:'var(--t1)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.product?.name}</p>
                        <p style={{ fontSize:'12px', color:'var(--t4)', marginTop:'2px' }}>Qty: {item.quantity}</p>
                      </div>
                      <p style={{ fontSize:'14px', fontWeight:700, color:'var(--t1)', flexShrink:0 }}>₹{(item.quantity * Number(item.product?.price)).toLocaleString('en-IN')}</p>
                    </div>
                  ))}
                </div>

                <button onClick={() => setStep(3)} className="btn-accent"
                  style={{ width:'100%', justifyContent:'center', padding:'13px', fontSize:'15px', fontWeight:700, borderRadius:'12px' }}>
                  Proceed to Payment →
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity:0, x:-12 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:12 }} transition={{ duration:0.25 }}>
              <div style={{ background:'var(--bg-1)', border:'1px solid var(--b1)', borderRadius:'16px', padding:'28px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px' }}>
                  <h2 style={{ fontSize:'16px', fontWeight:700, color:'var(--t1)', letterSpacing:'-0.01em' }}>Secure Payment</h2>
                  <button onClick={() => setStep(2)} className="btn-ghost" style={{ fontSize:'13px', color:'#818cf8' }}>← Back</button>
                </div>

              {/* Payment Method Selector */}
                <div style={{ marginBottom:'24px' }}>
                  <p style={{ fontSize:'13px', fontWeight:700, color:'var(--t2)', marginBottom:'12px' }}>Choose Payment Method</p>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                    {[
                      { id:'razorpay', icon:'🔒', title:'Online Payment', sub:'Cards, UPI, NetBanking, Wallets' },
                      { id:'cod',      icon:'💵', title:'Cash on Delivery', sub:'Pay when your order arrives' },
                    ].map(m => (
                      <button key={m.id} type="button" onClick={() => setPayMethod(m.id)}
                        style={{ padding:'14px', borderRadius:'12px', textAlign:'left', cursor:'pointer', fontFamily:'inherit', transition:'all 0.2s',
                          border: `2px solid ${payMethod===m.id ? '#1B3C1A' : 'var(--b1)'}`,
                          background: payMethod===m.id ? 'rgba(27,60,26,0.06)' : 'rgba(255,255,255,0.02)',
                        }}>
                        <div style={{ fontSize:'20px', marginBottom:'6px' }}>{m.icon}</div>
                        <p style={{ fontSize:'13px', fontWeight:700, color:'var(--t1)', marginBottom:'2px' }}>{m.title}</p>
                        <p style={{ fontSize:'11px', color:'var(--t3)' }}>{m.sub}</p>
                        {payMethod===m.id && (
                          <div style={{ marginTop:'6px', width:'8px', height:'8px', borderRadius:'50%', background:'#1B3C1A' }} />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Razorpay info */}
                {payMethod === 'razorpay' && (
                <div style={{ padding:'16px', borderRadius:'12px', background:'rgba(99,102,241,0.05)', border:'1px solid rgba(99,102,241,0.15)', marginBottom:'24px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'12px' }}>
                    <span style={{ fontSize:'18px' }}>🔒</span>
                    <div>
                      <p style={{ fontSize:'14px', fontWeight:600, color:'var(--t1)' }}>Powered by Razorpay</p>
                      <p style={{ fontSize:'12px', color:'var(--t3)' }}>256-bit SSL encrypted · PCI-DSS compliant</p>
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
                    {['💳 Cards', '📱 UPI', '🏦 NetBanking', '👛 Wallets'].map(m => (
                      <span key={m} style={{ fontSize:'12px', padding:'5px 12px', borderRadius:'99px', background:'rgba(255,255,255,0.05)', border:'1px solid var(--b1)', color:'var(--t3)' }}>{m}</span>
                    ))}
                  </div>
                </div>
                )}

                {/* COD info */}
                {payMethod === 'cod' && (
                <div style={{ padding:'16px', borderRadius:'12px', background:'rgba(27,60,26,0.05)', border:'1px solid rgba(27,60,26,0.2)', marginBottom:'24px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                    <span style={{ fontSize:'22px' }}>💵</span>
                    <div>
                      <p style={{ fontSize:'14px', fontWeight:600, color:'var(--t1)' }}>Cash on Delivery</p>
                      <p style={{ fontSize:'12px', color:'var(--t3)', lineHeight:1.6 }}>Pay in cash when your order is delivered. No advance payment required.</p>
                    </div>
                  </div>
                  <div style={{ marginTop:'12px', padding:'10px 12px', borderRadius:'8px', background:'rgba(27,60,26,0.08)', fontSize:'12px', color:'var(--t3)' }}>
                    ⚠️ COD orders may take 1–2 extra days to process. Ensure someone is available to receive the package.
                  </div>
                </div>
                )}

                {/* Bill breakdown */}
                <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid var(--b1)', borderRadius:'12px', padding:'16px', marginBottom:'24px' }}>
                  {[
                    ...(totalDiscount > 0 ? [{ l:`You Save`, v:`–₹${totalDiscount.toFixed(2)}`, green:true, bold:true }] : []),
                    { l:`Subtotal (${cart.length} items)`, v:`₹${cartTotal.toFixed(2)}` },
                    { l:'GST (18%)',    v:`₹${tax.toFixed(2)}` },
                    { l:'Shipping',    v: shipping === 0 ? 'Free' : `₹${shipping}`, green: shipping === 0 },
                  ].map(r => (
                    <div key={r.l} style={{ display:'flex', justifyContent:'space-between', marginBottom:'10px', fontSize:'13px' }}>
                      <span style={{ color:'var(--t3)' }}>{r.l}</span>
                      <span style={{ color: r.green ? '#4ade80' : 'var(--t2)', fontWeight: r.bold ? 700 : 500 }}>{r.v}</span>
                    </div>
                  ))}
                  <div style={{ display:'flex', justifyContent:'space-between', borderTop:'1px solid var(--b1)', paddingTop:'12px', marginTop:'4px' }}>
                    <span style={{ fontSize:'15px', fontWeight:700, color:'var(--t1)' }}>Total</span>
                    <span style={{ fontSize:'20px', fontWeight:900, color:'var(--t1)', letterSpacing:'-0.03em' }}>₹{total.toFixed(2)}</span>
                  </div>
                </div>

                <button onClick={handlePay} disabled={processing} className="btn-accent"
                  style={{ width:'100%', justifyContent:'center', padding:'14px', fontSize:'16px', fontWeight:700, borderRadius:'12px', boxShadow: processing ? 'none' : '0 0 0 4px rgba(99,102,241,0.2)' }}>
                  {processing
                    ? <span style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                        <span style={{ width:'16px', height:'16px', border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin 0.7s linear infinite', display:'inline-block' }} />
                        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                        {payMethod==='cod' ? 'Placing order…' : 'Opening payment gateway...'}
                      </span>
                    : payMethod==='cod'
                      ? `💵 Place Order (Cash on Delivery)`
                      : `🔒 Pay ₹${total.toFixed(2)} with Razorpay`
                  }
                </button>

                <p style={{ textAlign:'center', fontSize:'11px', color:'var(--t4)', marginTop:'12px' }}>
                  By placing this order you agree to our Terms of Service and Return Policy
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ───── RIGHT: Order Summary ───── */}
        <div style={{ position:'sticky', top:'80px' }}>
          <div style={{ background:'var(--bg-1)', border:'1px solid var(--b1)', borderRadius:'16px', padding:'22px' }}>
            <p style={{ fontSize:'12px', fontWeight:700, color:'var(--t4)', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:'16px' }}>Order Summary</p>

            <div style={{ display:'flex', flexDirection:'column', gap:'8px', marginBottom:'16px', maxHeight:'220px', overflowY:'auto' }} className="no-scrollbar">
              {cart.map(item => (
                <div key={item.id || item.productId} style={{ display:'flex', gap:'10px', alignItems:'center' }}>
                  <span style={{ width:'20px', height:'20px', borderRadius:'6px', background:'rgba(99,102,241,0.15)', color:'#818cf8', fontSize:'10px', fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{item.quantity}</span>
                  <span style={{ flex:1, fontSize:'13px', color:'var(--t2)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.product?.name}</span>
                  <span style={{ fontSize:'13px', fontWeight:600, color:'var(--t1)', flexShrink:0 }}>₹{(item.quantity * Number(item.product?.price)).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>

            <div style={{ borderTop:'1px solid var(--b1)', paddingTop:'14px', display:'flex', flexDirection:'column', gap:'8px' }}>
              {[
                ...(totalDiscount > 0 ? [{ l:'You Save', v:`–₹${totalDiscount.toFixed(2)}`, save:true }] : []),
                { l:'Subtotal', v:`₹${cartTotal.toFixed(2)}` },
                { l:'GST',      v:`₹${tax.toFixed(2)}` },
                { l:'Shipping', v: shipping === 0 ? 'Free' : `₹${shipping}`, free: shipping === 0 },
              ].map(r => (
                <div key={r.l} style={{ display:'flex', justifyContent:'space-between', fontSize:'13px' }}>
                  <span style={{ color: r.save ? '#4ade80' : 'var(--t3)', fontWeight: r.save ? 700 : 400 }}>{r.l}</span>
                  <span style={{ color: r.save ? '#4ade80' : r.free ? '#4ade80' : 'var(--t2)', fontWeight: r.save ? 700 : 500 }}>{r.v}</span>
                </div>
              ))}
              <div style={{ display:'flex', justifyContent:'space-between', borderTop:'1px solid var(--b1)', paddingTop:'12px', marginTop:'4px' }}>
                <span style={{ fontSize:'14px', fontWeight:700, color:'var(--t1)' }}>Total</span>
                <span style={{ fontSize:'18px', fontWeight:900, color:'var(--t1)', letterSpacing:'-0.02em' }}>₹{total.toFixed(2)}</span>
              </div>
            </div>

            <div style={{ marginTop:'16px', paddingTop:'16px', borderTop:'1px solid var(--b1)', display:'flex', flexDirection:'column', gap:'8px' }}>
              {['✅ Free 7-day returns', '🔒 Razorpay secured', '📄 GST invoice included'].map(b => (
                <p key={b} style={{ fontSize:'12px', color:'var(--t4)' }}>{b}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
