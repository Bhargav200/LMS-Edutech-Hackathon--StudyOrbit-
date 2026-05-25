'use client';

import { useState, useEffect } from 'react';
import PortalShell from '@/components/PortalShell';
import { supabase } from '@/lib/supabaseClient';
import { 
  Users, Award, Calendar, CreditCard, Clock, CheckCircle2, 
  MessageSquare, BookOpen, ChevronRight, Search, TrendingUp, 
  DollarSign, ArrowRight, ShieldCheck, X, Sparkles, Send
} from 'lucide-react';

export default function ParentDashboard() {
  const [parentId, setParentId] = useState('a9b07384-a113-4318-a89e-4cdeee958b93');
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChild, setSelectedChild] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Ward analytical stats
  const [courseProgress, setCourseProgress] = useState<any>(null);
  const [attendanceRate, setAttendanceRate] = useState<number>(95);
  const [remarks, setRemarks] = useState<any[]>([]);
  const [outstandingFees, setOutstandingFees] = useState<any[]>([]);

  // Fee payment drawer
  const [activePayFee, setActivePayFee] = useState<any>(null);
  const [paying, setPaying] = useState(false);
  const [paySuccess, setPaySuccess] = useState(false);
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');

  useEffect(() => {
    const storedId = localStorage.getItem('study_orbit_user_id') || 'a9b07384-a113-4318-a89e-4cdeee958b93';
    setParentId(storedId);

    async function loadParentPortal() {
      // 1. Fetch children profiles mapping
      let { data: wards, error: wardsErr } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, phone, parent_id')
        .eq('parent_id', storedId);

      // Fallback sandbox: if Meera has no database mapped kids, map Rohan Sharma as her child!
      if (!wards || wards.length === 0) {
        const { data: rohan } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url, phone, parent_id')
          .eq('id', 'f9b07384-f113-4318-f89e-4cdeee958b92')
          .single();
        
        if (rohan) {
          wards = [rohan];
          // Proactively set parent_id link in local cache / db update
          await supabase.from('profiles').update({ parent_id: storedId }).eq('id', 'f9b07384-f113-4318-f89e-4cdeee958b92');
        }
      }

      if (wards && wards.length > 0) {
        setChildren(wards);
        setSelectedChild(wards[0]);
      }
      setLoading(false);
    }
    loadParentPortal();
  }, []);

  // Whenever selected child changes, load details (course progress, attendance, remarks, outstanding fees)
  useEffect(() => {
    if (!selectedChild) return;

    async function loadWardData() {
      // 1. Fetch syllabus course progress
      const { data: progress } = await supabase
        .from('student_course_progress')
        .select(`
          overall_progress,
          last_accessed_at,
          courses (
            title
          )
        `)
        .eq('student_id', selectedChild.id)
        .single();

      if (progress) {
        setCourseProgress(progress);
      } else {
        setCourseProgress({ overall_progress: 75, courses: { title: 'Full-Stack Developer Sandbox' } });
      }

      // 2. Fetch live attendance rate
      const { data: attRecords } = await supabase
        .from('attendance')
        .select('status')
        .eq('student_id', selectedChild.id);

      if (attRecords && attRecords.length > 0) {
        const present = attRecords.filter(a => a.status === 'present').length;
        setAttendanceRate(Math.round((present / attRecords.length) * 100));
      } else {
        setAttendanceRate(92); // Sandbox default
      }

      // 3. Fetch instructor remarks (graded submissions with feedback)
      const { data: subs } = await supabase
        .from('assignment_submissions')
        .select(`
          grade,
          feedback,
          graded_at,
          assignments (
            title
          )
        `)
        .eq('student_id', selectedChild.id)
        .eq('status', 'graded')
        .order('graded_at', { ascending: false });

      if (subs && subs.length > 0) {
        setRemarks(subs);
      } else {
        setRemarks([
          {
            grade: 90,
            feedback: 'Rohan exhibits excellent React layout assembly. Highly active in cohort lectures.',
            graded_at: new Date().toISOString(),
            assignments: { title: 'Bento Grid Portfolio layout' }
          }
        ]);
      }

      // 4. Fetch unpaid outstanding fees
      const { data: fees } = await supabase
        .from('fees')
        .select(`
          id,
          total_amount,
          paid_amount,
          status,
          courses (
            title
          )
        `)
        .eq('student_id', selectedChild.id)
        .neq('status', 'paid');

      if (fees) {
        setOutstandingFees(fees);
      }
    }
    loadWardData();
  }, [selectedChild]);

  const handlePayFee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePayFee || paying) return;
    setPaying(true);

    try {
      // Simulate fee update to Paid
      const newPaid = Number(activePayFee.total_amount);
      const { error } = await supabase
        .from('fees')
        .update({
          paid_amount: newPaid,
          status: 'paid'
        })
        .eq('id', activePayFee.id);

      if (error) throw error;

      // Log payment transaction record
      const { data: paymentRecord } = await supabase
        .from('payments')
        .insert({
          fee_id: activePayFee.id,
          student_id: selectedChild.id,
          amount: newPaid - Number(activePayFee.paid_amount),
          gateway: 'manual',
          status: 'success',
          paid_at: new Date().toISOString()
        })
        .select()
        .single();

      // Trigger automatic invoice PDF simulation
      if (paymentRecord) {
        await supabase
          .from('invoices')
          .insert({
            payment_id: paymentRecord.id,
            invoice_number: `INV-P-${Math.floor(1000 + Math.random() * 9000)}`,
            generated_at: new Date().toISOString()
          });
      }

      // Update state
      setOutstandingFees(prev => prev.filter(f => f.id !== activePayFee.id));
      setPaySuccess(true);
      setCardName('');
      setCardNumber('');
      setTimeout(() => {
        setPaySuccess(false);
        setActivePayFee(null);
      }, 1500);

    } catch (err: any) {
      console.error('Error paying fee:', err.message);
    } finally {
      setPaying(false);
    }
  };

  return (
    <PortalShell>
      <div className="space-y-8 relative">
        
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold font-outfit text-white">Parent Operations Panel</h2>
            <p className="text-sm text-zinc-400 mt-1 font-sans leading-normal">
              Toggle academic checklists, track live classroom attendances, and settle tuition fee ledgers.
            </p>
          </div>

          {/* Child Switcher selector tabs */}
          {children.length > 1 && (
            <div className="flex gap-2 p-1 bg-zinc-950/60 rounded-xl border border-zinc-850 self-start">
              {children.map((kid) => (
                <button
                  key={kid.id}
                  onClick={() => setSelectedChild(kid)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold font-outfit transition-all cursor-pointer ${selectedChild?.id === kid.id ? 'bg-gradient-royal text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  {kid.full_name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Bento Grid Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Overall Progress Circular Rings & Remarks (Colspan 7/12) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Child Analytics Card */}
            {selectedChild && (
              <div className="glass-panel rounded-2xl p-6 border border-zinc-800 grid grid-cols-1 md:grid-cols-3 gap-6 shadow">
                
                {/* Circular progress dial */}
                <div className="flex flex-col items-center justify-center p-4 bg-zinc-950/40 rounded-xl border border-zinc-850/60">
                  <div className="relative w-28 h-28 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="56" cy="56" r="46" strokeWidth="6" stroke="#1F2937" fill="transparent" />
                      <circle 
                        cx="56" 
                        cy="56" 
                        r="46" 
                        strokeWidth="6" 
                        stroke="url(#royalGradient)" 
                        strokeDasharray={288} 
                        strokeDashoffset={288 - (288 * (courseProgress?.overall_progress || 0)) / 100} 
                        fill="transparent" 
                        className="transition-all duration-1000"
                      />
                      <defs>
                        <linearGradient id="royalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#2563EB" />
                          <stop offset="100%" stopColor="#7C3AED" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <span className="absolute text-2xl font-bold font-outfit text-white">
                      {courseProgress?.overall_progress || 0}%
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-outfit mt-4">Syllabus Progress</span>
                </div>

                {/* Live attendance meter */}
                <div className="flex flex-col justify-between p-4 bg-zinc-950/40 rounded-xl border border-zinc-850/60 min-h-[10rem]">
                  <div>
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider font-outfit">Ward Attendance</span>
                    <h4 className="text-2xl font-bold font-outfit text-white mt-2">{attendanceRate}%</h4>
                  </div>
                  <div className="space-y-1">
                    <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: `${attendanceRate}%` }} />
                    </div>
                    <span className="text-[9px] text-zinc-500 font-semibold block font-sans">Threshold recommendation: 75%</span>
                  </div>
                </div>

                {/* Dynamic details info */}
                <div className="flex flex-col justify-between p-4 bg-zinc-950/40 rounded-xl border border-zinc-850/60 min-h-[10rem]">
                  <div>
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider font-outfit">Active Course</span>
                    <h4 className="text-sm font-bold font-outfit text-white mt-2 leading-snug line-clamp-2">
                      {courseProgress?.courses?.title || 'Loading active program...'}
                    </h4>
                  </div>
                  <span className="text-[9px] text-zinc-500 font-semibold block font-sans">Seeded: Quantum Academics</span>
                </div>

              </div>
            )}

            {/* Educator remarks feedback logs */}
            <div className="glass-panel rounded-2xl p-6 border border-zinc-800 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-purple-400 font-outfit flex items-center gap-2">
                <Award className="w-4 h-4 text-purple-400" />
                Educator Remarks & Grades
              </h3>

              <div className="space-y-4">
                {remarks.map((rem, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-zinc-950/40 border border-zinc-850/80 space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-zinc-900">
                      <div>
                        <h4 className="text-xs font-bold text-white font-outfit">{rem.assignments?.title}</h4>
                        <p className="text-[9px] text-zinc-500 mt-0.5">Instructor assessment score</p>
                      </div>
                      <span className="text-lg font-bold font-outfit text-emerald-400">{Number(rem.grade)}%</span>
                    </div>

                    <div className="space-y-1.5 p-3 rounded-lg bg-zinc-950/20 border border-zinc-850/30">
                      <span className="text-[9px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1 font-outfit">
                        <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
                        Dr. Aris Thorne feedback
                      </span>
                      <p className="text-[11px] text-zinc-400 leading-relaxed italic">
                        "{rem.feedback}"
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT: Outstanding Billing Ledger & Payment Panel (Colspan 5/12) */}
          <div className="lg:col-span-5 space-y-6">
            
            {activePayFee ? (
              /* Tuition simulation drawer */
              <div className="glass-panel rounded-2xl p-6 border border-blue-500/20 relative overflow-hidden shadow-2xl space-y-4 bg-blue-500/5">
                <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-royal" />
                
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-blue-400 font-outfit">Settle Outstanding Tuition</h3>
                  <button onClick={() => setActivePayFee(null)} className="p-1 rounded hover:bg-zinc-800 text-zinc-400 cursor-pointer">
                    <X className="w-4.5 h-4.5" />
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-850/80 space-y-2">
                  <span className="text-[9px] text-zinc-500 uppercase tracking-wider font-bold block">Tuition Installment</span>
                  <p className="text-2xl font-bold font-outfit text-white">INR {Number(activePayFee.total_amount) - Number(activePayFee.paid_amount)}</p>
                  <p className="text-[10px] text-zinc-400 font-semibold">{activePayFee.courses?.title}</p>
                </div>

                <form onSubmit={handlePayFee} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Cardholder Name</label>
                    <input
                      type="text"
                      placeholder="Meera Sharma"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl glass-input text-xs font-sans text-white focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Card Details</label>
                    <input
                      type="text"
                      placeholder="4321 •••• •••• 8888"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl glass-input text-xs font-sans text-white focus:outline-none"
                      required
                    />
                  </div>

                  {paySuccess && (
                    <div className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl flex items-center gap-1.5 font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Payment successful! Invoice PDF generated under child records.
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={paying}
                    className="w-full py-3 rounded-xl bg-gradient-royal text-white text-xs font-semibold hover:opacity-95 shadow transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {paying ? 'Processing gateway...' : 'Pay tuition fee'}
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            ) : (
              /* Ledger list */
              <div className="glass-panel rounded-2xl p-6 border border-zinc-800 space-y-4 shadow">
                <h3 className="text-sm font-bold uppercase tracking-wider text-blue-400 font-outfit flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-blue-400" />
                  Outstanding Installments Ledger
                </h3>

                <div className="space-y-3">
                  {outstandingFees.length > 0 ? (
                    outstandingFees.map((fee) => {
                      const outstanding = Number(fee.total_amount) - Number(fee.paid_amount);
                      return (
                        <div key={fee.id} className="p-4 rounded-xl bg-zinc-950/40 border border-zinc-850/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div>
                            <h4 className="text-xs font-bold text-white font-outfit truncate max-w-44">{fee.courses?.title}</h4>
                            <p className="text-[10px] text-zinc-500 mt-1 uppercase font-bold tracking-wider">Tuition Fee Due</p>
                          </div>
                          
                          <div className="text-right sm:self-center shrink-0 w-full sm:w-auto">
                            <span className="text-base font-extrabold text-white font-outfit block">INR {outstanding}</span>
                            <button
                              onClick={() => setActivePayFee(fee)}
                              className="mt-2 w-full sm:w-auto px-3.5 py-1.5 rounded-lg bg-gradient-royal text-white text-[10px] font-bold shadow hover:opacity-95 transition-all cursor-pointer flex items-center justify-center gap-1"
                            >
                              Settle Outstanding
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-6">
                      <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                      <p className="text-xs text-zinc-400 font-semibold">Tuition Ledger Clear</p>
                      <p className="text-[10px] text-zinc-500 mt-0.5">All course installments are settled for this cohort.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </PortalShell>
  );
}
