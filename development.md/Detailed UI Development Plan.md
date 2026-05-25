Detailed UI Development Plan – All‑in‑One EdTech LMS


This document describes every screen required for the full MVP (Must‑Have, Should‑Have, and selected Could‑Have features). It focuses solely on layout, components, and information architecture – no colors, fonts, or visual styling.

1. Global Layout Elements
All authenticated screens share a common shell:

Component	Description
Top Navigation Bar	Logo (left), Global Search (center – searches courses, assignments, students), Notification Bell (with badge count), User Avatar/Name (dropdown: Profile, Settings, Logout).
Left Sidebar (desktop) / Hamburger Drawer (mobile)	Role‑specific menu items. Collapsible on mobile.
Main Content Area	Scrollable, takes remaining width. Breadcrumbs optional.
Right Panel / Quick Actions (on some dashboards)	Contextual shortcuts or AI assistant drawer (Could‑Have).
2. Shared Screens (Unauthenticated)
2.1 Login Screen
Layout: Centered card (full‑page background optional).

Components:

Email/Phone input field.

Password input field with show/hide toggle.

"Forgot Password?" link.

"Log In" primary button.

Link to "Create Account" or "Enter Invite Code" (if applicable).

2.2 Forgot Password
Layout: Centered card.

Components: Email input, "Send Reset Link" button, Back to Login link.

2.3 Reset Password (from email link)
Layout: Centered card.

Components: New password field, Confirm password field, "Reset Password" button.

2.4 Accept Invitation / Sign Up (if self‑registration allowed)
Layout: Centered card.

Components: Name, Email, Password, Confirm Password, optionally an invite code field (pre‑filled). "Create Account" button.

3. Admin Portal Screens
Sidebar menu for Admin: Dashboard, Batches, Courses, Users, Finance, Marketplace, Settings, Reports.

3.1 Admin Dashboard
Main Area – Overview Cards (horizontal row):

Total Students, Total Faculty, Active Batches, Revenue This Month, Pending Fees.

Charts Area (row of two panels):

Revenue Trend (bar/line chart) – monthly collections.

Enrollment by Batch (pie/bar chart).

Recent Activity / Alerts Section:

Table: last 5 payments, last 5 enrollments, flagged at‑risk students.

Quick Action Buttons: "Create Batch", "Add Course", "Invite User", "Send Announcement".

3.2 Batch Management (List)
Top bar: "Batches" heading, "Add Batch" button, Search input, Filter by status (Active/Archived).

Batch List: Table or card list. Columns: Batch Name, Course, Faculty, Students Count, Start Date, Status, Actions (Edit, Archive, View Details).

Pagination.

3.3 Create / Edit Batch (Modal or separate page)
Form fields:

Batch Name (text).

Associated Course (dropdown – searchable).

Assigned Faculty (multi‑select or single select).

Start Date, End Date (date pickers).

Schedule Template (optional: recurring days, time slots).

Max Students (number).

Save / Cancel buttons.

3.4 Course Management (List)
Top bar: "Courses" heading, "Add Course" button, Search, Filter (Published/Draft/Archived).

Course List: Table with columns: Course Name, Price, Duration, Status, Enrollments, Actions (Edit, Duplicate, Delete).

For Marketplace (Should‑Have): Each course has a checkbox "List in Marketplace" and a link to Landing Page preview.

3.5 Create / Edit Course (Page)
Tabs/Sections:

Basic Info: Title, Description (rich text editor), Cover Image upload, Category.

Modules & Lessons: Drag‑and‑drop list. Each module expandable; inside, list of lessons (title, type: video/file/quiz). "Add Module", "Add Lesson" buttons.

Lesson detail panel: Title, Content Type selector, Video URL / Upload, PDF upload, Text editor.

Pricing: One‑time fee or Installments toggle; add installment rows (amount, due date offset or fixed date). Access validity in days.

Settings: Drip content toggle (if lesson release scheduling is enabled – Should‑Have). Prerequisites selection.

Certificate Template: Preview current template; "Edit Template" button leading to certificate designer.

Publish / Save Draft buttons.

3.6 User Management (List)
Table: Name, Email, Role (Admin/Faculty/Student), Batch (if student), Status (Active/Inactive), Actions (Edit, Deactivate, Resend Invite).

Filters: Role, Batch.

