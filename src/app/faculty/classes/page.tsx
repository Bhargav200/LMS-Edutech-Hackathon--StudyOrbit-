'use client';

import { useState, useEffect } from 'react';
import PortalShell from '@/components/PortalShell';
import { supabase } from '@/lib/supabaseClient';
import { 
  CalendarDays, Plus, Clock, Video, Users, X, Check, 
  Orbit, ShieldCheck, Play, ArrowRight, ClipboardCheck 
} from 'lucide-react';

export default function FacultyClasses() {
  const [studentId, setStudentId] = useState('f9b07384-f113-4318-f89e-4cdeee958b92');
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Scheduling states
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newDuration, setNewDuration] = useState('60');

  // Attendance Launcher states
  const [activeLauncherSession, setActiveLauncherSession] = useState<any>(null);
  const [generatedCode, setGeneratedCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [checkins, setCheckins] = useState<any[]>([]);

  useEffect(() => {
    async function loadSessions() {
      const { data } = await supabase
        .from('live_class_sessions')
        .select('*')
        .order('scheduled_at', { ascending: true });
      
      if (data) setSessions(data);
      setLoading(false);
    }
    loadSessions();
  }, []);

  // Poll for student attendance check-ins in real-time when the launcher is active!
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (activeLauncherSession) {
      // 1. Start countdown
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // 2. Fetch logged student attendance check-ins from database
      const checkinInterval = setInterval(async () => {
        const { data } = await supabase
          .from('attendance')
          .select('*, profiles(full_name, avatar_url)')
          .eq('session_id', activeLauncherSession.id);
        
        if (data) setCheckins(data);
      }, 2000);

      return () => {
        clearInterval(timer);
        clearInterval(checkinInterval);
      };
    }
  }, [activeLauncherSession]);

  const handleLaunchCode = async (session: any) => {
    // Generate a random 4-digit code
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedCode(code);
    setTimeLeft(600); // reset 10 mins
    setActiveLauncherSession(session);

    try {
      // Update database session code & expiry
      await supabase
        .from('live_class_sessions')
        .update({
          attendance_code: code,
          attendance_code_expiry: new Date(Date.now() + 600000).toISOString() // 10 min TTL
        })
        .eq('id', session.id);

      // Refresh local sessions list
      const { data } = await supabase
        .from('live_class_sessions')
        .select('*')
        .order('scheduled_at', { ascending: true });
      
      if (data) setSessions(data);

    } catch (err: any) {
      console.error('Error launching attendance code:', err.message);
    }
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newTime) return;

    try {
      const { error } = await supabase
        .from('live_class_sessions')
        .insert({
          id: '88888888-8888-8888-8888-' + Math.random().toString().substring(2,14),
          batch_id: 'b1111111-1111-1111-1111-111111111111',
          faculty_id: 'e9b07384-e113-4318-e89e-4cdeee958b91',
          title: newTitle,
          scheduled_at: new Date(newTime).toISOString(),
          duration_minutes: parseInt(newDuration),
          meeting_provider: 'zoom',
          meeting_link: 'https://zoom.us/j/mockmeeting-' + Math.random().toString(36).substring(2, 8)
        });

      if (error) throw error;

      // Refetch
      const { data } = await supabase
        .from('live_class_sessions')
        .select('*')
        .order('scheduled_at', { ascending: true });
      
      if (data) setSessions(data);

      setNewTitle('');
      setNewTime('');
      setShowScheduleModal(false);

    } catch (err: any) {
      console.error('Error scheduling session:', err.message);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <PortalShell>
      <div className="space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold font-outfit text-white">Class Organizer</h2>
            <p className="text-sm text-zinc-400 mt-1 font-sans leading-normal">
              Schedule active video streams, deploy cryptographic check-in codes, and monitor participant logs.
            </p>
          </div>

          <button
            onClick={() => setShowScheduleModal(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-royal text-white text-xs font-semibold hover:opacity-95 shadow shadow-blue-500/10 cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Schedule Live Class
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Lectures List (Colspan 7/12) */}
          <div className="lg:col-span-7 space-y-4">
            {loading ? (
              <div className="space-y-4 animate-pulse">
                <div className="glass-panel h-24 rounded-2xl" />
                <div className="glass-panel h-24 rounded-2xl" />
              </div>
            ) : sessions.length > 0 ? (
              <div className="space-y-4">
                {sessions.map((session) => {
                  const isPast = new Date(session.scheduled_at).getTime() < new Date().getTime();
                  return (
                    <div 
                      key={session.id}
                      className="glass-panel rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative border border-zinc-800/80 hover:border-zinc-700/80 transition-all shadow-md"
                    >
                      <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase font-outfit ${isPast ? 'bg-zinc-900 border border-zinc-800 text-zinc-500' : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'}`}>
                            {isPast ? 'Archived' : 'Live Soon'}
                          </span>
                          <span className="text-[10px] text-zinc-500 font-medium font-sans">{session.duration_minutes} Mins Duration</span>
                        </div>

                        <h3 className="text-base font-bold text-white leading-snug font-outfit truncate">{session.title}</h3>
                        <p className="text-[10px] text-zinc-500 font-semibold font-sans mt-0.5">
                          {new Date(session.scheduled_at).toLocaleString([], { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>

                      {/* Launch Actions */}
                      <div className="flex items-center justify-end w-full sm:w-auto">
                        {!isPast && (
                          <button
                            onClick={() => handleLaunchCode(session)}
                            className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-xs font-semibold text-white cursor-pointer flex items-center gap-1.5 transition-colors"
                          >
                            <ClipboardCheck className="w-4 h-4 text-zinc-400" />
                            Launch Code
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="glass-panel rounded-2xl p-12 text-center shadow">
                <Video className="w-12 h-12 text-zinc-750 mx-auto mb-4" />
                <p className="text-zinc-500 text-sm">No live classes scheduled.</p>
              </div>
            )}
          </div>

          {/* Attendance Launcher Sidebar (Colspan 5/12) */}
          <div className="lg:col-span-5 space-y-6">
            {activeLauncherSession ? (
              <div className="glass-panel rounded-2xl p-6 relative overflow-hidden shadow-xl border border-blue-500/20">
                <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-royal" />
                
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-blue-400 font-outfit">Attendance Code Panel</h3>
                  <button onClick={() => setActiveLauncherSession(null)} className="p-1 rounded hover:bg-zinc-800 text-zinc-400 cursor-pointer">
                    <X className="w-4.5 h-4.5" />
                  </button>
                </div>

                <p className="text-xs text-zinc-400 leading-snug mb-5 font-semibold font-outfit">{activeLauncherSession.title}</p>

                {/* Big Display Code Widget */}
                <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-950/60 text-center space-y-3">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Active Code</span>
                  <div className="text-4xl font-extrabold tracking-widest text-gradient font-outfit">
                    {generatedCode}
                  </div>
                  <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-400 font-semibold font-outfit pt-2.5 border-t border-zinc-900">
                    <Clock className="w-4 h-4 text-purple-400 animate-spin-slow" />
                    <span>Expires in {formatTime(timeLeft)}</span>
                  </div>
                </div>

                {/* Participant logs list */}
                <div className="mt-6 space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-zinc-800/80">
                    <span className="text-xs font-bold text-white uppercase font-outfit flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-teal-400" />
                      Check-In Log
                    </span>
                    <span className="text-[10px] text-zinc-500 font-semibold">{checkins.length} Checked In</span>
                  </div>

                  <div className="space-y-2 max-h-36 overflow-y-auto">
                    {checkins.length > 0 ? (
                      checkins.map((c) => (
                        <div key={c.id} className="flex items-center justify-between p-2 rounded bg-zinc-900/40 border border-zinc-850 text-xs">
                          <span className="font-semibold text-white">{c.profiles?.full_name}</span>
                          <span className="inline-flex items-center gap-1 text-[9px] text-emerald-400 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10 font-bold">
                            <Check className="w-3 h-3 text-emerald-400" />
                            Verified
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-zinc-500 text-center py-4">Waiting for students to check in...</p>
                    )}
                  </div>
                </div>

              </div>
            ) : (
              <div className="glass-panel rounded-2xl p-6 shadow shadow-zinc-900 text-center">
                <ClipboardCheck className="w-8 h-8 text-zinc-700 mx-auto mb-2 animate-pulse" />
                <p className="text-xs text-zinc-500">Launch an attendance code for one of your scheduled upcoming lectures to monitor check-ins.</p>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* SCHEDULE MODAL */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md glass-panel rounded-2xl p-6 relative shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-royal" />
            
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-zinc-800/80">
              <h3 className="text-base font-bold font-outfit text-white tracking-wide">Schedule Live Class</h3>
              <button onClick={() => setShowScheduleModal(false)} className="p-1 rounded hover:bg-zinc-800 text-zinc-400 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Lecture Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Supabase Schema Design Deep-Dive"
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs font-sans"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Start Time Slot</label>
                <input
                  type="datetime-local"
                  required
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs font-sans"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Duration (Minutes)</label>
                <select
                  value={newDuration}
                  onChange={(e) => setNewDuration(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl glass-input text-xs font-sans"
                >
                  <option value="30">30 Mins</option>
                  <option value="45">45 Mins</option>
                  <option value="60">60 Mins</option>
                  <option value="90">90 Mins</option>
                  <option value="120">120 Mins</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-royal text-white text-xs font-bold hover:opacity-95 shadow-lg flex items-center justify-center gap-2 cursor-pointer mt-6"
              >
                Schedule Meeting slot
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

    </PortalShell>
  );
}
