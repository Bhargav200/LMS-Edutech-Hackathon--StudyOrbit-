'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PortalShell from '@/components/PortalShell';
import AIStudyBuddy from '@/components/AIStudyBuddy';
import { 
  Orbit, Flame, Play, Clock, BookOpen, AlertCircle, FileText, 
  ArrowRight, CheckCircle2, User, Trophy, CalendarDays 
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function StudentDashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState('Rohan Sharma');
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<any>(null);
  const [liveClass, setLiveClass] = useState<any>(null);
  const [assignment, setAssignment] = useState<any>(null);
  const [fee, setFee] = useState<any>(null);
  const [completedLessons, setCompletedLessons] = useState<number>(2);
  const [totalLessons, setTotalLessons] = useState<number>(4);
  const [gradedAssignment, setGradedAssignment] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      // 1. Fetch from profiles
      const storedId = localStorage.getItem('study_orbit_user_id') || 'f9b07384-f113-4318-f89e-4cdeee958b92';
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', storedId)
        .single();
      
      if (profile) setUserName(profile.full_name);

      // 2. Fetch course progress
      const { data: progressData } = await supabase
        .from('student_course_progress')
        .select('*, courses(*)')
        .eq('student_id', storedId)
        .single();
      
      if (progressData) {
        setProgress(progressData);

        // Fetch completed/total lessons metrics dynamically
        try {
          const { data: modules } = await supabase
            .from('modules')
            .select('id')
            .eq('course_id', progressData.course_id);
            
          if (modules && modules.length > 0) {
            const moduleIds = modules.map(m => m.id);
            const { data: courseLessons } = await supabase
              .from('lessons')
              .select('id')
              .in('module_id', moduleIds);
              
            if (courseLessons && courseLessons.length > 0) {
              setTotalLessons(courseLessons.length);
              const lessonIds = courseLessons.map(l => l.id);
              
              const { count: compCount } = await supabase
                .from('student_lesson_progress')
                .select('*', { count: 'exact', head: true })
                .eq('student_id', storedId)
                .eq('completed', true)
                .in('lesson_id', lessonIds);
                
              if (compCount !== null) {
                setCompletedLessons(compCount);
              }
            }
          }
        } catch (err) {
          console.error("Error computing lesson progress:", err);
        }
      }

      // 3. Fetch upcoming live class
      const { data: liveData } = await supabase
        .from('live_class_sessions')
        .select('*')
        .order('scheduled_at', { ascending: true })
        .limit(1)
        .single();
      
      if (liveData) setLiveClass(liveData);

      // 4. Fetch pending assignment
      const { data: assignData } = await supabase
        .from('assignments')
        .select('*')
        .order('due_date', { ascending: true })
        .limit(1)
        .single();
      
      if (assignData) setAssignment(assignData);

      // Fetch graded assignment dynamically
      try {
        const { data: gradedData } = await supabase
          .from('assignment_submissions')
          .select('*, assignments(title)')
          .eq('student_id', storedId)
          .eq('status', 'graded')
          .order('graded_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (gradedData) setGradedAssignment(gradedData);
      } catch (err) {
        console.error("Error fetching graded assignment:", err);
      }

      // 5. Fetch fee dues
      const { data: feeData } = await supabase
        .from('fees')
        .select('*')
        .eq('student_id', storedId)
        .single();
      
      if (feeData) setFee(feeData);

      setLoading(false);
    }

    loadData();
  }, []);

  return (
    <PortalShell>
      <div className="space-y-8 relative">
        
        {/* Welcome Hero Banner */}
        <div className="glass-panel rounded-2xl p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-royal" />
          <div className="space-y-2">
            <h2 className="text-3xl font-bold font-outfit text-white">
              Welcome back, <span className="text-gradient">{userName}</span>! 👋
            </h2>
            <p className="text-sm text-zinc-400 max-w-xl font-sans leading-relaxed">
              You are making stellar headway in your **Advanced Full-Stack Web Development** program. Take a look at your schedule slots, study streaks, and AI assistant suggestions below.
            </p>
          </div>
          
          <div className="flex items-center gap-4 bg-zinc-900/60 border border-zinc-800 p-4 rounded-xl">
            <div className="p-3 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center justify-center">
              <Flame className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <p className="text-2xl font-bold font-outfit text-white">12 Days</p>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Active Streak!</p>
            </div>
          </div>
        </div>

        {/* BENTO GRID LAYOUT */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Card 1: Course circular progress widget (Colspan 7) */}
          <div className="md:col-span-7 glass-panel rounded-2xl p-6 flex flex-col justify-between shadow-lg relative min-h-[16rem]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-blue-400 font-outfit">Current Progress</h3>
              <span className="text-xs text-zinc-500 font-medium">Updated 10 mins ago</span>
            </div>

            {progress ? (
              <div className="flex flex-col sm:flex-row items-center justify-around gap-6">
                {/* Visual circular svg progress indicator */}
                <div className="relative w-36 h-36 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle 
                      cx="72" cy="72" r="62" 
                      className="text-zinc-800/80 stroke-current" 
                      strokeWidth="10" fill="transparent" 
                    />
                    <circle 
                      cx="72" cy="72" r="62" 
                      className="text-blue-500 stroke-current" 
                      strokeWidth="10" fill="transparent" 
                      strokeDasharray={389.5} 
                      strokeDashoffset={389.5 - (389.5 * progress.overall_progress) / 100}
                    />
                  </svg>
                  <div className="absolute text-center">
                    <span className="text-3xl font-bold font-outfit text-white">{progress.overall_progress}%</span>
                    <span className="block text-[8px] text-zinc-500 uppercase tracking-wider font-semibold">Done</span>
                  </div>
                </div>

                <div className="flex-1 space-y-4 text-center sm:text-left">
                  <div>
                    <h4 className="text-base font-bold text-white leading-tight font-outfit">{progress.courses?.title}</h4>
                    <p className="text-xs text-zinc-500 mt-1 leading-normal font-sans">{progress.courses?.category}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-[10px] font-semibold text-zinc-400">
                      <BookOpen className="w-3.5 h-3.5 text-zinc-500" />
                      {completedLessons} / {totalLessons} Lessons Completed
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-[10px] font-semibold text-zinc-400">
                      <Trophy className="w-3.5 h-3.5 text-yellow-500" />
                      Passing Grade (92%)
                    </span>
                  </div>
                  <button 
                    onClick={() => router.push(`/student/courses/${progress.course_id}`)}
                    className="px-5 py-2.5 rounded-xl bg-gradient-royal text-white text-xs font-semibold hover:opacity-95 shadow shadow-blue-500/10 cursor-pointer flex items-center gap-1.5 mx-auto sm:mx-0 w-fit"
                  >
                    Resume Learning
                    <Play className="w-3 h-3 fill-current" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center flex-1 h-36">
                <p className="text-zinc-500 text-sm">No course enrollment found.</p>
              </div>
            )}
          </div>

          {/* Card 2: Upcoming live meeting countdown countdown (Colspan 5) */}
          <div className="md:col-span-5 glass-panel rounded-2xl p-6 flex flex-col justify-between shadow-lg relative min-h-[16rem]">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-purple-400 font-outfit mb-4">Upcoming Classroom</h3>
              
              {liveClass ? (
                <div className="space-y-4">
                  <div className="flex gap-4 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
                    <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center self-start">
                      <CalendarDays className="w-5 h-5 animate-pulse" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-white leading-snug truncate">{liveClass.title}</h4>
                      <p className="text-[10px] text-zinc-500 mt-1 uppercase font-semibold">Today • 10:00 AM (60 Mins)</p>
                    </div>
                  </div>

                  <div className="p-3 bg-zinc-950/40 border border-zinc-800/80 rounded-xl flex items-center gap-2">
                    <Clock className="w-4 h-4 text-purple-400 animate-spin-slow" />
                    <span className="text-xs text-zinc-400 font-semibold font-outfit">Starts in 3 hours</span>
                  </div>
                </div>
              ) : (
                <p className="text-zinc-500 text-xs">No live session scheduled today.</p>
              )}
            </div>

            <button 
              onClick={() => router.push('/student/live')}
              className="w-full mt-4 py-2.5 rounded-xl border border-zinc-800 hover:border-zinc-700 bg-zinc-900/20 hover:bg-zinc-800/20 text-xs font-semibold text-white transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              Enter Classroom
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 3: Pending assignments deadlines logs (Colspan 6) */}
          <div className="md:col-span-6 glass-panel rounded-2xl p-6 shadow-lg relative flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-teal-400 font-outfit mb-4">Milestone Deadlines</h3>
              
              {assignment ? (
                <div className="space-y-4">
                  <div className="flex gap-4 p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-800/50">
                    <div className="p-2.5 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center self-start">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-white truncate font-sans">{assignment.title}</h4>
                      <p className="text-[10px] text-zinc-500 mt-1 uppercase font-semibold">Due: June 25th, 2026</p>
                    </div>
                  </div>
                  
                  {gradedAssignment ? (
                    <div className="flex gap-4 p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-800/50 opacity-60">
                      <div className="p-2.5 rounded-lg bg-zinc-800 text-zinc-500 flex items-center justify-center self-start">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-zinc-400 truncate line-through">{gradedAssignment.assignments?.title || 'Assignment Graded'}</h4>
                        <p className="text-[10px] text-zinc-600 mt-1 uppercase font-semibold">Graded: {gradedAssignment.grade}/100</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-4 p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-800/50 opacity-60">
                      <div className="p-2.5 rounded-lg bg-zinc-800 text-zinc-500 flex items-center justify-center self-start">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-zinc-400 truncate line-through">Next.js App Router Layout Practice</h4>
                        <p className="text-[10px] text-zinc-600 mt-1 uppercase font-semibold">Graded: 92/100</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-zinc-500 text-xs">No pending assignments found.</p>
              )}
            </div>

            <button 
              onClick={() => router.push('/student/assignments')}
              className="w-full mt-6 py-2.5 rounded-xl border border-zinc-800 hover:border-zinc-700 bg-zinc-900/20 hover:bg-zinc-800/20 text-xs font-semibold text-white transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              Open Assignment Center
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 4: Payments Ledger Status & Invoices (Colspan 6) */}
          <div className="md:col-span-6 glass-panel rounded-2xl p-6 shadow-lg relative flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 font-outfit mb-4">Tuition Ledger</h3>
              
              {fee ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-zinc-400 font-medium font-sans">Payment Plan:</span>
                      <span className="text-xs text-white font-semibold uppercase font-outfit">
                        {fee.plan?.installments ? `${fee.plan.installments.length} Installments` : 'Standard'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-zinc-400 font-medium font-sans">Collected Total:</span>
                      <span className="text-xs text-emerald-400 font-bold font-outfit">
                        {fee.currency || 'INR'} {Number(fee.paid_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center border-t border-zinc-800/80 pt-2.5">
                      <span className="text-xs text-zinc-400 font-semibold font-sans">Outstanding Due:</span>
                      <span className="text-xs text-rose-400 font-bold font-outfit">
                        {fee.currency || 'INR'} {Number((fee.total_amount || 0) - (fee.paid_amount || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  {fee.status === 'paid' ? (
                    <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span className="text-[10px] text-zinc-400 font-semibold font-outfit">All tuition installments are fully settled!</span>
                    </div>
                  ) : (
                    <div className="p-3 bg-rose-500/5 border border-rose-500/10 rounded-xl flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-400 animate-pulse" />
                      <span className="text-[10px] text-zinc-400 font-semibold font-outfit">Installment outstanding is due soon.</span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-zinc-500 text-xs">No active tuition plan logged.</p>
              )}
            </div>

            <button 
              onClick={() => router.push('/student/payments')}
              className="w-full mt-6 py-2.5 rounded-xl border border-zinc-800 hover:border-zinc-700 bg-zinc-900/20 hover:bg-zinc-800/20 text-xs font-semibold text-white transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              Resolve Fee Installment
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>

      {/* Floating AI Study Buddy widget */}
      <AIStudyBuddy />
    </PortalShell>
  );
}
