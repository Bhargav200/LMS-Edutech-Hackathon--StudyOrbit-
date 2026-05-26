'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Shield, BookOpen, GraduationCap, Users, ArrowRight, Activity, 
  Sparkles, Orbit, Sun, Moon, Play, CheckCircle2, TrendingUp, 
  BarChart3, UserPlus, Menu, X, Lock, Check, Mail, Award, Clock,
  Coins
} from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  
  // Interactive modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<'demo' | 'custom'>('demo');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const updateFavicon = (activeTheme: 'dark' | 'light') => {
    if (typeof window === 'undefined') return;
    const iconPath = activeTheme === 'light' ? "/logos/dark/icon.png" : "/logos/light/icon.png";
    const links = document.querySelectorAll("link[rel*='icon']");
    if (links.length > 0) {
      links.forEach((link: any) => {
        link.href = iconPath;
      });
    } else {
      const link = document.createElement('link');
      link.rel = 'shortcut icon';
      link.type = 'image/png';
      link.href = iconPath;
      document.head.appendChild(link);
    }
  };

  useEffect(() => {
    const savedTheme = (localStorage.getItem('study_orbit_theme') as 'dark' | 'light') || 'dark';
    setTheme(savedTheme);
    updateFavicon(savedTheme);
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
    updateFavicon(nextTheme);
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
      email: 'sarah@studyorbit.com',
      desc: 'Institute Director',
      icon: Shield,
      color: 'from-blue-500 to-indigo-600',
      textColor: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
      target: '/admin/dashboard',
      id: 'd3b07384-d113-4318-a89e-4cdeee958b90'
    },
    {
      name: 'Dr. Aris Thorne',
      role: 'faculty',
      email: 'aris@studyorbit.com',
      desc: 'Lead Faculty Coordinator',
      icon: GraduationCap,
      color: 'from-purple-500 to-pink-600',
      textColor: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20',
      target: '/faculty/dashboard',
      id: 'e9b07384-e113-4318-e89e-4cdeee958b91'
    },
    {
      name: 'Rohan Sharma',
      role: 'student',
      email: 'rohan@studyorbit.com',
      desc: 'Cohort Software Engineer',
      icon: BookOpen,
      color: 'from-emerald-400 to-teal-600',
      textColor: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
      target: '/student/dashboard',
      id: 'f9b07384-f113-4318-f89e-4cdeee958b92'
    },
    {
      name: 'Meera Sharma',
      role: 'parent',
      email: 'meera@studyorbit.com',
      desc: 'Engaged Parent Advocate',
      icon: Users,
      color: 'from-amber-400 to-orange-600',
      textColor: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20',
      target: '/parent/dashboard',
      id: 'a9b07384-a113-4318-a89e-4cdeee958b93'
    }
  ];

  const handleDemoLogin = (user: typeof demoUsers[0]) => {
    setLoading(true);
    setError('');
    setSelectedUser(user.email);
    
    localStorage.setItem('study_orbit_user_id', user.id);
    localStorage.setItem('study_orbit_user_email', user.email);
    localStorage.setItem('study_orbit_user_name', user.name);
    localStorage.setItem('study_orbit_user_role', user.role);
    
    setTimeout(() => {
      setLoginSuccess(true);
      setTimeout(() => {
        setLoading(false);
        setIsModalOpen(false);
        router.push(user.target);
      }, 500);
    }, 1000);
  };

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all credentials fields.');
      return;
    }

    setLoading(true);
    setError('');

    const matched = demoUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (matched) {
      localStorage.setItem('study_orbit_user_id', matched.id);
      localStorage.setItem('study_orbit_user_email', matched.email);
      localStorage.setItem('study_orbit_user_name', matched.name);
      localStorage.setItem('study_orbit_user_role', matched.role);
      
      setTimeout(() => {
        setLoginSuccess(true);
        setTimeout(() => {
          setLoading(false);
          setIsModalOpen(false);
          router.push(matched.target);
        }, 500);
      }, 1000);
    } else {
      setTimeout(() => {
        setLoading(false);
        setError('Invalid credentials. Please log in using a registered StudyOrbit account (e.g., sarah@studyorbit.com or rohan@studyorbit.com).');
      }, 1000);
    }
  };

  return (
    <div className={`min-h-screen bg-obsidian text-zinc-100 font-sans selection:bg-blue-500/30 transition-colors duration-300 ${theme === 'light' ? 'light-mode' : ''}`}>
      
      {/* Dynamic Glowing Radial Lights */}
      <div className="absolute top-0 left-1/4 w-[50rem] h-[50rem] rounded-full bg-blue-600/5 blur-[140px] pointer-events-none z-0" />
      <div className="absolute top-1/3 right-1/4 w-[40rem] h-[40rem] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none z-0" />
      
      {/* Floating Evaluator Sticky Portal Badge */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => {
            setModalTab('demo');
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-royal text-white font-outfit text-sm font-bold shadow-[0_8px_30px_rgb(37,99,235,0.3)] hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer border border-blue-400/20"
        >
          <Sparkles className="w-4 h-4 animate-spin-slow" />
          <span>Quick Login Panel</span>
        </button>
      </div>

      {/* Header */}
      <header className="flex justify-between items-center w-full px-6 md:px-12 h-20 fixed top-0 z-40 bg-zinc-950/80 dark:bg-[#0B0F19]/85 backdrop-blur-xl border-b border-zinc-900 transition-all duration-300">
        <div className="flex items-center gap-12 max-w-7xl mx-auto w-full justify-between">
          <div className="flex items-center gap-12">
            <a className="flex items-center" href="#">
              <img 
                alt="StudyOrbit Logo" 
                className="h-10 block dark:hidden" 
                src="/logos/dark/logo.png"
              />
              <img 
                alt="StudyOrbit Logo" 
                className="h-10 hidden dark:block" 
                src="/logos/light/logo.png"
              />
            </a>
            
            <nav className="hidden md:flex items-center gap-8 ml-4">
              <a className="text-sm font-medium text-zinc-400 hover:text-white transition-colors" href="#features">Features</a>
              <a className="text-sm font-medium text-zinc-400 hover:text-white transition-colors" href="#solutions">Solutions</a>
              <a className="text-sm font-medium text-zinc-400 hover:text-white transition-colors" href="#impact">Impact</a>
              <a className="text-sm font-medium text-zinc-400 hover:text-white transition-colors" href="#about">About</a>
            </nav>
          </div>
          
          <div className="flex items-center gap-6">
            <button 
              onClick={toggleTheme}
              aria-label="Toggle Theme" 
              className="p-2.5 rounded-xl hover:bg-zinc-900 border border-zinc-850 hover:border-zinc-800 text-zinc-400 hover:text-white transition-all flex items-center justify-center cursor-pointer"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-amber-400" />}
            </button>
            
            <div className="hidden sm:flex items-center gap-4">
              <button 
                onClick={() => {
                  setModalTab('custom');
                  setIsModalOpen(true);
                }}
                className="text-sm font-semibold text-zinc-300 px-5 py-2.5 rounded-xl hover:bg-zinc-900/50 hover:text-white transition-all cursor-pointer"
              >
                Log In
              </button>
              <button 
                onClick={() => {
                  setModalTab('demo');
                  setIsModalOpen(true);
                }}
                className="text-sm font-bold bg-gradient-royal text-white px-5 py-2.5 rounded-xl hover:shadow-lg hover:shadow-blue-500/20 active:scale-[0.98] transition-all cursor-pointer border border-blue-400/10"
              >
                Evaluator Portal
              </button>
            </div>
            
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex items-center justify-center p-2.5 rounded-xl hover:bg-zinc-900 text-zinc-400"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="fixed top-20 left-0 w-full bg-zinc-950/95 border-b border-zinc-900 py-6 px-8 flex flex-col gap-6 z-30 md:hidden animate-fade-in">
          <a onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium text-zinc-300 hover:text-white transition-colors" href="#features">Features</a>
          <a onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium text-zinc-300 hover:text-white transition-colors" href="#solutions">Solutions</a>
          <a onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium text-zinc-300 hover:text-white transition-colors" href="#impact">Impact</a>
          <a onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium text-zinc-300 hover:text-white transition-colors" href="#about">About</a>
          <div className="h-[1px] bg-zinc-900 my-2" />
          <div className="flex flex-col gap-4">
            <button 
              onClick={() => {
                setMobileMenuOpen(false);
                setModalTab('custom');
                setIsModalOpen(true);
              }}
              className="w-full py-3 rounded-xl border border-zinc-800 hover:border-zinc-700 bg-zinc-900/30 text-white font-semibold text-center"
            >
              Log In
            </button>
            <button 
              onClick={() => {
                setMobileMenuOpen(false);
                setModalTab('demo');
                setIsModalOpen(true);
              }}
              className="w-full py-3 rounded-xl bg-gradient-royal text-white font-bold text-center"
            >
              Evaluator Access
            </button>
          </div>
        </div>
      )}

      {/* Main Page Body Content */}
      <main className="pt-20 relative z-10">
        
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-12 pb-24 md:py-32 px-6 md:px-12 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Headline */}
            <div className="lg:col-span-6 space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/5 text-blue-400 border border-blue-500/10 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
                <span className="font-outfit uppercase tracking-widest text-[10px] font-bold">Empowering Global Learning</span>
              </div>
              
              <h1 className="font-outfit text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] tracking-tight">
                Scale your training business with <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">Zero hassle</span>
              </h1>
              
              <p className="text-zinc-400 text-base md:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Deliver transformative learning experiences, convert insights into growth, and build lasting institutional excellence—all under your brand name **StudyOrbit**.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                <button 
                  onClick={() => {
                    setModalTab('demo');
                    setIsModalOpen(true);
                  }}
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-royal hover:opacity-95 text-white rounded-xl font-bold shadow-lg shadow-blue-500/10 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                >
                  Get Started Free
                </button>
                <button 
                  onClick={() => {
                    setModalTab('demo');
                    setIsModalOpen(true);
                  }}
                  className="w-full sm:w-auto px-8 py-4 border border-zinc-800 hover:border-zinc-700 bg-zinc-900/10 hover:bg-zinc-900/40 text-zinc-300 hover:text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current text-blue-400" /> Watch Video
                </button>
              </div>
              
              {/* Reviews metadata */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 pt-6 opacity-60">
                <div className="flex items-center gap-1.5">
                  <span className="text-amber-400 font-bold">★ ★ ★ ★ ★</span>
                  <span className="text-xs font-bold text-zinc-300">(4.8/5)</span>
                </div>
                <span className="h-4 w-[1px] bg-zinc-800 hidden sm:block"></span>
                <div className="flex gap-4 text-xs font-semibold text-zinc-400">
                  <span>Capterra Best Utility</span>
                  <span>G2 Leader 2026</span>
                </div>
              </div>
            </div>
            
            {/* Right Column: Visual Mockup */}
            <div className="lg:col-span-6 relative mt-8 lg:mt-0">
              <div className="absolute -inset-8 bg-gradient-to-tr from-blue-600/10 to-purple-600/5 rounded-full blur-3xl opacity-30 animate-pulse pointer-events-none" />
              
              <div className="relative glass-panel p-3 rounded-2xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] border border-zinc-850">
                {/* Visual interface representation */}
                <div className="relative rounded-xl overflow-hidden aspect-video bg-zinc-950">
                  <div className="absolute inset-0 bg-cover bg-center mix-blend-luminosity opacity-40" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1200&q=80')" }} />
                  
                  {/* Glowing Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
                  
                  {/* Decorative Dashboard Visual Nodes */}
                  <div className="absolute top-6 left-6 p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 backdrop-blur-md space-y-2 max-w-xs shadow-xl">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <p className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest font-outfit">Active Dashboard</p>
                    </div>
                    <p className="text-xs text-white font-bold font-outfit">Advanced Full-Stack Engineering</p>
                    <div className="w-24 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="w-[75%] h-full bg-blue-500 rounded-full" />
                    </div>
                  </div>
                  
                  {/* Centered Mock Play Button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button 
                      onClick={() => {
                        setModalTab('demo');
                        setIsModalOpen(true);
                      }}
                      className="p-5 rounded-full bg-blue-600 text-white shadow-xl shadow-blue-500/20 hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer"
                    >
                      <Play className="w-6 h-6 fill-current ml-0.5" />
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Mini Floating Widget: Retention Ratio */}
              <div className="absolute -bottom-6 -left-6 bg-zinc-900 border border-zinc-800 p-4 rounded-xl shadow-2xl hidden md:block backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white font-outfit">98% Retention</p>
                    <p className="text-[9px] text-zinc-500 font-semibold uppercase tracking-wider font-sans">Institutional ROI</p>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </section>

        {/* Logo Strip */}
        <section className="py-8 border-y border-zinc-900 bg-zinc-950/40">
          <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center justify-between gap-6">
            <p className="font-outfit text-xs uppercase tracking-[0.2em] text-zinc-500 whitespace-nowrap">Trusted by 500+ global brands</p>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-30">
              <span className="font-outfit font-black text-white text-lg tracking-wider">GOOGLE</span>
              <span className="font-outfit font-black text-white text-lg tracking-wider">AMAZON</span>
              <span className="font-outfit font-black text-white text-lg tracking-wider">IBM CLOUD</span>
              <span className="font-outfit font-black text-white text-lg tracking-wider">NETFLIX</span>
              <span className="font-outfit font-black text-white text-lg tracking-wider">ZILLOW</span>
            </div>
          </div>
        </section>

        {/* Feature Grid: Integrated Training Suite */}
        <section className="py-20 md:py-32 px-6 max-w-7xl mx-auto" id="features">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <span className="text-blue-400 font-outfit tracking-widest uppercase text-xs font-bold">Core Platform Suite</span>
            <h2 className="font-outfit text-3xl md:text-4xl font-extrabold text-white">Integrated Educational OS</h2>
            <p className="text-zinc-400 text-sm md:text-base leading-relaxed">
              Break free from software overload. Consolidate your class streaming, tuition ledgers, student tracking, and automated grading into one dynamic system.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Feature 1 */}
            <div className="p-6 bg-zinc-900/30 border border-zinc-900 hover:border-zinc-850 hover:bg-zinc-900/50 rounded-2xl transition-all duration-200 group">
              <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-200">
                <BookOpen className="w-5 h-5" />
              </div>
              <h4 className="font-outfit text-lg font-bold text-white mb-2">LMS Core</h4>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                Curriculum structures, interactive lesson players, live timers, and secure certified credentials in one tab.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="p-6 bg-zinc-900/30 border border-zinc-900 hover:border-zinc-850 hover:bg-zinc-900/50 rounded-2xl transition-all duration-200 group">
              <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-200">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="font-outfit text-lg font-bold text-white mb-2">Student CRM</h4>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                Full-cycle profile logs detailing attendance indexes, study streak counters, and parent metrics trackers.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="p-6 bg-zinc-900/30 border border-zinc-900 hover:border-zinc-850 hover:bg-zinc-900/50 rounded-2xl transition-all duration-200 group">
              <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-200">
                <Coins className="w-5 h-5" />
              </div>
              <h4 className="font-outfit text-lg font-bold text-white mb-2">Revenue Ops</h4>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                Dynamic installment payment plans, transparent receipt generators, and automated invoicing ledgers.
              </p>
            </div>
            
            {/* Feature 4 */}
            <div className="p-6 bg-zinc-900/30 border border-zinc-900 hover:border-zinc-850 hover:bg-zinc-900/50 rounded-2xl transition-all duration-200 group">
              <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-200">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h4 className="font-outfit text-lg font-bold text-white mb-2">Deep Analytics</h4>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                High-fidelity BI telemetry evaluating cohort grade curves, risk predictors, and academic outcomes.
              </p>
            </div>
            
          </div>
        </section>

        {/* Brand Academy: White Labelling Showcase */}
        <section className="py-20 md:py-32 px-6 max-w-7xl mx-auto space-y-24 border-t border-zinc-900" id="solutions">
          
          {/* Module 1: White labeling */}
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
            <div className="flex-1 order-2 lg:order-1 relative">
              <div className="absolute -inset-4 bg-blue-600/5 rounded-3xl blur-2xl -z-10 pointer-events-none" />
              <div className="glass-panel p-3 rounded-2xl border border-zinc-850 shadow-2xl">
                <img 
                  alt="White label screenshot" 
                  className="rounded-xl w-full object-cover aspect-video" 
                  src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80"
                />
              </div>
            </div>
            
            <div className="flex-1 order-1 lg:order-2 space-y-6 text-center lg:text-left">
              <span className="font-outfit text-xs font-bold text-teal-400 tracking-wider uppercase">Monetize Your Expertise</span>
              <h3 className="font-outfit text-2xl md:text-3xl font-extrabold text-white">Your brand. Your domain. Your bespoke academy.</h3>
              <p className="text-zinc-400 text-sm md:text-base leading-relaxed">
                Step into the spotlight with custom branded assets. StudyOrbit integrates customizable subdomains, color codes, signature player logos, and cryptographic student certificates signed directly by your faculty.
              </p>
              
              <ul className="space-y-3 text-left inline-block lg:block">
                <li className="flex items-center gap-3 text-xs text-zinc-300">
                  <Check className="w-4 h-4 text-emerald-400" /> Custom branding theme editor
                </li>
                <li className="flex items-center gap-3 text-xs text-zinc-300">
                  <Check className="w-4 h-4 text-emerald-400" /> Cryptographic verified credentials
                </li>
                <li className="flex items-center gap-3 text-xs text-zinc-300">
                  <Check className="w-4 h-4 text-emerald-400" /> Zero revenue-sharing platform fees
                </li>
              </ul>
            </div>
          </div>
          
          {/* Module 2: Learner Engagement */}
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
            <div className="flex-1 space-y-6 text-center lg:text-left">
              <span className="font-outfit text-xs font-bold text-blue-400 tracking-wider uppercase">Communicate Efficiently</span>
              <h3 className="font-outfit text-2xl md:text-3xl font-extrabold text-white">Fostering deep interaction & cohort success</h3>
              <p className="text-zinc-400 text-sm md:text-base leading-relaxed">
                Encourage deeper connections among peers and faculty with integrated group chat channels, responsive discussion forum threads, interactive assignments hubs, and high-fidelity live classroom sessions.
              </p>
              
              <ul className="space-y-3 text-left inline-block lg:block">
                <li className="flex items-center gap-3 text-xs text-zinc-300">
                  <Check className="w-4 h-4 text-blue-400" /> Live video player & calendar sync
                </li>
                <li className="flex items-center gap-3 text-xs text-zinc-300">
                  <Check className="w-4 h-4 text-blue-400" /> Student & parent unified message logs
                </li>
                <li className="flex items-center gap-3 text-xs text-zinc-300">
                  <Check className="w-4 h-4 text-blue-400" /> In-app study streaks & gamified badges
                </li>
              </ul>
            </div>
            
            <div className="flex-1 relative">
              <div className="absolute -inset-4 bg-purple-600/5 rounded-3xl blur-2xl -z-10 pointer-events-none" />
              <div className="glass-panel p-3 rounded-2xl border border-zinc-850 shadow-2xl">
                <img 
                  alt="Engagement dashboard" 
                  className="rounded-xl w-full object-cover aspect-video" 
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80"
                />
              </div>
            </div>
          </div>
          
        </section>

        {/* Impact Stats */}
        <section className="py-20 md:py-32 bg-zinc-950 relative overflow-hidden" id="impact">
          <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
          
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="text-center mb-16 space-y-4">
              <h2 className="font-outfit text-3xl md:text-4xl font-extrabold text-white">Impact at Scale</h2>
              <p className="text-zinc-500 text-xs uppercase tracking-widest font-bold">Real Outcomes. Real Institutions.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center max-w-4xl mx-auto mb-16">
              <div className="p-6 rounded-2xl bg-zinc-900/30 border border-zinc-900 space-y-2">
                <p className="text-4xl md:text-5xl font-extrabold text-white font-outfit">60%</p>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Less Tech Overhead Spending</p>
              </div>
              <div className="p-6 rounded-2xl bg-zinc-900/30 border border-zinc-900 space-y-2">
                <p className="text-4xl md:text-5xl font-extrabold text-teal-400 font-outfit">20%</p>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Lower Operating Costs</p>
              </div>
              <div className="p-6 rounded-2xl bg-zinc-900/30 border border-zinc-900 space-y-2">
                <p className="text-4xl md:text-5xl font-extrabold text-purple-400 font-outfit">200%</p>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Higher Cohort Engagement</p>
              </div>
            </div>
            
            {/* Premium Testimonial Card */}
            <div className="max-w-3xl mx-auto p-8 rounded-3xl bg-zinc-900/20 border border-zinc-850/80 backdrop-blur-sm relative">
              <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-3xl" />
              
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-white font-outfit font-black text-xl shadow-lg">
                  PH
                </div>
                <div className="text-center md:text-left space-y-4">
                  <p className="text-sm md:text-base italic text-zinc-300 font-sans leading-relaxed">
                    "StudyOrbit offers outstanding features like BI, class recording, and digital library, ensuring an exceptional experience for both faculty and students."
                  </p>
                  <div>
                    <p className="font-bold text-xs text-white">Pradipta Hire</p>
                    <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Program Director, Academic Global</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Ready to transform CTA */}
        <section className="py-20 md:py-32 px-6 max-w-6xl mx-auto text-center relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-purple-600/5 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="p-8 md:p-16 rounded-3xl bg-gradient-to-br from-zinc-950 to-zinc-900 border border-zinc-850 relative z-10 space-y-8">
            <h2 className="font-outfit text-3xl md:text-5xl font-extrabold text-white leading-tight">
              Create a World-Class Learning Environment
            </h2>
            <p className="text-zinc-400 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
              Ready to transform your online learning experience? Join over 500 institutions that trust **StudyOrbit** for academic excellence.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button 
                onClick={() => {
                  setModalTab('demo');
                  setIsModalOpen(true);
                }}
                className="px-8 py-4 bg-gradient-royal text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer border border-blue-400/25"
              >
                Start 14-Day Free Trial
              </button>
              <button 
                onClick={() => {
                  setModalTab('demo');
                  setIsModalOpen(true);
                }}
                className="px-8 py-4 border border-zinc-800 hover:border-zinc-700 bg-zinc-900/10 hover:bg-zinc-900/30 text-zinc-300 hover:text-white font-bold rounded-xl transition-all cursor-pointer"
              >
                Book a Live Demo
              </button>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-zinc-950 border-t border-zinc-900 pt-16 pb-8 relative z-10" id="about">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 mb-12">
            
            {/* Branding col */}
            <div className="col-span-2 space-y-4">
              <img 
                alt="StudyOrbit Logo" 
                className="h-8 block dark:hidden" 
                src="/logos/dark/logo.png"
              />
              <img 
                alt="StudyOrbit Logo" 
                className="h-8 hidden dark:block" 
                src="/logos/light/logo.png"
              />
              <p className="text-xs text-zinc-500 leading-relaxed max-w-xs font-sans">
                Redefining institutional management through technology that puts learners first. Empowering excellence globally.
              </p>
            </div>
            
            <div>
              <h5 className="font-outfit text-xs font-bold uppercase tracking-wider text-white mb-4">Company</h5>
              <ul className="space-y-2 text-xs text-zinc-500">
                <li><a className="hover:text-white transition-colors" href="#">About us</a></li>
                <li><a className="hover:text-white transition-colors" href="#">Careers</a></li>
                <li><a className="hover:text-white transition-colors" href="#">Contact us</a></li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-outfit text-xs font-bold uppercase tracking-wider text-white mb-4">Product</h5>
              <ul className="space-y-2 text-xs text-zinc-500">
                <li><a className="hover:text-white transition-colors" href="#">LMS Core</a></li>
                <li><a className="hover:text-white transition-colors" href="#">Features</a></li>
                <li><a className="hover:text-white transition-colors" href="#">Pricing</a></li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-outfit text-xs font-bold uppercase tracking-wider text-white mb-4">Connect</h5>
              <ul className="space-y-2 text-xs text-zinc-500">
                <li><a className="hover:text-white transition-colors" href="#">LinkedIn</a></li>
                <li><a className="hover:text-white transition-colors" href="#">Twitter</a></li>
                <li><a className="hover:text-white transition-colors" href="#">Schedule Demo</a></li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-outfit text-xs font-bold uppercase tracking-wider text-white mb-4">Legal</h5>
              <ul className="space-y-2 text-xs text-zinc-500">
                <li><a className="hover:text-white transition-colors" href="#">Privacy Policy</a></li>
                <li><a className="hover:text-white transition-colors" href="#">Terms of Service</a></li>
                <li><a className="hover:text-white transition-colors" href="#">Cookie Policy</a></li>
              </ul>
            </div>
            
          </div>
          
          <div className="pt-8 border-t border-zinc-900/60 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
            <p className="text-[10px] text-zinc-600 font-semibold tracking-wider font-sans">
              © {new Date().getFullYear()} StudyOrbit LMS Inc. Built with passion for better education.
            </p>
            <div className="flex gap-4 text-[10px] text-zinc-600 uppercase tracking-widest font-bold font-outfit">
              <span>GDPR COMPLIANT</span>
              <span>SSL SECURE</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ==================== INTERACTIVE LOGIN MODAL OVERLAY ==================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md animate-fade-in">
          
          {/* Modal Card */}
          <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
            
            {/* Top Royal Accent Line */}
            <div className="h-[4px] bg-gradient-royal" />
            
            {/* Close Button */}
            <button 
              onClick={() => {
                if (!loading) setIsModalOpen(false);
              }}
              className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white hover:bg-zinc-800/80 rounded-xl transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            
            {/* Modal Header */}
            <div className="px-8 pt-8 pb-4 space-y-1">
              <h3 className="text-xl font-bold font-outfit text-white">Access the StudyOrbit Portal</h3>
              <p className="text-xs text-zinc-400 font-sans">Choose between the interactive evaluator quick-login dashboard cards or manual credentials.</p>
            </div>
            
            {/* Tabs selector */}
            <div className="px-8 border-b border-zinc-800 flex gap-6">
              <button 
                onClick={() => setModalTab('demo')}
                className={`py-3.5 text-xs font-bold uppercase tracking-wider font-outfit transition-all cursor-pointer relative ${modalTab === 'demo' ? 'text-blue-400' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                  Evaluator Quick Login
                </span>
                {modalTab === 'demo' && <div className="absolute bottom-0 left-0 w-full h-[2.5px] bg-blue-500 rounded-full" />}
              </button>
              
              <button 
                onClick={() => setModalTab('custom')}
                className={`py-3.5 text-xs font-bold uppercase tracking-wider font-outfit transition-all cursor-pointer relative ${modalTab === 'custom' ? 'text-blue-400' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  Credentials Input
                </span>
                {modalTab === 'custom' && <div className="absolute bottom-0 left-0 w-full h-[2.5px] bg-blue-500 rounded-full" />}
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="p-8">
              
              {/* Tab 1: Demo Quick-Access Grid */}
              {modalTab === 'demo' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {demoUsers.map((user) => {
                      const IconComponent = user.icon;
                      const isSelected = selectedUser === user.email;
                      
                      return (
                        <button
                          key={user.email}
                          onClick={() => handleDemoLogin(user)}
                          disabled={loading}
                          className={`flex items-center gap-4 p-4 rounded-xl border border-zinc-800 bg-zinc-950/40 hover:bg-zinc-800/40 hover:border-zinc-700 transition-all text-left group cursor-pointer disabled:opacity-50 relative ${isSelected ? 'border-blue-500 bg-blue-500/5' : ''}`}
                        >
                          <div className={`p-3 rounded-lg bg-gradient-to-br ${user.color} text-white shadow-md group-hover:scale-105 transition-transform duration-200`}>
                            <IconComponent className="w-5 h-5" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors truncate">
                              {user.name}
                            </h4>
                            <p className="text-[10px] text-zinc-500 font-medium truncate mt-0.5">{user.desc}</p>
                            
                            {/* Role Badge */}
                            <span className={`inline-block mt-2 px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${user.textColor} ${user.bgColor} border ${user.borderColor}`}>
                              {user.role}
                            </span>
                          </div>

                          {loading && isSelected && (
                            <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/80 rounded-xl backdrop-blur-[2px]">
                              <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 animate-pulse font-outfit">
                                {loginSuccess ? (
                                  <>
                                    <Check className="w-4 h-4 text-emerald-400" />
                                    <span>Session Active!</span>
                                  </>
                                ) : (
                                  <>
                                    <span className="w-4 h-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                                    <span>Connecting...</span>
                                  </>
                                )}
                              </div>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {/* Tab 2: Custom Credentials Form */}
              {modalTab === 'custom' && (
                <form onSubmit={handleCustomLogin} className="space-y-4 max-w-md mx-auto">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-outfit">Institutional Email</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. sarah@studyorbit.com"
                        disabled={loading}
                        className="block w-full pl-10 pr-4 py-3 bg-zinc-950/50 border border-zinc-800 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-sans disabled:opacity-50"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-outfit">Password</label>
                      <a href="#" className="text-[10px] font-bold text-blue-400 hover:underline font-outfit">Forgot?</a>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        disabled={loading}
                        className="block w-full pl-10 pr-4 py-3 bg-zinc-950/50 border border-zinc-800 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-sans disabled:opacity-50"
                      />
                    </div>
                  </div>
                  
                  {error && (
                    <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-3.5 rounded-xl font-sans leading-relaxed animate-shake">
                      {error}
                    </div>
                  )}
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl bg-gradient-royal text-white text-xs font-bold uppercase tracking-widest hover:opacity-95 active:scale-98 transition-all shadow-lg shadow-blue-500/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 font-outfit"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                        <span>Verifying...</span>
                      </span>
                    ) : (
                      <>
                        <span>Log In to Dashboard</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                  
                  {/* Third party quick mock credentials login */}
                  <div className="relative flex items-center justify-center my-6">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-zinc-800"></div></div>
                    <span className="relative px-3 bg-zinc-900 text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-outfit">Demo Tip</span>
                  </div>
                  
                  <p className="text-[10px] text-zinc-500 text-center leading-relaxed font-sans">
                    You can type in any registered demo user email like <strong className="text-zinc-400">rohan@studyorbit.com</strong> with any password to trigger automated secure routing validation.
                  </p>
                </form>
              )}
              
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}
