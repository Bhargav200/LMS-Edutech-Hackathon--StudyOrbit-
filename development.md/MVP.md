# MVP Plan: All-in-One EdTech LMS

---

## 1. Product Overview

**One‑liner vision:**  
A unified platform that replaces all disconnected tools for educational institutes, coaching centers, and training organizations – combining course delivery, live classes, assignments, fee collection, automated communication, student engagement, and AI‑powered learning support into a single, white‑labelled experience.

---

## 2. Finalized MVP Features (Phase 1 Full Scope)

The Phase 1 build includes all **Must‑Have**, **Should‑Have**, and **selected Could‑Have** features as finalised. This delivers a complete, market‑ready product, not a minimal slice.

### 🟢 Must‑Have (Core Foundation)
- **Institute setup** with branding (logo, name, timezone)
- **User role management** – Admin, Faculty, Student
- **Batch & section management** – create academic batches, assign faculty/students, define schedule
- **Course & product manager** – create courses with modules/lessons (text, video, PDF, attachments), set one‑time or instalment pricing, access validity
- **Course builder** – structured content creation, video embedding, file attachments
- **Secure video streaming** – HLS delivery, resume, speed control, signed URLs
- **Live class integration** – Zoom/Google Meet/Jitsi scheduling, auto‑generated join links, one‑click join, auto‑attendance via webhook
- **Assignment management** – creation, deadline, file upload submission, faculty grading & private feedback
- **Student dashboard** – pending assignments, upcoming classes, fee dues, course progress, announcements
- **My Courses** – enrolled courses with progress bar, last‑accessed lesson
- **Course player** – seamless content viewer, progress marking, resource downloads
- **Assignment submission portal** – upload, view status, receive feedback
- **Fee payment with integrated gateway** (Razorpay/Stripe) – UPI, card, netbanking; instant invoicing (GST‑compliant PDF)
- **Automated payment reminders** – configurable email/SMS/in‑app rules before/after due dates
- **Progress tracking** – per‑course completion %, lesson watch status, attendance logs
- **Auto‑generated PDF certificates** – issued on course completion (minimum attendance/assignment criteria)
- **Notifications** – class reminders, assignment deadlines, fee alerts, announcements (in‑app, email, SMS)
- **Faculty dashboard** – class calendar, start meeting, manual attendance marking, student progress monitoring, content upload, batch announcements
- **Attendance management** – manual/auto marking, basic reports
- **Basic data security** – HTTPS, encrypted PII, role‑based access control
- **Mobile‑responsive web app (PWA)** – works on all devices
- **Unified notification engine** – templated messaging across channels

### 🟡 Should‑Have (Value Amplifiers)
- **Digital course marketplace** – public‑facing catalogue with search, filters, course landing pages, self‑enrolment
- **Revenue & collections dashboard** – basic analytics (total collections, pending dues)
- **Drip content / scheduled lesson release** – release lessons module‑wise or date‑wise
- **Basic quiz & assessment engine** – MCQ, auto‑grade, instant results
- **Course‑wise discussion forum** – batch‑based community, threaded discussions
- **Parent portal** – ward overview (attendance, progress, fee status, report cards), attendance & performance alerts
- **White‑labelling** – custom domain, primary/secondary colour themes
- **Advanced analytics** – completion rates, dropout risk flags, faculty performance
- **Multi‑currency support** – for global institutes

### 🔵 Could‑Have (Delight & Differentiation)
- **Real‑time group chats** – batch/project groups, direct messaging
- **Gamification** – points, badges, leaderboards
- **SCORM / xAPI content support** – advanced interactive content packages
- **Interactive whiteboard** – during live classes
- **Refund & cancellation management** – workflow for partial/full refunds
- **Plagiarism check integration** – on assignment submissions
- **Advanced certificate designer** – drag‑and‑drop, multiple templates, verification portal
- **4‑digit code & magic link check‑in** – easier attendance marking (replaces QR code)
- **Parent portal** – direct messaging with faculty, fee payment on behalf of ward
- **API & webhooks** – for CRM, accounting, external integrations
- **Multi‑language UI support** – regional inclusivity
- **AI‑powered learning recommendations & chatbot** – adaptive learning suggestions, conversational support

---

## 3. Detailed User Journey (Full Scope)

The following journey shows how all features come to life for each persona.

---

### 3.1 Admin Journey

**Onboarding**  
- Admin creates institute account → uploads logo, sets name, timezone → system generates default Admin role.  
- Invites Faculty & Students via email; sets their roles.

**Course & Batch Setup**  
- Creates a batch (e.g., “JEE 2027 Morning”) → assigns Faculty, defines schedule.  
- Opens Course Manager → builds course “Physics” with modules and lessons (videos, PDFs).  
- Sets pricing: one‑time fee or 3‑instalment plan.  
- Enables drip content (Should‑Have): Module 2 unlocks after 7 days.  
- Enables marketplace listing (Should‑Have): course appears on public page with search/filter.

**Fee & Payment**  
- Configures payment gateway (Razorpay).  
- Defines instalment amounts and due dates.  
- Sets up automated reminders: email 3 days before, SMS on due date, in‑app 1 day after.  
- Later views Revenue Dashboard: collections vs pending, per‑course revenue.

