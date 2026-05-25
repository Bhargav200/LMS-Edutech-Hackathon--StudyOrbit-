'use client';

import { useState, useEffect } from 'react';
import PortalShell from '@/components/PortalShell';
import AIStudyBuddy from '@/components/AIStudyBuddy';
import { supabase } from '@/lib/supabaseClient';
import { Award, Calendar, Download, Eye, Orbit, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function StudentCertificates() {
  const router = useRouter();
  const [studentId, setStudentId] = useState('f9b07384-f113-4318-f89e-4cdeee958b92');
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedId = localStorage.getItem('study_orbit_user_id') || 'f9b07384-f113-4318-f89e-4cdeee958b92';
    setStudentId(storedId);

    async function loadCertificates() {
      const { data } = await supabase
        .from('certificates')
        .select('*, courses(*)')
        .eq('student_id', storedId);
      
      if (data) setCertificates(data);
      setLoading(false);
    }
    loadCertificates();
  }, []);

  return (
    <PortalShell>
      <div className="space-y-8">
        
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold font-outfit text-white">Credentials & Certificates</h2>
          <p className="text-sm text-zinc-400 mt-1 font-sans leading-normal">
            Your verified professional credentials. Share your achievements on LinkedIn and allow recruiters to verify them.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
            <div className="glass-panel h-48 rounded-2xl" />
          </div>
        ) : certificates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {certificates.map((cert) => {
              const c = cert.courses;
              if (!c) return null;
              
              return (
                <div 
                  key={cert.id}
                  className="glass-panel rounded-2xl p-6 flex flex-col justify-between space-y-6 relative overflow-hidden shadow-lg border border-zinc-800/80 hover:border-zinc-700/80 transition-all"
                >
                  <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-royal" />
                  
                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-gradient-royal text-white w-fit shadow-lg shadow-purple-500/10">
                      <Award className="w-6 h-6 animate-pulse" />
                    </div>
                    
                    <div>
                      <h3 className="text-base font-bold text-white leading-snug font-outfit truncate">{c.title}</h3>
                      <p className="text-[10px] text-zinc-500 font-semibold font-sans mt-0.5 uppercase tracking-wider">Quantum Academics</p>
                    </div>
                  </div>

                  <div className="space-y-2 border-t border-zinc-850 pt-4">
                    <div className="flex justify-between items-center text-[10px] text-zinc-500 font-semibold font-sans">
                      <span>VERIFICATION CODE</span>
                      <span className="text-zinc-300 font-mono font-bold uppercase tracking-widest">{cert.verification_code}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-zinc-500 font-semibold font-sans">
                      <span>ISSUED ON</span>
                      <span className="text-zinc-300 font-medium">
                        {new Date(cert.issued_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => router.push(`/verify/${cert.verification_code}`)}
                      className="flex-1 py-2.5 rounded-xl border border-zinc-850 hover:border-zinc-700 hover:bg-zinc-850 bg-zinc-900/40 text-xs font-semibold text-white transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5 text-zinc-400" />
                      Verify Online
                    </button>
                    
                    <a
                      href={cert.certificate_url || 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=1200&auto=format&fit=crop&q=80'}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2.5 rounded-xl bg-gradient-royal text-white hover:opacity-95 shadow transition-all cursor-pointer flex items-center justify-center"
                      title="Download PDF"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="glass-panel rounded-2xl p-12 text-center shadow max-w-lg">
            <Award className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-outfit mb-2">No credentials issued yet</h3>
            <p className="text-xs text-zinc-500 leading-relaxed font-sans max-w-sm mx-auto">
              Once you complete **100% of your course syllabus lessons** and receive grading for all required deliverables, your certificate will automatically generate here.
            </p>
          </div>
        )}

      </div>
      <AIStudyBuddy />
    </PortalShell>
  );
}
