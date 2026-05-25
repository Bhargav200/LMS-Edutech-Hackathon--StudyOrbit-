'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PortalShell from '@/components/PortalShell';
import AIStudyBuddy from '@/components/AIStudyBuddy';
import { supabase } from '@/lib/supabaseClient';
import { Play, BookOpen, Clock, Award, Star } from 'lucide-react';

export default function StudentCourses() {
  const router = useRouter();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCourses() {
      // Direct SQL select since RLS is open
      const { data: progressList } = await supabase
        .from('student_course_progress')
        .select('*, courses(*)');
      
      if (progressList) {
        setCourses(progressList);
      }
      setLoading(false);
    }
    loadCourses();
  }, []);

  return (
    <PortalShell>
      <div className="space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold font-outfit text-white">My Enrolled Courses</h2>
            <p className="text-sm text-zinc-400 mt-1 leading-normal font-sans">
              Keep learning and build production-ready projects. Resume your syllabus modules below.
            </p>
          </div>
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-zinc-800 bg-zinc-900/60 w-fit">
            <BookOpen className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-zinc-300 font-semibold font-outfit">Enrolled in 1 Program</span>
          </div>
        </div>

        {/* Courses Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-panel h-64 rounded-2xl animate-pulse" />
            <div className="glass-panel h-64 rounded-2xl animate-pulse" />
          </div>
        ) : courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {courses.map((item) => {
              const c = item.courses;
              if (!c) return null;
              
              return (
                <div 
                  key={item.course_id}
                  className="glass-panel rounded-2xl overflow-hidden flex flex-col shadow-lg hover:-translate-y-1 transition-all group relative border border-zinc-800/80 hover:border-zinc-700/80"
                >
                  {/* Thumbnail Banner */}
                  <div className="h-44 relative w-full overflow-hidden bg-zinc-900">
                    <img 
                      src={c.cover_image || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80'} 
                      alt={c.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500 opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/30 to-transparent" />
                    
                    <span className="absolute top-4 left-4 px-2.5 py-0.5 rounded-full border border-blue-500/20 bg-blue-500/10 text-[9px] font-bold text-blue-400 tracking-wider uppercase font-outfit">
                      {c.category}
                    </span>
                  </div>

                  {/* Body Info */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                    <div className="space-y-2">
                      <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors leading-snug font-outfit truncate">
                        {c.title}
                      </h3>
                      <p className="text-xs text-zinc-400 font-sans leading-relaxed line-clamp-2">
                        {c.description}
                      </p>
                    </div>

                    {/* Progress Slider */}
                    <div className="space-y-2 pt-2 border-t border-zinc-800/50">
                      <div className="flex justify-between items-center text-[10px] font-semibold text-zinc-500">
                        <span className="uppercase tracking-wider font-outfit">Course Progress</span>
                        <span className="font-outfit text-white">{item.overall_progress}%</span>
                      </div>
                      
                      <div className="h-1.5 w-full bg-zinc-800/60 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-royal rounded-full transition-all duration-300"
                          style={{ width: `${item.overall_progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-3.5 text-[10px] text-zinc-500 font-semibold font-sans">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          12 Weeks
                        </span>
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-3.5 h-3.5" />
                          4 Lessons
                        </span>
                      </div>

                      <button
                        onClick={() => router.push(`/student/courses/${item.course_id}`)}
                        className="px-4 py-2 rounded-xl bg-gradient-royal text-white text-[11px] font-bold hover:opacity-95 shadow shadow-blue-500/10 cursor-pointer flex items-center gap-1 transition-all group-hover:gap-1.5"
                      >
                        Resume
                        <Play className="w-3 h-3 fill-current" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="glass-panel rounded-2xl p-12 text-center shadow">
            <BookOpen className="w-12 h-12 text-zinc-600 mx-auto mb-4 animate-bounce" />
            <p className="text-zinc-400 text-sm font-semibold">No enrolled courses listed yet.</p>
          </div>
        )}

      </div>
      <AIStudyBuddy />
    </PortalShell>
  );
}