**Attendance & Policies**  
- Sets attendance threshold (75%) for certificate eligibility.  
- Chooses attendance method: Faculty can use **4‑digit code / magic link check‑in** (Could‑Have).  
- Configures certificate template with placeholders `{student_name}`, `{course_name}`, etc.

**White‑labelling** (Should‑Have)  
- Sets custom domain `learn.myinstitute.com`, picks brand colours. The entire student portal adopts the look.

**Communication**  
- Broadcasts announcements (holidays, exam schedules). Notification engine pushes to all channels.

**Advanced**  
- Integrates CRM via webhooks (Could‑Have).  
- Enables multi‑language UI: students can switch to Hindi/Marathi.  
- Views advanced analytics: at‑risk students, faculty performance.

---

### 3.2 Faculty Journey

**Daily Workflow**  
- Logs in → dashboard shows today’s live class, pending assignments to grade.  
- **Live Class**: clicks “Start Meeting” → Zoom/Meet opens. Attendance auto‑marked for joiners. For those in‑person, Faculty displays a 4‑digit code or sends magic link; students mark themselves present.  
- After class, recording auto‑archived.  
- **Attendance Management**: reviews auto‑marked list, manually adjusts if needed, sees batch attendance %.

**Content & Assignments**  
- Uploads additional resources via Course Content Manager.  
- Creates assignment: “Newton’s Laws Problem Set” → deadline, allowed file types.  
- Later reviews submissions: annotates PDF, leaves private feedback, marks grades.  
- Runs plagiarism check (Could‑Have) → sees similarity report.

**Progress Monitoring**  
- Checks per‑student progress: course completion %, quiz scores, attendance.  
- The system flags a student with low attendance and missing assignments → Faculty sends a nudge.  
- Uses AI Chatbot (Could‑Have): “Which students are below 60% attendance?” → Chatbot returns list and offers to send reminders.

**Engagement**  
- Posts in batch discussion forum (Should‑Have) to clarify doubts.  
- Participates in real‑time group chat (Could‑Have) during study hours.  
- Uses interactive whiteboard (Could‑Have) for live problem solving.

---

### 3.3 Student Journey

**Discovery & Enrolment**  
- Visits the **Digital Marketplace** (Should‑Have) → searches “JEE Physics” → views landing page with syllabus preview, instructor bio, pricing.  
- Registers, selects instalment plan, pays first instalment via UPI. Receives GST invoice instantly.

**Dashboard & Learning**  
- On login, dashboard shows: “Next class: 8 AM Physics”, “Assignment due in 2 days”, “Instalment 2 due in 5 days”, overall progress 12%.  
- Opens **My Courses** → selects Physics → Course Player launches first video. Video streams securely, resumes from last watch.  
- Completes lesson → progress bar updates; marks as done. Downloads PDF notes.

**Live Class & Attendance**  
- Reminder notification 15 mins before class. Clicks “Join Now”.  
- If required, enters 4‑digit code displayed by Faculty to mark attendance.  
- Attendance appears in progress tab.

**Assignments**  
- Views pending assignment → uploads scanned PDF → status changes to “Submitted”.  
- Later sees “Graded” → reads feedback, learns from corrections.

**Community & Gamification**  
- Joins batch discussion forum → posts doubt, receives peer/faculty reply.  
- Engages in group chat for quick problem solving.  
- Earns “Quick Learner” badge for completing a module early (Could‑Have gamification).  
- Sees leaderboard (opt‑in, anonymous) for motivation.

**AI Support** (Could‑Have)  
- AI Learning Assistant on dashboard: “Based on your progress, try this 10‑min recap on Rotational Motion.”  
- Opens AI Chatbot: “Explain torque with an example.” → Chatbot answers with text and diagrams.  
- AI recommends additional practice questions.

**Fee & Payments**  
- Receives reminder: “Instalment 2 due tomorrow.” Pays via portal, invoice generated.  
- Views complete payment history.

**Certification**  
- Completes all lessons, meets attendance threshold → system auto‑generates PDF certificate.  
- Downloads, shares on LinkedIn. Verification QR code links to a public verification page (Should‑Have/Could‑Have).

---

### 3.4 Parent Journey (Should‑Have + Could‑Have)

- Parent receives invitation from Admin, links child’s account.  
- Dashboard shows ward overview: attendance %, upcoming classes, fee status.  
- Alert: “Rohit missed Physics class today.” (Should‑Have)  
- Parent pays next fee instalment directly via **Fee Payment on Behalf of Ward** (Could‑Have).  
- Sends direct message to Physics faculty (Could‑Have): “Please provide extra practice.”  
- Downloads report card (progress report & certificate).

---

## 4. Edge Case Notes

Anticipating non‑happy paths ensures a robust MVP.

