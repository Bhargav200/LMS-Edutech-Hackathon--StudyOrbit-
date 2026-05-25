'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import PortalShell from '@/components/PortalShell';
import AIStudyBuddy from '@/components/AIStudyBuddy';
import { supabase } from '@/lib/supabaseClient';
import { 
  Play, BookOpen, FileText, CheckCircle2, ChevronRight, 
  ArrowLeft, ArrowRight, Download, Award, Star, HelpCircle 
} from 'lucide-react';

export default function CoursePlayer() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const [studentId, setStudentId] = useState('f9b07384-f113-4318-f89e-4cdeee958b92');

  const [course, setCourse] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [progress, setProgress] = useState<any[]>([]);
  const [overallProgress, setOverallProgress] = useState(0);

  const [activeLesson, setActiveLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    const storedId = localStorage.getItem('study_orbit_user_id') || 'f9b07384-f113-4318-f89e-4cdeee958b92';
    setStudentId(storedId);

    async function loadCourseDetails() {
      // 1. Fetch Course info
      const { data: courseData } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();
      
      if (courseData) setCourse(courseData);

      // 2. Fetch Modules
      const { data: moduleData } = await supabase
        .from('modules')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index', { ascending: true });
      
      if (moduleData) setModules(moduleData);

      // 3. Fetch Lessons
      if (moduleData && moduleData.length > 0) {
        const moduleIds = moduleData.map(m => m.id);
        const { data: lessonData } = await supabase
          .from('lessons')
          .select('*')
          .in('module_id', moduleIds)
          .order('order_index', { ascending: true });
        
        if (lessonData) {
          setLessons(lessonData);
          setActiveLesson(lessonData[0]); // default to first lesson
        }
      }

      // 4. Fetch Progress logs
      const { data: progressData } = await supabase
        .from('student_lesson_progress')
        .select('*')
        .eq('student_id', storedId);
      
      if (progressData) setProgress(progressData);

      // 5. Fetch overall progress
      const { data: overall } = await supabase
        .from('student_course_progress')
        .select('overall_progress')
        .eq('student_id', storedId)
        .eq('course_id', courseId)
        .single();
      
      if (overall) setOverallProgress(overall.overall_progress);

      setLoading(false);
    }

    if (courseId) {
      loadCourseDetails();
    }
  }, [courseId]);

  const isLessonCompleted = (lessonId: string) => {
    const p = progress.find(log => log.lesson_id === lessonId);
    return p ? p.completed : false;
  };

  const handleMarkComplete = async () => {
    if (!activeLesson || completing) return;
    setCompleting(true);

    try {
      // Insert or Update lesson progress
      const { error: upsertErr } = await supabase
        .from('student_lesson_progress')
        .upsert({
          student_id: studentId,
          lesson_id: activeLesson.id,
          completed: true,
          completed_at: new Date().toISOString()
        }, {
          onConflict: 'student_id,lesson_id'
        });

      if (upsertErr) throw upsertErr;

      // Update local progress log state
      const updatedProgress = [...progress];
      const existIndex = updatedProgress.findIndex(p => p.lesson_id === activeLesson.id);
      if (existIndex > -1) {
        updatedProgress[existIndex].completed = true;
      } else {
        updatedProgress.push({ student_id: studentId, lesson_id: activeLesson.id, completed: true });
      }
      setProgress(updatedProgress);

      // Recalculate overall completion percentage
      const totalLessons = lessons.length;
      const completedCount = lessons.filter(l => l.id === activeLesson.id || isLessonCompleted(l.id)).length;
      const newPercentage = Math.round((completedCount / totalLessons) * 100);
      setOverallProgress(newPercentage);

      // Update database student_course_progress
      await supabase
        .from('student_course_progress')
        .upsert({
          student_id: studentId,
          course_id: courseId,
          batch_id: 'b1111111-1111-1111-1111-111111111111',
          overall_progress: newPercentage,
          last_accessed_at: new Date().toISOString()
        }, {
          onConflict: 'student_id,course_id,batch_id'
        });

      // If progress reaches 100%, trigger automatic Certificate Issuance!
      if (newPercentage === 100) {
        // Direct insert certificate row
        const certCode = 'CERT-' + Math.random().toString(36).substring(2, 8).toUpperCase();
        await supabase.from('certificates').insert({
          student_id: studentId,
          course_id: courseId,
          batch_id: 'b1111111-1111-1111-1111-111111111111',
          issued_at: new Date().toISOString(),
          verification_code: certCode,
          certificate_url: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=1200&auto=format&fit=crop&q=80'
        });
      }

    } catch (err: any) {
      console.error('Error completing lesson:', err.message);
    } finally {
      setCompleting(false);
    }
  };

  const handleNextLesson = () => {
    if (!activeLesson) return;
    const currentIndex = lessons.findIndex(l => l.id === activeLesson.id);
    if (currentIndex < lessons.length - 1) {
      setActiveLesson(lessons[currentIndex + 1]);
    }
  };

  const handlePrevLesson = () => {
    if (!activeLesson) return;
    const currentIndex = lessons.findIndex(l => l.id === activeLesson.id);
    if (currentIndex > 0) {
      setActiveLesson(lessons[currentIndex - 1]);
    }
  };

  if (loading) {
    return (
      <PortalShell>
        <div className="flex gap-6 animate-pulse">
          <div className="w-80 h-[calc(100vh-120px)] bg-zinc-900 rounded-2xl" />
          <div className="flex-1 h-[calc(100vh-120px)] bg-zinc-900 rounded-2xl" />
        </div>
      </PortalShell>
    );
  }

  return (
    <PortalShell>
      {/* Dynamic Shell Grid Layout */}
      <div className="flex flex-col xl:flex-row gap-6 h-[calc(100vh-130px)] select-none">
        
        {/* LEFT SYLLABUS PANEL (Width 80/96) */}
        <aside className="w-full xl:w-80 glass-panel rounded-2xl flex flex-col overflow-hidden max-h-[18rem] xl:max-h-none xl:h-full">
          <div className="p-4 border-b border-zinc-800 bg-zinc-950/20">
            <button 
              onClick={() => router.push('/student/courses')}
              className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition-colors mb-3 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              All Enrolled Courses
            </button>
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 font-outfit mb-1">{course?.title}</h3>
            
            {/* Progress Meter */}
            <div className="space-y-1.5 mt-3">
              <div className="flex justify-between items-center text-[10px] text-zinc-500 font-semibold font-outfit">
                <span>COURSE COMPLETION</span>
                <span className="text-white">{overallProgress}%</span>
              </div>
              <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-royal rounded-full transition-all duration-300" style={{ width: `${overallProgress}%` }} />
              </div>
            </div>
          </div>

          {/* Module lists scrollbox */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {modules.map((mod, modIdx) => {
              const modLessons = lessons.filter(l => l.module_id === mod.id);
              
              return (
                <div key={mod.id} className="space-y-2">
                  <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-outfit">
                    Module {modIdx + 1}: {mod.title}
                  </h4>
                  
                  <div className="space-y-1">
                    {modLessons.map((les, lesIdx) => {
                      const isCompleted = isLessonCompleted(les.id);
                      const isActive = activeLesson?.id === les.id;
                      
                      return (
                        <button
                          key={les.id}
                          onClick={() => setActiveLesson(les)}
                          className={`w-full flex items-center gap-3 p-3.5 rounded-xl text-left transition-all cursor-pointer group ${isActive ? 'bg-zinc-800/80 border border-zinc-700/50 text-white' : 'hover:bg-zinc-900/40 text-zinc-400 border border-transparent'}`}
                        >
                          <div className={`p-1.5 rounded flex items-center justify-center ${isActive ? 'bg-blue-500/10 text-blue-400' : 'bg-zinc-900 text-zinc-600 group-hover:text-zinc-400'}`}>
                            {les.content_type === 'video' ? <Play className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold leading-normal truncate group-hover:text-white transition-colors">{lesIdx + 1}. {les.title}</p>
                            <p className="text-[9px] text-zinc-500 mt-0.5">{les.duration} mins • {les.content_type}</p>
                          </div>

                          {isCompleted && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 min-w-4" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* MAIN LESSON VIEWER PANEL */}
        <section className="flex-1 glass-panel rounded-2xl flex flex-col justify-between overflow-hidden h-full">
          {activeLesson ? (
            <>
              {/* Main Content Scrollbox */}
              <div className="flex-1 p-6 md:p-8 overflow-y-auto space-y-6">
                
                {/* Lesson Header */}
                <div className="border-b border-zinc-800/60 pb-5 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[9px] font-bold text-zinc-400 tracking-wider uppercase font-outfit">
                      {activeLesson.content_type}
                    </span>
                    <span className="text-zinc-600 text-xs">•</span>
                    <span className="text-xs text-zinc-500 font-sans">{activeLesson.duration} mins expected runtime</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white font-outfit leading-snug">{activeLesson.title}</h2>
                </div>

                {/* Lesson Body/Media Area */}
                <div className="bg-zinc-950/20 border border-zinc-800/80 rounded-2xl overflow-hidden p-1">
                  
                  {/* Rendering Video player mockup */}
                  {activeLesson.content_type === 'video' && (
                    <div className="aspect-video w-full bg-black relative flex items-center justify-center overflow-hidden group/player rounded-xl">
                      <video 
                        src={activeLesson.content.video_url} 
                        controls 
                        className="w-full h-full object-contain"
                        poster="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&auto=format&fit=crop&q=80"
                      />
                    </div>
                  )}

                  {/* Rendering Text Body article editor */}
                  {activeLesson.content_type === 'text' && (
                    <div className="p-6 md:p-8 text-sm leading-relaxed text-zinc-300 font-sans max-w-3xl mx-auto space-y-4">
                      {activeLesson.content.text_body}
                    </div>
                  )}

                  {/* Rendering PDF embedded frame */}
                  {activeLesson.content_type === 'pdf' && (
                    <div className="p-6 flex flex-col items-center justify-center text-center h-96 bg-zinc-900/20 space-y-4 rounded-xl">
                      <div className="p-4 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                        <FileText className="w-10 h-10" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white font-outfit">{activeLesson.title} Guide PDF</h4>
                        <p className="text-xs text-zinc-500 mt-1">{activeLesson.content.description || 'Download reference booklet.'}</p>
                      </div>
                      <a 
                        href={activeLesson.content.pdf_url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="px-5 py-2.5 rounded-xl bg-gradient-royal text-white text-xs font-semibold hover:opacity-95 shadow cursor-pointer flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Download Reference Resource
                      </a>
                    </div>
                  )}
                </div>

                {/* Additional lesson attachments/resources */}
                <div className="pt-4 space-y-3">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider font-outfit">Syllabus Resources</h4>
                  <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/10 rounded text-blue-400">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-white">Full-Stack Cheat Sheet.pdf</p>
                        <p className="text-[10px] text-zinc-500 mt-0.5">Reference booklet • 2.4 MB</p>
                      </div>
                    </div>
                    <button className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>

              {/* Lesson Viewer Action Footer Footer bar */}
              <div className="p-4 border-t border-zinc-800 bg-zinc-950/20 flex items-center justify-between">
                
                {/* Prev Button */}
                <button
                  onClick={handlePrevLesson}
                  disabled={lessons.findIndex(l => l.id === activeLesson.id) === 0}
                  className="flex items-center gap-1 px-4 py-2.5 rounded-xl border border-zinc-800 hover:border-zinc-700 bg-zinc-900/40 text-xs font-semibold hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer text-zinc-400"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Previous Lesson
                </button>

                {/* Complete Button */}
                <button
                  onClick={handleMarkComplete}
                  disabled={isLessonCompleted(activeLesson.id) || completing}
                  className={`px-6 py-2.5 rounded-xl text-xs font-bold shadow cursor-pointer transition-all flex items-center gap-1.5 ${isLessonCompleted(activeLesson.id) ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-gradient-royal text-white hover:opacity-95'}`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {isLessonCompleted(activeLesson.id) ? 'Completed' : 'Mark Lesson Complete'}
                </button>

                {/* Next Button */}
                <button
                  onClick={handleNextLesson}
                  disabled={lessons.findIndex(l => l.id === activeLesson.id) === lessons.length - 1}
                  className="flex items-center gap-1 px-4 py-2.5 rounded-xl border border-zinc-800 hover:border-zinc-700 bg-zinc-900/40 text-xs font-semibold hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer text-zinc-400"
                >
                  Next Lesson
                  <ChevronRight className="w-4 h-4" />
                </button>

              </div>
            </>
          ) : (
            <div className="flex items-center justify-center flex-1 h-full">
              <HelpCircle className="w-12 h-12 text-zinc-700 animate-bounce mb-3" />
              <p className="text-zinc-500 text-sm">Select a lesson from the syllabus outline to get started.</p>
            </div>
          )}
        </section>

      </div>
      <AIStudyBuddy />
    </PortalShell>
  );
}
