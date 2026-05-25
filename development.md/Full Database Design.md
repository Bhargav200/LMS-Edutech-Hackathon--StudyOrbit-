Full Database Design – All‑in‑One EdTech LMS (Multi‑tenant, Supabase PostgreSQL)


This document describes every table required to implement the complete platform. The design is multi‑tenant from day one — every table that belongs to an institute includes an institute_id column. Relationships are built with foreign keys and enforced by Row‑Level Security. All primary keys are UUIDs, and every table includes created_at and updated_at timestamps.

Core Identity & Multi‑Tenancy
Table: institutes
Stores the foundational information for each educational organisation, coaching centre, or training provider.
Columns: id, name, logo_url, timezone, domain_whitelabel, primary_color, secondary_color, settings (JSONB – attendance threshold, check‑in method, holiday calendar, language preferences).
Relationships: One institute has many profiles, batches, courses, announcements, and subscriptions.

Table: profiles
Extends Supabase’s built‑in auth.users table. Every authenticated user has exactly one profile.
Columns: id (references auth.users), institute_id (references institutes), role (one of 'admin', 'faculty', 'student', 'parent'), full_name, phone, avatar_url, metadata (JSONB – for parents: array of linked student IDs; for faculty: specialisations, etc.).
Relationships: A profile can belong to many batches as a student (via batch_students), teach many batches as faculty (stored in batches.faculty_id), submit assignments, make payments, send messages, and more.
Note: The institute_id is injected into the user’s JWT claim during invitation/sign‑up so that Row‑Level Security can filter data to the correct institute.

Academic Structure
Table: courses
Represents a single course or subject offered by an institute. A course can be sold as a stand‑alone product or bundled inside batches.
Columns: id, institute_id, title, description, cover_image, category, pricing (JSONB – contains type: 'one_time' or 'installment', amount/currency, installment schedule), validity_days, drip_enabled, certificate_template (JSONB – HTML template with placeholders), is_published, marketplace_enabled, metadata.
Relationships: One course can have many modules and can be linked to many batches. Course completion is tracked via student_course_progress.

Table: batches
A cohort or group of students that follows a specific course on a defined schedule.
Columns: id, institute_id, name, course_id (references courses), faculty_id (UUID array of profiles.id), start_date, end_date, schedule (JSONB – recurring days/time slots), max_students, status (active, archived).
Relationships: A batch has many students through batch_students, many live class sessions, assignments, and attendance records.

Table: batch_students
Junction table that links a student profile to a batch and holds enrolment‑specific information.
Columns: batch_id, student_id (references profiles), enrollment_date, fee_status (JSONB – can cache overall payment progress).
Relationships: Connects batches and profiles. Used to determine which students see a course, receive assignments, and can join live classes.

Table: modules
A container that groups related lessons within a course.
Columns: id, course_id, title, order_index.
Relationships: One module has many lessons. The order within a course is determined by order_index.

Table: lessons
An individual learning unit inside a module.
Columns: id, module_id, title, content_type ('video', 'pdf', 'text', 'quiz'), content (JSONB – for video: {provider, playback_id}; for pdf: {file_url}; for text: {body}), order_index, duration, drip_days (if drip is enabled, number of days after enrolment this lesson unlocks).
Relationships: Lessons are tracked per student in student_lesson_progress. A lesson can be a video streamed securely, a downloadable PDF, or embedded text.

Table: student_lesson_progress
Records which lessons a student has completed and when.
Columns: student_id, lesson_id, completed (boolean), completed_at. Unique constraint on (student_id, lesson_id).
Relationships: Used to calculate course progress and trigger certificate eligibility.

Table: student_course_progress
A denormalised summary of a student’s progress in a course/batch.
Columns: student_id, course_id, batch_id, overall_progress (percentage), last_accessed_at.
Relationships: Computed from student_lesson_progress; may be updated via triggers or scheduled jobs.

Assignments & Grading
Table: assignments
Created by faculty for a batch, with a deadline and submission rules.
Columns: id, batch_id, faculty_id (references profiles), title, description, due_date, allowed_file_types (text array), max_file_size, created_at.
Relationships: One assignment has many submissions.

Table: assignment_submissions
A student’s response to an assignment.
Columns: id, assignment_id, student_id, file_url (one or more files stored in Supabase Storage), text_entry, submitted_at, grade (numeric or letter), feedback, graded_at, plagiarism_score (from external check).
Relationships: Links a student to an assignment. A student can submit only once per assignment (enforced by unique constraint). The file upload triggers content moderation.

Table: assignment_moderation
Stores the result of automatic content moderation for submitted files.
Columns: submission_id, file_url, is_safe (boolean), moderation_details (JSONB – flags, confidence, labels).
Relationships: Tied to a submission. Used to quarantine unsafe files.

Live Classes & Attendance
Table: live_class_sessions
Each scheduled live class for a batch.
Columns: id, batch_id, faculty_id, title, scheduled_at, duration_minutes, meeting_provider (zoom, google_meet, jitsi), meeting_link, recording_url, attendance_code (4‑digit string), attendance_code_expiry.
Relationships: One session has many attendance records. The session is linked to the batch via batch_id.

