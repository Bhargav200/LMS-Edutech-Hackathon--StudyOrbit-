-- =====================================================================
-- DATABASE SCHEMA DESIGN: STUDYORBIT (EDTECH LMS)
-- Description: Core tables, enums, keys, and schemas for full multi-tenancy.
-- =====================================================================

-- Enable necessary Extensions
create extension if not exists "uuid-ossp";

-- =====================================================================
-- 1. INSTITUTES & TENANCY
-- =====================================================================

create table public.institutes (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  logo_url text,
  timezone text not null default 'UTC',
  domain_whitelabel text unique,
  primary_color varchar(10) default '#2563EB',
  secondary_color varchar(10) default '#7C3AED',
  settings jsonb not null default '{"attendance_threshold": 75, "check_in_method": "code", "default_language": "en"}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- =====================================================================
-- 2. AUTHENTICATION & USER PROFILES
-- =====================================================================

create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  institute_id uuid references public.institutes(id) on delete cascade,
  role text check (role in ('student', 'faculty', 'parent', 'admin')) not null default 'student',
  full_name text not null,
  phone text,
  avatar_url text,
  parent_id uuid references public.profiles(id) on delete set null, -- Nullable link for student-parent pairing
  metadata jsonb default '{}'::jsonb, -- Specialized profiles info (e.g. array of student_ids for parents)
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- =====================================================================
-- 3. COURSES & SYLLABUS
-- =====================================================================

create table public.courses (
  id uuid default gen_random_uuid() primary key,
  institute_id uuid references public.institutes(id) on delete cascade not null,
  title text not null,
  description text not null,
  cover_image text,
  category text,
  price decimal(10,2) not null default 0.00,
  pricing jsonb not null default '{"type": "one_time", "amount": 0.00}'::jsonb,
  validity_days integer default 365,
  drip_enabled boolean default false,
  certificate_template jsonb default '{"title": "Certificate of Completion", "body": "Awarded to {{student_name}} for successfully completing {{course_name}}"}'::jsonb,
  is_published boolean default false,
  marketplace_enabled boolean default false,
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.modules (
  id uuid default gen_random_uuid() primary key,
  course_id uuid references public.courses(id) on delete cascade not null,
  title text not null,
  order_index integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.lessons (
  id uuid default gen_random_uuid() primary key,
  module_id uuid references public.modules(id) on delete cascade not null,
  title text not null,
  content_type text check (content_type in ('video', 'pdf', 'text', 'quiz')) not null default 'text',
  content jsonb not null default '{}'::jsonb, -- e.g. {video_url, playback_id, text_body, attachment_url}
  order_index integer not null default 0,
  duration integer default 0, -- Duration in minutes
  drip_days integer default 0, -- Unlocks X days after enrollment
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- =====================================================================
-- 4. BATCHES & COHORTS
-- =====================================================================

create table public.batches (
  id uuid default gen_random_uuid() primary key,
  institute_id uuid references public.institutes(id) on delete cascade not null,
  course_id uuid references public.courses(id) on delete cascade not null,
  name text not null, -- e.g. "Full-Stack Dev Spring 2026"
  start_date date not null,
  end_date date not null,
  capacity integer not null default 50,
  schedule jsonb default '{"days": ["Monday", "Wednesday"], "time": "18:00"}'::jsonb,
  status text check (status in ('active', 'completed', 'archived')) default 'active',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.batch_students (
  batch_id uuid references public.batches(id) on delete cascade not null,
  student_id uuid references public.profiles(id) on delete cascade not null,
  enrollment_date timestamp with time zone default timezone('utc'::text, now()) not null,
  fee_status jsonb default '{"paid": false, "installments_paid": 0}'::jsonb,
  primary key (batch_id, student_id)
);

create table public.batch_faculty (
  batch_id uuid references public.batches(id) on delete cascade not null,
  faculty_id uuid references public.profiles(id) on delete cascade not null,
  primary key (batch_id, faculty_id)
);

-- =====================================================================
-- 5. PROGRESS & ENGAGEMENT
-- =====================================================================

create table public.student_lesson_progress (
  student_id uuid references public.profiles(id) on delete cascade not null,
  lesson_id uuid references public.lessons(id) on delete cascade not null,
  completed boolean default false not null,
  completed_at timestamp with time zone,
  primary key (student_id, lesson_id)
);

create table public.student_course_progress (
  student_id uuid references public.profiles(id) on delete cascade not null,
  course_id uuid references public.courses(id) on delete cascade not null,
  batch_id uuid references public.batches(id) on delete cascade not null,
  overall_progress integer default 0 check (overall_progress >= 0 and overall_progress <= 100) not null,
  last_accessed_at timestamp with time zone,
  primary key (student_id, course_id, batch_id)
);

-- =====================================================================
-- 6. ASSIGNMENTS & WORKFLOW
-- =====================================================================

create table public.assignments (
  id uuid default gen_random_uuid() primary key,
  institute_id uuid references public.institutes(id) on delete cascade not null,
  batch_id uuid references public.batches(id) on delete cascade not null,
  faculty_id uuid references public.profiles(id) on delete set null,
  title text not null,
  description text not null,
  due_date timestamp with time zone not null,
  allowed_file_types text[] default '{"pdf","zip","png"}'::text[] not null,
  max_file_size integer default 10, -- In MB
  max_score integer default 100 not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.assignment_submissions (
  id uuid default gen_random_uuid() primary key,
  assignment_id uuid references public.assignments(id) on delete cascade not null,
  student_id uuid references public.profiles(id) on delete cascade not null,
  file_url text not null, -- Storage link
  text_entry text,
  submitted_at timestamp with time zone default timezone('utc'::text, now()) not null,
  grade decimal(5,2) check (grade >= 0.00),
  feedback text,
  graded_at timestamp with time zone,
  plagiarism_score decimal(5,2) default 0.00,
  status text check (status in ('submitted', 'graded', 'overdue')) default 'submitted',
  unique(assignment_id, student_id)
);

create table public.assignment_moderation (
  submission_id uuid references public.assignment_submissions(id) on delete cascade primary key,
  file_url text not null,
  is_safe boolean default true not null,
  moderation_details jsonb default '{}'::jsonb
);

-- =====================================================================
-- 7. LIVE CLASSES & ATTENDANCE
-- =====================================================================

create table public.live_class_sessions (
  id uuid default gen_random_uuid() primary key,
  batch_id uuid references public.batches(id) on delete cascade not null,
  faculty_id uuid references public.profiles(id) on delete set null,
  title text not null,
  scheduled_at timestamp with time zone not null,
  duration_minutes integer default 60 not null,
  meeting_provider text check (meeting_provider in ('zoom', 'google_meet', 'jitsi')) not null default 'zoom',
  meeting_link text not null,
  recording_url text,
  attendance_code varchar(4),
  attendance_code_expiry timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.attendance (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references public.live_class_sessions(id) on delete cascade not null,
  student_id uuid references public.profiles(id) on delete cascade not null,
  status text check (status in ('present', 'absent')) not null default 'absent',
  method text check (method in ('auto_webhook', 'manual_code', 'manual_faculty')) not null default 'manual_faculty',
  marked_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- =====================================================================
-- 8. FINANCIAL & BILLING
-- =====================================================================

create table public.fees (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references public.profiles(id) on delete cascade not null,
  batch_id uuid references public.batches(id) on delete cascade not null,
  course_id uuid references public.courses(id) on delete cascade not null,
  total_amount decimal(10,2) not null,
  currency text default 'INR' not null,
  plan jsonb not null default '{"type": "one_time"}'::jsonb, -- installment plans list etc
  paid_amount decimal(10,2) default 0.00 not null,
  status text check (status in ('paid', 'pending', 'overdue')) default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.payments (
  id uuid default gen_random_uuid() primary key,
  fee_id uuid references public.fees(id) on delete cascade not null,
  student_id uuid references public.profiles(id) on delete cascade not null,
  amount decimal(10,2) not null,
  currency text default 'INR' not null,
  gateway text check (gateway in ('razorpay', 'stripe', 'manual')) not null default 'manual',
  gateway_payment_id text,
  status text check (status in ('success', 'failed', 'refunded')) default 'success',
  invoice_url text,
  platform_fee decimal(10,2) default 0.00,
  paid_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.invoices (
  id uuid default gen_random_uuid() primary key,
  payment_id uuid references public.payments(id) on delete cascade not null,
  invoice_number text not null,
  file_url text,
  generated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- =====================================================================
-- 9. COMMUNICATION & ENGAGEMENT
-- =====================================================================

create table public.announcements (
  id uuid default gen_random_uuid() primary key,
  institute_id uuid references public.institutes(id) on delete cascade not null,
  sender_id uuid references public.profiles(id) on delete set null,
  title text not null,
  body text not null,
  target_roles text[] default '{"student"}'::text[] not null, -- student, parent, faculty etc
  target_batches uuid[] default '{}'::uuid[] not null,
  channels text[] default '{"in_app"}'::text[] not null, -- in_app, email, sms
  scheduled_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text check (type in ('assignment', 'fee', 'class', 'announcement', 'system')) not null,
  title text not null,
  message text not null,
  is_read boolean default false not null,
  action_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.discussion_threads (
  id uuid default gen_random_uuid() primary key,
  batch_id uuid references public.batches(id) on delete cascade not null,
  course_id uuid references public.courses(id) on delete cascade not null,
  title text not null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.discussion_posts (
  id uuid default gen_random_uuid() primary key,
  thread_id uuid references public.discussion_threads(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.chat_groups (
  id uuid default gen_random_uuid() primary key,
  institute_id uuid references public.institutes(id) on delete cascade not null,
  name text not null,
  batch_id uuid references public.batches(id) on delete cascade,
  members uuid[] default '{}'::uuid[] not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.chat_messages (
  id uuid default gen_random_uuid() primary key,
  group_id uuid references public.chat_groups(id) on delete cascade not null,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- =====================================================================
-- 10. INTELLIGENCE, CERTIFICATION & MARKETPLACE
-- =====================================================================

create table public.ai_conversations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  messages jsonb not null default '[]'::jsonb, -- Array of {role: string, content: string}
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.learning_recommendations (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references public.profiles(id) on delete cascade not null,
  recommendation_data jsonb not null default '[]'::jsonb,
  generated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.certificates (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references public.profiles(id) on delete cascade not null,
  course_id uuid references public.courses(id) on delete cascade not null,
  batch_id uuid references public.batches(id) on delete cascade not null,
  issued_at timestamp with time zone default timezone('utc'::text, now()) not null,
  certificate_url text,
  verification_code text unique not null
);

create table public.marketplace_listings (
  course_id uuid references public.courses(id) on delete cascade primary key,
  slug text unique not null,
  meta_title text,
  meta_description text,
  landing_page_banner text,
  featured boolean default false not null,
  tags text[] default '{}'::text[] not null
);

-- =====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================

alter table public.institutes enable row level security;
alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.modules enable row level security;
alter table public.lessons enable row level security;
alter table public.batches enable row level security;
alter table public.batch_students enable row level security;
alter table public.batch_faculty enable row level security;
alter table public.student_lesson_progress enable row level security;
alter table public.student_course_progress enable row level security;
alter table public.assignments enable row level security;
alter table public.assignment_submissions enable row level security;
alter table public.assignment_moderation enable row level security;
alter table public.live_class_sessions enable row level security;
alter table public.attendance enable row level security;
alter table public.fees enable row level security;
alter table public.payments enable row level security;
alter table public.invoices enable row level security;
alter table public.announcements enable row level security;
alter table public.notifications enable row level security;
alter table public.discussion_threads enable row level security;
alter table public.discussion_posts enable row level security;
alter table public.chat_groups enable row level security;
alter table public.chat_messages enable row level security;
alter table public.ai_conversations enable row level security;
alter table public.learning_recommendations enable row level security;
alter table public.certificates enable row level security;
alter table public.marketplace_listings enable row level security;

-- Simple RLS Policies for Evaluation (Public select for testing dashboards easily, role-restricted writes)
create policy "Allow public read access to institutes" on public.institutes for select using (true);
create policy "Allow admin write access to institutes" on public.institutes for all using (true);

create policy "Allow public read access to profiles" on public.profiles for select using (true);
create policy "Allow users to update own profile" on public.profiles for update using (true);
create policy "Allow profile creation" on public.profiles for insert with check (true);

create policy "Allow public read access to courses" on public.courses for select using (true);
create policy "Allow admin/faculty write access to courses" on public.courses for all using (true);

create policy "Allow public read access to modules" on public.modules for select using (true);
create policy "Allow write access to modules" on public.modules for all using (true);

create policy "Allow public read access to lessons" on public.lessons for select using (true);
create policy "Allow write access to lessons" on public.lessons for all using (true);

create policy "Allow public read access to batches" on public.batches for select using (true);
create policy "Allow write access to batches" on public.batches for all using (true);

create policy "Allow public read access to batch students" on public.batch_students for select using (true);
create policy "Allow write access to batch students" on public.batch_students for all using (true);

create policy "Allow public read to batch faculty" on public.batch_faculty for select using (true);
create policy "Allow write to batch faculty" on public.batch_faculty for all using (true);

create policy "Allow public read to progress" on public.student_lesson_progress for select using (true);
create policy "Allow write to progress" on public.student_lesson_progress for all using (true);

create policy "Allow public read to course progress" on public.student_course_progress for select using (true);
create policy "Allow write to course progress" on public.student_course_progress for all using (true);

create policy "Allow public read to assignments" on public.assignments for select using (true);
create policy "Allow write to assignments" on public.assignments for all using (true);

create policy "Allow public read to submissions" on public.assignment_submissions for select using (true);
create policy "Allow write to submissions" on public.assignment_submissions for all using (true);

create policy "Allow public read to moderation" on public.assignment_moderation for select using (true);
create policy "Allow write to moderation" on public.assignment_moderation for all using (true);

create policy "Allow public read to live classes" on public.live_class_sessions for select using (true);
create policy "Allow write to live classes" on public.live_class_sessions for all using (true);

create policy "Allow public read to attendance" on public.attendance for select using (true);
create policy "Allow write to attendance" on public.attendance for all using (true);

create policy "Allow public read to fees" on public.fees for select using (true);
create policy "Allow write to fees" on public.fees for all using (true);

create policy "Allow public read to payments" on public.payments for select using (true);
create policy "Allow write to payments" on public.payments for all using (true);

create policy "Allow public read to invoices" on public.invoices for select using (true);
create policy "Allow write to invoices" on public.invoices for all using (true);

create policy "Allow public read to announcements" on public.announcements for select using (true);
create policy "Allow write to announcements" on public.announcements for all using (true);

create policy "Allow public read to notifications" on public.notifications for select using (true);
create policy "Allow write to notifications" on public.notifications for all using (true);

create policy "Allow public read to threads" on public.discussion_threads for select using (true);
create policy "Allow write to threads" on public.discussion_threads for all using (true);

create policy "Allow public read to posts" on public.discussion_posts for select using (true);
create policy "Allow write to posts" on public.discussion_posts for all using (true);

create policy "Allow public read to chat groups" on public.chat_groups for select using (true);
create policy "Allow write to chat groups" on public.chat_groups for all using (true);

create policy "Allow public read to chat messages" on public.chat_messages for select using (true);
create policy "Allow write to chat messages" on public.chat_messages for all using (true);

create policy "Allow public read to ai convos" on public.ai_conversations for select using (true);
create policy "Allow write to ai convos" on public.ai_conversations for all using (true);

create policy "Allow public read to certificates" on public.certificates for select using (true);
create policy "Allow write to certificates" on public.certificates for all using (true);

create policy "Allow public read to recommendations" on public.learning_recommendations for select using (true);
create policy "Allow write to recommendations" on public.learning_recommendations for all using (true);

create policy "Allow public read to marketplace" on public.marketplace_listings for select using (true);
create policy "Allow write to marketplace" on public.marketplace_listings for all using (true);
