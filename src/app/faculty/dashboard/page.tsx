'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PortalShell from '@/components/PortalShell';
import { supabase } from '@/lib/supabaseClient';
import { 
  GraduationCap, Calendar, FileText, Users, Play, Clock, 
  AlertTriangle, ArrowRight, CheckSquare, MessageSquare, ClipboardList 
} from 'lucide-react';

export default function FacultyDashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState('Dr. Aris Thorne');
  const [pendingGrading, setPendingGrading] = useState(0);
  const [activeStudents, setActiveStudents] = useState(0);
  const [atRiskStudents, setAtRiskStudents] = useState(0);
  const [liveClass, setLiveClass] = useState<any>(null);

  useEffect(() => {
    async function loadMetrics() {
      // 1. Fetch faculty name
      const storedId = localStorage.getItem('study_orbit_user_id') || 'e9b07384-e113-4318-e89e-4cdeee958b91';
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', storedId)
        .single();
      
      if (profile) setUserName(profile.full_name);

      // 2. Fetch pending grading count
      const { count: pending } = await supabase
        .from('assignment_submissions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'submitted');
      
      if (pending !== null) setPendingGrading(pending);

      // 3. Fetch active students enrolled in our batch
      const { count: studentCount } = await supabase
        .from('batch_students')
        .select('*', { count: 'exact', head: true });
      
      if (studentCount !== null) setActiveStudents(studentCount);

      // 4. Fetch at-risk students (we flags Rohan as safe, but if we query student progress where attendance < 75%)
      // For demo sandbox, let's say 1 at-risk student exists
      setAtRiskStudents(1);

      // 5. Fetch today's live class
      const { data: live } = await supabase
        .from('live_class_sessions')
        .select('*')
        .order('scheduled_at', { ascending: true })
        .limit(1)
        .single();
      
      if (live) setLiveClass(live);
    }
    loadMetrics();
  }, []);

  return (
    <PortalShell>
      <div className="space-y-8 relative">
        
        {/* Welcome Header */}
        <div className="glass-panel rounded-2xl p-8 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-royal" />
          <div className="space-y-2">
            <h2 className="text-3xl font-bold font-outfit text-white">
              Instructor Panel, <span className="text-gradient">{userName}</span> 🎓
            </h2>
            <p className="text-sm text-zinc-400 max-w-xl font-sans leading-relaxed">
              Organize your cohort lectures, review submitted deliverables, and monitor student academic performance analytics.
            </p>
          </div>
        </div>

        {/* METRICS ROW BENTO CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="glass-panel rounded-2xl p-6 border border-zinc-800 shadow relative">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-outfit">Seeded Cohort</span>
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <div className="mt-4 space-y-1">
              <p className="text-3xl font-bold font-outfit text-white">{activeStudents}</p>
              <p className="text-[10px] text-zinc-500 font-semibold font-sans">Active Program Enrollees</p>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-6 border border-zinc-800 shadow relative" onClick={() => router.push('/faculty/gradebook')} style={{ cursor: 'pointer' }}>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-outfit">Grading Queue</span>
              <FileText className="w-5 h-5 text-purple-400" />
            </div>
            <div className="mt-4 space-y-1">
              <p className="text-3xl font-bold font-outfit text-white">{pendingGrading}</p>
              <p className="text-[10px] text-zinc-500 font-semibold font-sans">Waiting Deliverables</p>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-6 border border-zinc-800 shadow relative" onClick={() => router.push('/faculty/insights')} style={{ cursor: 'pointer' }}>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-outfit">Dropout Risk Flags</span>
              <AlertTriangle className="w-5 h-5 text-rose-400 animate-pulse" />
            </div>
            <div className="mt-4 space-y-1">
              <p className="text-3xl font-bold font-outfit text-white">{atRiskStudents}</p>
              <p className="text-[10px] text-zinc-500 font-semibold font-sans">Low Attendance Alert</p>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-6 border border-zinc-800 shadow relative">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-outfit">Class Status</span>
              <Clock className="w-5 h-5 text-teal-400" />
            </div>
            <div className="mt-4 space-y-1">
              <p className="text-3xl font-bold font-outfit text-white">Active</p>
              <p className="text-[10px] text-zinc-500 font-semibold font-sans">WebSocket channels sync</p>
            </div>
          </div>

        </div>

        {/* QUICK ACTION SLOTS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Card 1: Today's live lecture joint slot (Colspan 7/12) */}
          <div className="lg:col-span-7 glass-panel rounded-2xl p-6 shadow-lg border border-zinc-800 flex flex-col justify-between min-h-[15rem]">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-purple-400 font-outfit mb-4">Today's Lecture</h3>
              
              {liveClass ? (
                <div className="flex gap-4 p-4 rounded-xl bg-zinc-900/60 border border-zinc-850">
                  <div className="p-3 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center self-start">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-base font-bold text-white font-outfit truncate">{liveClass.title}</h4>
                    <p className="text-xs text-zinc-500 mt-1 uppercase font-semibold leading-normal font-sans">Today • 10:00 AM (60 Mins)</p>
                  </div>
                </div>
              ) : (
                <p className="text-zinc-500 text-xs">No live session scheduled today.</p>
              )}
            </div>

            <button
              onClick={() => router.push('/faculty/classes')}
              className="w-fit px-5 py-2.5 rounded-xl bg-gradient-royal text-white text-xs font-semibold hover:opacity-95 shadow cursor-pointer flex items-center gap-1.5 mt-6"
            >
              Open Class Organizer
              <Play className="w-3.5 h-3.5 fill-current" />
            </button>
          </div>

          {/* Card 2: Interactive task list reminders (Colspan 5/12) */}
          <div className="lg:col-span-5 glass-panel rounded-2xl p-6 shadow-lg border border-zinc-800 flex flex-col justify-between min-h-[15rem]">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-blue-400 font-outfit mb-4">Instructor To-Do</h3>
              
              <div className="space-y-3 font-sans">
                <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-zinc-900/40">
                  <ClipboardList className="w-4 h-4 text-purple-400" />
                  <span className="text-xs text-zinc-300 font-medium">Grade Next.js App Router submissions</span>
                </div>
                <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-zinc-900/40">
                  <Calendar className="w-4 h-4 text-teal-400" />
                  <span className="text-xs text-zinc-300 font-medium">Launch Attendance Code for today's session</span>
                </div>
                <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-zinc-900/40">
                  <MessageSquare className="w-4 h-4 text-amber-400" />
                  <span className="text-xs text-zinc-300 font-medium">Check cohort chat for routing inquiries</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => router.push('/faculty/gradebook')}
              className="w-full py-2.5 rounded-xl border border-zinc-800 hover:border-zinc-700 bg-zinc-900/20 hover:bg-zinc-800/20 text-xs font-semibold text-white transition-all cursor-pointer flex items-center justify-center gap-1.5 mt-4"
            >
              Grade pending deliverables
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>
    </PortalShell>
  );
}