Table: attendance
Records the presence or absence of a student in a live class session.
Columns: id, session_id (references live_class_sessions), student_id, status (present/absent), method (auto_webhook, manual_code, manual_faculty), marked_at.
Relationships: Combined with course progress, attendance is used to enforce certificate eligibility.

Financial – Student Fee Collection
Table: fees
Represents a student’s financial obligation for a batch/course.
Columns: id, student_id, batch_id, course_id, total_amount, currency, plan (JSONB – installment details: due dates, amounts, status of each), paid_amount, status (pending, partially_paid, paid).
Relationships: One fee can have many payments. The fee is linked to a student and batch.

Table: payments
A record of a single payment transaction made by a student.
Columns: id, fee_id, student_id, amount, currency, gateway (razorpay, stripe), gateway_payment_id, status (success, failed, refunded), invoice_url, platform_fee (optional – the fee deducted by the platform for transaction‑based monetisation), paid_at.
Relationships: Each payment belongs to a fee. A payment may be associated with an invoice stored in Supabase Storage.

Table: invoices
A generated PDF invoice for a student payment.
Columns: id, payment_id, invoice_number, file_url (in storage), generated_at.
Relationships: Linked to a payment; provides GST‑compliant receipts.

Financial – Institute Billing & SaaS Monetisation
Table: subscription_plans
The plans available for institutes (Starter, Growth, Pro, Enterprise).
Columns: id, name, monthly_price, annual_price, currency, max_students, features (JSONB – what feature sets are enabled, e.g., white‑label, AI, SCORM), stripe_monthly_price_id, stripe_annual_price_id.
Relationships: Institutes subscribe through subscriptions.

Table: subscriptions
Tracks an institute’s active plan.
Columns: id, institute_id, plan_id, status (active, cancelled, past_due), current_period_start, current_period_end, stripe_subscription_id, billing_email.
Relationships: Each institute has exactly one active subscription at a time. Subscription changes (upgrade/downgrade) are handled via Stripe and update this record.

Table: institute_payments
Records payments made by the institute for its subscription or add‑ons.
Columns: id, institute_id, subscription_id, amount, currency, gateway (stripe), gateway_invoice_id, status, paid_at.
Relationships: Used for revenue tracking and financial reporting.

Communication & Engagement
Table: announcements
Broadcast messages from admin or faculty to targeted audiences.
Columns: id, institute_id, sender_id, title, body, target_roles (text array, e.g., ['student', 'parent']), target_batches (UUID array), channels (text array – 'in_app', 'email', 'sms'), scheduled_at.
Relationships: When an announcement is sent, it triggers the creation of notifications for each relevant user.

Table: notifications
A per‑user notification record.
Columns: id, user_id, type (assignment, fee, class, announcement, system), title, message, is_read, action_url (deeplink to the relevant screen).
Relationships: Used to populate the notification bell and send push/email reminders. The real‑time channel delivers inserts directly to the frontend.

Table: discussion_threads
A forum thread inside a batch or course community.
Columns: id, batch_id, course_id, title, created_by.
Relationships: A thread contains many discussion_posts.

Table: discussion_posts
A single message in a thread.
Columns: id, thread_id, user_id, content, created_at.
Relationships: Part of the community feature; enables Q&A and peer interaction.

Table: chat_groups (Could‑Have)
Defines a real‑time chat group, typically for a batch or a project team.
Columns: id, name, batch_id, members (UUID array).
Relationships: Each group has many chat_messages.

Table: chat_messages (Could‑Have)
A message sent in a real‑time group chat.
Columns: id, group_id, sender_id, content, created_at.
Relationships: Uses Supabase Realtime Broadcast for delivery.

AI Assistant & Learning Recommendations (Could‑Have)
Table: ai_conversations
Stores the full conversation history between a user and the AI assistant.
Columns: id, user_id, messages (JSONB array of {role, content}), created_at, updated_at.
Relationships: One conversation per user (or multiple if needed). The AI module reads this to maintain context.

Table: learning_recommendations
Stores pre‑computed personalised recommendations for a student.
Columns: id, student_id, recommendation_data (JSONB – array of {lesson_id, reason, priority}), generated_at.
Relationships: Updated by a scheduled job that analyses progress and attendance.

Certificates
Table: certificates
A record of a certificate issued to a student upon course completion.
Columns: id, student_id, course_id, batch_id, issued_at, certificate_url (PDF in storage), verification_code (unique string for public verification).
Relationships: The certificate generation Edge Function inserts this row and uploads the PDF.

Marketplace (Should‑Have)
Table: marketplace_listings
When a course is marked marketplace_enabled = true, an optional row can be created here to enrich the public listing.
Columns: course_id, slug, meta_title, meta_description, landing_page_banner, featured (boolean), tags.
Relationships: Extends the course table with SEO and discovery metadata.

Multi‑Tenancy & Security
Every table (except institutes, plans, and subscriptions) holds an institute_id column that references institutes.id.

Row‑Level Security policies enforce that a user can only see rows belonging to their own institute. The institute_id is extracted from the JWT of the authenticated user.

All foreign keys cascade appropriately to maintain referential integrity when an institute is deleted.