"Invite User" button opens modal:

Fields: Name, Email, Role selector. If Student, also Batch selector. Send invite.

3.7 Fee & Finance
Finance Dashboard (sub‑page): Summary cards (Total Collected, Pending, Projected), charts.

Fee Structure Templates (sub‑page): List of predefined fee plans for reuse. Create/Edit form similar to course pricing.

Payment Reminders: List of automated rules. Each rule: Trigger (X days before/after due), Channel (Email/SMS/In‑app), Template preview. "Add Rule" button.

Transactions Log: Table with Payment ID, Student, Amount, Date, Status, Invoice link.

3.8 Certificate Template Designer (Page)
Layout: Split view – Left: tools and placeholders; Center: Canvas preview; Right: properties.

Tools: Upload background image, add text block, add dynamic placeholder (student name, course, date, grade).

Placeholder list: drag onto canvas.

Preview button, Save.

3.9 Marketplace Settings (Should‑Have)
Page: Enable/Disable marketplace toggle.

Landing Page Defaults: Default banner, description.

SEO Fields: Meta title, description.

Course Card Layout: Choose fields to display.

3.10 White‑labeling Settings (Should‑Have, optional removal)
Form: Custom domain input, Primary color picker, Secondary color picker, Logo upload (light/dark), Favicon. Save.

3.11 Attendance & Policies
Attendance Threshold: slider/input (e.g., 75%).

Holiday Calendar: date picker to add non‑working days.

Check‑in Method: Radio buttons – Manual only / 4‑digit code / Magic link.

3.12 Reports & Analytics
Tabbed page: Enrollment, Revenue, Faculty Performance, Student Progress, Dropout Risk.

Each tab: date range picker, chart, and exportable table.

3.13 Notification Hub
Compose Announcement: Rich text, target audience (All / By Role / By Batch), channels (In‑app, Email, SMS). Send/Schedule.

Sent Announcements: Table with status.

4. Faculty Portal Screens
Sidebar: Dashboard, Calendar, Courses, Assignments, Students, Attendance, Community.

4.1 Faculty Dashboard
Cards: Today’s Classes (upcoming class with join button), Pending Assignments to grade, Unread Messages.

Student Activity Feed: latest submissions, recently active students.

Quick Access: "Take Attendance", "Create Assignment", "Post Announcement".

4.2 Class Calendar & Management
Calendar View: Month/Week/Day toggle. Events show class title, batch, time.

Click on event → popup with details: Join Meeting button, Mark Attendance button, Edit/Delete.

"Schedule Class" button → modal: Title, Batch, Date/Time, Meeting Platform (Zoom/Meet/Jitsi). Auto‑generate meeting link option.

4.3 Live Class Attendance (inside or separate)
Attendance Page: Select Batch & Class, then list of enrolled students with toggle Present/Absent.

Generate Code/Link button (Could‑Have) → displays a 4‑digit code and copyable link, with timer expiry.

Auto‑attendance from webhook displayed.

4.4 Course Content Management
Course Selector dropdown (assigned batches). Then module/lesson tree (same as admin course builder but read‑only for courses, editable for faculty‑assigned sections).

Upload/Edit Lesson modal: replace video, PDF, add text.

4.5 Assignment Management (List)
Filters: By Batch, by Status (Open, Closed, Graded).

Table: Assignment Title, Batch, Due Date, Submissions (count), Actions (View Submissions, Edit, Delete).

"Create Assignment" button → form: Title, Description, Batch, Due Date, Allowed file types (checkboxes), Max file size.

4.6 Assignment Review (Grading)
Page layout: Left panel – list of submissions (student name, status, submission date). Center – file preview (PDF/image viewer or text). Right panel – grading: Marks input, Feedback textarea, "Submit Grade" button.

Navigation: Next/Previous student.

Could‑Have: Plagiarism score indicator.

4.7 Student Progress
Batch Selector, then table: Student Name, Course Progress (bar), Avg Quiz Score, Attendance %, At‑risk flag.

Click student → detailed view: timeline of activities, all assignment scores, attendance records, course progress per module.

Actions: Send Message, Flag.

4.8 Announcements
Similar to admin but limited to own batches.

4.9 Community (Should‑Have / Could‑Have)
Discussion Forums: List of threads per batch/course. Thread view with posts, reply box.

