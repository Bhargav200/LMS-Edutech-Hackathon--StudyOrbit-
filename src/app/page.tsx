'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, BookOpen, GraduationCap, Users, ArrowRight, Activity, Sparkles, Orbit, Sun, Moon } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const savedTheme = (localStorage.getItem('study_orbit_theme') as 'dark' | 'light') || 'dark';
    setTheme(savedTheme);
    if (savedTheme === 'light') {
      document.documentElement.classList.add('light-mode');
    } else {
      document.documentElement.classList.remove('light-mode');
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('study_orbit_theme', nextTheme);
    if (nextTheme === 'light') {
      document.documentElement.classList.add('light-mode');
    } else {
      document.documentElement.classList.remove('light-mode');
    }
  };

  const demoUsers = [
    {
      name: 'Sarah Chen',
      role: 'admin',
      email: 'sarah@quantum.edu',
      desc: 'Institute Director',
      icon: Shield,
      color: 'from-blue-500 to-indigo-600',
      target: '/admin/dashboard',
      id: 'd3b07384-d113-4318-a89e-4cdeee958b90'
    },
    {
      name: 'Dr. Aris Thorne',
      role: 'faculty',
      email: 'aris@quantum.edu',
      desc: 'Lead Faculty',
      icon: GraduationCap,
      color: 'from-purple-500 to-pink-600',
      target: '/faculty/dashboard',
      id: 'e9b07384-e113-4318-e89e-4cdeee958b91'
    },
    {
      name: 'Rohan Sharma',
      role: 'student',
      email: 'rohan@quantum.edu',
      desc: 'Cohort Student',
      icon: BookOpen,
      color: 'from-teal-400 to-emerald-600',
      target: '/student/dashboard',
      id: 'f9b07384-f113-4318-f89e-4cdeee958b92'
    },
    {
      name: 'Meera Sharma',
      role: 'parent',
      email: 'meera@quantum.edu',
      desc: 'Engaged Parent',
      icon: Users,
      color: 'from-amber-400 to-orange-600',
      target: '/parent/dashboard',
      id: 'a9b07384-a113-4318-a89e-4cdeee958b93'
    }
  ];

  const handleDemoLogin = (user: typeof demoUsers[0]) => {
    setLoading(true);
    setError('');
    
    // Save credentials locally for seamless cross-component mock session tracking
    localStorage.setItem('study_orbit_user_id', user.id);
    localStorage.setItem('study_orbit_user_email', user.email);
    localStorage.setItem('study_orbit_user_name', user.name);
    localStorage.setItem('study_orbit_user_role', user.role);
    
    setTimeout(() => {
      setLoading(false);
      router.push(user.target);
    }, 800);
  };

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError('');

    // Check if entered email matches any demo users to log them in automatically
    const matched = demoUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (matched) {
      localStorage.setItem('study_orbit_user_id', matched.id);
      localStorage.setItem('study_orbit_user_email', matched.email);
      localStorage.setItem('study_orbit_user_name', matched.name);
      localStorage.setItem('study_orbit_user_role', matched.role);
      
      setTimeout(() => {
        setLoading(false);
        router.push(matched.target);
      }, 800);
    } else {
      // Bypasses for demo sandbox ease: grant admin access for other custom emails
      localStorage.setItem('study_orbit_user_id', 'd3b07384-d113-4318-a89e-4cdeee958b90');
      localStorage.setItem('study_orbit_user_email', email);
      localStorage.setItem('study_orbit_user_name', email.split('@')[0]);
      localStorage.setItem('study_orbit_user_role', 'admin');
      
      setTimeout(() => {
        setLoading(false);
        router.push('/admin/dashboard');
      }, 800);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center relative overflow-hidden bg-obsidian px-4 py-8">
      {/* Top right floating theme switcher */}
      <div className="absolute top-6 right-6 z-20">
        <button 
          onClick={toggleTheme}
          className="p-3 rounded-xl glass-panel text-zinc-400 hover:text-white transition-colors cursor-pointer flex items-center gap-2 text-xs font-semibold font-outfit"
        >
          {theme === 'light' ? (
            <>
              <Moon className="w-4 h-4 text-slate-800" />
              Dark Mode
            </>
          ) : (
            <>
              <Sun className="w-4 h-4 text-amber-400" />
              Light Mode
            </>
          )}
        </button>
      </div>

      {/* Decorative ambient glowing lights */}
      <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] rounded-full bg-purple-600/10 blur-[120px] pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 z-10">
        
        {/* Left Grid: Rebranding details & Wow Factor introduction */}
        <div className="lg:col-span-5 flex flex-col justify-center text-left space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/5 w-fit">
            <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
            <span className="text-xs font-semibold text-blue-400 tracking-wider uppercase font-outfit">SaaS EdTech Platform</span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-3 h-16">
              <img 
                src={theme === 'light' ? "/logos/light/logo.png" : "/logos/dark/logo.png"} 
                alt="StudyOrbit Logo" 
                className="h-12 w-auto object-contain transition-all"
              />
            </div>
            <p className="text-lg text-zinc-400 leading-relaxed font-sans mt-4">
              A unified operating system replacing disconnected classroom tooling. Consolidates curriculum delivery, mock live classes, auto-grading, dynamic fees, and parents communication metrics.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-800">
            <div className="flex flex-col">
              <span className="text-2xl font-bold font-outfit text-white">60%</span>
              <span className="text-xs text-zinc-500">Less Administration</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold font-outfit text-white">35%</span>
              <span className="text-xs text-zinc-500">Higher Engagement</span>
            </div>
          </div>
        </div>

        {/* Right Grid: Login & Demo Selector */}
        <div className="lg:col-span-7 flex flex-col space-y-6">
          {/* Glassmorphic Login Card */}
          <div className="glass-panel rounded-2xl p-8 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-royal" />
            
            <h2 className="text-2xl font-bold text-white font-outfit mb-2">Welcome Back</h2>
            <p className="text-sm text-zinc-400 mb-6">Enter your credentials or use the demo login panel below for instant evaluation access.</p>

            <form onSubmit={handleCustomLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@institute.edu"
                  className="w-full px-4 py-3 rounded-xl glass-input text-sm font-sans"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider">Password</label>
                  <a href="#" className="text-xs text-blue-400 hover:underline">Forgot password?</a>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl glass-input text-sm font-sans"
                />
              </div>

              {error && (
                <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-royal text-white text-sm font-semibold hover:opacity-95 transition-all shadow-lg shadow-blue-500/15 flex items-center justify-center gap-2 mt-4 cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Evaluation Quick Demo Login Switcher */}
          <div className="glass-panel rounded-2xl p-6 relative">
            <h3 className="text-sm font-bold uppercase tracking-wider text-blue-400 font-outfit mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 animate-pulse" />
              Interactive Demo Login (Evaluator Panel)
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {demoUsers.map((user) => {
                const IconComponent = user.icon;
                return (
                  <button
                    key={user.email}
                    onClick={() => handleDemoLogin(user)}
                    disabled={loading}
                    className="flex items-center gap-4 p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-800/40 hover:border-zinc-700 transition-all text-left group cursor-pointer disabled:opacity-50"
                  >
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${user.color} text-white shadow-md`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors truncate">
                        {user.name}
                      </h4>
                      <p className="text-xs text-zinc-500 truncate">{user.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
