'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Award, ShieldCheck, Calendar, Globe, ArrowLeft, Download, Orbit, Sparkles } from 'lucide-react';

export default function PublicVerification() {
  const params = useParams();
  const router = useRouter();
  const certCode = params.certificateId as string;
  const [cert, setCert] = useState<any>(null);
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadVerification() {
      // Query certificates using verification_code
      const { data: certData } = await supabase
        .from('certificates')
        .select('*, courses(*)')
        .eq('verification_code', certCode)
        .single();
      
      if (certData) {
        setCert(certData);
        
        // Fetch student profile details
        const { data: prof } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', certData.student_id)
          .single();
        
        if (prof) setStudent(prof);
      }
      setLoading(false);
    }

    if (certCode) {
      loadVerification();
    }
  }, [certCode]);

  return (
    <div className="min-h-screen bg-obsidian text-zinc-300 font-sans flex flex-col justify-between items-center relative overflow-hidden py-12 px-4 select-none">
      
      {/* Background glowing rings */}
      <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] rounded-full bg-blue-600/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] rounded-full bg-purple-600/5 blur-[120px] pointer-events-none" />

      {/* Header logo */}
      <header className="w-full max-w-4xl flex items-center justify-between z-10 mb-8 pb-6 border-b border-zinc-800/80">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-gradient-royal text-white shadow shadow-purple-500/20">
            <Orbit className="w-4.5 h-4.5 animate-spin-slow" />
          </div>
          <span className="text-base font-bold font-outfit text-white tracking-tight">
            Study<span className="text-gradient">Orbit</span> Verification
          </span>
        </div>

        <button 
          onClick={() => router.push('/')}
          className="text-xs text-zinc-400 hover:text-white font-semibold flex items-center gap-1 cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-4.5 h-4.5" />
          Back to Portal
        </button>
      </header>

      {/* Main Core Display */}
      {loading ? (
        <div className="w-full max-w-4xl glass-panel h-96 rounded-2xl animate-pulse z-10" />
      ) : cert ? (
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 z-10">
          
          {/* Left Column: Framed Certificate mockup (Colspan 7/12) */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            {/* Elegant Framed Gold-bordered Certificate card */}
            <div className="relative aspect-[4/3] w-full border-4 border-[#D4AF37] bg-zinc-950 p-6 md:p-8 flex flex-col justify-between text-center shadow-2xl overflow-hidden rounded-lg">
              
              {/* Glowing watermark */}
              <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                <Award className="w-60 h-60 text-white" />
              </div>

              {/* Gold corners */}
              <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#D4AF37]" />
              <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#D4AF37]" />
              <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#D4AF37]" />
              <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#D4AF37]" />

              <div className="space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#D4AF37] font-outfit">Quantum Academics</span>
                <h3 className="text-xl md:text-2xl font-extrabold text-white font-outfit uppercase tracking-wider">Certificate of Completion</h3>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-zinc-500 italic font-sans">This credential certifies that</span>
                <p className="text-lg md:text-xl font-bold text-[#D4AF37] font-outfit">{student?.full_name}</p>
                <span className="text-[10px] text-zinc-500 italic font-sans block">has successfully engineering and mastered syllabus targets for</span>
                <p className="text-xs md:text-sm font-semibold text-white max-w-md mx-auto leading-relaxed font-sans">{cert.courses?.title}</p>
              </div>

              <div className="flex justify-between items-center border-t border-zinc-800/80 pt-4 text-left">
                <div className="text-[8px] space-y-0.5 text-zinc-500 font-sans">
                  <span className="block font-bold">ISSUED DATE:</span>
                  <span className="text-zinc-400 font-medium">
                    {new Date(cert.issued_at).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                
                <div className="text-[8px] text-right space-y-0.5 text-zinc-500 font-sans">
                  <span className="block font-bold">CREDENTIAL CODE:</span>
                  <span className="text-zinc-400 font-mono font-bold">{cert.verification_code}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Verification Stats (Colspan 5/12) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            
            {/* Status Panel */}
            <div className="glass-panel rounded-2xl p-6 relative overflow-hidden shadow-lg border border-zinc-800">
              <div className="absolute top-0 left-0 w-full h-[4px] bg-emerald-500" />
              
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <ShieldCheck className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-semibold">VERIFICATION LEDGER</span>
                  <h4 className="text-sm font-bold text-white font-outfit">Status: Active & Verified</h4>
                </div>
              </div>

              <p className="text-xs text-zinc-400 leading-relaxed font-sans mb-4">
                This professional credential was cryptographically signed by Quantum Academics and stored securely in the StudyOrbit ledger on {new Date(cert.issued_at).toLocaleDateString()}.
              </p>

              <div className="space-y-2 pt-4 border-t border-zinc-800/80 font-sans">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-500">Program Graduate:</span>
                  <span className="text-white font-semibold">{student?.full_name}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-500">Institution:</span>
                  <span className="text-white font-semibold">Quantum Academics</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-500">Academic Code:</span>
                  <span className="text-zinc-300 font-mono font-bold">{cert.verification_code}</span>
                </div>
              </div>
            </div>

            {/* Actions for recruiters */}
            <div className="flex gap-4">
              <a 
                href={cert.certificate_url || '#'} 
                target="_blank" 
                rel="noreferrer"
                className="flex-1 py-3 rounded-xl bg-gradient-royal text-white text-xs font-bold hover:opacity-95 shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Download PDF Copy
              </a>
            </div>

          </div>

        </div>
      ) : (
        <div className="glass-panel rounded-2xl p-12 text-center shadow max-w-md z-10 space-y-4">
          <Award className="w-12 h-12 text-rose-400 mx-auto animate-bounce" />
          <h3 className="text-base font-bold text-white font-outfit uppercase tracking-wider">Invalid Credential</h3>
          <p className="text-xs text-zinc-500 leading-relaxed font-sans max-w-sm">
            We were unable to locate any StudyOrbit certificate matching the verification token **{certCode}**. Please verify the link.
          </p>
        </div>
      )}

      {/* Footer copyright */}
      <footer className="w-full text-center text-[10px] text-zinc-600 font-sans mt-12 z-10 border-t border-zinc-850/80 pt-4 max-w-4xl">
        © 2026 StudyOrbit Inc. Cryptographic database credentials ledger. All rights reserved.
      </footer>

    </div>
  );
}
