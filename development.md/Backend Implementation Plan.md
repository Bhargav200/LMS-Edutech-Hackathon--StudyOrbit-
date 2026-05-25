Backend Implementation Plan
All‑in‑One EdTech LMS (Next.js + Supabase)



This plan provides a step‑by‑step blueprint to implement the entire backend, aligned with the UI flow you already designed. It covers database design, authentication, file storage, real‑time events, serverless functions, third‑party integrations, and multi‑tenancy – all using Supabase as the core backend and Next.js as the frontend (API routes where needed).

1. Architecture Overview
Layer	Technology
Database	PostgreSQL (via Supabase)
Auth	Supabase Auth (JWT + Row‑Level Security)
File Storage	Supabase Storage (S3‑compatible) + Edge Function for content moderation
Realtime	Supabase Realtime (WebSockets) – for chat, attendance codes, live notifications
Business Logic	Supabase Edge Functions (Deno) – payment webhooks, certificate generation, automated reminders, AI, attendance auto‑mark
Server‑side APIs	Next.js API Routes (App Router) – secure calls for payment creation, email/SMS sending, AI integration
Client‑side Queries	Supabase JavaScript client (from Next.js) – direct DB queries with RLS for CRUD
Scheduled Jobs	pg_cron (Supabase) or external (QStash) – for automated reminders, certificate checks
External Services	Razorpay, Stripe, Zoom/Google Meet, Resend, Twilio, LLM API (Groq/DeepSeek/OpenAI), Content moderation API
Multi‑tenancy: Every table contains institute_id (UUID) referencing institutes.id. Row‑Level Security policies ensure users can only see data from their own institute. The auth system assigns institute_id to each user during sign‑up / invitation.

2. Database Schema (Multi‑tenant from Day One)
All tables have these common columns: id UUID PRIMARY KEY DEFAULT gen_random_uuid(), created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(), and institute_id UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE (except the institutes table itself).

Core Tables
institutes
id, name, logo_url, timezone, domain_whitelabel, primary_color, secondary_color, settings JSONB (attendance threshold, check‑in method, etc.)

profiles (extends Supabase auth.users)
id UUID REFERENCES auth.users

institute_id, role TEXT CHECK (role IN ('admin','faculty','student','parent')), full_name, phone, avatar_url, metadata JSONB (for parent: linked student IDs, etc.)

batches
id, institute_id, name, course_id REFERENCES courses(id), faculty_id UUID[] (array of faculty), start_date, end_date, schedule JSONB (recurring days/times), max_students, status

batch_students
batch_id, student_id (REFERENCES profiles.id), enrollment_date, fee_status JSONB

courses
id, institute_id, title, description, cover_image, category, pricing JSONB (one‑time/installments), validity_days, drip_enabled, certificate_template JSONB, is_published, marketplace_enabled, metadata

modules and lessons
modules: id, course_id, title, order_index

lessons: id, module_id, title, content_type (video, pdf, text, quiz), content JSONB (video URL, pdf URL, text body), order_index, duration, drip_days

assignments
id, batch_id, faculty_id, title, description, due_date, allowed_file_types, max_file_size, created_at

assignment_submissions
id, assignment_id, student_id, file_url, text_entry, submitted_at, grade, feedback, graded_at, plagiarism_score

attendance
id, batch_id, class_id (from live_class_sessions), student_id, status (present/absent), method (manual/code/link/zoom_webhook), marked_at

live_class_sessions
id, batch_id, faculty_id, title, scheduled_at, duration, meeting_provider, meeting_link, recording_url, attendance_code (4‑digit), attendance_code_expiry

fees
id, student_id, batch_id, total_amount, plan JSONB (installments list), paid_amount, status, currency

payments
id, fee_id, student_id, amount, currency, gateway (razorpay/stripe), gateway_payment_id, status, invoice_url, paid_at

certificates
id, student_id, course_id, batch_id, issued_at, certificate_url, verification_code

announcements
id, institute_id, sender_id, title, body, target_roles, target_batches, channels

notifications
id, user_id, type (assignment, fee, class, announcement), title, message, is_read, action_url

discussion_threads and discussion_posts
threads: id, batch_id, course_id, title, created_by

posts: id, thread_id, user_id, content, created_at

