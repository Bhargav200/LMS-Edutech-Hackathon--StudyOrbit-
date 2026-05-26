'use client';

import { useState, useEffect } from 'react';
import PortalShell from '@/components/PortalShell';
import { supabase } from '@/lib/supabaseClient';
import { 
  Layers, Plus, Trash2, Calendar, Users, Clock, 
  CheckCircle2, ArrowRight, UserCheck, AlertTriangle, 
  MapPin, BookOpen, Save, Check, ShieldAlert, ChevronRight
} from 'lucide-react';

export default function AdminBatches() {
  const [batches, setBatches] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Forms state
  const [batchName, setBatchName] = useState('');
  const [targetCourse, setTargetCourse] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [capacity, setCapacity] = useState<number>(40);
  const [days, setDays] = useState<string[]>(['Monday', 'Wednesday']);
  const [time, setTime] = useState('18:00');
  
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Cohort enrollees details
  const [enrollees, setEnrollees] = useState<any[]>([]);
  const [loadingEnrollees, setLoadingEnrollees] = useState(false);

  useEffect(() => {
    async function loadBatchesData() {
      setLoading(true);
      
      // 1. Fetch courses to populate selectors
      const { data: coursesList } = await supabase
        .from('courses')
        .select('id, title');
      if (coursesList) setCourses(coursesList);

      // 2. Fetch batches
      const { data, error } = await supabase
        .from('batches')
        .select(`
          *,
          courses!batches_course_id_fkey (
            title
          )
        `)
        .order('start_date', { ascending: false });

      if (error) {
        console.error('Error loading batches:', error);
      } else if (data) {
        setBatches(data);
        if (data.length > 0) {
          handleSelectBatch(data[0]);
        }
      }
      setLoading(false);
    }
    loadBatchesData();
  }, []);

  // Fetch enrollees list when selected batch changes
  useEffect(() => {
    if (!selectedBatch) return;

    async function loadEnrollees() {
      setLoadingEnrollees(true);
      const { data, error } = await supabase
        .from('batch_students')
        .select(`
          enrollment_date,
          fee_status,
          profiles:student_id (
            full_name,
            phone
          )
        `)
        .eq('batch_id', selectedBatch.id);

      if (error) {
        console.error('Error loading enrollees:', error);
      } else if (data) {
        setEnrollees(data);
      }
      setLoadingEnrollees(false);
    }
    loadEnrollees();
  }, [selectedBatch]);

  const handleSelectBatch = (batch: any) => {
    setSelectedBatch(batch);
    setBatchName(batch.name);
    setTargetCourse(batch.course_id);
    setStartDate(batch.start_date);
    setEndDate(batch.end_date);
    setCapacity(batch.capacity || 40);
    setDays(batch.schedule?.days || ['Monday', 'Wednesday']);
    setTime(batch.schedule?.time || '18:00');
    setSaveSuccess(false);
  };

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (courses.length === 0 || saving) return;
    setSaving(true);

    try {
      const instId = '11111111-1111-1111-1111-111111111111';
      const cId = courses[0].id;
      
      const { data, error } = await supabase
        .from('batches')
        .insert({
          institute_id: instId,
          course_id: cId,
          name: 'New Cohort Slot',
          start_date: new Date().toISOString().split('T')[0],
          end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          capacity: 40,
          schedule: { days: ['Monday', 'Wednesday'], time: '18:00' },
          status: 'active'
        })
        .select(`
          *,
          courses!batches_course_id_fkey (
            title
          )
        `)
        .single();

      if (error) throw error;

      if (data) {
        setBatches(prev => [data, ...prev]);
        handleSelectBatch(data);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 1500);
      }
    } catch (err: any) {
      console.error('Error creating batch:', err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatch || saving) return;
    setSaving(true);

    try {
      const { error } = await supabase
        .from('batches')
        .update({
          name: batchName,
          course_id: targetCourse,
          start_date: startDate,
          end_date: endDate,
          capacity: capacity,
          schedule: { days, time }
        })
        .eq('id', selectedBatch.id);

      if (error) throw error;

      // Update local batches state
      const matchedCourse = courses.find(c => c.id === targetCourse);
      setBatches(prev => prev.map(b => {
        if (b.id === selectedBatch.id) {
          return {
            ...b,
            name: batchName,
            course_id: targetCourse,
            start_date: startDate,
            end_date: endDate,
            capacity: capacity,
            schedule: { days, time },
            courses: { title: matchedCourse?.title || b.courses?.title }
          };
        }
        return b;
      }));

      // Update selected batch locally
      setSelectedBatch((prev: any) => ({
        ...prev,
        name: batchName,
        course_id: targetCourse,
        start_date: startDate,
        end_date: endDate,
        capacity: capacity,
        schedule: { days, time },
        courses: { title: matchedCourse?.title || prev.courses?.title }
      }));

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err: any) {
      console.error('Error saving batch:', err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleDay = (day: string) => {
    if (days.includes(day)) {
      setDays(prev => prev.filter(d => d !== day));
    } else {
      setDays(prev => [...prev, day]);
    }
  };

  const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <PortalShell>
      <div className="space-y-8 relative">
        
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold font-outfit text-white">Batch Cohorts Manager</h2>
            <p className="text-sm text-zinc-400 mt-1 font-sans leading-normal">
              Manage cohort enrollees, link faculty schedules, and structure batch classroom slots.
            </p>
          </div>
          <button
            onClick={handleCreateBatch}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-gradient-royal text-white text-xs font-semibold hover:opacity-95 shadow cursor-pointer flex items-center gap-1.5 self-start"
          >
            <Plus className="w-4 h-4 font-bold" />
            Launch Cohort
          </button>
        </div>

        {/* Dynamic Dual-Pane Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Cohorts List tree (Colspan 5/12) */}
          <div className="lg:col-span-5 space-y-4">
            
            <div className="glass-panel p-4 rounded-2xl border border-zinc-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 font-outfit">Active Cohorts</h3>
            </div>

            {/* List */}
            <div className="space-y-3 overflow-y-auto max-h-[30rem] pr-1">
              {loading ? (
                <div className="space-y-3">
                  <div className="glass-panel h-20 rounded-xl animate-pulse" />
                  <div className="glass-panel h-20 rounded-xl animate-pulse" />
                </div>
              ) : batches.length > 0 ? (
                batches.map((b) => {
                  const isSelected = selectedBatch?.id === b.id;
                  return (
                    <div
                      key={b.id}
                      onClick={() => handleSelectBatch(b)}
                      className={`glass-panel p-4 rounded-2xl border transition-all cursor-pointer text-left relative flex justify-between items-center ${isSelected ? 'border-blue-500/40 bg-blue-500/5 shadow-md' : 'border-zinc-800 hover:border-zinc-700/80'}`}
                    >
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-white font-outfit truncate">{b.name}</h4>
                        <p className="text-[10px] text-zinc-400 font-semibold font-sans mt-0.5 truncate">{b.courses?.title}</p>
                        <div className="flex gap-3 text-[9px] text-zinc-500 font-semibold mt-2.5">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {b.schedule?.time}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {b.schedule?.days?.slice(0, 2).join(', ')}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-zinc-500" />
                    </div>
                  );
                })
              ) : (
                <div className="glass-panel p-8 text-center rounded-xl border border-zinc-850">
                  <Layers className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                  <p className="text-xs text-zinc-500">Create a batch cohort to begin.</p>
                </div>
              )}
            </div>

          </div>

          {/* RIGHT COLUMN: Settings Form & Sub-element Adders (Colspan 7/12) */}
          <div className="lg:col-span-7">
            {selectedBatch ? (
              <div className="space-y-6">
                
                {/* Batch Config Form */}
                <form onSubmit={handleUpdateBatch} className="glass-panel rounded-2xl p-6 border border-zinc-800 space-y-5 relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-royal" />
                  
                  <div className="flex justify-between items-center pb-3 border-b border-zinc-850">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-blue-400 font-outfit">Cohort Configuration</h3>
                    <span className="text-[10px] text-zinc-500 font-semibold">Schedule & capacity</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Cohort Name</label>
                      <input
                        type="text"
                        value={batchName}
                        onChange={(e) => setBatchName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl glass-input text-xs font-sans text-white focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Target Course</label>
                      <select
                        value={targetCourse}
                        onChange={(e) => setTargetCourse(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl glass-input text-xs font-sans text-zinc-300 focus:outline-none bg-obsidian"
                      >
                        {courses.map((c) => (
                          <option key={c.id} value={c.id} className="bg-obsidian">{c.title}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Start Date</label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl glass-input text-xs font-sans text-white focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">End Date</label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl glass-input text-xs font-sans text-white focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Capacity</label>
                      <input
                        type="number"
                        value={capacity}
                        onChange={(e) => setCapacity(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl glass-input text-xs font-sans text-white focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  {/* Weekday picker */}
                  <div className="space-y-3">
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-outfit">Weekly Lecture Days</label>
                    <div className="flex flex-wrap gap-2">
                      {weekdays.map((day) => {
                        const isChosen = days.includes(day);
                        return (
                          <button
                            type="button"
                            key={day}
                            onClick={() => toggleDay(day)}
                            className={`px-3 py-1.5 rounded-lg border text-[10px] font-semibold font-outfit transition-all cursor-pointer ${isChosen ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-zinc-950/40 text-zinc-500 border-zinc-850 hover:text-zinc-300'}`}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Lecture Time (HH:MM)</label>
                      <input
                        type="text"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        placeholder="18:00"
                        className="w-full px-3 py-2 rounded-xl glass-input text-xs font-sans text-white focus:outline-none"
                        required
                      />
                    </div>
                    
                    <div className="text-[10px] text-zinc-500 pt-5 leading-normal">
                      🕒 Lectures default to local timezone. Instant WebSockets channels broadcast codes to enrollees matching coordinates.
                    </div>
                  </div>

                  {saveSuccess && (
                    <div className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl flex items-center gap-2 font-semibold">
                      <CheckCircle2 className="w-4 h-4" />
                      Batch cohort parameters updated successfully!
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full py-3 rounded-xl bg-gradient-royal text-white text-xs font-semibold hover:opacity-95 shadow transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Save Cohort parameters
                  </button>
                </form>

                {/* Cohort enrollees checklist */}
                <div className="glass-panel rounded-2xl p-6 border border-zinc-800 space-y-4 shadow">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-teal-400 font-outfit flex items-center gap-2">
                    <Users className="w-4 h-4 text-teal-400" />
                    Active Cohort Enrollees checklist ({enrollees.length})
                  </h3>

                  <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                    {loadingEnrollees ? (
                      <div className="h-10 bg-zinc-900 rounded animate-pulse" />
                    ) : enrollees.length > 0 ? (
                      enrollees.map((enr, idx) => (
                        <div key={idx} className="flex justify-between items-center p-3 rounded-xl bg-zinc-950/40 border border-zinc-850/80 text-xs">
                          <div>
                            <span className="font-semibold text-white block">{enr.profiles?.full_name}</span>
                            <span className="text-[9px] text-zinc-500 mt-0.5 block">{enr.profiles?.phone || 'StudyOrbit Cohort Member'}</span>
                          </div>
                          
                          <span className={`text-[9px] px-2 py-0.5 rounded border uppercase tracking-wider font-bold ${enr.fee_status?.paid ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-amber-400 bg-amber-500/10 border-amber-500/20'}`}>
                            {enr.fee_status?.paid ? 'Fee Settled' : 'Installments Pending'}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-[10px] text-zinc-500 italic py-4 text-center">No students enrolled in this cohort yet.</p>
                    )}
                  </div>
                </div>

              </div>
            ) : (
              <div className="glass-panel rounded-2xl p-12 text-center shadow border border-zinc-850">
                <Layers className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                <h3 className="text-base font-bold text-white font-outfit">Select a Cohort</h3>
                <p className="text-xs text-zinc-500 mt-1">Select an active cohort from the sidebar slots list to inspect schedules and student checklists.</p>
              </div>
            )}
          </div>

        </div>

      </div>
    </PortalShell>
  );
}
