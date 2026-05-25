'use client';

import { useState, useEffect } from 'react';
import PortalShell from '@/components/PortalShell';
import { supabase } from '@/lib/supabaseClient';
import { 
  BookOpen, Plus, Trash2, Edit3, ArrowRight, CheckCircle2, 
  Layers, Play, FileText, HelpCircle, Save, FolderPlus, 
  Sparkles, DollarSign, Clock, Settings, ChevronRight
} from 'lucide-react';

export default function AdminCourses() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  
  // Forms state
  const [courseTitle, setCourseTitle] = useState('');
  const [courseDesc, setCourseDesc] = useState('');
  const [courseCategory, setCourseCategory] = useState('Tech');
  const [coursePrice, setCoursePrice] = useState<number>(9999);
  const [dripEnabled, setDripEnabled] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Module / Lesson states
  const [newModuleName, setNewModuleName] = useState('');
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonType, setNewLessonType] = useState<'video' | 'pdf' | 'text' | 'quiz'>('video');
  const [newLessonDuration, setNewLessonDuration] = useState<number>(30);
  const [activeModuleForLesson, setActiveModuleForLesson] = useState<string>('');

  useEffect(() => {
    async function loadCurriculums() {
      setLoading(true);
      // Fetch courses with nested modules and lessons
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          modules (
            *,
            lessons (
              *
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading courses schema:', error);
      } else if (data) {
        setCourses(data);
        if (data.length > 0) {
          handleSelectCourse(data[0]);
        }
      }
      setLoading(false);
    }
    loadCurriculums();
  }, []);

  const handleSelectCourse = (course: any) => {
    setSelectedCourse(course);
    setCourseTitle(course.title);
    setCourseDesc(course.description);
    setCourseCategory(course.category || 'Tech');
    setCoursePrice(Number(course.price) || 0);
    setDripEnabled(course.drip_enabled || false);
    setSaveSuccess(false);
    
    // Default the active module for adding lessons to the first module
    if (course.modules && course.modules.length > 0) {
      setActiveModuleForLesson(course.modules[0].id);
    } else {
      setActiveModuleForLesson('');
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Hardcode sandbox default institute id
      const instId = '11111111-1111-1111-1111-111111111111';
      const { data, error } = await supabase
        .from('courses')
        .insert({
          institute_id: instId,
          title: 'New Course Program',
          description: 'A comprehensive curriculum outline sandbox.',
          category: 'Tech',
          price: 9999.00,
          pricing: { type: 'one_time', amount: 9999.00 },
          is_published: true
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        // Hydrate empty modules/lessons local arrays
        const newC = { ...data, modules: [] };
        setCourses(prev => [newC, ...prev]);
        handleSelectCourse(newC);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 1500);
      }
    } catch (err: any) {
      console.error('Error creating course:', err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse || saving) return;
    setSaving(true);

    try {
      const { error } = await supabase
        .from('courses')
        .update({
          title: courseTitle,
          description: courseDesc,
          category: courseCategory,
          price: coursePrice,
          pricing: { type: 'one_time', amount: coursePrice },
          drip_enabled: dripEnabled
        })
        .eq('id', selectedCourse.id);

      if (error) throw error;

      // Update local courses state
      setCourses(prev => prev.map(c => {
        if (c.id === selectedCourse.id) {
          return {
            ...c,
            title: courseTitle,
            description: courseDesc,
            category: courseCategory,
            price: coursePrice,
            drip_enabled: dripEnabled
          };
        }
        return c;
      }));

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err: any) {
      console.error('Error saving course changes:', err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse || !newModuleName.trim()) return;

    try {
      const orderIdx = selectedCourse.modules ? selectedCourse.modules.length : 0;
      const { data, error } = await supabase
        .from('modules')
        .insert({
          course_id: selectedCourse.id,
          title: newModuleName,
          order_index: orderIdx
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newMod = { ...data, lessons: [] };
        const updatedMods = [...(selectedCourse.modules || []), newMod];
        
        setSelectedCourse((prev: any) => ({
          ...prev,
          modules: updatedMods
        }));

        setCourses(prev => prev.map(c => {
          if (c.id === selectedCourse.id) {
            return { ...c, modules: updatedMods };
          }
          return c;
        }));

        setNewModuleName('');
        setActiveModuleForLesson(newMod.id);
      }
    } catch (err: any) {
      console.error('Error adding module:', err.message);
    }
  };

  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse || !activeModuleForLesson || !newLessonTitle.trim()) return;

    try {
      const activeMod = selectedCourse.modules.find((m: any) => m.id === activeModuleForLesson);
      const orderIdx = activeMod?.lessons ? activeMod.lessons.length : 0;
      
      const { data, error } = await supabase
        .from('lessons')
        .insert({
          module_id: activeModuleForLesson,
          title: newLessonTitle,
          content_type: newLessonType,
          content: { 
            video_url: 'https://ujksrvgddvetziudrljw.supabase.co/storage/v1/object/public/lessons/demo.mp4',
            text_body: 'This lesson explains standard enterprise frameworks.'
          },
          duration: newLessonDuration,
          order_index: orderIdx
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const updatedMods = selectedCourse.modules.map((m: any) => {
          if (m.id === activeModuleForLesson) {
            return {
              ...m,
              lessons: [...(m.lessons || []), data]
            };
          }
          return m;
        });

        setSelectedCourse((prev: any) => ({
          ...prev,
          modules: updatedMods
        }));

        setCourses(prev => prev.map(c => {
          if (c.id === selectedCourse.id) {
            return { ...c, modules: updatedMods };
          }
          return c;
        }));

        setNewLessonTitle('');
        setNewLessonDuration(30);
      }
    } catch (err: any) {
      console.error('Error adding lesson:', err.message);
    }
  };

  return (
    <PortalShell>
      <div className="space-y-8 relative">
        
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold font-outfit text-white">Curriculum Builder</h2>
            <p className="text-sm text-zinc-400 mt-1 font-sans leading-normal">
              Edit multi-tiered academic pipelines, pricing catalogs, and drip- unlock constraints.
            </p>
          </div>
          <button
            onClick={handleCreateCourse}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-gradient-royal text-white text-xs font-semibold hover:opacity-95 shadow cursor-pointer flex items-center gap-1.5 self-start"
          >
            <Plus className="w-4 h-4 font-bold" />
            New Program
          </button>
        </div>

        {/* Dynamic Dual-Pane Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Curriculums Outline Tree (Colspan 5/12) */}
          <div className="lg:col-span-5 space-y-4">
            
            <div className="glass-panel p-4 rounded-2xl border border-zinc-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 font-outfit">Syllabus Directory</h3>
            </div>

            {/* Tree outlines list */}
            <div className="space-y-4 overflow-y-auto max-h-[35rem] pr-1">
              {loading ? (
                <div className="space-y-3">
                  <div className="glass-panel h-16 rounded-xl animate-pulse" />
                  <div className="glass-panel h-16 rounded-xl animate-pulse" />
                </div>
              ) : courses.length > 0 ? (
                courses.map((c) => {
                  const isSelected = selectedCourse?.id === c.id;
                  return (
                    <div key={c.id} className="space-y-2">
                      <div
                        onClick={() => handleSelectCourse(c)}
                        className={`glass-panel p-4 rounded-2xl border transition-all cursor-pointer text-left relative flex justify-between items-center ${isSelected ? 'border-blue-500/40 bg-blue-500/5 shadow-md' : 'border-zinc-800 hover:border-zinc-700/80'}`}
                      >
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-white font-outfit truncate">{c.title}</h4>
                          <p className="text-[10px] text-zinc-500 mt-0.5 font-semibold font-sans">{c.category || 'Tech'} • {c.modules?.length || 0} Modules</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-zinc-500" />
                      </div>

                      {/* Render nested modules list for selected course */}
                      {isSelected && c.modules && c.modules.length > 0 && (
                        <div className="pl-4 space-y-2 border-l border-zinc-800/80 ml-4 py-1">
                          {c.modules.map((mod: any) => (
                            <div key={mod.id} className="p-3 bg-zinc-950/40 border border-zinc-850 rounded-xl space-y-2 text-xs">
                              <div className="flex items-center gap-1.5 text-zinc-400 font-bold font-outfit">
                                <Layers className="w-3.5 h-3.5 text-purple-400" />
                                <span className="truncate">{mod.title}</span>
                              </div>
                              
                              {/* Lessons nested */}
                              {mod.lessons && mod.lessons.length > 0 && (
                                <div className="pl-3 space-y-1.5 border-l border-zinc-900 ml-1.5 py-0.5">
                                  {mod.lessons.map((less: any) => (
                                    <div key={less.id} className="flex justify-between items-center text-[10px] text-zinc-500">
                                      <span className="truncate max-w-44">{less.title}</span>
                                      <span className="shrink-0 uppercase font-bold text-[8px] bg-zinc-900 px-1 py-0.5 rounded border border-zinc-800 text-zinc-400">{less.content_type}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="glass-panel p-8 text-center rounded-xl border border-zinc-850">
                  <BookOpen className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                  <p className="text-xs text-zinc-500">Create a curriculum program to begin.</p>
                </div>
              )}
            </div>

          </div>

          {/* RIGHT COLUMN: Settings Form & Sub-element Adders (Colspan 7/12) */}
          <div className="lg:col-span-7">
            {selectedCourse ? (
              <div className="space-y-6">
                
                {/* Course Metadata Form */}
                <form onSubmit={handleUpdateCourse} className="glass-panel rounded-2xl p-6 border border-zinc-800 space-y-5 relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-royal" />
                  
                  <div className="flex justify-between items-center pb-3 border-b border-zinc-850">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-blue-400 font-outfit">Program Configuration</h3>
                    <span className="text-[10px] text-zinc-500 font-semibold">Metadata & Pricing</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Program Title</label>
                      <input
                        type="text"
                        value={courseTitle}
                        onChange={(e) => setCourseTitle(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl glass-input text-xs font-sans text-white focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Pricing (INR)</label>
                      <input
                        type="number"
                        value={coursePrice}
                        onChange={(e) => setCoursePrice(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl glass-input text-xs font-sans text-white focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Program Overview</label>
                    <textarea
                      value={courseDesc}
                      onChange={(e) => setCourseDesc(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 rounded-xl glass-input text-xs font-sans text-white focus:outline-none"
                      required
                    />
                  </div>

                  <div className="flex items-center gap-6 p-4 rounded-xl bg-zinc-950/40 border border-zinc-850 text-xs">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={dripEnabled}
                        onChange={(e) => setDripEnabled(e.target.checked)}
                        id="dripCheck"
                        className="w-4 h-4 rounded border-zinc-800 text-blue-500 cursor-pointer"
                      />
                      <label htmlFor="dripCheck" className="font-bold text-zinc-300 cursor-pointer select-none">Drip Release unlocking rules</label>
                    </div>
                    <span className="text-[10px] text-zinc-500">Unlocks lessons sequentially after signup.</span>
                  </div>

                  {saveSuccess && (
                    <div className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl flex items-center gap-2 font-semibold">
                      <CheckCircle2 className="w-4 h-4" />
                      Course curriculum details saved!
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full py-3 rounded-xl bg-gradient-royal text-white text-xs font-semibold hover:opacity-95 shadow transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Save Curriculum Config
                  </button>
                </form>

                {/* Sub-Element Builders: Modules & Lessons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Create Module Form */}
                  <form onSubmit={handleAddModule} className="glass-panel p-6 rounded-2xl border border-zinc-800 space-y-4 shadow">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400 font-outfit flex items-center gap-1.5">
                      <FolderPlus className="w-4 h-4" />
                      Add Syllabus Module
                    </h4>
                    <div>
                      <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Module Title</label>
                      <input
                        type="text"
                        placeholder="e.g. Frontend styling with CSS"
                        value={newModuleName}
                        onChange={(e) => setNewModuleName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl glass-input text-xs font-sans text-white focus:outline-none"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl border border-zinc-800 hover:border-zinc-700 bg-zinc-900/60 hover:bg-zinc-800/40 text-xs font-semibold text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Create Module Block
                    </button>
                  </form>

                  {/* Create Lesson Form */}
                  <form onSubmit={handleAddLesson} className="glass-panel p-6 rounded-2xl border border-zinc-800 space-y-4 shadow">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-teal-400 font-outfit flex items-center gap-1.5">
                      <Plus className="w-4 h-4" />
                      Add Modular Lesson
                    </h4>
                    
                    {selectedCourse.modules && selectedCourse.modules.length > 0 ? (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Target Module</label>
                          <select
                            value={activeModuleForLesson}
                            onChange={(e) => setActiveModuleForLesson(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl glass-input text-xs font-sans text-zinc-300 focus:outline-none bg-obsidian"
                          >
                            {selectedCourse.modules.map((m: any) => (
                              <option key={m.id} value={m.id} className="bg-obsidian">{m.title}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Lesson Title</label>
                          <input
                            type="text"
                            placeholder="e.g. Tailwind installation"
                            value={newLessonTitle}
                            onChange={(e) => setNewLessonTitle(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl glass-input text-xs font-sans text-white focus:outline-none"
                            required
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Type</label>
                            <select
                              value={newLessonType}
                              onChange={(e) => setNewLessonType(e.target.value as any)}
                              className="w-full px-3 py-2 rounded-xl glass-input text-xs font-sans text-zinc-300 focus:outline-none bg-obsidian"
                            >
                              <option value="video" className="bg-obsidian">Video Play</option>
                              <option value="text" className="bg-obsidian">Text explanation</option>
                              <option value="pdf" className="bg-obsidian">PDF Asset</option>
                              <option value="quiz" className="bg-obsidian">Quick Quiz</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Duration</label>
                            <input
                              type="number"
                              value={newLessonDuration}
                              onChange={(e) => setNewLessonDuration(Number(e.target.value))}
                              className="w-full px-3 py-2 rounded-xl glass-input text-xs font-sans text-white focus:outline-none"
                              required
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="w-full py-2.5 rounded-xl bg-gradient-royal text-white text-xs font-semibold hover:opacity-95 shadow transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Publish Lesson
                        </button>
                      </div>
                    ) : (
                      <p className="text-[10px] text-zinc-500 italic py-4 text-center">Add a module block first to insert lessons.</p>
                    )}
                  </form>

                </div>

              </div>
            ) : (
              <div className="glass-panel rounded-2xl p-12 text-center shadow border border-zinc-850">
                <BookOpen className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                <h3 className="text-base font-bold text-white font-outfit">Select a Curriculum</h3>
                <p className="text-xs text-zinc-500 mt-1">Select a program directory from the outline database to edit modular structures.</p>
              </div>
            )}
          </div>

        </div>

      </div>
    </PortalShell>
  );
}