chat_groups and chat_messages (Could‑Have)
groups: id, name, batch_id, members UUID[]

messages: id, group_id, sender_id, content, created_at

ai_conversations (Could‑Have)
id, user_id, messages JSONB (array of {role, content})

3. Authentication & Role Management
Use Supabase Auth with email/password (and optional magic link).

A trigger on auth.users creates a profile row with default role = 'student' and institute_id = NULL (admin will set later).

Admins invite users via Edge Function: admin enters email + role → Edge Function creates a Supabase user (or generates sign‑up link) and sets profile metadata (role, institute_id). Invite email sent via Resend.

Row‑Level Security policies: every table enforces institute_id = auth.jwt()->>'institute_id' (we store institute_id in user’s app_metadata during invite creation). Custom JWT claims are set in the profile trigger or invite Edge Function.

Login screen calls supabase.auth.signInWithPassword(). On success, client reads profile role to route to correct dashboard.

4. File Storage & Content Moderation
Supabase Storage Buckets:

course-assets (videos, PDFs, images) – public read with signed URLs for videos.

assignment-submissions – private (RLS: only owner student and assigned faculty).

certificates – private (RLS: only recipient and admin).

institute-logos – public.

Content Moderation (for assignments):

When a student uploads a file to assignment-submissions, an Edge Function triggers via Storage webhook.

The Edge Function sends the file to a moderation API (e.g., Sightengine for images/video, or simple extension checks for PDFs). If unsafe, it moves the file to a quarantine bucket and notifies the faculty.

For now, we can start with basic extension/type validation and add external moderation later.

Video Streaming:

Videos are uploaded to Mux or Cloudflare Stream (from admin panel). The course builder receives a playback ID and saves it in lesson.content. Signed URLs are generated via Edge Function for secure playback.

5. Core API / Edge Functions by Feature
All business logic that requires secret keys, heavy processing, or cross‑service calls is implemented in Supabase Edge Functions or Next.js API Routes. Client‑side Supabase client is used for simple CRUD when RLS is sufficient.

5.1 Admin Setup & Onboarding
Create Institute – Next.js API route creates institutes row, sets admin’s profile institute_id.

Invite User – Edge Function invite-user: receives {email, role, institute_id}, creates auth user, sends email with Resend (or sets temporary password).

Batch & Course CRUD – Supabase client (RLS ensures admin of institute only). Course pricing saved as JSON.

Certificate Template – Save HTML/JSON template in courses.certificate_template. Edge Function generate-certificate uses Puppeteer (or pdf‑lib) to render PDF on course completion.

5.2 Payment Integration (Razorpay + Stripe)
Create Order / Payment Intent – Next.js API route:

For Razorpay: creates order on server, returns order_id.

For Stripe: creates PaymentIntent with amount and currency.

Client‑side Checkout – Frontend uses Razorpay checkout.js or Stripe Elements; after success, calls Edge Function payment-webhook (which receives gateway callback).

Webhook Handler (payment-webhook):

Verifies signature (Razorpay/Stripe).

Updates payments and fees table (paid amount, status).

Generates invoice PDF (using Edge Function generate-invoice) and stores in storage.

Sends confirmation email via Resend, in‑app notification via Supabase Realtime.

Payment Reminders – pg_cron job runs daily: finds unpaid installments where due date passed, triggers Edge Function send-reminder that emails/SMS via Resend/Twilio.

5.3 Live Class Management (Zoom / Google Meet)
Create Meeting – Next.js API route /api/meetings:

Receives schedule details.

Calls Zoom API (JWT/OAuth) or Google Calendar API to create a meeting.

Returns meeting link; stores in live_class_sessions with provider.

Attendance Webhook – Zoom/Meet webhook sends participant join/leave events → Edge Function attendance-webhook: matches email to profile, marks attendance auto‑matically in attendance table.

Manual Attendance (4‑digit code) – Faculty starts class, Edge Function generates a random 4‑digit code with 10‑min TTL stored in Supabase (with real‑time). Students submit code via real‑time channel; Edge Function validates and marks present.

Recording – After class, provider sends recording URL (if available) → webhook updates live_class_sessions.recording_url.

5.4 Assignment Submission & Grading
File Upload – Student uploads to assignment-submissions bucket using Supabase client (RLS). File path includes assignment_id.

