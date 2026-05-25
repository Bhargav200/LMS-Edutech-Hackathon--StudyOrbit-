'use client';

import { useState, useEffect } from 'react';
import PortalShell from '@/components/PortalShell';
import { supabase } from '@/lib/supabaseClient';
import { 
  Palette, Orbit, Save, CheckCircle2, Sliders, 
  MapPin, Bell, ShieldCheck, ChevronRight, Activity, 
  Clock, Sparkles, Layout, FileText
} from 'lucide-react';

export default function AdminBranding() {
  const [institute, setInstitute] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Forms state
  const [instName, setInstName] = useState('Quantum Academics');
  const [primaryColor, setPrimaryColor] = useState('#2563EB');
  const [secondaryColor, setSecondaryColor] = useState('#7C3AED');
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [attThreshold, setAttThreshold] = useState<number>(75);
  const [checkInMethod, setCheckInMethod] = useState('code');
  
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    async function loadBranding() {
      setLoading(true);
      // Fetch default institute config
      const instId = '11111111-1111-1111-1111-111111111111';
      const { data, error } = await supabase
        .from('institutes')
        .select('*')
        .eq('id', instId)
        .single();

      if (error) {
        console.error('Error loading institute branding:', error);
        // Robust fallbacks to prevent blank states
        setInstName('Quantum Academics');
        setPrimaryColor('#2563EB');
        setSecondaryColor('#7C3AED');
        setTimezone('Asia/Kolkata');
        setAttThreshold(75);
        setCheckInMethod('code');
      } else if (data) {
        setInstitute(data);
        setInstName(data.name);
        setPrimaryColor(data.primary_color || '#2563EB');
        setSecondaryColor(data.secondary_color || '#7C3AED');
        setTimezone(data.timezone || 'UTC');
        setAttThreshold(data.settings?.attendance_threshold || 75);
        setCheckInMethod(data.settings?.check_in_method || 'code');
      }
      setLoading(false);
    }
    loadBranding();
  }, []);

  const handleSaveBranding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);

    try {
      const instId = '11111111-1111-1111-1111-111111111111';
      const { error } = await supabase
        .from('institutes')
        .update({
          name: instName,
          primary_color: primaryColor,
          secondary_color: secondaryColor,
          timezone: timezone,
          settings: {
            attendance_threshold: attThreshold,
            check_in_method: checkInMethod,
            default_language: 'en'
          }
        })
        .eq('id', instId);

      if (error) throw error;

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err: any) {
      console.error('Error saving branding configs:', err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <PortalShell>
      <div className="space-y-8 relative">
        
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold font-outfit text-white">White-Label Branding Settings</h2>
            <p className="text-sm text-zinc-400 mt-1 font-sans leading-normal">
              Customize portal palettes, timezone metrics, attendance check-in rules, and preview mock live layouts.
            </p>
          </div>
        </div>

        {/* Dynamic Dual-Pane Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Customizer Form (Colspan 7/12) */}
          <form onSubmit={handleSaveBranding} className="lg:col-span-7 glass-panel rounded-2xl p-6 border border-zinc-800 space-y-6 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-royal" />
            
            <div className="flex justify-between items-center pb-3 border-b border-zinc-850">
              <h3 className="text-sm font-bold uppercase tracking-wider text-blue-400 font-outfit">Branding Engine</h3>
              <span className="text-[10px] text-zinc-500 font-semibold">Tenancy parameters</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Institute Name</label>
                <input
                  type="text"
                  value={instName}
                  onChange={(e) => setInstName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs font-sans text-white focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Local Timezone</label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs font-sans text-zinc-300 focus:outline-none bg-obsidian"
                >
                  <option value="UTC" className="bg-obsidian">UTC (Universal)</option>
                  <option value="Asia/Kolkata" className="bg-obsidian">Asia/Kolkata (IST)</option>
                  <option value="America/New_York" className="bg-obsidian">America/New_York (EST)</option>
                  <option value="Europe/London" className="bg-obsidian">Europe/London (GMT)</option>
                </select>
              </div>
            </div>

            {/* Colors picker palette */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-xl bg-zinc-950/40 border border-zinc-850">
              <div className="space-y-2">
                <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-wider font-outfit">Primary Color Palette</label>
                <div className="flex gap-3 items-center">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-8 h-8 rounded border-0 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-24 px-2 py-1 rounded border border-zinc-800 bg-zinc-900 text-xs font-sans text-zinc-300 uppercase focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-wider font-outfit">Secondary Color Accent</label>
                <div className="flex gap-3 items-center">
                  <input
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-8 h-8 rounded border-0 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-24 px-2 py-1 rounded border border-zinc-800 bg-zinc-900 text-xs font-sans text-zinc-300 uppercase focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Attendance parameters configuration */}
            <div className="space-y-5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400 font-outfit flex items-center gap-1.5">
                <Sliders className="w-4 h-4" />
                Attendance & Verification Rules
              </h4>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-outfit">
                    Attendance Warning Threshold
                  </label>
                  <span className="text-sm font-bold font-outfit text-white">
                    {attThreshold}%
                  </span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={attThreshold}
                  onChange={(e) => setAttThreshold(Number(e.target.value))}
                  className="w-full h-1.5 rounded-lg bg-zinc-800 appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Default Class Check-In Method</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setCheckInMethod('code')}
                    className={`py-3 rounded-xl border text-xs font-bold font-outfit flex flex-col items-center gap-1.5 transition-all cursor-pointer ${checkInMethod === 'code' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-zinc-950/40 text-zinc-500 border-zinc-850'}`}
                  >
                    <Clock className="w-4 h-4" />
                    4-Digit Random Code
                  </button>
                  <button
                    type="button"
                    onClick={() => setCheckInMethod('auto')}
                    className={`py-3 rounded-xl border text-xs font-bold font-outfit flex flex-col items-center gap-1.5 transition-all cursor-pointer ${checkInMethod === 'auto' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-zinc-950/40 text-zinc-500 border-zinc-850'}`}
                  >
                    <Activity className="w-4 h-4" />
                    Auto-Webhook tracking
                  </button>
                </div>
              </div>
            </div>

            {saveSuccess && (
              <div className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl flex items-center gap-2 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                Branding properties and settings saved!
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 rounded-xl bg-gradient-royal text-white text-xs font-semibold hover:opacity-95 shadow transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              Commit Tenant Properties
            </button>
          </form>

          {/* RIGHT COLUMN: Interactive Live Mockup Card (Colspan 5/12) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="glass-panel p-4 rounded-2xl border border-zinc-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-teal-400 font-outfit flex items-center gap-2">
                <Layout className="w-4 h-4 text-teal-400" />
                Live White-Label Mockup
              </h3>
            </div>

            {/* Live Mock Card */}
            <div className="glass-panel rounded-2xl p-6 border border-zinc-800 relative overflow-hidden shadow-2xl min-h-[22rem] flex flex-col justify-between">
              
              {/* Header inside mock */}
              <div className="flex justify-between items-center pb-3 border-b border-zinc-850/80">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-lg text-white" style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}>
                    <Orbit className="w-4 h-4 animate-spin-slow" />
                  </div>
                  <span className="text-xs font-bold text-white font-outfit truncate max-w-28">{instName}</span>
                </div>
                <span className="text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider font-outfit bg-zinc-900 border border-zinc-800 text-zinc-500">
                  LMS active
                </span>
              </div>

              {/* Body inside mock */}
              <div className="py-6 space-y-4">
                <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-850 text-left space-y-2">
                  <span className="text-[8px] font-bold uppercase tracking-wider font-outfit" style={{ color: primaryColor }}>Quantum Course Player</span>
                  <h4 className="text-sm font-bold text-white font-outfit leading-tight">React & Next.js App Router Masterclass</h4>
                  <p className="text-[10px] text-zinc-400 leading-normal line-clamp-2">Learn white-label database configurations, role portals layout assembly, and Deno cert cryptographic setups.</p>
                </div>

                <div className="flex gap-3 justify-end text-xs">
                  <button 
                    type="button" 
                    className="px-3 py-1.5 rounded-lg border border-zinc-800 text-zinc-400 font-semibold text-[10px]"
                  >
                    Catalog
                  </button>
                  <button 
                    type="button" 
                    className="px-3.5 py-1.5 rounded-lg text-white font-semibold text-[10px] transition-all"
                    style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}
                  >
                    Enroll Now
                  </button>
                </div>
              </div>

              {/* Details footer inside mock */}
              <div className="flex justify-between text-[9px] text-zinc-500 font-semibold pt-2 border-t border-zinc-900/60">
                <span>Check-in: {checkInMethod === 'code' ? 'Code Entry' : 'Auto Webhook'}</span>
                <span>Threshold: {attThreshold}%</span>
              </div>

            </div>
          </div>

        </div>

      </div>
    </PortalShell>
  );
}
