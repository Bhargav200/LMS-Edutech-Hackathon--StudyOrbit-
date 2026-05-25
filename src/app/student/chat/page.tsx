'use client';

import { useState, useEffect, useRef } from 'react';
import PortalShell from '@/components/PortalShell';
import AIStudyBuddy from '@/components/AIStudyBuddy';
import { supabase } from '@/lib/supabaseClient';
import { MessageSquare, Send, Orbit, Users, Star, Hash, Bot } from 'lucide-react';

export default function StudentChat() {
  const [studentId, setStudentId] = useState('f9b07384-f113-4318-f89e-4cdeee958b92');
  const [messages, setMessages] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedId = localStorage.getItem('study_orbit_user_id') || 'f9b07384-f113-4318-f89e-4cdeee958b92';
    setStudentId(storedId);

    async function loadChat() {
      // 1. Fetch profiles to display sender details
      const { data: users } = await supabase
        .from('profiles')
        .select('*');
      
      if (users) setProfiles(users);

      // 2. Fetch existing chat messages
      const { data: chatData } = await supabase
        .from('chat_messages')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (chatData) setMessages(chatData);

      setLoading(false);
    }
    loadChat();

    // Set up Realtime listener to auto-append database insertions live!
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Scroll to bottom when messages list updates
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const getSenderProfile = (senderId: string) => {
    return profiles.find(p => p.id === senderId);
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const contentText = chatInput.trim();
    setChatInput('');

    try {
      // Insert message into database. It will immediately trigger our Realtime subscription!
      const { error: insertErr } = await supabase
        .from('chat_messages')
        .insert({
          id: '99999999-9999-9999-9999-' + Math.random().toString().substring(2,14),
          group_id: 'a8111111-1111-1111-1111-111111111111',
          sender_id: studentId,
          content: contentText,
          created_at: new Date().toISOString()
        });

      if (insertErr) throw insertErr;
    } catch (err: any) {
      console.error('Error sending message:', err.message);
    }
  };

  return (
    <PortalShell>
      <div className="flex h-[calc(100vh-130px)] glass-panel rounded-2xl overflow-hidden shadow-2xl border border-zinc-800/80">
        
        {/* Left Side Channels (Width 64) */}
        <aside className="w-64 border-r border-zinc-800 bg-zinc-950/30 flex flex-col justify-between hidden md:flex">
          <div className="p-4 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 font-outfit mb-3 flex items-center gap-1.5">
              <Orbit className="w-4 h-4 text-blue-400 animate-spin-slow" />
              Cohort Directory
            </h3>

            <div className="space-y-1">
              <button className="w-full flex items-center gap-2 p-2.5 rounded-lg bg-zinc-800/80 text-white font-semibold text-xs border border-zinc-700/30 cursor-pointer">
                <Hash className="w-4 h-4 text-blue-400" />
                full-stack-spring-26
              </button>
              <button className="w-full flex items-center gap-2 p-2.5 rounded-lg text-zinc-500 hover:text-zinc-300 font-medium text-xs hover:bg-zinc-900/40 border border-transparent cursor-pointer">
                <Hash className="w-4 h-4 text-zinc-600" />
                general-announcements
              </button>
            </div>
          </div>

          <div className="p-4 border-t border-zinc-800">
            <div className="flex items-center gap-3 p-3 bg-zinc-900/60 rounded-xl border border-zinc-850">
              <Users className="w-4 h-4 text-teal-400" />
              <div className="flex-1 min-w-0">
                <span className="text-[10px] text-zinc-500 uppercase font-semibold">Active Members</span>
                <p className="text-xs font-bold text-white leading-none mt-0.5">5 Enrolled</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Active Channel Panel (Width Flex-1) */}
        <section className="flex-1 flex flex-col justify-between h-full relative">
          
          {/* Channel Header */}
          <div className="px-6 py-4 bg-zinc-950/20 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4 text-blue-400" />
              <div>
                <h3 className="text-sm font-bold font-outfit text-white">full-stack-spring-26</h3>
                <p className="text-[9px] text-zinc-500 mt-0.5">Topic: Next.js routes layout architectures, database triggers, and RLS policies</p>
              </div>
            </div>
            
            <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-semibold bg-emerald-500/5 px-2.5 py-1 rounded-full border border-emerald-500/10">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping-once" />
              Realtime Sync Active
            </div>
          </div>

          {/* Messages Logs list */}
          <div ref={scrollRef} className="flex-1 p-6 overflow-y-auto space-y-4 bg-zinc-950/10">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-xs text-zinc-500">Loading cohort chat channels...</p>
              </div>
            ) : messages.length > 0 ? (
              <div className="space-y-4 max-w-4xl mx-auto">
                {messages.map((msg) => {
                  const profile = getSenderProfile(msg.sender_id);
                  const isSelf = msg.sender_id === studentId;
                  
                  return (
                    <div key={msg.id} className={`flex gap-3 max-w-[80%] ${isSelf ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}>
                      {/* Sender Avatar */}
                      <img
                        src={profile?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                        alt={profile?.full_name || 'User'}
                        className="w-9 h-9 rounded-xl object-cover shadow border border-zinc-800"
                      />
                      
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold font-outfit text-white">
                            {profile?.full_name || 'Seeded User'}
                          </span>
                          <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${profile?.role === 'faculty' ? 'bg-purple-500/10 text-purple-400' : 'bg-teal-500/10 text-teal-400'}`}>
                            {profile?.role || 'student'}
                          </span>
                          <span className="text-[8px] text-zinc-600 font-medium">
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        
                        <div className={`p-3 rounded-2xl text-xs leading-relaxed font-sans ${isSelf ? 'bg-gradient-royal text-white shadow shadow-blue-500/5' : 'bg-zinc-900 border border-zinc-800 text-zinc-300'}`}>
                          {msg.content}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center justify-center flex-1 h-full">
                <MessageSquare className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                <p className="text-zinc-500 text-sm">Send a message to open the cohort chat.</p>
              </div>
            )}
          </div>

          {/* Footer Input Area */}
          <form onSubmit={handleSendChat} className="p-4 border-t border-zinc-800 bg-zinc-950/80 flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Type message to #full-stack-spring-26..."
              className="flex-1 px-4 py-3 rounded-xl glass-input text-xs font-sans"
            />
            <button
              type="submit"
              disabled={!chatInput.trim()}
              className="p-3.5 rounded-xl bg-gradient-royal text-white hover:opacity-95 transition-all shadow cursor-pointer disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </section>

      </div>
      <AIStudyBuddy />
    </PortalShell>
  );
}