Submission Trigger – A database trigger on insert into assignment_submissions sends real‑time notification to faculty (via Supabase Realtime).

Grading – Faculty updates grade and feedback through Supabase client (RLS). A trigger notifies student.

Plagiarism Check (Could‑Have) – Edge Function triggered on submission upload: sends file to external plagiarism API (or simple text comparison). Stores score in plagiarism_score.

5.5 Progress Tracking & Certification
Lesson Completion – Student marks lesson as complete; frontend updates student_lesson_progress table (student_id, lesson_id, completed_at).

Progress Calculation – View computed on the fly with SQL queries (RLS ensures student sees own).

Certificate Issuance – pg_cron checks every hour for students who completed all lessons + attendance threshold. Edge Function issue-certificate generates PDF using saved template, stores in storage, inserts certificates row, notifies student.

5.6 Communication (Announcements, Notifications, Chat)
Announcements – Admin/Faculty posts; frontend inserts into announcements. Edge Function deliver-announcement reads target roles/batches, fetches relevant user IDs, creates notifications rows and sends real‑time event. Email/SMS via Resend/Twilio.

Notifications – Real‑time: Supabase Realtime channel per user; client subscribes on login. For offline, email/SMS.

Group Chat (Could‑Have) – Uses Supabase Realtime Broadcast. Edge Function send-message validates membership and broadcasts.

5.7 AI Assistant & Recommendations (Could‑Have, Modular LLM)
Edge Function ai-chat:

Receives user message and conversation history.

Calls LLM API (Groq / DeepSeek / OpenAI) using environment variable for provider/endpoint.

Returns response; logs conversation to ai_conversations.

Recommendations: Edge Function generate-recommendations (scheduled) analyzes progress data and sends push notification with suggestions.

Provider Abstraction: The Edge Function reads LLM_PROVIDER env var (e.g., groq), uses respective SDK. Switching requires changing endpoint and API key only.

6. Real‑time Setup
Enable Supabase Realtime for tables: notifications, chat_messages, live_class_sessions (attendance code), assignments (new submission alerts).

Client subscribes to channels filtered by institute_id and user ID.

For attendance codes, a real‑time channel broadcasts code to batch students; when submitted, Edge Function validates against a stored code with expiry.

7. Scheduled Jobs (pg_cron)
Payment Reminders: every 6 hours, select overdue installments, call send-reminder.

Certificate Issuance: every hour, call issue-certificate for eligible students.

Dropout Risk Alerts: daily, update a flag in student_progress if attendance < threshold.

8. Row‑Level Security (RLS) Policies
For every table, define policies:

SELECT: institute_id = (SELECT institute_id FROM profiles WHERE id = auth.uid())

INSERT: same check, plus role‑based allowed.

UPDATE/DELETE: only owner (e.g., student own submission) or faculty/admin.

Example:

sql
CREATE POLICY "Students see own submissions" ON assignment_submissions
FOR SELECT USING (student_id = auth.uid());
9. Implementation Order (Aligned with UI Flow)
Database & Auth Setup – Create schema, profiles, institutes, RLS, invite function.

Admin Onboarding – Institute creation, batch/course CRUD, user invites.

Course Content Delivery – Module/lesson builder, video upload (Mux), course player API.

Fee & Payment Integration – Pricing setup, Razorpay/Stripe webhooks, invoices, reminders.

Live Class & Attendance – Zoom/Google Meet integration, scheduling, webhook, manual code attendance.

Assignment Lifecycle – Creation, submission, grading, file storage with moderation.

Progress & Certificates – Lesson tracking, progress views, auto‑issuance.

Notifications & Announcements – Realtime + email/SMS delivery.

Marketplace (Should‑Have) – Public course listing API, search, landing pages.

Parent Portal (Should‑Have) – Parent‑child linking, read‑only views, payment on behalf.

Community & Chat (Could‑Have) – Forums, real‑time group chat.

AI Features (Could‑Have) – Modular chatbot, recommendations.

White‑labeling & Multi‑language – Domain settings, translations.

10. Testing Considerations
Test RLS by logging in as different roles.

Simulate webhook signatures using tools.

Load testing for concurrent class attendance and video streaming.

Payment failure scenarios (expired cards, network issues).

AI integration with different LLM providers using feature flags.

Content moderation false positives – manual review queue.