Group Chat: Sidebar with batch groups, chat window with message list and input.

5. Student Portal Screens
Sidebar: Dashboard, My Courses, Assignments, Calendar, Payments, Community, Certificates, AI Assistant (Could‑Have).

5.1 Student Dashboard
Personalized Summary Cards:

Next Live Class (with Join button, time remaining).

Pending Assignments (count, next due).

Fee Status (overdue alert / upcoming installment).

Overall Progress (percentage bar).

Announcements: Recent institute/batch announcements.

Quick links: "Resume Last Course".

5.2 My Courses
List of enrolled courses/batches. Each card: course thumbnail, title, progress bar, "Continue" button.

Click → opens Course Player.

5.3 Course Player
Layout: Left/Right panel or top content area.

Header: Course title, module name, lesson title.

Content Area: Video player (with playback controls, speed), or rich text & images, or PDF viewer.

Resources Tab: downloadable files.

Navigation: Previous/Next lesson buttons. Mark complete checkbox.

Sidebar: Table of contents (modules/lessons) with completion checkmarks.

5.4 Assignments
List View: Upcoming (open) and Past (graded). For each: title, course, due date, status (Pending/Submitted/Graded).

Submit Assignment Page: Assignment details, file upload area (drag & drop), text entry box. Submit button.

View Feedback: After grading, see marks, feedback text, and optionally annotated file.

5.5 Live Class Access
Calendar View (similar to faculty but read‑only). Upcoming classes with Join button.

Attendance: If code required, a popup to enter 4‑digit code or click magic link (automatically marks present). Confirmation message.

5.6 Fee Payment & Invoices
Fee Summary: Total fee, paid, pending, next installment due.

Pay Button for pending items → leads to payment gateway integration (modal or redirect).

Transaction History Table: Date, amount, status, invoice download link.

Invoices: PDF preview or download.

5.7 Progress Tracking
Overall tab: circular progress, attendance %, assignment average.

Per‑course detail: Module completion list, quiz scores, time spent.

Leaderboard (Could‑Have gamification): ranking among batchmates (opt‑in).

5.8 Certificates
List of earned certificates: course name, date, download button, share button (LinkedIn etc.).

Preview modal.

5.9 Community
Forums: Browse threads, create new post, reply.

Group Chat: Real‑time messaging window (Could‑Have). Batch list, chat area, input.

5.10 Notifications
Bell icon dropdown: list of recent alerts. Click to view details.

Full Notification Center: page with filters (All, Assignments, Fees, Announcements) and mark as read.

5.11 AI Assistant (Could‑Have)
Chatbot widget (floating button or sidebar). Opens a chat panel.

Messages: user query, bot response (recommendations, explanations, action buttons like "Open Course").

Recommendations panel on dashboard: "Recommended for you" cards (lessons, practice).

6. Parent Portal Screens (Should‑Have / Could‑Have)
Sidebar: Dashboard, Ward Details, Fees, Messages, Reports.

6.1 Parent Dashboard
Ward Switcher (if multiple children).

Overview: Attendance %, upcoming classes, pending assignments, fee alerts.

Performance Alerts: e.g., "Low attendance in Math".

6.2 Ward Detail
Progress: same as student view but read‑only.

Attendance log, assignment grades.

6.3 Fee Payment
View fees for selected ward, pay button (Could‑Have: on behalf of ward).

6.4 Messages (Could‑Have)
Conversation list with faculty. Chat interface.

6.5 Report Cards
Download progress report PDF and certificates.

7. UI Flow (Brief)
Login → User lands on role‑appropriate Dashboard.

Admin flow: Dashboard → Creates Batch → Creates Course (assigns to batch) → Invites Faculty & Students → Sets fee structure & reminders → Views revenue & reports.

Faculty flow: Dashboard → Sees today’s classes → Starts meeting, marks attendance → Uploads assignment → Later grades submissions → Monitors student progress.

Student flow: Receives invite/pays fee → Logs in → Dashboard shows upcoming class & pending → Joins live class (or enters attendance code) → Watches course videos → Submits assignment → Pays installment when reminded → Completes course → Downloads certificate.

Parent flow: Logs in → Sees ward’s attendance & fee alert → Pays fee → Views report card.

All flows integrate community, notifications, and (optionally) AI assistance, accessible from the global sidebar.

