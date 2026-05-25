'use client';

import { useState, useEffect, useRef } from 'react';
import PortalShell from '@/components/PortalShell';
import AIStudyBuddy from '@/components/AIStudyBuddy';
import { supabase } from '@/lib/supabaseClient';
import { 
  CalendarDays, Play, Video, Users, MessageSquare, 
  Send, ShieldCheck, X, Brush, Eraser, Check, Sparkles, Orbit 
} from 'lucide-react';

export default function StudentLive() {
  const [studentId, setStudentId] = useState('f9b07384-f113-4318-f89e-4cdeee958b92');
  const [sessions, setSessions] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Classroom Modal States
  const [activeSession, setActiveSession] = useState<any>(null);
  const [classChat, setClassChat] = useState<Array<{ sender: string; text: string; isUser: boolean }>>([
    { sender: 'Rahul Deshmukh', text: 'Hey guys! Ready for the Supabase deep-dive?', isUser: false },
    { sender: 'Dr. Aris Thorne', text: 'Good morning everyone. We will start in 2 minutes. Get your notebooks ready.', isUser: false },
    { sender: 'Ananya Roy', text: 'Will we cover real-time broadcasts today?', isUser: false },
    { sender: 'Dr. Aris Thorne', text: 'Yes, Ananya. We will build a live chat channel today.', isUser: false }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [attendanceCode, setAttendanceCode] = useState('');
  const [attendanceVerified, setAttendanceVerified] = useState(false);
  const [attendanceError, setAttendanceError] = useState('');
  
  // Whiteboard drawing variables
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#2563EB');
  const [lineWidth, setLineWidth] = useState(3);
  const [tool, setTool] = useState<'brush' | 'eraser'>('brush');

  useEffect(() => {
    const storedId = localStorage.getItem('study_orbit_user_id') || 'f9b07384-f113-4318-f89e-4cdeee958b92';
    setStudentId(storedId);

    async function loadSessions() {
      // 1. Fetch live sessions
      const { data: list } = await supabase
        .from('live_class_sessions')
        .select('*')
        .order('scheduled_at', { ascending: true });
      
      if (list) setSessions(list);

      // 2. Fetch student's attendance logs
      const { data: logs } = await supabase
        .from('attendance')
        .select('*')
        .eq('student_id', storedId);
      
      if (logs) setAttendance(logs);

      setLoading(false);
    }
    loadSessions();
  }, []);

  const getAttendanceStatus = (sessionId: string) => {
    return attendance.find(a => a.session_id === sessionId);
  };

  const verifyAttendanceCode = async () => {
    if (!activeSession || !attendanceCode) return;
    
    if (attendanceCode === activeSession.attendance_code) {
      try {
        // Record attendance in database
        const { error: insertErr } = await supabase
          .from('attendance')
          .insert({
            session_id: activeSession.id,
            student_id: studentId,
            status: 'present',
            method: 'manual_code',
            marked_at: new Date().toISOString()
          });

        if (insertErr) throw insertErr;

        // Refresh attendance list
        const { data: logs } = await supabase
          .from('attendance')
          .select('*')
          .eq('student_id', studentId);
        
        if (logs) setAttendance(logs);

        setAttendanceVerified(true);
        setAttendanceError('');
      } catch (err: any) {
        console.error('Error logging attendance:', err.message);
      }
    } else {
      setAttendanceError('Invalid 4-digit code. Please check with your instructor.');
    }
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    setClassChat(prev => [...prev, {
      sender: 'Rohan Sharma (You)',
      text: chatInput.trim(),
      isUser: true
    }]);
    setChatInput('');

    // Simulate small instructor reply
    setTimeout(() => {
      setClassChat(prev => [...prev, {
        sender: 'Dr. Aris Thorne',
        text: 'Great observation Rohan! That is exactly how the row constraint handles it.',
        isUser: false
      }]);
    }, 1500);
  };

  // Canvas Whiteboard Hooks
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = tool === 'eraser' ? '#0F172A' : color;
    ctx.lineWidth = tool === 'eraser' ? 20 : lineWidth;
    ctx.lineCap = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // Setup whiteboard size
  useEffect(() => {
    if (activeSession && canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = canvas.parentElement?.clientWidth || 500;
      canvas.height = 300;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#0F172A';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [activeSession]);

  return (
    <PortalShell>
      <div className="space-y-8">
        
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold font-outfit text-white">Live Classroom Hub</h2>
          <p className="text-sm text-zinc-400 mt-1 font-sans leading-normal">
            Attend schedules lectures, mark check-ins using codes, and view archived streaming records.
          </p>
        </div>

        {/* Sessions Timeline List */}
        {loading ? (
          <div className="space-y-4">
            <div className="glass-panel h-28 rounded-2xl animate-pulse" />
            <div className="glass-panel h-28 rounded-2xl animate-pulse" />
          </div>
        ) : sessions.length > 0 ? (
          <div className="space-y-4">
            {sessions.map((session) => {
              const att = getAttendanceStatus(session.id);
              const isPast = new Date(session.scheduled_at).getTime() < new Date().getTime();
              const isPresent = att && att.status === 'present';
              
              return (
                <div 
                  key={session.id}
                  className="glass-panel rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative border border-zinc-800/80 hover:border-zinc-700/80 transition-all shadow-md"
                >
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase font-outfit ${isPast ? 'bg-zinc-900 border border-zinc-800 text-zinc-500' : 'bg-purple-500/10 text-purple-400 border border-purple-500/20 animate-pulse'}`}>
                        {isPast ? 'Archived' : 'Live Now'}
                      </span>
                      {isPresent ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold bg-emerald-500/5 px-2 py-0.5 rounded-full border border-emerald-500/10">
                          <Check className="w-3 h-3 text-emerald-500" />
                          Checked In
                        </span>
                      ) : isPast ? (
                        <span className="text-[10px] text-rose-400 font-semibold bg-rose-500/5 px-2 py-0.5 rounded-full border border-rose-500/10">
                          Absent
                        </span>
                      ) : null}
                    </div>

                    <h3 className="text-base font-bold text-white leading-snug font-outfit truncate">{session.title}</h3>
                    
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-zinc-500 font-semibold font-sans">
                      <span className="flex items-center gap-1">
                        <CalendarDays className="w-3.5 h-3.5" />
                        {new Date(session.scheduled_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span>•</span>
                      <span>{session.duration_minutes} Minutes duration</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                    {isPast ? (
                      session.recording_url ? (
                        <a 
                          href={session.recording_url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="px-4 py-2 rounded-xl border border-zinc-800 hover:border-zinc-700 bg-zinc-900/30 text-xs font-semibold text-white transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <Play className="w-3.5 h-3.5" />
                          Watch Recording
                        </a>
                      ) : (
                        <span className="text-xs text-zinc-600 font-medium">Recording processing</span>
                      )
                    ) : (
                      <button
                        onClick={() => {
                          setActiveSession(session);
                          setAttendanceVerified(isPresent);
                        }}
                        className="px-5 py-2.5 rounded-xl bg-gradient-royal text-white text-xs font-semibold hover:opacity-95 shadow shadow-blue-500/15 cursor-pointer flex items-center gap-1.5 animate-pulse"
                      >
                        <Video className="w-4 h-4" />
                        Join Virtual Classroom
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="glass-panel rounded-2xl p-12 text-center shadow">
            <Video className="w-12 h-12 text-zinc-700 mx-auto mb-4 animate-pulse" />
            <p className="text-zinc-400 text-sm">No scheduled lectures found.</p>
          </div>
        )}

      </div>

      {/* FULL-SCREEN MOCK CLASSROOM INTERACTIVE MODAL */}
      {activeSession && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 md:p-6 backdrop-blur-md select-none">
          
          <div className="w-full max-w-6xl h-[calc(100vh-3rem)] glass-panel rounded-2xl overflow-hidden shadow-2xl flex flex-col relative border border-zinc-800">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-zinc-950 border-b border-zinc-800/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded bg-gradient-royal text-white">
                  <Orbit className="w-4 h-4 animate-spin-slow" />
                </div>
                <div>
                  <h3 className="text-sm font-bold font-outfit text-white tracking-wide">{activeSession.title}</h3>
                  <p className="text-[10px] text-zinc-500 font-semibold font-sans mt-0.5">Live Cohort Session • Instructed by Dr. Aris Thorne</p>
                </div>
              </div>
              
              <button 
                onClick={() => setActiveSession(null)} 
                className="p-2 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden">
              
              {/* Left Column: Video and Whiteboard (Colspan 8) */}
              <div className="lg:col-span-8 flex flex-col overflow-y-auto p-6 space-y-6 bg-zinc-950/20">
                
                {/* Simulated Camera Feed */}
                <div className="aspect-video w-full bg-zinc-900/60 rounded-xl border border-zinc-800 flex items-center justify-center relative overflow-hidden shadow">
                  {/* Glowing purple ambient waves */}
                  <div className="absolute w-28 h-28 rounded-full bg-purple-500/20 blur-xl animate-pulse" />
                  
                  <div className="text-center z-10 space-y-3">
                    <div className="w-16 h-16 rounded-full border-2 border-purple-500 bg-zinc-800 flex items-center justify-center text-purple-400 mx-auto text-xl font-bold font-outfit shadow shadow-purple-500/25">
                      AT
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white font-outfit">Dr. Aris Thorne (Instructor)</p>
                      <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider mt-0.5">Sharing screen & speaking...</p>
                    </div>
                  </div>

                  <span className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-black/60 backdrop-blur-sm text-[9px] font-bold text-white tracking-wider uppercase font-outfit">
                    <Video className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                    Teacher's Screen
                  </span>
                </div>

                {/* Highly Interactive Drawing Whiteboard */}
                <div className="p-4 rounded-xl border border-zinc-800 bg-[#0F172A]/70 shadow space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-zinc-800/80">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
                      <span className="text-xs font-bold text-white uppercase tracking-wider font-outfit">Digital Drawing Board</span>
                    </div>

                    {/* Toolbar widgets */}
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setTool('brush')}
                        className={`p-1.5 rounded transition-all cursor-pointer ${tool === 'brush' ? 'bg-blue-500/20 text-blue-400' : 'text-zinc-500 hover:text-zinc-300'}`}
                        title="Brush"
                      >
                        <Brush className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setTool('eraser')}
                        className={`p-1.5 rounded transition-all cursor-pointer ${tool === 'eraser' ? 'bg-blue-500/20 text-blue-400' : 'text-zinc-500 hover:text-zinc-300'}`}
                        title="Eraser"
                      >
                        <Eraser className="w-4 h-4" />
                      </button>
                      
                      <div className="w-[1px] h-4 bg-zinc-800" />
                      
                      <button onClick={() => setColor('#2563EB')} className="w-3.5 h-3.5 rounded-full bg-blue-600 border border-white/20 cursor-pointer" />
                      <button onClick={() => setColor('#EF4444')} className="w-3.5 h-3.5 rounded-full bg-red-600 border border-white/20 cursor-pointer" />
                      <button onClick={() => setColor('#10B981')} className="w-3.5 h-3.5 rounded-full bg-emerald-600 border border-white/20 cursor-pointer" />
                      
                      <div className="w-[1px] h-4 bg-zinc-800" />
                      
                      <button 
                        onClick={clearCanvas}
                        className="text-[9px] bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:text-white px-2 py-1 rounded cursor-pointer text-zinc-400 transition-colors"
                      >
                        Clear Canvas
                      </button>
                    </div>
                  </div>

                  {/* Draw canvas pad */}
                  <div className="border border-zinc-800 rounded-lg overflow-hidden bg-[#0B0F19]">
                    <canvas
                      ref={canvasRef}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      className="w-full h-[180px] cursor-crosshair"
                    />
                  </div>
                </div>

              </div>

              {/* Right Column: Attendance Check-in & Chat (Colspan 4) */}
              <div className="lg:col-span-4 border-l border-zinc-800 flex flex-col justify-between h-full bg-zinc-950/40">
                
                {/* Attendance Panel Drawer */}
                <div className="p-4 border-b border-zinc-800 bg-zinc-950">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 font-outfit mb-3 flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4" />
                    Attendance Verification
                  </h4>

                  {attendanceVerified ? (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-semibold flex items-center gap-1.5">
                      <Check className="w-4 h-4" />
                      Attendance logged successfully!
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-[10px] text-zinc-500 font-medium">Enter the 4-digit code displayed on the instructor's board to confirm your check-in.</p>
                      
                      <div className="flex gap-2">
                        <input
                          type="text"
                          maxLength={4}
                          value={attendanceCode}
                          onChange={(e) => setAttendanceCode(e.target.value)}
                          placeholder="e.g. 9912"
                          className="flex-1 px-3 py-2 rounded-xl glass-input text-xs font-sans text-center tracking-widest font-bold"
                        />
                        <button
                          onClick={verifyAttendanceCode}
                          className="px-4 py-2 rounded-xl bg-gradient-royal text-white text-xs font-bold hover:opacity-95 cursor-pointer"
                        >
                          Check In
                        </button>
                      </div>

                      {attendanceError && (
                        <p className="text-[9px] text-rose-400 bg-rose-500/5 border border-rose-500/10 p-2.5 rounded-lg">
                          {attendanceError}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Group Chat Log */}
                <div className="flex-1 flex flex-col justify-between overflow-hidden">
                  
                  {/* Messages list */}
                  <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
                    {classChat.map((msg, index) => (
                      <div key={index} className={`space-y-0.5 ${msg.isUser ? 'text-right' : 'text-left'}`}>
                        <span className="block text-[9px] font-bold text-zinc-500 font-outfit">{msg.sender}</span>
                        <div className={`inline-block p-2.5 rounded-xl max-w-[85%] text-left ${msg.isUser ? 'bg-gradient-royal text-white' : 'bg-zinc-900 border border-zinc-800 text-zinc-300'}`}>
                          {msg.text}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Input form */}
                  <form onSubmit={handleSendChat} className="p-3 border-t border-zinc-800 bg-zinc-950/80 flex gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Type class comment..."
                      className="flex-1 px-3 py-2 rounded-xl glass-input text-xs font-sans"
                    />
                    <button
                      type="submit"
                      disabled={!chatInput.trim()}
                      className="p-2 rounded-xl bg-zinc-800 text-white hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>

                </div>

              </div>

            </div>

          </div>

        </div>
      )}

      <AIStudyBuddy />
    </PortalShell>
  );
}
