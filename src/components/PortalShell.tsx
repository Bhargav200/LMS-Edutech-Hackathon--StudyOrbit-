'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Home, BookOpen, FileText, CreditCard, Calendar, MessageSquare, 
  Award, Shield, GraduationCap, Users, Layers, Palette, 
  Menu, X, Bell, LogOut, Search, Orbit, ChevronRight, MessageCircle,
  Sun, Moon
} from 'lucide-react';

interface PortalShellProps {
  children: React.ReactNode;
}

export default function PortalShell({ children }: PortalShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [role, setRole] = useState<string>('student');
  const [userName, setUserName] = useState<string>('Guest');
  const [userEmail, setUserEmail] = useState<string>('');
  const [notificationsCount, setNotificationsCount] = useState(3);
  const [showNotifications, setShowNotifications] = useState(false);

  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    // Determine active role from the URL path to ensure the layout matches the page!
    let activeRole = 'student';
    if (pathname.startsWith('/admin')) {
      activeRole = 'admin';
    } else if (pathname.startsWith('/faculty')) {
      activeRole = 'faculty';
    } else if (pathname.startsWith('/parent')) {
      activeRole = 'parent';
    } else if (pathname.startsWith('/student')) {
      activeRole = 'student';
    } else {
      activeRole = localStorage.getItem('study_orbit_user_role') || 'student';
    }

    localStorage.setItem('study_orbit_user_role', activeRole);
    setRole(activeRole);

    // Retrieve name and details
    let storedName = localStorage.getItem('study_orbit_user_name');
    if (!storedName || storedName === 'Guest') {
      if (activeRole === 'admin') storedName = 'Sarah Chen';
      else if (activeRole === 'faculty') storedName = 'Dr. Aris Thorne';
      else if (activeRole === 'parent') storedName = 'Meera Sharma';
      else storedName = 'Rohan Sharma';
      localStorage.setItem('study_orbit_user_name', storedName);
    }
    setUserName(storedName);

    const storedEmail = localStorage.getItem('study_orbit_user_email') || `${activeRole}@quantum.edu`;
    setUserEmail(storedEmail);

    // Retrieve and apply theme
    const savedTheme = (localStorage.getItem('study_orbit_theme') as 'dark' | 'light') || 'dark';
    setTheme(savedTheme);
    if (savedTheme === 'light') {
      document.documentElement.classList.add('light-mode');
    } else {
      document.documentElement.classList.remove('light-mode');
    }
  }, [pathname]);

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

  const handleLogout = () => {
    localStorage.clear();
    router.push('/');
  };

  // Define sidebar links based on role
  const getSidebarLinks = () => {
    switch (role) {
      case 'admin':
        return [
          { name: 'Overview', href: '/admin/dashboard', icon: Home },
          { name: 'Curriculum Builder', href: '/admin/courses', icon: BookOpen },
          { name: 'Batch Cohorts', href: '/admin/batches', icon: Layers },
          { name: 'Branding Settings', href: '/admin/branding', icon: Palette }
        ];
      case 'faculty':
        return [
          { name: 'Dashboard', href: '/faculty/dashboard', icon: Home },
          { name: 'Class Organizer', href: '/faculty/classes', icon: Calendar },
          { name: 'Gradebook', href: '/faculty/gradebook', icon: FileText },
          { name: 'Student Insights', href: '/faculty/insights', icon: GraduationCap }
        ];
      case 'parent':
        return [
          { name: 'Overview', href: '/parent/dashboard', icon: Home }
        ];
      case 'student':
      default:
        return [
          { name: 'Dashboard', href: '/student/dashboard', icon: Home },
          { name: 'My Courses', href: '/student/courses', icon: BookOpen },
          { name: 'Assignments', href: '/student/assignments', icon: FileText },
          { name: 'Live Classes', href: '/student/live', icon: Calendar },
          { name: 'Payments ledger', href: '/student/payments', icon: CreditCard },
          { name: 'Cohort Chat', href: '/student/chat', icon: MessageSquare },
          { name: 'Certificates', href: '/student/certificates', icon: Award }
        ];
    }
  };

  const links = getSidebarLinks();

  const getRoleBadgeColor = () => {
    switch (role) {
      case 'admin': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'faculty': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'parent': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default: return 'bg-teal-500/10 text-teal-400 border-teal-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-obsidian flex flex-col relative text-zinc-300 font-sans">
      
      {/* Decorative ambient glowing lights */}
      <div className="absolute top-[-10%] right-[-10%] w-[35rem] h-[35rem] rounded-full bg-blue-600/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[35rem] h-[35rem] rounded-full bg-purple-600/5 blur-[120px] pointer-events-none" />

      {/* TOP NAVIGATION BAR */}
      <header className="glass-panel border-b border-zinc-800/80 sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2 cursor-pointer h-9" onClick={() => router.push('/')}>
            <img 
              src={theme === 'light' ? "/logos/light/logo.png" : "/logos/dark/logo.png"} 
              alt="StudyOrbit Logo" 
              className="h-7 w-auto object-contain transition-all"
            />
          </div>
          
          <span className="text-xs font-semibold px-2 py-0.5 rounded border uppercase tracking-wider ml-2 hidden sm:inline-block font-outfit bg-zinc-900/60 border-zinc-800 text-zinc-400">
            Quantum Academics
          </span>
        </div>

        {/* Global Search & Notifications */}
        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search courses, lessons..."
              className="pl-10 pr-4 py-1.5 w-60 rounded-full glass-input text-xs font-sans"
            />
          </div>

          {/* Theme Toggle Switcher */}
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 cursor-pointer transition-colors"
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-amber-400" />}
          </button>

          {/* Notifications Bell */}
          <div className="relative">
            <button 
              onClick={() => {
                setShowNotifications(!showNotifications);
                setNotificationsCount(0);
              }}
              className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 relative cursor-pointer"
            >
              <Bell className="w-5 h-5" />
              {notificationsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-ping-once" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 glass-panel rounded-xl p-4 shadow-2xl z-50 text-left">
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400 font-outfit mb-3 flex items-center justify-between">
                  Recent Alerts
                  <span className="text-[10px] text-zinc-500 font-normal">Marked as read</span>
                </h4>
                <div className="space-y-3 text-xs">
                  <div className="p-2.5 rounded-lg bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800/50 cursor-pointer" onClick={() => router.push('/student/payments')}>
                    <p className="font-semibold text-white">Installment 2 Due Reminder</p>
                    <p className="text-zinc-500 mt-1">Second installment of INR 4,250 due on June 1st.</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800/50 cursor-pointer" onClick={() => router.push('/student/assignments')}>
                    <p className="font-semibold text-white">New Assignment Published</p>
                    <p className="text-zinc-500 mt-1">"Supabase Schema Design & RLS Policies" is open.</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800/50 cursor-pointer" onClick={() => router.push('/admin/branding')}>
                    <p className="font-semibold text-white">System Activated</p>
                    <p className="text-zinc-500 mt-1">Pro license activated for Quantum Academics.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User profile dropdown snippet */}
          <div className="flex items-center gap-3 pl-4 border-l border-zinc-800">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-semibold text-white truncate max-w-28">{userName}</span>
              <span className={`text-[10px] font-semibold font-outfit border px-1.5 py-0.5 rounded-full uppercase tracking-wider w-fit ml-auto mt-0.5 ${getRoleBadgeColor()}`}>
                {role}
              </span>
            </div>
            
            <button 
              onClick={handleLogout}
              className="p-2 rounded-full hover:bg-rose-500/10 text-zinc-500 hover:text-rose-400 transition-colors cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* PORTAL CORE SHELL */}
      <div className="flex flex-1 relative">
        
        {/* LEFT SIDEBAR (Desktop) */}
        <aside className={`lg:flex flex-col w-64 glass-panel border-r border-zinc-800/80 fixed lg:static h-[calc(100vh-73px)] z-30 transition-all duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
          <div className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
            {links.map((link) => {
              const LinkIcon = link.icon;
              const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
              return (
                <button
                  key={link.name}
                  onClick={() => {
                    setSidebarOpen(false);
                    router.push(link.href);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all group cursor-pointer ${isActive ? 'bg-gradient-royal text-white shadow-lg shadow-blue-500/10' : 'text-zinc-400 hover:bg-zinc-800/40 hover:text-white'}`}
                >
                  <LinkIcon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-300'}`} />
                  {link.name}
                </button>
              );
            })}
          </div>

          <div className="p-4 border-t border-zinc-800/80">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping-once" />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Active Workspace</p>
                <p className="text-xs font-semibold text-white truncate">Quantum Academics</p>
              </div>
            </div>
          </div>
        </aside>

        {/* MOBILE SIDEBAR BACKGROUND OVERLAY */}
        {sidebarOpen && (
          <div 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/60 z-20 backdrop-blur-sm"
          />
        )}

        {/* MAIN DISPLAY VIEW */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto relative h-[calc(100vh-73px)]">
          {children}
        </main>
      </div>
    </div>
  );
}
