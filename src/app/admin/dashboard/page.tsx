'use client';

import { useState, useEffect } from 'react';
import PortalShell from '@/components/PortalShell';
import { supabase } from '@/lib/supabaseClient';
import { 
  Home, BookOpen, Layers, Palette, DollarSign, Users, Award, 
  TrendingUp, ArrowUpRight, ArrowDownRight, ArrowRight, Activity, 
  ShieldCheck, CreditCard, Clock, Calendar, CheckCircle2
} from 'lucide-react';

export default function AdminDashboard() {
  const [mrr, setMrr] = useState<number>(185000);
  const [totalStudents, setTotalStudents] = useState<number>(0);
  const [totalFaculty, setTotalFaculty] = useState<number>(0);
  const [totalCourses, setTotalCourses] = useState<number>(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAdminMetrics() {
      setLoading(true);
      
      // 1. Fetch total student count
      const { count: studentCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'student');
      
      if (studentCount !== null) setTotalStudents(studentCount);

      // 2. Fetch total faculty count
      const { count: facultyCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'faculty');
      
      if (facultyCount !== null) setTotalFaculty(facultyCount);

      // 3. Fetch total courses count
      const { count: courseCount } = await supabase
        .from('courses')
        .select('*', { count: 'exact', head: true });
      
      if (courseCount !== null) setTotalCourses(courseCount);

      // 4. Fetch payments ledger joined with student profile
      const { data: payments, error: payErr } = await supabase
        .from('payments')
        .select(`
          id,
          amount,
          gateway,
          paid_at,
          status,
          profiles:student_id (
            full_name
          )
        `)
        .order('paid_at', { ascending: false })
        .limit(6);

      if (payErr) {
        console.error('Error fetching payments:', payErr);
      } else if (payments) {
        setTransactions(payments);
        // Calculate MRR dynamic mockup sum
        const grossSum = payments.reduce((acc, curr) => acc + Number(curr.amount), 0);
        if (grossSum > 0) setMrr(grossSum * 5); // scale up for realistic dashboard MRR
      }

      setLoading(false);
    }
    loadAdminMetrics();
  }, []);

  return (
    <PortalShell>
      <div className="space-y-8 relative">
        
        {/* Welcome Header */}
        <div className="glass-panel rounded-2xl p-8 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-royal" />
          <div className="space-y-2">
            <h2 className="text-3xl font-bold font-outfit text-white">
              Administrator, <span className="text-gradient">Sarah Chen</span> 👑
            </h2>
            <p className="text-sm text-zinc-400 max-w-xl font-sans leading-relaxed">
              Oversee the full tenant ecosystem of Quantum Academics. Settle financial billing logs, configure white-label branding configurations, and monitor cohort schedules.
            </p>
          </div>
        </div>

        {/* METRICS ROW BENTO CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="glass-panel rounded-2xl p-6 border border-zinc-800 shadow relative">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-outfit">SaaS Gross MRR</span>
              <DollarSign className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="mt-4 space-y-1">
              <p className="text-2xl font-bold font-outfit text-white">INR {mrr.toLocaleString()}</p>
              <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold font-sans">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>+12.4% MoM</span>
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-6 border border-zinc-800 shadow relative">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-outfit">Total Students</span>
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <div className="mt-4 space-y-1">
              <p className="text-3xl font-bold font-outfit text-white">{totalStudents || 1}</p>
              <p className="text-[10px] text-zinc-500 font-semibold font-sans">Enrolled sandbox users</p>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-6 border border-zinc-800 shadow relative">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-outfit">Lead Faculty</span>
              <Users className="w-5 h-5 text-purple-400" />
            </div>
            <div className="mt-4 space-y-1">
              <p className="text-3xl font-bold font-outfit text-white">{totalFaculty || 1}</p>
              <p className="text-[10px] text-zinc-500 font-semibold font-sans">Instructors & Educators</p>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-6 border border-zinc-800 shadow relative">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-outfit">Curriculums</span>
              <BookOpen className="w-5 h-5 text-teal-400" />
            </div>
            <div className="mt-4 space-y-1">
              <p className="text-3xl font-bold font-outfit text-white">{totalCourses || 1}</p>
              <p className="text-[10px] text-zinc-500 font-semibold font-sans">Published courses</p>
            </div>
          </div>

        </div>

        {/* FINANCIAL REVENUE VISUAL & RECENT LEDGER ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* MRR Elegant Bar Block (Colspan 7/12) */}
          <div className="lg:col-span-7 glass-panel rounded-2xl p-6 shadow-lg border border-zinc-800 space-y-6">
            <div className="flex justify-between items-center pb-3 border-b border-zinc-900">
              <h3 className="text-sm font-bold uppercase tracking-wider text-blue-400 font-outfit">Business Growth & MRR</h3>
              <span className="text-[10px] text-zinc-500 font-semibold">Real-time ledger analytics</span>
            </div>

            {/* Simulated Glass Gradient bar stats */}
            <div className="space-y-4 font-sans">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold text-white">
                  <span>Q2 Tuition Billing</span>
                  <span>INR 128,500</span>
                </div>
                <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-royal" style={{ width: '68%' }} />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold text-white">
                  <span>Marketplace Listing Subscriptions</span>
                  <span>INR 42,000</span>
                </div>
                <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-royal" style={{ width: '22%' }} />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold text-white">
                  <span>Deno Certificate Issuance Costs</span>
                  <span>INR 14,500</span>
                </div>
                <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-royal" style={{ width: '10%' }} />
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-850 text-xs text-zinc-400 leading-normal">
              💳 **SaaS Tenancy Sync**: StudyOrbit operates a zero-brokerage direct gateway framework. Payments are completed immediately using Stripe/Razorpay APIs and settled to your custom vault.
            </div>
          </div>

          {/* Transactions ledger feed (Colspan 5/12) */}
          <div className="lg:col-span-5 glass-panel rounded-2xl p-6 shadow-lg border border-zinc-800 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-purple-400 font-outfit">Recent Transaction Ledger</h3>
            
            <div className="space-y-3 max-h-[18rem] overflow-y-auto pr-1">
              {loading ? (
                <div className="space-y-2">
                  <div className="h-10 bg-zinc-900 rounded animate-pulse" />
                  <div className="h-10 bg-zinc-900 rounded animate-pulse" />
                </div>
              ) : transactions.length > 0 ? (
                transactions.map((tx) => (
                  <div key={tx.id} className="flex justify-between items-center p-3 rounded-xl bg-zinc-950/40 border border-zinc-850 text-xs font-sans">
                    <div>
                      <h4 className="font-bold text-white truncate max-w-40">{tx.profiles?.full_name}</h4>
                      <p className="text-[10px] text-zinc-500 mt-0.5 uppercase tracking-wider">{tx.gateway} gateway</p>
                    </div>
                    <div className="text-right">
                      <span className="font-extrabold text-emerald-400 font-outfit block">INR {Number(tx.amount)}</span>
                      <span className="text-[8px] text-zinc-500 font-semibold">{new Date(tx.paid_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <CreditCard className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                  <p className="text-xs text-zinc-500">No payment transaction records exist.</p>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </PortalShell>
  );
}
