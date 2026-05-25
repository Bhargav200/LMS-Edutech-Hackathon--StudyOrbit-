'use client';

import { useState, useEffect } from 'react';
import PortalShell from '@/components/PortalShell';
import AIStudyBuddy from '@/components/AIStudyBuddy';
import { supabase } from '@/lib/supabaseClient';
import { 
  CreditCard, CheckCircle2, AlertCircle, Clock, 
  ArrowRight, Download, HelpCircle, X, Check, Award, Activity, Orbit 
} from 'lucide-react';

export default function StudentPayments() {
  const [studentId, setStudentId] = useState('f9b07384-f113-4318-f89e-4cdeee958b92');
  const [fee, setFee] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Checkout Drawer states
  const [showCheckout, setShowCheckout] = useState(false);
  const [payAmount, setPayAmount] = useState(4250);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card'>('upi');
  const [processing, setProcessing] = useState(false);
  const [paySuccess, setPaySuccess] = useState(false);

  useEffect(() => {
    const storedId = localStorage.getItem('study_orbit_user_id') || 'f9b07384-f113-4318-f89e-4cdeee958b92';
    setStudentId(storedId);

    async function loadFinances() {
      // 1. Fetch fees data
      const { data: feeData } = await supabase
        .from('fees')
        .select('*')
        .eq('student_id', storedId)
        .single();
      
      if (feeData) setFee(feeData);

      // 2. Fetch payments list
      const { data: pays } = await supabase
        .from('payments')
        .select('*')
        .eq('student_id', storedId)
        .order('paid_at', { ascending: false });
      
      if (pays) setPayments(pays);

      setLoading(false);
    }
    loadFinances();
  }, []);

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fee || processing) return;
    setProcessing(true);

    try {
      // Simulate Payment Process (800ms)
      await new Promise(resolve => setTimeout(resolve, 800));

      const payId = 'pa' + Math.random().toString(36).substring(2, 10).toUpperCase();

      // 1. Insert Payment
      const { error: insertPayErr } = await supabase
        .from('payments')
        .insert({
          id: '88888888-8888-8888-8888-' + Math.random().toString().substring(2,14),
          fee_id: fee.id,
          student_id: studentId,
          amount: payAmount,
          currency: 'INR',
          gateway: 'stripe',
          gateway_payment_id: payId,
          status: 'success',
          invoice_url: 'https://ujksrvgddvetziudrljw.supabase.co/storage/v1/object/public/invoices/INV-2026-002.pdf',
          platform_fee: 85.00,
          paid_at: new Date().toISOString()
        });

      if (insertPayErr) throw insertPayErr;

      // 2. Update Fee Table (marked as fully paid)
      const updatedPlan = { ...fee.plan };
      if (updatedPlan.installments) {
        updatedPlan.installments[1].status = 'paid';
      }
      
      const { error: updateFeeErr } = await supabase
        .from('fees')
        .update({
          paid_amount: fee.total_amount,
          status: 'paid',
          plan: updatedPlan
        })
        .eq('id', fee.id);

      if (updateFeeErr) throw updateFeeErr;

      // 3. Create Invoice
      const invId = 'in' + Math.random().toString(36).substring(2, 10).toUpperCase();
      await supabase
        .from('invoices')
        .insert({
          payment_id: '88888888-8888-8888-8888-' + Math.random().toString().substring(2,14),
          invoice_number: 'INV-2026-002',
          file_url: 'https://ujksrvgddvetziudrljw.supabase.co/storage/v1/object/public/invoices/INV-2026-002.pdf',
          generated_at: new Date().toISOString()
        });

      // Refetch financial tables
      const { data: feeData } = await supabase
        .from('fees')
        .select('*')
        .eq('student_id', studentId)
        .single();
      
      if (feeData) setFee(feeData);

      const { data: pays } = await supabase
        .from('payments')
        .select('*')
        .eq('student_id', studentId)
        .order('paid_at', { ascending: false });
      
      if (pays) setPayments(pays);

      setPaySuccess(true);
      setTimeout(() => {
        setPaySuccess(false);
        setShowCheckout(false);
      }, 1500);

    } catch (err: any) {
      console.error('Error processing checkout:', err.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <PortalShell>
      <div className="space-y-8">
        
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold font-outfit text-white">Tuition Ledger</h2>
          <p className="text-sm text-zinc-400 mt-1 font-sans leading-normal">
            Track tuition plans, resolve pending installments securely, and download verified GST invoices.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-pulse">
            <div className="lg:col-span-4 glass-panel h-64 rounded-2xl" />
            <div className="lg:col-span-8 glass-panel h-64 rounded-2xl" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Tuition Summary (Colspan 4/12) */}
            <div className="lg:col-span-4 space-y-6">
              
              {fee && (
                <div className="glass-panel rounded-2xl p-6 relative overflow-hidden shadow-lg border border-zinc-800">
                  <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-royal" />
                  
                  <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 font-outfit mb-4">Installment Tiers</h3>
                  
                  <div className="space-y-4">
                    {fee.plan?.installments?.map((inst: any, idx: number) => {
                      const isPaid = inst.status === 'paid';
                      return (
                        <div key={idx} className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between gap-4">
                          <div className="space-y-1">
                            <p className="text-xs font-bold text-white font-outfit">Installment {idx + 1}</p>
                            <p className="text-[10px] text-zinc-500 font-medium">Amount: INR {inst.amount}</p>
                          </div>
                          
                          {isPaid ? (
                            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold bg-emerald-500/5 px-2.5 py-1 rounded-full border border-emerald-500/10">
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                              Paid
                            </span>
                          ) : (
                            <button
                              onClick={() => {
                                setPayAmount(inst.amount);
                                setShowCheckout(true);
                              }}
                              className="px-3.5 py-1.5 rounded-lg bg-gradient-royal text-white text-[10px] font-bold hover:opacity-95 cursor-pointer flex items-center gap-1 shadow shadow-blue-500/10"
                            >
                              Pay Now
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Outstanding metrics ledger */}
              {fee && (
                <div className="glass-panel rounded-2xl p-6 shadow-lg border border-zinc-800 space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-blue-400 font-outfit">Tuition Balance</h3>
                  
                  <div className="space-y-3 font-sans">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-500">Collected Total</span>
                      <span className="text-emerald-400 font-bold">INR {Number(fee.paid_amount).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-500">Total Program Cost</span>
                      <span className="text-white font-semibold">INR {Number(fee.total_amount).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs border-t border-zinc-850 pt-2.5">
                      <span className="text-zinc-400 font-semibold">Outstanding Balance</span>
                      <span className={`font-bold ${fee.status === 'paid' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        INR {Number(fee.total_amount - fee.paid_amount).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Right Column: Transaction Logs (Colspan 8/12) */}
            <div className="lg:col-span-8 space-y-6">
              
              <div className="glass-panel rounded-2xl p-6 shadow-lg overflow-hidden border border-zinc-800">
                <h3 className="text-sm font-bold uppercase tracking-wider text-teal-400 font-outfit mb-4">Transaction History</h3>
                
                {payments.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-sans border-collapse">
                      <thead>
                        <tr className="border-b border-zinc-800 text-zinc-500 font-semibold uppercase tracking-wider text-[10px]">
                          <th className="pb-3 pr-4 font-outfit">Ref Code</th>
                          <th className="pb-3 pr-4 font-outfit">Method</th>
                          <th className="pb-3 pr-4 font-outfit">Gateway</th>
                          <th className="pb-3 pr-4 font-outfit">Amount</th>
                          <th className="pb-3 pr-4 font-outfit">Settled Date</th>
                          <th className="pb-3 font-outfit text-right">Invoices</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-850">
                        {payments.map((p) => (
                          <tr key={p.id} className="hover:bg-zinc-900/35 transition-colors">
                            <td className="py-4 pr-4 font-mono text-white text-[11px]">{p.gateway_payment_id || 'MOCK-PAY'}</td>
                            <td className="py-4 pr-4 font-semibold text-zinc-400 capitalize">{p.gateway === 'manual' ? 'Offline' : 'Online'}</td>
                            <td className="py-4 pr-4 text-zinc-500 font-medium capitalize">{p.gateway}</td>
                            <td className="py-4 pr-4 font-bold text-white">INR {Number(p.amount).toFixed(2)}</td>
                            <td className="py-4 pr-4 text-zinc-500">{new Date(p.paid_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                            <td className="py-4 text-right">
                              <a
                                href={p.invoice_url || '#'}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[10px] text-blue-400 hover:text-blue-300 font-semibold hover:underline bg-blue-500/5 px-2.5 py-1 rounded border border-blue-500/10 cursor-pointer transition-colors"
                              >
                                <Download className="w-3 h-3" />
                                GST PDF
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Activity className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                    <p className="text-xs text-zinc-500">No payment transaction logs posted.</p>
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

      </div>

      {/* CHECKOUT INTERACTIVE SIDEBAR DRAWER */}
      {showCheckout && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
          
          <div className="w-full max-w-md h-screen bg-obsidian border-l border-zinc-800 p-8 shadow-2xl flex flex-col justify-between relative animate-in slide-in-from-right duration-300">
            <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-royal" />
            
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-3 border-b border-zinc-800/80">
                <h3 className="text-base font-bold font-outfit text-white tracking-wide">StudyOrbit Checkout</h3>
                <button onClick={() => setShowCheckout(false)} className="p-1 rounded hover:bg-zinc-800 text-zinc-400 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-2">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Tendering Installment</span>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-xs text-zinc-300 font-medium">Advanced Full-Stack Development</span>
                  <span className="text-sm font-bold text-white font-outfit">INR {payAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Methods selector */}
              <div className="space-y-3">
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Select Payment Mode</label>
                
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    className={`p-4 rounded-xl border flex flex-col items-center justify-center space-y-2 cursor-pointer transition-all ${paymentMethod === 'upi' ? 'border-blue-500/50 bg-blue-500/5 text-blue-400 shadow shadow-blue-500/5' : 'border-zinc-800 bg-zinc-900/20 text-zinc-500 hover:border-zinc-700'}`}
                  >
                    <Orbit className="w-5 h-5" />
                    <span className="text-xs font-semibold">UPI (GPay/PhonePe)</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-4 rounded-xl border flex flex-col items-center justify-center space-y-2 cursor-pointer transition-all ${paymentMethod === 'card' ? 'border-blue-500/50 bg-blue-500/5 text-blue-400 shadow shadow-blue-500/5' : 'border-zinc-800 bg-zinc-900/20 text-zinc-500 hover:border-zinc-700'}`}
                  >
                    <CreditCard className="w-5 h-5" />
                    <span className="text-xs font-semibold">Debit/Credit Card</span>
                  </button>
                </div>
              </div>

              {paymentMethod === 'upi' && (
                <div className="space-y-3">
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">UPI ID Address</label>
                  <input
                    type="text"
                    placeholder="rohan@okaxis"
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs font-sans"
                  />
                </div>
              )}

              {paymentMethod === 'card' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Card Number</label>
                    <input
                      type="text"
                      placeholder="4111 2222 3333 4444"
                      className="w-full px-3 py-2 rounded-xl glass-input text-xs font-sans"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Expiry</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        className="w-full px-3 py-2 rounded-xl glass-input text-xs font-sans text-center"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">CVV</label>
                      <input
                        type="password"
                        placeholder="•••"
                        maxLength={3}
                        className="w-full px-3 py-2 rounded-xl glass-input text-xs font-sans text-center"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom pay button */}
            <div className="space-y-3">
              {paySuccess && (
                <div className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-xl flex items-center gap-1.5 font-semibold">
                  <Check className="w-4 h-4 text-emerald-500" />
                  Transaction verified successfully!
                </div>
              )}

              <button
                onClick={handleCheckoutSubmit}
                disabled={processing || paySuccess}
                className="w-full py-3.5 rounded-xl bg-gradient-royal text-white text-xs font-bold hover:opacity-95 shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {processing ? 'Processing Sandbox...' : `Authorize INR ${payAmount.toFixed(2)}`}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>
      )}

      <AIStudyBuddy />
    </PortalShell>
  );
}