| Area | Edge Cases |
|------|------------|
| **User Onboarding** | Invitation link expired; email already registered (invite to another institute); user tries to join with wrong batch code. |
| **Role & Permissions** | A Faculty accidentally assigned as Student; a Student tries to access admin endpoints (must be blocked by RLS). |
| **Live Classes** | Meeting link expires or changes; host fails to start meeting; student joins after class ended; webhook failure – attendance not auto‑marked (fallback to manual). |
| **Attendance Code** | Code expires before student enters; code guessed by an outsider (tie to logged‑in user & batch, not global). Magic link shared externally – must be one‑time use per user. |
| **Video Streaming** | Slow internet – adaptive bitrate fails, player must buffer gracefully; signed URL expires mid‑playback; concurrent viewers exceed capacity (queue or degrade gracefully). |
| **Payment** | Payment fails (insufficient funds, timeout) – must show proper error and allow retry; webhook delayed/replayed – idempotency in invoice generation; instalment partially paid (manual offline payment recording). |
| **Fee Reminders** | Student pays just after reminder sent – stop further escalation; reminder sent to wrong contact (needs verified phone/email). |
| **Assignment Submission** | Student uploads corrupted file; file size exceeds limit; submits after deadline (reject or mark late, based on policy); faculty accidentally deletes submission. |
| **Certificate Generation** | Concurrent completion triggers duplicate certificate – idempotent generation; dynamic fields overflow (long names) – fix with text wrapping. |
| **Real‑time Chat** | Message sent while user offline → delivery on reconnect; inappropriate content – moderation/reporting (future). |
| **AI Chatbot** | Irrelevant queries – must gracefully decline or redirect; sensitive data leakage (ensure it doesn’t expose other students’ data). |
| **Multi‑currency** | Currency rates change; display and store amounts with currency code; payment gateway mismatch. |
| **Drip Content** | Faculty changes release schedule after some students already accessed – maintain consistency; preview as admin bypasses drip. |
| **Parent Portal** | Parent has multiple children in same institute; messaging faculty when multiple teachers assigned – ensure correct routing. |
| **Multi‑language** | Missing translations – fallback to English; right‑to‑left scripts (Arabic) layout. |
| **SCORM/xAPI** | Uploaded package fails to play due to cross‑origin issues; tracking data not sending – queue and retry. |

---

## 5. Tech Stack + Monetization Plan

### 5.1 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js (App Router) + Tailwind CSS – PWA, server‑rendered, responsive |
| **Backend & Database** | Supabase – PostgreSQL, Auth (JWT + RLS), Storage, Realtime, Edge Functions (Deno) |
| **Video Hosting** | Mux or Cloudflare Stream – HLS, secure signed URLs, adaptive streaming |
| **Live Class** | Zoom API / Google Meet / Jitsi Meet (meeting creation, webhooks) |
| **Payment Gateway** | Razorpay (India) / Stripe (International) – checkout SDK, webhook handling |
| **PDF Generation** | Supabase Edge Function with `pdf-lib` / `jsPDF` – certificates, invoices |
| **Notifications** | Twilio (SMS), SendGrid/Resend (Email), Supabase Realtime (in‑app) |
| **Cron / Background Jobs** | Supabase pg_cron (or Upstash QStash) – reminders, certificate triggers |
| **AI** | OpenAI API (or open‑source LLM) called from Edge Function – chatbot, recommendations |
| **File Storage** | Supabase Storage (S3‑compatible) – assignments, attachments, logos |
| **Monitoring** | Sentry (frontend), Supabase Logs, external uptime monitor |
| **Deployment** | Vercel (Next.js), Supabase Cloud, CI/CD via GitHub Actions |

### 5.2 Monetization Plan

The platform will generate revenue through a **multi‑tier SaaS subscription model** plus optional transaction‑based fees.

**1. Subscription Tiers (Monthly/Annual)**  
Institutes pay based on number of active students and feature set.

| Plan | Students | Must‑Have | Should‑Have | Could‑Have | Price (Indicative) |
|------|----------|-----------|-------------|------------|---------------------|
| Starter | Up to 100 | ✅ | ❌ | ❌ | $49/month |
| Growth | Up to 500 | ✅ | ✅ | ❌ | $149/month |
| Pro | Up to 2000 | ✅ | ✅ | ✅ (incl. AI) | $349/month |
| Enterprise | Unlimited | ✅ | ✅ | ✅ + dedicated support, custom integrations, SLA | Custom quote |

*White‑labelling and custom domain available from Growth and above.*

**2. Transaction Fee (Optional)**  
- 1‑2% per online fee collection (if using platform’s payment gateway aggregation). This covers payment processing and adds a scalable revenue stream.

**3. Marketplace Commission** (Future)  
- If independent instructors sell courses on the marketplace (beyond current MVP), the platform takes a 10‑20% commission.

**4. Add‑on Services**  
- Extra storage, advanced AI credits, premium support, or dedicated onboarding – billed separately.

**5. Freemium / Pilot**  
- A 14‑day free trial for institutes to experience the full platform with up to 50 students. Conversion driven by automated email sequences and dedicated onboarding.

---

This MVP plan covers the exact full scope you intend to build, maps out every user interaction, flags critical edge cases early, and pairs the revised tech stack (Next.js + Supabase) with a clear, scalable monetisation strategy. Ready to move into sprint planning and development.

