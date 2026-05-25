ategory
Technology / Service
Purpose in MVP
Frontend
Next.js (App Router) with Tailwind CSS
Server‑side rendered, PWA‑ready student/admin/faculty portals
Backend & Database
Supabase (PostgreSQL, Auth, Storage, Realtime, Edge Functions)
Core backend: user management, database, file storage, real‑time events, serverless logic
Video Hosting & Streaming
Mux or Cloudflare Stream
Secure HLS video delivery, signed URLs, per‑user access control
Live Class Integration
Zoom API / Google Meet / Jitsi Meet
Meeting creation, join links, attendance webhooks
Payment Gateway
Razorpay (India) / Stripe (International)
Online fee collection via checkout SDK; webhook consumed by Supabase Edge Function
PDF Certificate & Invoice Generation
Supabase Edge Function (Deno) with pdf-lib or jsPDF
Serverless generation of PDF certificates and GST invoices triggered by database events
Notifications (Email/SMS)
Twilio (SMS), SendGrid / Resend (Email), Supabase Realtime (in‑app)
Unified notification engine – transactional emails, SMS reminders, real‑time in‑app alerts
Background Jobs / Cron
Supabase Cron (pg_cron) or external scheduler (e.g., QStash)
Trigger automated payment reminders, certificate issuance, attendance processing
AI Chatbot / Recommendations
OpenAI API / custom model (called from Edge Function)
Could‑Have AI learning assistant; recommendations based on student progress
File Storage
Supabase Storage (S3‑compatible)
Assignments, course attachments, certificate templates, logos
Authentication
Supabase Auth (JWT + Row Level Security)
Multi‑role login (admin, faculty, student, parent); social login if needed
Real‑time Features
Supabase Realtime (WebSockets)
Group chat, live attendance code sync, instant notifications
Monitoring
Sentry (frontend), Supabase Logs + external uptime monitor
Error tracking, performance monitoring
Deployment
Vercel (Next.js), Supabase Cloud
Production hosting with auto‑scaling, CI/CD via GitHub


