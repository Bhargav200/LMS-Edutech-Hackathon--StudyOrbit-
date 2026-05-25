'use client';

import { useState, useEffect } from 'react';
import PortalShell from '@/components/PortalShell';
import { supabase } from '@/lib/supabaseClient';
import { 
  Users, Award, BarChart3, TrendingUp, AlertTriangle, 
  CheckCircle2, Clock, Check, X, Search, ChevronRight, 
  BookOpen, Calendar, HelpCircle, Activity, UserCheck
} from 'lucide-react';

export default function FacultyInsights() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Detail drawer states
  const [studentLessons, setStudentLessons] = useState<any[]>([]);
  const [studentAttendance, setStudentAttendance] = useState<any[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    async function loadInsights() {
      setLoading(true);
      
      // 1. Fetch student course progresses along with student profiles
      const { data: progress, error: progErr } = await supabase
        .from('student_course_progress')
        .select(`
          overall_progress,
          last_accessed_at,
          course_id,
          student_id,
          profiles:student_id (
            id,
            full_name,
            avatar_url,
            phone
          ),
          courses:course_id (
            title
          )
        `);

      if (progErr) {
        console.error('Error loading progresses:', progErr);
      }

      // 2. Fetch attendance count grouped by student
      const { data: attRecords, error: attErr } = await supabase
        .from('attendance')
        .select('student_id, status, session_id');

      if (attErr) {
        console.error('Error loading attendance:', attErr);
      }

      // Map profiles and compute attendance averages
      if (progress) {
        const studentAggregates = progress.map((item: any) => {
          const sId = item.student_id;
          const sAtt = attRecords ? attRecords.filter(a => a.student_id === sId) : [];
          const presentCount = sAtt.filter(a => a.status === 'present').length;
          const totalSessions = sAtt.length;
          const attRate = totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 100; // default 100 if no classes

          // Calculate risk rating (Low progress < 45% or low attendance < 75%)
          const progressVal = Number(item.overall_progress) || 0;
          const isAtRisk = progressVal < 50 || attRate < 75;
          const riskLevel = progressVal < 35 || attRate < 60 ? 'High' : isAtRisk ? 'Medium' : 'Low';

          return {
            id: sId,
            name: item.profiles?.full_name || 'Seeded Cohort Member',
            avatar: item.profiles?.avatar_url,
            phone: item.profiles?.phone,
            courseName: item.courses?.title || 'Quantum Architect',
            progress: progressVal,
            lastActive: item.last_accessed_at,
            attendanceRate: attRate,
            attendanceCount: `${presentCount}/${totalSessions}`,
            riskLevel: riskLevel,
            courseId: item.course_id
          };
        });

        setStudents(studentAggregates);
        if (studentAggregates.length > 0) {
          setSelectedStudent(studentAggregates[0]);
        }
      }
      setLoading(false);
    }
    loadInsights();
  }, []);

  // Fetch individual progress and attendance logs when a student is selected
  useEffect(() => {
    if (!selectedStudent) return;
    
    async function loadStudentDetails() {
      setLoadingDetails(true);
      
      // 1. Fetch lesson completions checklist
      // To get a complete overview, we get all lessons in the course, and see if there are progress records
      const { data: lessons, error: lessErr } = await supabase
        .from('lessons')
        .select(`
          id,
          title,
          content_type,
          duration,
          module_id,
          modules (
            title
          )
        `);

      const { data: completedProgress, error: compErr } = await supabase
        .from('student_lesson_progress')
        .select('lesson_id, completed')
        .eq('student_id', selectedStudent.id);

      if (lessons) {
        const checklist = lessons.map((l: any) => {
          const comp = completedProgress ? completedProgress.find(p => p.lesson_id === l.id) : null;
          return {
            id: l.id,
            title: l.title,
            duration: l.duration,
            moduleName: l.modules?.title || 'Course Outline',
            completed: comp ? comp.completed : false
          };
        });
        setStudentLessons(checklist);
      }

      // 2. Fetch specific attendance checklist
      const { data: attList, error: attListErr } = await supabase
        .from('attendance')
        .select(`
          status,
          marked_at,
          session_id,
          live_class_sessions (
            title,
            scheduled_at
          )
        `)
        .eq('student_id', selectedStudent.id);

      if (attList) {
        const logs = attList.map((a: any) => ({
          status: a.status,
          markedAt: a.marked_at,
          classTitle: a.live_class_sessions?.title || 'Cohort Session'
        }));
        setStudentAttendance(logs);
      }

      setLoadingDetails(false);
    }

    loadStudentDetails();
  }, [selectedStudent]);

  // Aggregate stats
  const avgProgress = students.length > 0 ? Math.round(students.reduce((acc, curr) => acc + curr.progress, 0) / students.length) : 0;
  const avgAttendance = students.length > 0 ? Math.round(students.reduce((acc, curr) => acc + curr.attendanceRate, 0) / students.length) : 0;
  const atRiskCount = students.filter(s => s.riskLevel === 'High' || s.riskLevel === 'Medium').length;

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.courseName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PortalShell>
      <div className="space-y-8 relative">
        
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold font-outfit text-white">Student Progress Insights</h2>
            <p className="text-sm text-zinc-400 mt-1 font-sans leading-normal">
              Analyze cohort completions, monitor real-time lesson checklists, and receive automated risk drop alerts.
            </p>
          </div>
        </div>

        {/* TOP LEVEL METRICS SUMMARY BENTO CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel rounded-2xl p-6 border border-zinc-800 flex justify-between items-center shadow">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-outfit block">Average Progress</span>
              <p className="text-3xl font-bold font-outfit text-white">{avgProgress}%</p>
              <p className="text-[9px] text-zinc-500 font-semibold font-sans">Course completion rate</p>
            </div>
            <div className="p-3 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl">
              <TrendingUp className="w-6 h-6 animate-pulse" />
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-6 border border-zinc-800 flex justify-between items-center shadow">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-outfit block">Average Attendance</span>
              <p className="text-3xl font-bold font-outfit text-white">{avgAttendance}%</p>
              <p className="text-[9px] text-zinc-500 font-semibold font-sans">Live classroom check-ins</p>
            </div>
            <div className="p-3 bg-teal-500/10 text-teal-400 border border-teal-500/20 rounded-xl">
              <UserCheck className="w-6 h-6" />
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-6 border border-zinc-800 flex justify-between items-center shadow">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-outfit block">At-Risk Enrollees</span>
              <p className="text-3xl font-bold font-outfit text-rose-400">{atRiskCount}</p>
              <p className="text-[9px] text-zinc-500 font-semibold font-sans">Need academic assistance</p>
            </div>
            <div className="p-3 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-xl">
              <AlertTriangle className="w-6 h-6 animate-bounce" />
            </div>
          </div>
        </div>

        {/* DUAL PANE LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Cohort Analytics Table (Colspan 7/12) */}
          <div className="lg:col-span-7 glass-panel rounded-2xl p-6 border border-zinc-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-850">
              <h3 className="text-sm font-bold uppercase tracking-wider text-purple-400 font-outfit">Student Ledger</h3>
              <div className="relative w-full sm:w-60">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter enrollees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 rounded-full glass-input text-xs font-sans"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead>
                  <tr className="border-b border-zinc-850 text-zinc-500 font-bold uppercase tracking-wider text-[10px] font-outfit">
                    <th className="pb-3">Enrollee</th>
                    <th className="pb-3 text-center">Progress</th>
                    <th className="pb-3 text-center">Attendance</th>
                    <th className="pb-3 text-right">Risk Factor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/60">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-zinc-500">Loading metrics...</td>
                    </tr>
                  ) : filteredStudents.length > 0 ? (
                    filteredStudents.map((s) => {
                      const isSelected = selectedStudent?.id === s.id;
                      const riskColor = s.riskLevel === 'High' ? 'text-rose-400 bg-rose-500/10 border-rose-500/20' : s.riskLevel === 'Medium' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
                      return (
                        <tr 
                          key={s.id}
                          onClick={() => setSelectedStudent(s)}
                          className={`hover:bg-zinc-900/40 transition-colors cursor-pointer ${isSelected ? 'bg-blue-500/5 font-semibold text-white' : 'text-zinc-400'}`}
                        >
                          <td className="py-3.5 pr-2">
                            <div className="font-semibold text-white truncate max-w-[9.5rem]">{s.name}</div>
                            <div className="text-[10px] text-zinc-500 mt-0.5 truncate max-w-[9.5rem]">{s.courseName}</div>
                          </td>
                          <td className="py-3.5 text-center">
                            <div className="inline-flex items-center gap-1.5">
                              <div className="w-12 h-1.5 rounded-full bg-zinc-850 overflow-hidden hidden sm:block">
                                <div className="h-full bg-gradient-royal" style={{ width: `${s.progress}%` }} />
                              </div>
                              <span className="font-bold text-white font-outfit">{s.progress}%</span>
                            </div>
                          </td>
                          <td className="py-3.5 text-center font-bold text-white font-outfit">{s.attendanceRate}%</td>
                          <td className="py-3.5 text-right">
                            <span className={`inline-block text-[9px] px-2 py-0.5 rounded border uppercase tracking-wider font-bold ${riskColor}`}>
                              {s.riskLevel}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-zinc-500">No student enrollees matched filters.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* RIGHT COLUMN: Detail drill down & indicators (Colspan 5/12) */}
          <div className="lg:col-span-5">
            {selectedStudent ? (
              <div className="glass-panel rounded-2xl p-6 border border-zinc-800 space-y-6 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-royal" />

                {/* Profile detail */}
                <div className="pb-4 border-b border-zinc-850/80">
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider font-outfit block">Detail Drill-Down</span>
                  <h3 className="text-lg font-bold text-white font-outfit mt-1">{selectedStudent.name}</h3>
                  <p className="text-xs text-zinc-400 mt-0.5 truncate">{selectedStudent.courseName}</p>
                </div>

                {/* Checklist & Attendance Accordion Tabs */}
                <div className="space-y-6">
                  {/* Attendance log */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-teal-400 font-outfit flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-teal-400" />
                      Class Attendance History ({selectedStudent.attendanceCount})
                    </h4>
                    
                    <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                      {loadingDetails ? (
                        <div className="h-10 bg-zinc-900 rounded-lg animate-pulse" />
                      ) : studentAttendance.length > 0 ? (
                        studentAttendance.map((att, idx) => (
                          <div key={idx} className="flex justify-between items-center p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-850/80 text-xs">
                            <span className="font-semibold text-white truncate max-w-44">{att.classTitle}</span>
                            <span className={`flex items-center gap-1 font-bold ${att.status === 'present' ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {att.status === 'present' ? (
                                <>
                                  <Check className="w-3.5 h-3.5" /> Present
                                </>
                              ) : (
                                <>
                                  <X className="w-3.5 h-3.5" /> Absent
                                </>
                              )}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-[10px] text-zinc-500 italic">No attendance records logged.</p>
                      )}
                    </div>
                  </div>

                  {/* Lessons Completion checklist */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400 font-outfit flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-blue-400" />
                      Syllabus Lessons Checklist
                    </h4>

                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {loadingDetails ? (
                        <div className="h-16 bg-zinc-900 rounded-lg animate-pulse" />
                      ) : studentLessons.length > 0 ? (
                        studentLessons.map((less) => (
                          <div key={less.id} className="p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-850/80 flex items-center justify-between text-xs gap-4">
                            <div className="min-w-0">
                              <span className="text-[8px] font-bold text-zinc-500 uppercase block tracking-wider truncate">{less.moduleName}</span>
                              <span className="font-semibold text-white block mt-0.5 truncate">{less.title}</span>
                            </div>
                            <span className={`shrink-0 flex items-center justify-center w-5 h-5 rounded-full border ${less.completed ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-zinc-900 border-zinc-800 text-zinc-600'}`}>
                              {less.completed ? <Check className="w-3 h-3 text-emerald-400" /> : <Clock className="w-2.5 h-2.5" />}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-[10px] text-zinc-500 italic">No course outline lessons structured.</p>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              <div className="glass-panel rounded-2xl p-12 text-center shadow border border-zinc-850">
                <Users className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                <h3 className="text-base font-bold text-white font-outfit">No Student Selected</h3>
                <p className="text-xs text-zinc-500 mt-1">Select a student from the cohort ledger to inspect comprehensive insights details.</p>
              </div>
            )}
          </div>

        </div>

      </div>
    </PortalShell>
  );
}
