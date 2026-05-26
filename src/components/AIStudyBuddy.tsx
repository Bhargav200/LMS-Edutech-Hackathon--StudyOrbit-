'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Send, Bot, User, Orbit } from 'lucide-react';

export default function AIStudyBuddy() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: 'bot' | 'user'; text: string; time: string }>>([
    {
      sender: 'bot',
      text: "Hey Rohan! I am your StudyOrbit AI Study Buddy. Ask me anything about your current course 'Advanced Full-Stack Web Development', explain lessons, check code snippets, or suggest what to study next!",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg = inputText.trim();
    setInputText('');
    setMessages(prev => [...prev, {
      sender: 'user',
      text: userMsg,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);

    setIsTyping(true);

    // Simulate smart NLP streaming response
    setTimeout(() => {
      let reply = "";
      const query = userMsg.toLowerCase();

      if (query.includes('layout') || query.includes('route')) {
        reply = "In **Next.js App Router**, layouts define shared UI for nested routes. They preserve state and do not re-render when navigating between sibling routes. To create a nested layout, simply create a `layout.tsx` file inside your subfolder, which receives `{ children }: { children: React.ReactNode }` and wraps them! Let me know if you want me to write a custom dashboard skeleton layout.";
      } else if (query.includes('rls') || query.includes('security') || query.includes('database')) {
        reply = "In **Supabase**, **Row-Level Security (RLS)** restricts which table rows are visible or modifiable for a specific user. It works by evaluating Postgres policies on every query. For example, to restrict students to only viewing their own assignment submissions, you use: \n\n`CREATE POLICY \"Select Submissions\" ON submissions FOR SELECT USING (student_id = auth.uid());` \n\nThis automatically filters rows at the database engine level, keeping tenant data completely isolated.";
      } else if (query.includes('next') || query.includes('study') || query.includes('schedule') || query.includes('todo')) {
        reply = "Looking at your progress in **StudyOrbit**, your next step is **Lesson 2.1: Configuring Supabase Client**. You have also got an assignment **'Supabase Schema Design & RLS Policies'** due in 5 days! Would you like me to give you a quick recap of the prerequisite Lesson 1.2 on Server Components?";
      } else if (query.includes('server component') || query.includes('client component') || query.includes('rsc')) {
        reply = "React **Server Components (RSC)** render on the server, meaning zero JavaScript bundle weight is shipped to the client. They fetch data directly from databases securely. **Client Components** (with the `'use client'` directive) execute in the browser and support state (`useState`), effects (`useEffect`), and browser event listeners. Best practice is to fetch data in Server Components, then pass the data down to interactive Client Components!";
      } else if (query.includes('code') || query.includes('typescript') || query.includes('jsx')) {
        reply = "Sure! Here is a clean boilerplate for a Next.js Server Component that fetches course information from Supabase:\n\n```tsx\n// src/app/courses/page.tsx\nimport { createClient } from '@/lib/supabaseServer';\n\nexport default async function Courses() {\n  const supabase = await createClient();\n  const { data: courses } = await supabase.from('courses').select('*');\n  \n  return (\n    <div>\n      {courses?.map(c => <h1 key={c.id}>{c.title}</h1>)}\n    </div>\n  );\n}\n```";
      } else {
        reply = "That's an interesting question! Inside **StudyOrbit**, we build secure, isolated full-stack architectures. Regarding your query about '" + userMsg + "', I recommend checking out the interactive **Course Player** where Dr. Aris Thorne covers this under Module 2, or asking him directly in the **Cohort Group Chat**.";
      }

      setIsTyping(false);
      setMessages(prev => [...prev, {
        sender: 'bot',
        text: reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 1200);
  };

  return (
    <>
      {/* FLOATING ACTION TRIGGER BUBBLE */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 p-4 rounded-full bg-gradient-royal text-white shadow-2xl hover:scale-105 active:scale-95 transition-all z-50 cursor-pointer flex items-center justify-center group"
      >
        {isOpen ? <X className="w-6 h-6 animate-pulse" /> : <Bot className="w-6 h-6 animate-pulse" />}
        <span className="max-w-0 overflow-hidden group-hover:max-w-28 group-hover:ml-2 text-xs font-semibold whitespace-nowrap transition-all font-outfit">
          AI Study Buddy
        </span>
      </button>

      {/* CHAT INTERFACE PANEL */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-2rem)] h-[32rem] glass-panel rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-6 duration-200">
          
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-royal text-white flex items-center justify-between shadow">
            <div className="flex items-center gap-2.5">
              <div className="p-1 rounded bg-white/20">
                <Orbit className="w-4 h-4 animate-spin-slow" />
              </div>
              <div>
                <h3 className="text-sm font-bold font-outfit tracking-wide flex items-center gap-1.5">
                  StudyOrbit AI Assistant
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping-once" />
                </h3>
                <p className="text-[10px] text-white/70">Online Syllabus Specialist</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1 rounded hover:bg-white/10 text-white/80 hover:text-white cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Logs scroll list */}
          <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-4 bg-zinc-950/20">
            {messages.map((msg, index) => {
              const isBot = msg.sender === 'bot';
              return (
                <div key={index} className={`flex gap-3 max-w-[85%] ${isBot ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}>
                  <div className={`p-2 rounded-xl flex items-center justify-center h-8 w-8 min-w-8 shadow ${isBot ? 'bg-zinc-800 text-blue-400 border border-zinc-700/50' : 'bg-gradient-royal text-white'}`}>
                    {isBot ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>
                  <div className={`p-3.5 rounded-2xl text-xs leading-relaxed ${isBot ? 'bg-zinc-900/80 border border-zinc-800/80 text-zinc-300' : 'bg-blue-600/20 border border-blue-500/20 text-white'}`}>
                    <p className="whitespace-pre-line font-sans">{msg.text}</p>
                    <span className="block text-[8px] text-zinc-500 text-right mt-1.5">{msg.time}</span>
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex gap-3 max-w-[80%] mr-auto">
                <div className="p-2 rounded-xl bg-zinc-800 text-blue-400 border border-zinc-700/50 flex items-center justify-center h-8 w-8 min-w-8">
                  <Bot className="w-4 h-4 animate-bounce" />
                </div>
                <div className="bg-zinc-900/60 border border-zinc-800/80 p-3.5 rounded-2xl text-xs text-zinc-500 italic flex items-center gap-1.5">
                  StudyBuddy is thinking
                  <span className="flex gap-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 animate-pulse" />
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 animate-pulse delay-75" />
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 animate-pulse delay-150" />
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions Shortcuts */}
          <div className="px-4 py-2 border-t border-zinc-800/60 bg-zinc-900/20 flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-none">
            <button 
              onClick={() => setInputText("What is RSC?")} 
              className="text-[10px] bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-700/50 text-zinc-400 hover:text-white px-2.5 py-1 rounded-full cursor-pointer transition-colors"
            >
              Explain Server Components
            </button>
            <button 
              onClick={() => setInputText("Show layout code")} 
              className="text-[10px] bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-700/50 text-zinc-400 hover:text-white px-2.5 py-1 rounded-full cursor-pointer transition-colors"
            >
              Get layout JSX
            </button>
            <button 
              onClick={() => setInputText("What should I study next?")} 
              className="text-[10px] bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-700/50 text-zinc-400 hover:text-white px-2.5 py-1 rounded-full cursor-pointer transition-colors"
            >
              Suggest next step
            </button>
          </div>

          {/* Footer Input Area */}
          <form onSubmit={handleSend} className="p-3 border-t border-zinc-800/60 flex gap-2 bg-zinc-950/40">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask StudyBuddy anything..."
              className="flex-1 px-3 py-2 rounded-xl glass-input text-xs font-sans"
              disabled={isTyping}
            />
            <button
              type="submit"
              disabled={isTyping || !inputText.trim()}
              className="p-2 rounded-xl bg-gradient-royal text-white hover:opacity-95 transition-all shadow shadow-blue-500/10 cursor-pointer flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}
    </>
  );
}
