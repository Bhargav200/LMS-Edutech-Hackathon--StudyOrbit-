'use client';

import { useState, useEffect } from 'react';
import PortalShell from '@/components/PortalShell';
import AIStudyBuddy from '@/components/AIStudyBuddy';
import { supabase } from '@/lib/supabaseClient';
import { 
  FileText, UploadCloud, CheckCircle2, AlertCircle, Clock, 
  Sparkles, FileCode, Check, Send, Download, X 
} from 'lucide-react';

export default function StudentAssignments() {
  const [studentId, setStudentId] = useState('f9b07384-f113-4318-f89e-4cdeee958b92');
  const [assignments, setAssignments] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Upload state
  const [activeUploadAssign, setActiveUploadAssign] = useState<any>(null);
  const [textEntry, setTextEntry] = useState('');
  const [fileUrl, setFileUrl] = useState('https://ujksrvgddvetziudrljw.supabase.co/storage/v1/object/public/submissions/my_assignment.zip');
  const [submitting, setSubmitting] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  useEffect(() => {
    const storedId = localStorage.getItem('study_orbit_user_id') || 'f9b07384-f113-4318-f89e-4cdeee958b92';
    setStudentId(storedId);

    async function loadAssignments() {
      // 1. Fetch all assignments
      const { data: assignList } = await supabase
        .from('assignments')
        .select('*')
        .order('due_date', { ascending: true });
      
      if (assignList) setAssignments(assignList);

      // 2. Fetch student's submissions
      const { data: subList } = await supabase
        .from('assignment_submissions')
        .select('*')
        .eq('student_id', storedId);
      
      if (subList) setSubmissions(subList);

      setLoading(false);
    }
    loadAssignments();
  }, []);

  const getSubmissionStatus = (assignId: string) => {
    return submissions.find(s => s.assignment_id === assignId);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeUploadAssign || submitting) return;
    setSubmitting(true);

    try {
      // Upsert into assignment_submissions
      const { error: upsertErr } = await supabase
        .from('assignment_submissions')
        .upsert({
          assignment_id: activeUploadAssign.id,
          student_id: studentId,
          file_url: fileUrl,
          text_entry: textEntry,
          submitted_at: new Date().toISOString(),
          status: 'submitted',
          plagiarism_score: Math.random() * 15 // Mock plagiarism checker score!
        }, {
          onConflict: 'assignment_id,student_id'
        });

      if (upsertErr) throw upsertErr;

      // Refetch submissions
      const { data: subList } = await supabase
        .from('assignment_submissions')
        .select('*')
        .eq('student_id', studentId);
      
      if (subList) setSubmissions(subList);

      setUploadSuccess(true);
      setTextEntry('');
      setTimeout(() => {
        setUploadSuccess(false);
        setActiveUploadAssign(null);
      }, 1500);

    } catch (err: any) {
      console.error('Error uploading assignment:', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PortalShell>
      <div className="space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold font-outfit text-white">Assignment Center</h2>
            <p className="text-sm text-zinc-400 mt-1 font-sans leading-normal">
              Manage your cohort deadlines, upload deliverables, and track instructor grading remarks.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Timeline & Assignments List (Colspan 7/8) */}
          <div className="lg:col-span-7 space-y-6">
            {loading ? (
              <div className="space-y-4">
                <div className="glass-panel h-28 rounded-2xl animate-pulse" />
                <div className="glass-panel h-28 rounded-2xl animate-pulse" />
              </div>
            ) : assignments.length > 0 ? (
              <div className="space-y-4">
                {assignments.map((assign) => {
                  const sub = getSubmissionStatus(assign.id);
                  const isSubmitted = !!sub;
                  const isGraded = sub && sub.status === 'graded';
                  
                  return (
                    <div 
                      key={assign.id}
                      className="glass-panel rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative border border-zinc-800/80 hover:border-zinc-700/80 transition-all shadow-md"
                    >
                      <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase font-outfit ${isGraded ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : isSubmitted ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                            {isGraded ? 'Graded' : isSubmitted ? 'Submitted' : 'Pending'}
                          </span>
                          <span className="text-[10px] text-zinc-500 font-medium font-sans">Max Score: {assign.max_score}</span>
                        </div>

                        <h3 className="text-base font-bold text-white leading-snug font-outfit truncate">{assign.title}</h3>
                        <p className="text-xs text-zinc-400 leading-normal line-clamp-2">{assign.description}</p>
                        
                        <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-semibold font-sans mt-2">
                          <Clock className="w-3.5 h-3.5" />
                          <span>DUE: {new Date(assign.due_date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                      </div>

                      {/* CTA Panel */}
                      <div className="flex items-center justify-end w-full sm:w-auto">
                        {isGraded ? (
                          <div className="text-right">
                            <span className="text-2xl font-bold font-outfit text-emerald-400">{Number(sub.grade)}%</span>
                            <span className="block text-[8px] text-zinc-500 uppercase font-semibold">Grade Score</span>
                          </div>
                        ) : isSubmitted ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-400">
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                            Submitted
                          </span>
                        ) : (
                          <button
                            onClick={() => setActiveUploadAssign(assign)}
                            className="px-4 py-2 rounded-xl bg-gradient-royal text-white text-xs font-semibold hover:opacity-95 shadow cursor-pointer"
                          >
                            Submit Deliverable
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="glass-panel rounded-2xl p-12 text-center shadow">
                <FileText className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                <p className="text-zinc-400 text-sm">No assignments posted for your batch.</p>
              </div>
            )}
          </div>

          {/* Submission Details & Feedback Drawer (Colspan 5/12) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Uploader Box Drawer */}
            {activeUploadAssign ? (
              <div className="glass-panel rounded-2xl p-6 relative overflow-hidden shadow-xl border border-blue-500/20">
                <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-royal" />
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-blue-400 font-outfit">Submit Assignment</h3>
                  <button onClick={() => setActiveUploadAssign(null)} className="p-1 rounded hover:bg-zinc-800 text-zinc-400 cursor-pointer">
                    <X className="w-4.5 h-4.5" />
                  </button>
                </div>

                <p className="text-xs text-zinc-400 leading-snug mb-4 font-semibold font-outfit">{activeUploadAssign.title}</p>

                <form onSubmit={handleUploadSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Simulate File Upload</label>
                    <div className="p-6 rounded-xl border border-dashed border-zinc-800 bg-zinc-900/20 text-center flex flex-col items-center justify-center space-y-2">
                      <UploadCloud className="w-8 h-8 text-blue-400 animate-bounce" />
                      <p className="text-xs font-semibold text-white">my_assignment_submission.zip</p>
                      <p className="text-[10px] text-zinc-500">Simulating auto-uploading to Supabase Storage</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Submission Notes</label>
                    <textarea
                      value={textEntry}
                      onChange={(e) => setTextEntry(e.target.value)}
                      placeholder="Type any instructions or notes for your instructor..."
                      rows={3}
                      className="w-full px-3 py-2 rounded-xl glass-input text-xs font-sans"
                    />
                  </div>

                  {uploadSuccess && (
                    <div className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Assignment successfully submitted!
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 rounded-xl bg-gradient-royal text-white text-xs font-semibold hover:opacity-95 shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : 'Upload & Submit'}
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            ) : (
              /* Graded submissions reports view */
              <div className="glass-panel rounded-2xl p-6 shadow-lg">
                <h3 className="text-sm font-bold uppercase tracking-wider text-teal-400 font-outfit mb-4">Grading & Feedback Reports</h3>
                
                {submissions.filter(s => s.status === 'graded').length > 0 ? (
                  <div className="space-y-4">
                    {submissions.filter(s => s.status === 'graded').map((sub) => {
                      const assign = assignments.find(a => a.id === sub.assignment_id);
                      return (
                        <div key={sub.id} className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-4">
                          <div className="flex justify-between items-center pb-2.5 border-b border-zinc-800/80">
                            <div>
                              <h4 className="text-xs font-bold text-white font-outfit">{assign?.title}</h4>
                              <p className="text-[10px] text-zinc-500 mt-0.5">Submitted deliverables ZIP</p>
                            </div>
                            <span className="text-lg font-bold font-outfit text-emerald-400">{Number(sub.grade)}/100</span>
                          </div>

                          <div className="space-y-1">
                            <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-outfit">Plagiarism Scan</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-white">{Number(sub.plagiarism_score).toFixed(1)}% Match</span>
                              <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">SAFE</span>
                            </div>
                          </div>

                          <div className="space-y-1 bg-zinc-950/40 p-3 rounded-lg border border-zinc-800/50">
                            <span className="block text-[10px] font-bold text-blue-400 uppercase tracking-wider font-outfit flex items-center gap-1">
                              <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
                              Dr. Aris Thorne feedback
                            </span>
                            <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">{sub.feedback}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <AlertCircle className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                    <p className="text-xs text-zinc-500">Submit pending tasks to receive marks & feedback.</p>
                  </div>
                )}
              </div>
            )}

          </div>

        </div>

      </div>
      <AIStudyBuddy />
    </PortalShell>
  );
}
